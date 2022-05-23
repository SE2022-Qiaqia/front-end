export * from './course';

export interface LoginCredit {
  username: string;
  password: string;
}

export interface RegisterInfo {
  username: string;
  password: string;
  id: number;
}

export interface InitRequest {
  id: number;
  username: string;
  password: string;
  realName: string;
}

export interface NewCollegeService {
  name: string;
}

export interface QueryCollegesService {
  name: string;
}

export interface IdReq {
  id: number;
}

export interface Page {
  page: number;
  size: number;
}
