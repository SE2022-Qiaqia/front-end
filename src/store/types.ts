import { User } from "../models";

export interface RootState {
  loginToken: string;
  user?: User;
}

export interface FinalState extends RootState { }
