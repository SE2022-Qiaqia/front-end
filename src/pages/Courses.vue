<template>
  <n-grid :cols="12">
    <n-grid-item :offset="1" :span="10">
      <n-space vertical align="stretch">
        <n-form :model="queryModel" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
          <n-form-item label="课程: ">
            <n-input v-model:value="queryModel.courseName" placeholder="请输入课程名" />
          </n-form-item>
          <n-form-item label="学院: ">
            <n-select v-model:value="queryModel.colleges" placeholder="请选择学院" :options="collegesOptions" multiple />
          </n-form-item>
          <n-form-item label="教师: ">
            <n-input v-model:value="queryModel.teacherName" placeholder="请输入教师名字" />
          </n-form-item>
          <n-form-item label="学期: ">
            <n-select placeholder="请选择学期" :options="semestersOptions" />
          </n-form-item>
          <n-form-item label="余量: ">
            <n-checkbox v-model:checked="queryModel.isQuotaLeft" label="仅看有余量" />
          </n-form-item>
        </n-form>
      </n-space>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import { NSpace, NGrid, NGridItem, NForm, NFormItem, NInput, NSelect, SelectOption, NCheckbox } from 'naive-ui';
import { onMounted, ref, watch } from 'vue';
import { api } from '../api';
import { College, Semester } from '../api/resp';
import { injectStore } from '../store';

const store = injectStore();
const queryModel = ref({
  courseName: '',
  colleges: [],
  teacherName: '',
  isQuotaLeft: true
});

const colleges = ref<College[]>([]);
const collegesOptions = ref<SelectOption[]>();
watch(() => colleges.value, () => {
  collegesOptions.value = colleges.value.map(c => ({
    value: c.id,
    label: c.name
  }));
});

const semesters = ref<Semester[]>([]);
const semestersOptions = ref<SelectOption[]>();
watch(() => semesters.value, () => {
  semestersOptions.value = semesters.value.map(s => ({
    value: s.id,
    label: `${s.year}级-第${s.term}学期`
  }));
});

onMounted(() => {
  api.fetchColleges()
    .then(res => colleges.value = res);
  api.fetchSemesters()
    .then(res => semesters.value = res);
});
</script>
