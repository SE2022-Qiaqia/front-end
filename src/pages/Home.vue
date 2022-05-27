<script setup lang="ts">
import { NGrid, NGridItem, NSpace, NP, NText, NCard } from 'naive-ui';
import UserBrief from '@/components/user/UserBrief.vue';
import CourseSchedule from '@/components/course/schedule/CourseSchedule.vue';
import Settings from '@/components/Settings.vue';
import { injectStore } from '@/store';
import { Role } from '@/api/resp';
import { computed } from 'vue';
import { semesterToString } from '@/utils';

const store = injectStore();

const student = computed(() => store.state.user!);
const schedules = computed(() => store.state.schedules);
const currentSemester = computed(() => store.state.currentSemester);
</script>

<template>
  <n-grid :cols="12" :x-gap="12">
    <n-grid-item :offset="1" :span="8">
      <course-schedule v-if="student.role !== Role.Admin" :schedules="schedules" />
      <settings v-else />
    </n-grid-item>
    <n-grid-item :span="2">
      <n-space vertical>
        <user-brief :user="student" />
        <n-card v-if="currentSemester && student.role !== Role.Admin" title="当前学期">
          <n-p>
            <n-text>{{ semesterToString(currentSemester) }}</n-text>
          </n-p>
        </n-card>
      </n-space>
    </n-grid-item>
  </n-grid>
</template>