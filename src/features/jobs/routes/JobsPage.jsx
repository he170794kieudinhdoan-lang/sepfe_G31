
import { JobSearch } from '../components/JobSearch';
import { JobCard } from '../components/JobCard';
import { useJobs } from '../api/useJobs';

export const JobsPage = () => {
    const { data: jobs, isLoading, isError, error } = useJobs();

    return (
        <div>
            <JobSearch />

            <div className="container mx-auto px-6 mt-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold border-l-4 border-indigo-600 pl-4 text-gray-900">
                        Recommended Jobs
                    </h2>
                    <a href="#" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-semibold">View All Jobs &rarr;</a>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                )}

                {isError && (
                    <div className="text-center p-8 text-red-600 bg-red-50 rounded-xl border border-red-100">
                        Error loading jobs: {error?.message}
                    </div>
                )}

                {jobs && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {jobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>

            <div className="container mx-auto px-6 mt-16 mb-20">
                <h2 className="text-2xl font-bold border-l-4 border-indigo-600 pl-4 mb-8 text-gray-900">
                    Top Employers
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group bg-white border border-gray-100 rounded-2xl p-6 text-center cursor-pointer hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                            <div className="w-16 h-16 rounded-full bg-gray-50 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center text-2xl">🏢</div>
                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Top Corp {i}</h4>
                            <p className="text-xs text-gray-500 mt-2 font-medium">10+ Openings</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
