import { atom } from "jotai";
import {
    IAnswer,
    ITraining,
    ITrainingAudio, ITrainingBlockWithContent,
    ITrainingPause,
    ITrainingVideo,
    TTrainingBlock
} from "@/entities/training";
import { IAvailableVideo } from "@/shared/api/services/video";
import { atomFamily } from 'jotai/utils'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTrainingFirstLevelBlocksAtomFamily = atomFamily((_: string) => atom<TTrainingBlock | null>(null));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTrainingSecondLevelBlocksAtomFamily = atomFamily((_: string) => atom<TTrainingBlock | null>(null));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createTrainingThirdLevelBlocksAtomFamily = atomFamily((_: string) => atom<TTrainingBlock | null>(null));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const childBlocksAtomFamily = atomFamily((_: string) => atom<string[]>([]));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const blockSoundsAtomFamily = atomFamily((_: string) => atom<(ITrainingAudio | ITrainingPause)[]>([]));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const blockVideosAtomFamily = atomFamily((_: string) => atom<ITrainingVideo[]>([]));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const blockEndSoundsAtomFamily = atomFamily((_: string) => atom<(ITrainingAudio | ITrainingPause)[]>([]));
export const allBlocksIds = atom<string[]>([])
export const trainingEquipment = atom<string[]>([])
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const blockQuestionsAtomFamily = atomFamily((_: string) => atom<string>(''));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const blockTitleAtomFamily = atomFamily((_: string) => atom(""));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const blockDescriptionAtomFamily = atomFamily((_: string) => atom(""));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const blockImagesNamesAtomFamily = atomFamily((_: string) => atom(""));
export const isSomethingUploadingAtom = atom(false)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const startInAtomFamily = atomFamily((_: string) => atom(9));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const slideDurationAtomFamily = atomFamily((_: string) => atom(10));
export const blockAnswersAtomFamily = atomFamily((_: string) => atom<IAnswer[]>([]));
export const cycleTrainingMusic = atom(false)

export const addQuestionToBlock = atom(
    null,
    (get, set, { blockId, question }: { blockId: string; question: string }) => {
        const currentQuestions = get(blockAnswersAtomFamily(blockId));
        set(blockAnswersAtomFamily(blockId), [...currentQuestions, { text: question, isCorrect: false }]);
    }
);

export const getAllNestedChildrenAtom = atom(
    (get) => (parentId: string): string[] => {
        const collectChildren = (id: string): string[] => {
            const childIds = get(childBlocksAtomFamily(id));
            return childIds.flatMap((childId) => [childId, ...collectChildren(childId)]);
        };

        return collectChildren(parentId);
    }
);

export const addCreateTrainingBlock = atom(
    null,
    (get, set, { level, parentId, newBlock }: { level: 'first' | 'second' | 'third'; parentId?: string; newBlock: TTrainingBlock }) => {
        const id = Date.now().toString();
        const blocks = get(allBlocksIds)
        set(allBlocksIds, [...blocks, id])

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
        set(blockSoundsAtomFamily(id), []);
        set(blockVideosAtomFamily(id), []);
    }
);

export const addSoundToBlock = atom(
    null,
    (get, set, { blockId, audio }: { blockId: string; audio: ITrainingAudio | ITrainingPause }) => {

        console.log(blockId)
        console.log('TEST')
        const currentSounds = get(blockSoundsAtomFamily(blockId));
        set(blockSoundsAtomFamily(blockId), [...currentSounds, audio]);
    }
);

export const addEndSoundToBlock = atom(
    null,
    (get, set, { blockId, audio }: { blockId: string; audio: ITrainingAudio | ITrainingPause }) => {
        const currentEndSounds = get(blockEndSoundsAtomFamily(blockId));
        set(blockEndSoundsAtomFamily(blockId), [...currentEndSounds, audio]);
    }
);

export const addVideoToBlock = atom(
    null,
    (get, set, { blockId, video }: { blockId: string; video: ITrainingVideo }) => {
        const currentVideos = get(blockVideosAtomFamily(blockId));
        set(blockVideosAtomFamily(blockId), [...currentVideos, video]);
    }
);

export const removeSoundFromBlock = atom(
    null,
    (get, set, { blockId, soundId }: { blockId: string; soundId: string }) => {
        const currentSounds = get(blockSoundsAtomFamily(blockId));
        const updatedSounds = currentSounds.filter((sound) => sound.id !== soundId);
        set(blockSoundsAtomFamily(blockId), updatedSounds);
    }
);

export const removeEndSoundFromBlock = atom(
    null,
    (get, set, { blockId, soundId }: { blockId: string; soundId: string }) => {
        const currentSounds = get(blockEndSoundsAtomFamily(blockId));
        const updatedSounds = currentSounds.filter((sound) => sound.id !== soundId);
        set(blockEndSoundsAtomFamily(blockId), updatedSounds);
    }
);


export const removeVideoFromBlock = atom(
    null,
    (get, set, { blockId, videoId, allVideos }: { blockId: string; videoId: string, allVideos: IAvailableVideo[] }) => {
        // Удаляем видео из текущего блока
        const currentVideos = get(blockVideosAtomFamily(blockId));
        const updatedVideos = currentVideos.filter((video) => video.id !== videoId);
        set(blockVideosAtomFamily(blockId), updatedVideos);

        // Получаем все блоки и ищем все видео для этих блоков
        const allBlockIds = get(allBlocksIds);
        const usedEquipments: Set<string> = new Set();

        allBlockIds.forEach((id) => {
            const blockVideos = get(blockVideosAtomFamily(id));
            blockVideos.forEach((video) => {
                if (video.id !== videoId) {
                    // Ищем оборудование для видео в allVideos
                    const videoData = allVideos.find((videoData) => videoData.id === video.id);
                    if (videoData) {
                        videoData.equipment.forEach((equipment) => usedEquipments.add(equipment));
                    }
                }
            });
        });

        // Находим оборудование, которое использовалось только в удаленном видео
        const removedVideo = allVideos.find((video) => video.id === videoId);
        if (removedVideo) {
            const equipmentToRemove = removedVideo.equipment.filter(
                (equipment) => !usedEquipments.has(equipment)
            );

            // Удаляем это оборудование из trainingEquipment
            const currentEquipment = get(trainingEquipment);
            const updatedEquipment = currentEquipment.filter(
                (equipment) => !equipmentToRemove.includes(equipment)
            );
            set(trainingEquipment, updatedEquipment);
        }
    }
);

export const allVideoIdsAtom = atom((get) => {
    const allIds = get(allBlocksIds);

    const getVideoIdsFromBlock = (blockId: string): string[] => {
        const firstLevelBlock = get(createTrainingFirstLevelBlocksAtomFamily(blockId));
        const secondLevelBlock = get(createTrainingSecondLevelBlocksAtomFamily(blockId));
        const thirdLevelBlock = get(createTrainingThirdLevelBlocksAtomFamily(blockId));

        const block = firstLevelBlock || secondLevelBlock || thirdLevelBlock;
        if (!block) return [];

        const videos = get(blockVideosAtomFamily(blockId));
        return videos.map((video) => video.id);
    };

    return allIds.flatMap(getVideoIdsFromBlock);
});

export const removeCreateTrainingBlock = atom(
    null,
    (get, set, { blockId, level, parentId, allVideos }: { blockId: string; level: 'first' | 'second' | 'third'; parentId?: string, allVideos: IAvailableVideo[] }) => {
        const allVideoIds = get(allVideoIdsAtom); // ID всех видео в тренировке
        const allChild = get(getAllNestedChildrenAtom)(blockId); // Все дочерние блоки

        console.log(`🛑 Удаляем блок: ${blockId} (уровень: ${level}, parentId: ${parentId})`);
        console.log("📌 Дочерние блоки перед удалением:", get(childBlocksAtomFamily(blockId)));        

        // Удаление дочерних блоков
        if (parentId) {
            const parentChildIds = get(childBlocksAtomFamily(parentId));
            set(childBlocksAtomFamily(parentId), parentChildIds.filter((id) => id !== blockId));
        } else if (level === 'first') {
            const rootChildIds = get(childBlocksAtomFamily('root'));
            set(childBlocksAtomFamily('root'), rootChildIds.filter((id) => id !== blockId));
        }

        // Удаление связей с уровнями блоков
        if (level === 'first') {
            set(createTrainingFirstLevelBlocksAtomFamily(blockId), null);
        } else if (level === 'second') {
            set(createTrainingSecondLevelBlocksAtomFamily(blockId), null);
        } else if (level === 'third') {
            set(createTrainingThirdLevelBlocksAtomFamily(blockId), null);
        }

        // Собираем все ID блоков, которые нужно удалить (текущий + дочерние)
        const allRelatedBlocks = [blockId, ...allChild];

        // Удаляем видео и другие данные, связанные с блоками
        const videosToRemove = new Set<string>(); // Для сбора ID удаляемых видео
        allRelatedBlocks.forEach((id) => {
            const blockVideos = get(blockVideosAtomFamily(id));
            blockVideos.forEach((video) => videosToRemove.add(video.id)); // Сохраняем ID видео для удаления
            set(blockVideosAtomFamily(id), []);
            set(blockSoundsAtomFamily(id), []);
            set(blockEndSoundsAtomFamily(id), []);
        });

        // Обновляем allVideoIds, удаляя ID видео из удаленных блоков
        const updatedVideoIds = allVideoIds.filter((id) => !videosToRemove.has(id));
        // set(allVideoIdsAtom, updatedVideoIds);

        // Находим используемое оборудование на основе оставшихся видео
        const remainingVideos = allVideos.filter((video) => updatedVideoIds.includes(video.id)); // Данные оставшихся видео
        const usedEquipment = new Set(
            remainingVideos.flatMap((video) => video.equipment) // Собираем всё оборудование из оставшихся видео
        );

        // Обновляем trainingEquipment, оставляя только используемое оборудование
        set(trainingEquipment, (currentEquipment) =>
            currentEquipment.filter((equipment) => usedEquipment.has(equipment))
        );
    }
);

export const allTrainingVideosAtom = atom((get) => {
    const blockIds = get(allBlocksIds);
    return blockIds.flatMap((id) => get(blockVideosAtomFamily(id)));
});

interface CopyBlockArgs {
    blockId: string;
    level: 'first' | 'second' | 'third';
    parentId?: string;
}

type CopyBlockFunction = (args: CopyBlockArgs, copyBlock: CopyBlockFunction) => void;

// Atom для копирования блока
export const copyCreateTrainingBlock = atom<null, [CopyBlockArgs, CopyBlockFunction], void>(
    null,
    (get, set, { blockId, level, parentId }, copyBlock) => {
        const id = Date.now().toString();

        // Копирование блока
        let blockData: TTrainingBlock | null = null;
        if (level === 'first') {
            blockData = get(createTrainingFirstLevelBlocksAtomFamily(blockId));
        } else if (level === 'second') {
            blockData = get(createTrainingSecondLevelBlocksAtomFamily(blockId));
        } else if (level === 'third') {
            blockData = get(createTrainingThirdLevelBlocksAtomFamily(blockId));
        }

        if (blockData) {
            // Добавление копии блока
            if (parentId) {
                const parentChildIds = get(childBlocksAtomFamily(parentId));
                set(childBlocksAtomFamily(parentId), [...parentChildIds, id]);
            } else if (level === 'first') {
                const rootChildIds = get(childBlocksAtomFamily('root'));
                set(childBlocksAtomFamily('root'), [...rootChildIds, id]);
            }

            if (level === 'first') {
                set(createTrainingFirstLevelBlocksAtomFamily(id), { ...blockData, parentId });
            } else if (level === 'second') {
                set(createTrainingSecondLevelBlocksAtomFamily(id), { ...blockData, parentId });
            } else if (level === 'third') {
                set(createTrainingThirdLevelBlocksAtomFamily(id), { ...blockData, parentId });
            }

            const title = get(blockTitleAtomFamily(blockId));
            const description = get(blockDescriptionAtomFamily(blockId));
            const imgName = get(blockImagesNamesAtomFamily(blockId));
            // Копирование аудио
            const audios = get(blockSoundsAtomFamily(blockId));
            set(blockSoundsAtomFamily(id), [...audios]);
            set(blockTitleAtomFamily(id), title);
            set(blockDescriptionAtomFamily(id), description);
            set(blockImagesNamesAtomFamily(id), imgName);

            // Копирование видео
            const videos = get(blockVideosAtomFamily(blockId));
            set(blockVideosAtomFamily(id), [...videos]);

            // Копирование дочерних блоков
            const childIds = get(childBlocksAtomFamily(blockId));

            childIds.forEach((childId) => {
                const childLevel = level === 'first' ? 'second' : level === 'second' ? 'third' : null;
                
                if (childLevel) {
                    console.log(childLevel)

                    setTimeout(() => {
                        copyBlock({ blockId: childId, level: childLevel, parentId: id }, copyBlock);
                    }, 0);
                }
            });
        }
    }
);

export const assembleTrainingBlocksAtom = atom((get) => {
    const assembleBlock = (blockId: string, level: "first" | "second" | "third"): unknown | null => {
        let block: TTrainingBlock | null = null;

        if (level === "first") {
            block = get(createTrainingFirstLevelBlocksAtomFamily(blockId));
        } else if (level === "second") {
            block = get(createTrainingSecondLevelBlocksAtomFamily(blockId));
        } else if (level === "third") {
            block = get(createTrainingThirdLevelBlocksAtomFamily(blockId));
        }

        if (!block) return null;

        const childIds = get(childBlocksAtomFamily(blockId));
        const childBlocks = childIds
            .map((childId) => {
                const childLevel = level === "first" ? "second" : level === "second" ? "third" : null;
                return childLevel ? assembleBlock(childId, childLevel) : null;
            })
            .filter(Boolean) as TTrainingBlock[];

        const question = get(blockQuestionsAtomFamily(blockId))
        const answers = get(blockAnswersAtomFamily(blockId));
        const title = get(blockTitleAtomFamily(blockId)); // Получаем заголовок
        const description = get(blockDescriptionAtomFamily(blockId)); // Получаем описание
        const imageName = get(blockImagesNamesAtomFamily(blockId));
        const startIn = get(startInAtomFamily(blockId));
        const slideDuration = get(slideDurationAtomFamily(blockId))

        return {
            ...block,
            content: childBlocks,
            audios: get(blockSoundsAtomFamily(blockId)),
            videos: get(blockVideosAtomFamily(blockId)),
            ending: get(blockEndSoundsAtomFamily(blockId)),
            imageName,
            question,
            answers,
            title,
            description,
            startIn,
            slideDuration
        };
    };

    const rootIds = get(childBlocksAtomFamily("root"));
    return rootIds
        .map((rootId) => assembleBlock(rootId, "first"))
        .filter(Boolean) as TTrainingBlock[];
});


export const updatePauseDurationAtom = atom(
    null,
    (get, set, { blockId, pauseId, newDuration }: { blockId: string; pauseId: string; newDuration: number }) => {
        const currentSounds = get(blockSoundsAtomFamily(blockId));
        const updatedSounds = currentSounds.map((sound) =>
            sound.type === "pause" && sound.id === pauseId
                ? { ...sound, duration: newDuration }
                : sound
        );
        set(blockSoundsAtomFamily(blockId), updatedSounds);
    }
);

interface IBlock extends ITrainingBlockWithContent {
    id: string, parentId: string, level: string
}

function flattenBlocks(blocks: ITrainingBlockWithContent[], parentId = 'root', level = 'first') {
    const result: IBlock[] = [];

    blocks.forEach((block) => {
        const blockId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        result.push({ ...block, id: blockId, parentId, level });

        if (block.content && Array.isArray(block.content) && block.content.length > 0) {
            const nextLevel = level === 'first' ? 'second' : 'third';
            result.push(...flattenBlocks(block.content, blockId, nextLevel));
        }
    });

    return result;
}

export const resetAllAtomsAtom = atom(null, (get, set) => {
    set(allBlocksIds, []);
    set(trainingEquipment, []);
    set(childBlocksAtomFamily("root"), []);

    const allBlockIds = get(allBlocksIds);
    allBlockIds.forEach((blockId) => {
        set(createTrainingFirstLevelBlocksAtomFamily(blockId), null);
        set(createTrainingSecondLevelBlocksAtomFamily(blockId), null);
        set(createTrainingThirdLevelBlocksAtomFamily(blockId), null);
        set(blockSoundsAtomFamily(blockId), []);
        set(blockVideosAtomFamily(blockId), []);
        set(blockEndSoundsAtomFamily(blockId), []);
        set(blockQuestionsAtomFamily(blockId), '');
        set(blockAnswersAtomFamily(blockId), []);
        set(blockTitleAtomFamily(blockId), "");
        set(blockDescriptionAtomFamily(blockId), "");
        set(blockImagesNamesAtomFamily(blockId), "");
        set(childBlocksAtomFamily(blockId), []);
    });

    set(cycleTrainingMusic, false)
    set(isSomethingUploadingAtom, false);
});

export const initializeBlocksAtom = atom(
    null,
    (get, set, training: ITraining) => {
        const blocks = training.blocks

        const flatBlocks = flattenBlocks(blocks);
        set(resetAllAtomsAtom)
        set(trainingEquipment, training.equipment)
        set(cycleTrainingMusic, training.cycle)
        set(blockSoundsAtomFamily('root.audios'), training.audio)

        flatBlocks.forEach((block) => {
            const { id, parentId, level, videos, ending, audios, title, description, question, imageName, answers, startIn, slideDuration, ...blockData } = block;
            
            set(allBlocksIds, [...get(allBlocksIds), id]);

            if (level === 'first') {
                set(childBlocksAtomFamily('root'), [...get(childBlocksAtomFamily('root')), id]);
                set(createTrainingFirstLevelBlocksAtomFamily(id), {...blockData, parentId});
            } else if (level === 'second') {
                set(childBlocksAtomFamily(parentId), [...get(childBlocksAtomFamily(parentId)), id]);
                set(createTrainingSecondLevelBlocksAtomFamily(id), {...blockData, parentId});
            } else if (level === 'third') {
                set(childBlocksAtomFamily(parentId), [...get(childBlocksAtomFamily(parentId)), id]);
                set(createTrainingThirdLevelBlocksAtomFamily(id), {...blockData, parentId});
            }
            
            const currentChildren = get(childBlocksAtomFamily(parentId)) || [];
            if (!currentChildren.includes(id)) {
                set(childBlocksAtomFamily(parentId), [...currentChildren, id]);
            }

            set(blockSoundsAtomFamily(id), audios || []);
            set(blockEndSoundsAtomFamily(id), ending || [])
            set(blockVideosAtomFamily(id), videos || []);
            set(blockTitleAtomFamily(id), title || "");
            set(blockDescriptionAtomFamily(id), description || "");
            set(blockImagesNamesAtomFamily(id), imageName || "");
            set(blockAnswersAtomFamily(id), answers || []);
            set(blockQuestionsAtomFamily(id), question || '')

            if (startIn) set(startInAtomFamily(id), startIn)
            if (slideDuration) set(slideDurationAtomFamily(id), slideDuration)
        });
    }
);
