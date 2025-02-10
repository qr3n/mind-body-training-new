'use client';

import { WatchTrainingBlocks } from "@/features/training/watch/ui/blocks";
import { FC, useCallback, useEffect, useState } from "react";
import { ITrainingBlockWithContent, ITrainingAudio, ITrainingVideo, ITraining } from "@/entities/training";
import { useAtom } from "jotai/index";
import {
    watchTrainingStep,
    watchTrainingVideosBlobs,
    watchTrainingAudiosBlobs,
    watchTrainingMusicVolume, watchTrainingSpeakerVolume, watchTrainingPlaying, watchTrainingMusicPlaying
} from "@/features/training/watch/model";
import { AnimatePresence } from "framer-motion";
import { IndexedDBService } from "@/shared/indexed-db";
import { BackgroundAudio } from "./BackgroundAudio";
import { useAtomValue, useSetAtom } from "jotai"; // Импортируем новый компонент

const blockComponents: Record<any, FC<any>> = {
    warmup: WatchTrainingBlocks.Warmup,
    stretch: WatchTrainingBlocks.Stretch,
    split: WatchTrainingBlocks.Split,
    ascet: WatchTrainingBlocks.Ascet,
    circle: WatchTrainingBlocks.Circle,
    greeting: WatchTrainingBlocks.Greetings,
    testing: WatchTrainingBlocks.Testing,
    done: WatchTrainingBlocks.Done,
    phrase: WatchTrainingBlocks.Phrase
};

interface IProps {
    blocks: ITrainingBlockWithContent[];
    trainingAudio: ITrainingAudio[];
    training: ITraining,
}

const extractVideosAndAudios = (blocks: ITrainingBlockWithContent[]): { videos: ITrainingVideo[], audios: ITrainingAudio[] } => {
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
        if ('content' in block) {
            const { videos: innerVideos, audios: innerAudios } = extractVideosAndAudios(block.content || []);
            videos = [...videos, ...innerVideos];
            audios = [...audios, ...innerAudios];
        }
    });

    return { videos, audios };
};

export const WatchTraining = (props: IProps) => {
    const [contentLoaded, setContentLoaded] = useState(false);
    const [currentStep, setCurrentStep] = useAtom(watchTrainingStep);
    const [allVideosBlobs, setAllVideosBlobs] = useAtom(watchTrainingVideosBlobs);
    const [allAudiosBlobs, setAllAudiosBlobs] = useAtom(watchTrainingAudiosBlobs);
    const setMusicVolume = useSetAtom(watchTrainingMusicVolume)
    const setSpeakerVolume = useSetAtom(watchTrainingSpeakerVolume)
    const isAudioPlaying = useAtomValue(watchTrainingPlaying)
    const isMusicPlaying = useAtomValue(watchTrainingMusicPlaying)

    const nextStep = useCallback(() => {
        setCurrentStep(prev => prev < (props.blocks.length - 1) ? prev + 1 : prev);
    }, [props.blocks.length, setCurrentStep]);

    const prevStep = () => {
        setCurrentStep(p => p - 1);
    }

    useEffect(() => {
        setCurrentStep(0)

        const loadAllContent = async () => {
            const { videos, audios } = extractVideosAndAudios(props.blocks);
            const indexedDBService = await IndexedDBService.initialize();

            const newAudios = [...audios, ...props.trainingAudio]

            // Load videos
            for (const video of videos) {
                if (video.id && !allVideosBlobs[video.id]) {
                    const videoBlob = await indexedDBService.get_video(video.id);
                    if (videoBlob) {
                        const objectUrl = URL.createObjectURL(videoBlob.blob);

                        setAllVideosBlobs(prevState => ({
                            ...prevState,
                            [video.id]: objectUrl,
                        }));
                    } else {
                        console.warn(`Video with ID ${video.id} not found in IndexedDB.`);
                    }
                }
            }

            // Load audios
            for (const audio of newAudios) {
                if (audio.id && !allAudiosBlobs[audio.id]) {
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

        setMusicVolume(props.training.music_volume <= 1 ? props.training.music_volume : 1)
        setSpeakerVolume(props.training.speaker_volume <= 1 ? props.training.speaker_volume : 1)

        loadAllContent().then(() => {
            setContentLoaded(true);
        }).catch(e => console.log(e));
    }, [allVideosBlobs, allAudiosBlobs, props.blocks, setAllVideosBlobs, setAllAudiosBlobs]);

    const Component = blockComponents[props.blocks[currentStep].type];

    return (
        <div className='watch'>
            {/* Добавляем BackgroundAudio.tsx */}
            <BackgroundAudio loop={props.training.cycle} audios={props.trainingAudio}  isPlaying={isAudioPlaying && isMusicPlaying} />

            <AnimatePresence mode='wait'>
                {contentLoaded ?
                    <Component
                        key={`${props.blocks[currentStep].type}-${currentStep}`}
                        block={props.blocks[currentStep]}
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