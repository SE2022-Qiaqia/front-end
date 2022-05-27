import { College, CourseScheduleWithCourseSpecific, Semester, User } from "@/api/resp";

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

export const defaultApiSource: ApiSourceState = {
  protocol: 'http',
  host: 'localhost',
  port: 8080,
  base: 'api/v1',
  sameSource: false
};

export function realBaseUrl(apiSource: ApiSourceState) {
  if (apiSource.sameSource) return document.location.origin + '/' + apiSource.base;
  return `${apiSource.protocol}://${apiSource.host}:${apiSource.port}/${apiSource.base}`;
}

export function loadApiSource() {
  let s = sessionStorage.getItem('apiSource');
  if (!s) localStorage.getItem('apiSource')
  if (s) return JSON.parse(s);
  return defaultApiSource;
}

export interface FinalState extends RootState {
  login: LoginState;
  apiSource: ApiSourceState;
}
