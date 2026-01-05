import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChevronLeft, Github, Mail, Globe, Heart, Coffee, Star } from 'lucide-react';
import { toast } from 'sonner';

interface AboutAuthorProps {
  onBack: () => void;
}

export function AboutAuthor({ onBack }: AboutAuthorProps) {
  const handleContact = (type: string) => {
    toast.success(`${type}信息已复制到剪贴板`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 sticky top-0 z-10 shadow-md">
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
            <h2 className="text-xl font-bold">关于作者</h2>
            <p className="text-sm text-indigo-100">了解应用开发者</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-16">
        {/* 作者信息卡片 */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-24"></div>
          <CardContent className="pt-0">
            <div className="flex flex-col items-center -mt-12">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-4xl">
                👨‍💻
              </div>
              <h3 className="mt-3 text-xl font-bold">开发者</h3>
              <p className="text-sm text-gray-500">面向AI编程 · 业余爱好者</p>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  React
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  TypeScript
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  Tailwind CSS
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 应用简介 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              开发初衷
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>
              这款油耗记录APP诞生于一个简单的想法：让车主能够更清晰地了解自己的用车成本，通过数据分析优化驾驶习惯，达到省油省钱的目的。
            </p>
            <p>
              作为一名开发者和车主，我深知记录油耗数据的重要性。通过这款应用，我希望能帮助更多人养成良好的记录习惯，让每一次加油都变得有价值。
            </p>
            <p className="text-indigo-600 font-medium">
              感谢您使用这款应用，希望它能为您的用车生活带来便利！
            </p>
          </CardContent>
        </Card>

        {/* 联系方式 */}
        <Card>
          <CardHeader>
            <CardTitle>联系方式</CardTitle>
            <CardDescription>欢迎交流与反馈</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleContact('GitHub')}
            >
              <Github className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">GitHub</span>
              <span className="text-xs text-gray-400">@CallmeLins</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleContact('邮箱')}
            >
              <Mail className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">电子邮箱</span>
              <span className="text-xs text-gray-400">zhao5638@gmail.com</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleContact('网站')}
            >
              <Globe className="w-4 h-4 mr-3" />
              <span className="flex-1 text-left">个人网站</span>
              <span className="text-xs text-gray-400">https://github.com/CallmeLins</span>
            </Button>
          </CardContent>
        </Card>

        {/* 支持开发 */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              支持开发
            </CardTitle>
            <CardDescription>
              如果这款应用对您有帮助，欢迎支持开发
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-amber-50 border-amber-200"
              onClick={() => toast.success('感谢您的支持！')}
            >
              <Star className="w-4 h-4 mr-2 text-amber-500" />
              给项目点个Star
            </Button>
            <Button
              variant="outline"
              className="w-full bg-white hover:bg-amber-50 border-amber-200"
              onClick={() => toast.success('感谢您请我喝咖啡！☕')}
            >
              <Coffee className="w-4 h-4 mr-2 text-amber-500" />
              请作者喝杯咖啡
            </Button>
          </CardContent>
        </Card>

        {/* 版本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>版本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">当前版本</span>
              <span className="font-medium">v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">发布日期</span>
              <span>2026-01-05</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">构建技术</span>
              <span>React + TypeScript</span>
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-400 text-center">
                开源项目 · MIT License
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 更新日志 */}
        <Card>
          <CardHeader>
            <CardTitle>更新日志</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">v2.1.0</span>
                <span className="text-xs text-gray-400">2026-01-05</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• tabbar 优化</li>
                <li>• 增加弹窗滚动条</li>
                <li>• 图标适配</li>
              </ul>
            </div>
          </CardContent>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">v2.0.0</span>
                <span className="text-xs text-gray-400">2026-01-03</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• 全新版本发布</li>
                <li>• 支持油耗记录添加和管理</li>
                <li>• 数据可视化图表展示</li>
                <li>• 车辆信息管理</li>
                <li>• AI智能分析配置</li>
                <li>• WebDAV云端同步</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 致谢 */}
        <div className="text-center text-sm text-gray-400 py-4">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Developer
          </p>
          <p className="mt-2">感谢所有用户的支持与反馈</p>
        </div>
      </div>
    </div>
  );
}