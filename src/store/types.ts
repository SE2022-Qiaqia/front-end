import { User } from "../api/resp";

export interface RootState {
  loginToken: string;
  user?: User;
}

export interface LoginState {
  loginReason: string;
}

export interface FinalState extends RootState {
  login: LoginState;
}
