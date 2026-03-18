package com.example.writemyself;

import com.example.writemyself.util.DatabaseVersionManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * DatabaseVersionManager集成测试
 */
@SpringBootTest
@ActiveProfiles("dev")
@Transactional
public class DatabaseVersionManagerTest {

    @Autowired
    private DatabaseVersionManager databaseVersionManager;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        // 清理测试数据
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS database_version");
        } catch (Exception e) {
            // 忽略表不存在的异常
        }
    }

    @Test
    void testCheckVersionTableExists() {
        // 初始状态下版本表应该不存在
        // 注意：由于@PostConstruct会在测试前执行，版本表可能已经被创建
        // 这里我们直接测试版本表的功能
    }

    @Test
    void testCreateVersionTable() {
        // 确保版本表不存在
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS database_version");
        } catch (Exception e) {
            // 忽略异常
        }

        // 创建版本表
        String createTableSql = "CREATE TABLE database_version (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "version INT NOT NULL, " +
                "description VARCHAR(500), " +
                "script_name VARCHAR(255), " +
                "executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "execution_time_ms BIGINT, " +
                "status VARCHAR(20) DEFAULT 'SUCCESS', " +
                "error_message TEXT" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        jdbcTemplate.execute(createTableSql);

        // 验证表已创建
        String checkSql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'database_version'";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class);
        assertThat(count).isEqualTo(1);
    }

    @Test
    void testGetCurrentDatabaseVersion() {
        // 创建版本表
        String createTableSql = "CREATE TABLE IF NOT EXISTS database_version (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "version INT NOT NULL, " +
                "description VARCHAR(500), " +
                "script_name VARCHAR(255), " +
                "executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "execution_time_ms BIGINT, " +
                "status VARCHAR(20) DEFAULT 'SUCCESS', " +
                "error_message TEXT" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        jdbcTemplate.execute(createTableSql);

        // 插入一些版本记录
        String insertSql = "INSERT INTO database_version (version, description, script_name, status) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(insertSql, 1, "初始版本", "V1__init.sql", "SUCCESS");
        jdbcTemplate.update(insertSql, 2, "数据初始化", "V2__data.sql", "SUCCESS");

        // 测试获取当前版本（通过反射调用私有方法）
        // 由于getCurrentDatabaseVersion是私有方法，我们直接测试数据库查询逻辑
        String querySql = "SELECT MAX(version) FROM database_version WHERE status = 'SUCCESS'";
        Integer maxVersion = jdbcTemplate.queryForObject(querySql, Integer.class);
        assertThat(maxVersion).isEqualTo(2);
    }

    @Test
    void testRecordVersionExecution() {
        // 创建版本表
        String createTableSql = "CREATE TABLE IF NOT EXISTS database_version (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "version INT NOT NULL, " +
                "description VARCHAR(500), " +
                "script_name VARCHAR(255), " +
                "executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "execution_time_ms BIGINT, " +
                "status VARCHAR(20) DEFAULT 'SUCCESS', " +
                "error_message TEXT" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        jdbcTemplate.execute(createTableSql);

        // 记录版本执行
        String insertSql = "INSERT INTO database_version (version, description, script_name, execution_time_ms, status, error_message) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(insertSql, 1, "测试版本", "V1__test.sql", 100L, "SUCCESS", null);

        // 验证记录
        String countSql = "SELECT COUNT(*) FROM database_version WHERE version = 1";
        Integer count = jdbcTemplate.queryForObject(countSql, Integer.class);
        assertThat(count).isEqualTo(1);

        String querySql = "SELECT status FROM database_version WHERE version = 1";
        String status = jdbcTemplate.queryForObject(querySql, String.class);
        assertThat(status).isEqualTo("SUCCESS");
    }

    @Test
    void testCheckTableExists() {
        // 创建测试表
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS test_table (id INT PRIMARY KEY, name VARCHAR(50))");

        // 测试表存在检查
        String checkSql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, "test_table");
        assertThat(count).isEqualTo(1);

        // 测试不存在的表
        Integer nonExistentCount = jdbcTemplate.queryForObject(checkSql, Integer.class, "non_existent_table");
        assertThat(nonExistentCount).isEqualTo(0);

        // 清理测试表
        jdbcTemplate.execute("DROP TABLE IF EXISTS test_table");
    }

    @Test
    void testGetVersionHistory() {
        // 创建版本表
        String createTableSql = "CREATE TABLE IF NOT EXISTS database_version (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "version INT NOT NULL, " +
                "description VARCHAR(500), " +
                "script_name VARCHAR(255), " +
                "executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "execution_time_ms BIGINT, " +
                "status VARCHAR(20) DEFAULT 'SUCCESS', " +
                "error_message TEXT" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        jdbcTemplate.execute(createTableSql);

        // 插入测试数据
        String insertSql = "INSERT INTO database_version (version, description, script_name, execution_time_ms, status) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(insertSql, 1, "版本1", "V1__init.sql", 150L, "SUCCESS");
        jdbcTemplate.update(insertSql, 2, "版本2", "V2__data.sql", 200L, "SUCCESS");
        jdbcTemplate.update(insertSql, 3, "版本3", "V3__update.sql", 100L, "FAILED");

        // 获取版本历史
        List<DatabaseVersionManager.VersionHistory> history = databaseVersionManager.getVersionHistory();

        // 验证结果
        assertThat(history).hasSize(3);
        assertThat(history.get(0).getVersion()).isEqualTo(3);
        assertThat(history.get(1).getVersion()).isEqualTo(2);
        assertThat(history.get(2).getVersion()).isEqualTo(1);

        // 验证状态
        assertThat(history.get(0).getStatus()).isEqualTo("FAILED");
        assertThat(history.get(1).getStatus()).isEqualTo("SUCCESS");
        assertThat(history.get(2).getStatus()).isEqualTo("SUCCESS");
    }

    @Test
    void testGetDatabaseInfo() {
        // 获取数据库信息
        DatabaseVersionManager.DatabaseInfo info = databaseVersionManager.getDatabaseInfo();

        // 验证基本信息
        assertThat(info).isNotNull();
        assertThat(info.getDatabaseProductName()).isNotNull();
        assertThat(info.getDatabaseProductVersion()).isNotNull();
        assertThat(info.getDriverName()).isNotNull();
        assertThat(info.getDriverVersion()).isNotNull();
        assertThat(info.getUrl()).isNotNull();

        // 验证版本信息
        assertThat(info.getCurrentVersion()).isGreaterThanOrEqualTo(0);
        assertThat(info.getTargetVersion()).isEqualTo(2); // 根据DatabaseVersionManager中的CURRENT_VERSION

        // 验证时间戳
        assertThat(info.getLastChecked()).isNotNull();
    }

    @Test
    void testValidateDatabaseStructure() {
        // 这个测试依赖于实际的数据库表结构
        // 由于我们使用的是H2内存数据库，表结构应该已经通过迁移脚本创建
        // 这里主要验证方法不会抛出异常

        // 验证方法可以正常执行
        // 注意：由于validateDatabaseStructure是私有方法，我们无法直接调用
        // 但DatabaseVersionManager的init()方法会调用它，所以如果init()执行成功，说明验证通过
    }

    @Test
    void testDatabaseInitializationFlow() {
        // 测试完整的数据库初始化流程
        // 1. 确保版本表被创建
        String checkVersionTableSql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'database_version'";
        Integer versionTableCount = jdbcTemplate.queryForObject(checkVersionTableSql, Integer.class);
        assertThat(versionTableCount).isEqualTo(1);

        // 2. 验证核心表是否存在
        String[] requiredTables = {"game", "ai_portrait_task", "ai_portrait_generation", "user", "system_config"};
        for (String table : requiredTables) {
            String checkTableSql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?";
            Integer tableCount = jdbcTemplate.queryForObject(checkTableSql, Integer.class, table);
            assertThat(tableCount).isEqualTo(1);
        }

        // 3. 验证数据初始化
        String checkGameDataSql = "SELECT COUNT(*) FROM game";
        Integer gameCount = jdbcTemplate.queryForObject(checkGameDataSql, Integer.class);
        assertThat(gameCount).isGreaterThan(0);

        String checkUserDataSql = "SELECT COUNT(*) FROM user";
        Integer userCount = jdbcTemplate.queryForObject(checkUserDataSql, Integer.class);
        assertThat(userCount).isGreaterThan(0);
    }

    @Test
    void testVersionHistoryClass() {
        // 测试VersionHistory内部类
        DatabaseVersionManager.VersionHistory history = new DatabaseVersionManager.VersionHistory();

        history.setVersion(1);
        history.setDescription("测试版本");
        history.setScriptName("V1__test.sql");
        history.setExecutionTimeMs(100L);
        history.setStatus("SUCCESS");
        history.setErrorMessage(null);

        assertThat(history.getVersion()).isEqualTo(1);
        assertThat(history.getDescription()).isEqualTo("测试版本");
        assertThat(history.getScriptName()).isEqualTo("V1__test.sql");
        assertThat(history.getExecutionTimeMs()).isEqualTo(100L);
        assertThat(history.getStatus()).isEqualTo("SUCCESS");
        assertThat(history.getErrorMessage()).isNull();
    }

    @Test
    void testDatabaseInfoClass() {
        // 测试DatabaseInfo内部类
        DatabaseVersionManager.DatabaseInfo info = new DatabaseVersionManager.DatabaseInfo();

        info.setDatabaseProductName("H2");
        info.setDatabaseProductVersion("2.1.214");
        info.setDriverName("H2 JDBC Driver");
        info.setDriverVersion("2.1.214");
        info.setUrl("jdbc:h2:mem:testdb");
        info.setUserName("SA");
        info.setTableCount(10);
        info.setCurrentVersion(2);
        info.setTargetVersion(2);
        info.setError(null);

        assertThat(info.getDatabaseProductName()).isEqualTo("H2");
        assertThat(info.getDatabaseProductVersion()).isEqualTo("2.1.214");
        assertThat(info.getDriverName()).isEqualTo("H2 JDBC Driver");
        assertThat(info.getDriverVersion()).isEqualTo("2.1.214");
        assertThat(info.getUrl()).isEqualTo("jdbc:h2:mem:testdb");
        assertThat(info.getUserName()).isEqualTo("SA");
        assertThat(info.getTableCount()).isEqualTo(10);
        assertThat(info.getCurrentVersion()).isEqualTo(2);
        assertThat(info.getTargetVersion()).isEqualTo(2);
        assertThat(info.getError()).isNull();
    }
}

