import { getRootWindow } from "./dom";

const RootWindow = getRootWindow(window);

function getGrayOptions() {
  let options = {};
  try {
    options = JSON.parse(RootWindow._init);
  } catch (error) {
    options = {};
    console.warn("getGrayOptions -> error", error)
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
  
  return ""
}

function getProductV2ApiPath (){
  // 超级二维码和产品改造灰度
  let isGrayProductV2 = false;
  
  try {
    let options = getGrayOptions();
    isGrayProductV2 = options.openSuperCode === true;
  } catch (error) {
    isGrayProductV2 = false;
  }
  
  return isGrayProductV2
}

function getProductApiPath (){
  let isGrayProduct = false;
  
  try {
    let options = getGrayOptions();
    isGrayProduct = options.isTaskGrayFunction === true;
  } catch (error) {
    isGrayProduct = false;
  }
  
  return ""
}

export default {
  getCustomerApiPath,
  getProductApiPath,
  getProductV2ApiPath
};
