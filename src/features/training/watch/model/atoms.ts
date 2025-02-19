import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export const watchTrainingVideosBlobs = atom<Record<string, string>>({})
export const watchTrainingAudiosBlobs = atom<Record<string, string>>({})
export const watchTrainingSpeakerVolume = atom(0)
export const watchTrainingMusicVolume = atom(0)
export const watchTrainingPlaying = atom(true)
export const watchTrainingStep = atom<number>(0)
export const watchCorrectAnswersCount = atom<number>(0)
export const watchTrainingMusicPlaying = atom(true)
export const currentBlockIndexAtomFamily = atomFamily((_: string) => atom(0))
export const allCurrentBlockIndexesIds = atom<string[]>([])
export const watchedVideosAtom = atom<string[]>([])
export const watchTrainingRepsQty = atom<number>(1)
export const watchTrainingLapsQty = atom<number>(1)
export const watchTrainingAscetSeconds = atom<number | undefined>(undefined)

export const resetAllBlockIndex = atom(null, (get, set) => {
    const allIds = get(allCurrentBlockIndexesIds)

    allIds.forEach(id => set(currentBlockIndexAtomFamily(id), 0))

    set(allCurrentBlockIndexesIds, [])
})
