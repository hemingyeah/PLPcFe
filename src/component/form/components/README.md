# 目录说明
---
该目录下维护所有类型的自定义字段，一般一种类型的字段对应一个目录，例如`text`类型的字段对应`FormText`目录。

## 组件结构
多数情况下，每一种类型的字段都需要对应以下类型的组件：
- Preview   预览组件，主要用于在设计器中展示
- Setting   设置组件，主要用于在设计器中配置
- View      展示组件，主要用于展示。 
- Build     表单组件，主要用于构建表单。
- Extend    主要用于对系统中存在一些系统字段进行拓展

## 导出字段结构
为了`FormDesign`, `FormBuilder`, `FormView`三个组件协同运作，提供统一的字段配置：

- formType            字段类型
- name                字段名称
- isSystem            是否系统字段
- component.view      [可选]视图组件
- component.build     [可选]表单组件
- component.preview   [必须]预览组件
- component.setting   [必须]设置组件
- component.extend    [可选]扩展组件, 键值命名规则如下：
  ```javascript
  // 命名规则： 
  `${mode}_${fieldName}_${component}`
  // 例如产品类型设置需要自定义，命名如下：
  'product_type_setting'
  // 如果工单的客户字段需要自定义，命名如下：
  'task_customer_build'
  ```