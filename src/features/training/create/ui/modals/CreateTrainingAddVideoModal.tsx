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
import { UploadVideoToLibraryModal } from "@/features/video/upload-to-library";
import { useVideos } from "@/entities/video/model/hooks";
import { API_URL }                                                        from "@/shared/api";
import { useSetAtom }                                                     from "jotai";
import { addVideoToBlock, trainingEquipment }                             from "@/features/training/create/model";
import { useCallback, useMemo, useState }                                 from "react";
import MultiSelect                                                        from "react-select";
import { components }                                                     from "react-select";
import { DeleteVideoFromLibrary }                                         from "@/features/video/delete-from-library/ui/DeleteVideoFromLibrary";
import { EditVideoInLibraryModal }                                        from "@/features/video/edit-in-library/ui/EditVideoInLibraryModal";
import { Input }                                                          from "@/shared/shadcn/ui/input";
import { videoEquipment, videoExerciseTypes, videoGenders, videoMuscles } from "@/entities/video";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }  from "@/shared/shadcn/ui/select";
import { AnimatedCheckbox }                                               from "@/shared/ui/animated-checkbox";

export const CreateTrainingAddVideoModal = (props: { blockId: string }) => {
    const setEquipment = useSetAtom(trainingEquipment)
    const { data } = useVideos();
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [selectedGender, setSelectedGender] = useState<string>('Любой')
    const [selectedExerciseType, setSelectedExerciseType] = useState<string>('Любой')
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
    const [searchName, setSearchName] = useState("");
    const addVideo = useSetAtom(addVideoToBlock);

    const handleClick = useCallback((id: string, equipment: string[], type: string, checksum?: string) => {
        addVideo({
            blockId: props.blockId,
            video: { id, type, checksum },
        })

        setEquipment((prevEquipment) => {
            const newEquipment = equipment.filter(
                (item) => !prevEquipment.includes(item)
            );

            return [...prevEquipment, ...newEquipment]
        });

    }, [addVideo, props.blockId, setEquipment])

    const videosNotFound = data && data.length === 0;

    const filteredVideos = useMemo(() => {
        return data?.filter((video) => {
            const matchesMuscles =
                selectedMuscles.length === 0 ||
                video.muscles_group.some(muscle => selectedMuscles.includes(muscle));
            const matchesEquipment =
                selectedEquipment.length === 0 ||
                selectedEquipment.every(equipment => video.equipment.includes(equipment));
            const matchesName = video.name.toLowerCase().includes(searchName.toLowerCase()) || video.filename.toLowerCase().includes(searchName.toLowerCase()) || video.description.toLowerCase().includes(searchName.toLowerCase());
            const matchesGenders = selectedGender === 'Любой' || video.gender === selectedGender;
            const matchesExerciseTypes = selectedExerciseType === 'Любой' || video.exercise_type === selectedExerciseType;

            return matchesMuscles && matchesEquipment && matchesName && matchesGenders && matchesExerciseTypes;
        });
    }, [data, selectedMuscles, selectedEquipment, searchName, selectedGender, selectedExerciseType]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className='flex gap-2 pr-12 justify-start text-[#777]'
                    variant='ghost'
                >
                    <Image src={addAudioImg} alt='add-audio' width={32} />
                    Добавить видео
                </Button>
            </DialogTrigger>
            <DialogContent className='overflow-hidden flex group justify-start flex-col h-[100dvh] sm:h-[80dvh] max-w-[950px]'>
                <DialogHeader>
                    <DialogTitle>{!videosNotFound && 'Добавить видео'}</DialogTitle>
                    <DialogDescription>
                        {!videosNotFound && 'Выберите необходимое видео, нажав на него.'}
                    </DialogDescription>
                </DialogHeader>

                {videosNotFound ? (
                    <div className='h-full flex flex-col items-center justify-center w-full relative'>
                        <h1 className='font-semibold text-2xl z-50'>Ни одного видео не найдено.</h1>
                        <p className='text-[#999] z-50 mb-4'>Загрузите первое видео, нажав кнопку ниже.</p>
                        <UploadVideoToLibraryModal />
                    </div>
                ) : (
                    <>
                        <Input
                            type="text"
                            placeholder="Название видео"
                            className='py-3'
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div>
                                <h1 className='text-xs mb-2 text-[#555]'>Пол</h1>
                                <MultiSelect
                                    placeholder="Группы мышц"
                                    options={videoMuscles}
                                    isMulti
                                    onChange={(selected) =>
                                        setSelectedMuscles(selected.map(option => option.value))
                                    }
                                    components={{
                                        Menu: (props) => <components.Menu {...props} className="menu"/>
                                    }}
                                    styles={{
                                        control: (baseStyles) => ({
                                            ...baseStyles,
                                            borderRadius: '0.7rem'
                                        }),
                                        menu: (baseStyles) => ({
                                            ...baseStyles,
                                            borderRadius: '1rem'
                                        }),
                                        container: (baseStyles) => ({
                                            ...baseStyles,
                                            fontSize: '14px',
                                        }),
                                        menuList: (baseStyles) => ({
                                            ...baseStyles,
                                            padding: '0.6rem',
                                        }),
                                        multiValue: (baseStyles) => ({
                                            ...baseStyles,
                                            borderRadius: '1000rem',
                                        }),
                                        multiValueRemove: (baseStyles) => ({
                                            ...baseStyles,
                                            borderRadius: '1000rem',
                                        }),
                                        option: (styles) => ({
                                            ...styles,
                                            borderRadius: '0.7rem',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                        }),
                                    }}
                                />
                            </div>

                            <div>
                                <h1 className='text-xs mb-2 text-[#555]'>Пол</h1>
                                <Select defaultValue='Любой' onValueChange={v => setSelectedGender(v)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Пол"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(['Любой', ...videoGenders]).map(g => <SelectItem key={g}
                                                                                           value={g}>{g}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <h1 className='text-xs mb-2 text-[#555]'>Тип упражнения</h1>
                                <Select defaultValue='Любой' onValueChange={v => setSelectedExerciseType(v)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Пол"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(['Любой', ...videoExerciseTypes]).map(g => <SelectItem key={g}
                                                                                                 value={g}>{g}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6">
                            {videoEquipment.map(item => (
                                <div key={item} className="flex items-center flex-col gap-1">
                                    <AnimatedCheckbox
                                        checked={selectedEquipment.includes(item)}
                                        onChangeValue={() => {
                                            const newValue = selectedEquipment.includes(item)
                                                ? selectedEquipment.filter((v) => v !== item)
                                                : [...selectedEquipment, item];
                                            setSelectedEquipment(newValue);
                                        }}
                                    />
                                    <label htmlFor={item} className="text-sm">{item}</label>
                                </div>
                            ))}
                        </div>

                        <div
                            className='mt-4 bg-gray-50 rounded-3xl h-[calc(80dvh-150px)] gap-4 px-3 py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-scroll'>
                            {filteredVideos?.map((video) => (
                                <div
                                    key={video.id}
                                    className='px-3 relative pt-2 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all rounded-2xl max-h-max cursor-pointer border'
                                >
                                    <DialogClose asChild>
                                        <div
                                            onClick={() => handleClick(video.id, video.equipment, video.exercise_type, video.checksum)}
                                            className='absolute top-0 left-0 rounded-2xl w-full h-full'/>
                                    </DialogClose>
                                    <div className='w-full aspect-video bg-gray-100 rounded-2xl'>
                                        <Image
                                            width={400}
                                            height={300}
                                            className='w-full aspect-video rounded-2xl'
                                            src={video.previewBlob || `${API_URL}/content/library/video/preview/${video.id}?v=${Date.now().toString()}`}
                                            alt={'video-preview'}
                                        />
                                    </div>
                                    <div className='flex items-center justify-between px-2 py-1'>
                                        <div className='p-2'>
                                            <h1 className='font-semibold'>{video.name}</h1>
                                            <p className='text-xs text-[#555] mt-0.5'>{video.filename}</p>
                                        </div>
                                        <div className='flex z-50 gap-1'>
                                            <DeleteVideoFromLibrary id={video.id}/>
                                            <EditVideoInLibraryModal id={video.id}/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <UploadVideoToLibraryModal/>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
