import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Car, Plus, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from './ui/scroll-area';
import { Vehicle } from '../App';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface VehicleManagementProps {
  onBack: () => void;
  vehicles: Vehicle[];
  currentVehicleId: string;
  onCurrentVehicleChange: (id: string) => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
}

export function VehicleManagement({ onBack, vehicles, currentVehicleId, onCurrentVehicleChange, onAddVehicle, onUpdateVehicle, onDeleteVehicle }: VehicleManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: undefined as number | undefined,
    displacement: '',
    fuelType: '92号汽油',
    licensePlate: '',
    purchaseDate: '',
    note: '',
  });

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        displacement: vehicle.displacement || '',
        fuelType: vehicle.fuelType || '92号汽油',
        licensePlate: vehicle.licensePlate || '',
        purchaseDate: vehicle.purchaseDate || '',
        note: vehicle.note || '',
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        brand: '',
        model: '',
        year: undefined,
        displacement: '',
        fuelType: '92号汽油',
        licensePlate: '',
        purchaseDate: '',
        note: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.brand || !formData.model) {
      toast.error('请填写品牌和型号');
      return;
    }

    if (editingVehicle) {
      onUpdateVehicle({
        ...editingVehicle,
        ...formData,
      });
      toast.success('车辆信息已更新');
    } else {
      onAddVehicle(formData);
      toast.success('车辆已添加');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteVehicle(deleteConfirmId);
      toast.success('车辆已删除');
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          添加车辆
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>我的车辆</CardTitle>
          <CardDescription>管理您的车辆信息</CardDescription>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无车辆</p>
              <p className="text-sm mt-1">点击上方按钮添加第一辆车</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {vehicles.map((vehicle) => {
                  const isSelected = vehicle.id === currentVehicleId;
                  return (
                    <div
                      key={vehicle.id}
                      className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600'
                      }`}
                      onClick={() => onCurrentVehicleChange(vehicle.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Car className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-blue-600'}`} />
                            <span className="font-semibold text-lg">
                              {vehicle.brand} {vehicle.model}
                            </span>
                            {isSelected && (
                              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                当前车辆
                              </span>
                            )}
                          </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          {vehicle.year && <div>年份: {vehicle.year}</div>}
                          {vehicle.displacement && <div>排量: {vehicle.displacement}</div>}
                          {vehicle.fuelType && <div>燃油类型: {vehicle.fuelType}</div>}
                          {vehicle.licensePlate && <div>车牌号: {vehicle.licensePlate}</div>}
                          {vehicle.purchaseDate && <div>购买日期: {vehicle.purchaseDate}</div>}
                          {vehicle.note && (
                            <div className="text-gray-500 dark:text-gray-400 italic">
                              备注: {vehicle.note}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(vehicle)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? '编辑车辆' : '添加车辆'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">品牌 *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="例如: 丰田"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">型号 *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="例如: 卡罗拉"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">年份</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="例如: 2020"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displacement">排量</Label>
                <Input
                  id="displacement"
                  value={formData.displacement}
                  onChange={(e) => setFormData({ ...formData, displacement: e.target.value })}
                  placeholder="例如: 1.5L"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType">燃油类型</Label>
              <Select value={formData.fuelType} onValueChange={(value) => setFormData({ ...formData, fuelType: value })}>
                <SelectTrigger id="fuelType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="92号汽油">92号汽油</SelectItem>
                  <SelectItem value="95号汽油">95号汽油</SelectItem>
                  <SelectItem value="98号汽油">98号汽油</SelectItem>
                  <SelectItem value="0号柴油">0号柴油</SelectItem>
                  <SelectItem value="-10号柴油">-10号柴油</SelectItem>
                  <SelectItem value="电动">电动</SelectItem>
                  <SelectItem value="混合动力">混合动力</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">车牌号</Label>
              <Input
                id="licensePlate"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                placeholder="例如: 京A12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">购买日期</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">备注</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="添加备注信息（可选）"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingVehicle ? '保存' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除车辆将同时删除该车辆的所有油耗记录。此操作无法撤销，确定要继续吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
