<script setup lang="ts">
import { NThing, NCard } from 'naive-ui';
import { CourseCommon, CourseSpecificWithoutCommon } from '@/api/resp';

const props = defineProps<{
  courseCommon: CourseCommon,
  courseSpecific?: CourseSpecificWithoutCommon
}>();
</script>

<template>
  <n-card>
    <n-thing :title="`${props.courseCommon.name} (课程号：${props.courseCommon.id})`">
      <p>
        <span>开课学院：</span>
        <span>{{ props.courseCommon.college.name }}</span>
        <br />
        <span>学分：</span>
        <span>{{ props.courseCommon.credits }}</span>
        <br />
        <span>学时：</span>
        <span>{{ props.courseCommon.hours }}</span>
        <br />
        <template v-if="props.courseSpecific">
          <span>授课老师：</span>
          <span>
            {{ props.courseSpecific.teacher.realName }}
            ({{ props.courseSpecific.teacher.college.name }})
          </span>
          <br />
          <span>地点：</span>
          <span>{{ props.courseSpecific.location }}</span>
          <br />
          <span>人数(总额/已选/余量)：</span>
          <br />
          <span>{{ props.courseSpecific.quota }}/{{ props.courseSpecific.quotaUsed }}/{{
              (props.courseSpecific.quota || 0) - (props.courseSpecific.quotaUsed || 0)
          }}</span>
        </template>
      </p>
    </n-thing>
  </n-card>
</template>