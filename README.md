# 售后宝PC端前端项目

## 浏览器兼容性
  IE 11+, Edge, Firefox, Chrome 49+, Safari
  > IE最低支持至11 
  >
  > Chrome最低支持至49。为Chrome 49是windows xp最后一个版本，也是windows钉钉客户端包含的浏览器版本 

## 注意事项
> 1366 * 768尺寸的屏幕在钉钉中可用空间大约为1363 * 663

## 项目结构
```
├── config                        Webpack配置
├── dist                          资源输出目录
├── model                         常用类和常量
├── modules                       页面入口
├── public                        外部静态资源
├── script                        开发和打包脚本      
├── server                        koa server      
│   └── routes                    路由
├── src                           源码
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