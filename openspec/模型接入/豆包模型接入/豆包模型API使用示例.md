# 豆包模型 API 使用示例

## 概述

本文档提供豆包模型的实际 API 调用示例，包括 curl、Java、Python 等多种方式。

## 前置条件

1. 已获取豆包模型 API Key
2. 已在配置文件中填写 API Key
3. 项目已启动（默认端口 8080）

## 目录

- [基础示例](#基础示例)
- [高级用法](#高级用法)
- [错误处理](#错误处理)
- [性能优化](#性能优化)

---

## 基础示例

### 1. 创建文生图任务

#### 1.1 使用 curl

```bash
curl -X POST http://localhost:8080/api/ai/portrait/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123" \
  -d '{
    "prompt": "一个年轻女性角色，长棕发，穿着蓝色和服，精致的脸部特征，大眼睛，微笑表情，动漫风格，高清，8K",
    "provider": "volcengine",
    "model": "doubao-seedream-5-0-lite",
    "width": 1024,
    "height": 1024,
    "generateCount": 1,
    "seed": null
  }'
```

**响应** (202 Accepted):
```json
{
  "taskId": "gen-20260318-a1b2c3d4e5f6",
  "status": "PENDING",
  "createdAt": 1710768000000,
  "message": "任务已创建，请使用 taskId 查询进度"
}
```

#### 1.2 使用 Java HttpClient

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

public class DoubaoAPIExample {

    public static void main(String[] args) throws Exception {
        // 构建请求体
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("prompt", "一个年轻女性角色，长棕发，穿着蓝色和服");
        requestBody.put("provider", "volcengine");
        requestBody.put("model", "doubao-seedream-5-0-lite");
        requestBody.put("width", 1024);
        requestBody.put("height", 1024);
        requestBody.put("generateCount", 1);

        ObjectMapper mapper = new ObjectMapper();
        String jsonBody = mapper.writeValueAsString(requestBody);

        // 创建 HTTP 请求
        HttpRequest request = HttpRequest.newBuilder()
            .uri(new URI("http://localhost:8080/api/ai/portrait/generate"))
            .header("Content-Type", "application/json")
            .header("X-User-Id", "123")
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();

        // 发送请求
        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request,
            HttpResponse.BodyHandlers.ofString());

        System.out.println("Status: " + response.statusCode());
        System.out.println("Body: " + response.body());

        // 解析响应
        Map<String, Object> responseBody = mapper.readValue(
            response.body(), new TypeReference<Map<String, Object>>(){});
        String taskId = (String) responseBody.get("taskId");
        System.out.println("Task ID: " + taskId);
    }
}
```

#### 1.3 使用 Python requests

```python
import requests
import json

url = "http://localhost:8080/api/ai/portrait/generate"
headers = {
    "Content-Type": "application/json",
    "X-User-Id": "123"
}

payload = {
    "prompt": "一个年轻女性角色，长棕发，穿着蓝色和服",
    "provider": "volcengine",
    "model": "doubao-seedream-5-0-lite",
    "width": 1024,
    "height": 1024,
    "generateCount": 1
}

response = requests.post(url, headers=headers, json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

task_id = response.json()["taskId"]
print(f"Task ID: {task_id}")
```

### 2. 查询生成进度

#### 2.1 使用 curl

```bash
curl http://localhost:8080/api/ai/portrait/progress/gen-20260318-a1b2c3d4e5f6 \
  -H "X-User-Id: 123"
```

**响应**:
```json
{
  "taskId": "gen-20260318-a1b2c3d4e5f6",
  "status": "COMPLETED",
  "progress": 100,
  "resultUrls": [
    "https://volcengine-cdn.xxxxx/generated-image-1.jpg"
  ],
  "completedAt": 1710768030000,
  "duration": 30000,
  "message": "生成成功"
}
```

#### 2.2 使用 Java 轮询

```java
public class DoubaoProgressPoller {

    public static void main(String[] args) throws Exception {
        String taskId = "gen-20260318-a1b2c3d4e5f6";
        long userId = 123L;

        HttpClient client = HttpClient.newHttpClient();
        ObjectMapper mapper = new ObjectMapper();

        boolean completed = false;
        int maxAttempts = 60;  // 最多轮询 60 次
        int attempts = 0;

        while (!completed && attempts < maxAttempts) {
            // 查询进度
            HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(
                    "http://localhost:8080/api/ai/portrait/progress/" + taskId))
                .header("X-User-Id", String.valueOf(userId))
                .GET()
                .build();

            HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

            Map<String, Object> body = mapper.readValue(
                response.body(), new TypeReference<Map<String, Object>>(){});

            String status = (String) body.get("status");
            int progress = (int) body.get("progress");

            System.out.println("进度: " + progress + "%, 状态: " + status);

            if ("COMPLETED".equals(status)) {
                @SuppressWarnings("unchecked")
                List<String> resultUrls = (List<String>) body.get("resultUrls");
                System.out.println("生成完成！图片URL:");
                resultUrls.forEach(url -> System.out.println("  - " + url));
                completed = true;
            } else if ("FAILED".equals(status)) {
                System.out.println("生成失败: " + body.get("message"));
                completed = true;
            }

            if (!completed) {
                Thread.sleep(2000);  // 等待 2 秒后再查询
            }

            attempts++;
        }

        if (!completed) {
            System.out.println("查询超时");
        }
    }
}
```

#### 2.3 使用 Python 轮询

```python
import requests
import time

task_id = "gen-20260318-a1b2c3d4e5f6"
user_id = "123"

headers = {"X-User-Id": user_id}
url = f"http://localhost:8080/api/ai/portrait/progress/{task_id}"

completed = False
attempts = 0
max_attempts = 60

while not completed and attempts < max_attempts:
    response = requests.get(url, headers=headers)
    data = response.json()

    status = data.get("status")
    progress = data.get("progress")

    print(f"进度: {progress}%, 状态: {status}")

    if status == "COMPLETED":
        result_urls = data.get("resultUrls", [])
        print("生成完成！图片URL:")
        for image_url in result_urls:
            print(f"  - {image_url}")
        completed = True
    elif status == "FAILED":
        print(f"生成失败: {data.get('message')}")
        completed = True

    if not completed:
        time.sleep(2)  # 等待 2 秒后再查询

    attempts += 1

if not completed:
    print("查询超时")
```

---

## 高级用法

### 3. 指定种子值生成一致的结果

```bash
# 第一次生成（种子为 12345）
curl -X POST http://localhost:8080/api/ai/portrait/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123" \
  -d '{
    "prompt": "一个年轻女性角色，长棕发，穿着蓝色和服",
    "provider": "volcengine",
    "model": "doubao-seedream-5-0-lite",
    "width": 1024,
    "height": 1024,
    "generateCount": 1,
    "seed": 12345
  }'

# 第二次生成（相同的种子和提示词，会生成完全相同的图片）
curl -X POST http://localhost:8080/api/ai/portrait/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123" \
  -d '{
    "prompt": "一个年轻女性角色，长棕发，穿着蓝色和服",
    "provider": "volcengine",
    "model": "doubao-seedream-5-0-lite",
    "width": 1024,
    "height": 1024,
    "generateCount": 1,
    "seed": 12345
  }'
```

### 4. 生成多个版本（组图生成）

```bash
curl -X POST http://localhost:8080/api/ai/portrait/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123" \
  -d '{
    "prompt": "一个年轻女性角色，长棕发，穿着蓝色和服",
    "provider": "volcengine",
    "model": "doubao-seedream-5-0-lite",
    "width": 1024,
    "height": 1024,
    "generateCount": 4
  }'
```

响应会返回 taskId，查询进度时会获得 4 张相关的图片。

### 5. 使用专业版模型生成高质量图片

```bash
curl -X POST http://localhost:8080/api/ai/portrait/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123" \
  -d '{
    "prompt": "一个年轻女性角色，长棕发，穿着蓝色和服，精致的脸部特征，大眼睛，微笑表情，动漫风格，高清，8K，完美光影，专业渲染",
    "provider": "volcengine",
    "model": "doubao-seedream-5-0-260128",
    "width": 1024,
    "height": 1024,
    "generateCount": 1
  }'
```

### 6. 不同的图片尺寸

#### 小尺寸（快速）
```json
{
  "width": 512,
  "height": 512
}
```

#### 标准尺寸（推荐）
```json
{
  "width": 1024,
  "height": 1024
}
```

#### 高清（较慢）
```json
{
  "width": 1536,
  "height": 1536
}
```

#### 超高清（最慢）
```json
{
  "width": 2048,
  "height": 2048
}
```

---

## 错误处理

### 7. 处理请求错误

#### 7.1 Java 实现

```java
public class DoubaoErrorHandling {

    public static void main(String[] args) {
        try {
            // 生成请求...

        } catch (IllegalArgumentException e) {
            System.out.println("参数错误 (400): " + e.getMessage());
            // 检查提示词、尺寸等参数

        } catch (HttpTimeoutException e) {
            System.out.println("请求超时: " + e.getMessage());
            // 增加超时时间或检查网络连接

        } catch (HttpConnectException e) {
            System.out.println("连接失败: " + e.getMessage());
            // 检查服务是否启动

        } catch (Exception e) {
            System.out.println("未知错误: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
```

#### 7.2 Python 实现

```python
import requests

try:
    response = requests.post(
        "http://localhost:8080/api/ai/portrait/generate",
        json={...},
        headers={"X-User-Id": "123"},
        timeout=30
    )

    if response.status_code == 202:
        print("成功创建任务")
    elif response.status_code == 400:
        print("参数错误: " + response.json()["message"])
    elif response.status_code == 401:
        print("API Key 无效")
    elif response.status_code == 429:
        print("请求过于频繁")
    elif response.status_code == 500:
        print("服务器错误")

except requests.exceptions.Timeout:
    print("请求超时")
except requests.exceptions.ConnectionError:
    print("连接失败，请检查服务是否启动")
except Exception as e:
    print(f"未知错误: {e}")
```

### 8. 重试机制

#### 8.1 Java 实现

```java
public class DoubaoRetryExample {

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_DELAY = 1000;  // 1 秒

    public static void generateWithRetry(String prompt,
                                         String taskId)
            throws Exception {
        int attempts = 0;
        long delay = INITIAL_DELAY;

        while (attempts < MAX_RETRIES) {
            try {
                // 发送请求
                HttpClient client = HttpClient.newHttpClient();
                HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI(
                        "http://localhost:8080/api/ai/portrait/generate"))
                    .header("Content-Type", "application/json")
                    .header("X-User-Id", "123")
                    .POST(HttpRequest.BodyPublishers.ofString(
                        "{\"prompt\": \"" + prompt + "\"}"))
                    .build();

                HttpResponse<String> response = client.send(request,
                    HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 202) {
                    System.out.println("成功");
                    return;
                }

            } catch (Exception e) {
                attempts++;

                if (attempts < MAX_RETRIES) {
                    System.out.println(
                        "第 " + attempts + " 次尝试失败，" +
                        delay + "ms 后重试");
                    Thread.sleep(delay);
                    delay *= 2;  // 指数退避
                } else {
                    throw e;
                }
            }
        }
    }
}
```

#### 8.2 Python 实现

```python
import requests
import time

def generate_with_retry(prompt, max_retries=3):
    url = "http://localhost:8080/api/ai/portrait/generate"
    headers = {
        "Content-Type": "application/json",
        "X-User-Id": "123"
    }

    delay = 1000  # 初始延迟 1 秒

    for attempt in range(max_retries):
        try:
            response = requests.post(
                url,
                json={"prompt": prompt},
                headers=headers,
                timeout=30
            )

            if response.status_code == 202:
                print("成功")
                return response.json()

        except Exception as e:
            attempt += 1

            if attempt < max_retries:
                print(f"第 {attempt} 次尝试失败，{delay}ms 后重试")
                time.sleep(delay / 1000)
                delay *= 2  # 指数退避
            else:
                raise
```

---

## 性能优化

### 9. 批量生成任务

```python
import requests
import concurrent.futures

def generate_portrait(prompt, seed=None):
    """生成单个肖像"""
    response = requests.post(
        "http://localhost:8080/api/ai/portrait/generate",
        json={
            "prompt": prompt,
            "provider": "volcengine",
            "model": "doubao-seedream-5-0-lite",
            "width": 1024,
            "height": 1024,
            "seed": seed
        },
        headers={"X-User-Id": "123"}
    )
    return response.json()

# 并发生成多个任务
prompts = [
    "一个年轻女性角色，长棕发",
    "一个年轻男性角色，黑发",
    "一个可爱的小女孩，金发"
]

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(generate_portrait, prompts))

print("已创建 " + str(len(results)) + " 个任务")
for result in results:
    print(f"Task ID: {result['taskId']}")
```

### 10. 缓存相同提示词的结果

```java
import java.util.HashMap;
import java.util.Map;

public class DoubaoCache {

    private static final Map<String, CacheEntry> cache =
        new HashMap<>();
    private static final long CACHE_DURATION = 24 * 60 * 60 * 1000;  // 24 小时

    static class CacheEntry {
        long timestamp;
        List<String> imageUrls;

        CacheEntry(List<String> imageUrls) {
            this.timestamp = System.currentTimeMillis();
            this.imageUrls = imageUrls;
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_DURATION;
        }
    }

    public static List<String> generatePortrait(String prompt,
                                                  String seed) {
        String cacheKey = prompt + "_" + seed;

        // 检查缓存
        if (cache.containsKey(cacheKey)) {
            CacheEntry entry = cache.get(cacheKey);
            if (!entry.isExpired()) {
                System.out.println("从缓存返回结果");
                return entry.imageUrls;
            }
        }

        // 生成新的结果
        List<String> imageUrls = generateFromVolcengine(prompt, seed);

        // 保存到缓存
        cache.put(cacheKey, new CacheEntry(imageUrls));

        return imageUrls;
    }

    private static List<String> generateFromVolcengine(
            String prompt, String seed) {
        // 调用火山引擎 API...
        return new ArrayList<>();
    }
}
```

### 11. 速率限制

```java
import java.util.concurrent.Semaphore;

public class RateLimiter {

    private final Semaphore semaphore;
    private final long resetInterval;
    private long lastResetTime;

    public RateLimiter(int requestsPerSecond) {
        this.semaphore = new Semaphore(requestsPerSecond);
        this.resetInterval = 1000;  // 1 秒
        this.lastResetTime = System.currentTimeMillis();
    }

    public void acquire() throws InterruptedException {
        // 检查是否需要重置
        long now = System.currentTimeMillis();
        if (now - lastResetTime >= resetInterval) {
            semaphore.drainPermits();
            semaphore.release(semaphore.availablePermits() + 10);
            lastResetTime = now;
        }

        // 获取许可证
        semaphore.acquire();
    }

    public static void main(String[] args) throws InterruptedException {
        RateLimiter limiter = new RateLimiter(10);  // 每秒 10 个请求

        for (int i = 0; i < 100; i++) {
            limiter.acquire();
            System.out.println("请求 " + (i + 1));
        }
    }
}
```

---

## 常见问题

### Q: 如何获取最高质量的图片？

**A**:
1. 使用专业版模型: `doubao-seedream-5-0-260128`
2. 使用高分辨率: 1024×1024 或更高
3. 编写详细的提示词，包含风格描述
4. 示例提示词: "一个年轻女性角色，长棕色头发，穿着蓝色和服，精致的脸部特征，大眼睛，微笑表情，动漫风格，高清，8K，完美光影，专业渲染"

### Q: 如何控制生成成本？

**A**:
1. 在开发环境使用轻量版: `doubao-seedream-5-0-lite`
2. 使用较小的图片尺寸（512×512）
3. 合理控制生成数量

### Q: 生成失败如何处理？

**A**: 系统会自动重试，重试配置可在配置文件中调整。如果多次失败，请检查：
1. API Key 是否正确
2. 提示词是否合法
3. 网络连接是否正常
4. 服务是否正常运行

### Q: 支持的最大并发数是多少？

**A**: 取决于火山引擎的 API 限额（通常为 10-100 QPS），建议配置 5-20 并发任务。

---

## 相关资源

- [豆包模型官方文档](https://www.volcengine.com/docs/82379/1824121)
- [火山引擎方舟平台](https://console.volcengine.com/ark)
- [项目集成指南](./DOUBAN_MODEL_INTEGRATION_GUIDE.md)
- [集成总结](火山引擎豆包模型集成总结.md)

---

**最后更新**: 2026年3月18日

