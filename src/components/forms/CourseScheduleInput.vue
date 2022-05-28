<script setup lang="ts">
import { NSpace, NSelect, SelectOption } from 'naive-ui';
import InputDuration from '@/components/input/InputDuration.vue';
import { CourseSchedule } from '@/api/req';
import { DayOfWeek, dayName } from '@/api/resp';

const props = defineProps<{
  schedule: CourseSchedule
}>();

const emits = defineEmits<{
  (e: 'update:schedule', schedule: CourseSchedule): void
}>();

const daysOptions: SelectOption[]
  = [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday].map(day => ({
    label: dayName(day),
    value: day,
  }));

const update = () => emits('update:schedule', props.schedule);
</script>

<template>
  <n-space>
    <input-duration :placeholder="['从', '到']" v-model:value1="schedule.startWeekId" :value1-min="1" :value1-max="20"
      @update:value1="update" v-model:value2="schedule.endWeekId" :value2-min="schedule.startWeekId" :value2-max="20"
      @update:value2="update">
      <template #suffix>周</template>
    </input-duration>
    <n-select :options="daysOptions" v-model:value="schedule.dayOfWeek" @update:value="update" />
    <input-duration :placeholder="['从', '到']" v-model:value1="schedule.startHoursId" :value1-min="1" :value1-max="13"
      @update:value1="update" v-model:value2="schedule.endHoursId" :value2-min="schedule.startHoursId" :value2-max="13"
      @update:value2="update">
      <template #suffix>节</template>
    </input-duration>
  </n-space>
</template>