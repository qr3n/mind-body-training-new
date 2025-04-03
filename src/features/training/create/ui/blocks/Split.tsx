import { DraggableChildProps, DraggableList } from "@/shared/ui/draggable-list";
import { useAtom } from "jotai/index";
import {
    childBlocksAtomFamily, createTrainingShowBlockPreview, createTrainingShowBlockQty, repsQtyCountAtomFamily,
} from "@/features/training/create/model";
import { Block } from "@/features/training/create/ui/templates/Block";
import React from "react";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";
import { ChooseSecondLevelBlockForRender } from "@/features/training/create/ui/blocks/ChooseBlockForRender";
import { Button } from "@/shared/shadcn/ui/button";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { AnimatedCheckbox } from "@/shared/ui/animated-checkbox";

export const Split = (props: DraggableChildProps) => {
    const [childIds, setChildIds] = useAtom(childBlocksAtomFamily(props.id));
    const [count, setCount] = useAtom(repsQtyCountAtomFamily(props.id))
    const [showBlockPreview, setShowBlockPreview] = useAtom(createTrainingShowBlockPreview(props.id))
    const [showBlockQty, setShowBlockQty] = useAtom(createTrainingShowBlockQty(props.id))

    return (
        <Block
            color="white"
            level='first'
            label={'SPLIT'}
            {...props}
        >
            <CreateTrainingTemplates.BlockSounds type={'sounds'} id={props.id}/>
            <div className='flex gap-3'>
                <h1 className='text-xl ml-4 font-medium  pt-8'>Выбор кол-ва подходов

                </h1>
                <div className='ml-4 mt-4 mb-6 text-[#777] flex items-center gap-2 text-sm'>
                    <h1>Кол-во подходов</h1>
                    <div className='py-2 px-3 border-blue-500 text-blue-500 rounded-xl border-2 font-semibold'>
                        {count}
                    </div>

                    <div className='flex flex-col'>
                        <Button variant='ghost' size='icon' onClick={() => setCount(prev => prev + 1)}>
                            <FaChevronUp className='text-blue-500 w-4 h-4'/>
                        </Button>
                        <Button variant='ghost' size='icon'
                                onClick={() => setCount(prev => prev > 0 ? prev - 1 : prev)}>
                            <FaChevronDown className='text-blue-500 w-4 h-4'/>
                        </Button>
                    </div>
                </div>

                <div className='flex ml-12 items-center justify-center gap-2'>
                    <h1>Выводить слайд &#34;Кол-во подходов&#34;</h1>
                    <AnimatedCheckbox checked={showBlockQty} onChangeValue={() => setShowBlockQty(prev => !prev)}/>
                </div>

                <div className='flex ml-12 items-center justify-center gap-2'>
                    <h1>Выводить слайд &#34;Сплит&#34;</h1>
                    <AnimatedCheckbox checked={showBlockPreview} onChangeValue={() => setShowBlockPreview(prev => !prev)}/>
                </div>
            </div>

            <CreateTrainingTemplates.BlockSounds type={'reps_qty'} id={props.id}/>
            <CreateTrainingTemplates.AddBlocks blockName={'SPLIT'} blocksTypes={['splitApproach']} parentId={props.id}
                                               level={'second'}/>
            <div className='py-2'/>

            <DraggableList
                blocksIds={childIds}
                setBlocksIds={setChildIds}
                renderElement={ChooseSecondLevelBlockForRender}
            />
        </Block>
    );
};