import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { FuelRecord } from '../App';

interface EditRecordDialogProps {
  record: FuelRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (record: FuelRecord) => void;
}

export function EditRecordDialog({ record, open, onOpenChange, onSave }: EditRecordDialogProps) {
  const [formData, setFormData] = useState<FuelRecord | null>(null);

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    }
  }, [record]);

  const handleFuelAmountChange = (value: string) => {
    if (!formData) return;
    const newFormData = { ...formData, fuelAmount: parseFloat(value) || 0 };
    if (newFormData.unitPrice) {
      newFormData.totalPrice = parseFloat((newFormData.fuelAmount * newFormData.unitPrice).toFixed(2));
    }
    setFormData(newFormData);
  };

  const handleUnitPriceChange = (value: string) => {
    if (!formData) return;
    const newFormData = { ...formData, unitPrice: parseFloat(value) || 0 };
    if (newFormData.fuelAmount) {
      newFormData.totalPrice = parseFloat((newFormData.fuelAmount * newFormData.unitPrice).toFixed(2));
    }
    setFormData(newFormData);
  };

  const handleTotalPriceChange = (value: string) => {
    if (!formData) return;
    const newFormData = { ...formData, totalPrice: parseFloat(value) || 0 };
    if (newFormData.unitPrice) {
      newFormData.fuelAmount = parseFloat((newFormData.totalPrice / newFormData.unitPrice).toFixed(2));
    }
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto rounded-lg dialog-scrollable">
        <DialogHeader>
          <DialogTitle className="text-xl">编辑加油记录</DialogTitle>
          <DialogDescription>
            修改加油记录信息
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">日期</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-mileage">里程 (km)</Label>
              <Input
                id="edit-mileage"
                type="number"
                step="0.1"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fuelAmount">加油量 (L)</Label>
              <Input
                id="edit-fuelAmount"
                type="number"
                step="0.01"
                value={formData.fuelAmount}
                onChange={(e) => handleFuelAmountChange(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unitPrice">单价 (元/L)</Label>
                <Input
                  id="edit-unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => handleUnitPriceChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-totalPrice">总价 (元)</Label>
                <Input
                  id="edit-totalPrice"
                  type="number"
                  step="0.01"
                  value={formData.totalPrice}
                  onChange={(e) => handleTotalPriceChange(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fuelType">油品类型</Label>
              <Select
                value={formData.fuelType}
                onValueChange={(value) => setFormData({ ...formData, fuelType: value })}
              >
                <SelectTrigger id="edit-fuelType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="92号汽油">92号汽油</SelectItem>
                  <SelectItem value="95号汽油">95号汽油</SelectItem>
                  <SelectItem value="98号汽油">98号汽油</SelectItem>
                  <SelectItem value="0号柴油">0号柴油</SelectItem>
                  <SelectItem value="-10号柴油">-10号柴油</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-isFull">是否加满</Label>
              <Switch
                id="edit-isFull"
                checked={formData.isFull}
                onCheckedChange={(checked) => setFormData({ ...formData, isFull: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-note">备注</Label>
              <Textarea
                id="edit-note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit">
              保存修改
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
