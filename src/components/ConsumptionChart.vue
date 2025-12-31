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

interface ConsumptionTrendPoint {
  date: string;
  consumption: number;
  mileage: number;
}

const props = defineProps<{
  vehicleId: number;
  vehicleType: string;
}>();

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: "",
      data: [] as number[],
      borderColor: "#396cd8",
      backgroundColor: "rgba(57, 108, 216, 0.1)",
      tension: 0.3,
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
      text: "能耗变化趋势",
      font: {
        size: 16,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: "",
      },
    },
    x: {
      title: {
        display: true,
        text: "日期",
      },
    },
  },
};

const loading = ref(true);
const error = ref("");

async function loadConsumptionTrend() {
  loading.value = true;
  error.value = "";

  try {
    let trendData: ConsumptionTrendPoint[] = [];
    let unit = "";
    let label = "";

    if (props.vehicleType === "Fuel" || props.vehicleType === "Hybrid") {
      trendData = await invoke("get_fuel_consumption_trend", {
        vehicleId: props.vehicleId,
      });
      unit = "升/100公里";
      label = "油耗";
    } else if (props.vehicleType === "Electric") {
      trendData = await invoke("get_electric_consumption_trend", {
        vehicleId: props.vehicleId,
      });
      unit = "kWh/100公里";
      label = "电耗";
    }

    if (trendData.length === 0) {
      error.value = "暂无足够的数据生成图表";
      loading.value = false;
      return;
    }

    chartData.value.labels = trendData.map((point) => point.date);
    chartData.value.datasets[0].data = trendData.map((point) =>
      Number(point.consumption.toFixed(2))
    );
    chartData.value.datasets[0].label = `${label} (${unit})`;

    if (chartOptions.scales?.y?.title) {
      chartOptions.scales.y.title.text = unit;
    }
  } catch (err) {
    console.error("加载能耗趋势失败:", err);
    error.value = "加载数据失败：" + err;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadConsumptionTrend();
});

watch(() => props.vehicleId, () => {
  loadConsumptionTrend();
});
</script>

<template>
  <div class="consumption-chart">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.consumption-chart {
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
