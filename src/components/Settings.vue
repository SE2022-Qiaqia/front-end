<script setup lang="ts">
import {
  NSpace, NCard, NSwitch, NList, NListItem, NText, NButton, NInput, NIcon,
  NInputNumber, NInputGroup, NSelect, SelectOption, useDialog, useMessage
} from 'naive-ui';
import { onMounted, ref, watch, computed } from 'vue';
import { api } from '@/api';
import { Semester } from '@/api/resp';
import { Semester as NewSemester } from '@/api/req';
import { injectStore } from '@/store';
import { Add24Filled } from '@vicons/fluent';
import { semesterToString } from '@/utils';

const store = injectStore();
const dialog = useDialog();
const message = useMessage();

const canRegister = ref(true);
const canRegisterLoading = ref(true);

const currentSemester = computed(() => store.state.currentSemester);
const semesters = computed(() => store.state.semesters);

const colleges = computed(() => store.state.colleges);
const newCollegeName = ref('');
const isAddingCollege = ref(false);

const newSemesterModel = ref<NewSemester>({
  year: new Date().getFullYear(),
  term: Math.ceil(new Date().getMonth() / 6),
});
watch(() => store.state.currentSemester, () => {
  if (!!store.state.semesters?.length) return;
  const latest = store.state.semesters[0];
  newSemesterModel.value.year = latest.year + (latest.term === 3 ? 1 : 0);
  newSemesterModel.value.term = latest.term >= 3 ? 1 : latest.term + 1;
})
const semesterTermsOptions: SelectOption[] = [1, 2, 3].map(term => ({
  label: `第${term}学期`,
  value: term,
}));
console.log(semesterTermsOptions);
const isAddingSemester = ref(false);

async function enableRegister(value: boolean) {
  canRegisterLoading.value = true;
  try {
    await api.enableRegister(value);
  } catch (e) {
    message.error((value ? '开放注册' : '关闭注册') + '失败！' + (e as any).message);
  } finally {
    refreshCanRegister();
  }
}

async function newCollege() {
  isAddingCollege.value = true;
  api.newCollege(newCollegeName.value)
    .then(() => {
      newCollegeName.value = '';
      message.success('添加学院成功！');
      store.dispatch('fetchColleges');
    })
    .catch(e => {
      message.error('添加学院失败！' + (e as any).message);
    })
    .finally(() => isAddingCollege.value = false);
}

async function newSemester() {
  isAddingSemester.value = true;
  api.newSemester(newSemesterModel.value)
    .then(() => {
      newCollegeName.value = '';
      message.success('添加学期成功！');
      store.dispatch('fetchSemesters');
    })
    .catch(e => {
      message.error('添加学期失败！' + (e as any).message);
    })
    .finally(() => isAddingSemester.value = false);
}

function setCurrentSemester(semester: Semester) {
  dialog.info({
    title: '修改当前学期',
    content: `确定修改当前学期为"${semester.year}年第${semester.term}学期"吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      api.setCurrentSemester(semester.id)
        .then(() => message.success('修改成功'))
        .catch(e => message.error('修改失败！' + e.message))
        .finally(() => {
          store.dispatch('fetchSemesters');
        });
    }
  })
}

function refreshCanRegister() {
  api.canRegister().then(enabled => {
    canRegister.value = enabled;
    canRegisterLoading.value = false;
  });
}

onMounted(() => {
  refreshCanRegister();
  store.dispatch('fetchColleges');
  store.dispatch('fetchSemesters');
});
</script>

<template>
  <n-space vertical style="margin-bottom: 30px;">
    <n-card title="注册">
      <n-switch v-model:value="canRegister" :loading="canRegisterLoading" @update:value="enableRegister">
        <template #checked>已开放注册</template>
        <template #unchecked>未开放注册</template>
      </n-switch>
    </n-card>
    <n-space item-style="flex: 1">
      <n-card title="学院">
        <n-list>
          <n-list-item v-for="c in colleges" key="id">
            <n-text>#{{ c.id }} - {{ c.name }}</n-text>
          </n-list-item>
          <n-list-item>
            <n-space>
              <n-input style="flex: 1;" v-model:value="newCollegeName" placeholder="新学院" />
              <n-button :loading="isAddingCollege" :disabled="!newCollegeName" @click="newCollege">
                <template #icon>
                  <n-icon>
                    <Add24Filled />
                  </n-icon>
                </template>
              </n-button>
            </n-space>
          </n-list-item>
        </n-list>
      </n-card>
      <n-card title="学期">
        <n-list>
          <n-list-item v-for="s in semesters" key="id">
            <n-space align="center" justify="space-between">
              <n-text>{{ semesterToString(s, s.id === currentSemester?.id) }}</n-text>
              <n-button v-if="currentSemester && s.id !== currentSemester?.id" text type="primary"
                @click="setCurrentSemester(s)">设为本学期</n-button>
              <n-button v-else disabled text type="primary">已是本学期</n-button>
            </n-space>
          </n-list-item>
          <n-list-item>
            <n-space align="center" justify="space-between">
              <n-input-group>
                <n-input-number v-model:value="newSemesterModel.year" :show-button="false">
                  <template #suffix>年</template>
                </n-input-number>
                <n-select v-model:value="newSemesterModel.term" :options="semesterTermsOptions" />
              </n-input-group>
              <n-button :loading="isAddingSemester" @click="newSemester">
                <template #icon>
                  <n-icon>
                    <Add24Filled />
                  </n-icon>
                </template>
              </n-button>
            </n-space>
          </n-list-item>
        </n-list>
      </n-card>
    </n-space>
  </n-space>
</template>