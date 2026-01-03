// WebDAV 同步工具类
import { fetch } from '@tauri-apps/plugin-http';

export interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
  path: string;
}

export class WebDAVClient {
  private config: WebDAVConfig;

  constructor(config: WebDAVConfig) {
    this.config = config;
  }

  // 获取完整的文件路径
  private getFullPath(filename: string): string {
    let baseUrl = this.config.url;

    // 确保 URL 以斜杠结尾
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }

    // 确定使用的路径
    let targetPath = this.config.path;

    // 如果没有配置路径，默认使用 xiaomaoyouhao 文件夹
    if (!targetPath || targetPath === '/' || targetPath.trim() === '') {
      targetPath = 'xiaomaoyouhao';
      console.log('未配置路径，使用默认路径: xiaomaoyouhao');
    }

    // 处理路径格式
    // 移除开头的斜杠
    if (targetPath.startsWith('/')) {
      targetPath = targetPath.substring(1);
    }
    // 确保路径以斜杠结尾
    if (!targetPath.endsWith('/')) {
      targetPath += '/';
    }

    return `${baseUrl}${targetPath}${filename}`;
  }

  // 获取认证头
  private getAuthHeader(): string {
    const credentials = btoa(`${this.config.username}:${this.config.password}`);
    return `Basic ${credentials}`;
  }

  // 测试连接
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testing WebDAV connection to:', this.config.url);

      const response = await fetch(this.config.url, {
        method: 'PROPFIND',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Depth': '0',
          'Content-Type': 'application/xml',
        },
        mode: 'cors',
      });

      console.log('WebDAV response status:', response.status);
      console.log('WebDAV response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok || response.status === 207) {
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('WebDAV error response:', errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      console.error('WebDAV connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      // 检查是否是 CORS 错误
      if (errorMessage.includes('CORS') || errorMessage.includes('NetworkError')) {
        return {
          success: false,
          error: 'CORS错误：浏览器阻止了跨域请求。请检查WebDAV服务器的CORS配置，或考虑使用Tauri的HTTP客户端。'
        };
      }

      return { success: false, error: errorMessage };
    }
  }

  // 创建目录
  async createDirectory(path: string): Promise<boolean> {
    try {
      console.log('创建目录:', path);
      const response = await fetch(path, {
        method: 'MKCOL',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      console.log('创建目录响应状态:', response.status);
      // 201 Created, 405 Method Not Allowed (目录已存在)
      return response.status === 201 || response.status === 405;
    } catch (error) {
      console.error('创建目录失败:', error);
      return false;
    }
  }
  // 上传文件
  async uploadFile(filename: string, content: string): Promise<boolean> {
    try {
      const url = this.getFullPath(filename);
      console.log('上传 URL:', url);
      console.log('文件名:', filename);
      console.log('内容大小:', content.length, 'bytes');

      // 提取目录路径并尝试创建
      const lastSlashIndex = url.lastIndexOf('/');
      const dirPath = url.substring(0, lastSlashIndex + 1);
      console.log('目录路径:', dirPath);

      // 尝试创建目录（如果已存在会返回 405，也算成功）
      await this.createDirectory(dirPath);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'text/csv;charset=utf-8',
        },
        body: content,
      });

      console.log('上传响应状态:', response.status);
      console.log('上传响应状态文本:', response.statusText);

      const success = response.ok || response.status === 201 || response.status === 204;

      if (!success) {
        const errorText = await response.text();
        console.error('上传失败响应:', errorText);
      }

      return success;
    } catch (error) {
      console.error('WebDAV upload failed:', error);
      return false;
    }
  }

  // 下载文件
  async downloadFile(filename: string): Promise<string | null> {
    try {
      const url = this.getFullPath(filename);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (response.ok) {
        return await response.text();
      }
      return null;
    } catch (error) {
      console.error('WebDAV download failed:', error);
      return null;
    }
  }

  // 检查文件是否存在
  async fileExists(filename: string): Promise<boolean> {
    try {
      const url = this.getFullPath(filename);
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // 获取文件最后修改时间
  async getLastModified(filename: string): Promise<Date | null> {
    try {
      const url = this.getFullPath(filename);
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (response.ok) {
        const lastModified = response.headers.get('Last-Modified');
        return lastModified ? new Date(lastModified) : null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
