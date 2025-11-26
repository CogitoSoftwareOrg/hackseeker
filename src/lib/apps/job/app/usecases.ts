import {
	Collections,
	JobRunsStatusOptions,
	JobsTaskOptions,
	JobsTypeOptions,
	pb,
	type JobExpand,
	type JobRunsExpand,
	type JobRunsResponse,
	type JobsResponse
} from '$lib/shared';

import type { JobApp } from '../core';

const JOB_LOCK_TTL = 10 * 60 * 1000;

export class JobAppImpl implements JobApp {
	async shedule(
		job: JobsResponse<unknown, JobExpand>
	): Promise<JobRunsResponse<unknown, JobRunsExpand>> {
		const lastRun = job.expand?.lastRun;

		if (lastRun?.attempt && lastRun.attempt >= job.maxAttempts) {
			await pb.collection(Collections.Jobs).update(job.id, {
				enabled: null,
				nextRun: null
			});
			throw new Error('Max attempts reached, job disabled');
		}

		const newRun: JobRunsResponse<unknown, JobRunsExpand> = await pb
			.collection(Collections.JobRuns)
			.create(
				{
					job: job.id,
					status: JobRunsStatusOptions.queued,
					attempt: lastRun ? lastRun.attempt + 1 : 1
				},
				{ expand: 'job' }
			);

		await pb.collection(Collections.Jobs).update(job.id, {
			lastRun: newRun.id,
			locked: new Date(Date.now() + JOB_LOCK_TTL)
		});

		return newRun;
	}

	async run(jobRun: JobRunsResponse<unknown, JobRunsExpand>): Promise<void> {
		const job = jobRun.expand?.job as JobsResponse<unknown, JobExpand>;
		if (!job) throw new Error('Job not found');

		try {
			// Mark as running
			await pb.collection(Collections.JobRuns).update(jobRun.id, {
				status: JobRunsStatusOptions.running
			});

			// Run task
			let result: unknown;
			switch (job.task) {
				case JobsTaskOptions.notify: {
					console.log('Notify job!');
					result = '"Success"';
					break;
				}
				default: {
					throw new Error(`Unknown task: ${job.task}`);
				}
			}

			// Mark as success
			await pb.collection(Collections.JobRuns).update(jobRun.id, {
				status: JobRunsStatusOptions.success,
				result
			});

			// Update job
			switch (job.type) {
				case JobsTypeOptions.once: {
					await pb.collection(Collections.Jobs).update(job.id, {
						enabled: null
					});
					break;
				}
				case JobsTypeOptions.every: {
					const delayMins = job.time ? parseInt(job.time) : 0;
					await pb.collection(Collections.Jobs).update(job.id, {
						nextRun: new Date(Date.now() + delayMins * 60 * 1000)
					});
					break;
				}
				case JobsTypeOptions.cron: {
					throw new Error('Cron jobs are not supported yet');
				}
			}
		} catch (error) {
			console.error(error, 'Failed to run job!');
			await pb.collection(Collections.JobRuns).update(jobRun.id, {
				status: JobRunsStatusOptions.failed,
				result: error instanceof Error ? error.message : 'Unknown error'
			});
		} finally {
			await pb.collection(Collections.Jobs).update(job.id, {
				locked: null
			});
		}
	}
}
