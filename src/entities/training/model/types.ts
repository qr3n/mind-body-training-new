export type IBlockType =
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

export interface ITrainingAudio {
    id: string,
}

export interface ITrainingVideo {
    id: string
}

export interface ITrainingTestQuestion {
    label: string,
    checked: boolean
}

export interface ITrainingBlockTemplate<D extends IBlockType> {
    parentId?: string,
    type: D,
}


export interface IGreetings extends ITrainingBlockTemplate<'greeting'> {
    title: string,
    subtitle: string,
    imageURL: string,
}


export interface IAscet extends ITrainingBlockTemplate<'ascet'> {
    audios: ITrainingAudio[]
}

export interface ICircle extends ITrainingBlockTemplate<'circle'> {
    audios: ITrainingAudio[]
}

export interface ISplit extends ITrainingBlockTemplate<'split'> {
    audios: ITrainingAudio[]
}

export interface IWarmup extends ITrainingBlockTemplate<'warmup'> {
    audios: ITrainingAudio[]
}

export interface IStretch extends ITrainingBlockTemplate<'stretch'> {
    audios: ITrainingAudio[]
}

export interface ITesting extends ITrainingBlockTemplate<'testing'> {
    questions: ITrainingTestQuestion[]
}

export interface IDone extends ITrainingBlockTemplate<'done'> {
    audios: ITrainingAudio[]
}

export type ISecondLevelCircle = ITrainingBlockTemplate<'secondLevelCircle'>

export interface IRest extends ITrainingBlockTemplate<'rest'> {
    audios: ITrainingAudio[],
    videos: ITrainingVideo[]
}

export interface IExercise extends ITrainingBlockTemplate<'exercise'> {
    audios: ITrainingAudio[],
    videos: ITrainingVideo[],
}

export interface IPhrase extends ITrainingBlockTemplate<'phrase'> {
    audios: ITrainingAudio[],
}

export type TTrainingBlock = IGreetings | IAscet | ICircle | ISplit | IWarmup | IStretch | ITesting | IDone | ISecondLevelCircle | IRest | IExercise | IPhrase
