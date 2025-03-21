import {
    useVideos,
    videoCategories, videoEquipment,
    videoExerciseTypes,
    videoGenders,
    videoMuscles, EditVideoFormSchema
} from "@/entities/video";
import { useForm }                                                        from "react-hook-form";
import { z }                                                              from "zod";
import { zodResolver }                                                    from "@hookform/resolvers/zod";
import { useMutation }                                                    from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/shadcn/ui/form";
import {
    FileUploader
}                                                                         from "@/shared/ui/file-uploader/ui/FileUploader";
import {
    MediaRender
}                                                                         from "@/features/video/upload-to-library/ui/UploadVideoToLibraryMediaRender";
import { ToggleGroup, ToggleGroupItem }                                   from "@/shared/shadcn/ui/toggle-group";
import Select, { components }                                             from "react-select";
import { AnimatedCheckbox }                                               from "@/shared/ui/animated-checkbox";
import { Input }                                                          from "@/shared/shadcn/ui/input";
import { Button }                                                         from "@/shared/shadcn/ui/button";
import React, { useMemo, useRef, useState } from "react";
import Image                                                              from "next/image";
import { API_URL }                                                        from "@/shared/api";
import { videoService }                             from "@/shared/api/services/video";
import { useAtomValue, useSetAtom }                 from "jotai/index";
import { allTrainingVideosAtom, trainingEquipment } from "@/features/training/create/model";
import { FaPause } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";
import { Slider } from "@/shared/shadcn/ui/slider";
import { openDB } from "idb";
import { IndexedDBService } from "@/shared/indexed-db";
import { Checkbox } from "@/shared/shadcn/ui/checkbox";
import { getVideoDuration } from "@/shared/utils/getVideoDuraton";

export const EditVideoInLibraryForm = (props: { id: string, setOpen: (open: boolean) => void }) => {
    const setEquipment = useSetAtom(trainingEquipment)
    const { data } = useVideos()
    const video = useMemo(() => data?.find(v => v.id === props.id), [data, props.id])
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [slowMotion, setSlowMotion] = useState(video?.playback_rate === 0.5);

    const allVideos = useAtomValue(allTrainingVideosAtom)
    const { mutateAsync } = useMutation({
        mutationFn: videoService.editVideoInLibrary,
        mutationKey: ['video.edit']
    })

    const form = useForm<z.infer<typeof EditVideoFormSchema>>({
        resolver: zodResolver(EditVideoFormSchema),
        defaultValues: {
            name: video?.name || "",
            description: video?.description || "",
            category: video?.category || videoCategories[0],
            exercise_type: video?.exercise_type || videoExerciseTypes[0],
            muscles_group: video?.muscles_group || [],
            equipment: video?.equipment || [],
            gender: video?.gender || videoGenders[0],
            playback_rate: video?.playback_rate || 1
        },
    });

    function onSubmit(formData: z.infer<typeof EditVideoFormSchema>) {
        // Получаем текущее оборудование из текущего видео
        const currentEquipment = video?.equipment || [];
        // Получаем обновленный список оборудования из формы
        const updatedEquipment = formData.equipment;

        // Ищем все видео, кроме текущего
        const otherVideos = allVideos
            .filter((v) => v.id !== props.id) // Исключаем текущее видео
            .map((v) => data?.find((video) => video.id === v.id))
            .filter(Boolean); // Убираем undefined

        const otherEquipment = otherVideos.flatMap((v) => v?.equipment || []);

        const otherEquipmentSet = new Set(otherEquipment);
        const currentEquipmentSet = new Set(currentEquipment);
        const updatedEquipmentSet = new Set(updatedEquipment);

        const removedEquipment = currentEquipment.filter(
            (item) => !updatedEquipmentSet.has(item) && !otherEquipmentSet.has(item)
        );

        const addedEquipment = updatedEquipment.filter(
            (item) => !currentEquipmentSet.has(item) && !otherEquipmentSet.has(item)
        );

        // Обновляем состояние trainingEquipment
        setEquipment((prevEquipment) => {
            const updatedSet = new Set(prevEquipment);
            addedEquipment.forEach((item) => updatedSet.add(item));
            removedEquipment.forEach((item) => updatedSet.delete(item));
            return Array.from(updatedSet);
        });

        props.setOpen(false);

        async function send() {
            const duration = formData.video ? await getVideoDuration(formData.video) : video?.duration

            await mutateAsync({
                video_id: props.id,
                ...formData,
                video: formData.video ? formData.video : undefined,
                image: formData.image ? formData.image : undefined,
                duration: duration || 42,
                playback_rate: formData.playback_rate
            }).then(async (d) => {
                if (formData.video) {
                    const initDB = async () => {
                        return openDB("trainingMediaDB", 1, {
                            upgrade(db) {
                                if (!db.objectStoreNames.contains("videos")) {
                                    db.createObjectStore("videos", { keyPath: "id" });
                                }
                                if (!db.objectStoreNames.contains("sounds")) {
                                    db.createObjectStore("sounds", { keyPath: "id" });
                                }
                            },
                        });
                    };

                    const db = await initDB();
                    const tx = db.transaction("videos", "readonly");
                    const store = tx.objectStore("videos");
                    const indexedDBService = await IndexedDBService.initialize();

                    await indexedDBService.save_video({
                        id: props.id,
                        blob: formData.video,
                        checksum: 'NEW CHECKSUM' + Date.now()
                    });
                }
            });
        }

        send()
    }

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

    const src = useMemo(() => `${API_URL}/content/stream/video/${props.id}?v=${Date.now().toString()}`, [])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
                <div className='flex flex-col sm:flex-row'>

                    <FormField
                        control={form.control}
                        name="video"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem className='w-full p-2'>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Видео</FormLabel>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            className='w-5 h-5 border-zinc-300'
                                            id="slow-motion"
                                            checked={slowMotion}
                                            onCheckedChange={(checked) => {
                                                setSlowMotion(checked === true);
                                                form.setValue('playback_rate', checked === true ? 0.5 : 1);
                                            }}
                                        />
                                        <label
                                            htmlFor="slow-motion"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            0.5x
                                        </label>
                                    </div>
                                </div>
                                <FormControl>
                                    <div>
                                        <FileUploader type='video' fieldProps={fieldProps} onChange={onChange}>
                                            {value ?
                                                <MediaRender file={value} type="video" videoRef={videoRef}/> :
                                                <MediaRender
                                                    src={src}
                                                    type="video"
                                                    videoRef={videoRef}
                                                />
                                            }
                                        </FileUploader>

                                        <div className="flex gap-2 justify-center mt-2">
                                            <Button type='button' className='w-8 h-8' onClick={handlePlayPause}>
                                                {isPlaying ? <FaPause className='w-3 h-3'/> :
                                                    <FaPlay className='w-3 h-3'/>}
                                            </Button>

                                            <Slider
                                                value={[progress]}
                                                onValueChange={(value) => handleSeek(value[0])}
                                                max={100}
                                                step={0.1}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem className='w-full p-2'>
                                <FormLabel>Изображение</FormLabel>
                                <FormControl>
                                    <FileUploader type='image' fieldProps={fieldProps} onChange={onChange}>
                                        {value ? <MediaRender file={value} type="image" /> : <Image
                                            src={video?.imageBlob || `${API_URL}/content/library/video/image/${props.id}`}
                                            width={400}
                                            height={300}
                                            className='w-full aspect-video rounded-2xl'
                                            alt={'preview'} />
                                        }
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
                                    <ToggleGroup defaultValue={video?.category || videoCategories[0]} onValueChange={onChange} type="single" className='w-max'>
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
                                    defaultValue={video?.muscles_group.map(v => ({ value: v, label: v })) || []}
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
                                <ToggleGroup defaultValue={video?.exercise_type || videoExerciseTypes[0]} onValueChange={onChange} type="single" className='w-max mt-6'>
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
                    <Button type="submit">Подтвердить изменение</Button>
                </div>
            </form>
        </Form>
    )
}