package com.example.writemyself.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

/**
 * 数据库连接测试工具类
 * 用于测试数据库连接状态、获取数据库信息和执行健康检查
 */
@Component
public class DatabaseConnectionTester implements HealthIndicator {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConnectionTester.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 测试数据库连接是否正常
     */
    public boolean testConnection() {
        try (Connection connection = dataSource.getConnection()) {
            logger.info("数据库连接测试成功");
            return true;
        } catch (SQLException e) {
            logger.error("数据库连接测试失败", e);
            return false;
        }
    }

    /**
     * 获取数据库信息
     */
    public Map<String, Object> getDatabaseInfo() {
        Map<String, Object> info = new HashMap<>();

        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();

            info.put("databaseProductName", metaData.getDatabaseProductName());
            info.put("databaseProductVersion", metaData.getDatabaseProductVersion());
            info.put("driverName", metaData.getDriverName());
            info.put("driverVersion", metaData.getDriverVersion());
            info.put("url", metaData.getURL());
            info.put("userName", metaData.getUserName());
            info.put("maxConnections", metaData.getMaxConnections());
            info.put("defaultTransactionIsolation", metaData.getDefaultTransactionIsolation());

            logger.info("获取数据库信息成功: {}", info);

        } catch (SQLException e) {
            logger.error("获取数据库信息失败", e);
            info.put("error", e.getMessage());
        }

        return info;
    }

    /**
     * 执行简单的SQL查询测试
     */
    public boolean testQuery() {
        try {
            // 执行一个简单的查询
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            boolean success = result != null && result == 1;

            if (success) {
                logger.info("SQL查询测试成功");
            } else {
                logger.warn("SQL查询测试返回异常结果: {}", result);
            }

            return success;
        } catch (Exception e) {
            logger.error("SQL查询测试失败", e);
            return false;
        }
    }

    /**
     * 获取数据库连接池状态（支持 HikariCP，Druid 已禁用）
     */
    public Map<String, Object> getConnectionPoolStatus() {
        Map<String, Object> status = new HashMap<>();

        // 检查是否为 HikariCP 数据源
        if (dataSource instanceof com.zaxxer.hikari.HikariDataSource) {
            com.zaxxer.hikari.HikariDataSource hikariDataSource = (com.zaxxer.hikari.HikariDataSource) dataSource;

            status.put("activeConnections", hikariDataSource.getHikariPoolMXBean().getActiveConnections());
            status.put("idleConnections", hikariDataSource.getHikariPoolMXBean().getIdleConnections());
            status.put("totalConnections", hikariDataSource.getHikariPoolMXBean().getTotalConnections());
            status.put("threadsAwaitingConnection", hikariDataSource.getHikariPoolMXBean().getThreadsAwaitingConnection());
            status.put("poolName", hikariDataSource.getPoolName());

            logger.info("获取 HikariCP 连接池状态成功");
        } else {
            status.put("info", "数据源不是 HikariCP 类型");
            logger.info("数据源不是 HikariCP 类型，无法获取详细的连接池状态");
        }

        return status;
    }

    /**
     * 综合健康检查
     */
    public Map<String, Object> comprehensiveHealthCheck() {
        Map<String, Object> healthCheck = new HashMap<>();

        // 测试连接
        boolean connectionTest = testConnection();
        healthCheck.put("connectionTest", connectionTest);

        // 测试查询
        boolean queryTest = testQuery();
        healthCheck.put("queryTest", queryTest);

        // 获取数据库信息
        Map<String, Object> dbInfo = getDatabaseInfo();
        healthCheck.put("databaseInfo", dbInfo);

        // 获取连接池状态
        Map<String, Object> poolStatus = getConnectionPoolStatus();
        healthCheck.put("connectionPoolStatus", poolStatus);

        // 总体健康状态
        boolean overallHealth = connectionTest && queryTest;
        healthCheck.put("overallHealth", overallHealth);
        healthCheck.put("timestamp", System.currentTimeMillis());

        logger.info("综合健康检查完成，总体状态: {}", overallHealth ? "健康" : "异常");

        return healthCheck;
    }

    /**
     * 实现HealthIndicator接口，用于Spring Boot Actuator健康检查
     */
    @Override
    public Health health() {
        Map<String, Object> healthCheck = comprehensiveHealthCheck();

        boolean overallHealth = (boolean) healthCheck.get("overallHealth");

        if (overallHealth) {
            return Health.up()
                    .withDetails(healthCheck)
                    .build();
        } else {
            return Health.down()
                    .withDetails(healthCheck)
                    .build();
        }
    }

    /**
     * 静态方法：快速测试数据库连接
     * 可用于命令行测试或初始化检查
     */
    public static boolean quickTest(DataSource dataSource) {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(5); // 5秒超时
        } catch (SQLException e) {
            logger.error("快速数据库连接测试失败", e);
            return false;
        }
    }

    /**
     * 获取数据库类型
     */
    public String getDatabaseType() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            return metaData.getDatabaseProductName();
        } catch (SQLException e) {
            logger.error("获取数据库类型失败", e);
            return "Unknown";
        }
    }

    /**
     * 检查数据库是否支持特定功能
     */
    public boolean supportsFeature(String feature) {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();

            switch (feature.toLowerCase()) {
                case "transactions":
                    return metaData.supportsTransactions();
                case "batchupdates":
                    return metaData.supportsBatchUpdates();
                case "storedprocedures":
                    return metaData.supportsStoredProcedures();
                case "outerjoins":
                    return metaData.supportsOuterJoins();
                case "fullouterjoins":
                    return metaData.supportsFullOuterJoins();
                default:
                    return false;
            }
        } catch (SQLException e) {
            logger.error("检查数据库功能支持失败: {}", feature, e);
            return false;
        }
    }
}

