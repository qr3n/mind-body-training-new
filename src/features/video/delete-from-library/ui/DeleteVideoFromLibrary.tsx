'use client';

import { useMutation } from "@tanstack/react-query";
import { videoService } from "@/shared/api/services/video";
import { RiDeleteBinLine } from "react-icons/ri";
import { Button } from "@/shared/shadcn/ui/button";

export const DeleteVideoFromLibrary = (props: { id: string }) => {
    const { mutate } = useMutation({
        mutationFn: videoService.deleteFromLibrary
    })

    return (
        <Button onClick={() => mutate({ id: props.id })} variant='ghost' size='icon' className='border border-transparent hover:border-blue-500 hover:bg-blue-100 h-9 w-9'>
            <RiDeleteBinLine className='w-5 h-5' />
        </Button>
    )
}
