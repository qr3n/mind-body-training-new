import { motion } from "framer-motion";
import { Button } from "@/shared/shadcn/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { BiSolidDownArrow, BiSolidUpArrow } from "react-icons/bi";
import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import { useAtom } from "jotai/index";
import { watchTrainingLapsQty, watchTrainingRepsQty } from "@/features/training/watch/model";
import { getCirclesLabel, getRepeatsLabel } from "@/shared/utils/getTrainingLabel";
import { useEffect, useMemo } from "react"; // Добавляем useMemo

interface IProps extends IWatchTrainingBlockProps {
    variant: 'reps' | 'laps';
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} мин : ${remainingSeconds} сек`;
};

export const BlockQty = (props: IProps) => {
    const [count, setCount] = useAtom(props.variant === 'reps' ? watchTrainingRepsQty : watchTrainingLapsQty);
    const circlesTimes = props.block.circlesTimes || [];

    useEffect(() => {
        setCount(props.block.circlesTimes?.length || 1)
    }, []);

    // Вычисляем totalDuration с использованием useMemo
    const totalDuration = useMemo(() => {
        const duration = circlesTimes.reduce((a, b) => a + b, 0);
        if (count > circlesTimes.length) {
            const lastElement = circlesTimes[circlesTimes.length - 1] || 0;
            const difference = count - circlesTimes.length;
            const additionalDuration = difference * lastElement;
            return duration + additionalDuration;
        }
        return duration;
    }, [count, circlesTimes]);

    return (
        <div className='relative w-[100dvw] h-[100dvh] flex items-center justify-center'>
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: '50%' }}
                exit={{ height: 0, transition: { delay: 0 } }}
                transition={{ delay: 0.1 }}
                className='transform-gpu flex items-center justify-center w-full max-w-[1024px] bg-blue-500 rounded-b-[40dvh] top-0 left-1/2 -translate-x-1/2 absolute'
            >
                <motion.div
                    initial={{ transform: 'translateY(-100dvh)' }}
                    animate={{ transform: 'translateY(0)' }}
                    exit={{ transform: 'translateY(-100dvh)' }}
                    className='flex flex-col items-center justify-center'>
                    <motion.h1
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0, transition: { delay: 0.1 } }}
                        className='text-white w-full font-medium [font-size:_clamp(5px,3.3dvh,30px)] -mt-12 max-w-[clamp(100px,40dvh,400px)] text-center'>
                        Сколько {props.variant === 'laps' ? 'кругов будет в тренировке?' : 'подходов будет основных упражнениях?'}
                    </motion.h1>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0, transition: { delay: 0.1 } }}
                        className='flex items-center mt-[clamp(6px,5dvh,32px)] gap-3 justify-center'
                    >
                        <div className='px-3 py-1 rounded-lg bg-white flex gap-1 items-center justify-center'>
                            <h1 className='font-semibold flex gap-2 [font-size:_clamp(5px,3.3dvh,30px)]'>{count}
                                <span className='text-zinc-300 font-light'>|</span></h1>
                            <span className='mt-1 text-zinc-400 font-medium [font-size:_clamp(5px,1.8dvh,24px)]'>{props.variant === 'reps' ? getRepeatsLabel(count) : getCirclesLabel(count)}</span>
                        </div>

                        <div className='text-white'>
                            <BiSolidUpArrow onClick={() => setCount(prev => prev + 1)} className='cursor-pointer w-[clamp(5px,3.3dvh,32px)] h-[clamp(5px,3.3dvh,32px)]' />
                            <BiSolidDownArrow onClick={() => setCount(prev => prev - 1)} className='cursor-pointer w-[clamp(5px,3.3dvh,32px)] h-[clamp(5px,3.3dvh,32px)]' />
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, transition: { delay: 0.1 } }}
                transition={{ delay: 0.15 }}
                className='
                    flex items-center justify-center relative w-max h-max
                transform-gpu
                shadow-2xl
                bg-[#f2f6fe]
                rounded-full
                border
                z-50
                p-1
                '
            >
                <div
                    className='rounded-full relative flex-col bg-blue-500 w-[270px] h-[270px] max-w-[25vh] max-h-[25vh] cursor-pointer flex items-center justify-center'>
                    <h1 className='text-white w-full font-medium [font-size:_clamp(5px,2dvh,24px)]   text-center'>
                        Длительность <br />тренировки:
                    </h1>
                    <div
                        className='rounded-lg px-[clamp(5px,1.5dvh,24px)] py-[clamp(5px,1dvh,24px)] mt-4 [font-size:_clamp(5px,2dvh,24px)] font-medium bg-white'>
                        {formatTime(totalDuration)} {/* Используем totalDuration */}
                    </div>
                </div>
            </motion.div>
            <div className='fixed w-full px-8 bottom-8'>
                <motion.div
                    className='w-full flex items-center justify-center gap-2'
                    initial={{ transform: 'translateY(200px)' }}
                    animate={{ transform: 'translateY(0px)' }}
                    exit={{ transform: 'translateY(200px)', transition: { delay: 0.2 } }}
                    transition={{ delay: 0.2 }}
                >
                    <Button className='py-6' onClick={props.prevStep}>
                        <IoArrowBack className='text-white' />
                    </Button>
                    <Button className='w-full sm:w-[400px] py-6' onClick={props.onComplete}>
                        ДАЛЕЕ
                    </Button>
                </motion.div>
            </div>
        </div>
    );
};