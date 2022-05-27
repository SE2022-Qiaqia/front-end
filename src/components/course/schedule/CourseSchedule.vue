<script setup lang="tsx">
import { computed } from '@vue/reactivity';
import { NSpace, NSwitch, NPagination, NEmpty, NCard } from 'naive-ui';
import { ref } from 'vue';
import { CourseScheduleWithCourseSpecific, DayOfWeek, Role } from '@/api/resp';
import { injectStore } from '@/store';
import { DaySchedules, HourSchedules } from '.';
import CourseScheduleTable from './CourseScheduleTable.vue';
import CourseScheduleList from './CourseScheduleList.vue';

const store = injectStore();

const props = defineProps<{
  schedules: CourseScheduleWithCourseSpecific[];
}>();

const listMode = ref(true);
const allWeek = ref(true);
const noRedundantHours = ref(true);
const week = ref(1);

function _emptyDaySchedules(): DaySchedules {
  return {
    [DayOfWeek.Monday]: [],
    [DayOfWeek.Tuesday]: [],
    [DayOfWeek.Wednesday]: [],
    [DayOfWeek.Thursday]: [],
    [DayOfWeek.Friday]: [],
    [DayOfWeek.Saturday]: [],
    [DayOfWeek.Sunday]: [],
  };
}

const noSchedulesDescription = computed(() => store.state.user?.role === Role.Admin ? '您为管理员，不需要上课' : '您没有课要上哦');
const hoursKey = ref<number[]>([]);

const filtered = computed(() => props.schedules
  .filter(x => (allWeek.value || (x.startWeekId <= week.value && x.endWeekId >= week.value)) // 过滤周次
  )
  .sort((a, b) => {
    if (a.startWeekId !== b.startWeekId) {
      return a.startWeekId - b.startWeekId;
    }
    if (a.dayOfWeek !== b.dayOfWeek) {
      return a.dayOfWeek - b.dayOfWeek;
    }
    return a.startHoursId - b.startHoursId;
  }));

// 预处理列表模式的数据
const finalSchedulesForList = computed<DaySchedules>(() =>
  filtered.value.reduce((pre: DaySchedules, cur) => {
    pre[cur.dayOfWeek] = pre[cur.dayOfWeek] || [];
    pre[cur.dayOfWeek].push(cur);
    return pre;
  }, _emptyDaySchedules()));
// 预处理表格模式的数据(默认从1~13节的课都显示)
const finalSchedulesForTable = computed<HourSchedules>(() => {
  let max = 13;
  let maxActual = 0;
  let min = 1;
  const tableSchedules = filtered.value.reduce((pre: HourSchedules, cur) => {
    pre[cur.startHoursId] = pre[cur.startHoursId] || {};
    pre[cur.startHoursId][cur.dayOfWeek] = pre[cur.startHoursId][cur.dayOfWeek] || [];
    pre[cur.startHoursId][cur.dayOfWeek].push(cur);
    if (cur.startHoursId < min) {
      min = cur.startHoursId;
    }
    if (cur.endHoursId > maxActual) {
      maxActual = cur.endHoursId;
    }
    return pre;
  }, Array.from({ length: 25 }).map(() => _emptyDaySchedules())); // 这里用`25`是为了方便和数据里课程节数从1开始相适应
  max = noRedundantHours.value ? maxActual : max;
  tableSchedules.splice(max + 1); // 去除无效的课时
  tableSchedules.splice(0, 1); // 去除第0节课（是之前为方便处理引入的）

  hoursKey.value = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return tableSchedules;
});

</script>

<template>
  <n-space vertical style="padding-bottom: 20px;">

    <n-space justify="end">
      <!-- 控制部分 -->
      <n-switch :disabled="listMode" v-model:value="noRedundantHours">
        <template #checked>精简</template>
        <template #unchecked>完整</template>
      </n-switch>
      <n-switch v-model:value="listMode">
        <template #checked>列表模式</template>
        <template #unchecked>表格模式</template>
      </n-switch>
      <n-switch v-model:value="allWeek">
        <template #checked>所有周次</template>
        <template #unchecked>指定周次</template>
      </n-switch>
      <n-pagination v-model:page="week" :disabled="allWeek" :page-count="20" />
    </n-space>

    <!-- 课表展示部分 -->
    <template v-if="schedules.length">
      <course-schedule-list v-if="listMode" :data="finalSchedulesForList" />
      <course-schedule-table v-else :data="finalSchedulesForTable" :empty-description="noSchedulesDescription"
        :hours-key="hoursKey" />
    </template>
    <template v-else>
      <n-card>
        <n-empty size="large" :description="noSchedulesDescription">
        </n-empty>
      </n-card>
    </template>

  </n-space>
</template>