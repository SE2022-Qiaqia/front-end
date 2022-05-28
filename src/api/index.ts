import axios, { AxiosInstance } from 'axios';
import { ApiResponse, ErrCode, User, College, Semester, CourseCommonWithSpecifics, ApiPageResponse, PageData, CourseScheduleWithCourseSpecific, CourseSpecific, CourseCommon } from "./resp";
import { GetSchedulesRequest, LoginCredit, NewUserRequest, Page, QueryCoursesRequest, QueryUserRequest, RegisterInfo, UpdateUserRequest, UpdateCourseCommonRequest, NewCourseRequest, OpenCourseRequest, UpdateCourseSpecificRequest } from "./req";
import { loadApiSource, realBaseUrl } from '../store/types';

export class Api {

  public token: string = '';
  protected _axios: AxiosInstance

  constructor(baseURL: string = '') {
    this._axios = axios.create({
      baseURL,
      withCredentials: false
    });
    this._axios.interceptors.request.use((config) => {
      config.headers!.Authorization = `Bearer ${this.token}`;
      return config;
    });
    this._axios.interceptors.response.use(response => {
      if (response.data.code != ErrCode.Ok) {
        throw new Error(response.data.msg);
      }
      return response;
    })
  }

  public async login(login: LoginCredit) {
    const response = await this._axios.post<ApiResponse>('/login', login);
    this.token = response.data.data!;
    return this.token;
  }

  public async logout(): Promise<boolean> {
    const response = await this._axios.get<ApiResponse<boolean>>('/logout');
    this.token = '';
    return response.data.data!;
  }

  public async register(data: RegisterInfo): Promise<boolean> {
    const response = await this._axios.post<ApiResponse<boolean>>('/register', data);
    return response.data.data!;
  }

  public async fetchUserInfo(): Promise<User> {
    const response = await this._axios.get<ApiResponse<User>>('/user');
    return response.data.data!;
  }

  public async fetchOtherUserInfo(id: string | number): Promise<User | undefined> {
    const response = await this._axios.get<ApiResponse<User>>(`/user/${id}`);
    return response.data.data!;
  }

  public async updateSelfInfo(data: UpdateUserRequest): Promise<User> {
    const response = await this._axios.post<ApiResponse<User>>('/user', data);
    return response.data.data!;
  }

  public async updateUserInfo(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await this._axios.post<ApiResponse<User>>(`/user/${id}`, data);
    return response.data.data!;
  }

  public async updatePassword(password: string): Promise<boolean> {
    const response = await this._axios.post<ApiResponse<boolean>>('/user/pwd', { password });
    return response.data.data!;
  }

  public async updateUserPassword(id: number, password: string): Promise<boolean> {
    const response = await this._axios.post<ApiResponse<boolean>>(`/user/${id}/pwd`, { password });
    return response.data.data!;
  }

  public async newUser(newUser: NewUserRequest): Promise<boolean> {
    const response = await this._axios.post<ApiResponse<boolean>>(`/user/new`, newUser);
    return response.data.data!;
  }

  public async fetchColleges(name: string = ""): Promise<College[]> {
    const response = await this._axios.post<ApiResponse<College[]>>('/college/list', { name });
    return response.data.data || [];
  }

  public async newCollege(name: string = ""): Promise<College> {
    const response = await this._axios.post<ApiResponse<College>>('/college/new', { name });
    return response.data.data!;
  }

  public async fetchSemesters(): Promise<Semester[]> {
    const response = await this._axios.get<ApiResponse<Semester[]>>('/semester/');
    return response.data.data || [];
  }

  public async fetchCurrentSemester(): Promise<Semester> {
    const response = await this._axios.get<ApiResponse<Semester>>('/semester/curr');
    return response.data.data!;
  }

  public async setCurrentSemester(id: number): Promise<Semester> {
    const response = await this._axios.post<ApiResponse<Semester>>('/semester/curr', { id: id });
    return response.data.data!;
  }

  public async queryCourses(data: QueryCoursesRequest): Promise<PageData<CourseCommonWithSpecifics>> {
    const response = await this._axios.post<ApiPageResponse<CourseCommonWithSpecifics>>('/course/list', data);
    return response.data.data!;
  }

  public async fetchSchedules(data: GetSchedulesRequest): Promise<CourseScheduleWithCourseSpecific[]> {
    const response = await this._axios.post<ApiResponse<CourseScheduleWithCourseSpecific[]>>('/course/schedules', data);
    return response.data.data!;
  }

  public async selectCourse(studentId: number, courseSpecificId: number): Promise<CourseSpecific> {
    const response = await this._axios.post<ApiResponse<CourseSpecific>>('/course/select', {
      studentId: studentId,
      courseId: courseSpecificId
    });
    return response.data.data!;
  }

  public async unselectCourse(studentId: number, courseSpecificId: number): Promise<CourseSpecific> {
    const response = await this._axios.delete<ApiResponse<CourseSpecific>>('/course/select', {
      data: {
        studentId: studentId,
        courseId: courseSpecificId
      }
    });
    return response.data.data!;
  }

  public async canRegister(): Promise<boolean> {
    const response = await this._axios.get<ApiResponse<boolean>>('/register/enable');
    return response.data.data!;
  }

  public async enableRegister(enable: boolean): Promise<boolean> {
    const response = await this._axios.post<ApiResponse<boolean>>('/register/enable', { enable: enable });
    return response.data.data!;
  }

  public async fetchUserList(data: QueryUserRequest): Promise<PageData<User>> {
    const response = await this._axios.post<ApiPageResponse<User>>('/user/list', data);
    return response.data.data!;
  }

  public async deleteUser(id: number): Promise<boolean> {
    const response = await this._axios.delete<ApiResponse<boolean>>(`/user/${id}`);
    return response.data.data!;
  }

  public async updateCourseCommon(id: number, data: UpdateCourseCommonRequest): Promise<CourseCommon> {
    const response = await this._axios.put<ApiResponse<CourseCommon>>(`/course/${id}`, data);
    return response.data.data!;
  }

  public async newCourseCommon(data: NewCourseRequest): Promise<CourseCommon> {
    const response = await this._axios.post<ApiResponse<CourseCommon>>(`/course`, data);
    return response.data.data!;
  }

  public async openCourse(data: OpenCourseRequest): Promise<CourseSpecific> {
    const response = await this._axios.post<ApiResponse<CourseSpecific>>(`/course/open`, data);
    return response.data.data!;
  }

  public async updateCourseSpecific(id: number, data: UpdateCourseSpecificRequest): Promise<CourseSpecific> {
    const response = await this._axios.put<ApiResponse<CourseSpecific>>(`/course/spec/${id}`, data);
    return response.data.data!;
  }

}

export const api = new Api(realBaseUrl(loadApiSource()));
export { defaultApiSource } from './_source';