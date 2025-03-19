export interface IRawAvailableVideo {
    id: string,
    category: string,
    gender: string,
    name: string,
    exercise_type: string
    muscles_group: string
    description: string,
    duration: number,
    equipment: string,
    videoBlob?: string,
    previewBlob?: string
    filename: string,
    playback_rate: number
}

export interface IAvailableVideo {
    id: string,
    category: string,
    gender: string,
    name: string,
    exercise_type: string
    muscles_group: string[]
    description: string,
    duration: number,
    equipment: string[],
    videoBlob?: string,
    previewBlob?: string,
    imageBlob?: string,
    filename: string,
    checksum?: string,
    playback_rate: number
}

export interface IAddVideoToLibraryRequestData {
    category: string,
    gender: string,
    video: File,
    image: File,
    name: string,
    exercise_type: string
    muscles_group: string[]
    description: string,
    duration: number,
    equipment: string[]
}

export interface IEditVideoInLibraryRequestData {
    video_id: string,
    category: string,
    gender: string,
    video?: File,
    image?: File,
    name: string,
    exercise_type: string
    muscles_group: string[]
    description: string,
    duration: number,
    equipment: string[],
    playback_rate: number
}
