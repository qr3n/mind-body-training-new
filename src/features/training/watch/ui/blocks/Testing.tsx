'use client';

import { motion } from "framer-motion";
import { Button } from "@/shared/shadcn/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import Image from "next/image";
import { testImg } from "@/features/training/watch/ui/assets";
import { useSetAtom } from "jotai";
import { watchCorrectAnswersCount, watchTrainingMusicPlaying } from "@/features/training/watch/model";
import { useEffect, useState } from "react";
import { Checkbox } from "@/shared/shadcn/ui/checkbox";

interface AnswerOptionProps {
    text: string;
    isCorrect: boolean;
    onChange: (isChecked: boolean, isCorrect: boolean) => void;
}

export const AnswerOption = (props: AnswerOptionProps) => {
    const [isChecked, setIsChecked] = useState(false);

    const handleClick = () => {
        const newCheckedState = !isChecked;
        setIsChecked(newCheckedState);
        props.onChange(newCheckedState, props.isCorrect);
    };

    return (
        <div
            className="border flex gap-3 select-none w-full p-4 bg-white rounded-xl shadow-sm cursor-pointer"
            onClick={handleClick}
        >
            <Checkbox checked={isChecked} onCheckedChange={handleClick} />
            <p className="text-gray-700 border-none outline-none w-full">
                {props.text}
            </p>
        </div>
    );
};

export const Testing = (props: IWatchTrainingBlockProps) => {
    const setCorrectAnswers = useSetAtom(watchCorrectAnswersCount);
    const [correctCount, setCorrectCount] = useState(0);
    const setIsMusicPlaying = useSetAtom(watchTrainingMusicPlaying)

    useEffect(() => {
        setIsMusicPlaying(false)
    }, []);

    const handleAnswerChange = (isChecked: boolean, isCorrect: boolean) => {
        setCorrectCount((prev) => {
            if (isCorrect) {
                return isChecked ? prev + 1 : prev - 1;
            }
            return prev;
        });
    };

    // Обновляем глобальное состояние
    setCorrectAnswers(correctCount);

    return (
        <div className='relative w-[100dvw] h-[100dvh] flex items-center justify-center'>

            {/* Фон */}
            <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'calc(30vh + 50px)' }}
                exit={{ height: 0, transition: { delay: 0 } }}
                transition={{ delay: 0.1 }}
                className='absolute top-0 left-0 w-full bg-blue-500 -z-50'
                style={{ borderRadius: "0 0 70% 70%" }}
            />

            {/* Верхний круг */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, transition: { delay: 0.1 } }}
                transition={{ delay: 0.15 }}
                className='
                    flex items-center justify-center
                    shadow-2xl bg-blue-500 rounded-full
                    -mt-64
                    border-[8px] border-white
                    z-50 p-2
                '
                style={{
                    width: "calc(20vh + 50px)",
                    height: "calc(20vh + 50px)",
                }}
            >
                <div className='rounded-full border-blue-500 flex items-center justify-center p-8 w-full h-full cursor-pointer'>
                    <Image src={testImg} alt={'test'} width={0} height={0} className='w-full h-full object-cover' />
                </div>
            </motion.div>

            {/* Вопросы */}
            <div className='fixed w-full flex items-center justify-center flex-col px-8 bottom-8'>
                <div className='w-full sm:w-auto'>
                    <motion.h1
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className='font-bold mb-4'
                    >{props.block.question || 'Вопрос не задан'}</motion.h1>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className='space-y-4 h-full overflow-y-auto max-h-[calc(100dvh-50vh)] mb-6'
                    >
                        {props.block.answers?.map((q, i) => (
                            <AnswerOption
                                key={i}
                                text={q.text}
                                isCorrect={q.isCorrect}
                                onChange={handleAnswerChange}
                            />
                        ))}
                    </motion.div>

                    {/* Кнопки */}
                    <motion.div
                        className='w-full flex items-center justify-center gap-2'
                        initial={{ transform: 'translateY(200px)' }}
                        animate={{ transform: 'translateY(0px)' }}
                        exit={{ transform: 'translateY(200px)', transition: { delay: 0.2 } }}
                        transition={{ delay: 0.2 }}
                    >
                        <Button onClick={() => props.prevStep && props.prevStep()} className='py-6' >
                            <IoArrowBack className='text-white' />
                        </Button>
                        <Button className='w-full sm:w-[400px] py-6' onClick={() => {
                            setIsMusicPlaying(true)
                            props.onComplete()
                        }}>
                            ПОДТВЕРДИТЬ
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
