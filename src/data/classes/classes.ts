import classesJson from './classes.json'; // your JSON file

import type { Classes } from '@sharedTypes/classes';

// Cast the imported JSON to the typed array
export const JobClasses: Classes[] = classesJson as Classes[];
