import { College, CourseScheduleWithCourseSpecific, Semester, User } from "@/api/resp";
import { defaultApiSource } from "@/api";

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

export interface ApiSourceState {
  protocol: string;
  host: string;
  port: number;
  base: string;
  sameSource: boolean;
}

export function realBaseUrl(apiSource: ApiSourceState) {
  if (apiSource.sameSource) return document.location.origin + '/' + apiSource.base;
  return `${apiSource.protocol}://${apiSource.host}:${apiSource.port}/${apiSource.base}`;
}

export function loadApiSource() {
  let s = sessionStorage.getItem('apiSource');
  if (!s) s = localStorage.getItem('apiSource');
  if (s) return JSON.parse(s);
  return defaultApiSource;
}

export interface FinalState extends RootState {
  login: LoginState;
  apiSource: ApiSourceState;
}
