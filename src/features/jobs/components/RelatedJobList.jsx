import { JobCardHorizontal } from './JobCardHorizontal';

export const RelatedJobList = ({ jobs }) => {
  if (jobs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Chưa có tin liên quan.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {jobs.map((job) => (
        <JobCardHorizontal key={job.id} job={job} />
      ))}
    </div>
  );
};
