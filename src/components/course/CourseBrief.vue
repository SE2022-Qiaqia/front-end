<script setup lang="ts">
import { NThing, NCard } from 'naive-ui';
import { CourseCommon, CourseSpecificWithoutCommon, dayName } from '@/api/resp';

const props = defineProps<{
  courseCommon: CourseCommon,
  courseSpecific?: CourseSpecificWithoutCommon
}>();
</script>

<template>
  <n-card>
    <n-thing :title="`${courseCommon.name} (课程号：${courseCommon.id})`">
      <p>
        <span>开课学院：</span>
        <span>{{ courseCommon.college.name }}</span>
        <br />
        <span>学分：</span>
        <span>{{ courseCommon.credits }}</span>
        <br />
        <span>学时：</span>
        <span>{{ courseCommon.hours }}</span>
        <br />
        <template v-if="courseSpecific">
          <span>授课老师：</span>
          <span v-if="courseSpecific.teacher">
            {{ courseSpecific.teacher.realName }}
            ({{ courseSpecific.teacher.college.name }})
          </span>
          <span v-else>
            {{ '<未知>' }}
          </span>
          <br />

          <span>地点：</span>
          <span>{{ courseSpecific.location }}</span>
          <br />
          <span>人数(总额/已选/余量)：</span>
          <br />
          <span>{{ courseSpecific.quota }}/{{ courseSpecific.quotaUsed }}/{{
              (courseSpecific.quota || 0) - (courseSpecific.quotaUsed || 0)
          }}</span>
          <template v-for="s in courseSpecific?.courseSchedules.sort((x, y) => x.dayOfWeek - y.dayOfWeek)">
            <br />
            <span>第{{ s.startWeekId }}~{{ s.endWeekId }}周 </span>
            <span>{{ dayName(s.dayOfWeek) }}</span>
            <span> 第{{ s.startHoursId }}~{{ s.endHoursId }}节</span>
          </template>
        </template>
      </p>
    </n-thing>
  </n-card>
</template>