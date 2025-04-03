import { DraggableChildProps, DraggableList } from "@/shared/ui/draggable-list";
import { useAtom } from "jotai/index";
import {
    childBlocksAtomFamily,
    createTrainingShowBlockPreview,
    createTrainingShowBlockQty
} from "@/features/training/create/model";
import { Block } from "@/features/training/create/ui/templates/Block";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";
import { ChooseSecondLevelBlockForRender } from "@/features/training/create/ui/blocks/ChooseBlockForRender";
import React from "react";
import { AnimatedCheckbox } from "@/shared/ui/animated-checkbox";

export const Circle = (props: DraggableChildProps) => {
    const [childIds, setChildIds] = useAtom(childBlocksAtomFamily(props.id));
    const [showBlockPreview, setShowBlockPreview] = useAtom(createTrainingShowBlockPreview(props.id))
    const [showBlockQty, setShowBlockQty] = useAtom(createTrainingShowBlockQty(props.id))

    return (
        <Block
            color="white"
            level='first'
            label={'CIRCLE'}
            {...props}
            header={
            <div className='flex gap-4 ml-6 items-center'>
                <CreateTrainingTemplates.AddBlocks blockName={'CIRCLE'} blocksTypes={['secondLevelCircle']} parentId={props.id} level={'second'}/>
                <h1>КРУГОВ <span
                    className='font-semibold text-blue-500 text-2xl ml-1.5'>{childIds.length}</span></h1>
            </div>
            }
        >
            <CreateTrainingTemplates.BlockSounds id={props.id}/>
            <div className='flex gap-28 items-center mb-6 pt-8'>
                <h1 className='text-xl ml-4 font-medium '>Выбор кол-ва кругов</h1>
                <div className='flex items-center justify-center gap-2'>
                    <h1>Выводить слайд &#34;Выбор кол-ва кругов&#34;</h1>
                    <AnimatedCheckbox checked={showBlockQty} onChangeValue={() => setShowBlockQty(prev => !prev)}/>
                </div>

                <div className='flex items-center justify-center gap-2'>
                    <h1>Выводить заставку блока</h1>
                    <AnimatedCheckbox checked={showBlockPreview} onChangeValue={() => setShowBlockPreview(prev => !prev)}/>
                </div>
            </div>
            <CreateTrainingTemplates.BlockSounds type={'laps_qty'} id={props.id}/>

            <DraggableList
                blocksIds={childIds}
                setBlocksIds={setChildIds}
                renderElement={ChooseSecondLevelBlockForRender}
            />
        </Block>
    );
};