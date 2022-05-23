import axios, { AxiosInstance } from 'axios';
import { ApiResponse, ErrCode, User, College, Semester } from "./resp";
import { LoginCredit } from "./req";

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

  public async fetchUserInfo(): Promise<User> {
    const response = await this._axios.get<ApiResponse<User>>('/user');
    return response.data.data!;
  }

  public async fetchColleges(name: string = ""): Promise<College[]> {
    const response = await this._axios.post<ApiResponse<College[]>>('/college/list', { name });
    return response.data.data || [];
  }

  public async fetchSemesters(): Promise<Semester[]> {
    const response = await this._axios.get<ApiResponse<Semester[]>>('/semester/');
    return response.data.data || [];
  }

}

export const api = new Api('http://localhost:8080/api/v1');