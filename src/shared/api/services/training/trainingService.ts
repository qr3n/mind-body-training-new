import { api, API_URL } from "@/shared/api";
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

interface IRawTraining {
    id: string,
    title: string,
    equipment: string,
    music_volume: number,
    speaker_volume: number,
    cycle: boolean,
    gender: 'male' | 'female',
    audio: string
    raw_training_schema: string
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
        blocks: JSON.parse(data.raw_training_schema)
    }
}

class TrainingService {
    async get(id: string) {
        const rawData = await fetchWithJson<IRawTraining>(`${API_URL}/trainings/${id}`, 'trainings.all')

        return parseRawTraining(rawData)
    }

    async getAll(): Promise<ITraining[]> {
        const rawData = await fetchWithJson<IRawTraining[]>(`${API_URL}/trainings`, 'trainings.all')

        return rawData.map(data => parseRawTraining(data))
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

    async edit(data: ICreateTrainingRequest) {
        return api.put(`/trainings/edit/${data.id}`, {
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