import { api, queryClient }  from "@/shared/api/api";
import { IAvailableAudio, IAvailablePhrase } from "./types";
import { objectToFormData }  from "@/shared/api/utils";
import toast                 from "react-hot-toast";
import { calculateMediaDuration } from "@/shared/api/services/audio/utils";
import { IAvailableVideo } from "../video";

class AudioService {
    async getAll() {
        const data = await api.get<IAvailableAudio[]>('/content/library/audio')

        return data.data
    }

    async getPhrases() {
        const data = await api.get<IAvailablePhrase[]>('/content/phrase')

        return data.data
    }

    async addToPhrases(data: { audio_id: string }) {
        queryClient.setQueryData(['phrases'], (old: IAvailablePhrase[]) => [...old, { id: Date.now().toString(), audio_id: data.audio_id }])

        return await toast.promise(api.post(`/content/phrase`, data), {
            loading: `Добавляем аудио в фразы`,
            success: `Аудио добавлено в фразы!`,
            error: `Что-то пошло не так...`
        })
    }

    async deleteFromPhrases(data: { phrase_id: string }) {
        queryClient.setQueryData(['phrases'], (old: IAvailablePhrase[]) => old.filter(o => o.id !== data.phrase_id))

        return await toast.promise(api.delete(`/content/phrase`, { data: data }), {
            loading: `Удаляем аудио из фраз`,
            success: `Аудио удалено из фраз.`,
            error: `Что-то пошло не так...`
        })
    }

    async deleteFromLibrary(data: { id: string }) {
        await queryClient.cancelQueries({ queryKey: ['library.audios'] })
        const previousVideos = queryClient.getQueryData(['library.audios'])

        queryClient.setQueryData(['library.audios'], (old: IAvailableAudio[]) => old.filter(v => v.id !== data.id))

        await toast.promise(api.delete(`/content/library/audio/${data.id}`), {
            loading: `Удаление аудио`,
            success: `Аудио успешно удалено!`,
            error: `Что-то пошло не так...`
        })

        return { previousVideos }
    }

    async editInLibrary(data: { audio_id: string, subtitles: string, audio?: File, duration?: number }) {
        if (!data.audio) delete data.audio

        let blob = undefined;
        let duration = undefined;

        if (data.audio) {
            blob = URL.createObjectURL(data.audio)

            duration = await calculateMediaDuration(data.audio)

            data.duration = duration
        }

        queryClient.setQueryData(['library.audios'], (oldData: IAvailableAudio[]) => {
            if (!oldData) return oldData;

            return oldData.map((audio: IAvailableAudio) => {
                if (audio.id === data.audio_id) {
                    return {
                        ...audio,
                        ...data,
                        duration,
                        name: data.audio ? data.audio.name : audio.name,
                        blob: data.audio ? blob : undefined,
                    };
                }
                return audio;
            });
        });

        const formData = objectToFormData(data)

        await toast.promise(api.put('/content/library/audio', formData), {
            loading: `Изменение аудио...`,
            success: `Аудио изменено!`,
            error: `Что-то пошло не так...`
        })
    }

    async addToLibrary(data: { subtitles: string, audio: File }) {
        await queryClient.cancelQueries({ queryKey: ['library.audios'] })

        const blob = URL.createObjectURL(data.audio)
        const duration = await calculateMediaDuration(data.audio)

        const previousAudios = queryClient.getQueryData(['library,audios'])
        const tmpId = Date.now().toString()

        queryClient.setQueryData(['library.audios'], (old: IAvailableAudio[]) => {
            return [
                ...old,
                {
                    id: tmpId,
                    name: data.audio.name,
                    subtitles: data.subtitles,
                    duration,
                    blob
                }
            ]
        })

        const formData = objectToFormData(data)

        formData.append('duration', duration.toString())

        await toast.promise(api.post('/content/library/audio', formData).then((r => queryClient.setQueryData(['library.audios'], (old: IAvailableVideo[] = []) => {
            return old.map(video =>
                video.id === tmpId
                    ? { ...video, id: r.data }
                    : video
            );
        }))), {
            loading: `Отправка ${data.audio.name}`,
            success: `${data.audio.name} отправлено!`,
            error: `Что-то пошло не так...`
        })

        return { previousAudios }
    }
}

export const audioService = new AudioService()