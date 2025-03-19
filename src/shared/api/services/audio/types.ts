export interface IAvailableAudio {
    id: string,
    name: string,
    subtitles: string,
    duration: number,
    blob?: string
}

export interface IAvailablePhrase {
    id: string
    audio_id: string
}