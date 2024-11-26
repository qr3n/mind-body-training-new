import React, { PropsWithChildren, useEffect } from 'react';
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

type TColor = 'white' | 'gray';

interface IProps extends PropsWithChildren {
    color: TColor;
    label: string;
    dragHandleProps: DraggableProvidedDragHandleProps | null;
    isDragging: boolean;
    isDimmed: boolean;
}

const colorsMap: Record<TColor, string> = {
    white: '#ffffff',
    gray: '#ededed',
};

export const Block = ({ color, label, dragHandleProps, isDragging, isDimmed, children }: IProps) => {
    return (
        <div
            style={{
                background: colorsMap[color],
                opacity: isDragging ? 1 : isDimmed ? 0.5 : 1,
                transition: 'opacity 0.4s ease',
            }}
            className="rounded-2xl shadow-md"
        >
            <h1
                className="rounded-t-2xl p-4 font-semibold text-black cursor-pointer hover:bg-blue-50 active:bg-blue-100"
                {...dragHandleProps}
            >
                {label}
            </h1>
            <div className="p-4 text-black">
                {children}
            </div>
        </div>
    );
};
