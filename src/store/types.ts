import { College, CourseScheduleWithCourseSpecific, Semester, User } from "../api/resp";

export interface RootState {
  loginToken: string;
  user?: User;
  schedules: CourseScheduleWithCourseSpecific[];
  colleges: College[];
  semesters: Semester[];
  currentSemester?: Semester;
  routerPushReason: string;
}

export interface LoginState {
  loginReason: string;
}

export interface FinalState extends RootState {
  login: LoginState;
}
