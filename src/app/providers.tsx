'use client';

import { PropsWithChildren } from "react";
import {
    QueryClientProvider,
} from '@tanstack/react-query'
import { Provider } from "jotai/react";
import { queryClient } from "@/shared/api/api";

export const Providers = (props: PropsWithChildren) => {
    return (
        <QueryClientProvider client={queryClient}>
            <Provider>
                {props.children}
            </Provider>
        </QueryClientProvider>
    )
}