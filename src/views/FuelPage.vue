<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { useDialog } from '../composables/useDialog';

const { showSuccess, showError } = useDialog();

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  vehicle_type: string;
}

const vehicles = ref<Vehicle[]>([]);
const selectedVehicleId = ref<number | null>(null);

const formData = ref({
  date: new Date().toISOString().split('T')[0],
  mileage: '',
  volume: '',
  price: '',
  totalCost: '',
  fuelType: '92',
  isFullTank: true,
  notes: '',
});

async function loadVehicles() {
  try {
    const list = await invoke('get_all_vehicles');
    vehicles.value = (list as Vehicle[]).filter(v => v.vehicle_type !== 'Electric');
    if (vehicles.value.length > 0) {
      selectedVehicleId.value = vehicles.value[0].id;
    }
  } catch (error) {
    showError('加载车辆失败');
  }
}

function calculateTotalCost() {
  const volume = parseFloat(formData.value.volume);
  const price = parseFloat(formData.value.price);
  if (!isNaN(volume) && !isNaN(price)) {
    formData.value.totalCost = (volume * price).toFixed(2);
  }
}

async function submitRecord() {
  if (!selectedVehicleId.value) {
    showError('请选择车辆');
    return;
  }

  try {
    await invoke('add_fuel_record', {
      vehicleId: selectedVehicleId.value,
      date: formData.value.date,
      mileage: parseFloat(formData.value.mileage),
      volume: parseFloat(formData.value.volume),
      price: parseFloat(formData.value.price),
      totalCost: parseFloat(formData.value.totalCost),
      fuelType: formData.value.fuelType,
      isFullTank: formData.value.isFullTank,
      notes: formData.value.notes,
    });

    showSuccess('添加成功');
    resetForm();
  } catch (error) {
    showError('添加失败');
  }
}

function resetForm() {
  formData.value = {
    date: new Date().toISOString().split('T')[0],
    mileage: '',
    volume: '',
    price: '',
    totalCost: '',
    fuelType: '92',
    isFullTank: true,
    notes: '',
  };
}

onMounted(() => {
  loadVehicles();
});
</script>

<template>
  <f7-page name="fuel">
    <f7-navbar title="添加油耗记录" />
    
    <f7-block-title class="text-sm">选择车辆</f7-block-title>
    <f7-list no-hairlines-md>
      <f7-list-item
        v-if="vehicles.length === 0"
        title="暂无车辆"
        class="text-gray-500 text-sm"
      />
      <f7-list-item
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        :title="`${vehicle.brand} ${vehicle.model}`"
        radio
        :checked="selectedVehicleId === vehicle.id"
        @change="selectedVehicleId = vehicle.id"
        class="text-sm"
      />
    </f7-list>

    <f7-block-title class="text-sm">加油信息</f7-block-title>
    <f7-list no-hairlines-md>
      <f7-list-input
        label="日期"
        type="date"
        :value="formData.date"
        @input="formData.date = $event.target.value"
        class="text-sm"
      />
      <f7-list-input
        label="里程(km)"
        type="number"
        placeholder="当前里程数"
        :value="formData.mileage"
        @input="formData.mileage = $event.target.value"
        class="text-sm"
      />
      <f7-list-input
        label="加油量(L)"
        type="number"
        step="0.01"
        placeholder="加油升数"
        :value="formData.volume"
        @input="formData.volume = $event.target.value; calculateTotalCost()"
        class="text-sm"
      />
      <f7-list-input
        label="单价(元/L)"
        type="number"
        step="0.01"
        placeholder="油价"
        :value="formData.price"
        @input="formData.price = $event.target.value; calculateTotalCost()"
        class="text-sm"
      />
      <f7-list-input
        label="总价(元)"
        type="number"
        step="0.01"
        placeholder="自动计算"
        :value="formData.totalCost"
        @input="formData.totalCost = $event.target.value"
        class="text-sm"
      />
      <f7-list-item title="油品类型" smart-select :smart-select-params="{openIn: 'popover'}">
        <select v-model="formData.fuelType">
          <option value="92">92号汽油</option>
          <option value="95">95号汽油</option>
          <option value="98">98号汽油</option>
          <option value="0">柴油</option>
        </select>
      </f7-list-item>
      <f7-list-item title="是否加满" class="text-sm">
        <f7-toggle :checked="formData.isFullTank" @toggle:change="formData.isFullTank = $event" />
      </f7-list-item>
      <f7-list-input
        label="备注"
        type="textarea"
        placeholder="可选"
        :value="formData.notes"
        @input="formData.notes = $event.target.value"
        class="text-sm"
      />
    </f7-list>

    <f7-block>
      <f7-button fill @click="submitRecord" class="text-sm">提交记录</f7-button>
    </f7-block>

    <f7-toolbar tabbar bottom>
      <f7-link href="/" tab-link-active text="油耗" />
      <f7-link href="/expense/" text="花费" />
      <f7-link href="/settings/" text="设置" />
    </f7-toolbar>
  </f7-page>
</template>
