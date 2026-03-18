package com.example.writemyself.controller;

import com.example.writemyself.util.DatabaseConnectionTester;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 数据库健康检查控制器
 * 提供REST API用于测试数据库连接状态
 */
@RestController
@RequestMapping("/api/database")
public class DatabaseHealthController {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseHealthController.class);

    @Autowired
    private DatabaseConnectionTester databaseConnectionTester;

    @Autowired
    private HealthEndpoint healthEndpoint;

    /**
     * 测试数据库连接
     */
    @GetMapping("/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection() {
        logger.info("收到数据库连接测试请求");

        Map<String, Object> response = new HashMap<>();

        try {
            boolean connectionTest = databaseConnectionTester.testConnection();
            boolean queryTest = databaseConnectionTester.testQuery();

            response.put("success", true);
            response.put("connectionTest", connectionTest);
            response.put("queryTest", queryTest);
            response.put("overallStatus", connectionTest && queryTest ? "健康" : "异常");
            response.put("timestamp", System.currentTimeMillis());
            response.put("databaseType", databaseConnectionTester.getDatabaseType());

            logger.info("数据库连接测试完成: {}", response);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("数据库连接测试异常", e);

            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 获取数据库详细信息
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getDatabaseInfo() {
        logger.info("收到数据库信息查询请求");

        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> dbInfo = databaseConnectionTester.getDatabaseInfo();
            Map<String, Object> poolStatus = databaseConnectionTester.getConnectionPoolStatus();

            response.put("success", true);
            response.put("databaseInfo", dbInfo);
            response.put("connectionPoolStatus", poolStatus);
            response.put("timestamp", System.currentTimeMillis());

            logger.info("数据库信息查询完成");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("数据库信息查询异常", e);

            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 综合健康检查
     */
    @GetMapping("/health-check")
    public ResponseEntity<Map<String, Object>> comprehensiveHealthCheck() {
        logger.info("收到综合健康检查请求");

        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> healthCheck = databaseConnectionTester.comprehensiveHealthCheck();

            response.put("success", true);
            response.put("healthCheck", healthCheck);
            response.put("timestamp", System.currentTimeMillis());

            // 添加Spring Boot Actuator的健康状态
            HealthComponent healthComponent = healthEndpoint.health();
            response.put("actuatorHealth", healthComponent.getStatus().getCode());

            logger.info("综合健康检查完成");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("综合健康检查异常", e);

            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 检查数据库功能支持
     */
    @GetMapping("/features")
    public ResponseEntity<Map<String, Object>> checkDatabaseFeatures() {
        logger.info("收到数据库功能检查请求");

        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Boolean> features = new HashMap<>();

            features.put("transactions", databaseConnectionTester.supportsFeature("transactions"));
            features.put("batchUpdates", databaseConnectionTester.supportsFeature("batchupdates"));
            features.put("storedProcedures", databaseConnectionTester.supportsFeature("storedprocedures"));
            features.put("outerJoins", databaseConnectionTester.supportsFeature("outerjoins"));

            response.put("success", true);
            response.put("features", features);
            response.put("databaseType", databaseConnectionTester.getDatabaseType());
            response.put("timestamp", System.currentTimeMillis());

            logger.info("数据库功能检查完成: {}", features);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("数据库功能检查异常", e);

            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 快速健康检查（轻量级）
     */
    @GetMapping("/quick-health")
    public ResponseEntity<Map<String, Object>> quickHealthCheck() {
        logger.info("收到快速健康检查请求");

        Map<String, Object> response = new HashMap<>();

        try {
            boolean connectionTest = databaseConnectionTester.testConnection();

            response.put("success", true);
            response.put("status", connectionTest ? "UP" : "DOWN");
            response.put("database", databaseConnectionTester.getDatabaseType());
            response.put("timestamp", System.currentTimeMillis());

            if (!connectionTest) {
                response.put("message", "数据库连接失败");
            }

            logger.info("快速健康检查完成: {}", response.get("status"));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("快速健康检查异常", e);

            response.put("success", false);
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 数据库连接池监控信息
     */
    @GetMapping("/pool-monitor")
    public ResponseEntity<Map<String, Object>> getConnectionPoolMonitor() {
        logger.info("收到连接池监控信息请求");

        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> poolStatus = databaseConnectionTester.getConnectionPoolStatus();

            response.put("success", true);
            response.put("poolStatus", poolStatus);
            response.put("timestamp", System.currentTimeMillis());

            // 添加性能指标
            response.put("performance", calculatePerformanceMetrics(poolStatus));

            logger.info("连接池监控信息查询完成");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("连接池监控信息查询异常", e);

            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 计算连接池性能指标
     */
    private Map<String, Object> calculatePerformanceMetrics(Map<String, Object> poolStatus) {
        Map<String, Object> metrics = new HashMap<>();

        try {
            if (poolStatus.containsKey("activeCount") && poolStatus.containsKey("maxActive")) {
                int activeCount = (int) poolStatus.get("activeCount");
                int maxActive = (int) poolStatus.get("maxActive");

                double utilizationRate = maxActive > 0 ? (activeCount * 100.0 / maxActive) : 0;
                metrics.put("utilizationRate", String.format("%.2f%%", utilizationRate));

                if (utilizationRate > 80) {
                    metrics.put("warning", "连接池使用率过高，建议增加最大连接数");
                }
            }

            if (poolStatus.containsKey("errorCount") && poolStatus.containsKey("connectCount")) {
                long errorCount = (long) poolStatus.get("errorCount");
                long connectCount = (long) poolStatus.get("connectCount");

                double errorRate = connectCount > 0 ? (errorCount * 100.0 / connectCount) : 0;
                metrics.put("errorRate", String.format("%.4f%%", errorRate));

                if (errorRate > 1) {
                    metrics.put("warning", "连接错误率过高，请检查数据库状态");
                }
            }

        } catch (Exception e) {
            logger.warn("计算连接池性能指标失败", e);
            metrics.put("error", "计算性能指标时发生异常");
        }

        return metrics;
    }
}

