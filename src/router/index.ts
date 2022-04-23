import { createWebHistory, createRouter } from "vue-router";
import HelloWorld from "../pages/Home.vue";
import Login from "../pages/Login.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HelloWorld },
    { path: '/login', component: Login },
  ]
});