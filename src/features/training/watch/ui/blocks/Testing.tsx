'use client';

import { motion } from "framer-motion";
import { Button } from "@/shared/shadcn/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import { Checkbox } from "@/shared/shadcn/ui/checkbox";
import Image from "next/image";
import { testImg } from "@/features/training/watch/ui/assets";

export const Testing = (props: IWatchTrainingBlockProps) => {
    return (
        <div className='relative w-[100dvw] h-[100dvh] flex items-center justify-center'>
            <motion.div
                initial={{height: 0}}
                animate={{height: '50%'}}
                exit={{height: 0, transition: {delay: 0}}}
                transition={{delay: 0.1}}
                className='transform-gpu flex items-center justify-center w-full bg-blue-500 rounded-b-full top-0 left-0 absolute -z-50'
            >
                <motion.div
                    initial={{ transform: 'translateY(-100dvh)' }}
                    animate={{ transform: 'translateY(0)' }}
                    exit={{ transform: 'translateY(-100dvh)' }}
                    className='flex flex-col items-center justify-center -mt-12'>
                    <motion.h1
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        exit={{scale: 0, transition: {delay: 0.1}}}
                        className='text-white w-full font-medium text-4xl max-w-[200px] text-center leading-[45px]'>
                    </motion.h1>
                    <motion.div
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        exit={{scale: 0, transition: {delay: 0.1}}}
                    >
                    </motion.div>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{scale: 0}}
                animate={{scale: 1}}
                exit={{scale: 0, transition: {delay: 0.1}}}
                transition={{delay: 0.15}}
                className='
                    flex items-center justify-center w-max h-max -mt-52
                transform-gpu
                shadow-2xl
                bg-blue-500
                rounded-full
                border-[8px]
                border-white
                z-50
                p-2
                '
            >
                <div className='rounded-full border-blue-500 w-[270px] h-[270px] cursor-pointer flex items-center justify-center'>
                    <Image src={testImg} alt={'test'} width={'0'} height={'0'} className='max-h-[400px] max-w-[400px]'/>
                </div>
            </motion.div>
            <div className='fixed w-full flex items-center justify-center flex-col px-8 bottom-8'>
                <div className='w-full sm:w-auto'>
                    <h1 className='font-bold mb-4'>Какое позитивное утверждение прозвучало в тренировке?</h1>
                    <motion.div initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}}
                                className='space-y-4 h-full overflow-y-auto max-h-[calc(100dvh-680px)] mb-6'>
                        {props.block.questions?.map((q, i) => <div
                            key={i}
                            className="border items-center flex gap-3 select-none w-full p-4 bg-white rounded-xl shadow-sm"
                        >
                            <Checkbox
                            />
                            <p
                                className="text-gray-700 border-none outline-none w-full"
                            >
                                {q.question}
                            </p>
                        </div>)}
                    </motion.div>
                    <motion.div
                        className='w-full flex items-center justify-center gap-2'
                        initial={{transform: 'translateY(200px)'}}
                        animate={{transform: 'translateY(0px)'}}
                        exit={{transform: 'translateY(200px)', transition: {delay: 0.2}}}
                        transition={{delay: 0.2}}
                    >
                        <Button className='py-6'>
                            <IoArrowBack className='text-white'/>
                        </Button>
                        <Button className='w-full sm:w-[400px] py-6' onClick={props.onComplete}>
                            ПОДТВЕРДИТЬ
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}