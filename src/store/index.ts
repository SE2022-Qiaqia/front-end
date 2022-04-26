import { inject, InjectionKey } from "vue";
import { createStore, Module, Store, useStore as useStoreBase } from "vuex";
import api, { LoginCredit } from '../api';
import { User } from "../models";
import { FinalState, LoginState, RootState } from "./types";

export const key: InjectionKey<Store<FinalState>> = Symbol();

const loginStateModule: Module<LoginState, RootState> = {
  namespaced: true,
  state: {
    loginReason: ''
  },
  mutations: {
    setLoginReason(state, reason: string) {
      state.loginReason = reason;
    }
  }
};

export const store: Store<FinalState> = createStore<RootState>({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    loginToken: localStorage.getItem("loginToken") || '',
    user: JSON.parse(localStorage.getItem("user") || "{}"),
  },
  modules: {
    login: loginStateModule
  },
  mutations: {
    saveUserInfo(state, user: User) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    saveLoginToken(state, token: string) {
      state.loginToken = token;
      localStorage.setItem("loginToken", token);
    },
  },
  actions: {
    async login({ commit }, LoginCredit: LoginCredit) {
      commit('login/setLoginReason', '');
      try {
        const token = await api.login(LoginCredit);
        commit('saveLoginToken', token);
        return token;
      } catch (error) {
        commit('saveLoginToken', '');
        commit('saveUserInfo', {});
        throw error;
      }
    },
    async fetchUserInfo({ commit, state }) {
      if (state.loginToken) {
        try {
          const user = await api.fetchUserInfo(state.loginToken);
          commit("saveUserInfo", user);
          return user;
        } catch (error) {
          commit('saveLoginToken', '');
          commit("saveUserInfo", {});
          throw error;
        }
      }
    },
  }
}) as Store<FinalState>;

export function useStore() { return useStoreBase(key); }
export function injectStore(): Store<FinalState> { return inject(key)!; }
export default store;