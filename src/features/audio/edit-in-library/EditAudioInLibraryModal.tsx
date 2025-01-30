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
import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import {
    EditAudioInLibraryForm,
} from "@/features/audio/edit-in-library/EditAudioInLibraryForm";

export const EditAudioInLibraryModal = (props: { id: string }) => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-9 w-9 border border-transparent hover:border-blue-500 hover:bg-blue-100'
                >
                    <FiEdit className='w-5 h-5' />
                </Button>
            </DialogTrigger>
            <DialogContent className='h-[100dvh] sm:h-auto max-w-[650px]'>
                <DialogHeader>
                    <DialogTitle>Редактировать аудио</DialogTitle>
                    <DialogDescription>
                        Аудио будет загружено в фоне, вы можете продолжать пользоваться сайтом.
                    </DialogDescription>
                </DialogHeader>
                <EditAudioInLibraryForm id={props.id} setIsOpen={setOpen}/>
            </DialogContent>
        </Dialog>
    )
}
