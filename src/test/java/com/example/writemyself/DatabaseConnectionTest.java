package com.example.writemyself;

import com.example.writemyself.util.DatabaseConnectionTester;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 数据库连接测试
 * 测试数据库连接是否正常
 */
@SpringBootTest
@ActiveProfiles("dev") // 使用开发环境配置
class DatabaseConnectionTest {

    @Autowired
    private DatabaseConnectionTester databaseConnectionTester;

    /**
     * 测试数据库连接
     */
    @Test
    void testDatabaseConnection() {
        // 测试连接
        boolean connectionTest = databaseConnectionTester.testConnection();
        assertThat(connectionTest).isTrue();

        // 测试查询
        boolean queryTest = databaseConnectionTester.testQuery();
        assertThat(queryTest).isTrue();

        System.out.println("数据库连接测试通过");
    }

    /**
     * 测试获取数据库信息
     */
    @Test
    void testGetDatabaseInfo() {
        Map<String, Object> dbInfo = databaseConnectionTester.getDatabaseInfo();

        assertThat(dbInfo).isNotNull();
        assertThat(dbInfo).containsKey("databaseProductName");
        assertThat(dbInfo).containsKey("url");

        System.out.println("数据库信息:");
        dbInfo.forEach((key, value) -> System.out.println(key + ": " + value));
    }

    /**
     * 测试连接池状态
     */
    @Test
    void testConnectionPoolStatus() {
        Map<String, Object> poolStatus = databaseConnectionTester.getConnectionPoolStatus();

        assertThat(poolStatus).isNotNull();

        // 如果使用Druid，检查关键指标
        if (poolStatus.containsKey("activeCount")) {
            int activeCount = (int) poolStatus.get("activeCount");
            int maxActive = (int) poolStatus.get("maxActive");

            assertThat(activeCount).isGreaterThanOrEqualTo(0);
            assertThat(maxActive).isGreaterThan(0);
            assertThat(activeCount).isLessThanOrEqualTo(maxActive);
        }

        System.out.println("连接池状态:");
        poolStatus.forEach((key, value) -> System.out.println(key + ": " + value));
    }

    /**
     * 测试综合健康检查
     */
    @Test
    void testComprehensiveHealthCheck() {
        Map<String, Object> healthCheck = databaseConnectionTester.comprehensiveHealthCheck();

        assertThat(healthCheck).isNotNull();
        assertThat(healthCheck).containsKey("overallHealth");
        assertThat(healthCheck).containsKey("connectionTest");
        assertThat(healthCheck).containsKey("queryTest");

        boolean overallHealth = (boolean) healthCheck.get("overallHealth");
        assertThat(overallHealth).isTrue();

        System.out.println("综合健康检查结果:");
        healthCheck.forEach((key, value) -> {
            if (!key.equals("databaseInfo") && !key.equals("connectionPoolStatus")) {
                System.out.println(key + ": " + value);
            }
        });
    }

    /**
     * 测试数据库功能支持
     */
    @Test
    void testDatabaseFeatures() {
        // 测试事务支持
        boolean supportsTransactions = databaseConnectionTester.supportsFeature("transactions");
        assertThat(supportsTransactions).isTrue();

        // 测试批量更新支持
        boolean supportsBatchUpdates = databaseConnectionTester.supportsFeature("batchupdates");
        // 这个可能因数据库而异，不强制要求

        System.out.println("数据库功能支持:");
        System.out.println("事务支持: " + supportsTransactions);
        System.out.println("批量更新支持: " + supportsBatchUpdates);
    }

    /**
     * 测试数据库类型
     */
    @Test
    void testDatabaseType() {
        String databaseType = databaseConnectionTester.getDatabaseType();

        assertThat(databaseType).isNotNull();
        assertThat(databaseType).isNotEmpty();

        // 开发环境应该是H2
        assertThat(databaseType).containsIgnoringCase("h2");

        System.out.println("数据库类型: " + databaseType);
    }

    /**
     * 测试快速健康检查
     */
    @Test
    void testQuickHealthCheck() {
        // 这个方法主要测试快速连接检查
        // 不进行详细断言，只确保不抛出异常
        databaseConnectionTester.testConnection();
        databaseConnectionTester.testQuery();

        System.out.println("快速健康检查通过");
    }
}

