import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Car, Palette, Sparkles, Cloud, Info, ChevronRight } from 'lucide-react';
import { Switch } from './ui/switch';
import { useState } from 'react';
import { VehicleManagement } from './VehicleManagement';
import { AIConfiguration } from './AIConfiguration';
import { WebDAVSettings } from './WebDAVSettings';
import { AboutAuthor } from './AboutAuthor';
import { toast } from 'sonner';
import { Vehicle } from '../App';

type SettingItem =
  | { label: string; description: string; hasSwitch: true; switchValue: boolean; onSwitchChange: (value: boolean) => void; action?: never; onClick?: never }
  | { label: string; description: string; action: string; onClick?: () => void; hasSwitch?: never; switchValue?: never; onSwitchChange?: never };

interface SettingsTabProps {
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  vehicles: Vehicle[];
  currentVehicleId: string;
  onCurrentVehicleChange: (id: string) => void;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
}

export function SettingsTab({ darkMode, onDarkModeChange, vehicles, currentVehicleId, onCurrentVehicleChange, onAddVehicle, onUpdateVehicle, onDeleteVehicle }: SettingsTabProps) {
  const [autoSync, setAutoSync] = useState(() => {
    const config = localStorage.getItem('webdavConfig');
    return config ? true : false;
  });
  const [currentView, setCurrentView] = useState<'main' | 'vehicle' | 'ai' | 'about'>('main');
  const [webdavDialogOpen, setWebdavDialogOpen] = useState(false);

  const handleSyncToggle = (checked: boolean) => {
    const config = localStorage.getItem('webdavConfig');
    if (checked && !config) {
      setWebdavDialogOpen(true);
      return;
    }
    setAutoSync(checked);
    if (checked) {
      toast.success('自动同步已启用');
    } else {
      toast.info('自动同步已关闭');
    }
  };

  const handleWebDAVConfigured = () => {
    setAutoSync(true);
    toast.success('WebDAV配置完成，已启用自动同步');
  };

  if (currentView === 'vehicle') {
    return (
      <VehicleManagement
        onBack={() => setCurrentView('main')}
        vehicles={vehicles}
        currentVehicleId={currentVehicleId}
        onCurrentVehicleChange={onCurrentVehicleChange}
        onAddVehicle={onAddVehicle}
        onUpdateVehicle={onUpdateVehicle}
        onDeleteVehicle={onDeleteVehicle}
      />
    );
  }

  if (currentView === 'ai') {
    return <AIConfiguration onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'about') {
    return <AboutAuthor onBack={() => setCurrentView('main')} />;
  }

  const settingGroups: Array<{ title: string; icon: any; items: SettingItem[] }> = [
    {
      title: '车辆信息',
      icon: Car,
      items: [
        { 
          label: '我的车辆', 
          description: '管理车辆基本信息', 
          action: '查看',
          onClick: () => setCurrentView('vehicle'),
        },
      ],
    },
    {
      title: '外观',
      icon: Palette,
      items: [
        { 
          label: '深色模式', 
          description: '切换界面主题', 
          hasSwitch: true,
          switchValue: darkMode,
          onSwitchChange: onDarkModeChange,
        },
      ],
    },
    {
      title: '智能功能',
      icon: Sparkles,
      items: [
        { 
          label: 'AI配置', 
          description: '智能分析与建议', 
          action: '配置',
          onClick: () => setCurrentView('ai'),
        },
      ],
    },
    {
      title: '数据',
      icon: Cloud,
      items: [
        { 
          label: '自动同步', 
          description: '自动备份数据到云端 (WebDAV)', 
          hasSwitch: true,
          switchValue: autoSync,
          onSwitchChange: handleSyncToggle,
        },
      ],
    },
    {
      title: '关于',
      icon: Info,
      items: [
        { 
          label: '关于作者', 
          description: '了解应用开发者', 
          action: '查看',
          onClick: () => setCurrentView('about'),
        },
        { label: '版本信息', description: 'v2.0.0', action: '' },
      ],
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {settingGroups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <group.icon className="w-5 h-5 text-blue-600" />
                <CardTitle>{group.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {group.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={item.onClick}
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                  </div>
                  {item.hasSwitch ? (
                    <Switch
                      checked={item.switchValue}
                      onCheckedChange={item.onSwitchChange}
                    />
                  ) : item.action ? (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* 底部信息 */}
        <div className="text-center text-sm text-gray-400 py-4">
          <p>© 2026 小猫油耗 APP</p>
          <p className="mt-1">让每一次加油都清晰可见</p>
        </div>
      </div>

      <WebDAVSettings 
        open={webdavDialogOpen} 
        onOpenChange={setWebdavDialogOpen}
        onConfigured={handleWebDAVConfigured}
      />
    </>
  );
}