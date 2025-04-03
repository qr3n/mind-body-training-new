'use client';

import { WatchTrainingBlocks } from "@/features/training/watch/ui/blocks";
import { FC, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { ITrainingBlockWithContent, ITrainingAudio, ITrainingVideo, ITraining,  } from "@/entities/training";
import { useAtom } from "jotai/index";
import {
    watchTrainingStep,
    watchTrainingVideosBlobs,
    watchTrainingAudiosBlobs,
    watchTrainingMusicVolume,
    watchTrainingSpeakerVolume,
    resetAllBlockIndex, watchTrainingRepsQty, setWatchTrainingVideosBlobsNew, watchedVideosAtom
} from "@/features/training/watch/model";
import { AnimatePresence } from "framer-motion";
import { IndexedDBService } from "@/shared/indexed-db";
import { BackgroundAudio } from "./BackgroundAudio";
import {  useSetAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { audioService, IAvailablePhrase } from "@/shared/api/services/audio";
import { useAudios } from "@/entities/audio";
import { API_URL } from "@/shared/api/config";
import { transformTrainingBlocks } from "./model/transformBlocks";
import {  usePathname } from "next/navigation";

const blockComponents: Record<any, FC<any>> = {
    warmup: WatchTrainingBlocks.Warmup,
    stretch: WatchTrainingBlocks.Stretch,
    split: WatchTrainingBlocks.Split,
    ascet: WatchTrainingBlocks.Ascet,
    circle: WatchTrainingBlocks.Circle,
    greeting: WatchTrainingBlocks.Greetings,
    testing: WatchTrainingBlocks.Testing,
    done: WatchTrainingBlocks.Done,
    phrase: WatchTrainingBlocks.Phrase,
    lapsQty: WatchTrainingBlocks.LapsQty,
    repsQty: WatchTrainingBlocks.RepsQty
};

interface IProps {
    blocks: ITrainingBlockWithContent[];
    trainingAudio: ITrainingAudio[];
    training: ITraining,
}

const extractVideosAndAudios = (blocks: ITrainingBlockWithContent[]):
    {
        videos: ITrainingVideo[],
        audios: ITrainingAudio[],
    } => {
    let videos: ITrainingVideo[] = [];
    let audios: ITrainingAudio[] = [];

    blocks.forEach(block => {
        if ('videos' in block) {
            videos = [...videos, ...block.videos];
        }
        if ('audios' in block) {
            audios = [...audios, ...block.audios];
        }
        if ('ending' in block) {
            audios = [...audios, ...block.ending!];
        }
        if ('repsQtyAudios' in block) {
            audios = [...audios, ...block.repsQtyAudios!];
        }
        if ('lapsQtyAudios' in block) {
            audios = [...audios, ...block.lapsQtyAudios!];
        }

        if ('content' in block) {
            const { videos: innerVideos, audios: innerAudios } = extractVideosAndAudios(block.content || []);
            videos = [...videos, ...innerVideos];
            audios = [...audios, ...innerAudios];
        }
    });

    return { videos, audios,  };
};

export const WatchTraining = (props: IProps) => {
    const resetAllBlockIndexes = useSetAtom(resetAllBlockIndex)
    const [contentLoaded, setContentLoaded] = useState(false);
    const [currentStep, setCurrentStep] = useAtom(watchTrainingStep);
    const [allVideosBlobs, setAllVideosBlobs] = useAtom(watchTrainingVideosBlobs);
    const [allAudiosBlobs, setAllAudiosBlobs] = useAtom(watchTrainingAudiosBlobs);
    const setMusicVolume = useSetAtom(watchTrainingMusicVolume)
    const setSpeakerVolume = useSetAtom(watchTrainingSpeakerVolume)
    const [watchedVideos, setWatchedVideos] = useAtom(watchedVideosAtom)
    const setVideoBlob = useSetAtom(setWatchTrainingVideosBlobsNew)
    const isMounted = useRef(true);
    const contentLoadedRef = useRef(false);

    const setRepsQty = useSetAtom(watchTrainingRepsQty)
    const { videos, audios } = useMemo(
        () => extractVideosAndAudios(props.blocks),
        [props.blocks]
    );

    const { data: phrases, isLoading: isPhrasesLoading } = useQuery<IAvailablePhrase[]>({
        queryFn: audioService.getPhrases,
        queryKey: ['phrases'],
        retryOnMount: false,
        refetchOnMount: false
    });

    const { data: allAudios } = useAudios();

    const blocks = transformTrainingBlocks(props.blocks, phrases, allAudios)

    const nextStep = useCallback(() => {
        setCurrentStep(prev => prev < (blocks.length - 1) ? prev + 1 : prev);
    }, [blocks.length, setCurrentStep]);

    const prevStep = () => {
        setCurrentStep(p => p > 0 ? p - 1 : p);
    }

    useEffect(() => {
        // Блокируем ориентацию в портретном режиме, если API доступен
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (screen.orientation && screen.orientation.lock) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            screen.orientation.lock('portrait').catch((error) => {
                console.error('Не удалось заблокировать ориентацию:', error);
            });
        }
    }, []);

    useEffect(() => {
        setCurrentStep(0)
        resetAllBlockIndexes()
        setWatchedVideos([])

        return () => {
            setTimeout(() => {
                isMounted.current = false;
                contentLoadedRef.current = false;
            }, 100);
        };
    }, [])

    useEffect(() => {
        blocks.forEach(b => {
            if (b.type === 'split') {
                setRepsQty(b.repsQtyCount || 3)
            }
        })
    }, [blocks])

    useEffect(() => {
        if (contentLoadedRef.current) return;

        const downloadFile = async (url: string) => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}`);
            }
            return response.blob();
        };

        const loadVideo = async (id: string, checksum?: string, isCompressed: boolean = false) => {
            const videoId = isCompressed ? `${id.replace('compressed_', '')}` : id.replace('compressed_', '');
            const videoBlob = await downloadFile(isCompressed ? `${API_URL}/content/stream/video/compressed/${videoId}?v=${Date.now().toString()}` : `${API_URL}/content/stream/video/${videoId}?v=${Date.now().toString()}`);
            const indexedDBService = await IndexedDBService.initialize();

            await indexedDBService.save_video({
                id: isCompressed ? `compressed_${id.replace('compressed_', '')}` : id.replace('compressed_', ''),
                blob: videoBlob,
                checksum,
                isCompressed
            });

            setVideoBlob({
                id: id.replace('compressed_', ''),
                value: URL.createObjectURL(videoBlob)
            });

            return videoBlob;
        }

        const loadAllContent = async () => {
            const array: ITrainingAudio[] = Array.from({ length: 10 }, (_, i) => ({ type: 'audio', id: `${i + 1}-circle` }));
            const array2: ITrainingAudio[] = Array.from({ length: 7 }, (_, i) => ({ type: 'audio', id: `ПОДХ${i + 1}` }));
            const array3: ITrainingAudio[] = Array.from({ length: 21 }, (_, i) => ({ type: 'audio', id: `СУ${i + 1}` }));
            const indexedDBService = await IndexedDBService.initialize();

            const newAudios = [
                ...audios,
                ...props.trainingAudio,
                ...array,
                ...array2,
                ...array3,
                {type: 'audio', id: 'listen-phrase'},
                {type: 'audio', id: 'one-more-time'},
                {type: 'audio', id: 'remember-this-phrase'},
            ]

            for (const video of videos) {
                if (video.id && !allVideosBlobs[video.id]) {
                    // First try to get the regular video
                    let videoBlob = await indexedDBService.get_video(video.id);

                    // If regular video doesn't exist, try to get the compressed version
                    if (!videoBlob) {
                        const compressedVideoId = `compressed_${video.id}`;
                        videoBlob = await indexedDBService.get_video(compressedVideoId);

                        if (videoBlob) {
                            // Add to list of compressed videos to load uncompressed versions later
                            // Use the compressed video for now
                            const objectUrl = URL.createObjectURL(videoBlob.blob);
                            setAllVideosBlobs(prevState => ({
                                ...prevState,
                                [video.id]: objectUrl,
                            }));

                            setVideoBlob({ id: video.id, value: objectUrl });

                            // Start downloading the regular version in the background
                            loadVideo(video.id, videoBlob.checksum, false);
                        } else {
                            // Neither regular nor compressed video found, download compressed first
                            console.warn(`Neither regular nor compressed video with ID ${video.id} found in IndexedDB. Downloading both.`);

                            try {
                                // Download compressed version first for faster initial load
                                const compressedBlob = await loadVideo(video.id, undefined, true);

                                // Use the compressed version immediately
                                const objectUrl = URL.createObjectURL(compressedBlob);
                                setAllVideosBlobs(prevState => ({
                                    ...prevState,
                                    [video.id]: objectUrl,
                                }));

                                setVideoBlob({ id: video.id, value: objectUrl });

                                // Then start downloading the regular version in the background
                                loadVideo(video.id, undefined, false);
                            } catch (error) {
                                console.error(`Failed to download compressed video with ID ${video.id}:`, error);
                            }
                        }
                    } else {
                        // It's a regular uncompressed video
                        const objectUrl = URL.createObjectURL(videoBlob.blob);
                        setAllVideosBlobs(prevState => ({
                            ...prevState,
                            [video.id]: objectUrl,
                        }));

                        setVideoBlob({ id: video.id, value: objectUrl });
                    }
                }
            }
            // Load audios
            for (const audio of newAudios) {
                if (audio.id && (!allAudiosBlobs[audio.id] || !allAudiosBlobs[audio.id].length)) {
                    const audioBlob = await indexedDBService.get_audio(audio.id);
                    if (audioBlob) {
                        const objectUrl = URL.createObjectURL(audioBlob.blob);

                        setAllAudiosBlobs(prevState => ({
                            ...prevState,
                            [audio.id]: objectUrl,
                        }));
                    } else {
                        console.warn(`Audio with ID ${audio.id} not found in IndexedDB.`);
                    }
                }
            }
        };

        loadAllContent().then(() => {
            setContentLoaded(true);
            contentLoadedRef.current = true;
        });
    }, [setAllVideosBlobs, setAllAudiosBlobs, videos, audios]);

    const Component = blockComponents[blocks[currentStep].type];

    useEffect(() => {
        setMusicVolume(props.training.music_volume <= 1 ? props.training.music_volume : 1)
        setSpeakerVolume(props.training.speaker_volume <= 1 ? props.training.speaker_volume : 1)
    }, [])

    useEffect(() => {
        setMusicVolume(props.training.music_volume <= 1 ? props.training.music_volume : 1)
        setSpeakerVolume(props.training.speaker_volume <= 1 ? props.training.speaker_volume : 1)
    }, [props.training.music_volume, props.training.speaker_volume])

    return (
        <div className='watch'>
            {/* Добавляем BackgroundAudio.tsx */}
            <BackgroundAudio loop={props.training.cycle} audios={props.trainingAudio} />

            <AnimatePresence mode='wait'>
                {contentLoaded && !isPhrasesLoading ?
                    <Component
                        key={`${blocks[currentStep].type}-${currentStep}`}
                        block={blocks[currentStep]}
                        step={currentStep}
                        onComplete={nextStep}
                        prevStep={prevStep}
                    />
                    : <div>Загрузка...</div>
                }
            </AnimatePresence>
        </div>
    );
};