import classesJson from './classes.json'; // your JSON file

import type { Classes } from '@sharedTypes/classes';

// Typed JSON import
export const JobClasses: Classes[] = classesJson as Classes[];
