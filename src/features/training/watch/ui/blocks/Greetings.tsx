import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/shared/shadcn/ui/button";
import { IoArrowBackOutline } from "react-icons/io5";
import { API_URL } from "@/shared/api/config";
import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import { WatchTrainingTemplate } from "@/features/training/watch/ui/templates";
import { useEffect } from "react";
import { useSetAtom } from "jotai/index";
import { resetAllBlockIndex } from "@/features/training/watch/model";

export const Greetings = (props: IWatchTrainingBlockProps) => {
    const resetAllBlockIndexes = useSetAtom(resetAllBlockIndex)

    useEffect(() => {
        resetAllBlockIndexes()

        return () => resetAllBlockIndexes()
    }, [])

    return (
        <div className='relative w-[100dvw] h-[100dvh] flex items-center justify-center flex-col bg-[#f6f7f8]'>
            <WatchTrainingTemplate.BlockSounds nextAfterComplete handleNext={props.onComplete} isPlaying block={props.block} />

            <motion.div
                initial={{height: 0}}
                animate={{height: '45%'}}
                exit={{height: 0}}
                transition={{delay: 0.1}}
                className='transform-gpu w-full max-w-[1024px] bg-blue-500 rounded-b-full md:rounded-b-[40dvh] top-0 left-1/2 -translate-x-1/2 absolute flex'
            >
                <div className='flex items-center h-max w-full px-[18px] pt-[18px] sm:px-[24px] sm:pt-[24px]'>
                    <motion.div
                        initial={{transform: 'translateX(-100vw)'}}
                        animate={{transform: 'translateX(0px)'}}
                        exit={{transform: 'translateX(-100vw)', transition: {delay: 0.2}}}
                        transition={{delay: 0.4}}
                    >
                        <Button
                            className='w-[40px] h-[40px] p-0 bg-white hover:bg-[#f9f9fa] border border-transparent hover:border-[#ccc]'
                        >
                            <IoArrowBackOutline className='text-[#333232] w-[22px] h-[22px]'/>
                        </Button>
                    </motion.div>

                </div>
            </motion.div>
            <motion.h1
                initial={{transform: 'translateX(-100vw)'}}
                animate={{transform: 'translateX(0px)'}}
                exit={{transform: 'translateX(-100vw)', transition: {delay: 0.2}}}
                transition={{delay: 0.3}}
                className='text-white absolute -ml-20 top-6 left-1/2 -translate-x-1/2 font-medium text-[18px] sm:text-xl'
            >
                {props.block.title}
            </motion.h1>
            <motion.div
                className='-mt-[14vh]'
                initial={{transform: 'translateY(100px) scale(0)',}}
                exit={{transform: 'translateY(100px) scale(0)',}}
                animate={{transform: 'translateY(0) scale(1)',}}
                transition={{delay: 0.2}}
            >
                <Image
                    draggable={false}
                    priority={true}
                    loading={'eager'}
                    src={`${API_URL}/content/library/image/${props.block.imageName}`}
                    className='object-contain max-w-[80vw] max-h-[65vh]'
                    width={400}
                    height={400}
                    alt='woman'
                />
            </motion.div>
            <div className='fixed w-full px-8 bottom-8'>
                <motion.div
                    className='w-full flex items-center justify-center gap-2'
                    initial={{transform: 'translateY(200px)'}}
                    animate={{transform: 'translateY(0px)'}}
                    exit={{transform: 'translateY(200px)', transition: {delay: 0.2}}}
                    transition={{delay: 0.2}}
                >
                    <h1 className='font-medium text-[#282738] text-center'>🔥 {props.block.description}</h1>
                </motion.div>
            </div>
        </div>
    )
}