import { api, API_URL, queryClient } from "@/shared/api";
import { fetchWithJson } from "@/shared/api/utils";
import { ITraining } from "@/entities/training";

interface ICreateTrainingRequest {
    id?: string,
    title: string,
    gender: 'male' | 'female',
    equipment: string[],
    audio: string,
    cycle: boolean,
    speaker_volume: number,
    music_volume: number,
    rawTraining: string
}

export interface IUpdateIndexRequest {
    training_id: string,
    new_index: number,
}

interface IRawTraining {
    id: string,
    title: string,
    equipment: string,
    music_volume: number,
    speaker_volume: number,
    cycle: boolean,
    gender: 'male' | 'female',
    audio: string
    raw_training_schema: string,
    index: number
}

const parseRawTraining = (data: IRawTraining): ITraining => {
    return {
        id: data.id,
        title: data.title,
        equipment: data.equipment.split(' '),
        music_volume: data.music_volume,
        speaker_volume: data.speaker_volume,
        cycle: data.cycle,
        gender: data.gender,
        audio: JSON.parse(data.audio),
        blocks: JSON.parse(data.raw_training_schema),
        index: data.index
    }
}

class TrainingService {
    async get(id: string) {
        const rawData = await fetchWithJson<IRawTraining>(`${API_URL}/trainings/${id}?v=${Date.now().toString()}`, `training-${id}`)

        return parseRawTraining(rawData)
    }

    async getAll(): Promise<ITraining[]> {
        const rawData = await fetchWithJson<IRawTraining[]>(`${API_URL}/trainings?v=${Date.now().toString()}`, 'trainings.all')

        return rawData.map(data => parseRawTraining(data)).sort((a, b) => a.index - b.index)
    }

    async deleteTraining(data: { id: string }) {
        queryClient.setQueryData(['trainings.all'], (trainings: ITraining[]) => trainings.filter(t => t.id !== data.id))

        return await api.delete(`/trainings/${data.id}`)
    }

    async create(data: ICreateTrainingRequest) {
        return api.post('/trainings', {
            raw_training_schema: data.rawTraining,
            title: data.title,
            gender: data.gender,
            equipment: data.equipment.join(' '),
            audio: data.audio,
            cycle: data.cycle,
            speaker_volume: data.speaker_volume,
            music_volume: data.music_volume
        })
    }

    async updateIndexes(data: IUpdateIndexRequest[]) {
        return api.put('/trainings/indexes', data)
    }

    async edit(data: ICreateTrainingRequest) {
        return await api.put(`/trainings/edit/${data.id}`, {
            raw_training_schema: data.rawTraining,
            title: data.title,
            gender: data.gender,
            equipment: data.equipment.join(' '),
            audio: data.audio,
            cycle: data.cycle,
            speaker_volume: data.speaker_volume,
            music_volume: data.music_volume
        })
    }}


export const trainingService = new TrainingService()
