import Fuse from 'fuse.js';

import classesJson from './classes.json';

type Classes = {
	linkSkill: string;
	legionType: string;
	className: string;
	jobType: string;
};

export const JobClasses: Classes[] = classesJson;

export const LINK_SKILL = JobClasses.map((classes): string => classes.linkSkill) as readonly string[];
export const LEGION_TYPE = JobClasses.map((classes): string => classes.legionType) as readonly string[];
export const JOB_CLASSES = JobClasses.map((classes): string => classes.className) as readonly string[];
export const JOB_TYPE = JobClasses.map((classes): string => classes.jobType) as readonly string[];

const jobClassesByName: ReadonlyMap<string, Classes> = new Map(
	JobClasses.map((jobClass): [string, Classes] => [jobClass.className, jobClass]),
);

export const getClassByName = (className: string): Classes | null => jobClassesByName.get(className) ?? null;

export const generateClassCode = (className: string): string => {
	return className
		.trim()
		.toLowerCase()
		.replace(/[\s&]+/g, '_')
		.replace(/[^a-z0-9_]/g, '')
		.replace(/_+/g, '_');
};

const classCodeToNameMap: ReadonlyMap<string, string> = new Map(
	JobClasses.map((jobClass): [string, string] => [generateClassCode(jobClass.className), jobClass.className]),
);

export const getClassNameByCode = (code: string): string | null => classCodeToNameMap.get(code) ?? null;

const options = {
	keys: ['className'],
	threshold: 0.4,
	includeScore: true,
};

const fuse = new Fuse(JobClasses, options);

export const findBestClassMatch = (input: string): string => {
	const results = fuse.search(input);

	return results.length > 0 ? results[0].item.className : '';
};
