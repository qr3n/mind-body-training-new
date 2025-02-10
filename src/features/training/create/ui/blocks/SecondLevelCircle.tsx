import { DraggableChildProps, DraggableList } from "@/shared/ui/draggable-list";
import { useAtom } from "jotai/index";
import {
    childBlocksAtomFamily, createTrainingSecondLevelBlocksAtomFamily,
} from "@/features/training/create/model";
import { Block } from "@/features/training/create/ui/templates/Block";
import React from "react";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";
import { ChooseThirdLevelBlockForRender } from "@/features/training/create/ui/blocks/ChooseBlockForRender";
import { useAtomValue } from "jotai";

export const SecondLevelCircle = (props: DraggableChildProps) => {
    const block = useAtomValue(createTrainingSecondLevelBlocksAtomFamily(props.id))
    const [childIds, setChildIds] = useAtom(childBlocksAtomFamily(props.id));

    return (
        <Block
            parentId={block?.parentId}
            color="gray"
            level='second'
            label={`КРУГ ${props.index + 1}`}
            {...props}
        >
            <CreateTrainingTemplates.BlockSounds id={props.id}/>
            <CreateTrainingTemplates.AddBlocks isTransparent blocksTypes={['rest', 'exercise', 'phrase']} parentId={props.id} level={'third'}/>
            <div className='py-2'/>

            <DraggableList
                blocksIds={childIds}
                setBlocksIds={setChildIds}
                renderElement={ChooseThirdLevelBlockForRender}
            />
        </Block>
    );
};