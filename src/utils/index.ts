import { Semester } from "@/api/resp";

export function semesterToString(semester: Semester, isCurrent: boolean = false): string {
  return `${semester.year}级-第${semester.term}学期${isCurrent ? '(本学期)' : ''}`;
}