'use client';

import { CreateTraining } from "@/features/training/create";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";
import { TBlockType } from "@/entities/training";
import './page.css'

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
  return (
      <>
          <CreateTraining.Header/>

          <div className='w-full p-3 flex justify-between z-50 sticky items-center top-[80px] bg-[#f7f6f8] mb-4'>
              <CreateTrainingTemplates.AddBlocks isTransparent blocksTypes={blocksTypes}/>
          </div>
          <CreateTraining.RenderBlocks/>
      </>
  );
}
