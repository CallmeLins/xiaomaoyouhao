<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FuelRecord {
  id: number;
  date: string;
  mileage: number;
  volume: number;
  price: number;
  total_cost: number;
  fuel_type: string;
  is_full_tank: boolean;
  notes?: string;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  vehicle_type: string;
}

const vehicles = ref<Vehicle[]>([]);
const selectedVehicleId = ref<number | null>(null);
const records = ref<FuelRecord[]>([]);
const showChart = ref(false);

async function loadVehicles() {
  try {
    const list = await invoke('get_all_vehicles');
    vehicles.value = list as Vehicle[];
    if (vehicles.value.length > 0) {
      selectedVehicleId.value = vehicles.value[0].id;
      await loadRecords();
    }
  } catch (error) {
    console.error('加载车辆失败:', error);
  }
}

async function loadRecords() {
  if (!selectedVehicleId.value) return;

  try {
    const list = await invoke('get_fuel_records', {
      vehicleId: selectedVehicleId.value
    });
    records.value = (list as FuelRecord[]).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('加载记录失败:', error);
  }
}

const totalExpense = computed(() => {
  return records.value.reduce((sum, r) => sum + r.total_cost, 0).toFixed(2);
});

const chartData = computed(() => {
  const sortedRecords = [...records.value].reverse();
  return {
    labels: sortedRecords.map(r => r.date),
    datasets: [{
      label: '花费金额(元)',
      data: sortedRecords.map(r => r.total_cost),
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      tension: 0.3,
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    y: { beginAtZero: true }
  }
};

onMounted(() => {
  loadVehicles();
});
</script>

<template>
  <f7-page name="expense">
    <f7-navbar title="花费记录" />
    
    <f7-block-title class="text-sm">选择车辆</f7-block-title>
    <f7-list no-hairlines-md>
      <f7-list-item
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        :title="`${vehicle.brand} ${vehicle.model}`"
        radio
        :checked="selectedVehicleId === vehicle.id"
        @change="selectedVehicleId = vehicle.id; loadRecords()"
        class="text-sm"
      />
    </f7-list>

    <f7-block-title class="text-sm">
      总花费: ¥{{ totalExpense }}
      <f7-button small fill @click="showChart = !showChart" class="ml-2 text-xs">
        {{ showChart ? '隐藏图表' : '显示图表' }}
      </f7-button>
    </f7-block-title>

    <f7-block v-if="showChart && records.length > 0" class="bg-white dark:bg-gray-800 rounded-lg p-4">
      <div style="height: 250px;">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </f7-block>

    <f7-block-title class="text-sm">记录列表</f7-block-title>
    <f7-list media-list no-hairlines-md>
      <f7-list-item
        v-if="records.length === 0"
        title="暂无记录"
        class="text-gray-500 text-sm"
      />
      <f7-list-item
        v-for="record in records"
        :key="record.id"
        :title="`¥${record.total_cost.toFixed(2)}`"
        :subtitle="`${record.volume}L × ¥${record.price}/L`"
        :text="`里程: ${record.mileage}km | ${record.date}`"
        class="text-sm"
      >
        <template #after>
          <f7-badge v-if="record.is_full_tank" color="green" class="text-xs">满</f7-badge>
        </template>
      </f7-list-item>
    </f7-list>

    <f7-toolbar tabbar bottom>
      <f7-link href="/" text="油耗" />
      <f7-link href="/expense/" tab-link-active text="花费" />
      <f7-link href="/settings/" text="设置" />
    </f7-toolbar>
  </f7-page>
</template>
