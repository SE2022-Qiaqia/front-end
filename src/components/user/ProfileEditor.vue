<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { User, College, Role } from '@/api/resp';
import {
  NGrid, NGridItem, NForm, NFormItem, NInput, NInputNumber,
  NTabs, NTabPane, FormRules, NButton, SelectOption,
  NSelect
} from 'naive-ui';
import UserBrief from './UserBrief.vue';
import { UpdateUserRequest } from '@/api/req';

const props = defineProps<{
  user: User,
  colleges: College[],
  updatingInfo: boolean,
  updatingPassword: boolean,
}>();
const emits = defineEmits<{
  (e: 'updateInfo', updateInfo: UpdateUserRequest): void
  (e: 'updatePassword', password: string): void
}>();

const collegesOptions = computed<SelectOption[]>(
  () => props.colleges.map(c => ({
    value: c.id,
    label: c.name
  })));

const rolesOptions: SelectOption[] = [
  {
    value: Role.Student,
    label: '学生',
  },
  {
    value: Role.Teacher,
    label: '教师',
  },
  {
    value: Role.Admin,
    label: '管理员',
  }
];

const info = ref<UpdateUserRequest>({
  username: props.user.username,
  realName: props.user.realName,
  collegeId: props.user.college.id,
  role: props.user.role,
  entranceYear: props.user.entranceYear || 2019
});
watch(() => props.user, () => {
  info.value = {
    username: props.user.username,
    realName: props.user.realName,
    collegeId: props.user.college.id,
    role: props.user.role,
    entranceYear: props.user.entranceYear || 2019
  };
})


const password = ref({
  password: '',
  passwordRepeat: '',
});


const formRules: FormRules = {
  id: {
    required: true,
    pattern: /^.{9,16}$/,
    message: '请输入正确的学号',
    trigger: 'input'
  },
  username: {
    required: true,
    pattern: /^.{5,20}$/,
    message: '请输入正确的用户名',
    trigger: 'input'
  },
  realName: {
    required: true,
    pattern: /^.{1,15}$/,
    message: '请输入正确的姓名',
    trigger: 'input'
  },
  password: {
    required: true,
    pattern: /^.{6,}$/,
    message: '请输入密码, 至少6位',
    trigger: 'input'
  },
  passwordRepeat: [
    {
      required: true,
      message: '请确认密码',
      trigger: ['input', 'blur']
    },
    {
      message: '两次密码不一致',
      trigger: 'input',
      validator(rule, value, callback) {
        return password.value.password.startsWith(value) && password.value.password.length >= value.length;
      }
    },
    {
      message: '两次密码不一样',
      trigger: ['blur', 'password-input'],
      validator(rule, value, callback) {
        return password.value.password === value;
      }
    }
  ],
  collegeId: {
    required: true,
    message: '请选择学院',
    trigger: 'input',
    pattern: /^.{1,}$/,
  },
  entranceYear: {
    required: true,
    message: '请输入入学年份',
    trigger: 'input',
    pattern: /^\d{4}$/,
  }
};

function updateInfo() {
  emits('updateInfo', info.value);
}

function updatePassword() {
  emits('updatePassword', password.value.password);
}

</script>

<template>
  <n-grid :cols="10" :x-gap="12">
    <n-grid-item :span="7">
      <n-tabs type="line" animated>
        <n-tab-pane name="info" tab="个人信息">
          <n-form :model="info" :rules="formRules" label-placement="left" label-width="auto"
            require-mark-placement="right-hanging" :disabled="updatingInfo">
            <!-- <n-form-item label="学号:" path="id">
              <n-input-number v-model:value="info.id" placeholder="请输入学号" clearable />
            </n-form-item> -->
            <n-form-item label="用户名:" path="username">
              <n-input v-model:value="info.username" placeholder="请输入用户名" clearable />
            </n-form-item>
            <n-form-item label="姓名:" path="realName">
              <n-input v-model:value="info.realName" placeholder="请输入姓名" clearable />
            </n-form-item>
            <n-form-item label="学院: " path="collegeId">
              <n-select v-model:value="info.collegeId" placeholder="请选择学院" :options="collegesOptions" />
            </n-form-item>
            <n-form-item label="角色: ">
              <n-select v-model:value="info.role" placeholder="请选择角色" :options="rolesOptions" />
            </n-form-item>
            <n-form-item label="入学年份:" path="entranceYear">
              <n-input-number v-model:value="info.entranceYear" :min="1980" :max="new Date().getFullYear() + 10"
                placeholder="请输入入学年份" clearable />
            </n-form-item>
            <div style="display: flex; justify-content: flex-end">
              <n-button round type="primary" ghost @click="updateInfo" :loading="updatingInfo">
                更新个人信息
              </n-button>
            </div>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="password" tab="更新密码">
          <n-form :model="password" :rules="formRules" label-placement="left" label-width="auto"
            require-mark-placement="right-hanging" :disabled="updatingPassword">
            <n-form-item label="密码:" path="password">
              <n-input v-model:value="password.password" type="password" placeholder="请输入密码" />
            </n-form-item>
            <n-form-item label="确认密码:" path="passwordRepeat">
              <n-input v-model:value="password.passwordRepeat" type="password" placeholder="请再次确认密码" />
            </n-form-item>
            <div style="display: flex; justify-content: flex-end">
              <n-button round type="primary" ghost
                :disabled="!password.password || password.password !== password.passwordRepeat"
                :loading="updatingPassword" @click="updatePassword">
                修改密码
              </n-button>
            </div>
          </n-form>
        </n-tab-pane>
      </n-tabs>
    </n-grid-item>
    <n-grid-item :span="3">
      <user-brief :user="user" />
    </n-grid-item>
  </n-grid>
</template>