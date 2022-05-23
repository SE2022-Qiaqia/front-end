import { Model } from "./common";

export enum Role {
  Student = 0,
  Teacher = 1,
  Admin = 2
}

export enum StudentCourseStatus {
  Normal = 0,
  Withdraw = 1
}

export interface User extends Model {
  username: string;
  realName: string;
  role: Role;
  college: College;
  entranceYear: number;
}

export interface College extends Model {
  name: string;
}

export interface CourseCommon extends Model {
  name: string;
  credits: number;
  hours: number;
  college: College;
}

export interface CourseCommonWithSpecifics extends Model, CourseCommon {
  courseSpecifics: CourseSpecificWithoutCommon[];
}

export interface CourseSpecificWithoutCommon extends Model {
  teacher: User;
  location: string;
  quota: number;
  quotaUsed: number;
  semester: Semester;
  courseSchedules: CourseSchedule[];
}

export interface CourseSpecific extends CourseSpecificWithoutCommon {
  courseCommon: CourseCommon;
}

export interface CourseSchedule extends Model {
  dayOfWeek: number;
  startHoursId: number;
  endHoursId: number;
  startWeekId: number;
  endWeekId: number;
}

export interface Semester extends Model {
  year: number;
  term: number;
}

export interface CourseScheduleWithCourseSpecific extends CourseSchedule, CourseSpecific {
}

export interface StudentCourse {
  student?: User;
  status: StudentCourseStatus;
  score: number;
}

export interface CourseSpecificWithStudent extends CourseSpecific {
  students: StudentCourse[];
}