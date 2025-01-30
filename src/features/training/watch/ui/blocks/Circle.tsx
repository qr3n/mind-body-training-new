import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import { WatchTrainingTemplate } from "@/features/training/watch/ui/templates";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrentBlockStep }      from "@/features/training/watch/model/useCurrentBlockStep";

export const Circle = (props: IWatchTrainingBlockProps) => {
    const { currentStep, handleNext, handlePrev } = useCurrentBlockStep(props)

    const blocks = [
        <WatchTrainingTemplate.BlockText handleNext={handleNext} key={0} text='Круговая тренировка'>
            <WatchTrainingTemplate.BlockSounds isPlaying block={props.block} />
            <div className='flex -mr-6 text-white items-center my-8 gap-8 justify-between'>
                <div className='text-center'>
                    <h1 className='font-semibold text-5xl'>{props.block.content?.length}</h1>
                    <h1>Круга</h1>
                </div>
                <div>
                    <h1 className='font-medium text-2xl'>X</h1>
                </div>
                <div className='text-center'>
                    <h1 className='font-semibold text-5xl'>{props.block.content?.reduce((max, item) => Math.max(max, item.content?.length || 0), 0)}</h1>
                    <h1>Упражнения</h1>
                </div>
            </div>
        </WatchTrainingTemplate.BlockText>,
        ...(((props.block.content || []).map((content, i) => (
            (content.content || [])?.map(b =>
                <WatchTrainingTemplate.BlockVideos restType={(b.type === 'rest') ? (i < 2 ? 'first' : 'second') : undefined} handlePrev={handlePrev} renderExerciseNumber handleNext={handleNext} key={i + 1} block={b} type={b.type} />
            ).flat()
        ))).flat())
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
