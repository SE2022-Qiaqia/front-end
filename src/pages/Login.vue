<script setup lang="ts">
import {
  NSpace, NCard, NForm, NFormItem, NInput, NInputNumber, NTabs, NTabPane,
  FormRules, NSpin, NButton, NSelect, useMessage, SelectOption, FormInst
} from 'naive-ui';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../api';
import { College, User } from '../api/resp';
import { injectStore } from '../store';

const store = injectStore();
const message = useMessage();
const route = useRoute();
const router = useRouter();

const form = ref({
  id: 2019000000000,
  username: 'Hello',
  realName: '',
  password: '',
  passwordRepeat: '',
  collegeId: 1
});
const submitting = ref(false);
const formRef = ref<FormInst | null>(null);
const canRegister = ref(true);

const tab = ref('login');

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

const formRules: FormRules = {
  id: {
    required: true,
    pattern: /^.{9,20}$/,
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
        return form.value.password.startsWith(value) && form.value.password.length >= value.length;
      }
    },
    {
      message: '两次密码不一样',
      trigger: ['blur', 'password-input'],
      validator(rule, value, callback) {
        return form.value.password === value;
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

async function login() {
  submitting.value = true;
  try {
    const token = (await store.dispatch('login', form.value)) as string;
    const userInfo = (await store.dispatch('fetchUserInfo')) as User;
    router.push({ path: route.query.redirect as string || '/' });
    message.info(`登录成功，欢迎您：${userInfo.realName}！`)
  } catch (error) {
    message.error(`登录失败！${(error as Error).message}`);
  }
  submitting.value = false;
}

async function register() {
  try {
    await formRef.value?.validate();
  } catch (error) {
    return;
  }

  submitting.value = true;
  try {
    const ok = await api.register({
      id: form.value.id,
      username: form.value.username,
      realName: form.value.realName,
      collegeId: form.value.collegeId,
      password: form.value.password
    });
    if (!ok) { // 一般应该不会发生，都是抛异常
      message.error('注册失败！');
    } else {
      message.success('注册成功！');
      tab.value = 'login';
    }
  } catch (error) {
    message.error(`注册失败！${(error as Error).message}`);
  }
  submitting.value = false;
}

onMounted(async () => {
  if (store.state.login.loginReason) {
    message.error(store.state.login.loginReason);
  }

  if (!(await api.canRegister())) {
    canRegister.value = false;
  }
});
</script>

<template>
  <n-space vertical align="center">
    <n-spin :show="submitting">

      <n-card title="加入选课系统" size="huge">

        <n-tabs type="line" animated v-model:value="tab">

          <n-tab-pane name="login" tab="登录">
            <n-form :model="form" :rules="formRules" label-placement="left" label-width="auto"
              require-mark-placement="right-hanging">
              <n-form-item label="用户名:" path="username">
                <n-input v-model:value="form.username" placeholder="请输入学号或姓名" clearable @keydown.enter="login" />
              </n-form-item>
              <n-form-item label="密码:" path="password">
                <n-input v-model:value="form.password" type="password" placeholder="请输入密码" @keydown.enter="login" />
              </n-form-item>
              <div style="display: flex; justify-content: flex-end">
                <n-button :disabled="!form.username || !form.password" round type="primary" @click="login">
                  登录
                </n-button>
              </div>
            </n-form>
          </n-tab-pane>

          <n-tab-pane name="register" tab="注册">
            <n-form ref="formRef" :model="form" :rules="formRules" label-placement="left" label-width="auto"
              require-mark-placement="right-hanging" :disabled="!canRegister">
              <n-form-item label="学号:" path="id">
                <n-input-number v-model:value="form.id" placeholder="请输入学号" clearable />
              </n-form-item>
              <n-form-item label="用户名:" path="username">
                <n-input v-model:value="form.username" placeholder="请输入用户名" clearable />
              </n-form-item>
              <n-form-item label="姓名:" path="realName">
                <n-input v-model:value="form.realName" placeholder="请输入姓名" clearable />
              </n-form-item>
              <n-form-item label="密码:" path="password">
                <n-input v-model:value="form.password" type="password" placeholder="请输入密码" />
              </n-form-item>
              <n-form-item label="确认密码:" path="passwordRepeat">
                <n-input v-model:value="form.passwordRepeat" type="password" placeholder="请再次确认密码" />
              </n-form-item>
              <n-form-item label="学院: " path="collegeId">
                <n-select v-model:value="form.collegeId" placeholder="请选择学院" :options="collegesOptions" />
              </n-form-item>
              <div style="display: flex; justify-content: flex-end">
                <n-button round :type="canRegister ? 'primary' : 'error'" ghost @click="register" :disabled="!canRegister">
                  {{ canRegister ? '注册' : '未开放注册' }}
                </n-button>
              </div>
            </n-form>
          </n-tab-pane>

        </n-tabs>
      </n-card>

    </n-spin>
  </n-space>
</template>