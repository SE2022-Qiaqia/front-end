import { createWebHistory, createRouter } from "vue-router";
import HelloWorld from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import store from '../store';

const loginPath = "/login";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HelloWorld, meta: { needAuth: true } },
    { path: loginPath, component: Login },
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.needAuth) {
    if (store.state.loginToken) {
      next();

      store.dispatch('fetchUserInfo')
        .catch(() => {
          store.commit('login/setLoginReason', '获取用户信息失败，需要重新登录。');
          router.push({
            path: loginPath, query: { redirect: to.fullPath }
          });
        });
    } else {
      store.commit('login/setLoginReason', '需要登录才能访问此页面。');
      next({ path: loginPath, query: { redirect: to.fullPath } });
    }
  } else {
    next();
  }

});