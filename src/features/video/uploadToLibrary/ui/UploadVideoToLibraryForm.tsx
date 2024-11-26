"use client";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/shared/shadcn/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/shared/shadcn/ui/input";
import { Button } from "@/shared/shadcn/ui/button";
import { useEffect, useState } from "react";

const FormSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),

    file: z.instanceof(File)
});

const Video = ({ file }: { file: File }) => {
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        console.log('RERENDER')

        const url = URL.createObjectURL(file);
        setSrc(url);

        return () => {
            URL.revokeObjectURL(url); // Очистка URL для предотвращения утечек памяти
        };
    }, [file]);

    return src ? (
        <video src={src} className="w-[100px] h-[80px] aspect-video" controls />
    ) : null;
};

export function InputForm() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: "",
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log("Submitted data: ", data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Picture</FormLabel>
                            {value && <Video file={value} />}
                            <FormControl>
                                <Input
                                    {...fieldProps}
                                    placeholder="Picture"
                                    type="file"
                                    accept="video/*"
                                    onChange={(event) =>
                                        onChange(event.target.files && event.target.files[0])
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Название</FormLabel>
                            <FormControl>
                                <Input placeholder="shadcn" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Загрузить</Button>
            </form>
        </Form>
    );
}
