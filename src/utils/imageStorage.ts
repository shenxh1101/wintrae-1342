import Taro from '@tarojs/taro';

export const saveImageToLocal = async (tempFilePath: string): Promise<string> => {
  try {
    const fs = Taro.getFileSystemManager();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = tempFilePath.split('.').pop() || 'jpg';
    const localPath = `${Taro.env.USER_DATA_PATH}/plant_photo_${timestamp}_${randomStr}.${ext}`;

    return new Promise((resolve, reject) => {
      fs.saveFile({
        tempFilePath,
        filePath: localPath,
        success: (res) => {
          console.log('[ImageUtil] 图片保存成功:', res.savedFilePath);
          resolve(res.savedFilePath || localPath);
        },
        fail: (err) => {
          console.warn('[ImageUtil] saveFile 失败，尝试 copyFile:', err);
          fs.copyFile({
            srcPath: tempFilePath,
            destPath: localPath,
            success: () => {
              console.log('[ImageUtil] copyFile 成功:', localPath);
              resolve(localPath);
            },
            fail: (copyErr) => {
              console.error('[ImageUtil] 图片持久化失败:', copyErr);
              resolve(tempFilePath);
            }
          });
        }
      });
    });
  } catch (err) {
    console.error('[ImageUtil] 保存图片异常:', err);
    return tempFilePath;
  }
};

export const deleteLocalImage = async (filePath: string): Promise<boolean> => {
  if (!filePath || !filePath.includes(Taro.env.USER_DATA_PATH)) {
    return false;
  }
  try {
    const fs = Taro.getFileSystemManager();
    fs.unlinkSync(filePath);
    console.log('[ImageUtil] 图片删除成功:', filePath);
    return true;
  } catch (err) {
    console.warn('[ImageUtil] 图片删除失败:', err);
    return false;
  }
};

export { saveImageToLocal as default };
