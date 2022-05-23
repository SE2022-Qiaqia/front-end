<script setup lang="tsx">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { darkTheme, useOsTheme, NConfigProvider, NMessageProvider } from "naive-ui";
import { computed, provide } from "vue";
import { useStore } from "vuex";
import Layout from "./Layout.vue";
import { key as storeKey } from "./store";

const osTheme = useOsTheme();
const theme = computed(() => osTheme.value === 'dark' ? darkTheme : null);
const store = useStore(storeKey);

provide(storeKey, store);

</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <Layout />
    </n-message-provider>
  </n-config-provider>
</template>