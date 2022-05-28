<script setup lang="ts">
import { NForm, NFormItem, NSelect, NSpace, NInput, NInputNumber, SelectOption, NButton, NIcon, NText, FormRules } from 'naive-ui';
import CourseScheduleInputGroup from './CourseScheduleInputGroup.vue';
import { CourseSpecificModel, isOpenCourseRequest } from '.';
import QueryUser from '@/components/user/QueryUser.vue';
import { Add24Filled, Edit16Regular } from '@vicons/fluent';
import type { OpenCourseRequest } from '@/api/req';
import { Role, User } from '@/api/resp';
import { computed, ref } from 'vue';

const props = defineProps<{
  courseSpecific: CourseSpecificModel,
  teacher?: User,
  semestersOptions: SelectOption[],
  forOpen: boolean,
  loading: boolean
}>();

const teacherQuerying = ref(false);

const emits = defineEmits<{
  (e: 'update:courseSpecific', courseSpecific: CourseSpecificModel): void
  (e: 'update:teacher', teacher?: User): void
}>();

const updateTeacher = () => {
  emits('update:teacher', props.teacher);
  props.courseSpecific.teacherId = props.teacher?.id || 0;
};

const updateCourseSpecific = () => emits('update:courseSpecific', props.courseSpecific);

const isOk = computed(() => props.teacher?.role === Role.Teacher && props.courseSpecific.location);
</script>

<template>
  <n-form :model="courseSpecific" label-placement="left" label-width="auto" require-mark-placement="right-hanging"
    :disabled="loading">
    <template v-if="forOpen">
      <n-form-item label="课程ID: ">
        <n-input-number v-model:value="(courseSpecific as OpenCourseRequest).courseCommonId" placeholder="请输入课程ID"
          disabled :show-button="false" />
      </n-form-item>
      <n-form-item label="学期: ">
        <n-select v-model:value="(courseSpecific as OpenCourseRequest).semesterId" placeholder="请选择学期"
          :options="semestersOptions" />
      </n-form-item>
    </template>
    <query-user v-model:user="teacher" @update:user="updateTeacher" v-model:querying="teacherQuerying" label="教师ID:"
      :default-user-id="courseSpecific.teacherId + ''">
      <template #suffix v-if="teacher">
        <n-text depth="3">({{ teacher?.realName }})</n-text>
      </template>
    </query-user>
    <n-form-item label="地点: ">
      <n-input v-model:value="courseSpecific.location" placeholder="请输入上课地点" />
    </n-form-item>

    <n-form-item label="人数: ">
      <n-input-number v-model:value="courseSpecific.quota" placeholder="请输入人数" :min="1" />
    </n-form-item>
    <n-form-item label="上课时间: ">
      <course-schedule-input-group v-model:schedules="courseSpecific.courseSchedules" />
    </n-form-item>

    <n-space justify="end">
      <n-button v-if="forOpen" type="primary" round ghost @click="updateCourseSpecific" :loading="loading"
        :disabled="!isOk">
        <template #icon>
          <n-icon>
            <Add24Filled />
          </n-icon>
        </template>
        确认
      </n-button>
      <n-button v-else type="info" round ghost @click="updateCourseSpecific" :loading="loading" :disabled="!isOk">
        <template #icon>
          <n-icon>
            <Edit16Regular />
          </n-icon>
        </template>
        确认
      </n-button>
    </n-space>
  </n-form>
</template>