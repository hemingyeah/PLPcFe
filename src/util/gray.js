import { getRootWindow } from './dom';

const RootWindow = getRootWindow(window);

function getGrayOptions() {
  let options = {};
  try {
    options = JSON.parse(RootWindow._init);
  } catch (error) {
    options = {};
    console.warn('getGrayOptions -> error', error)
  }

  return options;
}

function getCustomerApiPath (){
  let isGrayCustomer = false;

  try {
    let options = getGrayOptions();
    isGrayCustomer = options.isTaskGrayFunction === true;
  } catch (error) {
    isGrayCustomer = false;
  }

  return isGrayCustomer ? '' : '';
}

function getProductApiPath (){
  let isGrayProduct = false;

  try {
    let options = getGrayOptions();
    isGrayProduct = options.isTaskGrayFunction === true;
  } catch (error) {
    isGrayProduct = false;
  }

  return isGrayProduct ? '' : '';
}

export default {
  getCustomerApiPath,
  getProductApiPath
};
