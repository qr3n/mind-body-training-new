import { ExerciseDurations } from "@/app/trainings/[id]/utils"

export type TBlockType =
    'greeting'
    | 'ascet'
    | 'circle'
    | 'phrase'
    | 'split'
    | 'warmup'
    | 'testing'
    | 'stretch'
    | 'done'
    | 'exercise'
    | 'rest'
    | 'secondLevelCircle'
    | 'splitApproach'
    | 'lapsQty'
    | 'repsQty'
    | 'approachLabel'

export interface ITrainingAudio {
    type: 'audio'
    id: string,
    blob?: string,
    checksum?: string
}

export interface ITrainingPause {
    type: 'pause'
    id: string
    duration: number
}

export interface ITrainingVideo {
    id: string,
    type?: string,
    checksum?: string,
}

// export interface ITrainingTestQuestion {
//     label: string,
//     checked: boolean
// }

export interface ITrainingBlockTemplate<D extends TBlockType> {
    parentId?: string,
    type: D,
}


export type IGreetings = ITrainingBlockTemplate<'greeting'>

export type IAscet = ITrainingBlockTemplate<'ascet'>

export type ICircle = ITrainingBlockTemplate<'circle'>

export type ISplit = ITrainingBlockTemplate<'split'>

export type IWarmup = ITrainingBlockTemplate<'warmup'>

export type IStretch = ITrainingBlockTemplate<'stretch'>

export type ITesting = ITrainingBlockTemplate<'testing'>

export type IDone = ITrainingBlockTemplate<'done'>

export type ISecondLevelCircle = ITrainingBlockTemplate<'secondLevelCircle'>

export type IRest = ITrainingBlockTemplate<'rest'>

export type IExercise = ITrainingBlockTemplate<'exercise'>

export type IPhrase = ITrainingBlockTemplate<'phrase'>

export type ISplitApproach = ITrainingBlockTemplate<'splitApproach'>
export type ILapsQty = ITrainingBlockTemplate<'lapsQty'>
export type IRepsQty = ITrainingBlockTemplate<'repsQty'>
export type IApproachLabel = ITrainingBlockTemplate<'approachLabel'>

export type TTrainingBlock = IGreetings | IAscet | ICircle | ISplit | IWarmup | IStretch | ITesting | IDone | ISecondLevelCircle | IRest | IExercise | IPhrase | ISplitApproach | ILapsQty | IRepsQty | IApproachLabel

export interface IAnswer {
    text: string;
    isCorrect: boolean;
}

export interface ITrainingBlockWithContent {
    id?: string
    type: TBlockType
    content?: ITrainingBlockWithContent[],
    title?: string,
    description?: string,
    imageName?: string,
    videos: ITrainingVideo[]
    audios: ITrainingAudio[],
    question?: string,
    answers?: IAnswer[];
    ending?: ITrainingAudio[],
    startIn?: number,
    slideDuration?: number,
    cycleVideo?: boolean,
    inputResults?: boolean,
    useVideoAudio?: boolean,
    allTime?: number,
    repsQtyAudios?: ITrainingAudio[],
    lapsQtyAudios?: ITrainingAudio[],
    circlesTimes?: number[],
    ascetAudios?: ITrainingAudio[],
    fromTimePercent?: number,
    toTimePercent?: number,
    repsQtyCount?: number,
    approachNumber?: number,
    exerciseNumber?: number,
    exercisesInApproachCount?: number,
    setsDurations?: ExerciseDurations[]
}

export interface ITraining {
    id: string,
    title: string,
    equipment: string[],
    music_volume: number,
    speaker_volume: number,
    cycle: boolean,
    gender: 'male' | 'female',
    audio: ITrainingAudio[]
    blocks: ITrainingBlockWithContent[],
    index: number
}