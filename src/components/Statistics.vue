<script setup lang="ts">
import ConsumptionChart from "./ConsumptionChart.vue";
import ExpenseChart from "./ExpenseChart.vue";

defineProps<{
  vehicleId: number;
  vehicleType: string;
}>();
</script>

<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2>数据统计分析</h2>
    </div>

    <div class="charts-container">
      <!-- 能耗趋势图 -->
      <div class="chart-section">
        <ConsumptionChart
          :vehicle-id="vehicleId"
          :vehicle-type="vehicleType"
        />
      </div>

      <!-- 费用统计图 -->
      <div class="chart-section">
        <ExpenseChart :vehicle-id="vehicleId" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.chart-section {
  width: 100%;
}

@media (max-width: 768px) {
  .statistics-page {
    padding: 10px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .charts-container {
    gap: 20px;
  }
}
</style>
