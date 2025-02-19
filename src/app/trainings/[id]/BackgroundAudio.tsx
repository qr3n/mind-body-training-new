import React, { useEffect, useRef, useState } from "react";
import { ITrainingAudio } from "@/entities/training";
import { useAtomValue } from "jotai";
import { watchTrainingAudiosBlobs, watchTrainingMusicVolume } from "@/features/training/watch/model";

interface BackgroundAudioProps {
    audios: ITrainingAudio[];
    isPlaying?: boolean;
    loop?: boolean;
}

export const BackgroundAudio: React.FC<BackgroundAudioProps> = ({ audios, isPlaying = true, loop = false }) => {
    const volume = useAtomValue(watchTrainingMusicVolume);
    const audiosBlobs = useAtomValue(watchTrainingAudiosBlobs);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || audios.length === 0) return;

        const playAudio = () => {
            const audioBlob = audiosBlobs[audios[currentIndex]?.id];
            if (!audioBlob) return;

            audio.src = audioBlob;
            audio.loop = false; // Отключаем loop на уровне отдельного трека
            if (isPlaying) {
                audio.play();
            } else {
                audio.pause();
            }
        };

        playAudio();

        audio.onended = () => {
            if (currentIndex < audios.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else if (loop) {
                setCurrentIndex(0);
            }
        };

        return () => {
            audio.onended = null;
            audio.pause();
            audio.src = "";
        };
    }, [audios, audiosBlobs, isPlaying, currentIndex, loop]);

    return <audio ref={audioRef} style={{ display: "none" }} />;
};
