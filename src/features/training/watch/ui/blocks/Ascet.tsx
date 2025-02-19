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

interface Block extends ITrainingBlockWithContent {
    exerciseNumber?: number;
    circleNumber?: number;
}

export const Ascet = (props: IWatchTrainingBlockProps) => {
    const { currentStep, handleNext, handlePrev } = useCurrentBlockStep(props)
    const watchSeconds = useAtomValue(watchTrainingAscetSeconds)

    let exerciseCount = 0;

    const groupedBlocks = (props.block.content || []).reduce((acc: Block[][], block: Block, index: number, arr: Block[]) => {
        if (block.type === 'phrase') {
            acc.push([{ ...block }]); // Добавляем фразу как отдельную группу
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
            acc.push([{ ...block }]); // Добавляем отдельно стоящий отдых
        }

        return acc;
    }, []);

    const exercisesCount = groupedBlocks.length - (props.block.content?.filter(c => c.type === 'phrase').length || 0);

    const staticBlock = (
        <WatchTrainingTemplate.BlockText
            icon={<svg className='max-w-[30vh] max-h-[30vh]' xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink" width="180"
                       height="180" viewBox="0 0 256 256" fill="none">
                <rect width="256" height="256" fill="url(#pattern0_11_3)"/>
                <defs>
                    <pattern id="pattern0_11_3" patternContentUnits="objectBoundingBox" width="1" height="1">
                        <use xlinkHref="#image0_11_3" transform="scale(0.00390625)"/>
                    </pattern>
                    <image id="image0_11_3" width="256" height="256"
                           xlinkHref="data:image/png;base64,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"/>
                </defs>
            </svg>}
            handleNext={handleNext}
            handlePrev={handlePrev}
            key={0}
            text="Аскеза!"
        >
            <WatchTrainingTemplate.BlockSounds nextAfterComplete handleNext={handleNext} isPlaying block={props.block}/>
            <div className="flex text-white items-center my-8 gap-8 justify-between">
                <div className="text-center flex justify-center items-center gap-3">
                    <h1 className="font-semibold text-5xl">
                        {props.block?.content?.filter((item) => item.type === "rest").length}
                    </h1>
                    <h1 className="font-medium text-[#eee]">{getTrainingLabel(props.block?.content?.filter((item) => item.type === "rest").length || 0)}</h1>
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
                    playDuration={b.type === 'exercise' ? watchSeconds : undefined}
                    videoMuted={!b.useVideoAudio}
                    restType={b.type === 'rest' ? (i < 2 ? 'first' : 'second') : undefined}
                    handlePrev={handlePrev}
                    renderExerciseNumber
                    handleNext={handleNext}
                    key={b.id || Date.now().toString()}
                    exerciseNumber={b.exerciseNumber}
                    exercisesCount={exercisesCount}
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
