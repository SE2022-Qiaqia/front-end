<script setup lang="tsx">
import {
  NLayout, NLayoutHeader, NLayoutContent, NButton,
  NAvatar, NSpace, NText, NMenu, MenuGroupOption, MenuOption, useMessage, NScrollbar
} from 'naive-ui';
import { onMounted, onUpdated, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import logo from './assets/logo.jpg';
import { injectStore } from './store';

const store = injectStore();
const message = useMessage();
const router = useRouter();

const user = ref(store.state.user);
watchEffect(() => {
  user.value = store.state.user;
});

const headerContentHeight = '70px';
const headerPadding = '20px';
const headerHeight = `calc(${headerContentHeight} + ${headerPadding} * 2)`;

const navMenuOptions: (MenuOption | MenuGroupOption)[] = [
  {
    label: () => (
      <router-link to="/">
        <NSpace
          justify="center"
          align="center"
          style="margin: 0;"
          item-style="display: flex; align-items: center;"
          size={5}
        >
          <NAvatar src={logo} round size={20} />
          <NText type="info" strong>QiaQia 选课系统</NText>
        </NSpace>
      </router-link>),
    key: "home"
  },
  {
    label: () => (<a href="https://github.com/SE2022-Qiaqia">Github</a>),
    key: "github"
  },
  {
    label: () => (<a href="https://se2022-qiaqia.github.io/docs/">Docs</a>),
    key: "docs"
  },
];

function logout() {
  store.dispatch('logout').then(() => {
    if (!store.state.loginToken) {
      message.success('退出成功');
      router.push('/login');
    } else {
      message.error('退出失败');
    }
  }).catch((error) => {
    message.error('退出失败！' + error.message);
  });
}

watchEffect(() => {
  if (store.state.routerPushReason) {
    message.info(store.state.routerPushReason);
    store.commit('saveRouterPushReason', null);
  }
})
</script>

<template>
  <n-layout position="absolute">
    <n-layout-header :style="{ position: 'absolute', padding: headerPadding }" bordered>
      <n-space align="center" justify="space-between">
        <n-menu mode="horizontal" :options="navMenuOptions" />
        <n-button v-if="user?.id" text tag="a" @click="logout">退出登录</n-button>
      </n-space>
    </n-layout-header>
    <n-layout-content
      :style="{ position: 'absolute', top: headerHeight, height: `calc(100vh - ${headerHeight})`, width: '100vw' }">
      <n-scrollbar :style="{ maxHeight: `calc(100vh - ${headerHeight})` }">
        <router-view />
      </n-scrollbar>
    </n-layout-content>
    <!-- <n-layout-footer>Footer</n-layout-footer> -->
  </n-layout>
</template>