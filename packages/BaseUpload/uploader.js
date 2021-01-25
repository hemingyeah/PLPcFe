import { notification } from '@src/util/Platform';
import http from '@src/util/http'

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
 * 批量上传
 * @param {File} file - 待上传的文件
 * @param {string} action - 上传地址
 * @param {object} options - 参数
 * @param {(boolean | function)} options.validateStorage - 是否验证容量限制 
 * @param {boolean} options.silence - 是否不显示提示
 */
function upload(file, action, options = {}) {
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
      if (error == 10404) {
        if (options.silence !== false) notification({
          type: 'error',
          title: '文件上传失败',
          message: '您的附件存储空间已经用尽，请联系管理员进行空间扩容'
        })

        // 这里要继续扔出错误，以便让调用者处理
        throw error;
      }

      console.error('upload caught:', error)
    })
}

/** 验证租户存储容量 */
export function validateTenantStorage(option, args) {
  if (typeof option == 'function') return option();
  if (option === false) return Promise.resolve();

  let files = args instanceof FileList ? Array.from(args) : [args];
  let total = files.reduce((acc, file) => (acc += file.size) && acc, 0)

  return http.get('/files/remainingStorage').then(result => {
    let surplus = result.data;
    if (surplus < (total / 1024 / 1024)) return Promise.reject(10404)
  })
}

export default {
  upload
}