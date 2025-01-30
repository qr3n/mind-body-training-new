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

export interface ICreateTrainingTrainingAudio {
    type: 'audio'
    id: string,
    blob?: string,
}

export interface ICreateTrainingTrainingPause {
    type: 'pause'
    id: string
    duration: number
}

export interface ITrainingVideo {
    id: string,
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

export type TTrainingBlock = IGreetings | IAscet | ICircle | ISplit | IWarmup | IStretch | ITesting | IDone | ISecondLevelCircle | IRest | IExercise | IPhrase
