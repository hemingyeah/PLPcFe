# 引导组件设计文档

---

## 需求

针对目前已有的新功能引导需求，快速迭代开发。

## 使用方法

在需要引导功能的页面添加携带 id 的 dom 元素，例如<div id="guide-test"></div>.在页面加载完成之后调用全局封装\$Guide()的 creat 方法创建引导元素，如果不需要引导元素
需要调用 destory 方法删除该元素。如果需要多个引导同理需要创建多个 dom 元素。

## 传入参数

调用$Guide 时候需要传入一个数组，包含要引导的内容（*为必填）

arr-- 引导弹窗的内容参数
└──obj
    └──inside-- 是否需要引导弹窗嵌入引导元素内
    └──content-- 是否需要引导弹窗嵌入引导元素内
    └──needCover-- 是否需要蒙层焦点突出
    └──finishBtn-- 终结按钮内容
    └──id--  *弹窗绑定dom元素的id
    └──domId--  *需要引导dom元素的id
    └──domObj-- 传入一个函数返回需要引导dom元素
    └──diyContent-- 内容是否是组件形式
    └──diyContentDom-- 内容是组件形式传入组件对象
    └──haveStep--  是否显示弹窗左上角步骤
nowStep-- 当前是第几步引导
storageKe-- 关联的缓存元素key
watchStepFn-- 引导相关操作的钩子函数（需要返回Promise函数）
└──type-- 调用钩子函数的类型next:下一步  pre:上一步  stop:关闭弹窗  contentClick:内容点击
└──nowStep-- 当前是第几步
└──event-- 当type为contentClick会返回当前点击内容区域的dom元素

## 调用实例

具体参考产品改造列表等新功能引导页面

<!-- js调用实例 -->

this.$nextTick(()=>{
  this.$Guide([{
    content:
'步骤1',
    haveStep: true,
    nowStep: 1,
    gStyle: 'top:35px',
    id: 'guide-test',
    finishBtn: 'OK',
    needCover:true,
    diyContent:true,
    diyContentDom:组件名称
  }, {
    content:
'步骤2',
    haveStep: true,
    nowStep: 2,
    gStyle: 'top:35px',
    id: 'guide-test',
    finishBtn: 'OK',
  }], 0, '', (e)=>{
    return new Promise((resolve, reject)=>{
      resolve()
    })
  }).create()
})
