import axios from "axios";
import { API_URL } from "@/shared/api/config";
import { QueryClient } from "@tanstack/react-query";

export const api = axios.create({
    baseURL: API_URL,
    timeout: -1
})

export const queryClient = new QueryClient({
    defaultOptions: {},
})