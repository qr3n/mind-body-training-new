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
