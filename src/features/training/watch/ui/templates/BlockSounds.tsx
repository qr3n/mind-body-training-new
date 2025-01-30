import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import { watchTrainingAudiosBlobs } from "@/features/training/watch/model";
import { ITrainingBlockWithContent } from "@/entities/training";
import { useAtomValue } from "jotai";

interface BlockSoundsProps {
    block: ITrainingBlockWithContent;
    isPlaying?: boolean;
    nextAfterComplete?: boolean;
    handleNext?: () => void;
    volume?: number;
    startDelay?: number; // Время задержки перед воспроизведением в миллисекундах
    isEnding?: boolean; // Если true, воспроизводятся ending
}

export const BlockSounds: React.FC<BlockSoundsProps> = memo(
    ({ block, nextAfterComplete, handleNext, isPlaying, volume = 1, startDelay = 0, isEnding = false }) => {
        const audiosBlobs = useAtomValue(watchTrainingAudiosBlobs);

        const [currentIndex, setCurrentIndex] = useState(0);
        const [isDelayed, setIsDelayed] = useState(false);
        const [isTrackEnded, setIsTrackEnded] = useState(false); // Новое состояние для отслеживания завершения трека
        const audioRef = useRef<HTMLAudioElement | null>(null);

        const audioSources = useMemo(() => {
            const audios = isEnding ? block.ending ?? [] : block.audios;

            console.log(audios)
            console.log(audiosBlobs)

            return audios.map(audio => audiosBlobs[audio.id]).filter(Boolean);
        }, [block, audiosBlobs, isEnding]);

        useEffect(() => {
            const timer = setTimeout(() => {
                setIsDelayed(true);
            }, startDelay);

            return () => clearTimeout(timer);
        }, [startDelay]);

        useEffect(() => {
            const audio = audioRef.current;


            if (!audio || audioSources.length === 0 || !isDelayed) return;

            // Устанавливаем текущий источник, если он изменился
            if (audio.src !== audioSources[currentIndex]) {
                audio.src = audioSources[currentIndex];
                setIsTrackEnded(false); // Сбрасываем состояние окончания трека при смене источника
            }

            audio.volume = volume;

            if (isPlaying && !isTrackEnded) {
                audio.play();
            } else {
                audio.pause();
            }

            const handleEnded = () => {
                setIsTrackEnded(true); // Помечаем, что трек завершен
                if (currentIndex < audioSources.length - 1) {
                    setCurrentIndex(prevIndex => prevIndex + 1);
                    setIsTrackEnded(false); // Сбрасываем флаг для следующего трека
                } else if (nextAfterComplete && handleNext) {
                    handleNext();
                }
            };

            audio.addEventListener("ended", handleEnded);

            return () => {
                audio.pause();
                audio.removeEventListener("ended", handleEnded);
            };
        }, [audioSources, currentIndex, isPlaying, volume, isDelayed, isTrackEnded, nextAfterComplete, handleNext]);

        useEffect(() => {
            setCurrentIndex(0);
        }, [audioSources]);

        return <audio ref={audioRef} style={{ display: "none" }} />;
    }
);

BlockSounds.displayName = "BlockSounds";
