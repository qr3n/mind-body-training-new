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

export const DownloadTrainingMedia = (props: { training: ITraining }) => {
    const { data } = useVideos()
    const { training } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [allFilesDownloaded, setAllFilesDownloaded] = useState(false);
    const setTrainingAscetSeconds = useSetAtom(watchTrainingAscetSeconds)

    // Инициализация базы данных IndexedDB
    const initDB = async () => {
        return openDB("trainingMediaDB", 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("videos")) {
                    db.createObjectStore("videos", { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains("sounds")) {
                    db.createObjectStore("sounds", { keyPath: "id" });
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

            console.log(file)
            console.log(checksum)

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

        const { videos, audios } = extractMedia(training); // Передаем весь объект тренировки
        const indexedDBService = await IndexedDBService.initialize();

        try {
            // Скачивание видео с проверкой чексуммы
            for (const video of videos) {
                const alreadyExists = await isFileExists("videos", video.id, data?.find(v => v.id === video.id)?.checksum);
                if (!alreadyExists) {
                    const videoBlob = await downloadFile(`${API_URL}/content/stream/video/${video.id}?v=${Date.now().toString()}`);
                    await indexedDBService.save_video({ id: video.id, blob: videoBlob, checksum: data?.find(v => v.id === video.id)?.checksum });
                }
            }

            // Скачивание аудио без проверки чексуммы
            for (const audio of audios) {
                const alreadyExists = await isFileExists("sounds", audio.id);
                if (!alreadyExists) {
                    const audioBlob = await downloadFile(`${API_URL}/content/stream/audio/${audio.id}?v=${Date.now().toString()}`);
                    await indexedDBService.save_audio({ id: audio.id, blob: audioBlob });
                }
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

                for (const video of videos) {
                    const videoExists = await isFileExists("videos", video.id, data.find(v => v.id === video.id)?.checksum);
                    if (!videoExists) return false;
                }

                for (const audio of audios) {
                    const audioExists = await isFileExists("sounds", audio.id);
                    if (!audioExists) return false;
                }

                return true;
            };

            const checkFiles = async () => {
                const allDownloaded = await checkAllFilesDownloaded();
                setAllFilesDownloaded(allDownloaded);
            };

            checkFiles();
        }
    }, [training, data]);

    return (
        <div>
            <Link href={`/admin/training/edit/${training.id}`}>
                <Button
                    className='mr-3'
                    variant='outline'
                    size={'icon'}
                >
                    <Edit />
                </Button>
            </Link>
            {allFilesDownloaded ? (
                <Link href={`/trainings/${training.id}`}>
                    <Button onClick={() => setTrainingAscetSeconds(undefined)}>
                        Перейти к просмотру
                    </Button>
                </Link>
            ) : (
                <Button
                    onClick={handleDownloadMedia}
                    isLoading={isLoading}
                    disabled={isLoading}
                >
                    Скачать медиа
                </Button>
            )}
        </div>
    );
};
