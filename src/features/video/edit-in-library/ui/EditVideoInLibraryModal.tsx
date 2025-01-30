'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/shared/shadcn/ui/dialog";
import { EditVideoInLibraryForm } from "./EditVideoInLibraryForm";
import { Button } from "@/shared/shadcn/ui/button";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";

export const EditVideoInLibraryModal = (props: { id: string }) => {
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
                    <DialogTitle>Редактировать видео</DialogTitle>
                    <DialogDescription>
                        Видео будет загружено в фоне, вы можете продолжать пользоваться сайтом.
                    </DialogDescription>
                </DialogHeader>
                <EditVideoInLibraryForm id={props.id} setOpen={setOpen}/>
            </DialogContent>
        </Dialog>
    )
}
