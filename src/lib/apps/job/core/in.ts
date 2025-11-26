import type { JobExpand, JobRunsExpand, JobRunsResponse, JobsResponse } from '$lib/shared';

export interface JobApp {
	shedule(job: JobsResponse<unknown, JobExpand>): Promise<JobRunsResponse<unknown, JobRunsExpand>>;
	run(jobRun: JobRunsResponse<unknown, JobRunsExpand>): Promise<void>;
}
