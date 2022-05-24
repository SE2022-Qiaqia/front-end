import { CourseScheduleWithCourseSpecific, User } from "../api/resp";

export interface RootState {
  loginToken: string;
  user?: User;
  schedules: CourseScheduleWithCourseSpecific[];
}

export interface LoginState {
  loginReason: string;
}

export interface FinalState extends RootState {
  login: LoginState;
}
