<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { useDialog } from '../composables/useDialog';
import { useCurrentVehicle } from '../composables/useCurrentVehicle';
import { f7 } from 'framework7-vue';

const { showSuccess, showError } = useDialog();
const { currentVehicleId, setCurrentVehicle, getCurrentVehicle } = useCurrentVehicle();

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
const showEditSheet = ref(false);
const editingVehicle = ref<Vehicle | null>(null);

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

    // 初始化当前车辆
    const current = getCurrentVehicle();
    if (!current && vehicles.value.length > 0) {
      setCurrentVehicle(vehicles.value[0].id!);
    }
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

async function deleteVehicle(vehicleId: number) {
  try {
    await invoke('delete_vehicle', { vehicleId });
    await loadVehicles();

    // 如果删除的是当前选中的车辆，清除选择
    if (currentVehicleId.value === vehicleId) {
      setCurrentVehicle(null);
    }

    f7.toast.create({
      text: '删除成功',
      position: 'center',
      closeTimeout: 2000,
    }).open();
  } catch (error) {
    f7.dialog.alert('删除失败: ' + error);
  }
}

async function updateVehicle() {
  if (!editingVehicle.value) return;

  try {
    await invoke('update_vehicle', {
      vehicleId: editingVehicle.value.id,
      brand: editingVehicle.value.brand,
      model: editingVehicle.value.model,
      year: editingVehicle.value.year,
      vehicleType: editingVehicle.value.vehicle_type,
      fuelTankCapacity: editingVehicle.value.fuel_tank_capacity,
      batteryCapacity: editingVehicle.value.battery_capacity,
    });
    showEditSheet.value = false;
    await loadVehicles();
    f7.toast.create({
      text: '修改成功',
      position: 'center',
      closeTimeout: 2000,
    }).open();
  } catch (error) {
    f7.dialog.alert('修改失败: ' + error);
  }
}

function showVehicleActions(vehicle: Vehicle) {
  f7.actions.create({
    buttons: [
      [
        {
          text: '修改车辆',
          onClick: () => {
            editingVehicle.value = { ...vehicle };
            showEditSheet.value = true;
          }
        },
        {
          text: '删除车辆',
          color: 'red',
          onClick: () => {
            f7.dialog.confirm(
              '删除车辆将会删除该车辆的所有记录数据，此操作不可恢复！',
              '确认删除',
              () => {
                deleteVehicle(vehicle.id!);
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
        radio
        :checked="currentVehicleId === vehicle.id"
        @change="setCurrentVehicle(vehicle.id!)"
      >
        <template #text>
          <span v-if="vehicle.fuel_tank_capacity" class="text-xs text-gray-600">
            油箱: {{ vehicle.fuel_tank_capacity }}L
          </span>
          <span v-if="vehicle.battery_capacity" class="text-xs text-gray-600 ml-2">
            电池: {{ vehicle.battery_capacity }}kWh
          </span>
        </template>
        <template #after>
          <f7-button small @click.stop="showVehicleActions(vehicle)">操作</f7-button>
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
        <f7-block-title>修改车辆</f7-block-title>
        <f7-list v-if="editingVehicle" no-hairlines-md>
          <f7-list-input
            label="品牌"
            type="text"
            :value="editingVehicle.brand"
            @input="editingVehicle.brand = $event.target.value"
          />
          <f7-list-input
            label="型号"
            type="text"
            :value="editingVehicle.model"
            @input="editingVehicle.model = $event.target.value"
          />
        </f7-list>

        <f7-block>
          <f7-button fill @click="updateVehicle">保存修改</f7-button>
        </f7-block>
      </f7-page-content>
    </f7-sheet>
  </f7-page>
</template>
