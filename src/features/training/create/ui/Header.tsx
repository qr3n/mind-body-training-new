'use client';

import { z } from "zod";
import { Button } from "@/shared/shadcn/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/shared/shadcn/ui/select";
import { useAtom } from "jotai/index";
import {
    assembleTrainingBlocksAtom, blockSoundsAtomFamily, cycleTrainingMusic,
    isSomethingUploadingAtom,
    trainingEquipment
} from "@/features/training/create/model";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/shared/shadcn/ui/form";
import { useMutation }             from "@tanstack/react-query";
import { trainingService }                        from "@/shared/api/services/training/trainingService";
import { BlockSounds } from "@/features/training/create/ui/templates/BlockSounds";
import { AnimatedCheckbox } from "@/shared/ui/animated-checkbox";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import Link from "next/link";

const FormSchema = z.object({
    title: z.string(),
    description: z.string(),
    audio: z.string(),
    speakerVolume: z.number(),
    musicVolume: z.number(),
})
const avaiableEquipment = ['Эспандер тр.', 'Резинка', 'Коврик', 'Стул', 'Скамья', 'Гантели', 'Штанга']


const Equipment = () => {
    const [equipment, setEquipment] = useAtom(trainingEquipment)

    return (
        <div className='flex gap-6 items-center pb-12 px-4'>
            {avaiableEquipment.map(e =>
                <div key={e} className='flex flex-col items-center gap-1 justify-center'>
                    <AnimatedCheckbox
                        checked={equipment.includes(e)}
                        onChangeValue={
                            () => equipment.includes(e) ? setEquipment(prev => prev.filter(eq => eq !== e)) :
                                setEquipment(prev => [...prev, e])
                        }/>
                    <p>{e}</p>
                </div>
            )}
        </div>
    )
}

interface IProps {
    edit?: boolean,
    id?: string,
    title?: string,
    description?: string,
    initialMusicVolume?: number,
    initialSpeakerVolume?: number
}

export const Header = (props: IProps) => {
    const router = useRouter()
    const [cycle, setCycle] = useAtom(cycleTrainingMusic)
    const isFetching = useAtomValue(isSomethingUploadingAtom);
    const audios = useAtomValue(blockSoundsAtomFamily('root.audios'))
    const equipment = useAtomValue(trainingEquipment)
    const training = useAtomValue(assembleTrainingBlocksAtom)
    const { mutateAsync, isPending, isSuccess } = useMutation({
        mutationFn: props.edit ? trainingService.edit : trainingService.create,
        mutationKey: ['trainings.create']
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: props.title || 'Название',
            description: props.description || 'Описание',
            speakerVolume: props.initialSpeakerVolume || 1,
            musicVolume: props.initialMusicVolume  || 0.7
        }
    })

    const onClick = () => {
        if (isFetching) {
            toast.error('Не весь контент загружен полностью.')
        }

        else {
            toast.promise(mutateAsync({
                title: form.getValues('title'),
                cycle: cycle,
                speaker_volume: form.getValues('speakerVolume'),
                music_volume: form.getValues('musicVolume'),
                rawTraining: JSON.stringify(training),
                audio: JSON.stringify(audios),
                gender: 'male',
                equipment: equipment,
                id: props.id
            }), {
                loading: 'Сохранение...',
                success: 'Успешно! Перенаправление...',
                error: 'Что-то пошло не так...'
            })
        }
    }

    useEffect(() => {
        if (isSuccess) {
            toast.success('Тренировка сохранена')
            router.push('/trainings')
        }
    }, [isSuccess])

    return (
        <Form {...form}>
            <form onSubmit={onClick}>
                <div className='w-full bg-blue-500 p-4 flex justify-between items-center z-[500] fixed top-0'>
                    <div className='flex items-center text-white gap-3 lg:gap-8'>
                        <div className="relative">
                            <FormField render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <input
                                            {...field}
                                            type="text"
                                            className="text-white font-semibold text-3xl border rounded-md p-2 w-full h-12 placeholder-blue-300 outline-none bg-transparent border-none"
                                            placeholder="Название"
                                        />
                                    </FormControl>
                                </FormItem>
                            )} name={'title'}/>
                            <div
                                className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-blue-500 to-transparent pointer-events-none"/>
                        </div>

                        <div className='gap-6 hidden lg:flex select-none items-center'>
                            <p className='text-lg'>Базис здоровья</p>
                            <Select defaultValue='male'>
                                <SelectTrigger className="w-[100px] bg-none! border-none outline-none  text-white">
                                    <SelectValue placeholder="Выберите пол" className='bg-none! text-white'/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Выберите пол</SelectLabel>
                                        <SelectItem value="male">Муж</SelectItem>
                                        <SelectItem value="female">Жен</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <Button
                            disabled={isPending || isFetching}
                            type='button'
                            onClick={onClick}
                            className='rounded-xl bg-black hover:bg-[#222]'
                        >
                            Сохранить
                        </Button>

                        {props.edit && <Link href={'/trainings'}>
                            <Button
                                type='button'
                                className='rounded-xl bg-blue-900 hover:bg-blue-950'
                            >
                                Выйти
                            </Button>
                        </Link>}
                    </div>
                </div>

                <h1 className='p-8 text-3xl font-semibold mt-20'>Параметры всей тренировки</h1>
                <div className='px-8'>
                    <Equipment/>
                    <div className='flex gap-12 '>
                        <BlockSounds id={'root.audios'}/>
                        <div className='w-[200px] mt-16 text-zinc-600'>
                            <h1>Громкость</h1>

                            <div className='flex mt-4 gap-8'>
                                <div className='flex flex-col items-center justify-center'>
                                    <input
                                        {...form.register('speakerVolume', { valueAsNumber: true })}
                                        className='w-10 h-10 bg-blue-500 text-center text-white flex items-center justify-center font-bold rounded-xl'/>
                                    <h1 className='text-sm mt-1'>Диктор</h1>
                                </div>
                                <div className='flex flex-col items-center justify-center'>
                                    <input
                                        {...form.register('musicVolume', { valueAsNumber: true })}
                                        className='w-10 h-10 bg-blue-500 text-center text-white flex items-center justify-center font-bold rounded-xl'/>
                                    <h1 className='text-sm mt-1'>Музыка</h1>
                                </div>
                            </div>
                            <div className='mt-8 gap-2 items-center mb-8 flex'>
                                <AnimatedCheckbox rounded checked={cycle} onChangeValue={() => setCycle(prev => !prev)}/>
                                Зациклить
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
};