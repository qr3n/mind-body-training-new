import { trainingService } from "@/shared/api/services/training/trainingService";
import { WatchTraining } from "@/app/trainings/[id]/WatchTraining";

export default async function WatchTrainPage({params}: { params: Promise<{ id: string }> }) {
    const id = (await params).id
    const training = await trainingService.get(id)

    return (
        <div className='w-[100dvw] h-[100dvh] overflow-hidden select-none'>
            <WatchTraining training={training} trainingAudio={training.audio} blocks={training.blocks}/>
        </div>
    );
};
