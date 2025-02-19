'use client';

import { WatchTrainingBlocks } from "@/features/training/watch/ui/blocks";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { ITrainingBlockWithContent, ITrainingAudio, ITrainingVideo, ITraining } from "@/entities/training";
import { useAtom } from "jotai/index";
import {
    watchTrainingStep,
    watchTrainingVideosBlobs,
    watchTrainingAudiosBlobs,
    watchTrainingMusicVolume,
    watchTrainingSpeakerVolume,
    watchTrainingPlaying,
    watchTrainingMusicPlaying,
    resetAllBlockIndex
} from "@/features/training/watch/model";
import { AnimatePresence } from "framer-motion";
import { IndexedDBService } from "@/shared/indexed-db";
import { BackgroundAudio } from "./BackgroundAudio";
import { useAtomValue, useSetAtom } from "jotai";

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

function transformTrainingBlocks(blocks: ITrainingBlockWithContent[]): ITrainingBlockWithContent[] {
    // Создаем копию исходного массива, чтобы не мутировать оригинал
    const original = [...blocks];

    // Извлекаем блок "greetings", если он есть
    const greetingsIndex = original.findIndex(b => b.type === 'greeting');
    let greetingsBlock: ITrainingBlockWithContent | undefined;
    if (greetingsIndex !== -1) {
        greetingsBlock = original.splice(greetingsIndex, 1)[0];
    }

    // Находим блоки "circle" и "split"
    const circleBlock = original.find(b => b.type === 'circle');
    const splitBlock = original.find(b => b.type === 'split');

    // if (circleBlock) {
    //     const lapsQtyAudios = circleBlock.lapsQtyAudios || [];
    //
    //     circleBlock.audios = [...(circleBlock.audios || []), ...lapsQtyAudios];
    //
    //     delete circleBlock.lapsQtyAudios;
    // }
    //
    // if (splitBlock) {
    //     const repsQtyAudios = splitBlock.repsQtyAudios || [];
    //     splitBlock.audios = [...(splitBlock.audios || []), ...repsQtyAudios];
    //
    //     delete splitBlock.repsQtyAudios; // Удаляем repsQtyAudios, так как они перенесены
    // }

    // Собираем результирующий массив
    const result: ITrainingBlockWithContent[] = [];

    // Добавляем "greetings" первым, если он существует
    if (greetingsBlock) {
        result.push(greetingsBlock);
    }

    // Добавляем "lapsQty" после "greetings", если есть "circle"
    if (circleBlock) {
        const lapsQtyBlock: ITrainingBlockWithContent = {
            type: 'lapsQty',
            videos: [],
            audios: [],
            circlesTimes: circleBlock.content?.map(c =>
                c?.content?.reduce((sum, d) => sum + (d.slideDuration ?? 0), 0) ?? 0
            )
        };
        result.push(lapsQtyBlock);
    }

    if (splitBlock) {
        const repsQtyBlock: ITrainingBlockWithContent = {
            type: 'repsQty',
            videos: [],
            audios: [],
        };
        result.push(repsQtyBlock);
    }

    // Добавляем все оставшиеся блоки из исходного массива (без greetings)
    result.push(...original);

    return result;
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
        // if ('repsQtyAudios' in block) {
        //     audios = [...audios, ...block.ending!];
        // }
        // if ('lapsQtyAudios' in block) {
        //     audios = [...audios, ...block.ending!];
        // }

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
    const isAudioPlaying = useAtomValue(watchTrainingPlaying)
    const isMusicPlaying = useAtomValue(watchTrainingMusicPlaying)
    const { videos, audios } = extractVideosAndAudios(props.blocks);
    const blocks = useMemo(() => transformTrainingBlocks(props.blocks), [])

    const nextStep = useCallback(() => {
        setCurrentStep(prev => prev < (blocks.length - 1) ? prev + 1 : prev);
    }, [blocks.length, setCurrentStep]);

    const prevStep = () => {
        setCurrentStep(p => p - 1);
    }

    useEffect(() => {
        console.log(currentStep)
    }, [currentStep])

    useEffect(() => {
        console.log('rerender')

        setCurrentStep(0)
        resetAllBlockIndexes()
        setAllVideosBlobs({})
        setAllAudiosBlobs({})
    }, [])

    useEffect(() => {
        const loadAllContent = async () => {

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
    }, [allVideosBlobs, allAudiosBlobs, setAllVideosBlobs, setAllAudiosBlobs, videos, audios]);

    const Component = blockComponents[blocks[currentStep].type];

    console.log(props.blocks)
    console.log(blocks)

    return (
        <div className='watch'>
            {/* Добавляем BackgroundAudio.tsx */}
            <BackgroundAudio loop={props.training.cycle} audios={props.trainingAudio}  isPlaying={isAudioPlaying && isMusicPlaying} />

            <AnimatePresence mode='wait'>
                {contentLoaded ?
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
