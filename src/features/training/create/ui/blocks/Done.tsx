import { DraggableChildProps } from "@/shared/ui/draggable-list";
import { Block } from "@/features/training/create/ui/templates/Block";
import React from "react";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";

export const Done = (props: DraggableChildProps) => {

    return (
        <Block
            color="white"
            level='first'
            label={'DONE'}
            {...props}
        >
            <CreateTrainingTemplates.BlockSounds id={props.id}/>
        </Block>
    );
};