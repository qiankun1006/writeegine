# Change: 为应用添加自定义错误处理页面

## Why
当前应用在发生错误时显示Spring Boot的默认Whitelabel Error Page，这不仅显得不专业，还无法向用户提供有意义的错误信息。通过添加自定义的全局错误处理器和错误页面，可以改善用户体验并提供更好的错误诊断能力。

## What Changes
- 创建自定义的GlobalExceptionHandler来统一处理应用中的异常
- 创建error.html错误页面模板，提供友好的错误显示
- 添加自定义错误视图控制器处理/error请求
- 配置Spring Boot错误处理属性，禁用Whitelabel页面
- 为常见错误类型(404、500等)提供特定的处理逻辑

## Impact
- Affected specs: error-handling
- Affected code: src/main/java/com/example/writemyself/controller/, src/main/resources/templates/, src/main/resources/application.properties

