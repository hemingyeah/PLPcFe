# 售后宝PC端前端项目
---
该项目是基于webpack搭建的多页应用。兼用以下浏览器：IE 11+, Edge, Firefox, Chrome 49+, Safari。

> Chrome最低支持至49。为Chrome 49是windows xp最后一个版本，也是windows钉钉客户端包含的浏览器版本 
> 
> 1366 * 768尺寸的屏幕在钉钉中可用空间大约为1363 * 663

## 项目结构
```
├── config                        Webpack配置
├── dist                          资源输出目录
├── model                         常用类和常量
├── modules                       页面入口
├── public                        外部静态资源
├── script                        开发和打包脚本      
│   └── config                    个人配置项
├── server                        koa server      
│   └── routes                    路由
├── src                           源码
│   ├── api                       api
│   ├── assets                    资源文件
│   ├── common                    公共脚本
│   ├── component                 组件
│   ├── config                    项目配置
│   ├── directive                 vue 指令
│   ├── filter                    vue filter
│   ├── modules                   模块，所有页面在此开发
│   ├── platform                  跨浏览器和钉钉工具类
│   ├── util                      工具类
│   │   └── dingtalk              钉钉api
│   └── index.html                默认模板
└── package.json                  npm配置文件 
```

## 构建步骤
``` bash
# [可选] 配置淘宝源 https://registry.npm.taobao.org

# install dependencies
npm install 

# run dev server
npm run dev

# build for production 
npm run build 

# 导出组件用于web项目和sm4-pc
npm run comp
```