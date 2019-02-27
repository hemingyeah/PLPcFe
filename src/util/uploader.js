import {toArray} from '@src/util/lang';

export const FILE_MAX_SIZE = 10 * 1024 * 1024; //单位字节(Byte)
export const FILE_MAX_NUM = 9;

/** 
 * 验证文件是否符合以下条件
 * 1. 10m以内
 * 2. 有后缀名 
 */
export function validate(file){
  let fileName = file.name;

  //验证文件大小
  if(file.size > FILE_MAX_SIZE) return new Error(`[${fileName}]的大小超过10MB，系统暂不支持上传`);

  //验证文件类型
  let lastDotIndex = fileName.lastIndexOf(".");
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

/** 异步上传附件 */
export function upload(file, action){
  let xhr = new XMLHttpRequest();
  let form = new FormData();
  form.append('upload',file);

  return new Promise((resolve, reject) => {
    xhr.onerror = error => reject(error)

    xhr.onload = function onload() {
      if (xhr.status < 200 || xhr.status >= 300) {
        return reject(getError(xhr, action));
      }
      resolve(getBody(xhr));
    };

    //TODO: 上传进度监听
    // if (xhr.upload) {
    //   xhr.upload.onprogress = function progress(e) {
    //     console.log(e)
    //   }
    // }
    
    xhr.open("post", action, true);
    xhr.send(form);
  });
}

function getErrorResult(file, error){
  if(error) console.error(error);

  return new Error(`[${file.name}]上传失败`)
}

function getResult(file, msg){
  let data = msg.data || {};

  //如果上传失败或没有文件id，按失败处理
  if(msg.status != 0 || !data.id) return getErrorResult(file)

  return {
    id: data.id,
    filename: data.fileName,
    //如果后端返回url,必须使用。如果后端不返回，需要拼接
    url: data.url || `/files/get?fileId=${data.id}`,
    fileSize: data.fileSizeStr
  }
}

/** 
 * 上传文件, 会解析返回值
 * 上传失败会返回Error对象
 */
export function uploadWithParse(file, action = '/files/upload'){
  return upload(file, action)
    .then(msg => getResult(file, msg))
    .catch(error => getErrorResult(file, error))
}

/** 批量上传 */
export function batchUploadWithParse(files, action = '/files/upload'){
  let fileArr = toArray(files);
  let validateRes = fileArr.map(item => validate(item)).filter(item => item instanceof Error);
  if(validateRes.length > 0){ //文件验证失败
    return Promise.resolve({success: [], error: validateRes});
  }

  let promises = fileArr.map(file => uploadWithParse(file, action));
  return Promise.all(promises)
    .then(result => {
      let success = [];
      let error = [];
      result.forEach(item => item instanceof Error ? error.push(item) : success.push(item))
      return {success, error}
    })
    .catch(error => console.error('batchUploadWithParse caught e', error))
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