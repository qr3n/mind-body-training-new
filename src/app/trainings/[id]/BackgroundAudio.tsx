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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audiosBlobs = useAtomValue(watchTrainingAudiosBlobs);
    const [hasPlayed, setHasPlayed] = useState(false);

    // Обновляем громкость без перезапуска воспроизведения
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio || audios.length === 0 || (hasPlayed && !loop)) return;

        const audioBlob = audiosBlobs[audios[0].id];

        if (audioBlob) {
            audio.src = audioBlob;
            audio.loop = loop;

            if (isPlaying) {
                audio.play();
            } else {
                audio.pause();
            }

            audio.onended = () => {
                if (!loop) {
                    setHasPlayed(true);
                }
            };
        }

        return () => {
            if (audio) {
                audio.pause();
                audio.src = "";
            }
        };
    }, [audios, audiosBlobs, isPlaying, hasPlayed, loop]);

    return <audio ref={audioRef} style={{ display: "none" }} />;
};
