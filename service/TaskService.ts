/**
 * @description 获取obj对象的某个字段的string形式
 * 照搬的后端 base -> TaskService getFieldValue2String 方法
 * @param {Object} obj
 * @param {String} fieldName
 * @param {String} formType
 * @return
*/
export function getFieldValue2String(obj: String, fieldName: String, formType: String) {
      let result: String = null;

      if(fieldName == null){
          return '';
      }
      if(obj instanceof Customer){
          Customer customer = (Customer) obj;
          if(fieldName.equals("tags")){
              ArrayList<LinkedHashMap> tags = customer.getTags();
              StringBuffer tmp = new StringBuffer();
              for(int i=0;i<tags.size();i++){
                  Map tagMap = tags.get(i);
                  tmp.append(tagMap.get("tagName"));
                  if(i != tags.size()-1){
                      tmp.append(",");
                  }
              }
              result = tmp.toString();
          }else if(fieldName.equals("serialNumber")){
              result = customer.getSerialNumber();
          }else if(fieldName.equals("customerManager")){
              result = customer.getCustomerManagerName();
          } else{
              LinkedHashMap attribute = customer.getAttribute();
              CustomerTemplate customField = customerTemplateService.getByFieldName(fieldName, "customer");
              if(customField != null){
                  if ("info".equals(customField.getFormType())) {
                      if (customField.getPlaceHolder() != null && customField != null && customField.getIsDelete() == 0) {
                          result = customField.getPlaceHolder();
                      } else {
                          result = "";
                      }
                  } else if ("address".equals(customField.getFormType())) {
                      Map<String, Object> oldData = attribute.get(fieldName) != null ? (Map<String, Object>) attribute.get(fieldName) : new LinkedHashMap();
                      if (oldData.size() > 0 && customField != null && customField.getIsDelete() == 0) {
                          if (oldData.get("all") != null) {
                              result = oldData.get("all").toString();
                          } else {
                              result = "";
                          }
                      } else {
                          result = "";
                      }
                  } else if ("location".equals(customField.getFormType())) {
                      Map<String, Object> oldData = attribute.get(fieldName) != null ? (Map<String, Object>) attribute.get(fieldName) : new LinkedHashMap();
                      if (oldData.size() > 0 && customField != null && customField.getIsDelete() == 0) {
                          result = oldData.get("address").toString();
                      } else {
                          result = "";
                      }
                  } else {
                      Object value = attribute.get(fieldName);
                      if (value != null && customField != null && customField.getIsDelete() == 0) {
                          result = value.toString();
                      } else {
                          result = "";
                      }
                  }
              }
          }
      }else if(obj instanceof Product){
          Product product = (Product) obj;
          if(fieldName.equals("serialNumber")){
              result = product.getSerialNumber();
          }else if(fieldName.equals("type")){
              result = product.getType();
          }else{
              LinkedHashMap attribute = product.getAttribute();
              CustomerTemplate customField = customerTemplateService.getByFieldName(fieldName, "product");
              if(customField != null) {
                  formType = customField.getFormType();
                  if (formType.equals("info")) {
                      if (customField.getPlaceHolder() != null && customField != null && customField.getIsDelete() == 0) {
                          result = customField.getPlaceHolder();
                      } else {
                          result = "";
                      }
                  } else if (formType.equals("address")) {
                      Map<String, Object> oldData = attribute.get(fieldName) != null ? (Map<String, Object>) attribute.get(fieldName) : new LinkedHashMap();
                      if (oldData.size() > 0 && customField != null && customField.getIsDelete() == 0) {
                          if (oldData.get("all") != null) {
                              result = oldData.get("all").toString();
                          } else {
                              result = "";
                          }
                      } else {
                          result = "";
                      }
                  } else if (formType.equals("location")) {
                      Map<String, Object> oldData = attribute.get(fieldName) != null ? (Map<String, Object>) attribute.get(fieldName) : new LinkedHashMap();
                      if (oldData.size() > 0 && customField != null && customField.getIsDelete() == 0) {
                          result = oldData.get("address").toString();
                      } else {
                          result = "";
                      }
                  } else {
                      Object value = attribute.get(fieldName);
                      if (value != null && customField != null) {
                          result = value.toString();
                      } else {
                          result = "";
                      }
                  }
              }
          }
      }
      return result;
  }