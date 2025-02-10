import { DraggableChildProps } from "@/shared/ui/draggable-list";
import { Block } from "@/features/training/create/ui/templates/Block";
import React from "react";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";
import { useAtomValue } from "jotai/index";
import {
    createTrainingFirstLevelBlocksAtomFamily,
    createTrainingSecondLevelBlocksAtomFamily,
    createTrainingThirdLevelBlocksAtomFamily
} from "@/features/training/create/model";

export const Phrase = (props: DraggableChildProps) => {
    const block = useAtomValue(
        props.level === "second"
            ? createTrainingSecondLevelBlocksAtomFamily(props.id)
            : props.level === 'third' ? createTrainingThirdLevelBlocksAtomFamily(props.id)
                : createTrainingFirstLevelBlocksAtomFamily(props.id)
    );

    return (
        <Block
            parentId={block?.parentId}
            color="white"
            level={props.level}
            label={'PHRASE'}
            {...props}
        >
            <CreateTrainingTemplates.BlockSounds id={props.id}/>
        </Block>
    );
};