import { DayOfWeek, CourseScheduleWithCourseSpecific } from "@/api/resp";

export type DaySchedules = {
  [key in DayOfWeek]: CourseScheduleWithCourseSpecific[];
};
export type HourSchedules = DaySchedules[];