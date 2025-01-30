import { TBlockType }           from "@/entities/training";
import { memo, ReactElement }   from "react";
import { CreateTrainingBlocks } from "../blocks";
import { DraggableChildProps } from "@/shared/ui/draggable-list";
import { useAtomValue } from "jotai/index";
import {
    createTrainingFirstLevelBlocksAtomFamily,
    createTrainingSecondLevelBlocksAtomFamily, createTrainingThirdLevelBlocksAtomFamily
} from "@/features/training/create/model";

interface IChooseBlockForRenderProps extends DraggableChildProps {
    type: TBlockType,
}


const blocksMap: Record<TBlockType, (props: DraggableChildProps) => ReactElement>  = {
    ascet: CreateTrainingBlocks.Ascet,
    circle: CreateTrainingBlocks.Circle,
    done: CreateTrainingBlocks.Done,
    exercise: CreateTrainingBlocks.Exercise,
    greeting: CreateTrainingBlocks.Greetings,
    phrase: CreateTrainingBlocks.Phrase,
    rest: CreateTrainingBlocks.Rest,
    split: CreateTrainingBlocks.Split,
    stretch: CreateTrainingBlocks.Stretch,
    testing: CreateTrainingBlocks.Testing,
    warmup: CreateTrainingBlocks.Warmup,
    secondLevelCircle: CreateTrainingBlocks.SecondLevelCircle
}

const ChooseBlockForRender = (props: IChooseBlockForRenderProps) => {
    const Component = blocksMap[props.type]

    return (
        <>
            <Component {...props}/>
        </>
    )
}

export const ChooseFirstLevelBlockForRender = memo((props: DraggableChildProps) => {
    const block = useAtomValue(createTrainingFirstLevelBlocksAtomFamily(props.id));

    return block ? (
        <ChooseBlockForRender {...props} type={block.type} level={'first'}/>
    ) : (
        <div>Ошибка рендеринга</div>
    )
})

ChooseFirstLevelBlockForRender.displayName = 'ChooseFirstLevelBlockForRender'

export const ChooseSecondLevelBlockForRender = memo((props: DraggableChildProps) => {
    const block = useAtomValue(createTrainingSecondLevelBlocksAtomFamily(props.id));

    return block ? (
        <ChooseBlockForRender {...props} type={block.type} level={'second'}/>
    ) : (
        <div>Ошибка рендеринга</div>
    )
})

ChooseSecondLevelBlockForRender.displayName = 'ChooseSecondLevelBlockForRender'

export const ChooseThirdLevelBlockForRender = memo((props: DraggableChildProps) => {
    const block = useAtomValue(createTrainingThirdLevelBlocksAtomFamily(props.id));

    return block ? (
        <ChooseBlockForRender {...props} type={block.type} level={'third'}/>
    ) : (
        <div>Ошибка рендеринга</div>
    )
})

ChooseThirdLevelBlockForRender.displayName = 'ChooseThirdLevelBlockForRender'
