import React, { Dispatch, memo, SetStateAction, useCallback, useState }                        from "react";
import { DragDropContext, Draggable, DraggableProvidedDragHandleProps, Droppable, DropResult } from "@hello-pangea/dnd";

export interface DraggableChildProps {
    id: string;
    dragHandleProps: DraggableProvidedDragHandleProps | null;
    isDragging: boolean;
    isDimmed: boolean;
    level?: 'first' | 'second' | 'third',
    index: number
}

interface IProps {
    blocksIds: string[];
    setBlocksIds: Dispatch<SetStateAction<string[]>> | ((newOrder: string[]) => void);
    renderElement: React.FC<DraggableChildProps>;
}


export const DraggableList = memo(({ blocksIds, setBlocksIds, renderElement: Element }: IProps) => {
    const [draggingId, setDraggingId] = useState<string | null>(null);

    const onDragStart = useCallback((result: { draggableId: string }) => {
        setDraggingId(result.draggableId);
    }, []);

    const onDragEnd = useCallback(
        (result: DropResult) => {
            const { source, destination } = result;
            if (!destination || source.index === destination.index) {
                setTimeout(() => setDraggingId(null), 0); // Задержка сброса
                return;
            }

            const reorderedIds = [...blocksIds];
            const [movedItem] = reorderedIds.splice(source.index, 1);
            reorderedIds.splice(destination.index, 0, movedItem);
            setBlocksIds(reorderedIds);

            setTimeout(() => setDraggingId(null), 0); // Задержка сброса
        },
        [blocksIds, setBlocksIds]
    );

    return (
        <DragDropContext onDragStart={onDragStart}  onDragEnd={onDragEnd}>
            <Droppable droppableId="blocks">
                {(provided) => (
                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                        {blocksIds.map((id, index) => (
                            <Draggable key={id} draggableId={id} index={index}>
                                {(provided) => (
                                    <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="mb-4"
                                    >
                                        <Element
                                            id={id}
                                            index={index}
                                            dragHandleProps={provided.dragHandleProps}
                                            isDragging={draggingId === id}
                                            isDimmed={draggingId !== null && draggingId !== id}
                                        />
                                    </li>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </ul>
                )}
            </Droppable>
        </DragDropContext>
    );
});

DraggableList.displayName = 'DraggableList'