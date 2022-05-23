<script setup lang="tsx">
import {
  NLayout, NLayoutHeader, NLayoutContent,
  NAvatar, NSpace, NText, NMenu, MenuGroupOption, MenuOption, useMessage, NScrollbar
} from 'naive-ui';
import logo from './assets/logo.jpg';

// const message = useMessage(); // TODO 功能完全实现后记得去除
// message.warning('DEBUG: 当前未使用实际实现的API，仅为内部实现的用于测试的"API"。', { duration: 5000 });


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
</script>

<template>
  <n-layout position="absolute">
    <n-layout-header :style="{ position: 'absolute', padding: headerPadding }" bordered>
      <n-space align="center">
        <n-menu mode="horizontal" :options="navMenuOptions" />
      </n-space>
    </n-layout-header>
    <n-layout-content
      :style="{ position: 'absolute', top: headerHeight, height: `calc(100vh - ${headerHeight})`, padding: '15px 20px 30px', width: '100vw' }">
      <n-scrollbar :style="{ maxHeight: `calc(100vh - ${headerHeight})` }">
        <router-view />
      </n-scrollbar>
    </n-layout-content>
    <!-- <n-layout-footer>Footer</n-layout-footer> -->
  </n-layout>
</template>