import { createWebHistory, createRouter } from "vue-router";
import store from '../store';

const loginPath = "/login";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import("../pages/Home.vue"),
      meta: {
        title: '首页',
        needAuth: true
      }
    },
    {
      path: loginPath,
      component: () => import('../pages/Login.vue'),
      meta: {
        title: '登录/注册'
      }
    },
  ]
});

router.beforeEach((to, from, next) => {
  document.title = `Qiaqia选课系统 | ${to.meta.title}`;
  if (to.meta.needAuth) {
    if (store.state.loginToken) {
      if (to.path === loginPath) {
        next('/');
      } else {
        next();
      }

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