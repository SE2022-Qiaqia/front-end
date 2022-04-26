export enum Role {
  student = 'student',
  teacher = 'teacher',
  admin = 'admin'
}

export enum Day {
  Sun = 'Sun',
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat'
}

export interface College {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  entranceYear: number;
  college: College;
  role: Role;
  avatar?: string;
}

export interface Course {
  id: number;
  commonId: number;
  name: string;
  teacher: User;
  location: string,
  start: number;
  duration: number;
  dayOfWeek: number;
}

export const maxCoursePeriodsCount = 5 + 4 + 3; // 早上、下午、晚上