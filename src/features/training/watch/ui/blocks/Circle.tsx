import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import { WatchTrainingTemplate } from "@/features/training/watch/ui/templates";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrentBlockStep }      from "@/features/training/watch/model/useCurrentBlockStep";
import { Phrase } from "./Phrase";
import { ITrainingAudio, ITrainingBlockWithContent } from "@/entities/training";
import { getTrainingLabel } from "@/shared/utils/getTrainingLabel";
import { useAtomValue } from "jotai";
import { watchTrainingLapsQty } from "@/features/training/watch/model";

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
    const circlesCountUser = useAtomValue(watchTrainingLapsQty)
    const circlesCount = props.block.content?.length || 0;
    const array: ITrainingAudio[] = Array.from({ length: 10 }, (_, i) => ({ type: 'audio', id: `${i + 1}-circle` }));

    const lastElement = props.block.content!.at(-1)!;
    const generateNewId = (parentId: string): string => {
        return Date.now().toString() + parentId;
    };

    const updateNestedIds = (content: ITrainingBlockWithContent[], parentId: string): ITrainingBlockWithContent[] => {
        return content.map(item => ({
            ...item,
            id: generateNewId(parentId),
            content: item.content ? updateNestedIds(item.content, generateNewId(parentId)) : []
        }));
    };

    const circles = circlesCountUser > circlesCount
        ? props.block.content!.concat(
            Array.from({ length: circlesCountUser - circlesCount }, () => {
                const newId = generateNewId(props.block.id || '');
                return {
                    ...lastElement,
                    id: newId,
                    content: lastElement.content ? updateNestedIds(lastElement.content, newId) : []
                };
            })
        )
        : props.block.content!.slice(0, circlesCountUser);

    // Рассчитываем количество упражнений для каждого круга
    const exercisesPerCircle = circles.map(circle =>
        circle.content!.filter(block => block.type === 'exercise').length
    );

    const { currentStep, handleNext, handlePrev } = useCurrentBlockStep({...props, block: { ...props.block, content: circles }}, true)

    const groupedBlocks = circles.map((circle, circleIndex) => {
        let exerciseCount = 0;
        const groups: Block[][] = [];

        groups.push([{
                type: 'secondLevelCircle',
                videos: [],
                audios: circle.audios,
                circleNumber: circleIndex
            }
        ])

        circle.content?.forEach((block, index, arr) => {
            if (block.type === "exercise") {
                exerciseCount++;
                if (arr[index - 1]?.type === "rest") {
                    groups.push([
                        { ...arr[index - 1], exerciseNumber: exerciseCount, circleNumber: circleIndex + 1 },
                        { ...block, exerciseNumber: exerciseCount, circleNumber: circleIndex + 1 }
                    ]);
                } else {
                    groups.push([{ ...block, exerciseNumber: exerciseCount, circleNumber: circleIndex + 1 }]);
                }
            } else if (block.type === "rest" && (index === arr.length - 1 || arr[index + 1]?.type !== "exercise")) {
                groups.push([{ ...block, circleNumber: circleIndex + 1 }]);
            }
        });

        return groups;
    }).flat();

    const blocks = [
        <WatchTrainingTemplate.BlockText handlePrev={handlePrev} handleNext={handleNext} key={0} text='Круговая тренировка'>
            <WatchTrainingTemplate.BlockSounds nextAfterComplete handleNext={handleNext} isPlaying block={props.block} />
            <div className='flex -mr-6 text-white items-center gap-8 justify-between'>
                <div className='text-center'>
                    <h1 className='font-semibold [font-size:_clamp(5px,7dvh,48px)]'>{circles?.length}</h1>
                    <h1 className='-mt-2 [font-size:_clamp(2px,3dvh,16px)]'>{getCircleLabel(circles?.length || 1)}</h1>
                </div>
                <div>
                    <h1 className='font-medium [font-size:_clamp(2px,3.5dvh,24px)]'>X</h1>
                </div>
                <div className='text-center'>
                    <h1 className='font-semibold [font-size:_clamp(5px,7dvh,48px)]'>{circles?.reduce((max, item) => Math.max(max, item.content?.filter(c => c.type === 'exercise').length || 0), 0)}</h1>
                    <h1 className='-mt-2 [font-size:_clamp(2px,3dvh,16px)]'>{getTrainingLabel(circles?.reduce((max, item) => Math.max(max, item.content?.filter(c => c.type === 'exercise').length || 0), 0) || 0)}</h1>
                </div>
            </div>
        </WatchTrainingTemplate.BlockText>,
        ...(groupedBlocks || []).map((group, index) =>
            {
                return group?.map((b: Block) =>
                    b.type === 'secondLevelCircle' ? (
                            <WatchTrainingTemplate.BlockText
                                handlePrev={handlePrev}
                                handleNext={handleNext}
                                key={`circle-${b.circleNumber}`}
                            >
                                <h1 className='text-white w-full font-medium [font-size:_clamp(5px,6dvh,48px)] -mt-12 max-w-[300px] text-center'>КРУГ {(b.circleNumber || 0) + 1}</h1>
                                <h1 className='text-white w-full [font-size:_clamp(5px,2.5dvh,20px)] mt-8 max-w-[300px] text-center'>НАЧАЛИ!</h1>
                                <WatchTrainingTemplate.BlockSounds nextAfterComplete handleNext={handleNext} isPlaying block={{ ...b, audios: [array[(b.circleNumber || 0)]]}} />
                            </WatchTrainingTemplate.BlockText>
                        ) :
                    b.type === 'phrase' ? (
                        <Phrase key={b.id || Date.now().toString()} prevStep={handlePrev} block={b} onComplete={handleNext} step={props.step} />
                    ) : (
                        <WatchTrainingTemplate.BlockVideos
                            videoMuted={!b.useVideoAudio}
                            restType={b.type === 'rest' ? (index < 2 ? 'first' : 'second') : undefined}
                            handlePrev={handlePrev}
                            renderExerciseNumber
                            handleNext={handleNext}
                            key={b.id || Date.now().toString()}
                            exerciseNumber={b.exerciseNumber}
                            exercisesCount={exercisesPerCircle[b.circleNumber! - 1]}
                            block={b}
                            type={b.type}
                            circleNumber={b.circleNumber}
                            circlesCount={circlesCountUser}
                        />
                    )
                )
            }
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
