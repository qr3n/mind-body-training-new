import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import { WatchTrainingTemplate } from "@/features/training/watch/ui/templates";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrentBlockStep }      from "@/features/training/watch/model/useCurrentBlockStep";
import { Phrase } from "@/features/training/watch/ui/blocks/Phrase";
import { ITrainingBlockWithContent } from "@/entities/training";
import { getTrainingLabel } from "@/shared/utils/getTrainingLabel";
import { useAtom } from "jotai/index";
import {
    watchTrainingAscetSeconds,
    watchTrainingMusicVolume,
    watchTrainingSpeakerVolume
} from "@/features/training/watch/model";
import { useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";
import { useVideos } from "@/entities/video";
import { API_URL } from "@/shared/api";
import Image from "next/image";

interface Block extends ITrainingBlockWithContent {
    exerciseNumber?: number;
    circleNumber?: number;
}

function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const result: string[] = [];

    if (h > 0) result.push(`${h} ч.`);
    if (m > 0 || h > 0) result.push(`${m} мин.`);
    if (s > 0 || result.length === 0) result.push(`${s} сек.`);

    return result.join(' ');
}


export const Ascet = (props: IWatchTrainingBlockProps) => {
    const { currentStep, handleNext, handlePrev } = useCurrentBlockStep(props)
    const watchSeconds = useAtomValue(watchTrainingAscetSeconds)
    const { data: videos } = useVideos()
    const exercise = props.block.content?.find(c => c.type === 'exercise')
    const exerciseVideo = videos?.find(v => v.id === props.block.content?.at(0)?.videos?.at(0)?.id)
    let exerciseCount = 0;

    const groupedBlocks = (props.block.content || []).reduce((acc: Block[][], block: Block, index: number, arr: Block[]) => {
        if (block.type === 'phrase') {
            acc.push([{ ...block }]);
            return acc;
        }

        if (block.type === 'rest' && arr[index + 1]?.type === 'exercise') {
            exerciseCount++;
            acc.push([
                { ...block, exerciseNumber: exerciseCount },
                { ...arr[index + 1], exerciseNumber: exerciseCount }
            ]);
        } else if (block.type === 'exercise' && (index === 0 || arr[index - 1]?.type !== 'rest')) {
            exerciseCount++;
            acc.push([{ ...block, exerciseNumber: exerciseCount }]);
        } else if (block.type === 'rest') {
            acc.push([{ ...block }]);
        }

        return acc;
    }, []);

    const exercisesCount = groupedBlocks.length - (props.block.content?.filter(c => c.type === 'phrase').length || 0);

    const dynamicBlocksData = useMemo(() => {
        return groupedBlocks.map((group) =>
            group.map((b: Block) => b)
        ).flat();
    }, [groupedBlocks]);

    useEffect(() => {
        let timerId: NodeJS.Timeout;

        if (currentStep > 0) {
            const blockIndex = currentStep - 1;
            const currentBlock = dynamicBlocksData[blockIndex];

            if (currentBlock?.type === 'exercise' && currentBlock.toTimePercent != null) {
                const duration = watchSeconds ?? currentBlock.slideDuration ?? 0;
                const timeoutDuration = (currentBlock.toTimePercent / 100) * duration;

                timerId = setTimeout(() => {
                    handleNext();
                }, timeoutDuration * 1000 + 500);
            }
        }

        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [currentStep, dynamicBlocksData, handleNext, watchSeconds]);

    const staticBlock = (
        <WatchTrainingTemplate.BlockText
            icon={<Image
                width={300}
                height={300}
                className='w-full aspect-square p-9 object-contain rounded-xl transition-all'
                src={`${API_URL}/content/library/video/image/${exerciseVideo?.id}?v=${Date.now()}`}
                alt={'video-preview'}
            />}
            handleNext={handleNext}
            handlePrev={handlePrev}
            key={0}
            text={`${exerciseVideo?.name}`}
        >
            <WatchTrainingTemplate.BlockSounds nextAfterComplete handleNext={handleNext} isPlaying block={props.block}/>
            <div className="flex text-white items-center my-8 gap-8 justify-between">
                <div className="text-center flex justify-center items-center gap-3">
                    <h1 className='text-2xl'>
                        {formatTime(watchSeconds || exercise?.slideDuration || 0)}
                    </h1>
                </div>
            </div>
        </WatchTrainingTemplate.BlockText>
    );

    const dynamicBlocks = groupedBlocks.map((group, i) =>
        group.map((b: Block) =>
            b.type === 'phrase' ? (
                <Phrase key={b.id || Date.now().toString()} prevStep={handlePrev} block={b} onComplete={handleNext} step={props.step} />
            ) : (
                <WatchTrainingTemplate.BlockVideos
                    isAscet
                    playDuration={
                    b.type === 'exercise' ? ((watchSeconds || b.slideDuration || 0) / 100 * (b.fromTimePercent ? 100 - b.fromTimePercent : 100)) : undefined
                }
                    videoMuted={!b.useVideoAudio}
                    restType={b.type === 'rest' ? (i < 2 ? 'first' : 'second') : undefined}
                    handlePrev={handlePrev}
                    handleNext={handleNext}
                    key={b.id || Date.now().toString()}
                    block={b}
                    type={b.type}
                />
            )
        )
    ).flat();

    const blocks = [staticBlock, ...(dynamicBlocks || [])];

    return (
        <motion.div
            initial={{opacity: 0, x: -100}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: 100}}
            transition={{duration: 0.1}}
        >
            <AnimatePresence mode="wait">
                {blocks[currentStep]}
            </AnimatePresence>
        </motion.div>
    );
};
