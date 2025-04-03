import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export const watchTrainingVideosBlobs = atom<Record<string, string>>({})
export const watchTrainingImagesBlobs = atomFamily((_: string) => atom(''))
export const watchTrainingVideosBlobsNew = atomFamily((_: string) => atom(''));
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

export const watchTrainingAscetPhraseSounds = atom<string[]>()

export const resetAllBlockIndex = atom(null, (get, set) => {
    const allIds = get(allCurrentBlockIndexesIds)

    allIds.forEach(id => set(currentBlockIndexAtomFamily(id), 0))

    set(allCurrentBlockIndexesIds, [])
})

// Создаем атом для установки значения по id
export const setWatchTrainingVideosBlobsNew = atom(
    null,
    (get, set, { id, value }: { id: string; value: string }) => {
        set(watchTrainingVideosBlobsNew(id), value);
    }
);


// Создаем атом для установки значения по id
export const setWatchTrainingImage = atom(
    null,
    (get, set, { id, value }: { id: string; value: string }) => {
        set(watchTrainingImagesBlobs(id), value);
    }
);
