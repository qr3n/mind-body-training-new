import { DraggableChildProps } from "@/shared/ui/draggable-list";
import { Block } from "@/features/training/create/ui/templates/Block";
import React from "react";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";

export const Phrase = (props: DraggableChildProps) => {
    return (
        <Block
            color="white"
            level='first'
            label={'PHRASE'}
            {...props}
        >
            <CreateTrainingTemplates.BlockSounds id={props.id}/>
        </Block>
    );
};