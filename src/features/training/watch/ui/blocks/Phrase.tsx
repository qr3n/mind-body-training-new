'use client';

import { motion } from "framer-motion";
import { Button } from "@/shared/shadcn/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import Image from "next/image";
import { speakerImg } from "@/features/training/watch/ui/assets";
import { WatchTrainingTemplate } from "@/features/training/watch/ui/templates";
import { watchTrainingMusicPlaying,  } from "@/features/training/watch/model";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";


export const Phrase = (props: IWatchTrainingBlockProps) => {
    const setIsMusicPlaying = useSetAtom(watchTrainingMusicPlaying)

    useEffect(() => {
        setIsMusicPlaying(false)
    }, []);

    return (
        <div className='relative w-[100dvw] h-[100dvh] flex items-center justify-center'>
            <WatchTrainingTemplate.BlockSounds  isPlaying block={props.block}/>
            <motion.div
                initial={{height: 0}}
                animate={{height: '50%'}}
                exit={{height: 0, transition: {delay: 0}}}
                transition={{delay: 0.1}}
                className='transform-gpu flex items-center justify-center w-full bg-blue-500 rounded-b-full top-0 left-0 absolute -z-50'
            >
                <motion.div
                    initial={{transform: 'translateY(-100dvh)'}}
                    animate={{transform: 'translateY(0)'}}
                    exit={{transform: 'translateY(-100dvh)'}}
                    className='flex flex-col items-center justify-center -mt-[12dvh]'>
                    <motion.h1
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        exit={{scale: 0, transition: {delay: 0.1}}}
                        className='text-white w-full font-medium text-3xl text-center'>
                        Запомните фразу тренировки
                </motion.h1>
                    <motion.p
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        exit={{scale: 0, transition: {delay: 0.1}}}
                        className='text-sm mx-4 text-center text-white mt-2 font-light'
                    >
                        Она будет в тесте, который поможет вам набрать баллы
                    </motion.p>
                </motion.div>

            </motion.div>

            <motion.div
                initial={{scale: 0}}
                animate={{scale: 1}}
                exit={{scale: 0, transition: {delay: 0.1}}}
                transition={{delay: 0.15}}
                className='
                    flex items-center justify-center w-max h-max
                transform-gpu
                shadow-2xl
                bg-blue-500
                rounded-full
                border-4
                border-white
                z-50
                p-2
                '
            >
                <div
                    className='border-4 rounded-full border-blue-500 w-[270px] h-[270px] max-w-[30vh] max-h-[30vh] cursor-pointer flex items-center justify-center'>
                    <motion.div
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        exit={{scale: 0, transition: {delay: 0.1}}}
                        className='absolute object-contain -mt-[15dvh] -mr-[6dvh] max-w-[40vh] max-h-[40vh]'>
                        <Image src={speakerImg} alt={'speaker'} width={'2000'} height={'2000'}
                               />
                    </motion.div>
                </div>
            </motion.div>
            <div className='fixed w-full px-8 bottom-8'>
                <motion.div
                    className='w-full flex items-center justify-center gap-2'
                    initial={{transform: 'translateY(200px)'}}
                    animate={{transform: 'translateY(0px)'}}
                    exit={{transform: 'translateY(200px)', transition: {delay: 0.2}}}
                    transition={{delay: 0.2}}
                >
                    <Button onClick={() => {
                        if (props.prevStep) props.prevStep()
                        setIsMusicPlaying(true)
                    }} className='py-6' >
                        <IoArrowBack className='text-white'/>
                    </Button>
                    <Button className='w-full sm:w-[400px] py-6' onClick={() => {
                        props.onComplete()
                        setIsMusicPlaying(true)
                    }}>
                        ФРАЗА ЗАПОМНЕНА
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}