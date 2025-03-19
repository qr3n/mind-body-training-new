'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/shared/shadcn/ui/dialog";
import { Button } from "@/shared/shadcn/ui/button";
import { UploadAudioToLibraryForm } from "@/features/audio/upload-to-library/UploadAudioToLibraryForm";
import { useState } from "react";


export const UploadAudioToLibraryModal = () => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Загрузить аудио</Button>
            </DialogTrigger>
            <DialogContent className='h-[100dvh] sm:h-auto max-w-[650px] overflow-y-auto sm:max-h-[80dvh]'>
                <DialogHeader>
                    <DialogTitle>Загрузить аудио</DialogTitle>
                    <DialogDescription>
                        Аудио будет загружено в фоне, вы можете продолжать пользоваться сайтом.
                    </DialogDescription>
                </DialogHeader>
                <UploadAudioToLibraryForm setIsOpen={setOpen}/>
            </DialogContent>
        </Dialog>
    )
}
