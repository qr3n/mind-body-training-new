'use client';

import React, { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { Button }                                       from "@/shared/shadcn/ui/button";
import { addPauseImg, audioImg, playAudioImg } from "@/features/training/create/ui/assets";
import Image from 'next/image';
import { CreateTrainingAddSoundModal } from "@/features/training/create/ui/modals/CreateTrainingAddAudioModal";
import { useAtom, useSetAtom } from "jotai/index";
import {
    addEndSoundToBlock, addLapsQtySoundToBlock, addRepsQtySoundToBlock,
    addSoundToBlock, blockEndSoundsAtomFamily, blockLapsQtySoundsAtomFamily, blockRepsQtySoundsAtomFamily,
    blockSoundsAtomFamily, removeEndSoundFromBlock, removeLapsQtySoundFromBlock, removeRepsQtySoundFromBlock,
    removeSoundFromBlock, startInAtomFamily,
    updatePauseDurationAtom
} from "@/features/training/create/model";
import { useAtomValue } from "jotai";
import { useAudios } from "@/entities/audio";
import { useState } from "react";
import { API_URL } from "@/shared/api";
import { ITrainingAudio, ITrainingPause } from "@/entities/training";
import { DraggableList } from "@/shared/ui/draggable-list";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { RiDeleteBinLine } from "react-icons/ri";


const typesActionsMap = {
    'sounds': addSoundToBlock,
    'end': addEndSoundToBlock,
    'reps_qty': addRepsQtySoundToBlock,
    'laps_qty': addLapsQtySoundToBlock,
}

const removeSoundsActionsMap = {
    'sounds': removeSoundFromBlock,
    'end': removeEndSoundFromBlock,
    'reps_qty': removeRepsQtySoundFromBlock,
    'laps_qty': removeLapsQtySoundFromBlock,
}

const soundsTypesMap = {
    'sounds': blockSoundsAtomFamily,
    'end': blockEndSoundsAtomFamily,
    'reps_qty': blockRepsQtySoundsAtomFamily,
    'laps_qty': blockLapsQtySoundsAtomFamily,
}



const RenderSounds = ({
                          sounds,
                          onReorder,
                          blockId,
                          isEnd,
                          type
                      }: {
    sounds: (ITrainingAudio | ITrainingPause)[];
    onReorder: Dispatch<SetStateAction<string[]>> | ((newOrder: string[]) => void);
    blockId: string,
    isEnd?: boolean,
    type: 'sounds' | 'end' | 'laps_qty' | 'reps_qty'
}) => {
    const { data } = useAudios();
    const [, updatePauseDuration] = useAtom(updatePauseDurationAtom);
    const removeSound = useSetAtom(removeSoundsActionsMap[type])

    const renderElement = ({
                               id,
                               isDragging,
                               dragHandleProps,
                           }: {
        id: string;
        isDragging: boolean;
        dragHandleProps: DraggableProvidedDragHandleProps | null;
    }) => {
        const sound = sounds.find((s) => s.id === id);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [inputState, setInputState] = useState(sound?.type === 'pause' ? sound.duration : '0')
        if (!sound) return null;

        return (
            <div
                className={`border items-center justify-between flex gap-3 select-none w-full p-4 bg-white rounded-2xl shadow-lg transition-all ${
                    isDragging ? 'bg-blue-100 border-blue-300' : ''
                }`}
                {...dragHandleProps}
            >
                <div className='flex gap-3 items-center'>
                    <h1>
                        {sound.type === 'audio'
                            ? data?.find((a) => a.id === sound.id)?.name || 'Аудио'
                            : 'Пауза'}
                    </h1>

                    {sound.type === 'audio' && (
                        <Button className="p-1.5" variant="ghost">
                        </Button>
                    )}

                    {sound.type === 'pause' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={inputState}
                                onChange={(e) => setInputState(e.target.value)}
                                onBlur={() =>
                                    updatePauseDuration({
                                        blockId,
                                        pauseId: sound.id,
                                        newDuration: Number(inputState),
                                    })
                                }
                                min={0}
                                className="border rounded-2xl bg-blue-50 focus:outline-blue-300 w-[80px] pr-2 pl-3 py-1"
                            />
                            <span>мс.</span>
                        </div>
                    )}

                    <p className="text-pretty overflow-x-hidden max-w-[300px]">
                        {sound.type === 'audio' &&
                            data?.find((a) => a.id === sound.id)?.subtitles}
                    </p>
                </div>
                <Button onClick={() => removeSound({
                    blockId: blockId,
                    soundId: sound.id
                })} variant='ghost' size='icon'
                        className='z-50 border border-transparent hover:border-blue-500 hover:bg-blue-100 h-9 w-9'>
                    <RiDeleteBinLine className='w-5 h-5'/>
                </Button>
            </div>
        );
    };

    return (
        <DraggableList
            blocksIds={sounds.map((s) => s.id)}
            setBlocksIds={onReorder}
            renderElement={renderElement}
        />
    );
};


export const BlockSounds = (props: {
    id: string,
    isEnd?: boolean,
    isPhrase?: boolean,
    type?: 'sounds' | 'end' | 'laps_qty' | 'reps_qty'
}) => {
    const type = props.type || 'sounds'
    const { data } = useAudios();
    const addSound = useSetAtom(typesActionsMap[type]);
    const sounds = useAtomValue(soundsTypesMap[type](props.id));
    const setSounds = useSetAtom(soundsTypesMap[type](props.id));
    const [isPlaying, setIsPlaying] = useState(false);
    const [na, setNa] = useAtom(startInAtomFamily(props.id));
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const stopPlayback = useRef(false);

    const addPause = () => {
        addSound({
            blockId: props.id,
            audio: {
                id: Date.now().toString(),
                type: 'pause',
                duration: 800,
            },
        });
    };

    const playAll = async () => {
        if (isPlaying) {
            stopPlayback.current = true;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsPlaying(false);
            return;
        }

        stopPlayback.current = false;
        setIsPlaying(true);

        for (const sound of sounds) {
            if (stopPlayback.current) break;

            if (sound.type === 'pause') {
                await new Promise(resolve => setTimeout(resolve, sound.duration));
            } else if (sound.type === 'audio') {
                const audioData = data?.find(a => a.id === sound.id);
                if (audioData) {
                    try {
                        let audioSrc: string;
                        if (audioData.blob) {
                            audioSrc = audioData.blob;
                        } else {
                            const response = await fetch(`${API_URL}/content/stream/audio/${audioData.id}`);
                            const blob = await response.blob();
                            audioSrc = URL.createObjectURL(blob);
                        }

                        const audio = new Audio(audioSrc);
                        audioRef.current = audio;

                        await new Promise(resolve => {
                            audio.onended = resolve;
                            audio.play();
                        });
                    } catch (error) {
                        console.error("Audio playback failed", error);
                    }
                }
            }
        }

        setIsPlaying(false);
    };

    const handleReorder = (newOrder: string[]) => {
        const reorderedSounds = newOrder.map(id => sounds.find(sound => sound.id === id)!);
        setSounds(reorderedSounds);
    };

    const calculateTotalDuration = useCallback(() => {
        const total = sounds.reduce((sum, sound) => {
            if (sound.type === 'pause') {
                return sum + sound.duration / 1000;
            } else if (sound.type === 'audio') {
                const audioData = data?.find(d => d.id === sound.id);
                return sum + (audioData?.duration || 0);
            }
            return sum;
        }, 0);

        return parseFloat(total.toFixed(1));
    }, [data, sounds]);

    return (
        <div>
            <div className='flex items-center gap-3 ml-4'>
                <Image src={audioImg} alt='audio' width={38} height={38} />
                <h1 className='text-xl font-semibold'>{props.isEnd ? 'Концовка' : 'Аудио'}</h1>
            </div>
            <div className='mt-6 flex flex-col md:flex-row gap-8 mb-8'>
                <div className='flex flex-col gap-2 w-[300px] overflow-hidden'>
                    <CreateTrainingAddSoundModal type={type} isEnd={props.isEnd} id={props.id} />
                    <Button type='button' onClick={addPause} className='flex gap-2 pr-12 justify-start text-[#777]' variant='ghost'>
                        <Image src={addPauseImg} alt='add-pause' width={26} /> Добавить паузу
                    </Button>
                    {props.isEnd && (
                        <div className='flex gap-4 items-center ml-4 mt-6 text-[#777]'>
                            <p className='text-sm mt-1'>Начать за</p>
                            <input
                                value={na.toString()}
                                onChange={v => setNa(Number(v.target.value))}
                                className='w-10 h-10 text-blue-500 border-2 border-blue-500 text-center text-sm flex items-center justify-center font-bold rounded-xl'
                            />
                            <p className='text-sm mt-1'>сек</p>
                        </div>
                    )}
                </div>
                <div className='hidden md:block flex-grow w-[1px] rounded-full bg-blue-500'/>
                <div className='flex flex-col w-full'>
                    <div className='flex items-center justify-between flex-col sm:flex-row'>
                        <Button
                            type='button'
                            variant='ghost'
                            className='w-max text-[#777] gap-2 flex'
                            onClick={playAll}
                        >
                            <Image src={playAudioImg} alt='play-audio' width={26} />
                            {isPlaying ? "Остановить" : "Воспроизвести полностью"}
                        </Button>
                        <div className='text-[#777] flex items-center gap-2 text-sm'>
                            <h1>Суммарное время</h1>
                            <div className='py-2 px-3 border-blue-500 text-blue-500 rounded-xl border-2 font-semibold'>
                                {calculateTotalDuration()}
                            </div>
                            <p>сек</p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-3 mt-8'>
                        <RenderSounds type={type} isEnd={props.isEnd} blockId={props.id} sounds={sounds} onReorder={handleReorder} />
                    </div>
                </div>
            </div>
        </div>
    );
};
