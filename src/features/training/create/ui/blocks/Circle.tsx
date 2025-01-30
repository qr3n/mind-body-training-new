import { DraggableChildProps, DraggableList } from "@/shared/ui/draggable-list";
import { useAtom } from "jotai/index";
import { childBlocksAtomFamily } from "@/features/training/create/model";
import { Block } from "@/features/training/create/ui/templates/Block";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";
import { ChooseSecondLevelBlockForRender } from "@/features/training/create/ui/blocks/ChooseBlockForRender";
import React from "react";

export const Circle = (props: DraggableChildProps) => {
    const [childIds, setChildIds] = useAtom(childBlocksAtomFamily(props.id));

    return (
        <Block
            color="white"
            level='first'
            label={'CIRCLE'}
            {...props}
            header={
            <div className='flex gap-4 ml-6 items-center'>
                <CreateTrainingTemplates.AddBlocks blocksTypes={['secondLevelCircle']} parentId={props.id} level={'second'}/>
                <h1>КРУГОВ <span
                    className='font-semibold text-blue-500 text-2xl ml-1.5'>{childIds.length}</span></h1>
            </div>
            }
        >
            <CreateTrainingTemplates.BlockSounds id={props.id}/>

            <DraggableList
                blocksIds={childIds}
                setBlocksIds={setChildIds}
                renderElement={ChooseSecondLevelBlockForRender}
            />
        </Block>
    );
};