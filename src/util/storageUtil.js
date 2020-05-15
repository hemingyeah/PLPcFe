function save(key, data){
  localStorage.setItem(key, JSON.stringify(data));
}

function get(key){
  let str = localStorage.getItem(key);
  let data = {};
  
  try {
    data = JSON.parse(str);
  } catch (error) {
    data = str;
  }

  return data;
}

function remove(key){
  localStorage.removeItem(key)
}

export default {
  save,
  get,
  remove
};