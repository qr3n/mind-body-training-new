import { useCallback } from "react";
import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import { useAtom } from "jotai/index";
import { currentBlockIndexAtomFamily } from "@/features/training/watch/model/atoms";

export const useCurrentBlockStep = (props: IWatchTrainingBlockProps, isCircle?: boolean) => {
    const [currentStep, setCurrentStep] = useAtom(currentBlockIndexAtomFamily(props.block.id || (props.block.type + props.block.slideDuration + props.block.videos)));

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

        else {
            if (props.prevStep) props.prevStep()
        }
    }, [currentStep]);

    return {
        currentStep,
        handleNext,
        handlePrev
    }
}
