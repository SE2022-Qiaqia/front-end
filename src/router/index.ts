import { createRouter, createWebHashHistory } from "vue-router";
import { Role } from "../api/resp";
import store from '../store';

const loginPath = "/login";

export const router = createRouter({
  history: createWebHashHistory(),
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
    {
      path: '/courses',
      component: () => import('../pages/Courses.vue'),
      meta: {
        title: '选课',
        needAuth: true
      }
    },
    {
      path: '/profile',
      component: () => import('../pages/Profile.vue'),
      meta: {
        title: '个人信息',
        needAuth: true
      }
    },
    {
      path: '/users',
      component: () => import('../pages/Users.vue'),
      meta: {
        title: '用户管理',
        needAuth: true,
        role: [Role.Admin]
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
        .then(() => {
          if (to.meta.role !== undefined && !(to.meta.role as Array<Role>).includes(store.state.user?.role!)) {
            console.log("当前无权访问对应页面");
            store.commit('saveRouterPushReason', '您的身份不符合此页面的访问权限');
            router.push('/');
          }
        })
        .catch(() => {
          store.commit('login/setLoginReason', '获取用户信息失败，需要重新登录。');
          router.push({
            path: loginPath, query: { redirect: to.fullPath }
          });
        });
      store.dispatch('fetchSemesters').finally(() => {
        if (store.state.user?.role !== Role.Admin) {
          store.dispatch('fetchSchedules')
        }
      });
    } else {
      store.commit('login/setLoginReason', '需要登录才能访问此页面。');
      next({ path: loginPath, query: { redirect: to.fullPath } });
    }
  } else {
    next();
  }

});