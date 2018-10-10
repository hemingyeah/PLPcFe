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

function upload(file, action){
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
    
    xhr.open("post", action, true);
    xhr.send(form);
  });
}

export default {
  upload
}