<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { useCurrentVehicle } from '../composables/useCurrentVehicle';
import { f7 } from 'framework7-vue';
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

const { getCurrentVehicle } = useCurrentVehicle();

interface FuelRecord {
  id: number;
  created_at: string;
  mileage: number;
  liters: number;
  price_per_liter: number;
  amount: number;
  fuel_type: string;
  is_full_tank: boolean;
  note?: string;
}

const records = ref<FuelRecord[]>([]);
const showChart = ref(false);
const showEditSheet = ref(false);
const editingRecord = ref<FuelRecord | null>(null);

async function loadRecords() {
  const vehicleId = getCurrentVehicle();
  if (!vehicleId) {
    records.value = [];
    return;
  }

  try {
    const list = await invoke('get_fuel_records', {
      vehicleId: vehicleId
    });
    records.value = (list as FuelRecord[]).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('加载记录失败:', error);
    records.value = [];
  }
}

async function addTestData() {
  const vehicleId = getCurrentVehicle();
  if (!vehicleId) {
    f7.dialog.alert('请先在设置中选择车辆');
    return;
  }

  try {
    await invoke('add_test_fuel_records', {
      vehicleId: vehicleId
    });
    await loadRecords();
    f7.toast.create({
      text: '测试数据添加成功',
      position: 'center',
      closeTimeout: 2000,
    }).open();
  } catch (error) {
    f7.dialog.alert('添加测试数据失败: ' + error);
  }
}

async function deleteRecord(recordId: number) {
  try {
    await invoke('delete_fuel_record', {
      recordId: recordId
    });
    await loadRecords();
    f7.toast.create({
      text: '删除成功',
      position: 'center',
      closeTimeout: 2000,
    }).open();
  } catch (error) {
    f7.dialog.alert('删除失败: ' + error);
  }
}

async function updateRecord() {
  if (!editingRecord.value) return;

  // 自动计算总价
  editingRecord.value.amount = editingRecord.value.liters * editingRecord.value.price_per_liter;

  try {
    await invoke('update_fuel_record', {
      recordId: editingRecord.value.id,
      fuelType: editingRecord.value.fuel_type,
      pricePerLiter: editingRecord.value.price_per_liter,
      amount: editingRecord.value.amount,
      liters: editingRecord.value.liters,
      mileage: editingRecord.value.mileage,
      isFullTank: editingRecord.value.is_full_tank,
      note: editingRecord.value.note || null,
    });
    showEditSheet.value = false;
    await loadRecords();
    f7.toast.create({
      text: '修改成功',
      position: 'center',
      closeTimeout: 2000,
    }).open();
  } catch (error) {
    f7.dialog.alert('修改失败: ' + error);
  }
}

function showRecordActions(record: FuelRecord) {
  f7.actions.create({
    buttons: [
      [
        {
          text: '修改记录',
          onClick: () => {
            editingRecord.value = { ...record };
            showEditSheet.value = true;
          }
        },
        {
          text: '删除记录',
          color: 'red',
          onClick: () => {
            f7.dialog.confirm(
              '确定要删除这条记录吗？',
              '删除记录',
              async () => {
                await deleteRecord(record.id);
              }
            );
          }
        }
      ],
      [
        {
          text: '取消',
        }
      ]
    ]
  }).open();
}

const totalExpense = computed(() => {
  return records.value.reduce((sum, r) => sum + r.amount, 0).toFixed(2);
});

// 计算油耗数据（百公里油耗）
const consumptionData = computed(() => {
  const result: { date: string; consumption: number }[] = [];

  for (let i = 1; i < records.value.length; i++) {
    const current = records.value[i];
    const previous = records.value[i - 1];

    if (current.is_full_tank && previous.is_full_tank) {
      const distance = previous.mileage - current.mileage;
      if (distance > 0) {
        const consumption = (current.liters / distance) * 100;
        result.push({
          date: current.created_at.split('T')[0],
          consumption: parseFloat(consumption.toFixed(2))
        });
      }
    }
  }

  return result.reverse();
});

const chartData = computed(() => {
  // 只取最近7条记录
  const recentRecords = [...records.value].slice(0, 7).reverse();
  const recentConsumption = consumptionData.value.slice(-7);

  return {
    labels: recentRecords.map(r => r.created_at.split('T')[0]),
    datasets: [
      {
        label: '花费金额(元)',
        data: recentRecords.map(r => r.amount),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: '油耗(L/100km)',
        data: recentRecords.map(r => {
          const found = recentConsumption.find(c => c.date === r.created_at.split('T')[0]);
          return found ? found.consumption : null;
        }),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        yAxisID: 'y1',
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: { display: false }
  },
  scales: {
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: '花费(元)'
      }
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      title: {
        display: true,
        text: '油耗(L/100km)'
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  }
};

onMounted(() => {
  loadRecords();
});
</script>

<template>
  <f7-page name="expense">
    <f7-navbar title="花费记录" />

    <f7-block-title>
      总花费: ¥{{ totalExpense }}
      <f7-button small fill @click="showChart = !showChart" class="ml-2">
        {{ showChart ? '隐藏图表' : '显示图表' }}
      </f7-button>
      <f7-button small @click="addTestData" class="ml-2">
        添加测试数据
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
        :title="`¥${record.amount.toFixed(2)}`"
        :subtitle="`${record.liters}L × ¥${record.price_per_liter.toFixed(2)}/L`"
        :text="`里程: ${record.mileage}km | ${record.created_at.split('T')[0]}`"
        link
        @click="showRecordActions(record)"
      >
        <template #after>
          <f7-badge v-if="record.is_full_tank" color="green">满</f7-badge>
        </template>
      </f7-list-item>
    </f7-list>

    <f7-sheet
      :opened="showEditSheet"
      @sheet:closed="showEditSheet = false"
    >
      <f7-toolbar>
        <div class="left"></div>
        <div class="right">
          <f7-link sheet-close>关闭</f7-link>
        </div>
      </f7-toolbar>

      <f7-page-content>
        <f7-block-title>修改记录</f7-block-title>
        <f7-list v-if="editingRecord" no-hairlines-md>
          <f7-list-input
            label="里程(km)"
            type="number"
            :value="editingRecord.mileage"
            @input="editingRecord.mileage = parseFloat($event.target.value)"
          />
          <f7-list-input
            label="加油量(L)"
            type="number"
            step="0.01"
            :value="editingRecord.liters"
            @input="editingRecord.liters = parseFloat($event.target.value); editingRecord.amount = editingRecord.liters * editingRecord.price_per_liter"
          />
          <f7-list-input
            label="单价(元/L)"
            type="number"
            step="0.01"
            :value="editingRecord.price_per_liter"
            @input="editingRecord.price_per_liter = parseFloat($event.target.value); editingRecord.amount = editingRecord.liters * editingRecord.price_per_liter"
          />
          <f7-list-input
            label="总价(元)"
            type="number"
            step="0.01"
            :value="editingRecord.amount"
            readonly
          />
          <f7-list-item title="是否加满">
            <f7-toggle :checked="editingRecord.is_full_tank" @toggle:change="editingRecord.is_full_tank = $event" />
          </f7-list-item>
        </f7-list>

        <f7-block>
          <f7-button fill @click="updateRecord">保存修改</f7-button>
        </f7-block>
      </f7-page-content>
    </f7-sheet>

    <f7-toolbar tabbar bottom>
      <f7-link href="/" text="油耗" />
      <f7-link href="/expense/" tab-link-active text="花费" />
      <f7-link href="/settings/" text="设置" />
    </f7-toolbar>
  </f7-page>
</template>
