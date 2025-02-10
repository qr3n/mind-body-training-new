import { ITrainingBlockWithContent } from "@/entities/training";

export interface IWatchTrainingBlockProps {
    block: ITrainingBlockWithContent,
    onComplete: () => void,
    prevStep?: () => void,
    step: number
}