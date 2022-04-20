<script setup lang="tsx">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { darkTheme, useOsTheme, NConfigProvider } from "naive-ui";
import { computed } from "vue";
import Layout from "./Layout.vue";

const osTheme = useOsTheme();
const theme = computed(() => osTheme.value === 'dark' ? darkTheme : null);

</script>

<template>
  <n-config-provider :theme="theme">
    <Layout />
  </n-config-provider>
</template>