import { Role } from "../resp";

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