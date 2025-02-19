import React, { memo, useEffect, useRef, useState } from "react";

interface CanvasVideoPlayerProps {
    src: string;
    preview?: string;
    isPlaying?: boolean;
    isMuted?: boolean; // Новый проп для управления звуком
    onVideoEnd?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
    width: number;
}

export const CanvasVideoPlayer: React.FC<CanvasVideoPlayerProps> = memo(
    ({ src, preview, isPlaying, isMuted, onVideoEnd, onTimeUpdate }) => {
        const videoRef = useRef<HTMLVideoElement | null>(null);
        const canvasRef = useRef<HTMLCanvasElement | null>(null);
        const animationFrameIdRef = useRef<number | null>(null);

        const [imageLoaded, setImageLoaded] = useState(false);
        const [videoLoaded, setVideoLoaded] = useState(false);
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

            video.onloadedmetadata = () => {
                setVideoLoaded(true);
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    video.currentTime = 0;
                }
            };
        }, [src]);

        useEffect(() => {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (!video || !canvas || !videoLoaded) return;

            if (onVideoEnd) video.onended = onVideoEnd;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const drawFrame = () => {
                if (!video.paused && !video.ended) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    animationFrameIdRef.current = requestAnimationFrame(drawFrame);
                }
            };

            const handleTimeUpdate = () => {
                if (onTimeUpdate && video) {
                    onTimeUpdate(video.currentTime);
                }
            };

            if (isPlaying) {
                video.play().catch(console.error);
                animationFrameIdRef.current = requestAnimationFrame(drawFrame);
                video.addEventListener("timeupdate", handleTimeUpdate);
            } else {
                video.pause();
                if (animationFrameIdRef.current) {
                    cancelAnimationFrame(animationFrameIdRef.current);
                    animationFrameIdRef.current = null;
                }

                if (imageLoaded && previewImageRef.current) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(previewImageRef.current, 0, 0, canvas.width, canvas.height);
                }
            }

            // Устанавливаем звук на основе пропа isMuted
            if (video) {
                video.muted = isMuted ?? false;
            }

            return () => {
                if (animationFrameIdRef.current) {
                    cancelAnimationFrame(animationFrameIdRef.current);
                }
                video.removeEventListener("timeupdate", handleTimeUpdate);
            };
        }, [isPlaying, isMuted, imageLoaded, videoLoaded, onVideoEnd, onTimeUpdate]);

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
