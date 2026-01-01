import { f7 } from 'framework7-vue';

export function useDialog() {
  // 显示提示信息
  const showToast = (text: string, duration = 2000) => {
    f7.toast.create({
      text,
      position: 'center',
      closeTimeout: duration,
    }).open();
  };

  // 显示成功提示
  const showSuccess = (text: string) => {
    showToast(text, 2000);
  };

  // 显示错误提示
  const showError = (text: string) => {
    showToast(text, 3000);
  };

  // 显示确认对话框
  const showConfirm = (title: string, text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      f7.dialog.confirm(text, title, () => {
        resolve(true);
      }, () => {
        resolve(false);
      });
    });
  };

  // 显示输入对话框
  const showPrompt = (title: string, text: string, defaultValue = ''): Promise<string | null> => {
    return new Promise((resolve) => {
      f7.dialog.prompt(text, title, (value) => {
        resolve(value);
      }, () => {
        resolve(null);
      }, defaultValue);
    });
  };

  // 显示加载中
  const showLoading = (text = '加载中...') => {
    f7.preloader.show();
  };

  // 隐藏加载中
  const hideLoading = () => {
    f7.preloader.hide();
  };

  return {
    showToast,
    showSuccess,
    showError,
    showConfirm,
    showPrompt,
    showLoading,
    hideLoading,
  };
}
