'use client';

import { useState, useEffect, useRef, ReactElement } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type MediaProps = {
    file: File;
    type: "image" | "video" | "audio";
    videoProps?: React.VideoHTMLAttributes<HTMLVideoElement>;
    videoRef?: React.RefObject<HTMLVideoElement>;
};

export const MediaRender = ({ file, type, videoProps, videoRef }: MediaProps) => {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const [element, setElement] = useState<ReactElement | null>(null);

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);

            switch (type) {
                case "audio":
                    setElement(<audio src={url} controls />);
                    break;

                case "image":
                    setElement(
                        <Image
                            src={url}
                            alt="media"
                            width={'0'}
                            height={'0'}
                            className="w-full h-full object-cover rounded-2xl will-change-transform"
                        />
                    );
                    break;

                case "video":
                    setElement(
                        <video
                            ref={videoRef || localVideoRef}
                            src={url}
                            className="will-change-transform w-full h-full rounded-2xl"
                            {...videoProps}
                        />
                    );
                    break;
            }

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [file, type, videoProps, videoRef]);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`rounded-2xl w-full will-change-transform ${
                type !== "audio" ? "aspect-video" : ""
            }`}
        >
            {element}
        </motion.div>
    );
};
