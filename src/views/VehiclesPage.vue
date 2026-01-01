<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { useDialog } from '../composables/useDialog';
import { f7 } from 'framework7-vue';

const { showSuccess, showError } = useDialog();

interface Vehicle {
  id?: number;
  brand: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_tank_capacity?: number;
  battery_capacity?: number;
}

const vehicles = ref<Vehicle[]>([]);
const showAddSheet = ref(false);

const newVehicle = ref<Vehicle>({
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  vehicle_type: 'Fuel',
  fuel_tank_capacity: undefined,
  battery_capacity: undefined,
});

async function loadVehicles() {
  try {
    const list = await invoke('get_all_vehicles');
    vehicles.value = list as Vehicle[];
  } catch (error) {
    showError('加载车辆失败');
  }
}

async function addVehicle() {
  try {
    await invoke('add_vehicle', {
      brand: newVehicle.value.brand,
      model: newVehicle.value.model,
      year: newVehicle.value.year,
      vehicleType: newVehicle.value.vehicle_type,
      fuelTankCapacity: newVehicle.value.fuel_tank_capacity,
      batteryCapacity: newVehicle.value.battery_capacity,
    });

    showSuccess('添加成功');
    showAddSheet.value = false;
    resetForm();
    await loadVehicles();
  } catch (error) {
    showError('添加失败');
  }
}

function resetForm() {
  newVehicle.value = {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vehicle_type: 'Fuel',
    fuel_tank_capacity: undefined,
    battery_capacity: undefined,
  };
}

onMounted(() => {
  loadVehicles();
});
</script>

<template>
  <f7-page name="vehicles">
    <f7-navbar title="我的车辆" back-link="返回" />
    
    <f7-fab position="right-bottom" @click="showAddSheet = true">
      <span style="font-size: 24px; color: white;">+</span>
    </f7-fab>

    <f7-list media-list no-hairlines-md>
      <f7-list-item
        v-if="vehicles.length === 0"
        title="暂无车辆"
        subtitle="点击右下角添加车辆"
        class="text-sm text-gray-500"
      />
      <f7-list-item
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        :title="`${vehicle.brand} ${vehicle.model}`"
        :subtitle="`${vehicle.year}年 | ${vehicle.vehicle_type === 'Fuel' ? '燃油车' : vehicle.vehicle_type === 'Electric' ? '纯电动车' : '混合动力车'}`"
        class="text-sm"
      >
        <template #text>
          <span v-if="vehicle.fuel_tank_capacity" class="text-xs text-gray-600">
            油箱: {{ vehicle.fuel_tank_capacity }}L
          </span>
          <span v-if="vehicle.battery_capacity" class="text-xs text-gray-600 ml-2">
            电池: {{ vehicle.battery_capacity }}kWh
          </span>
        </template>
      </f7-list-item>
    </f7-list>

    <f7-sheet
      :opened="showAddSheet"
      @sheet:closed="showAddSheet = false"
    >
      <f7-toolbar>
        <div class="left"></div>
        <div class="right">
          <f7-link sheet-close>关闭</f7-link>
        </div>
      </f7-toolbar>
      
      <f7-page-content>
        <f7-block-title class="text-sm">添加新车辆</f7-block-title>
        <f7-list no-hairlines-md>
          <f7-list-input
            label="品牌"
            type="text"
            placeholder="如：丰田"
            :value="newVehicle.brand"
            @input="newVehicle.brand = $event.target.value"
            class="text-sm"
          />
          <f7-list-input
            label="型号"
            type="text"
            placeholder="如：卡罗拉"
            :value="newVehicle.model"
            @input="newVehicle.model = $event.target.value"
            class="text-sm"
          />
          <f7-list-input
            label="年份"
            type="number"
            :value="newVehicle.year"
            @input="newVehicle.year = parseInt($event.target.value)"
            class="text-sm"
          />
          <f7-list-item title="车辆类型" smart-select :smart-select-params="{openIn: 'popover'}" class="text-sm">
            <select v-model="newVehicle.vehicle_type">
              <option value="Fuel">燃油车</option>
              <option value="Electric">纯电动车</option>
              <option value="Hybrid">混合动力车</option>
            </select>
          </f7-list-item>
          <f7-list-input
            v-if="newVehicle.vehicle_type !== 'Electric'"
            label="油箱容量(L)"
            type="number"
            step="0.1"
            placeholder="可选"
            :value="newVehicle.fuel_tank_capacity"
            @input="newVehicle.fuel_tank_capacity = parseFloat($event.target.value) || undefined"
            class="text-sm"
          />
          <f7-list-input
            v-if="newVehicle.vehicle_type !== 'Fuel'"
            label="电池容量(kWh)"
            type="number"
            step="0.1"
            placeholder="可选"
            :value="newVehicle.battery_capacity"
            @input="newVehicle.battery_capacity = parseFloat($event.target.value) || undefined"
            class="text-sm"
          />
        </f7-list>
        
        <f7-block>
          <f7-button fill @click="addVehicle" class="text-sm">添加车辆</f7-button>
        </f7-block>
      </f7-page-content>
    </f7-sheet>
  </f7-page>
</template>
