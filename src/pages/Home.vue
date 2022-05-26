<script setup lang="ts">
import { NGrid, NGridItem } from 'naive-ui';
import UserBrief from '../components/UserBrief.vue';
import CourseSchedule from '../components/CourseSchedule.vue';
import { injectStore } from '../store';
import { computed } from 'vue';

const store = injectStore();

const student = computed(() => store.state.user!);
const schedules = computed(() => store.state.schedules);
</script>

<template>
  <n-grid :cols="12" :x-gap="12">
    <n-grid-item :offset="1" :span="8">
      <course-schedule :schedules="schedules" />
    </n-grid-item>
    <n-grid-item :span="2">
      <user-brief :user="student" />
    </n-grid-item>
  </n-grid>
</template>