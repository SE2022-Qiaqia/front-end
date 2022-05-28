import { ApiSourceState } from "@/store/types";

export const defaultApiSource: ApiSourceState = {
  protocol: 'http',
  host: 'localhost',
  port: 8080,
  base: 'api/v1',
  sameSource: false
};

// 不建议存放其他任何代码