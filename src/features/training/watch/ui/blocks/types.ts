import { ITrainingBlockWithContent } from "@/entities/training";

export interface IWatchTrainingBlockProps {
    block: ITrainingBlockWithContent,
    onComplete: () => null,
    step: number
}