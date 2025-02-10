import { videoService } from "@/shared/api/services/video";
import { useQuery } from "@tanstack/react-query";

export const useVideos = () => useQuery({
    queryFn: videoService.getAll,
    queryKey: ['library.videos'],
    retryOnMount: false,
    refetchOnMount: false,
})