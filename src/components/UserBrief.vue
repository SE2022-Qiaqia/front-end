<script setup lang="ts">
import { NThing, NAvatar, NCard } from 'naive-ui';
import { User } from '../api/resp';
import logo from '../assets/logo.jpg';
import { Role } from '../api/resp';

const roles: { [key: number]: string } = {
  [Role.Student]: '学生',
  [Role.Teacher]: '教师',
  [Role.Admin]: '管理员'
};

const props = defineProps<{ user: User }>();
</script>

<template>
  <n-card>
    <n-thing v-if="user?.id" style="width: 400px;" :title="user.realName" :description="roles[user.role]">
      <!-- <template #avatar>
        <n-avatar :src="user.avatar || logo" size="large" />
      </template> -->
      <template #default>
        <p>
          <span>用户名：</span>
          <span>{{ user.username }}</span>
          <br />
          <span>学号：</span>
          <span>{{ user.id }}</span>
          <br />
          <span>入学：</span>
          <span>{{ user.entranceYear }}</span>
          <br />
          <span>学院：</span>
          <span>{{ user.college.name }}</span>
          <br />
        </p>
      </template>
    </n-thing>
  </n-card>
</template>