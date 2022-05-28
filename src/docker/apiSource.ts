// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! WARNING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!                          不建议存放其他任何代码                        !!!
// !!!      在docker打包镜像时，该文件将被用于覆盖 /src/api/_source.ts         !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! WARNING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import { ApiSourceState } from "@/store/types";

export const defaultApiSource: ApiSourceState = {
  protocol: 'http',
  host: '-',
  port: 80,


  
  sameSource: true,  // sameSource=true时，上面的设置均无用（参见 src/store/types.ts realBaseUrl）
  base: 'api/v1',
};