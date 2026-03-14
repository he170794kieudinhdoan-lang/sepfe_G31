import { useQuery } from '@tanstack/react-query'
import { getJobDetail } from '@/features/jobs/api/jobApi'

// ================================
// GET JOB DETAIL
// ================================
export const useJobDetail = (jobId) => {
    return useQuery({
        queryKey: ['job-detail', jobId],
        queryFn: () => getJobDetail(jobId),
        enabled: !!jobId,
    })
}