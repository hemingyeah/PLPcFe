## 表单组件结构
- view 视图组件
- build 表单组件
- preview 预览组件
- setting 设置组件
- extend 扩展组件

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
 