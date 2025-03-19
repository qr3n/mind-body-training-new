'use client';

import { CreateTraining } from "@/features/training/create";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";
import { TBlockType } from "@/entities/training";
import './page.css'
import { useAudios } from "@/entities/audio";
import { useQuery } from "@tanstack/react-query";
import { audioService } from "@/shared/api/services/audio";
import { useAtomValue } from "jotai/index";
import { newCreateTrainingAddBlocksMode } from "@/features/training/create/model";

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


export default function Home() {
    const { isLoading } = useAudios()

    const { isLoading: isLoading2 } = useQuery({
        queryFn: audioService.getPhrases,
        queryKey: ['phrases'],
        retryOnMount: false,
        refetchOnMount: false
    })

    const newMode = useAtomValue(newCreateTrainingAddBlocksMode)

    return (
      <div className='editor'>
          <CreateTraining.Header/>

          {!isLoading && !isLoading2 && (
              <>
                  <div
                      style={{ position: newMode ? 'relative' : 'sticky', zIndex: newMode ? '50' : '1000', top: newMode ? 'auto' : '80px', left: newMode ? 'auto' : '0' }}
                      className='w-full p-3 flex justify-between   items-center bg-[#f7f6f8] mb-4'>
                      <CreateTrainingTemplates.AddBlocks isTransparent blocksTypes={blocksTypes}/>
                  </div>
                  <CreateTraining.RenderBlocks/>
              </>
          )}
      </div>
  );
}
