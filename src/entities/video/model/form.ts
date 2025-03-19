import { z } from "zod";

export const UploadVideoFormSchema = z.object({
    name: z.string().min(1, {
        message: "Название обязательно.",
    }),
    description: z.string().min(1, {
        message: "Описание обязательно.",
    }),
    video: z.instanceof(File, {
        message: "Необходимо загрузить видео."
    }),
    image: z.instanceof(File, {
        message: "Необходимо загрузить изображение."
    }),

    category: z.string(),
    exercise_type: z.string(),
    muscles_group: z.array(z.string()),
    gender: z.string(),
    equipment: z.array(z.string()).min(1, {
        message: "Выберите хотя бы одно оборудование.",
    }),
    playback_rate: z.number().min(0.49)
});


export const EditVideoFormSchema = z.object({
    name: z.string().min(1, {
        message: "Название обязательно.",
    }),
    description: z.string().min(1, {
        message: "Описание обязательно.",
    }),
    video: z.instanceof(File).optional(),
    image: z.instanceof(File).optional(),

    category: z.string(),
    exercise_type: z.string(),
    muscles_group: z.array(z.string()),
    gender: z.string(),
    equipment: z.array(z.string()).min(1, {
        message: "Выберите хотя бы одно оборудование.",
    }),
    playback_rate: z.number().min(0.49)
});
