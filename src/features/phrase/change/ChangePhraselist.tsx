'use client';

import { Button } from "@/shared/shadcn/ui/button";
import { EditIcon } from "lucide-react";
import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { audioService, IAvailableAudio } from "@/shared/api/services/audio";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/shared/shadcn/ui/dialog";
import { useAudios } from "@/entities/audio";
import useRipple from "use-ripple-hook";

interface IProps extends IAvailableAudio {
    audioId: string,
    inPhrases?: boolean,
    type: 'sounds' | 'end' | 'laps_qty' | 'reps_qty',
    phrase_id?: string
}

const Audio = (props: IProps) => {
    const { mutate: addAudio } = useMutation({
        mutationFn: audioService.addToPhrases,
    })


    const { mutate: deleteAudio } = useMutation({
        mutationFn: audioService.deleteFromPhrases,
    })

    return (
        <div
            className='transition-all max-h-min h-min relative border cursor-pointer flex items-center justify-between gap-3 p-4 rounded-2xl shadow-md w-full'
            style={{ backgroundColor: props.inPhrases ? '#f3f9ff' : 'white', borderColor: props.inPhrases ? '#b9c0ff' : '#eee' }}
        >
            <div
                onClick={() => props.inPhrases ? deleteAudio({ phrase_id: props.phrase_id || ''}) : addAudio({audio_id: props.audioId})}
                className='absolute z-10 top-0 left-0 rounded-2xl w-full h-full'/>

            <div className='flex gap-3 items-center'>
                {props.inPhrases && (
                    <svg className='min-w-[24px] min-h-[24px]' width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#007BFF"/>
                        <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                )}
                <h1 className='font-semibold'>{props.name}</h1>
                <p>{props.subtitles}</p>
            </div>
            <div className='flex gap-1 z-50'>
            </div>
        </div>
    )

}


export const ChangePhraselist = () => {
    const {data} = useQuery({
        queryFn: audioService.getPhrases,
        queryKey: ['phrases'],
        retryOnMount: false,
        refetchOnMount: false
    })
    const {data: audios} = useAudios();

    return (
        <Dialog>
            <DialogTrigger asChild>
            <Button variant='ghost'
                        className={`border mb-8 border-transparent hover:border-blue-500 hover:bg-blue-100 flex gap-2 py-5 bg-blue-50`}>
                    <div
                        className='w-7 h-7 p-0 bg-blue-500 flex items-center justify-center hover:bg-blue-600 rounded-full'>
                        <EditIcon className='w-4 h-4 text-white'/>
                    </div>
                    Изменить список фраз
                </Button>
            </DialogTrigger>

            <DialogContent className='overflow-hidden flex group justify-start flex-col h-[100dvh] sm:h-[80dvh] max-w-[1080px] '>
                <DialogHeader>
                    <DialogTitle>Добавить фразу</DialogTitle>
                    <DialogDescription>
                        Выберите необходимую фразу, нажав на нее.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-gray-50 rounded-3xl h-min max-h-[calc(80dvh-10px)] px-3 py-3 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {audios?.length && audios.length > 0 ? (
                        audios?.map((audio) => (
                            <Audio  inPhrases={data?.some(e => e.audio_id === audio.id)} type={'sounds'} {...audio} phrase_id={data?.find(e => e.audio_id === audio.id)?.id} key={audio.id} audioId={audio.id}/>
                        ))
                    ) : (
                        <p className="text-center text-[#777]">Ничего не найдено</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}