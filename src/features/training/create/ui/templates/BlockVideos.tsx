'use client';

import { addPauseImg, audioImg, playAudioImg } from "@/features/training/create/ui/assets";
import { Button }                              from "@/shared/shadcn/ui/button";
import Image from 'next/image'
import { CreateTrainingAddVideoModal } from "@/features/training/create/ui/modals/CreateTrainingAddVideoModal";
import { useAtomValue, useSetAtom } from "jotai";
import {
    blockVideosAtomFamily,
    checkInputResultsAtomFamily,
    cycleVideoAtomFamily,
    removeVideoFromBlock, needUseVideoSoundAtomFamily
} from "@/features/training/create/model";
import { useVideos } from "@/entities/video/model/hooks";
import { API_URL } from "@/shared/api";
import { CanvasVideoPlayer } from "@/shared/ui/canvas-video";
import { AnimatedCheckbox } from "@/shared/ui/animated-checkbox";
import React, { useCallback, useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { useAtom } from "jotai/index";
import { watchedVideosAtom } from "@/features/training/watch/model";

const RenderVideosContent = (props: { id: string, isPlaying: boolean, onVideoEnd: () => void }) => {
    const videos = useAtomValue(blockVideosAtomFamily(props.id));
    const { data } = useVideos();

    return (
        <>
            {videos.map((video, i) => (
                <div
                    key={video.id + i}
                    className="">
                    <CanvasVideoPlayer
                        key={data?.find(a => a.id === video.id)?.previewBlob}
                        width={200}
                        src={
                            data?.find(a => a.id === video.id)?.videoBlob ||
                            `${API_URL}/content/stream/video/${video.id}?v=${video.checksum}`
                        }
                        preview={
                            data?.find(a => a.id === video.id)?.previewBlob ||
                            `${API_URL}/content/library/video/preview/${video.id}?v=${video.checksum}`
                        }
                        isPlaying={props.isPlaying && i === 0}
                        onVideoEnd={props.onVideoEnd}
                    />
                </div>
            ))}
        </>
    );
};

const RenderVideosText = (props: { id: string }) => {
    const removeVideo = useSetAtom(removeVideoFromBlock);
    const videos = useAtomValue(blockVideosAtomFamily(props.id));
    const { data } = useVideos();

    return (
        <>
            {videos.map((video, i) => (
                <div
                    key={video.id + i}
                    className='border items-center flex justify-between select-none w-full p-4 bg-white rounded-2xl shadow-lg'>
                    <div className='flex gap-12'>
                        <div className='flex flex-col'>
                            <h1 className='font-semibold'>
                                {data?.find(a => a.id === video.id)?.name}
                            </h1>
                            <p className='text-xs text-[#555] mt-0.5'>
                                {data?.find(a => a.id === video.id)?.filename}
                            </p>
                        </div>
                        <div className='break-words max-w-[400px] rounded-2xl text-wrap'>
                            <p className='text-gray-600 whitespace-pre-wrap text-wrap text-sm'>
                                {data?.find(a => a.id === video.id)?.description}
                            </p>
                        </div>
                    </div>

                    <Button onClick={() => removeVideo({
                        blockId: props.id,
                        videoId: video.id,
                        allVideos: data || []
                    })} variant='ghost' size='icon'
                            className='z-50 border border-transparent hover:border-blue-500 hover:bg-blue-100 h-9 w-9'>
                        <RiDeleteBinLine className='w-5 h-5'/>
                    </Button>
                </div>
            ))}
        </>
    );
};

export const BlockVideos = (props: { blockId: string }) => {
    const [checkedCycle, setCheckedCycle] = useAtom(cycleVideoAtomFamily(props.blockId));
    const [checkedInputResults, setCheckedInputResults] = useAtom(checkInputResultsAtomFamily(props.blockId));
    const [useVideoSound, setUseVideoSounds] = useAtom(needUseVideoSoundAtomFamily(props.blockId));
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videos = useAtomValue(blockVideosAtomFamily(props.blockId))
    const { data } = useVideos();

    const setCheckedCycleCallback = useCallback(() => {
        setCheckedCycle(prev => !prev);
    }, []);

    const setCheckedInputResultsCallback = useCallback(() => {
        setCheckedInputResults(prev => !prev);
    }, []);

    const setUseVideoSoundsCallback = useCallback(() => {
        setUseVideoSounds(prev => !prev);
    }, []);

    const playAllVideos = useCallback(() => {
        setIsPlaying(prev => !prev);
        setCurrentVideoIndex(0);
    }, [])

    const handleVideoEnd = useCallback(() => {
        if (currentVideoIndex < videos.length) {
            setCurrentVideoIndex(currentVideoIndex + 1);
        } else {
            setIsPlaying(false);
        }
    }, [currentVideoIndex, videos.length]);

    return (
        <>
            <div className='flex items-center gap-3 ml-4'>
                <Image src={audioImg} alt={'equipment'} width={38} height={38}/>
                <h1 className='text-xl font-semibold'>Видео</h1>
            </div>
            <div className='mt-6 flex flex-col md:flex-row gap-8 mb-8'>
                <div className='flex flex-col gap-2 w-[300px] overflow-hidden'>
                    <CreateTrainingAddVideoModal blockId={props.blockId}/>
                    <div className='flex items-center gap-3 ml-5 mt-2'>
                        <AnimatedCheckbox rounded checked={checkedCycle} onChangeValue={setCheckedCycleCallback}/>
                        <h1 className='cursor-pointer text-sm text-[#777] select-none'>Зациклить</h1>
                    </div>
                    <div className='flex items-center gap-3 ml-5 mt-4'>
                        <AnimatedCheckbox rounded checked={checkedInputResults}
                                          onChangeValue={setCheckedInputResultsCallback}/>
                        <h1 className='cursor-pointer text-sm text-[#777] select-none'>Вводить результаты</h1>
                    </div>

                    <div className='flex items-center gap-3 ml-5 mt-4'>
                        <AnimatedCheckbox rounded checked={useVideoSound}
                                          onChangeValue={setUseVideoSoundsCallback}/>
                        <h1 className='cursor-pointer text-sm text-[#777] select-none'>Воспроизводить аудио из видеофайла</h1>
                    </div>
                    <div className='flex flex-col mt-8 gap-8'>
                        <RenderVideosContent id={props.blockId} isPlaying={isPlaying} onVideoEnd={handleVideoEnd}/>
                    </div>
                </div>
                <div className='hidden md:block flex-grow w-[1px] rounded-full bg-blue-500'/>
                <div className='flex flex-col w-full'>
                    <div className='flex items-center justify-between flex-col sm:flex-row'>
                        <Button
                            variant='ghost'
                            className='w-max text-[#777] gap-2 flex'
                            onClick={playAllVideos}>
                            <Image src={isPlaying ? addPauseImg : playAudioImg} alt='play-audio' width={26} />
                            {isPlaying ? "Остановить воспроизведение" : "Воспроизвести полностью"}
                        </Button>

                        <div className='text-[#777] flex items-center gap-2 text-sm'>
                            <h1>Суммарное время</h1>
                            <div className='py-2 px-3 border-blue-500 text-blue-500 rounded-xl border-2 font-semibold'>
                                {videos.reduce((sum, item) => sum + (data?.find(i => i.id === item.id)?.duration || 0), 0)}
                            </div>
                            <p>сек </p>
                        </div>
                    </div>

                    <div className='flex flex-col gap-[5.3rem] mt-[9.5rem]'>
                        <RenderVideosText id={props.blockId} />
                    </div>
                </div>
            </div>
        </>
    );
};
