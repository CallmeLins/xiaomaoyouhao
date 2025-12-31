<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ExpenseStatPoint {
  month: string;
  fuel_cost: number;
  charging_cost: number;
  maintenance_cost: number;
  other_cost: number;
  total_cost: number;
}

const props = defineProps<{
  vehicleId: number;
}>();

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: "油费（元）",
      data: [] as number[],
      borderColor: "#FF6384",
      backgroundColor: "rgba(255, 99, 132, 0.1)",
      tension: 0.3,
      fill: true,
    },
    {
      label: "充电费（元）",
      data: [] as number[],
      borderColor: "#36A2EB",
      backgroundColor: "rgba(54, 162, 235, 0.1)",
      tension: 0.3,
      fill: true,
    },
  ],
});

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top",
      labels: {
        usePointStyle: true,
        pointStyle: 'line',
        boxWidth: 40,
        boxHeight: 2,
      },
    },
    title: {
      display: true,
      text: "近7次加油/充电费用趋势",
      font: {
        size: 16,
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "日期",
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "费用（元）",
      },
    },
  },
};

const loading = ref(true);
const error = ref("");

async function loadExpenseStatistics() {
  loading.value = true;
  error.value = "";

  try {
    const stats: ExpenseStatPoint[] = await invoke("get_recent_expense_records", {
      vehicleId: props.vehicleId,
      limit: 7,
    });

    if (stats.length === 0) {
      error.value = "暂无费用数据";
      loading.value = false;
      return;
    }

    chartData.value.labels = stats.map((point) => point.month);
    chartData.value.datasets[0].data = stats.map((point) => point.fuel_cost);
    chartData.value.datasets[1].data = stats.map((point) => point.charging_cost);
  } catch (err) {
    console.error("加载费用统计失败:", err);
    error.value = "加载数据失败：" + err;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadExpenseStatistics();
});

watch(() => props.vehicleId, () => {
  loadExpenseStatistics();
});
</script>

<template>
  <div class="expense-chart">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.expense-chart {
  width: 100%;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  width: 100%;
  height: 400px;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #d32f2f;
}
</style>
