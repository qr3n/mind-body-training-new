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
import { UploadCloudIcon } from "lucide-react";
import { AudioPlayer } from "@/shared/ui/audio-player/AudioPlayer";
import { useSetAtom } from "jotai";
import { isSomethingUploadingAtom } from "@/features/training/create/model";

const FormSchema = z.object({
    audio:  z.instanceof(File, {
    message: "Необходимо загрузить аудио."
    }),
    subtitles: z.string().min(1, {
        message: "Описание обязательно.",
    }),
    duration: z.number()
})


const UploadSkeleton = () => {
    return (
        <div
            className='w-full px-5 py-5 border-blue-500 border border-dashed bg-blue-50 transition-all rounded-2xl flex gap-4 items-center'>
            <div className='p-3 border border-blue-300 bg-blue-200 rounded-full'>
                <UploadCloudIcon className='text-blue-500 w-7 h-7'/>
            </div>
            <div>
                <h1>Загрузите музыку</h1>
                <p className='text-[#444] text-sm mt-1'>Форматы .mp3 и wav</p>
            </div>
        </div>
    )
}


export const UploadAudioToLibraryForm = (props: { setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const setIsFetching = useSetAtom(isSomethingUploadingAtom)
    const { mutateAsync } = useMutation({
        mutationFn: audioService.addToLibrary,
        mutationKey: ['library.videos.upload']
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            subtitles: "",
            duration: 100
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsFetching(true)

        mutateAsync(data).then(() => setIsFetching(false))

        props.setIsOpen(false)
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
                            {value ? <AudioPlayer audioFile={value}/> :
                                <FileUploader type='audio' fieldProps={fieldProps} onChange={onChange}>
                                    <UploadSkeleton/>
                                </FileUploader>
                            }
                            <FormControl>
                                { value && <FileUploader type='audio' fieldProps={fieldProps} onChange={onChange}>
                                    <Button variant='ghost' className='bg-blue-50 border-blue-300 border text-center flex justify-center w-full'>Заменить аудио</Button>
                                </FileUploader>}
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
                    <Button type="submit">Добавить в библиотеку</Button>
                </div>
            </form>
        </Form>
    )
}