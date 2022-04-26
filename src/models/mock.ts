import { College, Course, Role, User } from ".";

export const collegeComputer: College = {
  id: 0,
  name: '计算机学院',
};

export const collegeMath: College = {
  id: 1,
  name: '数学学院',
};

export const colleges = [collegeComputer, collegeMath];

export const userSalHe: User = {
  id: 20191122333,
  name: 'SalHe',
  entranceYear: 2019,
  college: collegeComputer,
  role: Role.student,
};

export const courses: Course[] = [
  {
    id: 1,
    commonId: 1,
    name: '计算机组成原理',
    teacher: {
      id: 19800000101,
      name: '张计组',
      entranceYear: 1980,
      college: collegeComputer,
      role: Role.teacher,
    },
    location: '青楼310',
    start: 1,
    duration: 3,
    dayOfWeek: 1
  },
  {
    id: 2,
    commonId: 2,
    name: '计算机网络',
    teacher: {
      id: 19800000102,
      name: '李计网',
      entranceYear: 1980,
      college: collegeComputer,
      role: Role.teacher,
    },
    location: '青楼250',
    start: 6,
    duration: 3,
    dayOfWeek: 1
  },
  {
    id: 3,
    commonId: 3,
    name: '数据库系统',
    teacher: {
      id: 19800000103,
      name: '王数据',
      entranceYear: 1980,
      college: collegeComputer,
      role: Role.teacher,
    },
    location: '青楼520',
    start: 10,
    duration: 3,
    dayOfWeek: 1
  },


  {
    id: 4,
    commonId: 4,
    name: '操作系统',
    teacher: {
      id: 19800000104,
      name: '赵操作',
      entranceYear: 1980,
      college: collegeComputer,
      role: Role.teacher,
    },
    location: '青楼110',
    start: 2,
    duration: 3,
    dayOfWeek: 2
  },
  {
    id: 5,
    commonId: 5,
    name: '算法导论',
    teacher: {
      id: 19800000104,
      name: '刘数据',
      entranceYear: 1980,
      college: collegeComputer,
      role: Role.teacher,
    },
    location: '青楼310',
    start: 10,
    duration: 3,
    dayOfWeek: 2
  },


  {
    id: 6,
    commonId: 6,
    name: '离散数学',
    teacher: {
      id: 19800000106,
      name: '喻离散',
      entranceYear: 1980,
      college: collegeComputer,
      role: Role.teacher,
    },
    location: '青楼410',
    start: 1,
    duration: 2,
    dayOfWeek: 4
  },
  {
    id: 7,
    commonId: 7,
    name: '软件工程',
    teacher: {
      id: 19800000107,
      name: '胡软件',
      entranceYear: 1980,
      college: collegeComputer,
      role: Role.teacher,
    },
    location: '青楼510',
    start: 6,
    duration: 4,
    dayOfWeek: 4
  },
];
