export interface IUploadVideoToLibraryForm {
    title: string,
    description: string,
    video: File,
    image: File,
    duration: number,
    equipment: string[],
    gender: 'male' | 'female',
}