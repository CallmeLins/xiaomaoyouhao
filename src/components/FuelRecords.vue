<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

interface FuelRecord {
  id?: number;
  vehicle_id: number;
  fuel_type: string;
  price_per_liter: number;
  amount: number;
  liters: number;
  mileage: number;
  is_full_tank: boolean;
  note?: string;
  created_at: string;
}

const props = defineProps<{
  vehicleId: number;
}>();

const records = ref<FuelRecord[]>([]);
const showAddForm = ref(false);
const showEditForm = ref(false);
const selectedRecord = ref<FuelRecord | null>(null);
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  recordId: 0,
});

const newRecord = ref({
  fuel_type: "Gasoline92",
  price_per_liter: 0,
  amount: 0,
  liters: 0,
  mileage: 0,
  is_full_tank: true,
  note: "",
});

const editRecord = ref({
  fuel_type: "Gasoline92",
  price_per_liter: 0,
  amount: 0,
  liters: 0,
  mileage: 0,
  is_full_tank: true,
  note: "",
});

// 辅助函数
function getFuelTypeName(type: string): string {
  const names: Record<string, string> = {
    Gasoline92: '92号汽油',
    Gasoline95: '95号汽油',
    Gasoline98: '98号汽油',
    Diesel: '柴油',
  };
  return names[type] || type;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
}

// 导出CSV
async function exportCSV() {
  console.log('开始导出CSV...');
  try {
    console.log('调用后端接口，vehicleId:', props.vehicleId);
    const csvContent = await invoke("export_fuel_records_csv", {
      vehicleId: props.vehicleId,
    }) as string;

    console.log('获取到CSV内容，长度:', csvContent.length);

    // 使用浏览器下载
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `加油记录_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('导出成功！');
    alert('导出成功！');
  } catch (error) {
    console.error("导出CSV失败:", error);
    alert('导出失败：' + error);
  }
}

// 添加测试数据
async function addTestData() {
  if (!confirm('确定要添加7条测试加油记录吗？')) {
    return;
  }

  try {
    const result = await invoke("add_test_fuel_records", {
      vehicleId: props.vehicleId,
    }) as string;

    alert(result);
    await loadRecords();
  } catch (error) {
    console.error("添加测试数据失败:", error);
    alert('添加测试数据失败：' + error);
  }
}

// 导入CSV
async function importCSV() {
  try {
    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvContent = event.target?.result as string;

        try {
          const count = await invoke("import_fuel_records_csv", {
            vehicleId: props.vehicleId,
            csvContent: csvContent,
          }) as number;

          alert(`成功导入 ${count} 条记录！`);
          await loadRecords();
        } catch (error) {
          console.error("导入CSV失败:", error);
          alert('导入失败：' + error);
        }
      };

      reader.readAsText(file, 'UTF-8');
    };

    input.click();
  } catch (error) {
    console.error("选择文件失败:", error);
    alert('选择文件失败：' + error);
  }
}

// 长按显示菜单
let pressTimer: number | null = null;

function handleTouchStart(event: TouchEvent, record: FuelRecord) {
  pressTimer = window.setTimeout(() => {
    showContextMenu(event, record);
  }, 500);
}

function handleTouchEnd() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

function handleContextMenu(event: MouseEvent, record: FuelRecord) {
  event.preventDefault();
  showContextMenu(event, record);
}

function showContextMenu(event: MouseEvent | TouchEvent, record: FuelRecord) {
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

  contextMenu.value = {
    show: true,
    x: clientX,
    y: clientY,
    recordId: record.id || 0,
  };
  selectedRecord.value = record;
}

function hideContextMenu() {
  contextMenu.value.show = false;
}

// 删除记录
async function deleteRecord() {
  hideContextMenu();

  if (!confirm('确定要删除这条记录吗？')) {
    return;
  }

  try {
    await invoke("delete_fuel_record", {
      recordId: contextMenu.value.recordId,
    });

    alert('删除成功！');
    await loadRecords();
  } catch (error) {
    console.error("删除记录失败:", error);
    alert('删除失败：' + error);
  }
}

// 编辑记录
function editRecordAction() {
  hideContextMenu();

  if (!selectedRecord.value) return;

  editRecord.value = {
    fuel_type: selectedRecord.value.fuel_type,
    price_per_liter: selectedRecord.value.price_per_liter,
    amount: selectedRecord.value.amount,
    liters: selectedRecord.value.liters,
    mileage: selectedRecord.value.mileage,
    is_full_tank: selectedRecord.value.is_full_tank,
    note: selectedRecord.value.note || "",
  };

  showEditForm.value = true;
}

// 自动计算加油量
function calculateLiters() {
  if (newRecord.value.price_per_liter > 0 && newRecord.value.amount > 0) {
    newRecord.value.liters = Number((newRecord.value.amount / newRecord.value.price_per_liter).toFixed(2));
  }
}

// 自动计算编辑表单的加油量
function calculateEditLiters() {
  if (editRecord.value.price_per_liter > 0 && editRecord.value.amount > 0) {
    editRecord.value.liters = Number((editRecord.value.amount / editRecord.value.price_per_liter).toFixed(2));
  }
}

// 更新记录
async function updateRecord() {
  if (!selectedRecord.value || !selectedRecord.value.id) return;

  try {
    await invoke("update_fuel_record", {
      recordId: selectedRecord.value.id,
      fuelType: editRecord.value.fuel_type,
      pricePerLiter: editRecord.value.price_per_liter,
      amount: editRecord.value.amount,
      liters: editRecord.value.liters,
      mileage: editRecord.value.mileage,
      isFullTank: editRecord.value.is_full_tank,
      note: editRecord.value.note || null,
    });

    alert('更新成功！');
    showEditForm.value = false;
    await loadRecords();
  } catch (error) {
    console.error("更新记录失败:", error);
    alert('更新失败：' + error);
  }
}

// 加载加油记录
async function loadRecords() {
  try {
    records.value = await invoke("get_fuel_records", {
      vehicleId: props.vehicleId,
    });
  } catch (error) {
    console.error("加载加油记录失败:", error);
  }
}

// 添加加油记录
async function addRecord() {
  try {
    await invoke("add_fuel_record", {
      vehicleId: props.vehicleId,
      fuelType: newRecord.value.fuel_type,
      pricePerLiter: newRecord.value.price_per_liter,
      amount: newRecord.value.amount,
      liters: newRecord.value.liters,
      mileage: newRecord.value.mileage,
      isFullTank: newRecord.value.is_full_tank,
      note: newRecord.value.note || null,
    });

    // 重置表单
    newRecord.value = {
      fuel_type: "Gasoline92",
      price_per_liter: 0,
      amount: 0,
      liters: 0,
      mileage: 0,
      is_full_tank: true,
      note: "",
    };

    showAddForm.value = false;
    await loadRecords();
  } catch (error) {
    console.error("添加加油记录失败:", error);
  }
}

onMounted(() => {
  loadRecords();
});
</script>

<template>
  <div class="fuel-records">
    <div class="page-header">
      <h2>加油记录</h2>
    </div>

    <div class="action-bar">
      <button v-if="!showAddForm" @click="showAddForm = true" class="btn-primary">
        添加记录
      </button>
      <button v-if="records.length > 0" @click="exportCSV" class="btn-export">
        导出CSV
      </button>
      <button @click="importCSV" class="btn-import">
        导入CSV
      </button>
      <button @click="addTestData" class="btn-test">
        添加测试数据
      </button>
    </div>

    <!-- 添加记录表单 -->
    <div v-if="showAddForm" class="add-form">
      <h3>添加加油记录</h3>
      <form @submit.prevent="addRecord">
        <div class="form-group">
          <label>油品类型：</label>
          <select v-model="newRecord.fuel_type">
            <option value="Gasoline92">92号汽油</option>
            <option value="Gasoline95">95号汽油</option>
            <option value="Gasoline98">98号汽油</option>
            <option value="Diesel">柴油</option>
          </select>
        </div>
        <div class="form-group">
          <label>油价（元/升）：</label>
          <input v-model.number="newRecord.price_per_liter" type="number" step="0.01" required @input="calculateLiters" />
        </div>
        <div class="form-group">
          <label>加油金额（元）：</label>
          <input v-model.number="newRecord.amount" type="number" step="0.01" required @input="calculateLiters" />
        </div>
        <div class="form-group">
          <label>加油量（升）：</label>
          <input v-model.number="newRecord.liters" type="number" step="0.01" required readonly />
        </div>
        <div class="form-group">
          <label>当前总里程（公里）：</label>
          <input v-model.number="newRecord.mileage" type="number" step="0.1" required />
        </div>
        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="newRecord.is_full_tank" />
            是否加满油箱
          </label>
        </div>
        <div class="form-group">
          <label>备注：</label>
          <textarea v-model="newRecord.note" placeholder="如：高速路况、空调常开等"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" @click="showAddForm = false" class="btn-secondary">取消</button>
          <button type="submit" class="btn-primary">提交</button>
        </div>
      </form>
    </div>

    <!-- 编辑记录表单 -->
    <div v-if="showEditForm" class="add-form">
      <h3>编辑加油记录</h3>
      <form @submit.prevent="updateRecord">
        <div class="form-group">
          <label>油品类型：</label>
          <select v-model="editRecord.fuel_type">
            <option value="Gasoline92">92号汽油</option>
            <option value="Gasoline95">95号汽油</option>
            <option value="Gasoline98">98号汽油</option>
            <option value="Diesel">柴油</option>
          </select>
        </div>
        <div class="form-group">
          <label>油价（元/升）：</label>
          <input v-model.number="editRecord.price_per_liter" type="number" step="0.01" required @input="calculateEditLiters" />
        </div>
        <div class="form-group">
          <label>加油金额（元）：</label>
          <input v-model.number="editRecord.amount" type="number" step="0.01" required @input="calculateEditLiters" />
        </div>
        <div class="form-group">
          <label>加油量（升）：</label>
          <input v-model.number="editRecord.liters" type="number" step="0.01" required readonly />
        </div>
        <div class="form-group">
          <label>当前总里程（公里）：</label>
          <input v-model.number="editRecord.mileage" type="number" step="0.1" required />
        </div>
        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="editRecord.is_full_tank" />
            是否加满油箱
          </label>
        </div>
        <div class="form-group">
          <label>备注：</label>
          <textarea v-model="editRecord.note" placeholder="如：高速路况、空调常开等"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" @click="showEditForm = false" class="btn-secondary">取消</button>
          <button type="submit" class="btn-primary">保存</button>
        </div>
      </form>
    </div>

    <!-- 记录列表 -->
    <div class="records-list">
      <div v-if="records.length === 0" class="empty-state">
        暂无加油记录
      </div>
      <div v-else class="records-table">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>油品类型</th>
              <th>油价(元/升)</th>
              <th>加油量(升)</th>
              <th>金额(元)</th>
              <th>里程(公里)</th>
              <th>加满</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="record in records"
              :key="record.id"
              @contextmenu="handleContextMenu($event, record)"
              @touchstart="handleTouchStart($event, record)"
              @touchend="handleTouchEnd"
              class="record-row"
            >
              <td>{{ formatDate(record.created_at) }}</td>
              <td>{{ getFuelTypeName(record.fuel_type) }}</td>
              <td>{{ record.price_per_liter.toFixed(2) }}</td>
              <td>{{ record.liters.toFixed(2) }}</td>
              <td>{{ record.amount.toFixed(2) }}</td>
              <td>{{ record.mileage.toFixed(1) }}</td>
              <td>{{ record.is_full_tank ? '是' : '否' }}</td>
              <td>{{ record.note || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click="hideContextMenu"
    >
      <div class="menu-item" @click="editRecordAction">
        <span>✏️ 编辑</span>
      </div>
      <div class="menu-item delete" @click="deleteRecord">
        <span>🗑️ 删除</span>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div v-if="contextMenu.show" class="overlay" @click="hideContextMenu"></div>
  </div>
</template>

<style scoped>
.fuel-records {
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
  gap: 15px;
  margin-bottom: 20px;
}

.btn-export {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-export:hover {
  background-color: #218838;
}

.btn-import {
  background-color: #17a2b8;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-import:hover {
  background-color: #138496;
}

.btn-test {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-test:hover {
  background-color: #5a6268;
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

.checkbox-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
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

.record-row {
  cursor: pointer;
  user-select: none;
}

.context-menu {
  position: fixed;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 120px;
  overflow: hidden;
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item.delete:hover {
  background-color: #ffebee;
  color: #d32f2f;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: transparent;
}
</style>
