import { College, User } from "../models";
import { colleges, userSalHe } from "../models/mock";

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
    throw new Error('用户名或密码错误(debug)');
  }
}

export async function fetchUserInfo(token: string): Promise<User> {
  // TODO
  await wait(100);
  if (token && (Math.random() > 0.2 || navigator.webdriver)) {
    return userSalHe;
  } else {
    throw new Error('Token已失效(debug)');
  }
}

export async function fetchColleges(token: string): Promise<College[]> {
  // TODO
  await wait(100);
  return colleges;
}


function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export default { login, fetchUserInfo, fetchColleges };