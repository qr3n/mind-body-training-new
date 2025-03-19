'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/shared/shadcn/ui/dialog";
import { UploadVideoToLibraryForm } from "./UploadVideoToLibraryForm";
import { Button } from "@/shared/shadcn/ui/button";
import { useState } from "react";

export const UploadVideoToLibraryModal = () => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Загрузить видео</Button>
            </DialogTrigger>
            <DialogContent className='h-[100dvh] sm:h-auto max-w-[650px] overflow-y-auto sm:max-h-[80dvh]'>
                <DialogHeader>
                    <DialogTitle>Загрузить видео</DialogTitle>
                    <DialogDescription>
                        Видео будет загружено в фоне, вы можете продолжать пользоваться сайтом.
                    </DialogDescription>
                </DialogHeader>
                <UploadVideoToLibraryForm setOpen={setOpen}/>
            </DialogContent>
        </Dialog>
    )
}
