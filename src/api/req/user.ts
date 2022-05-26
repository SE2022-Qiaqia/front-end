import { Page } from ".";
import { Role } from "../resp";

export interface QueryUserRequest extends Page {
  id: number;
  username: string;
  realName: string;
  roles: Role[];
  collegesId: number[];
  entranceYearFrom: number;
  entranceYearTo: number;
}
export interface NewUserRequest {
  id: number;
  username: string;
  password: string;
  realName: string;
  collegeId: number;
  role: Role;
  entranceYear: number;
}

export interface UpdateUserRequest {
  username: string;
  realName: string;
  collegeId: number;
  role: Role;
  entranceYear: number;
}

export interface UpdateUserPassword {
  password: string;
}