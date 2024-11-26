import { useSetAtom } from "jotai/index";
import {
    addCreateTrainingBlock,
    createTrainingFirstLevelBlocksAtomFamily,
    createTrainingSecondLevelBlocksAtomFamily, createTrainingThirdLevelBlocksAtomFamily
} from "./atoms";
import { useAtomValue } from "jotai";

export const useAddCreateTrainingBlock = () => useSetAtom(addCreateTrainingBlock)
export const useFirstLevelCreateTrainingBlocks = (id: string) => useAtomValue(createTrainingFirstLevelBlocksAtomFamily(id))
export const useSecondLevelCreateTrainingBlocks = (id: string) => useAtomValue(createTrainingSecondLevelBlocksAtomFamily(id))
export const useThirdLevelCreateTrainingBlocks = (id: string) => useAtomValue(createTrainingThirdLevelBlocksAtomFamily(id))
