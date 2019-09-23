/* eslint-disable vue/html-indent */
export function storageGet(key, defaultValue) {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.log(`hbc: storageGet -> error ${error}`)
    return defaultValue;
  }
}

export function storageSet(key, value) {
  if(!key) return (
    console.warn('Caused: can not set storage, because not key')
  )
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.log('hbc: stroageSet -> error', error)
  }
}

export function storageSetDepth(key, value, rootKey = '') {
  if(rootKey && key) {

    let rootValue = storageGet(rootKey, '{}');

    rootValue = JSON.parse(rootValue);
    rootValue.key = value;

    storageSet(rootKey, rootValue);
  } else {
    storageSet(key, value);
  }
}