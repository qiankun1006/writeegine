# 应用启动失败 - 端口 8083 已被占用

## 问题
```
Web server failed to start. Port 8083 was already in use.
```

## 解决方案

### 方式 1: 杀死占用端口的进程（推荐）

**查看占用端口的进程：**
```bash
lsof -i :8083
```

**杀死进程：**
```bash
# 获取 PID 后杀死
kill -9 <PID>

# 或一行命令完成
lsof -i :8083 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### 方式 2: 更改应用端口

```bash
java -jar target/writeMyself-0.0.1-SNAPSHOT.jar --server.port=8084
```

## 快速重启脚本

```bash
# 停止旧进程并启动新应用（端口 8083）
lsof -i :8083 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null; \
sleep 2 && cd /Users/qiankun96/Desktop/meituan/writeengine && \
java -jar target/writeMyself-0.0.1-SNAPSHOT.jar --server.port=8083 > /tmp/writeengine.log 2>&1 &
```

## 验证

```bash
# 验证应用是否启动成功
curl http://localhost:8083/

# 查看应用日志
tail -f /tmp/writeengine.log

