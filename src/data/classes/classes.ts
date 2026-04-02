import classesJson from './classes.json';

export type Classes = {
	linkSkill: string;
	legionType: string;
	className: string;
	jobType: string;
};

export const JobClasses: Classes[] = classesJson as Classes[];

export const LINK_SKILL = JobClasses.map((classes): string => classes.linkSkill) as readonly string[];
export const LEGION_TYPE = JobClasses.map((classes): string => classes.legionType) as readonly string[];
export const JOB_CLASSES = JobClasses.map((classes): string => classes.className) as readonly string[];
export const JOB_TYPE = JobClasses.map((classes): string => classes.jobType) as readonly string[];

export const jobClassesByName: ReadonlyMap<string, Classes> = new Map(
	JobClasses.map((jobClass): [string, Classes] => [jobClass.className, jobClass]),
);

export const getClassByName = (className: string): Classes | null => {
	return jobClassesByName.get(className) ?? null;
};

export const getLinkSkillByClassName = (className: string): string | null => {
	const jobClass = jobClassesByName.get(className);
	return jobClass ? jobClass.linkSkill : null;
};

export const getLegionTypeByClassName = (className: string): string | null => {
	const jobClass = jobClassesByName.get(className);
	return jobClass ? jobClass.legionType : null;
};

export const getJobTypeByClassName = (className: string): string | null => {
	const jobClass = jobClassesByName.get(className);
	return jobClass ? jobClass.jobType : null;
};

export const generateClassCode = (className: string): string => {
	return className
		.trim()
		.toLowerCase()
		.replace(/[\s&]+/g, '_')
		.replace(/[^a-z0-9_]/g, '')
		.replace(/_+/g, '_');
};

export const classCodeToNameMap: ReadonlyMap<string, string> = new Map(
	JobClasses.map((jobClass): [string, string] => [generateClassCode(jobClass.className), jobClass.className]),
);

export const getClassNameByCode = (code: string): string | null => {
	return classCodeToNameMap.get(code) ?? null;
};
