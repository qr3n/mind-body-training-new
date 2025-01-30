import { useQuery } from "@tanstack/react-query";
import { audioService } from "@/shared/api/services/audio";

export const useAudios = () => useQuery({
    queryFn: audioService.getAll,
    queryKey: ['library.audios'],
    retryOnMount: false,
    refetchOnMount: false
})