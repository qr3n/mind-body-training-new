import { atomFamily } from "jotai/utils";
import { atom } from "jotai";
import { TTrainingBlock, ITrainingAudio, ITrainingVideo } from "@/entities/training";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTrainingFirstLevelBlocksAtomFamily = atomFamily((_: string) => atom<TTrainingBlock | null>(null));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTrainingSecondLevelBlocksAtomFamily = atomFamily((_: string) => atom<TTrainingBlock | null>(null));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTrainingThirdLevelBlocksAtomFamily = atomFamily((_: string) => atom<TTrainingBlock | null>(null));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const childBlocksAtomFamily = atomFamily((_: string) => atom<string[]>([]));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const blockAudiosAtomFamily = atomFamily((_: string) => atom<ITrainingAudio[]>([]));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const blockVideosAtomFamily = atomFamily((_: string) => atom<ITrainingVideo[]>([]));

export const addCreateTrainingBlock = atom(
    null,
    (get, set, { level, parentId, newBlock }: { level: 'first' | 'second' | 'third'; parentId?: string; newBlock: TTrainingBlock }) => {
        const id = Date.now().toString();

        if (level === 'first') {
            const ids = get(childBlocksAtomFamily('root'));
            set(childBlocksAtomFamily('root'), [...ids, id]);
            set(createTrainingFirstLevelBlocksAtomFamily(id), newBlock);
        } else if (level === 'second') {
            const ids = get(childBlocksAtomFamily(parentId!));
            set(childBlocksAtomFamily(parentId!), [...ids, id]);
            set(createTrainingSecondLevelBlocksAtomFamily(id), newBlock);
        } else if (level === 'third') {
            const ids = get(childBlocksAtomFamily(parentId!));
            set(childBlocksAtomFamily(parentId!), [...ids, id]);
            set(createTrainingThirdLevelBlocksAtomFamily(id), newBlock);
        }

        // Инициализация атомов для аудио и видео
        set(blockAudiosAtomFamily(id), []);
        set(blockVideosAtomFamily(id), []);
    }
);

export const addAudioToBlock = atom(
    null,
    (get, set, { blockId, audio }: { blockId: string; audio: ITrainingAudio }) => {
        const currentAudios = get(blockAudiosAtomFamily(blockId));
        set(blockAudiosAtomFamily(blockId), [...currentAudios, audio]);
    }
);

export const addVideoToBlock = atom(
    null,
    (get, set, { blockId, video }: { blockId: string; video: ITrainingVideo }) => {
        const currentVideos = get(blockVideosAtomFamily(blockId));
        set(blockVideosAtomFamily(blockId), [...currentVideos, video]);
    }
);
