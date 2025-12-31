<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import FuelRecords from "./components/FuelRecords.vue";
import ChargingRecords from "./components/ChargingRecords.vue";
import Statistics from "./components/Statistics.vue";

interface Vehicle {
  id?: number;
  brand: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_tank_capacity?: number;
  battery_capacity?: number;
  consumption?: number;
}

const vehicles = ref<Vehicle[]>([]);
const showAddForm = ref(false);
const selectedVehicle = ref<Vehicle | null>(null);
const currentView = ref<"list" | "fuel" | "charging" | "statistics">("list");

// 新车辆表单数据
const newVehicle = ref({
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  vehicle_type: "Fuel",
  fuel_tank_capacity: undefined as number | undefined,
  battery_capacity: undefined as number | undefined,
});

// 加载所有车辆
async function loadVehicles() {
  try {
    const vehicleList = await invoke("get_all_vehicles");
    vehicles.value = vehicleList as Vehicle[];

    // 为每个车辆加载能耗数据
    for (const vehicle of vehicles.value) {
      if (vehicle.id) {
        try {
          const consumption = await invoke("get_vehicle_consumption", {
            vehicleId: vehicle.id,
            vehicleType: vehicle.vehicle_type,
          });
          vehicle.consumption = consumption as number;
        } catch (error) {
          vehicle.consumption = 0;
        }
      }
    }
  } catch (error) {
    console.error("加载车辆失败:", error);
  }
}

// 添加车辆
async function addVehicle() {
  try {
    await invoke("add_vehicle", {
      brand: newVehicle.value.brand,
      model: newVehicle.value.model,
      year: newVehicle.value.year,
      vehicleType: newVehicle.value.vehicle_type,
      fuelTankCapacity: newVehicle.value.fuel_tank_capacity,
      batteryCapacity: newVehicle.value.battery_capacity,
    });

    // 重置表单
    newVehicle.value = {
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      vehicle_type: "Fuel",
      fuel_tank_capacity: undefined,
      battery_capacity: undefined,
    };

    showAddForm.value = false;
    await loadVehicles();
  } catch (error) {
    console.error("添加车辆失败:", error);
  }
}

// 选择车辆并查看记录
function selectVehicle(vehicle: Vehicle, view: "fuel" | "charging" | "statistics") {
  selectedVehicle.value = vehicle;
  currentView.value = view;
}

// 返回车辆列表
function backToList() {
  selectedVehicle.value = null;
  currentView.value = "list";
}

onMounted(() => {
  loadVehicles();
});
</script>

<template>
  <main class="container">
    <h1>小猫油耗</h1>
    <h2>汽车油耗/电耗记录</h2>

    <!-- 返回按钮 -->
    <div v-if="currentView !== 'list'" class="back-button">
      <button @click="backToList" class="btn-secondary">← 返回车辆列表</button>
    </div>

    <!-- 车辆列表视图 -->
    <div v-if="currentView === 'list'">
      <div class="header-actions">
        <button v-if="!showAddForm" @click="showAddForm = true" class="btn-primary">
          添加车辆
        </button>
      </div>

    <!-- 添加车辆表单 -->
    <div v-if="showAddForm" class="add-form">
      <h2>添加新车辆</h2>
      <form @submit.prevent="addVehicle">
        <div class="form-group">
          <label>品牌：</label>
          <input v-model="newVehicle.brand" required placeholder="如：丰田" />
        </div>
        <div class="form-group">
          <label>型号：</label>
          <input v-model="newVehicle.model" required placeholder="如：卡罗拉" />
        </div>
        <div class="form-group">
          <label>年份：</label>
          <input v-model.number="newVehicle.year" type="number" required />
        </div>
        <div class="form-group">
          <label>车辆类型：</label>
          <select v-model="newVehicle.vehicle_type">
            <option value="Fuel">燃油车</option>
            <option value="Electric">纯电动车</option>
            <option value="Hybrid">混合动力车</option>
          </select>
        </div>
        <div v-if="newVehicle.vehicle_type !== 'Electric'" class="form-group">
          <label>油箱容量（升）：</label>
          <input v-model.number="newVehicle.fuel_tank_capacity" type="number" step="0.1" />
        </div>
        <div v-if="newVehicle.vehicle_type !== 'Fuel'" class="form-group">
          <label>电池容量（kWh）：</label>
          <input v-model.number="newVehicle.battery_capacity" type="number" step="0.1" />
        </div>
        <div class="form-actions">
          <button type="button" @click="showAddForm = false" class="btn-secondary">取消</button>
          <button type="submit" class="btn-primary">提交</button>
        </div>
      </form>
    </div>

    <!-- 车辆列表 -->
    <div class="vehicles-list">
      <h2>我的车辆</h2>
      <div v-if="vehicles.length === 0" class="empty-state">
        暂无车辆，请添加车辆
      </div>
      <div v-else class="vehicle-cards">
        <div v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-card">
          <h3>{{ vehicle.brand }} {{ vehicle.model }}</h3>
          <p>年份：{{ vehicle.year }}</p>
          <p>类型：{{ vehicle.vehicle_type === 'Fuel' ? '燃油车' : vehicle.vehicle_type === 'Electric' ? '纯电动车' : '混合动力车' }}</p>
          <p v-if="vehicle.fuel_tank_capacity">油箱容量：{{ vehicle.fuel_tank_capacity }}升</p>
          <p v-if="vehicle.battery_capacity">电池容量：{{ vehicle.battery_capacity }}kWh</p>
          <p v-if="vehicle.vehicle_type === 'Electric'" class="consumption">
            百公里电耗：<strong>{{ vehicle.consumption ? vehicle.consumption.toFixed(2) : '0.00' }}</strong> kWh/100km
          </p>
          <p v-else class="consumption">
            百公里油耗：<strong>{{ vehicle.consumption ? vehicle.consumption.toFixed(2) : '0.00' }}</strong> L/100km
          </p>
          <div class="vehicle-actions">
            <button v-if="vehicle.vehicle_type !== 'Electric'" @click="selectVehicle(vehicle, 'fuel')" class="btn-action">
              查看加油记录
            </button>
            <button v-if="vehicle.vehicle_type !== 'Fuel'" @click="selectVehicle(vehicle, 'charging')" class="btn-action">
              查看充电记录
            </button>
            <button @click="selectVehicle(vehicle, 'statistics')" class="btn-action btn-statistics">
              查看统计
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 加油记录视图 -->
  <div v-if="currentView === 'fuel' && selectedVehicle">
    <FuelRecords :vehicle-id="selectedVehicle.id!" />
  </div>

  <!-- 充电记录视图 -->
  <div v-if="currentView === 'charging' && selectedVehicle">
    <ChargingRecords :vehicle-id="selectedVehicle.id!" />
  </div>

  <!-- 统计视图 -->
  <div v-if="currentView === 'statistics' && selectedVehicle">
    <Statistics :vehicle-id="selectedVehicle.id!" :vehicle-type="selectedVehicle.vehicle_type" />
  </div>
  </main>
</template>

<style scoped>
.header-actions {
  margin: 20px 0;
  display: flex;
  justify-content: center;
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

.add-form {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.add-form h2 {
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
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
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

.back-button {
  margin: 20px 0;
}

.vehicles-list {
  margin-top: 30px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.vehicle-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.vehicle-card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.vehicle-card h3 {
  margin-top: 0;
  color: #333;
}

.vehicle-card p {
  margin: 8px 0;
  color: #666;
}

.consumption {
  color: #396cd8;
  font-size: 1.05em;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.consumption strong {
  color: #396cd8;
  font-size: 1.2em;
}

.vehicle-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.btn-action {
  background-color: #28a745;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.btn-action:hover {
  background-color: #218838;
}

.btn-statistics {
  background-color: #ff9800;
}

.btn-statistics:hover {
  background-color: #e68900;
}

</style>
<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: 0.75s;
}

.logo.tauri:hover {
  filter: drop-shadow(0 0 2em #24c8db);
}

.row {
  display: flex;
  justify-content: center;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

h1 {
  text-align: center;
}

input,
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

button {
  cursor: pointer;
}

button:hover {
  border-color: #396cd8;
}
button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}

input,
button {
  outline: none;
}

#greet-input {
  margin-right: 5px;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }

  a:hover {
    color: #24c8db;
  }

  input,
  button {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  button:active {
    background-color: #0f0f0f69;
  }
}

</style>