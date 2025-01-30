'use client';


import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";

export function createVideoPreview(videoFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
        generateVideoThumbnails(videoFile, 1, 'png').then((thumbnailArray) => {
            resolve(thumbnailArray[0])
        }).catch((err) => {
            reject(err)
        })
    });
}