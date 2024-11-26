import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/shared/shadcn/ui/dialog";
import { InputForm } from "@/features/video/uploadToLibrary/ui/UploadVideoToLibraryForm";
import { Button } from "@/shared/shadcn/ui/button";

export const UploadVideoToLibraryModal = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Загрузить видео</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Загрузить видео</DialogTitle>
                    <DialogDescription>
                        Пожалуйста, не закрывайте страницу, пока видео не будет загружено.
                    </DialogDescription>
                </DialogHeader>
                <InputForm/>
            </DialogContent>
        </Dialog>
    )
}