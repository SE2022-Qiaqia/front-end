<script setup lang="tsx">
import {
  NLayout, NLayoutHeader, NLayoutContent, NButton, NAvatar, NSpace, NText, NMenu, MenuGroupOption, MenuOption, useMessage, NScrollbar, NIcon
} from 'naive-ui';
import { watchEffect, computed } from 'vue';
import { Role } from './api/resp';
import { Table28Regular, AnimalRabbit28Regular, Power28Regular, ChatHelp20Regular, Person24Regular } from '@vicons/fluent';
import { useRouter } from 'vue-router';
import logo from './assets/logo.jpg';
import { injectStore } from './store';

const store = injectStore();
const message = useMessage();
const router = useRouter();

const user = computed(() => store.state.user);

const headerContentHeight = '70px';
const headerPadding = '20px';
const headerHeight = `calc(${headerContentHeight} + ${headerPadding} * 2)`;

const navMenuOptions = computed<(MenuOption | MenuGroupOption)[]>(() => {
  const menu: (MenuOption | MenuGroupOption)[] = [];
  menu.push({
    key: "home",
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
  });
  if (user.value?.id) {
    menu.push(
      {
        key: 'profile',
        label: () => (<router-link to={'profile'}>个人信息</router-link>),
        icon: () => (<NIcon><Person24Regular /></NIcon>),
        disabled: !user.value?.id,
      },
      {
        key: 'courses',
        label: () => (
          <router-link to={'courses'}>课程管理</router-link>),
        icon: () => (<NIcon><Table28Regular /></NIcon>),
        disabled: !user.value?.id,
      });
    if (user.value.role === Role.Admin) {
      menu.push(
        {
          key: 'users',
          label: () => (<router-link to={'users'}>用户管理</router-link>),
          icon: () => (<NIcon><AnimalRabbit28Regular /></NIcon>),
          disabled: user.value?.role !== Role.Admin,
        });
    }
  }
  menu.push(
    {
      key: "github",
      label: () => (<a href="https://github.com/SE2022-Qiaqia">Github</a>),
      // TODO 引入SVG支持
      icon: () => (<NIcon><svg viewBox="0 0 24 24"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2c2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2a4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6c-.6.6-.6 1.2-.5 2V21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></NIcon>),
    },
    {
      key: "docs",
      label: () => (<a href="https://se2022-qiaqia.github.io/docs/">Docs</a>),
      icon: () => (<NIcon><ChatHelp20Regular /></NIcon>),
    }
  );
  return menu;
});

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
        <n-button v-if="user?.id" text tag="a" @click="logout">
          <template #icon>
            <n-icon>
              <Power28Regular />
            </n-icon>
          </template>
          退出登录
        </n-button>
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