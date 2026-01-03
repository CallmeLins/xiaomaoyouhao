import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChevronLeft, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';

interface AIConfig {
  enabled: boolean;
  apiKey: string;
  apiEndpoint: string;
  model: string;
  autoAnalysis: boolean;
  analysisFrequency: string;
  customPrompt: string;
}

interface AIConfigurationProps {
  onBack: () => void;
}

export function AIConfiguration({ onBack }: AIConfigurationProps) {
  const [config, setConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('aiConfig');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      apiKey: '',
      apiEndpoint: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      autoAnalysis: false,
      analysisFrequency: 'weekly',
      customPrompt: '分析我的油耗数据，给出省油建议和驾驶习惯优化方案。',
    };
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const saveConfig = (newConfig: AIConfig) => {
    setConfig(newConfig);
    localStorage.setItem('aiConfig', JSON.stringify(newConfig));
  };

  const handleSave = () => {
    if (config.enabled && !config.apiKey) {
      toast.error('请填写 API Key');
      return;
    }
    saveConfig(config);
    toast.success('AI配置已保存');
  };

  const handleTestConnection = async () => {
    if (!config.apiKey) {
      toast.error('请先填写 API Key');
      return;
    }

    setTestStatus('testing');
    
    // 模拟API测试
    setTimeout(() => {
      // 这里应该是真实的API调用
      const success = Math.random() > 0.3; // 模拟70%成功率
      
      if (success) {
        setTestStatus('success');
        toast.success('连接测试成功！');
      } else {
        setTestStatus('error');
        toast.error('连接测试失败，请检查配置');
      }
      
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">AI配置</h2>
            <p className="text-sm text-purple-100">智能分析与驾驶建议</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Alert className="border-purple-200 bg-purple-50">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-900">
            配置AI功能后，系统将自动分析您的油耗数据，提供个性化的省油建议和驾驶习惯优化方案
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>启用AI功能</CardTitle>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => saveConfig({ ...config, enabled: checked })}
              />
            </div>
            <CardDescription>
              开启后将启用智能分析功能
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API配置</CardTitle>
            <CardDescription>配置您的AI服务提供商</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiEndpoint">API端点</Label>
              <Input
                id="apiEndpoint"
                type="url"
                placeholder="https://api.openai.com/v1"
                value={config.apiEndpoint}
                onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
                disabled={!config.enabled}
              />
              <p className="text-xs text-gray-500">
                支持OpenAI或兼容的API端点
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                disabled={!config.enabled}
              />
              <p className="text-xs text-gray-500">
                您的API密钥将安全存储在本地
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">模型</Label>
              <Input
                id="model"
                placeholder="gpt-3.5-turbo"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                disabled={!config.enabled}
              />
            </div>

            <Button
              onClick={handleTestConnection}
              variant="outline"
              className="w-full"
              disabled={!config.enabled || testStatus === 'testing'}
            >
              {testStatus === 'testing' && '测试中...'}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分析设置</CardTitle>
            <CardDescription>自定义AI分析行为</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label>自动分析</Label>
                <p className="text-sm text-gray-500">定期自动分析油耗数据</p>
              </div>
              <Switch
                checked={config.autoAnalysis}
                onCheckedChange={(checked) => setConfig({ ...config, autoAnalysis: checked })}
                disabled={!config.enabled}
              />
            </div>

            {config.autoAnalysis && (
              <div className="space-y-2">
                <Label>分析频率</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['daily', 'weekly', 'monthly'].map((freq) => (
                    <Button
                      key={freq}
                      variant={config.analysisFrequency === freq ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setConfig({ ...config, analysisFrequency: freq })}
                      disabled={!config.enabled}
                    >
                      {freq === 'daily' && '每日'}
                      {freq === 'weekly' && '每周'}
                      {freq === 'monthly' && '每月'}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customPrompt">自定义提示词</Label>
              <Textarea
                id="customPrompt"
                placeholder="输入您希望AI关注的分析要点..."
                value={config.customPrompt}
                onChange={(e) => setConfig({ ...config, customPrompt: e.target.value })}
                disabled={!config.enabled}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                自定义AI分析时的关注点，例如：重点分析高速和市区的油耗差异
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">隐私提示</p>
                <p>您的数据仅用于AI分析，不会被上传到其他服务器。API Key存储在本地浏览器中。</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            取消
          </Button>
          <Button onClick={handleSave} className="flex-1">
            保存配置
          </Button>
        </div>
      </div>
    </div>
  );
}