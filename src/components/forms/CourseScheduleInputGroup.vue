<script setup lang="ts">
import { NSpace, NButton, NIcon, NSelect } from 'naive-ui';
import CourseScheduleInput from './CourseScheduleInput.vue';
import { Delete16Regular, Add24Filled } from '@vicons/fluent';
import { CourseSchedule } from '@/api/req';

const props = defineProps<{
  schedules: CourseSchedule[],
}>();

const emits = defineEmits<{
  (e: 'update', schedules: CourseSchedule[]): void
}>();

const update = (schedules: CourseSchedule[]) => emits('update', schedules);

function addSchedule(position: number) {
  props.schedules.splice(position, 0, {
    dayOfWeek: 0,
    startWeekId: 1,
    endWeekId: 20,
    startHoursId: 1,
    endHoursId: 13,
  });
  update(props.schedules);
}
</script>

<template>
  <n-space vertical>
    <n-space v-if="schedules.length" v-for="(_, i) in schedules">
      <course-schedule-input v-model:schedule="schedules[i]" @update:value="update" />
      <n-button type="primary" ghost @click="addSchedule(i + 1)">
        <template #icon>
          <n-icon>
            <Add24Filled />
          </n-icon>
        </template>
      </n-button>
      <n-button type="error" ghost @click="schedules.splice(i, 1)">
        <template #icon>
          <n-icon>
            <Delete16Regular />
          </n-icon>
        </template>
      </n-button>
    </n-space>
    <n-button v-else ghost type="primary" @click="addSchedule(0)">
      <template #icon>
        <n-icon>
          <Add24Filled />
        </n-icon>
      </template>
      添加时间段
    </n-button>
  </n-space>
</template>