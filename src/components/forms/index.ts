import { OpenCourseRequest, UpdateCourseSpecificRequest } from "@/api/req";

export type CourseSpecificModel = OpenCourseRequest & UpdateCourseSpecificRequest;

export function isOpenCourseRequest(
  model: CourseSpecificModel
): model is OpenCourseRequest {
  return (model as OpenCourseRequest).courseCommonId !== undefined;
}