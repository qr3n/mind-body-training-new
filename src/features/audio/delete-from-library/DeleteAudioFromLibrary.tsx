'use client';

import { useMutation } from "@tanstack/react-query";
import { RiDeleteBinLine } from "react-icons/ri";
import { Button } from "@/shared/shadcn/ui/button";
import { audioService } from "@/shared/api/services/audio";

export const DeleteAudioFromLibrary = (props: { id: string }) => {
    const { mutate } = useMutation({
        mutationFn: audioService.deleteFromLibrary
    })

    return (
        <Button onClick={() => mutate({ id: props.id })} variant='ghost' size='icon' className='z-50 border border-transparent hover:border-blue-500 hover:bg-blue-100 h-9 w-9'>
            <RiDeleteBinLine className='w-5 h-5' />
        </Button>
    )
}
