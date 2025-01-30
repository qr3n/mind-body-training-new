import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/shared/shadcn/ui/button";
import { FaPause } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";

interface AudioPlayerProps {
    audioFile?: File; // Опционально: аудиофайл
    audioSrc?: string; // Опционально: URL аудио
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioFile, audioSrc }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (audioFile || audioSrc) {
            const objectUrl = audioFile ? URL.createObjectURL(audioFile) : audioSrc!;
            if (audioRef.current) {
                audioRef.current.src = objectUrl;
                audioRef.current.onloadedmetadata = () => {
                    setDuration(audioRef.current?.duration || 0);
                };
            }
            return () => {
                if (audioFile) {
                    URL.revokeObjectURL(objectUrl); // Освобождение URL только для File
                }
            };
        }
    }, [audioFile, audioSrc]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current && !isDragging) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const handleSliderChange = (value: number) => {
        setCurrentTime(value);
    };

    const handleSliderCommit = (value: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value;
        }
        setIsDragging(false);
    };

    return (
        <div className="mt-3 py-3.5 rounded-lg w-full mx-auto">
            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} />

            <div className='flex gap-2 items-center'>
                <div className="flex items-center justify-between mb-4">
                    <Button
                        type='button'
                        onClick={togglePlay}
                        size='icon'
                        className='rounded-full '
                    >
                        {isPlaying ? <FaPause/> : <FaPlay/>}
                    </Button>
                </div>

                <div className='w-full'>
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={(e) => {
                            setIsDragging(true);
                            handleSliderChange(Number(e.target.value));
                        }}
                        onMouseUp={(e) => handleSliderCommit(Number(e.currentTarget.value))}
                        onTouchEnd={(e) => handleSliderCommit(Number(e.currentTarget.value))}
                        className="w-full"
                    />
                    <div className="text-sm text-gray-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>
            </div>
        </div>
    );
};
