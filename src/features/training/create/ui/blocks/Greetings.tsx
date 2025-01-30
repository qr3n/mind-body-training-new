import { DraggableChildProps } from "@/shared/ui/draggable-list";
import { Block } from "@/features/training/create/ui/templates/Block";
import React, { useEffect, useMemo, useState } from "react";
import { CreateTrainingTemplates } from "@/features/training/create/ui/templates";
import { useAtom } from "jotai/index";
import {
    blockDescriptionAtomFamily,
    blockImagesNamesAtomFamily,
    blockTitleAtomFamily
} from "@/features/training/create/model";
import { Input } from "@/shared/shadcn/ui/input";
import { Textarea } from "@/shared/shadcn/ui/textarea";
import { UploadCloudIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { imageService } from "@/shared/api/services/image/imageService";
import Image from "next/image";
import toast from "react-hot-toast";
import { API_URL } from "../../../../../shared/api";

export const Greetings = (props: DraggableChildProps) => {
    const { mutateAsync, isPending } = useMutation({
        mutationFn: imageService.uploadToLibrary,
        mutationKey: ['uploadImageToLibrary'],
    });
    const [src, setSrc] = useState<string | null>(null);
    const [title, setTitle] = useAtom(blockTitleAtomFamily(props.id));
    const [description, setDescription] = useAtom(blockDescriptionAtomFamily(props.id));

    const [imageName, setImageName] = useAtom(blockImagesNamesAtomFamily(props.id));
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const cachedSrc = useMemo(() => src, [src]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const name = Date.now().toString();

            setImageName(name);

            toast.promise(mutateAsync({ image: file, name }), {
                loading: `Загрузка изображения`,
                success: `Изображение загружено!`,
                error: `Что-то пошло не так...`
            });

            setSelectedFile(file);
        }
    };

    useEffect(() => {
        if (selectedFile) {
            const newSrc = URL.createObjectURL(selectedFile);
            setSrc(newSrc);

            return () => URL.revokeObjectURL(newSrc);
        }
    }, [selectedFile]);

    return (
        <Block
            color="white"
            level="first"
            label="GREETINGS"
            {...props}
        >
            <div className="gap-3 mb-8 flex flex-col relative">
                <div className="relative w-full max-w-[300px] active:scale-95 transition-all">
                    {cachedSrc ? (
                        <>
                            <Image
                                width={400}
                                height={300}
                                className='w-full aspect-video rounded-2xl cursor-pointer'
                                src={cachedSrc}
                                alt={'image-preview'}
                                style={{ opacity: isPending ? 0.5 : 1 }}
                            />
                            <input
                                type="file"
                                accept=".png"
                                onChange={handleFileChange}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </>
                    ) : imageName ? <div>
                        <Image
                            draggable={false}
                            priority={true}
                            src={`${API_URL}/content/library/image/${imageName}`}
                            className='w-full aspect-video rounded-2xl cursor-pointer'
                            width={400}
                            height={300}
                            alt='woman'
                        />
                        <input
                            type="file"
                            accept=".png"
                            onChange={handleFileChange}
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div> : (
                        <div
                            className="flex active:scale-95 transition-all flex-col items-center border-blue-500 border border-dashed bg-blue-50 justify-center aspect-video rounded-2xl h-min max-h-min w-full max-w-[300px] py-6"
                        >
                        <input
                                type="file"
                                accept=".png"
                                onChange={handleFileChange}
                                className="absolute w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="p-2 border border-blue-300 bg-blue-200 rounded-full">
                                <UploadCloudIcon className="text-blue-500 w-6 h-6" />
                            </div>
                            <div className="mt-2 text-center">
                                <h1 className="text-sm">Выберите файл</h1>
                                <p className="text-[#444] text-xs mt-1">Формат png</p>
                            </div>
                        </div>
                    )}
                </div>
                <label className="text-sm -mb-2 mt-4">Название</label>
                <Input
                    className="bg-gray-50 rounded-lg max-w-[600px]"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Название"
                />
                <label className="text-sm -mb-2">Описание</label>
                <Textarea
                    className="bg-gray-50 rounded-lg max-w-[600px]"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Описание"
                />
            </div>
            <CreateTrainingTemplates.BlockSounds id={props.id} />
        </Block>
    );
};
