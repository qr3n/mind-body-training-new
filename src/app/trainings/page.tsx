import { DownloadTrainingMedia } from "@/features/training/download/ui/DownloadTrainingMedia";
import { trainingService } from "@/shared/api/services/training/trainingService";

export default async function TrainingsPage() {
    const allTrainings = await trainingService.getAll()

    return (
        <div className='flex flex-col gap-4 p-8'>
            <h1 className='text-center font-semibold text-3xl mb-8 mt-8'>Все тренировки</h1>
            { allTrainings.map(training => <div className='p-5 flex justify-between items-center shadow-lg rounded-2xl' key={training.id}>
                <div>
                    <h1 className='font-semibold text-2xl'>{training.title}</h1>
                </div>
                <DownloadTrainingMedia training={training}/>
            </div>)}
        </div>
    )
}