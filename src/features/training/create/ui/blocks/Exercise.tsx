import { DraggableChildProps } from "@/shared/ui/draggable-list";
import { useAtom, useAtomValue } from "jotai/index";
import {
    createTrainingSecondLevelBlocksAtomFamily,
    createTrainingThirdLevelBlocksAtomFamily, slideDurationAtomFamily
} from "@/features/training/create/model";
import { Block } from "@/features/training/create/ui/templates/Block";
import React from "react";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";

export const Exercise = (props: DraggableChildProps) => {
    const [slideDuration, setSlideDuration] = useAtom(slideDurationAtomFamily(props.id))

    const block = useAtomValue(
        props.level === "third"
            ? createTrainingThirdLevelBlocksAtomFamily(props.id)
            : createTrainingSecondLevelBlocksAtomFamily(props.id)
    );

    return (
        <Block
            parentId={block?.parentId}
            color="white"
            level='third'
            label="EXERCISE"
            {...props}
        >
            <div>
                <div>
                    <CreateTrainingTemplates.BlockSounds id={props.id}/>
                    <CreateTrainingTemplates.BlockSounds id={props.id} isEnd/>
                    <CreateTrainingTemplates.BlockVideos blockId={props.id}/>
                </div>
                <div className='flex justify-end'>
                    <div className='flex gap-4 items-center ml-4 mt-6 text-[#777] w-max mb-4'>
                        <p className='text-sm mt-1'>Длительность слайда</p>
                        <input
                            value={slideDuration.toString()}
                            onChange={v => setSlideDuration(Number(v.target.value))}
                            className='w-10 h-10 text-blue-500 border-2 border-blue-500 text-center text-sm flex items-center justify-center font-bold rounded-xl'/>
                        <p className='text-sm mt-1'>сек</p>
                    </div>
                </div>
            </div>
        </Block>
    );
};