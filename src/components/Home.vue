<script setup lang="ts">
import { ref } from 'vue';
import { NSpace, NThing, NAvatar } from 'naive-ui';
import { User } from '../models';
import logo from '../assets/logo.jpg';

const student = ref<User>({
  id: 20191122333,
  name: 'SalHe',
  entranceYear: 2019,
  school: {
    id: 0,
    name: 'School of Computer'
  },
  role: 'student',
});
const roles = {
  'student': '学生',
  'teacher': '教师'
};
</script>

<template>
  <n-space vertical align="center">
    <n-thing style="width: 400px;" :title="student.name" :description="roles[student.role.toLowerCase()]">
      <template #avatar>
        <n-avatar :src="logo" size="large" />
      </template>
      <template #default>
        <p>
          <span>学号：</span>
          <span>{{ student.id }}</span>
          <br />
          <span>入学：</span>
          <span>{{ student.entranceYear }}</span>
          <br />
          <span>学院：</span>
          <span>{{ student.school.name }}</span>
          <br />
        </p>
      </template>
    </n-thing>
  </n-space>
</template>