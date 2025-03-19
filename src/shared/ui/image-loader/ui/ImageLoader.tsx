'use client';

import Image, { ImageProps } from 'next/image'
import { useEffect, useState } from "react";

export const ImageLoader = (props: ImageProps) => {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (loaded) alert('loaded')
    }, [loaded])

    return (
        <>
            <Image
                {...props}
                alt={'image'}
                data-loaded='false'
                onLoad={() => setLoaded(true)}
                onLoadingComplete={() => setLoaded(true)}
                style={{ display: loaded ? 'block' : 'none' }}
            />
            {!loaded &&
                <div
                    className='data-[loaded=false]:animate-pulse rounded-xl w-full h-full data-[loaded=false]:bg-gray-900/10'
                />}
        </>
    );
};
