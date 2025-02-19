import { WatchTrainingTemplate } from "@/features/training/watch/ui/templates";
import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";

export const LapsQty = (props: IWatchTrainingBlockProps) => {
    return (
        <WatchTrainingTemplate.BlockQty {...props} variant={'laps'}/>
    )
}