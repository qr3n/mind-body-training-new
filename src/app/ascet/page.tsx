'use client';

import {
    Carousel,
    CarouselItem,
    CarouselContent,
    CarouselApi
} from "@/shared/shadcn/ui/carousel";
import { Button } from "@/shared/shadcn/ui/button";
import { useQuery } from "@tanstack/react-query";
import { trainingService } from "@/shared/api/services/training/trainingService";
import { useVideos } from "@/entities/video";
import Image from "next/image";
import { API_URL } from "@/shared/api";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";
import { useSetAtom } from "jotai";
import { watchTrainingAscetSeconds } from "@/features/training/watch/model";
import Link from "next/link";

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

    console.log(filteredTrainingsWithAscet)

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

    return (
        <div className='watch w-[100dvw] h-[100dvh] flex items-center bg-zinc-200 p-8 justify-center'>
            <div className='max-w-xl flex flex-col p-4 w-full h-full sm:h-[70dvh] bg-white rounded-2xl'>
                <div className='flex flex-col h-full'>
                    <div className='p-2'>
                        <h1 className='font-semibold'>ВЫПОЛНИТЬ АСКЕЗУ</h1>
                        <p className='font-semibold text-zinc-500'>ДО 600 БАЛЛОВ</p>
                    </div>

                    <h1 className='px-2 mt-8 mb-8'><span className='font-semibold'>НАЗВАНИЕ:</span> {videos?.find(v => v.id === previews?.at(currentSelected)?.id)?.name}</h1>
                    <Carousel setApi={setApi} opts={{loop: true}} className="w-full max-w-xl">
                        <CarouselContent className="-ml-1">
                            {(previews || []).map((preview, index) => (
                                <CarouselItem key={index} className="p-4  basis-1/2 md:basis-1/3 lg:basis-1/3">
                                    <Image
                                        width={400}
                                        height={300}
                                        className='w-full aspect-square object-cover rounded-xl transition-all'
                                        style={{ scale: currentSelected === index ? '110%' : '90%', opacity: currentSelected === index ? '100%' : '80%' }}
                                        src={`${API_URL}/content/library/video/image/${preview?.id}?v=${preview?.checksum}`}
                                        alt={'video-preview'}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    <Select defaultValue={'15'} onValueChange={v => setTrainingAscetSeconds(Number(v) * 60)}>
                        <SelectTrigger className="w-[100px] mt-8 font-medium self-end justify-self-end text-white bg-blue-500">
                            <SelectValue placeholder="Select a fruit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {Array.from({ length: 100 }, (_, i) => i + 1).map(e =>
                                    <SelectItem value={e.toString()} key={e}>{e} МИН</SelectItem>
                                )}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <Link href={`/trainings/${filteredTrainingsWithAscet?.at(currentSelected)?.id}`}>
                    <Button className='w-full font-semibold'>
                        НАЧАТЬ АСКЕЗУ
                    </Button>
                </Link>

            </div>
        </div>
    )
}