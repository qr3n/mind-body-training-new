'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DownloadTrainingMedia } from "@/features/training/download/ui/DownloadTrainingMedia";
import { IUpdateIndexRequest, trainingService } from "@/shared/api/services/training/trainingService";
import { DeleteTraining } from "@/features/training/delete/ui/DeleteTraining";
import { DraggableChildProps, DraggableList } from '@/shared/ui/draggable-list';
import { useSetAtom } from "jotai/index";
import { resetAllBlockIndex } from "@/features/training/watch/model";

export default function TrainingsPage() {
    const resetAllBlockIndexes = useSetAtom(resetAllBlockIndex)

    const { data } = useQuery({
        queryFn: trainingService.getAll,
        queryKey: ['trainings.all'],
    });

    useEffect(() => {
        resetAllBlockIndexes()

        return () => resetAllBlockIndexes()
    }, [])

    const [trainingIds, setTrainingIds] = useState<string[]>([]);

    useEffect(() => {
        if (data) {
            setTrainingIds(data.map(training => training.id));
        }
    }, [data]);

    const handleReorder = (newOrder: string[]) => {
        setTrainingIds(newOrder);

        const reorderedTrainings: IUpdateIndexRequest[] = newOrder.map((trainingId, index) => ({
            training_id: trainingId,
            new_index: index
        }));

        trainingService.updateIndexes(reorderedTrainings)
    };

    const renderTraining = ({ id, dragHandleProps, isDragging, isDimmed, index }: DraggableChildProps) => {
        const training = data?.find(t => t.id === id);
        if (!training) return null;

        return (
            <div {...dragHandleProps} className={`p-5 flex cursor-grab justify-between items-center shadow-lg rounded-2xl ${isDimmed ? 'opacity-50' : ''}`}>
                {/* Применяем dragHandleProps к div */}
                <div>
                    <h1 className='font-semibold text-2xl'>{training.title}</h1>
                </div>
                <div className='flex gap-3'>
                    <DownloadTrainingMedia training={training} />
                    <DeleteTraining trainingId={training.id} />
                </div>
            </div>
        );
    };

    return (
        <div className='flex flex-col gap-4 p-8'>
            <h1 className='text-center font-semibold text-3xl mb-8 mt-8'>Все тренировки</h1>
            <DraggableList
                blocksIds={trainingIds}
                setBlocksIds={handleReorder}
                renderElement={renderTraining}
            />
        </div>
    );
}