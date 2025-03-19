import { useCallback, useEffect, useRef } from "react";
import { IWatchTrainingBlockProps } from "@/features/training/watch/ui/blocks/types";
import { useAtom } from "jotai/index";
import { allCurrentBlockIndexesIds, currentBlockIndexAtomFamily } from "@/features/training/watch/model/atoms";
import { useSetAtom } from "jotai";

interface ICurrentBlockStepData extends IWatchTrainingBlockProps {
    blocksCount: number
}

export const useCurrentBlockStepNew = (props: ICurrentBlockStepData) => {
    const setAllIds = useSetAtom(allCurrentBlockIndexesIds)
    const [currentStep, setCurrentStep] = useAtom(currentBlockIndexAtomFamily(props.block.id || (props.block.type + props.block.slideDuration + props.block.videos)));
    const throttleTimerRef = useRef<number | null>(null);

    useEffect(() => {
        setAllIds(prev => [...prev, props.block.id || (props.block.type + props.block.slideDuration + props.block.videos)])
    }, [])

    const throttle = useCallback((callback: () => void) => {
        if (throttleTimerRef.current === null) {
            callback();
            throttleTimerRef.current = window.setTimeout(() => {
                throttleTimerRef.current = null;
            }, 700);
        }
    }, []);

    const handleNext = useCallback(() => {
        throttle(() => {
            if (currentStep < props.blocksCount) {
                setCurrentStep((prev) => prev + 1);
            } else {
                props.onComplete();
            }
        });
    }, [currentStep, props.onComplete, throttle]);

    const handlePrev = useCallback(() => {
        throttle(() => {
            if (currentStep > 0) {
                setCurrentStep((prev) => prev - 1);
            }
            else if (props.prevStep) {
                props.prevStep();
            }
        });
    }, [currentStep, props.prevStep, throttle]);

    return {
        currentStep,
        handleNext,
        handlePrev
    }
}

export const useCurrentBlockStep = (props: IWatchTrainingBlockProps, isCircle?: boolean) => {
    const setAllIds = useSetAtom(allCurrentBlockIndexesIds)
    const [currentStep, setCurrentStep] = useAtom(currentBlockIndexAtomFamily(props.block.id || (props.block.type + props.block.slideDuration + props.block.videos)));
    const throttleTimerRef = useRef<number | null>(null);

    useEffect(() => {
        setAllIds(prev => [...prev, props.block.id || (props.block.type + props.block.slideDuration + props.block.videos)])
    }, [])

    const throttle = useCallback((callback: () => void) => {
        if (throttleTimerRef.current === null) {
            callback();
            throttleTimerRef.current = window.setTimeout(() => {
                throttleTimerRef.current = null;
            }, 500);
        }
    }, []);

    const handleNext = useCallback(() => {
        throttle(() => {
            const totalLength = props.block.content ? 1 + (isCircle ? props.block.content.length : 0) + props.block.content.reduce(
                (sum, item) => sum + 1 + (item.content?.length || 0),
                0
            ) : 1

            if (currentStep < totalLength - 1) {
                setCurrentStep((prev) => prev + 1);
            } else {
                props.onComplete();
            }
        });
    }, [currentStep, props, throttle]);

    const handlePrev = useCallback(() => {
        throttle(() => {
            if (currentStep > 0) {
                setCurrentStep((prev) => prev - 1);
            }
            else {
                if (props.prevStep) props.prevStep()
            }
        });
    }, [currentStep, props.prevStep, throttle]);

    return {
        currentStep,
        handleNext,
        handlePrev
    }
}