import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Fuel, DollarSign, Settings } from 'lucide-react';
import { FuelRecordTab } from './components/FuelRecordTab';
import { ExpenseTab } from './components/ExpenseTab';
import { SettingsTab } from './components/SettingsTab';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { WebDAVSyncManager } from './utils/syncManager';

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  fuelAmount: number;
  unitPrice: number;
  totalPrice: number;
  fuelType: string;
  isFull: boolean;
  note: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year?: number;
  displacement?: string;
  fuelType?: string;
  licensePlate?: string;
  purchaseDate?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentVehicleId, setCurrentVehicleId] = useState<string>(() => {
    const saved = localStorage.getItem('currentVehicleId');
    return saved || '';
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // WebDAV 同步管理器
  const syncManager = useRef<WebDAVSyncManager | null>(null);

  // 初始化同步管理器（只在挂载时执行一次）
  useEffect(() => {
    console.log('检查 WebDAV 配置...');
    const config = localStorage.getItem('webdavConfig');
    const autoSync = localStorage.getItem('autoSync');

    console.log('WebDAV config:', config ? '已配置' : '未配置');
    console.log('AutoSync:', autoSync);

    if (config && autoSync === 'true') {
      console.log('初始化 WebDAV 同步管理器...');
      syncManager.current = new WebDAVSyncManager();
      syncManager.current.startAutoSync(
        () => records,
        () => vehicles
      );
      console.log('同步管理器已启动');
    } else {
      console.log('同步管理器未启动，原因:', !config ? '未配置' : 'autoSync未启用');
    }

    return () => {
      syncManager.current?.stopAutoSync();
    };
  }, []); // 空依赖数组，只在挂载时执行

  // 从后端加载记录
  useEffect(() => {
    loadVehicles();
    loadRecords();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await invoke<Vehicle[]>('get_vehicles');
      setVehicles(data);
      if (data.length > 0 && !currentVehicleId) {
        setCurrentVehicleId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  };

  // 保存当前车辆ID到localStorage
  useEffect(() => {
    if (currentVehicleId) {
      localStorage.setItem('currentVehicleId', currentVehicleId);
    }
  }, [currentVehicleId]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const loadRecords = async () => {
    try {
      const data = await invoke<FuelRecord[]>('get_fuel_records');
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  };

  const addRecord = async (record: Omit<FuelRecord, 'id' | 'vehicleId' | 'createdAt'>) => {
    if (!currentVehicleId) {
      toast.error('请先在设置中添加车辆');
      return false;
    }
    try {
      const newRecord = {
        ...record,
        id: Date.now().toString(),
        vehicleId: currentVehicleId,
        createdAt: new Date().toISOString(),
      };
      await invoke('add_fuel_record', { record: newRecord });
      await loadRecords();

      // 触发延迟同步
      console.log('触发延迟同步...');
      console.log('syncManager.current:', syncManager.current);
      if (syncManager.current) {
        syncManager.current.scheduleSync(() => records, () => vehicles);
        console.log('已调用 scheduleSync');
      } else {
        console.log('syncManager.current 为 null，未触发同步');
      }

      return true;
    } catch (error) {
      console.error('Failed to add record:', error);
      return false;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await invoke('delete_fuel_record', { id });
      await loadRecords();

      // 触发延迟同步
      syncManager.current?.scheduleSync(() => records, () => vehicles);
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  const updateRecord = async (updatedRecord: FuelRecord) => {
    try {
      await invoke('update_fuel_record', { record: updatedRecord });
      await loadRecords();

      // 触发延迟同步
      syncManager.current?.scheduleSync(() => records, () => vehicles);
    } catch (error) {
      console.error('Failed to update record:', error);
    }
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      const newVehicle = {
        ...vehicle,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      await invoke('add_vehicle', { vehicle: newVehicle });
      await loadVehicles();
      // 如果是第一辆车，自动设置为当前车辆
      if (!currentVehicleId) {
        setCurrentVehicleId(newVehicle.id);
      }
    } catch (error) {
      console.error('Failed to add vehicle:', error);
    }
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    try {
      const updatedVehicle = {
        ...vehicle,
        updatedAt: new Date().toISOString(),
      };
      await invoke('update_vehicle', { vehicle: updatedVehicle });
      await loadVehicles();
    } catch (error) {
      console.error('Failed to update vehicle:', error);
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await invoke('delete_vehicle', { id });
      await loadVehicles();
      // 如果删除的是当前车辆，切换到第一辆车
      if (currentVehicleId === id) {
        const remaining = vehicles.filter(v => v.id !== id);
        if (remaining.length > 0) {
          setCurrentVehicleId(remaining[0].id);
        } else {
          setCurrentVehicleId('');
          localStorage.removeItem('currentVehicleId');
        }
      }
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 min-h-screen pb-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 pb-8 pt-13">
          <h1 className="text-2xl font-bold">小猫油耗</h1>
          <p className="text-blue-100 text-sm mt-1">记录每一滴油的价值</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="fuel" className="w-full">
          <TabsContent value="fuel" className="p-4 mt-0">
            <FuelRecordTab onAddRecord={addRecord} />
          </TabsContent>

          <TabsContent value="expense" className="p-4 mt-0">
            <ExpenseTab records={records} vehicles={vehicles} onDeleteRecord={deleteRecord} onUpdateRecord={updateRecord} />
          </TabsContent>

          <TabsContent value="settings" className="p-4 mt-0">
            <SettingsTab
              darkMode={darkMode}
              onDarkModeChange={setDarkMode}
              vehicles={vehicles}
              currentVehicleId={currentVehicleId}
              onCurrentVehicleChange={setCurrentVehicleId}
              onAddVehicle={addVehicle}
              onUpdateVehicle={updateVehicle}
              onDeleteVehicle={deleteVehicle}
            />
          </TabsContent>

          {/* 底部Tab栏 */}
          <TabsList className="w-full grid grid-cols-3 rounded-none fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)] z-50 h-16 border-t dark:border-gray-700">
            <TabsTrigger value="fuel" className="flex flex-col items-center gap-1 h-full data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
              <Fuel className="w-5 h-5" />
              <span className="text-xs">油耗</span>
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex flex-col items-center gap-1 h-full data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs">花费</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col items-center gap-1 h-full data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
              <Settings className="w-5 h-5" />
              <span className="text-xs">设置</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}