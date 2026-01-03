import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { FuelRecord } from '../App';

interface FuelRecordTabProps {
  onAddRecord: (record: Omit<FuelRecord, 'id' | 'vehicleId' | 'createdAt'>) => Promise<boolean>;
}

export function FuelRecordTab({ onAddRecord }: FuelRecordTabProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState('');
  const [fuelAmount, setFuelAmount] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [fuelType, setFuelType] = useState('92号汽油');
  const [isFull, setIsFull] = useState(true);
  const [note, setNote] = useState('');

  const handleFuelAmountChange = (value: string) => {
    setFuelAmount(value);
    if (value && unitPrice) {
      const total = (parseFloat(value) * parseFloat(unitPrice)).toFixed(2);
      setTotalPrice(total);
    }
  };

  const handleUnitPriceChange = (value: string) => {
    setUnitPrice(value);
    if (value && fuelAmount) {
      const total = (parseFloat(fuelAmount) * parseFloat(value)).toFixed(2);
      setTotalPrice(total);
    }
  };

  const handleTotalPriceChange = (value: string) => {
    setTotalPrice(value);
    if (value && unitPrice) {
      const amount = (parseFloat(value) / parseFloat(unitPrice)).toFixed(2);
      setFuelAmount(amount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mileage || !fuelAmount || !unitPrice || !totalPrice) {
      toast.error('请填写所有必填项');
      return;
    }

    const success = await onAddRecord({
      date,
      mileage: parseFloat(mileage),
      fuelAmount: parseFloat(fuelAmount),
      unitPrice: parseFloat(unitPrice),
      totalPrice: parseFloat(totalPrice),
      fuelType,
      isFull,
      note,
    });

    if (success) {
      // Reset form
      setMileage('');
      setFuelAmount('');
      setUnitPrice('');
      setTotalPrice('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);

      toast.success('油耗记录已添加！');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>添加加油记录</CardTitle>
        <CardDescription>记录您的每次加油信息</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">日期</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">里程 (km) *</Label>
            <Input
              id="mileage"
              type="number"
              step="0.1"
              placeholder="请输入当前里程"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuelAmount">加油量 (L) *</Label>
            <Input
              id="fuelAmount"
              type="number"
              step="0.01"
              placeholder="请输入加油量"
              value={fuelAmount}
              onChange={(e) => handleFuelAmountChange(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">单价 (元/L) *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                placeholder="单价"
                value={unitPrice}
                onChange={(e) => handleUnitPriceChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPrice">总价 (元) *</Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                placeholder="总价"
                value={totalPrice}
                onChange={(e) => handleTotalPriceChange(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuelType">油品类型</Label>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger id="fuelType">
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
            <Label htmlFor="isFull">是否加满</Label>
            <Switch
              id="isFull"
              checked={isFull}
              onCheckedChange={setIsFull}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">备注</Label>
            <Textarea
              id="note"
              placeholder="添加备注信息（可选）"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            提交记录
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
