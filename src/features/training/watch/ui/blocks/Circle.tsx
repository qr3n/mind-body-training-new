import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import { WatchTrainingTemplate } from "@/features/training/watch/ui/templates";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrentBlockStep }      from "@/features/training/watch/model/useCurrentBlockStep";
import { Phrase } from "./Phrase";
import { ITrainingBlockWithContent } from "@/entities/training";
import { getTrainingLabel } from "@/shared/utils/getTrainingLabel";

interface Block extends ITrainingBlockWithContent{
    exerciseNumber?: number;
    circleNumber?: number;
}

const getCircleLabel = (num: number) => {
    if (num % 10 === 1 && num % 100 !== 11) return "Круг";
    if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return "Круга";
    return "Кругов";
  };



export const Circle = (props: IWatchTrainingBlockProps) => {

    const { currentStep, handleNext, handlePrev } = useCurrentBlockStep(props, true)

    const groupedBlocks = props.block.content?.map((circle, circleIndex) => {
        let exerciseCount = 0;
        const groups: Block[][] = [];
    
        circle.content?.forEach((block, index, arr) => {
            if (block.type === "exercise") {
                exerciseCount++;
                // Проверяем, есть ли перед этим `rest`
                if (arr[index - 1]?.type === "rest") {
                    groups.push([
                        { ...arr[index - 1], exerciseNumber: exerciseCount, circleNumber: circleIndex + 1 },
                        { ...block, exerciseNumber: exerciseCount, circleNumber: circleIndex + 1 }
                    ]);
                } else {
                    groups.push([{ ...block, exerciseNumber: exerciseCount, circleNumber: circleIndex + 1 }]);
                }
            } else if (block.type === "rest" && (index === arr.length - 1 || arr[index + 1]?.type !== "exercise")) {
                // Если rest не перед упражнением, добавляем его отдельно
                groups.push([{ ...block, circleNumber: circleIndex + 1 }]);
            }
        });
    
        return groups;
    }).flat();    
    
    const circlesCount = props.block.content?.length || 0;

    console.log(groupedBlocks)
    console.log(props.block.content)
    const blocks = [
        <WatchTrainingTemplate.BlockText handlePrev={handlePrev} handleNext={handleNext} key={0} text='Круговая тренировка'>
            <WatchTrainingTemplate.BlockSounds isPlaying block={props.block} />
            <div className='flex -mr-6 text-white items-center gap-8 justify-between'>
                <div className='text-center'>
                    <h1 className='font-semibold [font-size:_clamp(5px,7dvh,48px)]'>{props.block.content?.length}</h1>
                    <h1 className='-mt-2 [font-size:_clamp(2px,3dvh,16px)]'>{getCircleLabel(props.block.content?.length || 1)}</h1>
                </div>
                <div>
                    <h1 className='font-medium [font-size:_clamp(2px,3.5dvh,24px)]'>X</h1>
                </div>
                <div className='text-center'>
                    <h1 className='font-semibold [font-size:_clamp(5px,7dvh,48px)]'>{props.block.content?.reduce((max, item) => Math.max(max, item.content?.filter(c => c.type === 'exercise').length || 0), 0)}</h1>
                    <h1 className='-mt-2 [font-size:_clamp(2px,3dvh,16px)]'>{getTrainingLabel(props.block.content?.reduce((max, item) => Math.max(max, item.content?.filter(c => c.type === 'exercise').length || 0), 0) || 0)}</h1>
                </div>
            </div>
        </WatchTrainingTemplate.BlockText>,
        ...(groupedBlocks || []).map((group, index) =>
            group?.map((b: Block) =>
                b.type === 'phrase' ? (
                    <Phrase key={b.id || Date.now().toString()} prevStep={handlePrev} block={b} onComplete={handleNext} step={props.step} />
                ) : (
                    <WatchTrainingTemplate.BlockVideos
                        restType={b.type === 'rest' ? (index < 2 ? 'first' : 'second') : undefined}
                        handlePrev={handlePrev}
                        renderExerciseNumber
                        handleNext={handleNext}
                        key={b.id || Date.now().toString()}
                        exerciseNumber={b.exerciseNumber}
                        exercisesCount={(groupedBlocks || []).length}
                        block={b}
                        type={b.type}
                        circleNumber={b.circleNumber}
                        circlesCount={circlesCount}
                    />
                )
            )
        ).flat()
    ]

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
