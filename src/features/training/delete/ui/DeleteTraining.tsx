import { Button } from "@/shared/shadcn/ui/button";
import { useMutation } from "@tanstack/react-query";
import { trainingService } from "@/shared/api/services/training/trainingService";
import toast from "react-hot-toast";
import { Trash2Icon } from "lucide-react";

export const DeleteTraining = (props: { trainingId: string }) => {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: trainingService.deleteTraining
    })

    const handleClick = () => {
        toast.promise(mutateAsync({ id: props.trainingId }), {
            loading: 'Удаление тренировки',
            success: 'Тренировка удалена',
            error: 'Что-то пошло не так...'
        })
    }

    return (
        <Button variant='destructive' size={'icon'} onClick={handleClick} disabled={isPending}>
            <Trash2Icon/>
        </Button>
    )
}