'use client';


import { ITraining, TBlockType } from "@/entities/training";
import { CreateTraining }                                   from "@/features/training/create";
import { CreateTrainingTemplates }    from "@/features/training/create/ui/templates";
import { initializeBlocksAtom }                  from "@/features/training/create/model";
import { useSetAtom }                            from "jotai";
import { useEffect }                             from "react";

const blocksTypes: TBlockType[] = [
    'greeting',
    'ascet',
    'circle',
    'phrase',
    'split',
    'warmup',
    'testing',
    'stretch',
    'done',
]


export const EditTraining = ({ training }: { training: ITraining }) => {
    const initializeBlocks = useSetAtom(initializeBlocksAtom);

    useEffect(() => {
        initializeBlocks(training)
    }, [initializeBlocks, training]);

    return (
        <>
            <CreateTraining.Header
                initialMusicVolume={training.music_volume}
                initialSpeakerVolume={training.speaker_volume}
                edit id={training.id}
                title={training.title}
            />
            <div className='w-full p-3 flex justify-between z-50 sticky items-center top-[80px] bg-[#f7f6f8] mb-4'>
                <CreateTrainingTemplates.AddBlocks isTransparent blocksTypes={blocksTypes}/>
            </div>
            <CreateTraining.RenderBlocks/>
        </>
    )
}