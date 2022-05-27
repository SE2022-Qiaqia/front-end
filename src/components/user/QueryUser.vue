<script setup lang="ts">
import { NFormItem, NInput } from 'naive-ui';
import { api } from '@/api';
import { User } from '@/api/resp';
import { ref, watch } from 'vue';

const props = defineProps<{
  defaultUserId?: string,
  disabled: boolean,
  user?: User,
  querying: boolean,
}>();

const id = ref(props.defaultUserId);
watch(() => props.defaultUserId, (userId?: string) => id.value = userId || '');

const emits = defineEmits<{
  (e: 'update:user', user?: User): void
  (e: 'update:userId', userId?: string): void
  (e: 'update:querying', querying: boolean): void
}>();

async function queryUser() {
  emits('update:querying', true);
  try {
    const user = await api.fetchOtherUserInfo(id.value!);
    emits('update:user', user);
  } catch (e: any) {
    emits('update:user', undefined);
  }
  emits('update:querying', false);
}
</script>

<template>
  <n-form-item label="学生ID:" label-placement="left">
    <n-input v-model:value="id" placeholder="请输入学号, 回车查询" clearable :disabled="disabled && !!id" @keydown.enter="queryUser" />
  </n-form-item>
</template>