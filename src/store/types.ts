import { User } from "../models";

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
