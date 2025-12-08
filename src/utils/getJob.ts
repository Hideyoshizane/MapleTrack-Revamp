type JobClass = 'No Job' | '1st Class' | '2nd Class' | '3rd Class' | '4th Class' | 'V Class' | 'VI Class';

const jobThresholds: { min: number; job: JobClass }[] = [
	{ min: 0, job: 'No Job' },
	{ min: 1, job: '1st Class' },
	{ min: 30, job: '2nd Class' },
	{ min: 60, job: '3rd Class' },
	{ min: 100, job: '4th Class' },
	{ min: 200, job: 'V Class' },
	{ min: 260, job: 'VI Class' },
];

// Find the highest threshold that level is greater than or equal to

export const getJob = (level: number): JobClass => {
	for (let i = jobThresholds.length - 1; i >= 0; i--) {
		if (level >= jobThresholds[i].min) {
			return jobThresholds[i].job;
		}
	}
	return 'No Job';
};
