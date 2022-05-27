<script setup lang="ts">
import {
  NSpace, NForm, NFormItem,
  NInput, NSelect, SelectOption, NCheckbox, NButton, NIcon
} from 'naive-ui';
import { Add24Filled } from '@vicons/fluent';
import { QueryCoursesRequest } from '@/api/req';

const props = defineProps<{
  collegesOptions: SelectOption[],
  semestersOptions: SelectOption[],
  currentSemesterId: number,
  showAdd: boolean,
  query: QueryCoursesRequest,
}>();

const emits = defineEmits<{
  (e: 'update:query', queryModel: QueryCoursesRequest): void
  (e: 'add'): void
}>();
const onAdd = () => emits('add');

function queryCourses() {
  emits('update:query', props.query);
}

function resetQuery() {
  props.query.name = '';
  props.query.collegesId = [];
  props.query.teacherName = '';
  props.query.semester = props.currentSemesterId;
  props.query.page = 1;
  props.query.size = 10;
  queryCourses();
}
</script>

<template>
  <n-form :model="query" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
    <n-form-item label="课程: ">
      <n-input v-model:value="query.name" placeholder="请输入课程名" @keydown.enter="queryCourses" />
    </n-form-item>
    <n-form-item label="学院: ">
      <n-select v-model:value="query.collegesId" placeholder="请选择学院" :options="collegesOptions" multiple />
    </n-form-item>
    <n-form-item label="教师: ">
      <n-input v-model:value="query.teacherName" placeholder="请输入教师名字" @keydown.enter="queryCourses" />
    </n-form-item>
    <n-form-item label="学期: ">
      <n-select v-model:value="query.semester" placeholder="请选择学期" :options="semestersOptions" />
    </n-form-item>
    <n-form-item label="余量: ">
      <n-checkbox v-model:checked="query.onlyLeftQuota" label="仅看有余量" />
    </n-form-item>
    <n-space justify="space-between">
      <n-space>
        <n-button v-if="showAdd" round ghost text type="primary" @click="onAdd">
          <template #icon>
            <n-icon>
              <Add24Filled />
            </n-icon>
          </template>
          新增课程
        </n-button>
      </n-space>
      <n-space>
        <n-button round type="primary" @click="queryCourses">
          查询
        </n-button>
        <n-button round ghost @click="resetQuery">
          重置
        </n-button>
      </n-space>
    </n-space>
  </n-form>
</template>