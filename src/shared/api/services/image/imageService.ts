import { api } from "@/shared/api";
import { objectToFormData } from "@/shared/api/utils";

class ImageService {
    uploadToLibrary(data: { image: File, name: string }) {
        const formData = objectToFormData(data)

        return api.post('/content/library/image', formData)
    }
}

export const imageService = new ImageService()