import { trainingService } from "@/shared/api/services/training/trainingService";
import { WatchTraining } from "@/app/trainings/[id]/WatchTraining";
import { v4 as uuidv4 } from 'uuid';
import { ITrainingBlockWithContent } from "@/entities/training";

const addIdsRecursively = (data: ITrainingBlockWithContent[]): ITrainingBlockWithContent[] => {
    return data.map(item => {
        const newItem: ITrainingBlockWithContent = { ...item, id: uuidv4() };
        if (Array.isArray(newItem.content)) {
            newItem.content = addIdsRecursively(newItem.content);
        }
        return newItem;
    });
};


export default async function WatchTrainPage({params}: { params: Promise<{ id: string }> }) {
    const id = (await params).id
    const training = await trainingService.get(id)
    const blocks = addIdsRecursively(training.blocks)

    console.log(blocks)

    return (
        <div className='w-[100dvw] h-[100dvh] overflow-hidden select-none'>
            <WatchTraining training={training} trainingAudio={training.audio} blocks={blocks}/>
        </div>
    );
};
