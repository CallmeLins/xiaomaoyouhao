import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Cloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { WebDAVClient } from '../utils/webdav';

interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
  path: string;
}

interface WebDAVSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigured: (config: WebDAVConfig) => void;
}

export function WebDAVSettings({ open, onOpenChange, onConfigured }: WebDAVSettingsProps) {
  const [config, setConfig] = useState<WebDAVConfig>(() => {
    const saved = localStorage.getItem('webdavConfig');
    return saved ? JSON.parse(saved) : {
      url: '',
      username: '',
      password: '',
      path: '',
    };
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleTest = async () => {
    if (!config.url || !config.username || !config.password) {
      toast.error('请填写所有必填项');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    try {
      const client = new WebDAVClient(config);
      const result = await client.testConnection();

      if (result.success) {
        setTestStatus('success');
        toast.success('WebDAV连接测试成功！');
      } else {
        setTestStatus('error');
        const errorMsg = result.error || '无法连接到WebDAV服务器，请检查URL、用户名和密码';
        setErrorMessage(errorMsg);
        toast.error('连接测试失败');
        console.error('WebDAV test failed:', errorMsg);
      }
    } catch (error) {
      setTestStatus('error');
      const errorMsg = '连接测试出错：' + (error as Error).message;
      setErrorMessage(errorMsg);
      toast.error('连接测试失败');
      console.error('WebDAV test error:', error);
    }
  };

  const handleSave = () => {
    if (!config.url || !config.username || !config.password) {
      toast.error('请填写所有必填项');
      return;
    }

    if (testStatus !== 'success') {
      toast.error('请先测试连接');
      return;
    }

    localStorage.setItem('webdavConfig', JSON.stringify(config));
    onConfigured(config);
    toast.success('WebDAV配置已保存');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            WebDAV同步设置
          </DialogTitle>
          <DialogDescription>
            配置WebDAV服务器以实现数据云端同步
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-sm text-blue-900">
              支持坚果云、Nextcloud等WebDAV服务。配置后可以在多设备间同步您的油耗数据。
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="url">服务器地址 *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://dav.jianguoyun.com/dav/"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              WebDAV服务器完整URL地址
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">用户名 *</Label>
            <Input
              id="username"
              placeholder="your@email.com"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码 *</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              部分服务需要使用应用专用密码（如坚果云）
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">同步路径（可选）</Label>
            <Input
              id="path"
              placeholder="留空使用默认路径 xiaomaoyouhao"
              value={config.path}
              onChange={(e) => setConfig({ ...config, path: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              留空则使用默认文件夹 xiaomaoyouhao，或自定义路径如 myfolder
            </p>
          </div>

          <Button
            onClick={handleTest}
            variant="outline"
            className="w-full"
            disabled={testStatus === 'testing'}
          >
            {testStatus === 'testing' && (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                测试连接中...
              </>
            )}
            {testStatus === 'success' && (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                连接成功
              </>
            )}
            {testStatus === 'error' && (
              <>
                <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                连接失败
              </>
            )}
            {testStatus === 'idle' && '测试连接'}
          </Button>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-xs text-amber-900">
              <strong>安全提示：</strong> 您的WebDAV凭据将加密存储在本地浏览器中，不会被发送到其他服务器
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={testStatus !== 'success'}
          >
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
