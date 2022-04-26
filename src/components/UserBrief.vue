<script setup lang="ts">
import { NThing, NAvatar, NCard } from 'naive-ui';
import { User } from '../models';
import logo from '../assets/logo.jpg';

const roles: { [key: string]: string } = {
  'student': '学生',
  'teacher': '教师'
};

const props = defineProps<{ user: User }>();
</script>

<template>
  <n-card>
    <n-thing style="width: 400px;" :title="user.name" :description="roles[user.role.toLowerCase()]">
      <template #avatar>
        <n-avatar :src="user.avatar || logo" size="large" />
      </template>
      <template #default>
        <p>
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