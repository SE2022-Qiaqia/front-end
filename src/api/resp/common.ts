export enum ErrCode {
  Ok = 0,
  Fail = -1,
  NotFound = -2,
  Conflict = -3,
  Unauthorized = -4,
  Internal = -5,
  QuotaExceeded = -6,
}

export interface ApiResponse<T = string> {
  msg: string;
  code: ErrCode;
  data?: T;
}

export interface Model {
  id: number;
  createdAt: string;
  updatedAt: string;
}
