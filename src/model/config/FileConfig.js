//文件最大为50m 【注：原先10MB，需求1102改成50MB】
const MAX_SIZE = 50 * 1024 * 1024;

//允许的图片类型
const IMG_TYPE = ['png', 'bmp', 'gif', 'jpg', 'jpeg', 'jpg', 'tiff'];

//允许的文件类型
const FILE_TYPE = [
  //office文档
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  //压缩包
  'zip', 'rar', '7z',
  //文本
  'txt', 'pdf'
]

export default {
  MAX_SIZE,
  IMG_TYPE,
  FILE_TYPE,
  ALLOW_TYPE: [...FILE_TYPE, ...IMG_TYPE]
};