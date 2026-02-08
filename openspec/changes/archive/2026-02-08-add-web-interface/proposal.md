# Change: Add web interface to Spring Boot application

## Why
当前项目是一个纯后端Spring Boot应用，缺少用户界面。用户希望添加网页功能，实现前后端不分离的Web应用，以便通过浏览器访问和使用系统功能。

## What Changes
- 添加Thymeleaf模板引擎依赖，支持服务器端渲染HTML页面
- 创建基础的Web控制器，处理HTTP请求并返回视图
- 添加静态资源（CSS、JavaScript、图片）支持
- 创建示例首页和基础布局模板
- 配置Spring MVC以服务静态资源和模板

## Impact
- Affected specs: web-interface
- Affected code: pom.xml, src/main/java/com/example/writemyself/controller/, src/main/resources/templates/, src/main/resources/static/, src/main/resources/application.properties

