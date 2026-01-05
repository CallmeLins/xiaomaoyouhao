import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { FuelRecord, Vehicle } from '../App';
import { DollarSign, Droplet, TrendingUp, Calendar, Download, Upload, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { EditRecordDialog } from './EditRecordDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ExpenseTabProps {
  records: FuelRecord[];
  vehicles: Vehicle[];
  onDeleteRecord: (id: string) => void;
  onUpdateRecord?: (record: FuelRecord) => void;
}

export function ExpenseTab({ records, vehicles, onDeleteRecord, onUpdateRecord }: ExpenseTabProps) {
  const [editingRecord, setEditingRecord] = useState<FuelRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 计算统计数据
  const totalExpense = records.reduce((sum, record) => sum + record.totalPrice, 0);
  const totalFuel = records.reduce((sum, record) => sum + record.fuelAmount, 0);

  // 计算百公里油耗
  const calculateFuelConsumption = () => {
    if (records.length < 2) return '0';
    
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let totalConsumption = 0;
    let count = 0;
    
    for (let i = 1; i < sortedRecords.length; i++) {
      const distance = sortedRecords[i].mileage - sortedRecords[i - 1].mileage;
      if (distance > 0 && sortedRecords[i].isFull) {
        const consumption = (sortedRecords[i].fuelAmount / distance) * 100;
        if (consumption < 50) { // 过滤异常值
          totalConsumption += consumption;
          count++;
        }
      }
    }
    
    return count > 0 ? (totalConsumption / count).toFixed(2) : '0';
  };

  // 准备图表数据
  const chartData = [...records]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      花费: record.totalPrice,
      加油量: record.fuelAmount,
    }));

  const handleDelete = (id: string) => {
    onDeleteRecord(id);
    toast.success('记录已删除');
  };

  const handleEdit = (record: FuelRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedRecord: FuelRecord) => {
    if (onUpdateRecord) {
      onUpdateRecord(updatedRecord);
      toast.success('记录已更新');
    }
    setIsEditDialogOpen(false);
    setEditingRecord(null);
  };

  // JSON转CSV
  const jsonToCSV = (data: FuelRecord[]): string => {
    if (data.length === 0) return '';

    // CSV表头
    const headers = [
      'ID', '车辆ID', '车辆品牌', '车辆型号', '日期', '里程(km)', '加油量(L)',
      '单价(元/L)', '总价(元)', '油品类型', '是否加满', '备注', '创建时间'
    ];

    // CSV数据行
    const rows = data.map(record => {
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

    // 组合CSV内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const handleExport = () => {
    if (records.length === 0) {
      toast.error('没有可导出的记录');
      return;
    }

    // 先转为JSON，再转为CSV
    const csvContent = jsonToCSV(records);
    const dataBlob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fuel-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('数据已导出为CSV格式');
  };

  // CSV转JSON
  const csvToJSON = (csvText: string): FuelRecord[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // 跳过表头，从第二行开始解析
    const records: FuelRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // 处理CSV中的引号
      const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];

      if (values.length >= 13) {
        // 新格式：包含车辆品牌和型号
        records.push({
          id: values[0],
          vehicleId: values[1],
          date: values[4],
          mileage: parseFloat(values[5]),
          fuelAmount: parseFloat(values[6]),
          unitPrice: parseFloat(values[7]),
          totalPrice: parseFloat(values[8]),
          fuelType: values[9],
          isFull: values[10] === '是',
          note: values[11],
          createdAt: values[12]
        });
      } else if (values.length >= 11) {
        // 旧格式：不包含车辆品牌和型号
        records.push({
          id: values[0],
          vehicleId: values[1],
          date: values[2],
          mileage: parseFloat(values[3]),
          fuelAmount: parseFloat(values[4]),
          unitPrice: parseFloat(values[5]),
          totalPrice: parseFloat(values[6]),
          fuelType: values[7],
          isFull: values[8] === '是',
          note: values[9],
          createdAt: values[10]
        });
      }
    }
    return records;
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        let importedData: FuelRecord[] = [];

        // 判断文件类型并解析
        if (file.name.endsWith('.csv')) {
          importedData = csvToJSON(content);
        } else if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          importedData = Array.isArray(jsonData) ? jsonData : [];
        } else {
          toast.error('不支持的文件格式，请使用CSV或JSON文件');
          return;
        }

        if (importedData.length === 0) {
          toast.error('文件中没有有效数据');
          return;
        }

        // 调用后端API批量导入
        const { invoke } = await import('@tauri-apps/api/core');
        const count = await invoke<number>('import_fuel_records', { records: importedData });

        toast.success(`成功导入 ${count} 条记录，请刷新页面`);
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error('导入失败:', error);
        toast.error('文件解析或导入失败');
      }
    };
    reader.readAsText(file);

    // 重置input以便可以重复导入同一文件
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* 导入导出按钮 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleImport}
        >
          <Upload className="w-4 h-4 mr-2" />
          导入数据
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleExport}
        >
          <Download className="w-4 h-4 mr-2" />
          导出数据
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">¥{totalExpense.toFixed(0)}</div>
            <p className="text-xs text-gray-500 mt-1">总花费</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <Droplet className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{totalFuel.toFixed(0)}L</div>
            <p className="text-xs text-gray-500 mt-1">总加油</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{calculateFuelConsumption()}</div>
            <p className="text-xs text-gray-500 mt-1">L/百公里</p>
          </CardContent>
        </Card>
      </div>

      {/* 花费趋势图 */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>花费趋势</CardTitle>
            <CardDescription>每次加油花费金额</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="花费" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="花费" position="top" style={{ fontSize: '10px', fill: '#666' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 加油量趋势图 */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>加油量趋势</CardTitle>
            <CardDescription>每次加油量变化</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="加油量" stroke="#f97316" strokeWidth={2}>
                  <LabelList dataKey="加油量" position="top" style={{ fontSize: '10px', fill: '#666' }} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle>加油记录</CardTitle>
          <CardDescription>共 {records.length} 条记录 · 点击右侧菜单编辑或删除</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无记录</p>
              <p className="text-sm mt-1">去"油耗"标签添加第一条记录吧</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-lg">
                            ¥{record.totalPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {record.fuelAmount}L
                          </span>
                          {record.isFull && (
                            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded">
                              加满
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{record.date}</span>
                            <span>•</span>
                            <span>{record.mileage} km</span>
                          </div>
                          <div>
                            {record.fuelType} • ¥{record.unitPrice}/L
                          </div>
                          {record.note && (
                            <div className="text-gray-500 dark:text-gray-400 italic">
                              备注: {record.note}
                            </div>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleEdit(record)}
                          >
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(record.id)}
                            className="text-red-500"
                          >
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* 编辑记录对话框 */}
      <EditRecordDialog
        record={editingRecord}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveEdit}
      />
    </div>
  );
}