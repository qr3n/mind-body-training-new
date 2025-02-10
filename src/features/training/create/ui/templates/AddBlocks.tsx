'use client';

import { Button } from "@/shared/shadcn/ui/button";
import { TBlockType } from "@/entities/training";
import { useSetAtom } from "jotai/index";
import { addCreateTrainingBlock } from "@/features/training/create/model";
import { useCallback } from "react";
import { PlusIcon } from "lucide-react";


export const AddBlocks = (props: {
    blocksTypes: TBlockType[],
    level?: 'first' | 'second' | 'third',
    parentId?: string,
    isTransparent?: boolean
}) => {
    const addBlock = useSetAtom(addCreateTrainingBlock);

    const handleClick = useCallback((type: TBlockType) => {
        console.log({
            level: props.level || 'first',
            parentId: props.parentId,
            newBlock: { type, parentId: props.parentId }
        })

        addBlock({
            level: props.level || 'first',
            parentId: props.parentId,
            newBlock: { type, parentId: props.parentId }
        })
    }, [addBlock, props])

    return (
        <div className='flex gap-2 flex-wrap sticky top-0 bg'>
            {props.blocksTypes.map(t =>
                <Button
                    variant='ghost'
                    className={`border border-transparent hover:border-blue-500 hover:bg-blue-100 flex gap-2 py-5 ${props.isTransparent ? '' : 'bg-blue-50'}`} onClick={() => handleClick(t)} key={t}>
                    <div
                        className='w-7 h-7 p-0 bg-blue-500 flex items-center justify-center hover:bg-blue-600 rounded-full'>
                        <PlusIcon className='w-5 h-5 text-white'/>
                    </div>
                    <span>{t.toUpperCase()}</span>
                </Button>
            )}
        </div>
    )
}