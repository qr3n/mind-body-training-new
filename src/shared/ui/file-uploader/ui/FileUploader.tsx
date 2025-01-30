'use client';

import { Noop, RefCallBack } from "react-hook-form";
import { ReactElement, useRef, useState } from "react";
import useRipple from "use-ripple-hook";
import { Input } from "@/shared/shadcn/ui/input";
import { AnimatePresence } from "framer-motion";
import clsx from "clsx";
import toast from "react-hot-toast";

export const FileUploader = (props: {
    type: 'video' | 'image' | 'audio',
    fieldProps: {
        onBlur: Noop,
        disabled?: boolean,
        name: "video" | "image" | "audio",
        ref: RefCallBack
    },
    onChange: (file: File | null) => void,
    children: ReactElement | ReactElement[]
}) => {
    const ref = useRef<HTMLInputElement>(null);
    const [rippleRef, event] = useRipple({
        color: '#c2d6ff'
    });
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files.length) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith(props.type)) {
                props.onChange(file);
            } else {
                toast.error('Неверный тип файла.')
            }
        }
    };

    return (
        <div
            className={clsx(
                'relative active:scale-95 transition-all will-change-transform border rounded-xl',
                { 'border border-dashed rounded-xl border-blue-500 bg-blue-100': isDragOver }
            )}
            onDragEnter={() => setIsDragOver(true)}
            onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
        >
            <Input
                {...props.fieldProps}
                placeholder="Видео"
                type="file"
                className='hidden'
                accept={`${props.type}/*`}
                onChange={(event) =>
                    event?.target?.files?.length !== 0 && props.onChange(event.target.files && event.target.files[0])
                }
                ref={ref}
            />

            <AnimatePresence mode={'wait'}>
                {props.children}
            </AnimatePresence>

            <div
                ref={rippleRef}
                onMouseDown={event}
                onClick={() => ref.current?.click()}
                className='cursor-pointer rounded-2xl top-0 left-0 w-full h-full opacity-50 absolute'
            ></div>
        </div>
    );
};
