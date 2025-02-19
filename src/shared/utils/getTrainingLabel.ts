const getLabel = (num: number, first: string, second: string, third: string) => {
    if (num % 10 === 1 && num % 100 !== 11) return first;
    if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return second;
    return third;
};

export const getTrainingLabel = (num: number) => {
    return getLabel(num, "Упражнение", "Упражнения", "Упражнений")
  };

export const getRepeatsLabel = (num: number) => {
    return getLabel(num, "ПОДХОД", "ПОДХОДА", "ПОДХОДОВ")
};

export const getCirclesLabel = (num: number) => {
    return getLabel(num, "КРУГ", "КРУГА", 'КРУГОВ')
}