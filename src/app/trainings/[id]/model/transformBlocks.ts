import { IAnswer, ITrainingBlockWithContent } from "@/entities/training";
import { IAvailableAudio, IAvailablePhrase } from "@/shared/api/services/audio";
import { calculateExerciseDurations } from "@/app/trainings/[id]/utils";

export function transformTrainingBlocks(
    blocks: ITrainingBlockWithContent[],
    phrases?: IAvailablePhrase[],
    audios?: IAvailableAudio[]
): ITrainingBlockWithContent[] {
    const original = [...blocks];

    // Извлекаем блок "greetings", если он есть
    const greetingsIndex = original.findIndex(b => b.type === 'greeting');
    let greetingsBlock: ITrainingBlockWithContent | undefined;
    if (greetingsIndex !== -1) {
        greetingsBlock = original.splice(greetingsIndex, 1)[0];
    }

    // Находим блок testing
    const testingBlock = blocks.find(b => b.type === 'testing');

    // Переменная для хранения выбранной фразы
    let selectedPhrase: IAvailablePhrase | undefined;

    // Обрабатываем блоки ascet и phrase на первом уровне
    const ascetBlockIndex = original.findIndex(b => b.type === 'ascet');
    const phraseBlockIndex = original.findIndex(b => b.type === 'phrase');


    if (ascetBlockIndex !== -1 && phraseBlockIndex !== -1 && phrases && phrases.length > 0) {
        const ascetBlock = original[ascetBlockIndex];
        const phraseBlock = original[phraseBlockIndex];

        // Выбираем случайную фразу из доступных
        selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];

        phraseBlock.audios = [
            {
                type: 'audio',
                id: 'listen-phrase',
            },
            {
                type: 'audio',
                id: selectedPhrase.audio_id,
            },
            {
                type: 'audio',
                id: 'one-more-time',
            },
            {
                type: 'audio',
                id: selectedPhrase.audio_id,
            },
            {
                type: 'audio',
                id: 'remember-this-phrase',
            },
        ];

        // Если у ascetBlock есть content, ищем блок exercise
        if (ascetBlock.content) {
            const exerciseIndex = ascetBlock.content.findIndex(b => b.type === 'exercise');

            // Если exercise найден, добавляем phrase и дублируем exercise
            if (exerciseIndex !== -1) {
                const exerciseBlock = ascetBlock.content[exerciseIndex];

                const clonedExerciseBlock: ITrainingBlockWithContent = {
                    ...exerciseBlock,
                    fromTimePercent: 70,
                };

                exerciseBlock.toTimePercent = 70;

                // Вставляем phrase и дублированный exercise после первого exercise
                ascetBlock.content.splice(exerciseIndex + 1, 0, phraseBlock, clonedExerciseBlock);
            } else {
                // Если exercise не найден, просто добавляем phrase в конец content
                ascetBlock.content.push(phraseBlock);
            }
        } else {
            // Если content отсутствует, создаем его и добавляем phrase
            ascetBlock.content = [phraseBlock];
        }

        // Удаляем блок phrase из оригинального массива
        original.splice(phraseBlockIndex, 1);
    }

    // Если найден блок testing и у нас есть выбранная фраза
    if (testingBlock && selectedPhrase && phrases && phrases.length >= 3) {
        // Создаем копию массива фраз и удаляем из неё выбранную фразу
        const availablePhrases = phrases.filter(p => p.id !== selectedPhrase!.id);

        // Выбираем две случайные неправильные фразы
        const wrongPhrases: IAvailablePhrase[] = [];
        for (let i = 0; i < 2 && availablePhrases.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availablePhrases.length);
            wrongPhrases.push(availablePhrases[randomIndex]);
            availablePhrases.splice(randomIndex, 1);
        }

        // Создаем массив ответов (правильный + неправильные)
        const answers: IAnswer[] = [
            { text: audios?.find(audio => audio.id === selectedPhrase?.audio_id)?.subtitles || '', isCorrect: true }
        ];

        // Добавляем неправильные ответы
        wrongPhrases.forEach(phrase => {
            answers.push({ text: audios?.find(audio => audio.id === phrase?.audio_id)?.subtitles || '', isCorrect: false });
        });

        // Перемешиваем ответы
        for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
        }

        // Обновляем блок testing
        testingBlock.question = "Какая фраза была в тренировке?";
        testingBlock.answers = answers;

        // Добавляем аудио с выбранной фразой в блок testing
        if (!testingBlock.audios) {
            testingBlock.audios = [];
        }

        testingBlock.audios.push(
            {
                type: 'audio',
                id: 'choose-phrase',
            }
        );
    }

    const circleBlock = original.find(b => b.type === 'circle');
    const splitBlock = original.find(b => b.type === 'split');

    // Функция для расчета времени, исключая блоки "circle" и "split"
    function calculateAllTime(blocksToCalculate: ITrainingBlockWithContent[]): number {
        let total = 0;

        for (const block of blocksToCalculate) {
            if (block.type === 'circle' || block.type === 'split') continue;
            total += block.slideDuration || 0;
            if (block.content) total += calculateAllTime(block.content);
        }
        return total;
    }

    const allTimeValue = calculateAllTime(blocks) - blocks.filter(b =>
        b.type !== 'split' && b.type !== 'circle' &&
        b.type !== 'splitApproach' && b.type !== 'secondLevelCircle'
    ).length * 10;

    const result: ITrainingBlockWithContent[] = [];

    if (greetingsBlock) result.push(greetingsBlock);

    if (circleBlock) {
        if (circleBlock.showQty) {
            const lapsQtyBlock: ITrainingBlockWithContent = {
                type: 'lapsQty',
                videos: [],
                audios: circleBlock.lapsQtyAudios || [],
                circlesTimes: circleBlock.content?.map(c => calculateAllTime(c.content || [])) ?? [],
                allTime: allTimeValue,
            };

            result.push(lapsQtyBlock)
        }
    }

    if (splitBlock) {
        const duration = calculateExerciseDurations(splitBlock.content || [])

        splitBlock.content?.forEach(b => {
            b.content?.forEach(c => {
                if (c.type === 'phrase' && phrases && phrases.length > 0) {
                    selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];

                    c.audios = [
                        {
                            type: 'audio',
                            id: 'listen-phrase',
                        },
                        {
                            type: 'audio',
                            id: selectedPhrase.audio_id,
                        },
                        {
                            type: 'audio',
                            id: 'one-more-time',
                        },
                        {
                            type: 'audio',
                            id: selectedPhrase.audio_id,
                        },
                        {
                            type: 'audio',
                            id: 'remember-this-phrase',
                        },
                    ];

                    if (testingBlock) {
                        const availablePhrases = phrases.filter(p => p.id !== selectedPhrase!.id);

                        const wrongPhrases: IAvailablePhrase[] = [];
                        for (let i = 0; i < 2 && availablePhrases.length > 0; i++) {
                            const randomIndex = Math.floor(Math.random() * availablePhrases.length);
                            wrongPhrases.push(availablePhrases[randomIndex]);
                            availablePhrases.splice(randomIndex, 1);
                        }

                        const answers: IAnswer[] = [
                            { text: audios?.find(audio => audio.id === selectedPhrase?.audio_id)?.subtitles || '', isCorrect: true }
                        ];

                        wrongPhrases.forEach(phrase => {
                            answers.push({ text: audios?.find(audio => audio.id === phrase?.audio_id)?.subtitles || '', isCorrect: false });
                        });

                        for (let i = answers.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [answers[i], answers[j]] = [answers[j], answers[i]];
                        }

                        testingBlock.question = "Какая фраза была в тренировке?";
                        testingBlock.answers = answers;

                        if (!testingBlock.audios) {
                            testingBlock.audios = [];
                        }

                        testingBlock.audios.push(
                            {
                                type: 'audio',
                                id: 'choose-phrase',
                            }
                        );
                    }
                }
            })
        })

        if (splitBlock.showQty) {
            const repsQtyBlock: ITrainingBlockWithContent = {
                type: 'repsQty',
                videos: [],
                audios: splitBlock.repsQtyAudios || [],
                circlesTimes: splitBlock.content?.map(c => calculateAllTime(c.content || [])) ?? [],
                allTime: allTimeValue,
                setsDurations: duration,
                repsQtyCount: splitBlock.repsQtyCount || 3
            };

            result.push(repsQtyBlock)
        }
    }

    result.push(...original);

    return result;
}