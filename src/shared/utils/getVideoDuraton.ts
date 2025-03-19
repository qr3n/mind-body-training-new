export function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);

        video.addEventListener('loadedmetadata', () => {
            URL.revokeObjectURL(video.src); // Освобождаем память
            resolve(video.duration as number);
        });

        video.addEventListener('error', (e) => {
            reject(e);
        });
    });
}