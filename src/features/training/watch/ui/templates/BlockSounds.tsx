import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import { watchTrainingAudiosBlobs, watchTrainingSpeakerVolume } from "@/features/training/watch/model";
import { ITrainingBlockWithContent } from "@/entities/training";
import { useAtomValue } from "jotai";

interface BlockSoundsProps {
    block: ITrainingBlockWithContent;
    isPlaying?: boolean;
    nextAfterComplete?: boolean;
    handleNext?: () => void;
    volume?: number;
    startDelay?: number;
    isEnding?: boolean;
}

export const BlockSounds: React.FC<BlockSoundsProps> = memo(
    ({ block, nextAfterComplete, handleNext, isPlaying = false, startDelay = 0, isEnding = false }) => {
        const audiosBlobs = useAtomValue(watchTrainingAudiosBlobs);
        const volume = useAtomValue(watchTrainingSpeakerVolume);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [isDelayed, setIsDelayed] = useState(startDelay === 0);
        const [isReady, setIsReady] = useState(false);
        const audioRef = useRef<HTMLAudioElement | null>(null);
        const componentIdRef = useRef(`block-sounds-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

        // Мемоизируем аудио-источники для предотвращения лишних ререндеров
        const audioSources = useMemo(() => {
            const audios = isEnding ? block.ending ?? [] : block.audios;
            return audios.map(audio => audiosBlobs[audio.id]).filter(Boolean);
        }, [block, audiosBlobs, isEnding]);

        // Инициализация компонента
        useEffect(() => {
            console.log(`[${componentIdRef.current}] Component mounted`, {
                blockId: block.id,
                audioSources: audioSources.length
            });

            // Создаем аудио элемент при монтировании компонента
            if (!audioRef.current) {
                audioRef.current = new Audio();
                audioRef.current.volume = volume;
                console.log(`[${componentIdRef.current}] Audio element created`);
            }

            setIsReady(true);

            return () => {
                console.log(`[${componentIdRef.current}] Component unmounted`);
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = "";
                    audioRef.current.onended = null;
                    audioRef.current.ontimeupdate = null;
                    audioRef.current = null;
                }
            };
        }, []);

        // Обработка задержки перед началом воспроизведения
        useEffect(() => {
            if (startDelay > 0 && !isDelayed) {
                console.log(`[${componentIdRef.current}] Starting delay timer: ${startDelay}ms`);
                const timer = setTimeout(() => {
                    console.log(`[${componentIdRef.current}] Delay timer completed`);
                    setIsDelayed(true);
                }, startDelay);

                return () => clearTimeout(timer);
            }
        }, [startDelay, isDelayed]);

        // Обработка изменения громкости
        useEffect(() => {
            if (audioRef.current) {
                audioRef.current.volume = volume;
                console.log(`[${componentIdRef.current}] Volume updated: ${volume}`);
            }
        }, [volume]);

        // Обработка изменения источников аудио
        useEffect(() => {
            console.log(`[${componentIdRef.current}] Audio sources changed`, {
                count: audioSources.length,
            });

            // Сбрасываем индекс при изменении источников
            setCurrentIndex(0);
        }, [audioSources]);

        // Основная логика воспроизведения аудио
        useEffect(() => {
            if (!isReady || !audioRef.current || audioSources.length === 0 || !isDelayed) {
                console.log(`[${componentIdRef.current}] Skipping audio playback`, {
                    isReady,
                    hasAudioRef: !!audioRef.current,
                    audioSourcesLength: audioSources.length,
                    isDelayed
                });
                return;
            }

            const audio = audioRef.current;
            const currentAudioSrc = audioSources[currentIndex];

            // Проверка и установка источника аудио
            if (audio.src !== currentAudioSrc) {
                console.log(`[${componentIdRef.current}] Setting new audio source`, {
                    index: currentIndex,
                    oldSrc: audio.src,
                    newSrc: currentAudioSrc
                });

                audio.src = currentAudioSrc;
                audio.currentTime = 0;
            }

            // Настройка обработчиков событий
            const handleEnded = () => {
                console.log(`[${componentIdRef.current}] Audio ended`, { index: currentIndex });

                if (currentIndex < audioSources.length - 1) {
                    setCurrentIndex(prevIndex => prevIndex + 1);
                } else if (nextAfterComplete && handleNext) {
                    console.log(`[${componentIdRef.current}] All audios completed, calling handleNext`);
                    handleNext();
                }
            };

            audio.onended = handleEnded;

            // Воспроизведение или пауза в зависимости от пропса isPlaying
            if (isPlaying) {
                console.log(`[${componentIdRef.current}] Playing audio`, {
                    index: currentIndex,
                    src: audio.src
                });

                audio.play()
                    .then(() => console.log(`[${componentIdRef.current}] Started playing successfully`))
                    .catch(err => console.error(`[${componentIdRef.current}] Error playing audio:`, err));
            } else {
                console.log(`[${componentIdRef.current}] Pausing audio`);
                audio.pause();
            }

            return () => {
                // Очистка обработчиков при размонтировании или обновлении зависимостей
                audio.onended = null;
            };
        }, [audioSources, currentIndex, isPlaying, isDelayed, isReady, nextAfterComplete, handleNext]);

        return <audio ref={audioRef} style={{ display: "none" }} />;
    }
);

BlockSounds.displayName = "BlockSounds";