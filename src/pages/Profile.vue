<script setup lang="ts">
import { onMounted, ref, watch, watchEffect } from 'vue';
import {
  NGrid, NGridItem, NForm, NFormItem, NInput,
  NTabs, NTabPane, FormRules, NButton, SelectOption,
  NSelect,
  useMessage
} from 'naive-ui';
import UserBrief from '../components/UserBrief.vue';
import { injectStore } from '../store';
import { College, Role, User } from '../api/resp';
import { UpdateUserRequest } from '../api/req';
import { api } from '../api';
import { useRouter } from 'vue-router';

const store = injectStore();
const message = useMessage();
const router = useRouter();

const user = ref<User>(store.state.user!);
watchEffect(() => user.value = store.state.user!);

const colleges = ref<College[]>([]);
const collegesOptions = ref<SelectOption[]>();
watch(() => colleges.value, () => {
  collegesOptions.value = colleges.value.map(c => ({
    value: c.id,
    label: c.name
  }));
});

onMounted(() => {
  store.dispatch('fetchColleges').then(() => {
    colleges.value = store.state.colleges;
  });
});

const info = ref<UpdateUserRequest>({
  username: user.value.username,
  realName: user.value.realName,
  collegeId: user.value.college.id,
  role: user.value.role,
  entranceYear: user.value.entranceYear || 2019
});
const updatingInfo = ref(false);

const password = ref({
  password: '',
  passwordRepeat: '',
});

async function updateUserInfo() {
  try {
    await api.updateSelfInfo(info.value);
    store.dispatch('fetchUserInfo');
    message.success('更新成功！' + (user.value.role === Role.Admin ? '' : '(您不是管理员，只能更新部分信息)'));
  } catch (error) {
    message.error('更新失败！' + (error as any).message);
  }
}

async function updatePassword() {
  try {
    await api.updatePassword(password.value.password);
    message.success('更新密码成功！');
    store.dispatch('logout');
    router.push('/login');
  } catch (error) {
    message.error('更新失败！' + (error as any).message);
  }
}

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
  }
};

</script>

<template>
  <n-grid :cols="12" :x-gap="12">
    <n-grid-item :offset="1" :span="8">
      <n-tabs type="line" animated>
        <n-tab-pane name="info" tab="个人信息">
          <n-form :model="info" :rules="formRules" label-placement="left" label-width="auto"
            require-mark-placement="right-hanging">
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
            <div style="display: flex; justify-content: flex-end">
              <n-button round type="primary" ghost @click="updateUserInfo">
                更新个人信息
              </n-button>
            </div>
          </n-form>
        </n-tab-pane>
        <n-tab-pane name="password" tab="更新密码">
          <n-form :model="password" :rules="formRules" label-placement="left" label-width="auto"
            require-mark-placement="right-hanging">
            <n-form-item label="密码:" path="password">
              <n-input v-model:value="password.password" type="password" placeholder="请输入密码" />
            </n-form-item>
            <n-form-item label="确认密码:" path="passwordRepeat">
              <n-input v-model:value="password.passwordRepeat" type="password" placeholder="请再次确认密码" />
            </n-form-item>
            <div style="display: flex; justify-content: flex-end">
              <n-button round type="primary" ghost
                :disabled="!password.password || password.password !== password.passwordRepeat" @click="updatePassword">
                修改密码
              </n-button>
            </div>
          </n-form>
        </n-tab-pane>
      </n-tabs>
    </n-grid-item>
    <n-grid-item :span="2">
      <user-brief :user="user" />
    </n-grid-item>
  </n-grid>
</template>