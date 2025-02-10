'use client';

import { useState, useEffect, useRef, ReactElement } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type MediaProps = {
    file?: File;
    src?: string;
    type: "image" | "video" | "audio";
    videoProps?: React.VideoHTMLAttributes<HTMLVideoElement>;
    videoRef?: React.RefObject<HTMLVideoElement>;
};

export const MediaRender = ({ file, src, type, videoProps, videoRef }: MediaProps) => {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const [url, setUrl] = useState<string | null>(null);

    // Создаем URL для File, если он есть
    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (src) {
            setUrl(src);
        }
    }, [file, src]);

    useEffect(() => {
        if (videoRef?.current && localVideoRef.current) {
            // videoRef.current = localVideoRef.current;
        }
    }, [url, videoRef]);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`rounded-2xl w-full will-change-transform ${
                type !== "audio" ? "aspect-video" : ""
            }`}
        >
            {type === "audio" && url && <audio src={url} controls />}
            {type === "image" && url && (
                <Image
                    src={url}
                    alt="media"
                    width={'0'}
                    height={'0'}
                    className="w-full h-full object-cover rounded-2xl will-change-transform"
                />
            )}
            {type === "video" && url && (
                <video
                    ref={videoRef || localVideoRef}
                    src={url}
                    className="will-change-transform w-full h-full rounded-2xl"
                    {...videoProps}
                />
            )}
        </motion.div>
    );
};
