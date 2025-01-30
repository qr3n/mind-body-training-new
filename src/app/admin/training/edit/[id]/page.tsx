
import { trainingService } from "@/shared/api/services/training/trainingService";
import { EditTraining }    from "@/app/admin/training/edit/[id]/EditTraining";

export default async function EditTrainingPage({params}: { params: Promise<{ id: string }> }) {
    const id = (await params).id
    const training = await trainingService.get(id)


    return (
        <>
            <EditTraining training={training}/>
        </>
    )
}