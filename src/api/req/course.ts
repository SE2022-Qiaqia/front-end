import { Page } from ".";

export interface QueryCoursesRequest extends Page{
  name: string;
  semester: number;
  teacherName: string;
  collegesId: number[];
  onlyLeftQuota: boolean;
}

export interface NewCourseRequest {
  name: string;
  collegeId: number;
  credits: number;
  hours: number;
}

export interface CourseSchedule {
  dayOfWeek: number;
  startHoursId: number;
  endHoursId: number;
  startWeekId: number;
  endWeekId: number;
}

export interface OpenCourseRequest {
  courseCommonId: number;
  semesterId: number;
  teacherId: number;
  location: string;
  quota: number;
  courseSchedules: (CourseSchedule | undefined)[];
}

export interface UpdateCourseCommonRequest {
  name: string;
  collegeId: number;
  credits: number;
  hours: number;
}

export interface UpdateCourseSpecificRequest {
  teacherId: number;
  location: string;
  quota: number;
  courseSchedules: (CourseSchedule | undefined)[];
}

export interface SelectCourseRequest {
  courseId: number;
  studentId: number;
}

export interface GetSchedulesRequest {
  userId: number;
  semesterIds: number[];
}