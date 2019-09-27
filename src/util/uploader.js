import {toArray} from '@src/util/lang';
import {notification} from '@src/platform/message';
import Exception from '@model/Exception';
import http from '@src/util/http';

export const FILE_MAX_SIZE = 10 * 1024 * 1024; // 单位字节(Byte)
export const FILE_MAX_NUM = 9;

/** 
 * 验证文件是否符合以下条件
 * 1. 10m以内
 * 2. 有后缀名 
 */
export function validate(file){
  let fileName = file.name;

  // 验证文件大小
  if(file.size > FILE_MAX_SIZE) return new Error(`文件[${fileName}]的大小超过10MB，系统暂不支持上传`);

  // 验证文件类型
  let lastDotIndex = fileName.lastIndexOf('.');
  if(lastDotIndex < 0) return new Error(`[${fileName}]的文件类型未知，系统暂不支持上传`);

  return null;
}

/** 解析错误 */
function getError(xhr, action) {
  let msg;
  if (xhr.response) {
    msg = `${xhr.response.error || xhr.response}`;
  } else if (xhr.responseText) {
    msg = `${xhr.responseText}`;
  } else {
    msg = `fail to post ${action} ${xhr.status}`;
  }

  const err = new Error(msg);
  err.status = xhr.status;
  err.method = 'post';
  err.url = action;
  return err;
}

/** 解析返回值 */
function getBody(xhr) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

/** 
 * 异步上传附件
 * 
 * @param {File} file - 待上传的文件
 * @param {string} action - 上传地址
 * @param {object} [options] - 参数
 * @param {(boolean | function)} [options.validateStorage] - 是否验证容量限制 
 * @param {boolean} [options.silence ] - 是否不显示提示
 */
export function upload(file, action, options = {}){
  return validateTenantStorage(options.validateStorage, file)
    .then(() => {
      let xhr = new XMLHttpRequest();
      let form = new FormData();

      return new Promise((resolve, reject) => {
        form.append('upload', file);

        xhr.onerror = error => reject(error)
        xhr.onload = function onload() {
          if (xhr.status < 200 || xhr.status >= 300) {
            return reject(getError(xhr, action));
          }
          resolve(getBody(xhr));
        };
    
        xhr.open('post', action, true);
        xhr.send(form);
      });
    })
    .catch(error => {
      if(error.code == 10404){
        if(options.silence !== false) notification({
          type: 'error',
          title: '文件上传失败',
          message: error.message
        })

        // 这里要继续扔出错误，以便让调用者处理
        throw error;
      }
      
      console.error('upload caught:', error)
    })
}

function getErrorResult(file, error){
  if(error) console.error(error);

  return new Error(`[${file.name}]上传失败`)
}

function getResult(file, msg){
  let data = msg.data || {};

  // 如果上传失败或没有文件id，按失败处理
  if(msg.status != 0 || !data.id) return getErrorResult(file)

  return {
    id: data.id,
    filename: data.fileName,
    // 如果后端返回url,必须使用。如果后端不返回，需要拼接
    url: data.ossUrl || data.url || `/files/get?fileId=${data.id}`,
    fileSize: data.fileSizeStr
  }
}

/** 
 * 上传文件, 会解析返回值
 * 上传失败会返回Error对象
 */
export function uploadWithParse(file, action = '/files/upload', options = {}){
  return upload(file, action, options)
    .then(msg => getResult(file, msg))
    .catch(error => getErrorResult(file, error))
}

/** 
 * 批量上传
 * @param {FileList} files - 待上传的文件
 * @param {string} action - 上传地址
 * @param {object} [options] - 参数
 * @param {(boolean | function)} [options.validateStorage] - 是否验证容量限制 
 * @param {boolean} [options.silence] - 是否不显示提示
 */
export function batchUploadWithParse(files, action = '/files/upload', options = {}){
  return validateTenantStorage(options.validateStorage, files)
    .then(() => {
      let fileArr = toArray(files);
      let validateRes = fileArr.map(item => validate(item)).filter(item => item instanceof Error);
      if(validateRes.length > 0){ // 文件验证失败
        return Promise.resolve(validateRes);
      }

      let promises = fileArr.map(file => uploadWithParse(file, action, {validateStorage: false}));      
      return Promise.all(promises)
    })
    .then(result => {
      return result.reduce(
        (acc, item) => (item instanceof Error ? acc.error.push(item) : acc.success.push(item)) && acc,
        {success: [], error: []}
      )
    })
    .catch(error => {
      if(error.code == 10404){
        if(options.silence !== false) notification({
          type: 'error',
          title: '文件上传失败',
          message: error.message
        })

        // 这里要继续扔出错误，以便让调用者处理
        throw error;
      }
      
      console.error('batchUploadWithParse caught:', error)
    })
}

/** 验证租户存储容量 */
export function validateTenantStorage(option, args){
  if(typeof option == 'function') return option();
  if(option === false) return Promise.resolve();

  let files = args instanceof FileList ? Array.from(args) : [args];
  let total = files.reduce((acc, file) => (acc += file.size) && acc, 0)

  return http.get('/files/remainingStorage').then(result => {
    let surplus = result.data;
    if(surplus < (total / 1024 / 1024)) return Promise.reject(new Exception('您的附件存储空间已经用尽，请联系管理员进行空间扩容', 10404))
  })
}

const uploader = {
  upload,
  uploadWithParse,
  batchUploadWithParse,
  validate,
  FILE_MAX_SIZE,
  FILE_MAX_NUM
}

export default uploader;