import { env } from '$env/dynamic/private';

import { Collections, pb, type JobExpand, type JobsResponse } from '$lib';
import { getDI } from '$lib/shared/server';

const JOB_RUN_INTERVAL = 30 * 1000;

export function startWorker() {
	console.log('Starting job worker...');
	const di = getDI();

	const tick = async () => {
		console.log('Running job worker...');
		try {
			await ensureAdminPb();

			const jobs: JobsResponse<unknown, JobExpand>[] = await pb
				.collection(Collections.Jobs)
				.getFullList({
					filter: 'enabled != null && nextRun <= @now && (locked = null || locked <= @now)',
					expand: 'lastRun'
				});

			await Promise.all(
				jobs.map(async (job) => {
					try {
						const jobRun = await di.job.shedule(job);
						await di.job.run(jobRun);
					} catch (error) {
						console.error(error, 'Failed to schedule job!');
					}
				})
			);
		} catch (e) {
			console.error(e, 'Worker tick failed');
		} finally {
			setTimeout(tick, JOB_RUN_INTERVAL);
		}
	};

	// стартуем первый тик
	void tick();
}

async function ensureAdminPb() {
	if (!pb.authStore.isValid) {
		try {
			await pb.collection(Collections.Superusers).authWithPassword(env.PB_EMAIL, env.PB_PASSWORD);
		} catch (error) {
			console.error(error, 'Failed to authenticate admin user! Oh no!');
			throw error;
		}
	}
}
