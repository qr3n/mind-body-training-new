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


const blocksMap: {
    ascet: (props: DraggableChildProps) => JSX.Element;
    circle: (props: DraggableChildProps) => JSX.Element;
    done: (props: DraggableChildProps) => JSX.Element;
    exercise: (props: DraggableChildProps) => JSX.Element;
    greeting: (props: DraggableChildProps) => JSX.Element;
    phrase: (props: DraggableChildProps) => JSX.Element;
    rest: (props: DraggableChildProps) => JSX.Element;
    split: (props: DraggableChildProps) => JSX.Element;
    stretch: (props: DraggableChildProps) => JSX.Element;
    testing: (props: DraggableChildProps) => JSX.Element;
    warmup: (props: DraggableChildProps) => JSX.Element;
    secondLevelCircle: (props: DraggableChildProps) => JSX.Element;
    splitApproach: (props: DraggableChildProps) => JSX.Element
}  = {
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
    secondLevelCircle: CreateTrainingBlocks.SecondLevelCircle,
    splitApproach: CreateTrainingBlocks.SplitApproach
}

const ChooseBlockForRender = (props: IChooseBlockForRenderProps) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
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
