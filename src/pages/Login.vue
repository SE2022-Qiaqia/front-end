<script setup lang="ts">
import { NSpace, NCard, NForm, NFormItem, NInput, NTabs, NTabPane, FormRules, NSpin, NButton, useMessage } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { User } from '../models';
import { injectStore } from '../store';

const store = injectStore();
const message = useMessage();
const route = useRoute();
const router = useRouter();

const form = ref({
  username: '20191122333',
  password: '',
  passwordRepeat: ''
});
const submitting = ref(false);

const formRules: FormRules = {
  username: {
    required: true,
    pattern: /^\d{9,10}$/,
    message: '请输入正确的学号',
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
  ]
};

async function login() {
  submitting.value = true;
  try {
    const token = (await store.dispatch('login', form.value)) as string;
    const userInfo = (await store.dispatch('fetchUserInfo')) as User;
    router.push({ path: route.query.redirect as string || '/' });
    message.info(`登录成功，欢迎您：${userInfo.name}！`)
  } catch (error) {
    message.error(`登录失败！${(error as Error).message}`);
  }
  submitting.value = false;
}

onMounted(() => {
  if (store.state.login.loginReason) {
    message.error(store.state.login.loginReason);
  }
});
</script>

<template>
  <n-space vertical align="center">
    <n-spin :show="submitting">

      <n-card title="加入选课系统" size="huge">

        <n-tabs type="line" animated>

          <n-tab-pane name="login" tab="登录">
            <n-form :model="form" :rules="formRules" label-placement="left" label-width="auto"
              require-mark-placement="right-hanging">
              <n-form-item label="用户名:" path="username">
                <n-input v-model:value="form.username" placeholder="请输入学号" clearable />
              </n-form-item>
              <n-form-item label="密码:" path="password">
                <n-input v-model:value="form.password" type="password" placeholder="请输入密码" />
              </n-form-item>
              <div style="display: flex; justify-content: flex-end">
                <n-button round type="primary" @click="login">
                  登录
                </n-button>
              </div>
            </n-form>
          </n-tab-pane>

          <n-tab-pane name="register" tab="注册">
            <n-form :model="form" :rules="formRules" label-placement="left" label-width="auto"
              require-mark-placement="right-hanging">
              <n-form-item label="用户名:" path="username">
                <n-input v-model:value="form.username" placeholder="请输入学号" clearable />
              </n-form-item>
              <n-form-item label="密码:" path="password">
                <n-input v-model:value="form.password" type="password" placeholder="请输入密码" />
              </n-form-item>
              <n-form-item label="确认密码:" path="passwordRepeat">
                <n-input v-model:value="form.passwordRepeat" type="password" placeholder="请再次确认密码" />
              </n-form-item>
              <div style="display: flex; justify-content: flex-end">
                <n-button round type="primary" ghost>
                  注册
                </n-button>
              </div>
            </n-form>
          </n-tab-pane>

        </n-tabs>
      </n-card>

    </n-spin>
  </n-space>
</template>