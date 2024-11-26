'use client';

import React, { useCallback, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
    addAudioToBlock,
    addCreateTrainingBlock,
    blockAudiosAtomFamily,
    blockVideosAtomFamily,
    childBlocksAtomFamily,
    createTrainingFirstLevelBlocksAtomFamily,
    createTrainingSecondLevelBlocksAtomFamily,
} from "@/features/training/create/model";
import {
    DragDropContext,
    Draggable,
    DraggableProvidedDragHandleProps,
    Droppable,
    DropResult,
} from "@hello-pangea/dnd";
import { Block } from "@/features/training/create/ui/templates/Block";
import { Button } from "@/shared/shadcn/ui/button";
import { UploadVideoToLibraryModal } from "@/features/video/uploadToLibrary/ui/UploadVideoToLibraryModal";

interface IPropsFirstLevel {
    id: string;
    dragHandleProps: DraggableProvidedDragHandleProps | null;
    isDragging: boolean;
    isDimmed: boolean;
}

interface IProps {
    blocksIds: string[];
    setBlocksIds: React.Dispatch<React.SetStateAction<string[]>>;
    renderElement: React.FC<IPropsFirstLevel>;
}

const DraggableContentTemplate = ({ blocksIds, setBlocksIds, renderElement: Element }: IProps) => {
    const [draggingId, setDraggingId] = useState<string | null>(null);

    const onDragStart = useCallback((result: { draggableId: string }) => {
        setDraggingId(result.draggableId);
    }, []);

    const onDragEnd = useCallback(
        (result: DropResult) => {
            setDraggingId(null);
            const { source, destination } = result;
            if (!destination || source.index === destination.index) return;

            const reorderedIds = [...blocksIds];
            const [movedItem] = reorderedIds.splice(source.index, 1);
            reorderedIds.splice(destination.index, 0, movedItem);
            setBlocksIds(reorderedIds);
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
};

export const RenderBlocks = () => {
    const firstLevelIds = useAtomValue(childBlocksAtomFamily("root"));
    const setChildBlocks = useSetAtom(childBlocksAtomFamily("root"));
    const addBlock = useSetAtom(addCreateTrainingBlock);

    const handleAddGreeting = useCallback(() => {
        addBlock({
            level: "first",
            newBlock: {
                type: "greeting",
                title: "Welcome",
                subtitle: "Let’s start!",
                imageURL: "example.com/image",
            },
        });
    }, [addBlock]);

    return (
        <div className="px-8">
            <Button onClick={handleAddGreeting}>Add Greeting</Button>
            <DraggableContentTemplate
                renderElement={FirstLevel}
                blocksIds={firstLevelIds}
                setBlocksIds={setChildBlocks}
            />
        </div>
    );
};

const FirstLevel = ({ id, dragHandleProps, isDragging, isDimmed }: IPropsFirstLevel) => {
    const block = useAtomValue(createTrainingFirstLevelBlocksAtomFamily(id));
    const [childIds, setChildIds] = useAtom(childBlocksAtomFamily(id));
    const addBlock = useSetAtom(addCreateTrainingBlock);

    const handleAddSecondLevel = useCallback(() => {
        addBlock({
            level: "second",
            parentId: id,
            newBlock: {
                type: "phrase",
                parentId: id,
                audios: [],
            },
        });
    }, [addBlock, id]);

    return (
        <Block
            color="white"
            label={block?.type || "something"}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
            isDimmed={isDimmed}
        >
            <Button onClick={handleAddSecondLevel}>Add block</Button>
            <DraggableContentTemplate
                blocksIds={childIds}
                setBlocksIds={setChildIds}
                renderElement={SecondLevel}
            />
        </Block>
    );
};

const SecondLevel = ({ id, dragHandleProps, isDragging, isDimmed }: IPropsFirstLevel) => {
    const block = useAtomValue(createTrainingSecondLevelBlocksAtomFamily(id));
    const [childIds, setChildIds] = useAtom(childBlocksAtomFamily(id));
    const addBlock = useSetAtom(addCreateTrainingBlock);

    const handleAddThirdLevel = useCallback(() => {
        addBlock({
            level: "third",
            parentId: id,
            newBlock: {
                type: "phrase",
                parentId: id,
                audios: [],
            },
        });
    }, [addBlock, id]);

    return (
        <Block
            color="gray"
            label={block?.type || "something"}
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
            isDimmed={isDimmed}
        >
            <Button onClick={handleAddThirdLevel}>Add block</Button>
            <DraggableContentTemplate
                blocksIds={childIds}
                setBlocksIds={setChildIds}
                renderElement={ThirdLevel}
            />
        </Block>
    );
};

const ThirdLevel = ({ id, dragHandleProps, isDragging, isDimmed }: IPropsFirstLevel) => {
    const audios = useAtomValue(blockAudiosAtomFamily(id));
    const videos = useAtomValue(blockVideosAtomFamily(id));
    const addAudio = useSetAtom(addAudioToBlock);
    // const addVideo = useSetAtom(addVideoToBlock);

    const handleAddAudio = useCallback(() => {
        addAudio({ blockId: id, audio: { id: Date.now().toString() } });
    }, [addAudio, id]);

    // const handleAddVideo = useCallback(() => {
    //     addVideo({ blockId: id, video: { id: Date.now().toString() } });
    // }, [addVideo, id]);

    return (
        <Block
            color="white"
            label="THIRD"
            dragHandleProps={dragHandleProps}
            isDragging={isDragging}
            isDimmed={isDimmed}
        >
            <div>
                <h3>Block Details</h3>
                <div>
                    <h4>Audios:</h4>
                    <ul>
                        {audios.map((audio) => (
                            <li key={audio.id}>{audio.id}</li>
                        ))}
                    </ul>
                    <Button variant="outline" onClick={handleAddAudio}>Add Audio</Button>
                </div>
                <div>
                    <h4>Videos:</h4>
                    <ul>
                        {videos.map((video) => (
                            <Video key={video.id} />
                        ))}
                    </ul>
                    <UploadVideoToLibraryModal/>
                </div>
            </div>
        </Block>
    );
};

const Video = () => {
    return <div>Video</div>;
};
