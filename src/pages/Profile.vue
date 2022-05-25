<script setup lang="ts">
import { onMounted, ref, watch, watchEffect } from 'vue';
import {
  NGrid, NGridItem, NForm, NFormItem, NInput,
  NTabs, NTabPane, FormRules, NButton, SelectOption,
  NSelect,
  useMessage
} from 'naive-ui';
import ProfileEditor from '../components/ProfileEditor.vue';
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

onMounted(() => {
  store.dispatch('fetchColleges').then(() => {
    colleges.value = store.state.colleges;
  });
});

const updatingInfo = ref(false);
async function updateUserInfo(info: UpdateUserRequest) {
  try {
    updatingInfo.value = true;
    await api.updateSelfInfo(info);
    store.dispatch('fetchUserInfo');
    message.success('更新成功！' + (user.value.role === Role.Admin ? '' : '(您不是管理员，只能更新部分信息)'));
  } catch (error) {
    message.error('更新失败！' + (error as any).message);
  } finally {
    updatingInfo.value = false;
  }
}

const updatingPassword = ref(false);
async function updatePassword(password: string) {
  try {
    updatingPassword.value = true;
    await api.updatePassword(password);
    message.success('更新密码成功！');
    store.dispatch('logout');
    router.push('/login');
  } catch (error) {
    message.error('更新失败！' + (error as any).message);
  } finally {
    updatingPassword.value = false;
  }
}
</script>

<template>
  <n-grid :cols="12">
    <n-grid-item :offset="1" :span="10">
      <profile-editor :user="user" :colleges="colleges" :updating-info="updatingInfo"
        :updating-password="updatingPassword" @update-info="updateUserInfo" @update-password="updatePassword" />
    </n-grid-item>
  </n-grid>
</template>