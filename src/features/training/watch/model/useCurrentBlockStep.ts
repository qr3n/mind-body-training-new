import { useCallback, useState } from "react";
import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";

export const useCurrentBlockStep = (props: IWatchTrainingBlockProps) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = useCallback(() => {
        const totalLength = props.block.content ? 1 + props.block.content.reduce(
            (sum, item) => sum + 1 + (item.content?.length || 0),
            0
        ) : 1

        if (currentStep < totalLength - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            props.onComplete();
        }
    }, [currentStep, props])

    const handlePrev = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }

        // else {
        //     props.previousBlock()
        // }
    }, [currentStep]);

    return {
        currentStep,
        handleNext,
        handlePrev
    }
}