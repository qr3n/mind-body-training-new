import { api, queryClient } from "@/shared/api/api";
import {
    IAddVideoToLibraryRequestData,
    IAvailableVideo,
    IEditVideoInLibraryRequestData,
    IRawAvailableVideo
}                           from "./types";
import {
    objectToFormData
}                           from "@/shared/api/utils";
import toast                from "react-hot-toast";
import {
    createVideoPreview
}                           from "@/shared/api/services/video/utils";
import { calculateMediaDuration } from "@/shared/api/services/audio/utils";

class VideoService {
    async getAll(): Promise<IAvailableVideo[]> {
        const data = await api.get<IRawAvailableVideo[]>('/content/library/video')

        return data.data.map(r => (
            {
                ...r,
                muscles_group: r.muscles_group.split(','),
                equipment: r.equipment.split(',')
            }
        ))
    }

    async deleteFromLibrary(data: { id: string }) {
        await queryClient.cancelQueries({ queryKey: ['library.videos'] })
        const previousVideos = queryClient.getQueryData(['library.videos'])

        queryClient.setQueryData(['library.videos'], (old: IAvailableVideo[]) => old.filter(v => v.id !== data.id))

        toast.promise(api.delete(`/content/library/video/${data.id}`), {
            loading: `Удаление видео`,
            success: `Видео успешно удалено!`,
            error: `Что-то пошло не так...`
        })

        return { previousVideos }
    }

    async editVideoInLibrary(data: IEditVideoInLibraryRequestData) {
        if (!data.video) delete data.video
        if (!data.image) delete data.image
        let duration: number | undefined = undefined;

        if (data.video) duration = await calculateMediaDuration(data.video)

        let previewBlob = undefined
        let videoBlob = undefined
        let imageBlob = undefined

        if (data.image) imageBlob = URL.createObjectURL(data.image)

        if (data.video) {
            videoBlob = URL.createObjectURL(data.video)

            previewBlob = await toast.promise(createVideoPreview(data.video), {
                loading: `Генерация превью видео`,
                success: `Генерация завершена.`,
                error: `Что-то пошло не так...`
            })
        }


        queryClient.setQueryData(['library.videos'], (oldData: IAvailableVideo[]) => {
            if (!oldData) return oldData;

            return oldData.map((video: IAvailableVideo) => {
                if (video.id === data.video_id) {
                    return {
                        ...video,
                        ...data,
                        videoBlob: videoBlob,
                        previewBlob: data.video ? previewBlob : undefined,
                        filename: data.video ? data.video.name : video.filename,
                        imageBlob: imageBlob,
                        duration: duration || video.duration
                    };
                }
                return video;
            });
        });

        const formData = objectToFormData(duration ? {...data, duration: duration.toString()} : data)

        await toast.promise(api.put('/content/library/video', formData), {
            loading: `Изменение видео...`,
            success: `Видео изменено!`,
            error: `Что-то пошло не так...`
        })
    }

    async addToLibrary(data: IAddVideoToLibraryRequestData) {
        await queryClient.cancelQueries({ queryKey: ['library.videos'] })

        const previousVideos = queryClient.getQueryData(['library.videos'])
        const videoBlob = URL.createObjectURL(data.video)
        const previewBlob = await createVideoPreview(data.video)
        const duration = await calculateMediaDuration(data.video)
        const tmpId = Date.now().toString()

        queryClient.setQueryData(['library.videos'], (old: IAvailableVideo[]) => {
            return [
                ...old,
                {
                    id: tmpId,
                    name: data.name,
                    exercise_type: data.exercise_type,
                    muscles_group: data.muscles_group,
                    description: data.description,
                    duration: duration,
                    equipment: data.equipment,
                    gender: data.gender,
                    category: data.category,
                    videoBlob: videoBlob,
                    previewBlob: previewBlob,
                    filename: data.video.name
                }
            ]
        })
        const formData = objectToFormData({...data, duration: duration })

        await toast.promise(api.post('/content/library/video', formData).then(r => queryClient.setQueryData(['library.videos'], (old: IAvailableVideo[] = []) => {
            return old.map(video =>
                video.id === tmpId
                    ? { ...video, id: r.data }
                    : video
            );
        })), {
            loading: `Отправка ${data.video.name}`,
            success: `${data.video.name} отправлено!`,
            error: `Что-то пошло не так...`
        })

        return { previousVideos }
    }
}

export const videoService = new VideoService()