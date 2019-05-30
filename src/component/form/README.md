# Form组件设计文档
---

## 需求
目前系统中工单、事件、客户、产品模块均提供自定义表单的支持，未来也会对附加组件提供更强的自定义能力。因此需要一套表单组件能够满足以下需求：
- 提供多种自定义字段
- 提供对内置系统字段的支持
- 用户可根据自己需求自行配置表单
- 将部分模块配置项并入相应的字段配置中

## 目标
为满足以上需求，表单组件需要支持以下特性：
- 表单设计器可拖拽
- 表单设计器支持区分系统字段和自定义字段
- 字段类型可扩展、复用（每一部分都可）
- 提供统一的验证机制
- 提供统一的表单渲染机制
- 提供统一的表单展示机制
- 字段可在表单中或展示时支持自定义

## 主要组件
- FormDesign - 表单设计器，提供表单设计能力
- FormBuilder - 表单构建器，提供统一的表单渲染机制
- FormView - 表单查看器，提供统一的展示机制
- FormItem - 表单项，提供统一的验证能力

## 字段类型结构
为了`FormDesign`, `FormBuilder`, `FormView`三个组件协同运作，提供统一的字段配置：

- formType            字段类型
- name                字段名称
- isSystem            是否系统字段
- component.view      视图组件
- component.build     表单组件
- component.preview   预览组件
- component.setting   设置组件
- component.extend    扩展组件, 命名规则如下：
  ```javascript
  `${mode}_${fieldName}_{role}`
  ```

## 表单验证机制

**表单构建器三层结构**: Form组件 -> FormItem -> FormBuilder
- Form组件提供每种字段的具体实现
- FormItem主要用于验证
- FormBuilder作为容器，并提供整个表单的验证 

注册流程：
> 1. `Form组件`在挂载时触发 `form.add.field` 事件，将其注册到`FormItem`和`FormBuilder`中.
> 2. `FormItem`在收到`form.add.field`事件后，保存value用于取值（闭包），并在原参数上附加`validate`方法
> 3. `FormBuilder`在收到`form.add.field`事件后，保存`validate`方法，在提交表单时验证整个表单

验证流程：
> 1. Form组件中的值发生变化时，触发`form.validate`事件
> 2. FormItem接受到事件后，阻止事件冒泡并调用`validate`方法进行验证
> 3. 表单提交时，`FormBuilder`根据自身维护的`validateMap`触发整个表单的验证
 