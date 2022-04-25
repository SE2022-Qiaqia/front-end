import { inject, InjectionKey } from "vue";
import { createStore, Store, useStore as useStoreBase } from "vuex";
import api, { LoginCredit } from '../api';
import { User } from "../models";
import { FinalState } from "./types";

export const key: InjectionKey<Store<FinalState>> = Symbol();

export const store = createStore<FinalState>({
  state: {
    loginToken: localStorage.getItem("loginToken") || '',
    user: JSON.parse(localStorage.getItem("user") || "{}"),
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
          console.log(state.loginToken)
          const user = await api.fetchUserInfo(state.loginToken);
          commit("saveUserInfo", user);
          return user;
        } catch (error) {
          commit("saveUserInfo", {});
          throw error;
        }
      }
    },
  }
});

export function useStore() { return useStoreBase(key); }
export function injectStore(): Store<FinalState> { return inject(key)!; }
export default store;