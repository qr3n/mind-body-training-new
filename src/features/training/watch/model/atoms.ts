import { atom } from "jotai";

export const watchTrainingVideosBlobs = atom<Record<string, string>>({})
export const watchTrainingAudiosBlobs = atom<Record<string, string>>({})
export const watchTrainingSpeakerVolume = atom(0)
export const watchTrainingMusicVolume = atom(0)

export const watchTrainingStep = atom<number>(0)
