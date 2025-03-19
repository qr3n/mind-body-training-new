'use client';

import {
    Carousel,
    CarouselItem,
    CarouselContent,
    CarouselApi
} from "@/shared/shadcn/ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { trainingService } from "@/shared/api/services/training/trainingService";
import { useVideos } from "@/entities/video";
import Image from "next/image";
import { API_URL } from "@/shared/api";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem,  SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";
import { useSetAtom } from "jotai";
import { watchTrainingAscetSeconds } from "@/features/training/watch/model";
import ascet from './ascet.png'
import { BsInfoLg } from "react-icons/bs";
import band from './band.png'
import chair from './chair.png'
import expander from './espanderTube.png'
import yogaMat from './yogaMat.png'
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { DownloadTrainingMedia } from "@/features/training/download/ui/DownloadTrainingMedia";

const equipmentMap: Record<string, StaticImport> = {
    'Резинка': band,
    'Эспандер тр.': expander,
    'Коврик': yogaMat,
    'Стул': chair
}

export default function AscetPage() {
    const setTrainingAscetSeconds = useSetAtom(watchTrainingAscetSeconds)
    const [currentSelected, setCurrentSelected] = useState(0)
    const { data: videos } = useVideos()
    const [api, setApi] = useState<CarouselApi>()
    const { data } = useQuery({
        queryFn: trainingService.getAll,
        queryKey: ['trainings.all'],
    })

    useEffect(() => {
        setTrainingAscetSeconds(15 * 60)
    }, [])

    const trainingsWithAscet = data?.filter(d => d.blocks.some(b => b.type === 'ascet'))

    const filteredTrainingsWithAscet = trainingsWithAscet?.filter(b => b.blocks.find(c => c.type === 'ascet')?.content?.some(d => d.type === 'exercise' && d.videos.length > 0))

    const previews = filteredTrainingsWithAscet
        ?.flatMap(b => b.blocks.find(d => d.type === 'ascet')?.content?.map(c => c.type === 'exercise' ? c.videos[0] : null) || [])
        .filter(Boolean);

    useEffect(() => {
        if (!api) {
            return
        }

        api.on("select", () => {
            setCurrentSelected(api.selectedScrollSnap())
        })
    }, [api])

    const handleEquipmentClick = (index: number) => {
        if (index !== -1 && api) {
            api.scrollTo(index);
        }
    };

    return (
        <div className='watch w-[100dvw] h-[100dvh] flex items-center bg-zinc-200 px-[5px] justify-center'>
            <div className='max-w-xl flex flex-col p-4 w-full h-max bg-white rounded-2xl'>
                <div className='flex flex-col h-full'>
                    <div className='p-2 flex justify-between items-center w-full'>
                        <div className='flex items-center gap-2'>
                            <Image src={ascet} alt={'ascet'} width={40} height={40}/>
                            <div>
                                <h1 className='font-semibold'>ВЫПОЛНИТЬ АСКЕЗУ</h1>
                                <p className='font-semibold text-zinc-500'>ДО 600 БАЛЛОВ</p>
                            </div>
                        </div>

                        <div className='bg-blue-500 rounded-lg cursor-pointer p-2 w-max h-max'>
                            <BsInfoLg className='text-white'/>
                        </div>
                    </div>

                    <h1 className='px-2 mt-8 mb-6 h-[50px]'><span
                        className='font-semibold'>НАЗВАНИЕ:</span> {videos?.find(v => v.id === previews?.at(currentSelected)?.id)?.name}
                    </h1>
                    <Carousel setApi={setApi} opts={{loop: true}} className="w-full">
                        <CarouselContent className="-ml-1">
                            {(previews || []).map((preview, index) => (
                                <CarouselItem onClick={() => handleEquipmentClick(index)} key={index} className="p-2 basis-1/3 md:basis-1/4 lg:basis-1/4">
                                    <Image
                                        width={500}
                                        height={500}
                                        className='w-full aspect-square object-contain rounded-xl transition-all'
                                        style={{
                                            scale: currentSelected === index ? '110%' : '80%',
                                            opacity: currentSelected === index ? '100%' : '75%'
                                        }}
                                        src={`${API_URL}/content/library/video/image/${preview?.id}?v=${Date.now().toString()}`}
                                        alt={'video-preview'}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    <Select defaultValue={'15'} onValueChange={v => setTrainingAscetSeconds(Number(v) * 60)}>
                        <SelectTrigger
                            className="w-[130px] mt-8 font-semibold mr-4 text-lg self-end justify-self-end text-white bg-blue-500">
                            <SelectValue placeholder="Select a fruit"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {Array.from({length: 100}, (_, i) => i + 1).map(e =>
                                    <SelectItem value={e.toString()} key={e}>{e} МИН</SelectItem>
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <div className='p-2 mt-4 '>
                        <h1 className='font-semibold text-xl'>Вам нужно:</h1>
                        <div className='flex gap-3 py-4'>
                            {videos?.find(v => v.id === previews?.at(currentSelected)?.id)?.equipment.map((a, i) =>
                                <div key={i} className='rounded-xl shadow-md w-max h-max'>
                                    <Image width={130} height={130} className='w-[120px] rounded-xl h-[120px] object-contain' src={equipmentMap[a] || chair} alt={'eq'}/>
                                </div>
                            )}
                        </div>
                        {videos?.find(v => v.id === previews?.at(currentSelected)?.id)?.equipment.join(', ')}
                    </div>
                </div>

                <div className='w-full mt-8'>
                    {filteredTrainingsWithAscet?.at(currentSelected) && <DownloadTrainingMedia inAscet training={filteredTrainingsWithAscet!.at(currentSelected)!}/>}
                </div>
            </div>
        </div>
    )
}