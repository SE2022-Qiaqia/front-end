<script setup lang="ts">
import { NGrid, NGridItem } from 'naive-ui';
import UserBrief from '../components/UserBrief.vue';
// import CourseScheduleMock from '../components/CourseScheduleMock.vue';
import CourseScheduleReal from '../components/CourseScheduleReal.vue';
import { injectStore } from '../store';

const store = injectStore();

const student = store.state.user!;
const schedules = store.state.schedules;
</script>

<template>
  <n-grid :cols="4" :x-gap="12">
    <n-grid-item :span="3">
      <!-- <course-schedule-mock /> -->
      <course-schedule-real :schedules="schedules" />
    </n-grid-item>
    <n-grid-item>
      <user-brief :user="student" />
    </n-grid-item>
  </n-grid>
</template>