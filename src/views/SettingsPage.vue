<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from '../composables/useTheme';
import { f7 } from 'framework7-vue';

const { currentTheme, setTheme } = useTheme();

function navigateToVehicles() {
  f7.views.main.router.navigate('/vehicles/');
}

function showAbout() {
  f7.dialog.alert(
    '小猫油耗 v0.1.0<br>一个简洁的油耗记录应用',
    '关于作者'
  );
}
</script>

<template>
  <f7-page name="settings">
    <f7-navbar title="设置" />
    
    <f7-list no-hairlines-md>
      <f7-list-item
        link
        title="我的车辆"
        @click="navigateToVehicles"
      />
    </f7-list>

    <f7-block-title>外观</f7-block-title>
    <f7-list no-hairlines-md>
      <f7-list-item title="主题" smart-select :smart-select-params="{openIn: 'popover'}">
        <select v-model="currentTheme" @change="setTheme(currentTheme)">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="auto">跟随系统</option>
        </select>
      </f7-list-item>
    </f7-list>

    <f7-block-title>功能</f7-block-title>
    <f7-list no-hairlines-md>
      <f7-list-item title="AI配置">
        <template #after>
          <f7-badge color="gray">开发中</f7-badge>
        </template>
      </f7-list-item>

      <f7-list-item title="同步">
        <template #after>
          <f7-badge color="gray">开发中</f7-badge>
        </template>
      </f7-list-item>
    </f7-list>

    <f7-block-title>关于</f7-block-title>
    <f7-list no-hairlines-md>
      <f7-list-item
        link
        title="关于作者"
        @click="showAbout"
      />
    </f7-list>

    <f7-toolbar tabbar bottom>
      <f7-link href="/" text="油耗" />
      <f7-link href="/expense/" text="花费" />
      <f7-link href="/settings/" tab-link-active text="设置" />
    </f7-toolbar>
  </f7-page>
</template>
