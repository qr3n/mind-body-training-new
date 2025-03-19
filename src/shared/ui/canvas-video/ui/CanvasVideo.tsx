import React, { memo, useEffect, useRef, useState } from "react";

interface CanvasVideoPlayerProps {
    src: string;
    preview?: string;
    isPlaying?: boolean;
    isMuted?: boolean;
    autoAspectRatio?: boolean;
    smallSize?: boolean;
    loop?: boolean;
    slowMotion?: boolean;
    onVideoEnd?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
    width?: number;
}

export const CanvasVideoPlayer: React.FC<CanvasVideoPlayerProps> = memo(
    ({ autoAspectRatio = true, slowMotion = false, smallSize = false, src, preview, isPlaying = false, isMuted = false, loop = false, onVideoEnd, onTimeUpdate }) => {
        const videoRef = useRef<HTMLVideoElement | null>(null);
        const canvasRef = useRef<HTMLCanvasElement | null>(null);
        const containerRef = useRef<HTMLDivElement | null>(null);
        const animationFrameIdRef = useRef<number | null>(null);
        const resizeObserverRef = useRef<ResizeObserver | null>(null);
        const lastTimeUpdateRef = useRef<number>(0);
        const startTimeRef = useRef<number>(0);
        const adjustedCurrentTimeRef = useRef<number>(0);

        const [imageLoaded, setImageLoaded] = useState(false);
        const [videoLoaded, setVideoLoaded] = useState(false);
        const [aspectRatio, setAspectRatio] = useState<number | null>(null);
        const [isMobile, setIsMobile] = useState(false);
        const previewImageRef = useRef<HTMLImageElement | null>(null);

        useEffect(() => {
            const checkMobile = () => {
                setIsMobile(window.innerWidth < 768);
            };
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return () => window.removeEventListener('resize', checkMobile);
        }, []);

        useEffect(() => {
            const video = videoRef.current;
            if (!video) return;

            // Save current playback position before changing rate
            const currentPos = video.currentTime;

            // Set playback rate based on slowMotion prop
            video.playbackRate = slowMotion ? 0.5 : 1;

            // Restore position after changing rate
            if (video.readyState >= 1) {
                video.currentTime = currentPos;
            }
        }, [slowMotion]);

        const drawToCanvas = (source: HTMLVideoElement | HTMLImageElement, isVideoSource: boolean) => {
            const canvas = canvasRef.current;
            const container = containerRef.current
            if (!canvas || !container) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const sourceWidth = isVideoSource ? (source as HTMLVideoElement).videoWidth : (source as HTMLImageElement).naturalWidth;
            const sourceHeight = isVideoSource ? (source as HTMLVideoElement).videoHeight : (source as HTMLImageElement).naturalHeight;

            const scale = Math.min(width / sourceWidth, height / sourceHeight);
            const scaledWidth = sourceWidth * scale;
            const scaledHeight = sourceHeight * scale;
            const dx = (width - scaledWidth) / 2;
            const dy = (height - scaledHeight) / 2;

            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(source, 0, 0, sourceWidth, sourceHeight, dx, dy, scaledWidth, scaledHeight);
        };

        useEffect(() => {
            const container = containerRef.current;
            if (!container) return;

            const updateCanvasSize = () => {
                if (isPlaying && videoLoaded && videoRef.current) {
                    drawToCanvas(videoRef.current, true);
                } else if (imageLoaded && previewImageRef.current) {
                    drawToCanvas(previewImageRef.current, false);
                }
            };

            resizeObserverRef.current = new ResizeObserver(updateCanvasSize);
            resizeObserverRef.current.observe(container);

            return () => {
                if (resizeObserverRef.current) {
                    resizeObserverRef.current.disconnect();
                }
            };
        }, [isPlaying, videoLoaded, imageLoaded]);

        useEffect(() => {
            if (preview) {
                const img = new Image();
                img.src = preview;
                img.onload = () => {
                    previewImageRef.current = img;
                    setImageLoaded(true);
                    if (autoAspectRatio) {
                        setAspectRatio(img.naturalHeight / img.naturalWidth);
                    }
                    if (!isPlaying && previewImageRef.current && canvasRef.current) {
                        drawToCanvas(previewImageRef.current, false);
                    }
                };
            }
        }, [preview, autoAspectRatio, isPlaying]);

        useEffect(() => {
            const video = videoRef.current;
            if (!video) return;

            video.onloadedmetadata = () => {
                setVideoLoaded(true);
                if (autoAspectRatio || smallSize) {
                    setAspectRatio(video.videoHeight / video.videoWidth);
                }
            };
        }, [src, autoAspectRatio, smallSize]);

        useEffect(() => {
            const video = videoRef.current;
            if (!video) return;

            // Reset timer references when playback state changes
            if (isPlaying) {
                startTimeRef.current = Date.now() / 1000 - (adjustedCurrentTimeRef.current || 0);
            }

            const drawFrame = () => {
                if (video.paused || video.ended) return;

                // Calculate time based on real-world clock for consistent timing
                if (isPlaying && onTimeUpdate) {
                    const now = Date.now() / 1000;
                    const realElapsedTime = now - startTimeRef.current;

                    // Only update if enough time has passed (reduces callback frequency)
                    if (now - lastTimeUpdateRef.current >= 0.25) { // Update every 250ms
                        adjustedCurrentTimeRef.current = realElapsedTime;
                        onTimeUpdate(realElapsedTime);
                        lastTimeUpdateRef.current = now;
                    }
                }

                drawToCanvas(video, true);
                animationFrameIdRef.current = requestAnimationFrame(drawFrame);
            };

            const handleVideoEnded = () => {
                if (loop) {
                    video.currentTime = 0;
                    // Reset timer references on loop
                    startTimeRef.current = Date.now() / 1000;
                    adjustedCurrentTimeRef.current = 0;
                    video.play().catch(console.error);
                } else {
                    onVideoEnd?.();
                }
            };

            if (isPlaying) {
                video.play().catch(console.error);
                animationFrameIdRef.current = requestAnimationFrame(drawFrame);
            } else {
                video.pause();
                if (animationFrameIdRef.current) {
                    cancelAnimationFrame(animationFrameIdRef.current);
                    animationFrameIdRef.current = null;
                }
                if (imageLoaded && previewImageRef.current) {
                    drawToCanvas(previewImageRef.current, false);
                }
            }

            video.muted = isMuted;
            video.addEventListener('ended', handleVideoEnded);

            return () => {
                video.removeEventListener('ended', handleVideoEnded);
                if (animationFrameIdRef.current) {
                    cancelAnimationFrame(animationFrameIdRef.current);
                }
            };
        }, [isPlaying, isMuted, loop, imageLoaded, videoLoaded, onVideoEnd, onTimeUpdate, slowMotion]);

        const containerStyle = {
            width: smallSize
                ? '240px'
                : isMobile
                    ? '100dvw'
                    : 'auto',
            height: smallSize ? `calc(100px * ${1 / (aspectRatio || 1)})` : 'auto',
            maxHeight: smallSize ? undefined : '43vh',
            aspectRatio: autoAspectRatio
                ? (aspectRatio ? `${1 / aspectRatio}` : undefined)
                : (!isMobile && !smallSize) ? '16/9' : undefined
        };

        const desktopContainerStyle = {
            width: smallSize
                ? '240px'
                : isMobile
                    ? '100dvw'
                    : aspectRatio
                        ? `calc(43dvh * ${1/aspectRatio})`
                        : 'auto',
            height: smallSize ? `calc(100px * ${1 / (aspectRatio || 1)})` : '43dvh'
        };

        return (
            <div
                ref={containerRef}
                className={`relative sm:rounded-2xl overflow-hidden sm:shadow-md ${
                    !autoAspectRatio && !isMobile ? 'aspect-video' : ''
                }`}
                style={isMobile ? containerStyle : desktopContainerStyle}
            >
                <video
                    ref={videoRef}
                    src={src}
                    style={{ display: 'none' }}
                    crossOrigin="anonymous"
                />
                <canvas
                    className="absolute top-0 left-0 w-full h-full sm:rounded-2xl"
                    ref={canvasRef}
                />
            </div>
        );
    }
);

CanvasVideoPlayer.displayName = 'CanvasVideoPlayer';