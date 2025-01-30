import React, { memo, useEffect, useRef, useState } from "react";

interface CanvasVideoPlayerProps {
    src: string;
    preview?: string;
    isPlaying?: boolean;
    onVideoEnd?: () => void;
    onTimeUpdate?: (currentTime: number) => void; // Добавим этот пропс для onTimeUpdate
    width: number;
}

export const CanvasVideoPlayer: React.FC<CanvasVideoPlayerProps> = memo(
    ({ src, preview, isPlaying, onVideoEnd, onTimeUpdate }) => {
        const videoRef = useRef<HTMLVideoElement | null>(null);
        const canvasRef = useRef<HTMLCanvasElement | null>(null);
        const animationFrameIdRef = useRef<number | null>(null);

        const [imageLoaded, setImageLoaded] = useState(false);
        const previewImageRef = useRef<HTMLImageElement | null>(null);

        useEffect(() => {
            if (preview) {
                const img = new Image();
                img.src = preview;
                img.onload = () => {
                    previewImageRef.current = img;
                    setImageLoaded(true);
                };
            }
        }, [preview]);

        useEffect(() => {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (!video || !canvas) return;

            if (onVideoEnd) video.onended = onVideoEnd;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            if (video.videoWidth && video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            const drawFrame = () => {
                if (!video.paused && !video.ended) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    animationFrameIdRef.current = requestAnimationFrame(drawFrame);
                }
            };

            // Добавляем обработчик timeupdate, который будет вызываться каждый раз, когда текущее время видео обновляется
            const handleTimeUpdate = () => {
                if (onTimeUpdate && video) {
                    onTimeUpdate(video.currentTime); // Передаем текущее время в родительский компонент
                }
            };

            if (isPlaying) {
                video.play().catch(console.error);
                animationFrameIdRef.current = requestAnimationFrame(drawFrame);
                video.addEventListener("timeupdate", handleTimeUpdate); // Подписываемся на timeupdate
            } else {
                video.pause();
                if (animationFrameIdRef.current) {
                    cancelAnimationFrame(animationFrameIdRef.current);
                    animationFrameIdRef.current = null;
                }

                if (imageLoaded && previewImageRef.current) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(previewImageRef.current, 0, 0, canvas.width, canvas.height);
                } else {
                    // Когда превью не задано, рисуем последний кадр видео
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }
            }

            return () => {
                if (animationFrameIdRef.current) {
                    cancelAnimationFrame(animationFrameIdRef.current);
                }
                video.removeEventListener("timeupdate", handleTimeUpdate); // Убираем слушатель при размонтировании
            };
        }, [isPlaying, imageLoaded, onVideoEnd, onTimeUpdate]);

        return (
            <div className="bg-gray-100 relative sm:rounded-2xl aspect-video max-w-[1200px]">
                <video
                    ref={videoRef}
                    src={src}
                    style={{ display: "none" }}
                    crossOrigin="anonymous"
                />
                <canvas
                    className="absolute top-0 left-0 sm:rounded-2xl w-full h-full"
                    ref={canvasRef}
                />
            </div>
        );
    }
);

CanvasVideoPlayer.displayName = "CanvasVideoPlayer";
