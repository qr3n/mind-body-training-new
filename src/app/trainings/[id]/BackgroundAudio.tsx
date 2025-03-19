import React, { useEffect, useRef } from "react";
import { ITrainingAudio } from "@/entities/training";
import { useAtomValue } from "jotai";
import {
    watchTrainingAudiosBlobs, watchTrainingMusicPlaying,
    watchTrainingMusicVolume,
    watchTrainingPlaying
} from "@/features/training/watch/model";

interface BackgroundAudioProps {
    audios: ITrainingAudio[];
    loop?: boolean;
}

export const BackgroundAudio: React.FC<BackgroundAudioProps> = ({ audios, loop = false }) => {
    const isAudioPlaying = useAtomValue(watchTrainingPlaying)
    const isMusicPlaying = useAtomValue(watchTrainingMusicPlaying)

    const isPlaying = isAudioPlaying && isMusicPlaying

    const volume = useAtomValue(watchTrainingMusicVolume);
    const audiosBlobs = useAtomValue(watchTrainingAudiosBlobs);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentIndexRef = useRef(0);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || audios.length === 0) return;

        const playAudio = () => {
            const audioBlob = audiosBlobs[audios[currentIndexRef.current]?.id];
            if (!audioBlob) return;

            // Use loadeddata event to play audio after it's loaded
            const playWhenReady = () => {
                if (isPlaying) {
                    audio.play().catch(error => console.error('Error playing audio:', error));
                }
                // Remove event listener after it fires once
                audio.removeEventListener('loadeddata', playWhenReady);
            };

            // Add event listener before changing source
            audio.addEventListener('loadeddata', playWhenReady);

            // Update source
            audio.src = audioBlob;
            audio.load();
        };

        const handleEnded = () => {
            if (currentIndexRef.current < audios.length - 1) {
                currentIndexRef.current++;
                playAudio();
            } else if (loop) {
                currentIndexRef.current = 0;
                playAudio();
            }
        };

        audio.addEventListener('ended', handleEnded);

        // Initialize playback
        playAudio();

        return () => {
            audio.removeEventListener('ended', handleEnded);
            // Ensure we remove any potential loadeddata listeners
            audio.removeEventListener('loadeddata', () => {});
            audio.pause();
            audio.src = '';
        };
    }, [audios, audiosBlobs, isPlaying, loop]);

    return <audio ref={audioRef} style={{ display: "none" }} />;
};