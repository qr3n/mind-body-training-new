export const getTrainingLabel = (num: number) => {
    if (num % 10 === 1 && num % 100 !== 11) return "Упражнение";
    if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return "Упражнения";
    return "Упражнений";
  };