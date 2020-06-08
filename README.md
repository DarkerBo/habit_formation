# 习惯养成系统（前端部分）

### 前言

本项目基于 React.js 框架实现。主要实现了 习惯打卡、消息管理、日志分享、个人信息、管理员后台管理等功能，形成一个培养习惯、心得分享、消息交流、管理员信息管理的闭环。

[后端项目地址猛戳这里](https://github.com/DarkerBo/habit_formation_node)



### 技术栈

- [x] **主要开发框架：** React
- [x]  **前端路由：** React-Router
- [x]  **状态管理：** Redux Thunk
- [x]  **构建工具：** Webpack
- [x] **CSS预处理器：** Sass/Scss
- [x] **数据请求：** Axios
- [x] **UI 框架：** Ant Design Mobile



### 项目主要结构

```
├── src             
│   └── assets           // 静态资源 如图片资源
│   └── common           // 公共文件 如页面复用的高阶组件
│   └── components       // 公共组件 如侧边导航栏
│   └── pages            
│        └── admin       // 管理员相关页面
│        └── error-page  // 错误提示页面 如404页面
│        └── home        // 普通用户相关页面
│   └── routers          // 路由
│   └── services         // 接口
│   └── store            // 状态管理
│   └── untils           // 工具函数
│   └── App.jsx          
│   └── index.js         
```





### 运行效果图

* **习惯打卡**

![习惯打卡](/screenshots/习惯打卡.gif)

* **习惯记录**

![习惯记录](/screenshots/习惯记录.gif)

* **日志分享**

![日志分享](/screenshots/日志分享.gif)

* **消息交流**

![消息交流](/screenshots/消息交流.gif)

* **个人信息管理**

![个人信息管理](/screenshots/个人信息管理.gif)

* **后台管理**

![后台管理](/screenshots/后台管理.gif)





### 注意事项

在开发该项目的时候，React Hook 还在提出概念阶段，还未正式推行，因此完成该项目是使用 Class 组件的形式开发的。











