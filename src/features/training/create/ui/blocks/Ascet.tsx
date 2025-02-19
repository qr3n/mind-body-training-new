import { DraggableChildProps, DraggableList } from "@/shared/ui/draggable-list";
import { useAtom } from "jotai/index";
import {
    childBlocksAtomFamily,
} from "@/features/training/create/model";
import { Block } from "@/features/training/create/ui/templates/Block";
import React from "react";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";
import { ChooseSecondLevelBlockForRender } from "@/features/training/create/ui/blocks/ChooseBlockForRender";

export const Ascet = (props: DraggableChildProps) => {
    const [childIds, setChildIds] = useAtom(childBlocksAtomFamily(props.id));

    return (
        <Block
            color="white"
            level='first'
            label={'ASCET'}
            {...props}
        >
            <CreateTrainingTemplates.BlockSounds type={'sounds'} id={props.id}/>
            <CreateTrainingTemplates.AddBlocks blocksTypes={['rest', 'exercise', 'phrase']} parentId={props.id} level={'second'}/>
            <div className='py-2'/>
            <DraggableList
                blocksIds={childIds}
                setBlocksIds={setChildIds}
                renderElement={ChooseSecondLevelBlockForRender}
            />
        </Block>
    );
};