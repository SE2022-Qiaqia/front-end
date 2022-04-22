<script setup lang="ts">
import { NSpace, NCard, NForm, NFormItem, NInput, NTabs, NTabPane, FormRules, FormItemRule, NButton } from 'naive-ui';
import { ref } from 'vue';

const form = ref({
  username: '20191122333',
  password: '',
  passwordRepeat: ''
});

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
</script>

<template>
  <n-space vertical align="center">
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
              <n-button round type="primary">
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
  </n-space>
</template>