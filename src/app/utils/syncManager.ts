// WebDAV 同步管理器
import { WebDAVClient, WebDAVConfig } from './webdav';
import { FuelRecord, Vehicle } from '../App';

export interface SyncStatus {
  lastSyncTime: string | null;
  isSyncing: boolean;
  error: string | null;
}

export class WebDAVSyncManager {
  private client: WebDAVClient | null = null;
  private config: WebDAVConfig | null = null;
  private syncTimer: number | null = null;
  private debounceTimer: number | null = null;
  private status: SyncStatus = {
    lastSyncTime: null,
    isSyncing: false,
    error: null,
  };
  private onStatusChange?: (status: SyncStatus) => void;

  constructor() {
    this.loadConfig();
  }

  // 加载配置
  private loadConfig() {
    const saved = localStorage.getItem('webdavConfig');
    if (saved) {
      this.config = JSON.parse(saved);
      if (this.config) {
        this.client = new WebDAVClient(this.config);
      }
    }
  }

  // 设置状态变化回调
  setOnStatusChange(callback: (status: SyncStatus) => void) {
    this.onStatusChange = callback;
  }

  // 更新状态
  private updateStatus(updates: Partial<SyncStatus>) {
    this.status = { ...this.status, ...updates };
    if (this.onStatusChange) {
      this.onStatusChange(this.status);
    }
  }

  // 获取当前状态
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  // 上传数据到WebDAV
  async uploadData(records: FuelRecord[], vehicles: Vehicle[]): Promise<boolean> {
    if (!this.client) {
      console.error('WebDAV client not initialized');
      return false;
    }

    console.log('开始同步数据到 WebDAV...');
    console.log('记录数量:', records.length);
    console.log('车辆数量:', vehicles.length);

    try {
      this.updateStatus({ isSyncing: true, error: null });

      // 转换为CSV格式
      const csvContent = this.convertToCSV(records, vehicles);
      console.log('CSV 内容长度:', csvContent.length);
      const filename = `fuel-records-backup.csv`;

      console.log('开始上传文件:', filename);
      const success = await this.client.uploadFile(filename, csvContent);
      console.log('上传结果:', success);

      if (success) {
        const now = new Date().toISOString();
        this.updateStatus({
          lastSyncTime: now,
          isSyncing: false,
          error: null
        });
        localStorage.setItem('lastSyncTime', now);
        console.log('同步成功，时间:', now);
      } else {
        this.updateStatus({
          isSyncing: false,
          error: '上传失败'
        });
        console.error('上传失败');
      }

      return success;
    } catch (error) {
      console.error('同步出错:', error);
      this.updateStatus({
        isSyncing: false,
        error: (error as Error).message
      });
      return false;
    }
  }

  // 转换为CSV格式
  private convertToCSV(records: FuelRecord[], vehicles: Vehicle[]): string {
    const headers = [
      'ID', '车辆ID', '车辆品牌', '车辆型号', '日期', '里程(km)', '加油量(L)',
      '单价(元/L)', '总价(元)', '油品类型', '是否加满', '备注', '创建时间'
    ];

    const rows = records.map(record => {
      const vehicle = vehicles.find(v => v.id === record.vehicleId);
      return [
        record.id,
        record.vehicleId,
        vehicle?.brand || '未知',
        vehicle?.model || '未知',
        record.date,
        record.mileage,
        record.fuelAmount,
        record.unitPrice,
        record.totalPrice,
        record.fuelType,
        record.isFull ? '是' : '否',
        record.note || '',
        record.createdAt
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return '\ufeff' + csvContent;
  }

  // 启动定时同步（每小时）
  startAutoSync(getRecords: () => FuelRecord[], getVehicles: () => Vehicle[]) {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    // 每小时同步一次
    this.syncTimer = setInterval(() => {
      const records = getRecords();
      const vehicles = getVehicles();
      this.uploadData(records, vehicles);
    }, 60 * 60 * 1000); // 1小时
  }

  // 延迟同步（防抖30秒）
  scheduleSync(getRecords: () => FuelRecord[], getVehicles: () => Vehicle[]) {
    console.log('scheduleSync 被调用');

    if (this.debounceTimer) {
      console.log('清除之前的延迟同步定时器');
      clearTimeout(this.debounceTimer);
    }

    console.log('设置 30 秒延迟同步');
    this.debounceTimer = setTimeout(() => {
      console.log('30 秒延迟结束，开始同步');
      const records = getRecords();
      const vehicles = getVehicles();
      console.log('获取到的记录数:', records.length);
      console.log('获取到的车辆数:', vehicles.length);
      this.uploadData(records, vehicles);
    }, 30000); // 30秒
  }

  // 停止自动同步
  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

