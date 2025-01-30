'use client';

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/shared/shadcn/ui/form";
import { Input } from "@/shared/shadcn/ui/input";
import { FileUploader } from "@/shared/ui/file-uploader/ui/FileUploader";
import { useMutation } from "@tanstack/react-query";
import { audioService } from "@/shared/api/services/audio";
import { Button } from "@/shared/shadcn/ui/button";
import { Dispatch, SetStateAction } from "react";
import { useAudios } from "@/entities/audio";
import { AudioPlayer } from "@/shared/ui/audio-player/AudioPlayer";
import { API_URL } from "@/shared/api";
import { useSetAtom } from "jotai/index";
import { isSomethingUploadingAtom } from "@/features/training/create/model";

const FormSchema = z.object({
    audio:  z.instanceof(File).optional(),
    subtitles: z.string().min(1, {
        message: "Описание обязательно.",
    }),
    duration: z.number()
})


export const EditAudioInLibraryForm = (props: { id: string, setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const { data } = useAudios()
    const audio = data?.find(a => a.id === props.id)
    const setIsFetching = useSetAtom(isSomethingUploadingAtom)

    const {mutate} = useMutation({
        mutationFn: audioService.editInLibrary,
        mutationKey: ['library.videos.upload']
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            subtitles: audio?.subtitles || "",
            duration: 100
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsFetching(true)
        props.setIsOpen(false)

        mutate({
            ...data,
            audio_id: props.id
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                <FormField
                    control={form.control}
                    name="audio"
                    render={({field: {value, onChange, ...fieldProps}}) => (
                        <FormItem className='w-full p-2'>
                            <FormLabel>{value?.name || 'Аудио'}</FormLabel>
                            <AudioPlayer audioFile={value} audioSrc={!value ? `${API_URL}/content/stream/audio/${props.id}` : undefined}/>
                            <FormControl>
                                <FileUploader type='audio' fieldProps={fieldProps} onChange={onChange}>
                                    <Button variant='ghost' className='bg-blue-50 border-blue-300 text-center flex justify-center w-full'>Заменить аудио</Button>
                                </FileUploader>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />


                <FormField
                    control={form.control}
                    name="subtitles"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Описание упражнения</FormLabel>
                            <FormControl>
                                <Input placeholder="Начинаем!..." {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <div className='w-full flex justify-end'>
                    <Button type="submit">Подтвердить изменение</Button>
                </div>
            </form>
        </Form>
    )
}