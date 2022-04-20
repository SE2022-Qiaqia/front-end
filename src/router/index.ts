import { createWebHistory, createRouter } from "vue-router";
import HelloWorld from "../components/Home.vue";
import Login from "../components/Login.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HelloWorld },
    { path: '/login', component: Login },
  ]
});