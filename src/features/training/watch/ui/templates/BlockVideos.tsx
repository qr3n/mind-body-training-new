'use client';

import { motion }                     from "framer-motion";
import { useAtomValue }                              from 'jotai';
import { useCallback, useEffect, useMemo, useState } from "react";
import { ITrainingBlockWithContent }                 from "@/entities/training";
import {
    watchTrainingMusicVolume,
    watchTrainingSpeakerVolume,
    watchTrainingVideosBlobs
} from "@/features/training/watch/model";
import { Button }                     from "@/shared/shadcn/ui/button";
import { ArrowLeft }                  from "lucide-react";
import { CanvasVideoPlayer }          from "@/shared/ui/canvas-video";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { WatchTrainingTemplate }      from "@/features/training/watch/ui/templates/index";
import { FaPause, FaRepeat, FaUserTie } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";
import { useVideos }                        from "@/entities/video";
import { PopoverContent, PopoverTrigger, Popover } from "@/shared/shadcn/ui/popover";
import { Slider } from "@/shared/shadcn/ui/slider";
import { IoMdVolumeHigh } from "react-icons/io";
import { RiMusic2Fill } from "react-icons/ri";
import { PiArrowBendRightUpBold } from "react-icons/pi";
import { useAtom } from "jotai/index";

interface IProps {
    restPossible?: boolean,
    block: ITrainingBlockWithContent,
    type: ITrainingBlockWithContent['type'],
    handleNext: () => void,
    handlePrev: () => void,
    headerText?: string,
    renderExerciseNumber?: boolean,
    restType?: 'first' | 'second'
}

const colorsMap = [
    '#f1cf46',
    '#f82121',
    '#f37a3a',
    '#5dc84d',
    '#438aff',
    '#001b49',
]

const TimerMobile = ({ timeLeft, duration, type }: { timeLeft: number; duration: number, type: ITrainingBlockWithContent['type'] }) => {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            const height = window.innerHeight;
            const width = window.innerWidth;
            const newScale = width <= 768 ? Math.min(height / 800, 1.2) : 1; // Увеличение только для мобильных
            setScale(newScale);
        };

        updateScale();
        window.addEventListener("resize", updateScale);

        return () => {
            window.removeEventListener("resize", updateScale);
        };
    }, []);

    const radius = 60 * scale; // Увеличенный радиус на мобильных
    const circumference = 2 * Math.PI * radius;

    const calculateStrokeDashoffset = () => {
        return circumference * (1 - timeLeft / duration);
    };

    const totalLines = 60;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="sm-h:mt-12 sm:mt-[clamp(0px,8dvh,400px)] flex justify-center"
            style={{ transform: `scale(${scale})` }}
        >
            <motion.div className="relative flex items-center justify-center w-[clamp(8rem,10vw,10rem)] h-[clamp(8rem,10vw,10rem)] sm:w-32 sm:h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(totalLines)].map((_, index) => (
                        <div
                            key={index}
                            className="absolute w-[1.5px] h-2 bg-gray-300"
                            style={{
                                transform: `rotate(${(index * 360) / totalLines}deg) translateY(-${80 * scale}px)`,
                            }}
                        />
                    ))}
                </div>

                <svg className="absolute w-full h-full" style={{ width: `${140 * scale}px`, height: `${140 * scale}px` }}>
                    <circle
                        className="text-gray-200"
                        strokeWidth={5 * scale}
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={70 * scale}
                        cy={70 * scale}
                    />
                    <circle
                        className="ease-linear"
                        strokeWidth={5 * scale}
                        strokeDasharray={circumference}
                        strokeDashoffset={calculateStrokeDashoffset()}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={70 * scale}
                        cy={70 * scale}
                        style={{
                            transform: "rotate(-90deg)",
                            transformOrigin: "center",
                            transition: 'stroke-dashoffset 1s ease-in-out',
                            color: type === 'exercise' ? '#4466e2' : '#a8c47c'
                        }}
                    />
                </svg>

                <div className="[font-size:_clamp(0.3em,5dvh,3em)] font-bold text-gray-800 transition-transform duration-300 transform">
                    <span key={timeLeft} className="inline-block animate-scale">
                        {timeLeft > 0 ? timeLeft : 0}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};


const Timer = ({ timeLeft, duration, type }: { timeLeft: number; duration: number, type: ITrainingBlockWithContent['type'] }) => {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            const height = window.innerHeight;
            const newScale = Math.min(height / 1000, 1);
            setScale(newScale);
        };

        updateScale();
        window.addEventListener("resize", updateScale);

        return () => {
            window.removeEventListener("resize", updateScale);
        };
    }, []);

    const radius = 50 * scale;
    const circumference = 2 * Math.PI * radius;

    const calculateStrokeDashoffset = () => {
        return circumference * (1 - timeLeft / duration);
    };

    const totalLines = 60;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="-mt-4 sm:mt-[clamp(0px,8dvh,400px)] flex justify-center"
            style={{ transform: `scale(${scale})` }}
        >
            <motion.div className="relative flex items-center justify-center w-32 h-32">
                {/* Outer markings */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(totalLines)].map((_, index) => (
                        <div
                            key={index}
                            className="absolute w-[1px] h-2 bg-gray-300"
                            style={{
                                transform: `rotate(${(index * 360) / totalLines}deg) translateY(-${72 * scale}px)`,
                            }}
                        />
                    ))}
                </div>

                {/* Progress circle */}
                <svg
                    className="absolute w-full h-full"
                    style={{ width: `${128 * scale}px`, height: `${128 * scale}px` }}
                >
                    <circle
                        className="text-gray-200"
                        strokeWidth={4 * scale}
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={64 * scale}
                        cy={64 * scale}
                    />
                    <circle
                        className="ease-linear"
                        strokeWidth={4 * scale}
                        strokeDasharray={circumference}
                        strokeDashoffset={calculateStrokeDashoffset()}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={64 * scale}
                        cy={64 * scale}
                        style={{
                            transform: "rotate(-90deg)",
                            transformOrigin: "center",
                            transition: 'stroke-dashoffset 1s ease-in-out', // анимация для strokeDashoffset
                            color: type === 'exercise' ? '#4466e2' : '#a8c47c'
                        }}
                    />
                </svg>

                {/* Timer value */}
                <div className="[font-size:_clamp(0.2em,4dvh,2.7em)] font-bold text-gray-800 transition-transform duration-300 transform">
                    <span key={timeLeft} className="inline-block animate-scale">
                        {timeLeft > 0 ? timeLeft : 0}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};



export const BlockVideos = (props: IProps) => {
    const [reset, setReset] = useState(Date.now().toString())
    const {data: allVideos} = useVideos()
    const [duration] = useState(props.block.slideDuration || 0)
    const videoBlobs = useAtomValue(watchTrainingVideosBlobs);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [time, setTime] = useState<undefined | number>(props.block.slideDuration || 0)
    const videos = useMemo(() => props.block.videos || [], [props.block.videos])
    const videoSources = videos.map(video => videoBlobs[video.id]).filter(Boolean);
    const [playing, setPlaying] = useState(true);

    const currentVideo = useMemo(() => allVideos?.find(v => v.id === videos[currentVideoIndex].id), [allVideos, currentVideoIndex, videos])
    const [hasCalledNext, setHasCalledNext] = useState(false);
    const [volume, setVolume] = useAtom(watchTrainingSpeakerVolume)
    const [musicVolume, setMusicVolume] = useAtom(watchTrainingMusicVolume)

    const handlePlayPause = useCallback(() => {
        setPlaying((prev) => !prev);
    }, []);

    const handleVideoEnd = useCallback(() => {
        if (currentVideoIndex < videoSources.length - 1) {
            setCurrentVideoIndex((prev) => prev + 1);
        } else {
            props.handleNext();
        }
    }, []);

    useEffect(() => {
        if (time && time < 0 && !hasCalledNext) {
            props.handleNext();
            setHasCalledNext(true);
        }
    }, [time, props, hasCalledNext]);

    const handleNextClick = useCallback(() => {
        if (currentVideoIndex < videoSources.length - 1) {
            setCurrentVideoIndex((prev) => prev + 1);
        } else {
            props.handleNext();
        }
    }, [])

    const handlePrevClick = useCallback(() => {
        if (currentVideoIndex > videoSources.length - 1) {
            setCurrentVideoIndex((prev) => prev - 1);
        } else {
            props.handlePrev();
        }
    }, [])

    return (
        <div className='relative w-[100dvw] h-[100dvh] flex sm:items-center sm:justify-center flex-col'>
            <WatchTrainingTemplate.BlockSounds key={reset} volume={volume} isPlaying={playing} block={props.block}/>
            {(props.block.ending && props.block.ending.length > 0 && props.block.startIn && time && (time - props.block.startIn <= 0)) &&
                <WatchTrainingTemplate.BlockSounds isEnding startDelay={0} isPlaying={playing} key={reset + 'end'} volume={volume} block={props.block}/>
            }
            <motion.div
                initial={{height: 0}}
                animate={{height: '50%'}}
                exit={{height: 0, transition: {delay: 0}}}
                transition={{delay: 0.1}}
                style={{background: props.type === 'exercise' ? '#4466e2' : '#a8c47c'}}
                className='transform-gpu items-center justify-center w-full max-w-[1024px] rounded-b-[40dvh] top-0 left-1/2 -translate-x-1/2 absolute -z-50 hidden sm:flex'
            >
                <motion.div
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    transition={{delay: 0.2}}
                    className='flex items-center justify-between w-full absolute top-8 gap-3 z-50 left-8'>
                    <div className='flex items-center gap-3'>
                        <Button size={'icon'} className='bg-white text-black'><ArrowLeft/></Button>
                        <h1 className='text-white font-medium text-lg'>{props.type === 'exercise' ? 'Упражнение' : "Техника"}</h1>
                    </div>

                    <div className='flex flex-col mr-16'>
                        <h1 className='text-white  text-sm'>
                            {props.headerText}
                        </h1>
                        {props.renderExerciseNumber && <h1 className='text-white  text-sm'>
                            Упражнение {currentVideoIndex + 1} / {videoSources.length + 1}
                        </h1>}
                    </div>
                </motion.div>
            </motion.div>


            <motion.div
                initial={{height: 0}}
                animate={{height: '50px'}}
                exit={{height: 0, transition: {delay: 0}}}
                transition={{delay: 0.1}}
                style={{background: props.type === 'exercise' ? '#4466e2' : '#a8c47c'}}
                className='flex relative sm:hidden h-max'
            >
            <motion.div
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    transition={{delay: 0.2}}
                    className='flex w-full items-center justify-between absolute top-4 gap-3 z-50 left-4'>
                    <div className='flex items-center gap-3'>
                        <Button size={'icon'} className='bg-white text-black'><ArrowLeft/></Button>
                        <h1 className='text-white font-medium text-lg'>{props.type === 'exercise' ? 'Упражнение' : "Техника"}</h1>
                    </div>

                    <div className='flex flex-col mr-8'>
                        <h1 className='text-white  text-sm'>
                            {props.headerText}
                        </h1>
                        {props.renderExerciseNumber && <h1 className='text-white  text-sm'>
                            Упражнение {currentVideoIndex + 1} / {videoSources.length + 1}
                        </h1>}
                    </div>
            </motion.div>
            </motion.div>

            <motion.div
                initial={{transform: 'translateX(100dvw) scale(0)'}}
                animate={{transform: 'translateX(0) scale(1)'}}
                exit={{transform: 'translateX(-100dvw) scale(0)', transition: {delay: 0}}}
                transition={{delay: 0.1}}
                className='sm:h-[43dvh] sm:-mt-10 max-w-auto aspect-video transform-gpu sm:rounded-2xl relative sm:shadow-xl'
            >
                {videoSources.length > 0 ? (
                    <div>
                        <motion.h1 initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}}
                                   style={{background: props.type === 'exercise' ? '#4466e2' : '#a8c47c'}}
                                   className='text-white font-semibold text-center py-3 text-lg'>🔥 {currentVideo?.name}</motion.h1>
                        <CanvasVideoPlayer
                            key={reset + 'video'}
                            width={1000}
                            src={videoSources[currentVideoIndex]}
                            isPlaying={playing}
                            onVideoEnd={handleVideoEnd}
                            onTimeUpdate={(currentTime) => {
                                if (time !== undefined) {
                                    setTime(duration - currentTime);
                                }
                            }}
                        />
                        <div className='flex justify-between items-center mt-2 gap-2 pr-4 sm:pr-0'>
                            <div className='flex gap-1 items-center -mt-6'>
                                {props.type === 'rest' &&
                                    (
                                        <>

                                            <h1 className='ml-4 text-[14px] text-zinc-700'>{props.restType === 'first' ? 'Первое упражнение' : 'Следующее упражнение'}</h1>
                                            <PiArrowBendRightUpBold className='text-[#a8c47c] w-5 h-5'/>
                                        </>
                                    )
                                }
                            </div>
                            <div>
                                <div className='flex gap-1 '>{
                                        currentVideo?.equipment.includes('Эспандер тр.') && currentVideo?.equipment.map((e, i) =>
                                            <div key={e} className='rounded-full w-3 h-3' style={{background: colorsMap[i]}}/>)
                                    }
                                </div>
                                {currentVideo?.equipment.includes('Эспандер тр.') &&
                                    <p className='font-semibold'>{currentVideo?.equipment[0]}</p>}

                                    <Popover>
                                        <PopoverTrigger className='opacity-0 sm:opacity-100 sm:mt-4' asChild>
                                            <motion.div initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}}>
                                                <Button
                                                    className='w-[clamp(2rem,4vh,3rem)] h-[clamp(2rem,4vh,3rem)] p-0 shadow-md  border border-[#999] hover:border-[#333] bg-transparent hover:bg-[#eee]'
                                                >
                                                    <IoMdVolumeHigh
                                                        className='text-[#333232] w-[clamp(1rem,5vw,2rem)] h-[clamp(1rem,5vh,2rem)]'/>
                                                </Button>
                                            </motion.div>
                                        </PopoverTrigger>
                                        <PopoverContent className='rounded-xl'>
                                            <div className='flex gap-3'>
                                                <RiMusic2Fill className='w-7 h-7'/>
                                                <Slider defaultValue={[musicVolume]} value={[musicVolume]}
                                                        onValueChange={v => setMusicVolume(v[0])}
                                                        max={1} step={0.01}/>
                                            </div>

                                            <div className='flex gap-3 mt-5'>
                                                <FaUserTie className='w-6 h-6'/>
                                                <Slider defaultValue={[volume]} className='' value={[volume]}
                                                        onValueChange={v => setVolume(v[0])}
                                                        max={1} step={0.01}/></div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                        </div>
                    </div>
                ) : (
                    <div className='flex items-center justify-center w-full h-full bg-gray-100 rounded-3xl'>
                        <p className='text-gray-500'>No videos available</p>
                    </div>
                )}
            </motion.div>
            <Popover>
                <PopoverTrigger className='block sm:hidden' asChild>
                    <motion.div initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}}>
                        <Button
                            className='fixed bottom-24 right-12 w-[clamp(2rem,4vh,3rem)] h-[clamp(2rem,4vh,3rem)] p-0 shadow-md  border border-[#999] hover:border-[#333] bg-transparent hover:bg-[#eee]'
                        >
                            <IoMdVolumeHigh
                                className='text-[#333232] w-[clamp(1rem,5vw,2rem)] h-[clamp(1rem,5vh,2rem)]'/>
                        </Button>
                    </motion.div>
                </PopoverTrigger>
                <PopoverContent className='rounded-xl'>
                    <div className='flex gap-3'>
                        <RiMusic2Fill className='w-7 h-7'/>
                        <Slider defaultValue={[musicVolume]} value={[musicVolume]}
                                onValueChange={v => setMusicVolume(v[0])}
                                max={1} step={0.01}/>
                    </div>

                    <div className='flex gap-3 mt-5'>
                        <FaUserTie className='w-6 h-6'/>
                        <Slider defaultValue={[volume]} className='' value={[volume]}
                                onValueChange={v => setVolume(v[0])}
                                max={1} step={0.01}/></div>
                </PopoverContent>
            </Popover>
            <div className='flex w-full h-[calc(100%-550px)] sm:h-auto sm:mt-4 justify-center items-center'>
                <div className='hidden sm:block'>
                    <Timer type={props.type} timeLeft={time ? Math.round(time) : 1}
                           duration={duration !== 0 ? Math.round(duration) : 1}/>
                </div>

                <div className='block sm:hidden'>
                    <TimerMobile type={props.type} timeLeft={time ? Math.round(time) : 1}
                           duration={duration !== 0 ? Math.round(duration) : 1}/>
                </div>

                {props.type === 'rest' && <motion.div
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    exit={{scale: 0}}
                    className='ml-[clamp(0rem,7dvh,12rem)] sm-h:mt-12  h-[clamp(5rem,18vh,18rem)] sm:h-[clamp(5rem,14vh,14rem)] sm:ml-[clamp(0rem,2.5dvh,6rem)] gap-1 flex-col flex items-center justify-center rounded-xl w-[clamp(1rem,12vh,16em)] bg-zinc-200/50 sm:mt-[clamp(0px,8dvh,400px)]'>
                    <svg xmlns="http://www.w3.org/2000/svg" className=' h-[clamp(40px,11vh,140px)] w-[clamp(30px,7vh,120px)] sm:h-[clamp(40px,10vh,120px)] sm:w-[clamp(30px,6vh,100px)]' viewBox="0 0 49 68" fill="none">
                        <path
                            d="M0.945656 42.748L15.5642 60.3978C19.1988 65.1964 24.764 67.9478 30.831 67.9478C38.9023 67.9478 48.2851 62.0958 48.2851 54.5511V17.4597C48.2838 16.4576 47.8797 15.497 47.1612 14.7884C46.4427 14.0798 45.4687 13.6811 44.4525 13.6797C43.4363 13.6807 42.462 14.0794 41.7435 14.788C41.025 15.4967 40.6209 16.4576 40.62 17.4597V31.7376C40.62 31.8945 40.5568 32.0449 40.4443 32.1559C40.3318 32.2668 40.1792 32.3292 40.0201 32.3292C39.861 32.3292 39.7084 32.2668 39.5959 32.1559C39.4834 32.0449 39.4202 31.8945 39.4202 31.7376V9.46435C39.4191 8.46231 39.0149 7.50163 38.2964 6.79309C37.5779 6.08454 36.6038 5.686 35.5876 5.68491C34.5717 5.68631 33.5979 6.08499 32.8796 6.7935C32.1614 7.50201 31.7574 8.46252 31.7563 9.46435V31.7376C31.7479 31.8888 31.6811 32.0311 31.5695 32.1352C31.458 32.2394 31.3103 32.2974 31.1567 32.2974C31.0031 32.2974 30.8554 32.2394 30.7438 32.1352C30.6323 32.0311 30.5655 31.8888 30.5571 31.7376L30.5565 4.23635C30.5529 2.15436 28.8346 0.460449 26.7245 0.460449C25.7083 0.461542 24.7339 0.860145 24.0153 1.5688C23.2967 2.27746 22.8925 3.23829 22.8914 4.24048V31.7376C22.8914 31.8945 22.8282 32.0449 22.7157 32.1559C22.6032 32.2668 22.4506 32.3292 22.2915 32.3292C22.1324 32.3292 21.9798 32.2668 21.8673 32.1559C21.7548 32.0449 21.6916 31.8945 21.6916 31.7376V11.3836C21.6916 9.2992 19.9727 7.60353 17.8596 7.60353C15.7466 7.60353 14.0265 9.2992 14.0265 11.3836V45.9807C14.0265 46.0258 14.0124 46.0698 13.9861 46.1066C13.9598 46.1435 13.9225 46.1714 13.8794 46.1866C13.8364 46.2017 13.7896 46.2033 13.7456 46.1911C13.7015 46.179 13.6624 46.1537 13.6335 46.1187L6.8823 37.9659C6.52311 37.5309 6.06993 37.1805 5.55587 36.9403C5.04181 36.7001 4.47984 36.5761 3.91099 36.5775C3.0286 36.5786 2.17357 36.8796 1.48992 37.4298C1.09887 37.7427 0.774666 38.129 0.536075 38.5664C0.297485 39.0038 0.14925 39.4834 0.0999557 39.9777C0.0482693 40.4717 0.0963987 40.9708 0.241559 41.4463C0.386719 41.9218 0.626031 42.3643 0.945656 42.748Z"
                            fill="#a1c17e"/>
                    </svg>

                    <h1 className='font-semibold [font-size:_clamp(0.2em,2.2dvh,1.5em)] sm:[font-size:_clamp(0.2em,1.7dvh,1.3em)]'>Отдых</h1>
                </motion.div>}
            </div>

            <motion.div
                initial={{transform: 'translateY(100px)', opacity: 0}}
                animate={{transform: 'translateY(0)', opacity: 1}}
                exit={{transform: 'translateY(100px)', opacity: 0, transition: {delay: 0.1}}}
                transition={{delay: 0.1}}
                className='w-full justify-center flex gap-4 fixed bottom-4'
            >
                <Button
                    onClick={handlePrevClick}
                    className='w-[clamp(2rem,6vh,2.8rem)] h-[clamp(2rem,6vh,2.8rem)] p-0 shadow-md bg-[#f9f9fa] hover:bg-[#fff] border border-transparent hover:border-[#ccc]'
                >
                    <GrFormPrevious className='text-[#333232] w-[clamp(1rem,5vw,2rem)] h-[clamp(1rem,5vh,2rem)]'/>
                </Button>

                <Button
                    onClick={() => setReset(Date.now().toString())}
                    className='fixed left-1/2 bg-transparent shadow-none hover:bg-transparent bottom-[clamp(1rem,8vh,4rem)] -translate-x-1/2  rounded-full w-[clamp(2rem,6vh,2.8rem)] h-[clamp(2rem,6vh,2.8rem)]'
                >
                    <FaRepeat className='text-[#333232]'/>
                </Button>

                <Button
                    onClick={handlePlayPause}
                    className='bg-[#333232] hover:bg-[#444] rounded-full w-[clamp(2rem,6vh,2.8rem)] h-[clamp(2rem,6vh,2.8rem)]'
                >
                    {(playing) ? <FaPause/> : <FaPlay/>}
                </Button>

                <Button
                    className='w-[clamp(2rem,6vh,2.8rem)] h-[clamp(2rem,6vh,2.8rem)] p-0 shadow-md bg-[#f9f9fa] hover:bg-[#fff] border border-transparent hover:border-[#ccc]'
                    onClick={handleNextClick}
                    disabled={currentVideoIndex >= videoSources.length && videoSources.length > 0}
                >
                    <GrFormNext className='text-[#333232] w-[clamp(1rem,5vw,2rem)] h-[clamp(1rem,5vh,2rem)]'/>
                </Button>

            </motion.div>
        </div>
    );
};
