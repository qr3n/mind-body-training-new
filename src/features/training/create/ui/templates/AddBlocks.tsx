'use client';

import { Button } from "@/shared/shadcn/ui/button";
import { TBlockType } from "@/entities/training";
import { useSetAtom } from "jotai/index";
import { addCreateTrainingBlock, newCreateTrainingAddBlocksMode } from "@/features/training/create/model";
import { useCallback, useEffect, useRef, useState } from "react";
import { PlusIcon } from "lucide-react";
import { useAudios } from "@/entities/audio";
import { useQuery } from "@tanstack/react-query";
import { audioService } from "@/shared/api/services/audio";
import { useAtomValue } from "jotai";

const useTopIntersection = () => {
    const [isAtTop, setIsAtTop] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsAtTop(entry.boundingClientRect.top <= 0);
            },
            { threshold: [0], rootMargin: "0px 0px -99% 0px"}
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return { ref, isAtTop };
};

export const AddBlocks = (props: {
    blocksTypes: TBlockType[],
    level?: 'first' | 'second' | 'third',
    parentId?: string,
    isTransparent?: boolean,
    blockName?: string
}) => {
    const newMode = useAtomValue(newCreateTrainingAddBlocksMode)
    const { data } = useAudios();
    const { data: phrases } = useQuery({
        queryFn: audioService.getPhrases,
        queryKey: ['phrases'],
        retryOnMount: false,
        refetchOnMount: false
    })
    const addBlock = useSetAtom(addCreateTrainingBlock);
    const { ref, isAtTop } = useTopIntersection();

    const handleClick = useCallback((type: TBlockType) => {
        addBlock({
            level: props.level || 'first',
            parentId: props.parentId,
            newBlock: { type, parentId: props.parentId },
            allAudios: data,
            phrases
        })
    }, [addBlock, props])

    return (
        <div ref={ref} className='h-[84px] relative'>
            <div
                className='flex gap-2 w-full flex-wrap items-center transition-colors'
                style={newMode ? {
                    background: isAtTop ? 'white' : 'transparent',
                    position: isAtTop ? 'fixed' : 'relative',
                    top: isAtTop ? '80px' : 'auto',
                    left: isAtTop ? '0' : 'auto',
                    paddingTop: isAtTop ? '12px' : 'auto',
                    paddingBottom: isAtTop ? '12px' : 'auto',
                    zIndex: isAtTop ? '50' : '10'
                } : {
                    position: 'relative',
                }}
            >
                {newMode && isAtTop && <h1 className='text-2xl pl-6 pr-3 font-semibold'>{props.blockName}</h1>}
                {props.blocksTypes.map(t =>
                    <Button
                        variant='ghost'
                        className={`border border-transparent hover:border-blue-500 hover:bg-blue-100 flex gap-2 py-5 ${props.isTransparent ? '' : 'bg-blue-50'}`}
                        onClick={() => handleClick(t)} key={t}>
                        <div
                            className='w-7 h-7 p-0 bg-blue-500 flex items-center justify-center hover:bg-blue-600 rounded-full'>
                            <PlusIcon className='w-5 h-5 text-white'/>
                        </div>
                        <span>{t.toUpperCase()}</span>
                    </Button>
                )}
            </div>
        </div>
    )
}