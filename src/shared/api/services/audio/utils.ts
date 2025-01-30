export const calculateMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
        media.src = URL.createObjectURL(file);

        media.onloadedmetadata = () => {
            URL.revokeObjectURL(media.src);
            resolve(Math.round(media.duration));
        };

        media.onerror = () => {
            URL.revokeObjectURL(media.src);
            reject(new Error('Failed to load media metadata.'));
        };
    });
};