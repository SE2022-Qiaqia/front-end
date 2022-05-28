<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue';
import { NInput } from 'naive-ui';

const props = defineProps<{
  value1: number,
  value2: number,
  value1Min?: number,
  value1Max?: number,
  value2Min?: number,
  value2Max?: number,
  placeholder: [string, string]
}>();

const emits = defineEmits<{
  (e: 'update:value1', value1: number): void,
  (e: 'update:value2', value2: number): void
}>();

function valueString(v: number) {
  return v ? v + '' : '';
}

function keep(curr: number, max: number, min: number) {
  if (curr > max) {
    return max;
  }
  if (curr < min) {
    return min;
  }
  return curr;
}

const weeks = ref<[string, string]>([valueString(props.value1), valueString(props.value2)]);
watchEffect(() => {
  weeks.value = [
    valueString(keep(props.value1, props.value1Max || Infinity, props.value1Min || 0)),
    valueString(keep(props.value2, props.value2Max || Infinity, props.value2Min || 0))
  ];
})

function update() {
  const [start, end] = weeks.value;
  const v1 = parseInt(start);
  const v2 = parseInt(end);
  emits('update:value1', v1);
  emits('update:value2', v2);
}
</script>

<template>
  <n-input style="width: 150px" pair v-model:value="weeks" separator="-" :placeholder="placeholder" @blur="update">
    <template #suffix>
      <slot name="suffix" />
    </template>
  </n-input>
</template>