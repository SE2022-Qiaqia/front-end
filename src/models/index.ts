export interface School {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  entranceYear: number;
  school: School;
  role: string;
}