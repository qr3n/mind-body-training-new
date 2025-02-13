'use client';

import React, { memo, PropsWithChildren, ReactElement, useCallback, useEffect, useState } from 'react';
import {
    DraggableProvidedDragHandleProps
}                                            from "@hello-pangea/dnd";
import { useSetAtom } from "jotai";
import {
    copyCreateTrainingBlock,
    removeCreateTrainingBlock
} from "@/features/training/create/model";
import {
    Button
}                                                                                         from "@/shared/shadcn/ui/button";
import {
    FaChevronDown,
    FaChevronUp,
    FaRegCopy
}                                                                                         from "react-icons/fa6";
import {
    RiDeleteBinLine
}                                                                                         from "react-icons/ri";
import { motion }                                                                         from 'framer-motion';
import { useVideos }                                                                      from "@/entities/video";


type TColor = 'white' | 'gray';

interface IProps extends PropsWithChildren {
    id: string,
    parentId?: string,
    level?: 'first' | 'second' | 'third',
    color: TColor;
    label: string;
    dragHandleProps: DraggableProvidedDragHandleProps | null;
    isDragging: boolean;
    isDimmed: boolean;
    header?: ReactElement
}

const colorsMap: Record<TColor, string> = {
    white: '#ffffff',
    gray: '#F6F7F8FF',
};

export const Block = memo(({ id, parentId, color, level, label, dragHandleProps, isDragging, isDimmed, header, children }: IProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false); // Состояние сворачивания
    const [shouldUnmountChildren, setShouldUnmountChildren] = useState(false); // Состояние для размонтирования
    const removeBlock = useSetAtom(removeCreateTrainingBlock);
    const copyBlock = useSetAtom(copyCreateTrainingBlock)
    const { data } = useVideos()

    const handleDelete = useCallback(() => {
        removeBlock({
            blockId: id,
            level: level || 'first',
            parentId,
            allVideos: data || []
        });
    }, [data, id, level, parentId, removeBlock])

    const handleCopy = useCallback(() => {
        copyBlock({
            blockId: id,
            level: level || 'first',
            parentId
        }, copyBlock)
    }, [copyBlock, id, level, parentId])

    const toggleCollapse = useCallback(() => {
        setIsCollapsed(prev => {
            if (!prev) {
                setShouldUnmountChildren(false);
            }
            return !prev;
        });
    }, [])

    useEffect(() => {
        if (isCollapsed) {
            // Запустить таймер после начала сворачивания для размонтирования
            const timer = setTimeout(() => setShouldUnmountChildren(true), 300); // Задержка должна быть равна времени анимации
            return () => clearTimeout(timer); // Очистка таймера при размонтировании компонента
        } else {
            setShouldUnmountChildren(false); // Если блок разворачивается, восстановить children
        }
    }, [isCollapsed]);

    return (
        <div
            style={{
                background: colorsMap[color],
                opacity: isDragging ? 1 : isDimmed ? 0.5 : 1,
                transition: 'opacity 0.3s ease',
                borderColor: isDragging ? 'lightblue' : 'transparent'
            }}
            className="rounded-2xl shadow-lg h-full overflow-hidden border"
        >
            <div
                className="rounded-t-2xl relative cursor-pointer flex justify-end items-center"
            >
                <div {...dragHandleProps}
                     className='absolute transition-all gap-4 rounded-t-2xl flex items-center z-10 hover:bg-blue-50 active:bg-blue-100 w-full px-6 py-4 left-0 top-0'>
                    <h1 className='text-2xl text-black font-semibold'>{label.toUpperCase()}</h1>
                    {header}
                </div>

                <div className='flex items-center z-40 justify-center p-4'>
                    <Button variant='ghost' size='icon' onClick={handleCopy}>
                        <FaRegCopy className='text-blue-500'/>
                    </Button>
                    <Button variant='ghost' size='icon' onClick={handleDelete}>
                        <RiDeleteBinLine className='text-blue-500'/>
                    </Button>
                    <Button variant='ghost' size='icon' onClick={toggleCollapse}>
                        {isCollapsed ? <FaChevronDown className='text-blue-500' /> : <FaChevronUp className='text-blue-500' />}
                    </Button>
                </div>
            </div>

            <motion.div
                className="px-6 py-4 text-black"
                initial={{ opacity: 1, height: 'auto' }}
                animate={{
                    opacity: isCollapsed ? 0 : 1,
                    height: isCollapsed ? 0 : 'auto',
                    paddingTop: isCollapsed ? 0 : '1rem',
                    paddingBottom: isCollapsed ? 0 : '1rem',
                }}
                transition={{
                    opacity: { duration: 0.3 },
                    height: { duration: 0.3 },
                    paddingTop: { duration: 0.3 },
                    paddingBottom: { duration: 0.3 },
                }}
                style={{ overflow: 'hidden' }}
            >
                {!shouldUnmountChildren && children}
            </motion.div>
        </div>
    );
});

Block.displayName = 'Block'
