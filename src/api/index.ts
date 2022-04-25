import { User, Role } from "../models";

export interface LoginCredit {
  username: string;
  password: string;
}

export async function login(login: LoginCredit) {
  // TODO
  await wait(100);
  if (Math.random() > 0.5 || navigator.webdriver) {
    return 'image-this-is-a-token';
  } else {
    throw new Error('登录失败');
  }
}

export async function fetchUserInfo(token: string): Promise<User> {
  // TODO
  await wait(100);
  if (Math.random() > 0.5 || navigator.webdriver) {
    return {
      id: 20191122333,
      name: 'SalHe',
      entranceYear: 2019,
      school: {
        id: 0,
        name: 'School of Computer'
      },
      role: Role.student,
    };
  } else {
    throw new Error('Token已失效');
  }
}


function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export default { login, fetchUserInfo };