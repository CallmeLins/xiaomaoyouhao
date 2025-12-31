<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

interface ChargingRecord {
  id?: number;
  vehicle_id: number;
  charging_type: string;
  price_per_kwh: number;
  amount: number;
  kwh: number;
  mileage_before: number;
  mileage_after: number;
  duration_minutes?: number;
  note?: string;
  created_at: string;
}

const props = defineProps<{
  vehicleId: number;
}>();

const records = ref<ChargingRecord[]>([]);
const showAddForm = ref(false);

const newRecord = ref({
  charging_type: "Slow",
  price_per_kwh: 0,
  amount: 0,
  kwh: 0,
  mileage_before: 0,
  mileage_after: 0,
  duration_minutes: undefined as number | undefined,
  note: "",
});

// 辅助函数
function getChargingTypeName(type: string): string {
  return type === "Slow" ? "慢充" : "快充";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
}

// 自动计算充电量
function calculateKwh() {
  if (newRecord.value.price_per_kwh > 0 && newRecord.value.amount > 0) {
    newRecord.value.kwh = Number((newRecord.value.amount / newRecord.value.price_per_kwh).toFixed(2));
  }
}

// 加载充电记录
async function loadRecords() {
  try {
    records.value = await invoke("get_charging_records", {
      vehicleId: props.vehicleId,
    });
  } catch (error) {
    console.error("加载充电记录失败:", error);
  }
}

// 添加充电记录
async function addRecord() {
  try {
    await invoke("add_charging_record", {
      vehicleId: props.vehicleId,
      chargingType: newRecord.value.charging_type,
      pricePerKwh: newRecord.value.price_per_kwh,
      amount: newRecord.value.amount,
      kwh: newRecord.value.kwh,
      mileageBefore: newRecord.value.mileage_before,
      mileageAfter: newRecord.value.mileage_after,
      durationMinutes: newRecord.value.duration_minutes || null,
      note: newRecord.value.note || null,
    });

    // 重置表单
    newRecord.value = {
      charging_type: "Slow",
      price_per_kwh: 0,
      amount: 0,
      kwh: 0,
      mileage_before: 0,
      mileage_after: 0,
      duration_minutes: undefined,
      note: "",
    };

    showAddForm.value = false;
    await loadRecords();
  } catch (error) {
    console.error("添加充电记录失败:", error);
  }
}

onMounted(() => {
  loadRecords();
});
</script>

<template>
  <div class="charging-records">
    <div class="page-header">
      <h2>充电记录</h2>
    </div>

    <div class="action-bar">
      <button v-if="!showAddForm" @click="showAddForm = true" class="btn-primary">
        添加记录
      </button>
    </div>

    <!-- 添加记录表单 -->
    <div v-if="showAddForm" class="add-form">
      <h3>添加充电记录</h3>
      <form @submit.prevent="addRecord">
        <div class="form-group">
          <label>充电类型：</label>
          <select v-model="newRecord.charging_type">
            <option value="Slow">慢充</option>
            <option value="Fast">快充</option>
          </select>
        </div>
        <div class="form-group">
          <label>电价（元/度）：</label>
          <input v-model.number="newRecord.price_per_kwh" type="number" step="0.01" required @input="calculateKwh" />
        </div>
        <div class="form-group">
          <label>充电金额（元）：</label>
          <input v-model.number="newRecord.amount" type="number" step="0.01" required @input="calculateKwh" />
        </div>
        <div class="form-group">
          <label>充电度数（kWh）：</label>
          <input v-model.number="newRecord.kwh" type="number" step="0.01" required readonly />
        </div>
        <div class="form-group">
          <label>充电前里程（公里）：</label>
          <input v-model.number="newRecord.mileage_before" type="number" step="0.1" required />
        </div>
        <div class="form-group">
          <label>充电后里程（公里）：</label>
          <input v-model.number="newRecord.mileage_after" type="number" step="0.1" required />
        </div>
        <div class="form-group">
          <label>充电时长（分钟）：</label>
          <input v-model.number="newRecord.duration_minutes" type="number" />
        </div>
        <div class="form-group">
          <label>备注：</label>
          <textarea v-model="newRecord.note" placeholder="如：充电地点、充电桩类型等"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" @click="showAddForm = false" class="btn-secondary">取消</button>
          <button type="submit" class="btn-primary">提交</button>
        </div>
      </form>
    </div>

    <!-- 记录列表 -->
    <div class="records-list">
      <div v-if="records.length === 0" class="empty-state">
        暂无充电记录
      </div>
      <div v-else class="records-table">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>充电类型</th>
              <th>电价(元/度)</th>
              <th>充电量(kWh)</th>
              <th>金额(元)</th>
              <th>里程(公里)</th>
              <th>时长(分钟)</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>{{ formatDate(record.created_at) }}</td>
              <td>{{ getChargingTypeName(record.charging_type) }}</td>
              <td>{{ record.price_per_kwh.toFixed(2) }}</td>
              <td>{{ record.kwh.toFixed(2) }}</td>
              <td>{{ record.amount.toFixed(2) }}</td>
              <td>{{ record.mileage_before.toFixed(1) }} → {{ record.mileage_after.toFixed(1) }}</td>
              <td>{{ record.duration_minutes || '-' }}</td>
              <td>{{ record.note || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.charging-records {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
}

.action-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.add-form {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.add-form h3 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.btn-primary {
  background-color: #396cd8;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #2d5ab8;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.records-list {
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.records-table {
  overflow-x: auto;
}

.records-table table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.records-table th,
.records-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.records-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #333;
}

.records-table tbody tr:hover {
  background-color: #f9f9f9;
}
</style>
