"use client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/shared/shadcn/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/shared/shadcn/ui/input";
import { Button } from "@/shared/shadcn/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/shared/shadcn/ui/toggle-group";
import { MediaRender } from "@/features/video/upload-to-library/ui/UploadVideoToLibraryMediaRender";
import { motion } from "framer-motion";
import { FileUploader } from "@/shared/ui/file-uploader/ui/FileUploader";
import { useMutation } from "@tanstack/react-query";
import { videoService } from "@/shared/api/services/video";
import Select, { components } from 'react-select'
import { UploadCloudIcon } from "lucide-react";
import { AnimatedCheckbox }                                                                from "@/shared/ui/animated-checkbox";
import {
    videoCategories,
    videoEquipment,
    videoExerciseTypes,
    UploadVideoFormSchema,
    videoGenders,
    videoMuscles
} from "@/entities/video";
import { useSetAtom } from "jotai/index";
import { isSomethingUploadingAtom } from "@/features/training/create/model";

const UploadSkeleton = ({ text }: { text: string }) => {
    return (
        <motion.div
            exit={{opacity: 0}}
            className='flex flex-col items-center border-blue-500 border border-dashed bg-blue-50 justify-center rounded-2xl w-full aspect-video'
        >
            <div className='p-2 border border-blue-300 bg-blue-200 rounded-full'>
                <UploadCloudIcon className='text-blue-500 w-6 h-6'/>
            </div>
            <div className='mt-2 text-center'>
                <h1 className='text-sm'>Выберите файл</h1>
                <p className='text-[#444] text-xs mt-1'>Формат {text === 'видео' ? 'mp4' : 'png'}</p>
            </div>
        </motion.div>
    )
}


import React, { useEffect, useRef, useState } from "react";
import { Slider } from "@/shared/shadcn/ui/slider";
import { FaPause } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";


export function UploadVideoToLibraryForm(props: { setOpen: (open: boolean) => void }) {
    const setIsFetching = useSetAtom(isSomethingUploadingAtom)
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            if (videoRef.current) {
                setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100 || 0);
            }
        };

        const video = videoRef.current;
        if (video) {
            video.addEventListener("timeupdate", updateProgress);
            return () => video.removeEventListener("timeupdate", updateProgress);
        }
    }, []);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (value: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = (value / 100) * videoRef.current.duration;
            setProgress(value);
        }
    };
    const { mutate } = useMutation({
        mutationFn: videoService.addToLibrary,
        mutationKey: ['library.video.upload'],
        onSuccess: () => setIsFetching(false)
    })

    const form = useForm<z.infer<typeof UploadVideoFormSchema>>({
        resolver: zodResolver(UploadVideoFormSchema),
        defaultValues: {
            name: "",
            description: "",
            category: videoCategories[0],
            exercise_type: videoExerciseTypes[0],
            muscles_group: [],
            equipment: [],
            gender: videoGenders[0],
        },
    });

    function onSubmit(data: z.infer<typeof UploadVideoFormSchema>) {
        setIsFetching(true)
        mutate({...data, duration: 800});
        props.setOpen(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                <div className='flex flex-col sm:flex-row'>

                    <FormField
                        control={form.control}
                        name="video"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem className='w-full p-2'>
                                <FormLabel>Видео</FormLabel>
                                <FormControl>
                                    <div>
                                        <FileUploader type='video' fieldProps={fieldProps} onChange={onChange}>
                                            {value ?         <MediaRender file={value} type="video" videoRef={videoRef} />
                                                :
                                                <UploadSkeleton text={'видео'}/>}
                                        </FileUploader>

                                        { value && (
                                            <div className="flex gap-2 justify-center mt-2">
                                                <Button type='button' className='w-8 h-8' onClick={handlePlayPause}>
                                                    {isPlaying ? <FaPause className='w-3 h-3'/> : <FaPlay className='w-3 h-3'/>}
                                                </Button>

                                                <Slider
                                                    value={[progress]}
                                                    onValueChange={(value) => handleSeek(value[0])}
                                                    max={100}
                                                    step={0.1}
                                                    className="w-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="image"
                        render={({field: {value, onChange, ...fieldProps}}) => (
                            <FormItem className='w-full p-2'>
                                <FormLabel>Изображение</FormLabel>
                                <FormControl>
                                    <FileUploader type='image' fieldProps={fieldProps} onChange={onChange}>
                                        {value ? <MediaRender file={value} type="image" /> : <UploadSkeleton text={'изображение'}/>}
                                    </FileUploader>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                <div className='flex items-center justify-between'>
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field: { onChange } }) => (
                            <FormItem>
                                <FormControl>
                                    <ToggleGroup defaultValue={videoCategories[0]} onValueChange={onChange} type="single" className='w-max'>
                                        {videoCategories.map(category => <ToggleGroupItem size='lg' key={category} value={category}>{category}</ToggleGroupItem>)}
                                    </ToggleGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='max-w-[60%] min-w-[40%]'>
                        <FormField
                            control={form.control}
                            name='muscles_group'
                            render={({ field: { onChange } }) => (
                                <Select
                                    placeholder='Группы мышц'
                                    options={videoMuscles}
                                    isMulti
                                    onChange={(newValue) => onChange(newValue.map(v => v.value))}
                                    components={{
                                        Menu: (props) => <components.Menu {...props} className="menu" />
                                    }}
                                    styles={{
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        control: (baseStyles) => ({
                                            ...baseStyles,
                                            borderRadius: '0.7rem'
                                        }),

                                        menu: (baseStyles) => ({
                                            ...baseStyles,
                                            borderRadius: '1rem'
                                        }),

                                        container: (baseStyles) => ({
                                            ...baseStyles,
                                            fontSize: '14px',
                                        }),

                                        menuList: (baseStyles) => ({
                                            ...baseStyles,
                                            padding: '0.6rem',
                                        }),

                                        multiValue: (baseStyles) => ({
                                            ...baseStyles,
                                            borderRadius: '1000rem',
                                        }),

                                        multiValueRemove: (baseStyles) => ({
                                            ...baseStyles,
                                            borderRadius: '1000rem',
                                        }),

                                        option: (styles) => {
                                            return {
                                                ...styles,
                                                borderRadius: '0.7rem',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                            };
                                        },
                                    }}
                                />
                            )}
                        />
                    </div>
                </div>
                <FormField
                    control={form.control}
                    name="equipment"
                    render={({ field: { value, onChange } }) => (
                        <FormItem>
                            <FormLabel>Оборудование</FormLabel>
                            <FormControl>
                                <div className="flex flex-wrap gap-6">
                                    {videoEquipment.map(item => (
                                        <div key={item} className="flex items-center flex-col gap-1">
                                            <AnimatedCheckbox
                                                checked={value.includes(item)}
                                                onChangeValue={() => {
                                                    const newValue = value.includes(item)
                                                        ? value.filter((v) => v !== item)
                                                        : [...value, item];
                                                    onChange(newValue);
                                                }}
                                            />
                                            <label htmlFor={item} className="text-sm">{item}</label>
                                        </div>
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="exercise_type"
                    render={({ field: { onChange } }) => (
                        <FormItem className='mt-4'>
                            <FormControl>
                                <ToggleGroup defaultValue={videoExerciseTypes[0]} onValueChange={onChange} type="single" className='w-max mt-6'>
                                    {videoExerciseTypes.map(exerciseType => <ToggleGroupItem size='lg' key={exerciseType} value={exerciseType}>{exerciseType}</ToggleGroupItem>)}
                                </ToggleGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Название упражнения</FormLabel>
                            <FormControl>
                                <Input placeholder="Приседания" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Описание упражнения</FormLabel>
                            <FormControl>
                                <Input placeholder="Начинаем!..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='w-full flex justify-end'>
                    <Button type="submit">Добавить в библиотеку</Button>
                </div>
            </form>
        </Form>
    );
}
