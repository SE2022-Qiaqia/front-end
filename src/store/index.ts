import { inject, InjectionKey } from "vue";
import { createStore, Module, Store, useStore as useStoreBase } from "vuex";
import { api } from '../api';
import { LoginCredit } from '../api/req';
import { College, CourseScheduleWithCourseSpecific, Semester, User } from "../api/resp";
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

const token = localStorage.getItem("loginToken") || '';
api.token = token;

export const store: Store<FinalState> = createStore<RootState>({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    loginToken: token,
    user: JSON.parse(localStorage.getItem("user") || "{}"),
    schedules: JSON.parse(localStorage.getItem("schedules") || "[]"),
    colleges: JSON.parse(localStorage.getItem("colleges") || "[]"),
    semesters: JSON.parse(localStorage.getItem("semesters") || "[]"),
    currentSemester: JSON.parse(localStorage.getItem("currentSemester") || "{}"),
    routerPushReason: ''
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
      api.token = token;
      localStorage.setItem("loginToken", token);
    },
    saveSchedules(state, schedules: CourseScheduleWithCourseSpecific[]) {
      state.schedules = schedules;
      localStorage.setItem("schedules", JSON.stringify(schedules));
    },
    saveColleges(state, colleges: College[]) {
      state.colleges = colleges;
      localStorage.setItem("colleges", JSON.stringify(colleges));
    },
    saveSemesters(state, { semesters, currentSemester }: { semesters: Semester[], currentSemester: Semester }) {
      state.semesters = semesters;
      state.currentSemester = currentSemester;
      localStorage.setItem("semesters", JSON.stringify(semesters));
      localStorage.setItem("currentSemester", JSON.stringify(currentSemester));
    },
    saveRouterPushReason(state, reason: string) {
      state.routerPushReason = reason;
    },
    clearRouterPushReason(state) {
      state.routerPushReason = '';
    }
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
    async logout({ commit }) {
      try {
        await api.logout()
      } catch (error) {
        console.log('登出失败', error);
      } finally {
        commit('saveLoginToken', '');
        commit('saveUserInfo', {});
        commit('saveSchedules', []);
        commit('saveColleges', []);
        commit('saveSemesters', { semesters: [], currentSemester: {} });
      }

    },
    async fetchUserInfo({ commit, state }) {
      if (state.loginToken) {
        try {
          const user = await api.fetchUserInfo();
          commit("saveUserInfo", user);
          return user;
        } catch (error) {
          commit('saveLoginToken', '');
          commit("saveUserInfo", {});
          throw error;
        }
      }
    },
    async fetchSchedules({ commit, state }) {
      const schedules = await api.fetchSchedules({
        userId: state.user?.id || 0,
        semesterIds: []
      });
      commit("saveSchedules", schedules);
    },
    async fetchColleges({ commit, state }) {
      const colleges = await api.fetchColleges();
      commit("saveColleges", colleges);
    },
    async fetchSemesters({ commit, state }) {
      const semesters = await api.fetchSemesters();
      const currentSemester = await api.fetchCurrentSemester();
      commit("saveSemesters", { semesters, currentSemester });
    }
  }
}) as Store<FinalState>;

export function useStore() { return useStoreBase(key); }
export function injectStore(): Store<FinalState> { return inject(key)!; }
export default store;