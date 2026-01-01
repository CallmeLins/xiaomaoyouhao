<script setup lang="ts">
import { f7, f7ready } from 'framework7-vue';
import { onMounted } from 'vue';

import FuelPage from './views/FuelPage.vue';
import ExpensePage from './views/ExpensePage.vue';
import SettingsPage from './views/SettingsPage.vue';
import VehiclesPage from './views/VehiclesPage.vue';

const f7params = {
  name: '小猫油耗',
  theme: 'auto',
  routes: [
    {
      path: '/',
      component: FuelPage,
    },
    {
      path: '/expense/',
      component: ExpensePage,
    },
    {
      path: '/settings/',
      component: SettingsPage,
    },
    {
      path: '/vehicles/',
      component: VehiclesPage,
    },
  ],
};

onMounted(() => {
  f7ready(() => {
    console.log('Framework7 ready');
  });
});
</script>

<template>
  <f7-app v-bind="f7params">
    <f7-view main url="/" :push-state="true" />
  </f7-app>
</template>
