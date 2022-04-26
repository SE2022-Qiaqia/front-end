<script setup lang="ts">
import { ref } from 'vue';
import { NGrid, NGridItem } from 'naive-ui';
import UserBrief from '../components/UserBrief.vue';
import CourseSchedule from '../components/CourseSchedule.vue';
import { injectStore } from '../store';

const store = injectStore();

const student = store.state.user!;
</script>

<template>
  <n-grid :cols="4" :x-gap="12">
    <n-grid-item :span="3">
      <course-schedule />
    </n-grid-item>
    <n-grid-item>
      <user-brief :user="student" />
    </n-grid-item>
  </n-grid>
</template>