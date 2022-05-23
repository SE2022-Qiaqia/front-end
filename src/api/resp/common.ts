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

export interface PageData<T> {
  pageNo: number;
  pageSize: number;
  total: number;
  contents: T[];
}

export type ApiPageResponse<T> = ApiResponse<PageData<T>>;

export function dayName(dayOfWeek: number): string {
  switch (dayOfWeek) {
    case 0: return '周日';
    case 1: return '周一';
    case 2: return '周二';
    case 3: return '周三';
    case 4: return '周四';
    case 5: return '周五';
    case 6: return '周六';
  }
  console.error('错误的 dayOfWeek', dayOfWeek);
  return '<ERR>';
}