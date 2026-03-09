# 游戏地图AI生成功能部署指南

## 系统要求

### 硬件要求
- **CPU**: 至少4核心
- **内存**: 至少8GB RAM
- **存储**: 至少10GB可用空间
- **网络**: 稳定的互联网连接（用于AI服务调用）

### 软件要求
- **Java**: JDK 1.8 或更高版本
- **Maven**: 3.6.0 或更高版本
- **数据库**: H2（嵌入式）或 MySQL 5.7+
- **操作系统**: Windows 10+, macOS 10.14+, Linux Ubuntu 18.04+

## 部署步骤

### 1. 环境准备

#### 1.1 安装Java
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-8-jdk

# macOS (使用Homebrew)
brew install openjdk@8

# Windows
# 从Oracle官网下载并安装JDK 8
```

验证安装：
```bash
java -version
```

#### 1.2 安装Maven
```bash
# Ubuntu/Debian
sudo apt install maven

# macOS (使用Homebrew)
brew install maven

# Windows
# 从Apache官网下载并安装Maven
```

验证安装：
```bash
mvn -version
```

### 2. 项目配置

#### 2.1 数据库配置
默认使用H2嵌入式数据库，无需额外配置。如需使用MySQL：

1. 在`src/main/resources/application.properties`中添加：
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/writemyself
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQL5InnoDBDialect
```

2. 在`pom.xml`中添加MySQL依赖：
```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
```

#### 2.2 AI服务配置
当前版本使用模拟AI服务。如需集成真实AI服务：

1. 在`application.properties`中添加AI服务配置：
```properties
# AI服务配置
ai.service.url=https://api.ai-service.com/v1
ai.service.api-key=your-api-key-here
ai.service.timeout=30000

# 地图生成配置
game-map.generation.timeout=120000
game-map.max-size=4096
game-map.supported-styles=fantasy,sci-fi,medieval,modern,cyberpunk,steampunk
```

2. 修改`GameMapController.java`中的`simulateMapGeneration`方法，调用真实AI服务。

### 3. 构建项目

#### 3.1 清理和编译
```bash
cd /path/to/writeengine
mvn clean compile
```

#### 3.2 运行测试
```bash
mvn test
```

#### 3.3 打包
```bash
mvn package -DskipTests
```

生成的JAR文件位于：`target/writeMyself-0.0.1-SNAPSHOT.jar`

### 4. 运行应用

#### 4.1 开发环境运行
```bash
mvn spring-boot:run
```

应用将在 `http://localhost:8083` 启动。

#### 4.2 生产环境运行

##### 使用JAR文件运行：
```bash
java -jar target/writeMyself-0.0.1-SNAPSHOT.jar
```

##### 使用Docker运行：
1. 创建Dockerfile：
```dockerfile
FROM openjdk:8-jdk-alpine
VOLUME /tmp
COPY target/writeMyself-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
```

2. 构建和运行：
```bash
docker build -t writeengine .
docker run -p 8083:8083 writeengine
```

##### 使用systemd服务（Linux）：
1. 创建服务文件 `/etc/systemd/system/writeengine.service`：
```ini
[Unit]
Description=WriteEngine Game Map AI Service
After=network.target

[Service]
User=writeengine
WorkingDirectory=/opt/writeengine
ExecStart=/usr/bin/java -jar writeMyself-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

2. 启用并启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable writeengine
sudo systemctl start writeengine
sudo systemctl status writeengine
```

### 5. 配置Nginx反向代理（可选）

对于生产环境，建议使用Nginx作为反向代理：

1. 安装Nginx：
```bash
sudo apt install nginx
```

2. 创建站点配置 `/etc/nginx/sites-available/writeengine`：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态文件缓存
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 文件上传大小限制
    client_max_body_size 10M;
}
```

3. 启用站点并重启Nginx：
```bash
sudo ln -s /etc/nginx/sites-available/writeengine /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL配置（生产环境必需）

使用Let's Encrypt获取免费SSL证书：

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

## 监控和维护

### 1. 应用监控

#### 1.1 Spring Boot Actuator
应用已集成Spring Boot Actuator，提供以下端点：
- `/actuator/health` - 健康检查
- `/actuator/info` - 应用信息
- `/actuator/metrics` - 性能指标
- `/actuator/loggers` - 日志配置

启用所有端点（在`application.properties`中）：
```properties
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always
```

#### 1.2 日志配置
日志文件位于：`logs/spring-boot.log`

配置日志级别：
```properties
logging.level.com.example.writemyself=DEBUG
logging.level.org.springframework.web=INFO
logging.file.name=logs/spring-boot.log
logging.file.max-size=10MB
logging.file.max-history=30
```

### 2. 数据库维护

#### 2.1 H2数据库控制台
开发环境下可以访问H2控制台：
- URL: `http://localhost:8083/h2-console`
- JDBC URL: `jdbc:h2:mem:testdb`
- 用户名: `sa`
- 密码: （空）

#### 2.2 数据库备份（MySQL）
```bash
# 备份
mysqldump -u root -p writemyself > backup_$(date +%Y%m%d).sql

# 恢复
mysql -u root -p writemyself < backup_file.sql
```

### 3. 性能优化

#### 3.1 JVM参数优化
```bash
java -Xms512m -Xmx2048m -XX:+UseG1GC -jar app.jar
```

#### 3.2 连接池配置
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.connection-timeout=30000
```

## 故障排除

### 常见问题

#### 问题1：应用启动失败，端口被占用
```bash
# 查找占用端口的进程
sudo lsof -i :8083

# 杀死进程
sudo kill -9 <PID>

# 或者修改应用端口
server.port=8084
```

#### 问题2：内存不足
```bash
# 增加JVM堆内存
java -Xms1g -Xmx4g -jar app.jar
```

#### 问题3：数据库连接失败
- 检查数据库服务是否运行
- 验证连接参数是否正确
- 检查防火墙设置

#### 问题4：静态资源无法加载
- 检查Nginx配置中的静态文件路径
- 验证文件权限
- 清除浏览器缓存

### 日志分析

关键日志位置：
- 应用日志：`logs/spring-boot.log`
- Nginx访问日志：`/var/log/nginx/access.log`
- Nginx错误日志：`/var/log/nginx/error.log`

查看实时日志：
```bash
# 应用日志
tail -f logs/spring-boot.log

# Nginx日志
tail -f /var/log/nginx/access.log
```

## 安全配置

### 1. 生产环境安全建议

#### 1.1 禁用开发功能
```properties
# 禁用H2控制台
spring.h2.console.enabled=false

# 禁用Actuator敏感端点
management.endpoints.web.exposure.include=health,info
```

#### 1.2 配置CORS
```properties
# 允许的域名
cors.allowed-origins=https://your-domain.com
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true
```

#### 1.3 防止CSRF攻击
确保Thymeleaf模板正确使用CSRF令牌：
```html
<input type="hidden" th:name="${_csrf.parameterName}" th:value="${_csrf.token}" />
```

### 2. API安全

#### 2.1 速率限制
考虑集成Spring Security或使用API网关实现速率限制。

#### 2.2 API密钥认证
对于AI服务调用，使用API密钥：
```java
@Configuration
public class AIServiceConfig {

    @Value("${ai.service.api-key}")
    private String apiKey;

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("Authorization", "Bearer " + apiKey);
            return execution.execute(request, body);
        });
        return restTemplate;
    }
}
```

## 扩展和定制

### 1. 添加新的地图风格

1. 在`GameMapController.java`中添加新的风格选项：
```java
List<String> validStyles = Arrays.asList(
    "fantasy", "sci-fi", "medieval", "modern",
    "cyberpunk", "steampunk", "new-style"  // 添加新风格
);
```

2. 在前端HTML中添加对应的选项：
```html
<option value="new-style">新风格名称</option>
```

3. 在CSS中定义新风格的预览样式。

### 2. 集成新的AI服务

1. 创建AI服务接口：
```java
public interface AIService {
    CompletableFuture<MapGenerationResult> generateMap(
        MapGenerationRequest request
    );

    MapGenerationStatus getStatus(String jobId);

    Resource downloadMap(String mapId);
}
```

2. 实现具体的AI服务（如Stable Diffusion、Midjourney等）。

### 3. 添加用户认证

集成Spring Security：
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            .and()
            .formLogin()
            .and()
            .httpBasic();
    }
}
```

## 备份和恢复

### 1. 完整备份脚本
```bash
#!/bin/bash
BACKUP_DIR="/backup/writeengine"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR/$DATE

# 备份数据库
mysqldump -u root -p writemyself > $BACKUP_DIR/$DATE/database.sql

# 备份上传的文件
cp -r /path/to/uploaded/files $BACKUP_DIR/$DATE/

# 备份配置文件
cp /path/to/application.properties $BACKUP_DIR/$DATE/

# 压缩备份
tar -czf $BACKUP_DIR/writeengine_backup_$DATE.tar.gz $BACKUP_DIR/$DATE

# 清理临时文件
rm -rf $BACKUP_DIR/$DATE

# 保留最近7天的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: writeengine_backup_$DATE.tar.gz"
```

### 2. 恢复脚本
```bash
#!/bin/bash
BACKUP_FILE=$1
TEMP_DIR="/tmp/restore_$(date +%s)"

# 解压备份文件
mkdir -p $TEMP_DIR
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# 恢复数据库
mysql -u root -p writemyself < $TEMP_DIR/database.sql

# 恢复文件
cp -r $TEMP_DIR/files/* /path/to/uploaded/files/

# 恢复配置
cp $TEMP_DIR/application.properties /path/to/

# 清理
rm -rf $TEMP_DIR

echo "恢复完成"
```

## 联系方式

- **问题报告**: GitHub Issues 或团队邮箱
- **紧急支持**: 联系系统管理员
- **文档更新**: 查看项目文档目录

---

**注意**: 本指南基于当前版本编写，具体配置可能随版本更新而变化。请参考最新版本文档。

