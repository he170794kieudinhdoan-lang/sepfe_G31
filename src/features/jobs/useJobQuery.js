import { useQuery } from '@tanstack/react-query'
import { getJobDetailApi } from '@/features/jobs/api/jobApi'

// ================================
// GET JOB DETAIL
// ================================
export const useJobDetail = (jobId) => {
    return useQuery({
        queryKey: ['job-detail', jobId],
        queryFn: () => getJobDetailApi(jobId),
        enabled: !!jobId,
    })
}