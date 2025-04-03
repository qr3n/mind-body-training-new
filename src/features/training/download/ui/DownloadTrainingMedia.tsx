'use client';

import { openDB }                                                    from "idb";
import { Button }                                                    from "@/shared/shadcn/ui/button";
import { useState, useEffect }                                       from "react";
import toast                                                         from "react-hot-toast";
import Link                                                          from "next/link";
import { API_URL }                                                   from "@/shared/api/config";
import { IndexedDBService } from "@/shared/indexed-db";
import { ITraining, ITrainingAudio, ITrainingBlockWithContent, ITrainingVideo } from "@/entities/training";
import { Edit }                                                      from "lucide-react";
import { useVideos } from "@/entities/video";
import { useSetAtom } from "jotai/index";
import { watchTrainingAscetSeconds } from "@/features/training/watch/model";
import { useQuery } from "@tanstack/react-query";
import { audioService, IAvailablePhrase } from "@/shared/api/services/audio";

export const DownloadTrainingMedia = (props: { training: ITraining, inAscet?: boolean }) => {
    const { data } = useVideos()
    const { training } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [allFilesDownloaded, setAllFilesDownloaded] = useState(false);
    const setTrainingAscetSeconds = useSetAtom(watchTrainingAscetSeconds)
    const { data: phrases, isLoading: isPhrasesLoading } = useQuery<IAvailablePhrase[]>({
        queryFn: audioService.getPhrases,
        queryKey: ['phrases'],
        retryOnMount: false,
        refetchOnMount: false
    });

    const initDB = async () => {
        return openDB("trainingMediaDB", 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("videos")) {
                    db.createObjectStore("videos", { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains("sounds")) {
                    db.createObjectStore("sounds", { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains("images")) {
                    db.createObjectStore("images", { keyPath: "id" });
                }
            },
        });
    };

    const isFileExists = async (storeName: string, id: string, checksum?: string): Promise<boolean> => {
        const db = await initDB();
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);

        try {
            const file = await store.get(id);
            await tx.done;
            return !!(file && (checksum ? file.checksum === checksum : true));
        } catch {
            return false;
        }
    };

    const downloadFile = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}`);
        }
        return response.blob();
    };

    // Извлечение всех медиафайлов из блоков тренировки
    const extractMedia = (training: ITraining): { videos: ITrainingVideo[], audios: ITrainingAudio[] } => {
        let videos: ITrainingVideo[] = [];
        let audios: ITrainingAudio[] = [...training.audio];
        training.blocks.forEach(block => {
            if ('videos' in block) {
                videos = [...videos, ...block.videos];
            }
            if ('audios' in block) {
                audios = [...audios, ...block.audios];
            }
            if ('ending' in block) {
                audios = [...audios, ...(block.ending || [])];
            }
            if ('lapsQtyAudios' in block) {
                audios = [...audios, ...(block.lapsQtyAudios || [])]
            }
            if ('repsQtyAudios' in block) {
                audios = [...audios, ...(block.repsQtyAudios || [])]
            }
            if ('content' in block) {
                const { videos: innerVideos, audios: innerAudios } = extractMedia({ ...training, blocks: block.content || [] });
                videos = [...videos, ...innerVideos];
                audios = [...audios, ...innerAudios];
            }
        });

        return { videos, audios };
    };

    const handleDownloadMedia = async () => {
        setIsLoading(true);
        const { videos, audios } = extractMedia(training);
        const indexedDBService = await IndexedDBService.initialize();

        try {
            const regularVideoExists = await isFileExists("videos", videos[0].id, data?.find(v => v.id === videos[0].id)?.checksum);

            if (!regularVideoExists) {
                const videoBlob = await downloadFile(`${API_URL}/content/stream/video/${videos[0].id}?v=${Date.now().toString()}`);
                await indexedDBService.save_video({
                    id: videos[0].id,
                    blob: videoBlob,
                    checksum: data?.find(v => v.id === videos[0].id)?.checksum,
                    isCompressed: false
                });
            }

            for (const video of videos.slice(1, 2)) {
                const compressedVideoId = `compressed_${video.id}`;
                const regularVideoExists = await isFileExists("videos", video.id, data?.find(v => v.id === video.id)?.checksum);
                const compressedVideoExists = await isFileExists("videos", compressedVideoId, data?.find(v => v.id === video.id)?.checksum);

                // Если нет ни обычной, ни сжатой версии, скачиваем сжатую
                if (!regularVideoExists && !compressedVideoExists) {
                    const videoBlob = await downloadFile(`${API_URL}/content/stream/video/compressed/${video.id}?v=${Date.now().toString()}`);
                    await indexedDBService.save_video({
                        id: compressedVideoId,
                        blob: videoBlob,
                        checksum: data?.find(v => v.id === video.id)?.checksum,
                        isCompressed: true
                    });
                }
            }

            // Для аудио
            console.log("Starting download of training audios:", audios.map(a => a.id));

            for (const audio of audios) {
                const alreadyExists = await isFileExists("sounds", audio.id, audio.checksum);
                if (!alreadyExists) {
                    const audioBlob = await downloadFile(`${API_URL}/content/stream/audio/${audio.id}?v=${Date.now().toString()}`);
                    await indexedDBService.save_audio({
                        id: audio.id,
                        blob: audioBlob,
                        checksum: audio.checksum
                    });
                }
            }

            console.log("Starting download of numbered audios (1-10)");

            for (let i = 1; i <= 10; i++) {
                const audioId = `${i}-circle`;
                const alreadyExists = await isFileExists("sounds", audioId);
                if (!alreadyExists) {
                    const audioBlob = await downloadFile(`/audios/${i}йкр.mp3`);
                    await indexedDBService.save_audio({ id: audioId, blob: audioBlob });
                }
            }
            console.log("Starting download of phrase audios:", phrases?.map(p => p.audio_id).filter(Boolean));

            if (phrases) {
                for (const phrase of phrases) {
                    const audioId = phrase.audio_id;

                    if (audioId) {
                        const alreadyExists = await isFileExists("sounds", audioId);
                        if (!alreadyExists) {
                            const audioBlob = await downloadFile(`${API_URL}/content/stream/audio/${audioId}?v=${Date.now().toString()}`);
                            await indexedDBService.save_audio({ id: audioId, blob: audioBlob });
                        }
                    }
                }
            }
            console.log("Starting download of СУ audios (1-21)");

            for (let i = 1; i <= 21; i++) {
                const audioId = `СУ${i}`;
                const alreadyExists = await isFileExists("sounds", audioId);
                if (!alreadyExists) {
                    const audioBlob = await downloadFile(`/audios/СУ${i}.mp3`);
                    await indexedDBService.save_audio({ id: audioId, blob: audioBlob });
                }
            }

            for (let i = 1; i <= 7; i++) {
                const audioId = `ПОДХ${i}`;
                const alreadyExists = await isFileExists("sounds", audioId);
                if (!alreadyExists) {
                    const audioBlob = await downloadFile(`/audios/ПОДХ${i}.mp3`);
                    await indexedDBService.save_audio({ id: audioId, blob: audioBlob });
                }
            }

            const alreadyExists1 = await isFileExists("sounds", "listen-phrase");
            const alreadyExists2 = await isFileExists("sounds", "one-more-time");
            const alreadyExists3 = await isFileExists("sounds", "remember-this-phrase");

            if (!alreadyExists1) {
                const audioBlob = await downloadFile(`/audios/listen-phrase.mp3`);
                await indexedDBService.save_audio({ id: "listen-phrase", blob: audioBlob });
            }

            if (!alreadyExists2) {
                const audioBlob = await downloadFile(`/audios/one-more-time.mp3`);
                await indexedDBService.save_audio({ id: "one-more-time", blob: audioBlob });
            }

            if (!alreadyExists3) {
                const audioBlob = await downloadFile(`/audios/remember-this-phrase.mp3`);
                await indexedDBService.save_audio({ id: "remember-this-phrase", blob: audioBlob });
            }

            // Проверяем наличие изображения cup.png
            const cupImageExists = await isFileExists("images", "cup");
            if (!cupImageExists) {
                const imageBlob = await downloadFile(`/cup.png`);
                // Добавляем метод save_image в IndexedDBService или используем напрямую
                const db = await initDB();
                const tx = db.transaction("images", "readwrite");
                const store = tx.objectStore("images");
                await store.put({ id: "cup", blob: imageBlob });
                await tx.done;
            }

            toast.success("Загрузка завершена.");
            setAllFilesDownloaded(true);
        } catch (error) {
            console.error("Ошибка при загрузке медиа:", error);
            toast.error("Что-то пошло не так...");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (data) {
            const checkAllFilesDownloaded = async () => {
                const { videos, audios } = extractMedia(training);

                // Проверка видео - проверяем наличие либо обычной, либо сжатой версии
                for (const video of videos.slice(0, 2)) {
                    const compressedVideoId = `compressed_${video.id}`;
                    const regularVideoExists = await isFileExists("videos", video.id, data.find(v => v.id === video.id)?.checksum);
                    const compressedVideoExists = await isFileExists("videos", compressedVideoId);

                    // Если нет ни того, ни другого - файлы не загружены
                    if (!regularVideoExists && !compressedVideoExists) return false;
                }

                // Проверка аудио с учетом checksum
                for (const audio of audios) {
                    const audioExists = await isFileExists("sounds", audio.id, audio.checksum);
                    if (!audioExists) return false;
                }

                for (let i = 1; i <= 10; i++) {
                    const audioId = `${i}-circle`;
                    const audioExists = await isFileExists("sounds", audioId);

                    if (!audioExists) return false;
                }

                for (let i = 1; i <= 7; i++) {
                    const audioId = `ПОДХ${i}`;
                    const audioExists = await isFileExists("sounds", audioId);

                    if (!audioExists) return false;
                }

                for (let i = 1; i <= 21; i++) {
                    const audioId = `СУ${i}`;
                    const audioExists = await isFileExists("sounds", audioId);

                    if (!audioExists) return false;
                }

                if (phrases) {
                    for (const phrase of phrases) {
                        if (phrase.audio_id) {
                            const audioExists = await isFileExists("sounds", phrase.audio_id);
                            if (!audioExists) return false;
                        }
                    }
                }

                const alreadyExists1 = await isFileExists("sounds", "listen-phrase");
                const alreadyExists2 = await isFileExists("sounds", "one-more-time");
                const alreadyExists3 = await isFileExists("sounds", "remember-this-phrase");
                const cupImageExists = await isFileExists("images", "cup");

                return !(!alreadyExists1 || !alreadyExists2 || !alreadyExists3 || !cupImageExists);
            };

            const checkFiles = async () => {
                const allDownloaded = await checkAllFilesDownloaded();
                setAllFilesDownloaded(allDownloaded);
            };

            checkFiles();
        }
    }, [training, data, phrases]);

    return (
        <div>
            {!props.inAscet && (
                <Link href={`/admin/training/edit/${training.id}`}>
                    <Button
                        className='mr-3'
                        variant='outline'
                        size={'icon'}
                    >
                        <Edit />
                    </Button>
                </Link>
            )}
            {allFilesDownloaded ? (
                <Link href={`/trainings/${training.id}`}>
                    <Button className={`${props.inAscet ? 'w-full' : 'w-max'}`} disabled={isLoading || isPhrasesLoading} onClick={() => setTrainingAscetSeconds(undefined)}>
                        Перейти к просмотру
                    </Button>
                </Link>
            ) : (
                <Button
                    className={`${props.inAscet ? 'w-full' : 'w-max'}`}
                    onClick={handleDownloadMedia}
                    isLoading={isLoading || isPhrasesLoading}
                    disabled={isLoading || isPhrasesLoading}
                >
                    Скачать медиа
                </Button>
            )}
        </div>
    );
};