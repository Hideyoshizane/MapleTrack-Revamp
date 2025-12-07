type JobClass = 'No Job' | '1st Class' | '2nd Class' | '3rd Class' | '4th Class' | 'V Class' | 'VI Class';

export const getJob = (level: number): JobClass => {
	if (level === 0) return 'No Job';
	if (level < 30) return '1st Class';
	if (level < 60) return '2nd Class';
	if (level < 100) return '3rd Class';
	if (level < 200) return '4th Class';
	if (level < 260) return 'V Class';
	return 'VI Class';
};
