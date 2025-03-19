// Определение типов для данных
import { ITrainingBlockWithContent } from "@/entities/training";

interface VideoInfo {
    id: string;
    type: string;
    checksum: string;
}

interface ExerciseBlock {
    type: 'rest' | 'exercise';
    parentId: string;
    content: any[];
    audios: any[];
    videos: VideoInfo[];
    ending: any[];
    imageName: string;
    question: string;
    answers: any[];
    title: string;
    description: string;
    startIn: number;
    slideDuration: number;
    cycleVideo: boolean;
    inputResults: boolean;
    useVideoAudio: boolean;
    repsQtyAudios: any[];
    lapsQtyAudios: any[];
    repsQtyCount: number;
    id: string;
}

export interface ExerciseDurations {
    id: string;                   // ID упражнения
    setDurations: number[];       // Длительности всех подходов
    lastSetDuration: number;      // Длительность последнего подхода для дублирования
}

/**
 * Вычисляет длительности подходов для каждого упражнения
 * @param exercises Массив объектов упражнений
 * @returns Массив объектов с длительностями подходов для каждого упражнения
 */
export function calculateExerciseDurations(exercises: ITrainingBlockWithContent[]): ExerciseDurations[] {
    const result: ExerciseDurations[] = [];

    // Перебираем все упражнения
    for (const exercise of exercises) {
        const sets = groupIntoSets(exercise.content || []);
        const setDurations: number[] = [];
        let lastSetDuration = 0;

        if (sets.length > 0) {
            // Обрабатываем все подходы
            for (let i = 0; i < sets.length; i++) {
                const set = sets[i];
                const duration = set.reduce((sum, block) => sum + (block.slideDuration || 0), 0);
                setDurations.push(duration);
            }

            // Определяем длительность последнего подхода для дублирования
            const lastSet = sets[sets.length - 1];

            if (lastSet.length > 1) {
                // Если последний подход содержит rest + exercise(s)
                if (lastSet[lastSet.length - 1].type === 'exercise' &&
                    countExerciseBlocks(lastSet) > 1) {
                    // Если заканчивается на exercise и есть более одного exercise блока,
                    // берем только длительность последнего exercise
                    lastSetDuration = (lastSet[lastSet.length - 1].slideDuration || 0);
                } else {
                    // Если заканчивается на exercise, но всего один exercise блок (rest + exercise),
                    // или если заканчивается на rest, берем весь подход
                    lastSetDuration = lastSet.reduce((sum, block) => sum + (block.slideDuration || 0), 0);
                }
            } else {
                // Если в последнем подходе только один блок
                lastSetDuration = (lastSet[0].slideDuration || 0);
            }
        }

        result.push({
            id: (exercise.id || Date.now().toString()),
            setDurations,
            lastSetDuration
        });
    }

    return result;
}

/**
 * Изменяет количество подходов в упражнениях
 * @param exerciseDurations Массив объектов с длительностями подходов
 * @param newSetCount Новое количество подходов
 * @returns Обновленный массив объектов с длительностями подходов
 */
export function adjustSetCount(exerciseDurations: ExerciseDurations[], newSetCount: number): ExerciseDurations[] {
    return exerciseDurations.map(exercise => {
        const currentSetCount = exercise.setDurations.length;
        const newDurations = [...exercise.setDurations];

        // Если требуется больше подходов, добавляем дублированный последний подход
        if (newSetCount > currentSetCount) {
            const additionalSets = newSetCount - currentSetCount;
            for (let i = 0; i < additionalSets; i++) {
                newDurations.push(exercise.lastSetDuration);
            }
        }
        // Если требуется меньше подходов, удаляем последние
        else if (newSetCount < currentSetCount) {
            return {
                ...exercise,
                setDurations: newDurations.slice(0, newSetCount)
            };
        }

        return {
            ...exercise,
            setDurations: newDurations
        };
    });
}

/**
 * Подсчитывает количество блоков exercise в подходе
 * @param set Массив блоков, представляющих подход
 * @returns Количество блоков exercise
 */
export function countExerciseBlocks(set: ITrainingBlockWithContent[]): number {
    return set.filter(block => block.type === 'exercise').length;
}

/**
 * Группирует блоки в подходы
 * Подход начинается с rest и включает все последующие exercise до следующего rest
 * @param blocks Массив блоков exercise и rest
 * @returns Массив подходов, где каждый подход - это массив блоков
 */
export function groupIntoSets(blocks: ITrainingBlockWithContent[]): ITrainingBlockWithContent[][] {
    console.log(blocks)

    const sets: ITrainingBlockWithContent[][] = [];
    let currentSet: ITrainingBlockWithContent[] = [];

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        // Если блок rest и текущий подход не пуст, то завершаем подход и начинаем новый
        if (block.type === 'rest' && currentSet.length > 0) {
            sets.push(currentSet);
            currentSet = [block];
        }
        // Если блок rest и текущий подход пуст, то добавляем блок к текущему подходу
        else if (block.type === 'rest') {
            currentSet.push(block);
        }
        // Если блок exercise, то добавляем его к текущему подходу
        else if (block.type === 'exercise') {
            currentSet.push(block);
        }
    }

    // Добавляем последний подход, если он не пуст
    if (currentSet.length > 0) {
        sets.push(currentSet);
    }

    return sets;
}
