import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/shared/shadcn/ui/dialog";
import { Button } from "@/shared/shadcn/ui/button";
import Image from "next/image";
import { addAudioImg } from "@/features/training/create/ui/assets";
import { useSetAtom }                          from "jotai";
import {
    addEndSoundToBlock,
    addLapsQtySoundToBlock,
    addRepsQtySoundToBlock,
    addSoundToBlock
} from "@/features/training/create/model";
import { useAudios }                           from "@/entities/audio";
import { UploadAudioToLibraryModal } from "@/features/audio/upload-to-library/UploadAudioToLibraryModal";
import useRipple from "use-ripple-hook";
import { IAvailableAudio } from "@/shared/api/services/audio";
import { Input } from "@/shared/shadcn/ui/input";
import { useMemo, useState } from "react";
import { DeleteAudioFromLibrary } from "@/features/audio/delete-from-library/DeleteAudioFromLibrary";
import { EditAudioInLibraryModal } from "@/features/audio/edit-in-library/EditAudioInLibraryModal";


const typesActionsMap = {
    'sounds': addSoundToBlock,
    'end': addEndSoundToBlock,
    'reps_qty': addRepsQtySoundToBlock,
    'laps_qty': addLapsQtySoundToBlock,
}


interface IProps extends IAvailableAudio {
    blockId: string,
    isEnd?: boolean,
    type: 'sounds' | 'end' | 'laps_qty' | 'reps_qty'
}

const Audio = (props: IProps) => {
    const addSound = useSetAtom(typesActionsMap[props.type])
    const [ref, event] = useRipple({
        color: 'rgba(214,234,255,0.38)'
    })

    return (
            <div
                className='transition-all max-h-min h-min relative border border-[#eee] cursor-pointer flex items-center justify-between gap-3 p-4 bg-white rounded-2xl shadow-md w-full'>
                <DialogClose asChild>
                    <div
                        onClick={() => {
                            addSound({
                                blockId: props.blockId,
                                audio: {
                                    type: 'audio',
                                    id: props.id,
                                }
                            })
                        }}
                        ref={ref}
                        onMouseDown={event}
                        className='absolute z-10 top-0 left-0 rounded-2xl w-full h-full'/>
                </DialogClose>

                <div className='flex gap-3 items-center'>
                    <audio className='hidden'/>
                    <h1 className='font-semibold'>{props.name}</h1>
                    <p>{props.subtitles}</p>
                </div>
                <div className='flex gap-1 z-50'>
                    <EditAudioInLibraryModal id={props.id}/>
                    <DeleteAudioFromLibrary id={props.id}/>
                </div>
            </div>
    )

}

export const CreateTrainingAddSoundModal = (props: { id: string, isEnd?: boolean, type: 'sounds' | 'end' | 'laps_qty' | 'reps_qty' }) => {
    const { data } = useAudios();
    const audiosNotFound = data && data.length === 0;

    const [filter, setFilter] = useState(""); // Для фильтрации

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter((audio) =>
            `${audio.name} ${audio.subtitles}`.toLowerCase().includes(filter.toLowerCase())
        );
    }, [data, filter]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type='button' className="flex gap-2 pr-12 justify-start text-[#777]" variant="ghost">
                    <Image src={addAudioImg} alt="add-audio" width={32} />
                    Добавить аудио
                </Button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden flex group justify-start flex-col h-[100dvh] sm:h-[80dvh] max-w-[1080px]">
                <DialogHeader>
                    <DialogTitle>{!audiosNotFound && "Добавить аудио"}</DialogTitle>
                    <DialogDescription>
                        {!audiosNotFound && "Выберите необходимое аудио, нажав на него."}
                    </DialogDescription>
                </DialogHeader>

                {audiosNotFound ? (
                    <div className="h-full flex flex-col items-center justify-center w-full relative">
                        <h1 className="font-semibold text-2xl z-50">Ни одного аудио не найдено.</h1>
                        <p className="text-[#999] z-50 mb-4">Загрузите первое аудио, нажав кнопку ниже.</p>
                        <UploadAudioToLibraryModal />
                    </div>
                ) : (
                    <div className="flex flex-col space-y-3">
                        {/* Input для фильтрации */}
                        <Input
                            placeholder="Введите название или субтитры"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="mb-4"
                        />
                        <div className='h-[calc(80dvh-220px)]'>
                            <div
                                className="bg-gray-50 rounded-3xl h-min max-h-[calc(80dvh-220px)] px-3 py-3 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredData.length > 0 ? (
                                    filteredData.map((audio) => (
                                        <Audio type={props.type} isEnd={props.isEnd} {...audio} key={audio.id} blockId={props.id}/>
                                    ))
                                ) : (
                                    <p className="text-center text-[#777]">Ничего не найдено</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!audiosNotFound && <UploadAudioToLibraryModal/>}
            </DialogContent>
        </Dialog>
    );
};