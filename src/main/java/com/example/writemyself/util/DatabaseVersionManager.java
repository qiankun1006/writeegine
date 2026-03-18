package com.example.writemyself.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import javax.annotation.PostConstruct;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 数据库版本管理工具类
 * 用于管理数据库迁移和版本控制
 */
@Component
public class DatabaseVersionManager {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseVersionManager.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DatabaseConnectionTester connectionTester;

    // 版本表名称
    private static final String VERSION_TABLE = "database_version";

    // 当前数据库版本
    private static final int CURRENT_VERSION = 2;

    /**
     * 初始化时检查数据库版本
     */
    @PostConstruct
    public void init() {
        try {
            logger.info("开始检查数据库版本...");

            // 检查数据库连接
            if (!connectionTester.testConnection()) {
                logger.error("数据库连接失败，跳过版本检查");
                return;
            }

            // 检查版本表是否存在
            if (!checkVersionTableExists()) {
                logger.info("版本表不存在，创建版本表");
                createVersionTable();
            }

            // 获取当前数据库版本
            int dbVersion = getCurrentDatabaseVersion();
            logger.info("当前数据库版本: {}, 目标版本: {}", dbVersion, CURRENT_VERSION);

            // 如果需要升级
            if (dbVersion < CURRENT_VERSION) {
                logger.info("开始数据库升级，从版本 {} 升级到版本 {}", dbVersion, CURRENT_VERSION);
                upgradeDatabase(dbVersion, CURRENT_VERSION);
                logger.info("数据库升级完成");
            } else if (dbVersion > CURRENT_VERSION) {
                logger.warn("数据库版本 {} 高于应用版本 {}，可能需要降级或更新应用", dbVersion, CURRENT_VERSION);
            } else {
                logger.info("数据库版本已是最新，无需升级");
            }

            // 验证数据库结构
            validateDatabaseStructure();

        } catch (Exception e) {
            logger.error("数据库版本检查失败", e);
        }
    }

    /**
     * 检查版本表是否存在
     */
    private boolean checkVersionTableExists() {
        try {
            String sql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, VERSION_TABLE);
            return count != null && count > 0;
        } catch (Exception e) {
            logger.debug("检查版本表时发生异常（可能表不存在）", e);
            return false;
        }
    }

    /**
     * 创建版本表
     */
    private void createVersionTable() {
        String sql = "CREATE TABLE " + VERSION_TABLE + " (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "version INT NOT NULL, " +
                "description VARCHAR(500), " +
                "script_name VARCHAR(255), " +
                "executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "execution_time_ms BIGINT, " +
                "status VARCHAR(20) DEFAULT 'SUCCESS', " +
                "error_message TEXT" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        jdbcTemplate.execute(sql);
        logger.info("版本表创建成功: {}", VERSION_TABLE);
    }

    /**
     * 获取当前数据库版本
     */
    private int getCurrentDatabaseVersion() {
        try {
            String sql = "SELECT MAX(version) FROM " + VERSION_TABLE + " WHERE status = 'SUCCESS'";
            Integer maxVersion = jdbcTemplate.queryForObject(sql, Integer.class);
            return maxVersion != null ? maxVersion : 0;
        } catch (Exception e) {
            logger.warn("获取数据库版本失败，返回版本0", e);
            return 0;
        }
    }

    /**
     * 升级数据库
     */
    private void upgradeDatabase(int fromVersion, int toVersion) {
        for (int version = fromVersion + 1; version <= toVersion; version++) {
            try {
                logger.info("执行版本 {} 升级脚本", version);
                executeUpgradeScript(version);
                logger.info("版本 {} 升级完成", version);
            } catch (Exception e) {
                logger.error("版本 {} 升级失败", version, e);
                // 记录失败信息
                recordVersionExecution(version, "FAILED", "升级脚本执行失败: " + e.getMessage(), 0);
                throw new RuntimeException("数据库升级失败，版本: " + version, e);
            }
        }
    }

    /**
     * 执行升级脚本
     */
    private void executeUpgradeScript(int version) {
        String scriptName = "V" + version + "__upgrade.sql";
        long startTime = System.currentTimeMillis();

        try {
            // 读取SQL脚本
            String sqlScript = readSqlScript(scriptName);
            if (sqlScript == null || sqlScript.trim().isEmpty()) {
                logger.warn("升级脚本 {} 为空或不存在，跳过", scriptName);
                recordVersionExecution(version, "SKIPPED", "脚本为空或不存在", 0);
                return;
            }

            // 执行SQL脚本
            jdbcTemplate.execute(sqlScript);

            long executionTime = System.currentTimeMillis() - startTime;

            // 记录执行成功
            recordVersionExecution(version, "SUCCESS", null, executionTime);

            logger.info("升级脚本 {} 执行成功，耗时: {}ms", scriptName, executionTime);

        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            recordVersionExecution(version, "FAILED", e.getMessage(), executionTime);
            throw e;
        }
    }

    /**
     * 读取SQL脚本文件
     */
    private String readSqlScript(String scriptName) {
        try {
            ClassPathResource resource = new ClassPathResource("db/migration/" + scriptName);
            if (!resource.exists()) {
                logger.debug("SQL脚本文件不存在: {}", scriptName);
                return null;
            }

            return FileCopyUtils.copyToString(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            logger.error("读取SQL脚本失败: {}", scriptName, e);
            return null;
        }
    }

    /**
     * 记录版本执行信息
     */
    private void recordVersionExecution(int version, String status, String errorMessage, long executionTime) {
        String description = getVersionDescription(version);
        String scriptName = "V" + version + "__upgrade.sql";

        String sql = "INSERT INTO " + VERSION_TABLE + " (version, description, script_name, execution_time_ms, status, error_message) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";

        jdbcTemplate.update(sql, version, description, scriptName, executionTime, status, errorMessage);
    }

    /**
     * 获取版本描述
     */
    private String getVersionDescription(int version) {
        switch (version) {
            case 1:
                return "初始版本 - 创建核心表结构";
            case 2:
                return "数据初始化 - 插入测试数据和基础配置";
            case 3:
                return "功能增强 - 添加用户权限和审计功能";
            case 4:
                return "性能优化 - 添加索引和分区";
            default:
                return "版本 " + version + " 升级";
        }
    }

    /**
     * 验证数据库结构
     */
    private void validateDatabaseStructure() {
        try {
            logger.info("开始验证数据库结构...");

            List<String> requiredTables = Arrays.asList("game", "ai_portrait_task", "ai_portrait_generation", "user", "system_config");
            List<String> missingTables = new ArrayList<>();

            for (String table : requiredTables) {
                if (!checkTableExists(table)) {
                    missingTables.add(table);
                }
            }

            if (!missingTables.isEmpty()) {
                logger.warn("以下表不存在: {}", missingTables);
                // 这里可以触发自动创建缺失的表
                // createMissingTables(missingTables);
            } else {
                logger.info("数据库结构验证通过，所有必需表都存在");
            }

            // 验证表结构
            validateTableColumns();

        } catch (Exception e) {
            logger.error("数据库结构验证失败", e);
        }
    }

    /**
     * 检查表是否存在
     */
    private boolean checkTableExists(String tableName) {
        try {
            String sql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName);
            return count != null && count > 0;
        } catch (Exception e) {
            logger.debug("检查表 {} 时发生异常", tableName, e);
            return false;
        }
    }

    /**
     * 验证表列结构
     */
    private void validateTableColumns() {
        try {
            // 验证game表的必需列
            validateTableColumns("game", Arrays.asList("id", "name", "type", "created_at", "updated_at"));

            // 验证ai_portrait_task表的必需列
            validateTableColumns("ai_portrait_task", Arrays.asList("id", "task_id", "status", "created_at", "updated_at"));

            logger.info("表列结构验证完成");

        } catch (Exception e) {
            logger.error("表列结构验证失败", e);
        }
    }

    /**
     * 验证表的必需列
     */
    private void validateTableColumns(String tableName, List<String> requiredColumns) {
        try {
            String sql = "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?";
            List<String> existingColumns = jdbcTemplate.queryForList(sql, String.class, tableName);

            List<String> missingColumns = new ArrayList<>();
            for (String column : requiredColumns) {
                if (!existingColumns.contains(column)) {
                    missingColumns.add(column);
                }
            }

            if (!missingColumns.isEmpty()) {
                logger.warn("表 {} 缺少以下列: {}", tableName, missingColumns);
            } else {
                logger.debug("表 {} 列结构验证通过", tableName);
            }

        } catch (Exception e) {
            logger.error("验证表 {} 列结构失败", tableName, e);
        }
    }

    /**
     * 获取数据库版本历史
     */
    public List<VersionHistory> getVersionHistory() {
        String sql = "SELECT version, description, script_name, executed_at, execution_time_ms, status, error_message " +
                     "FROM " + VERSION_TABLE + " ORDER BY version DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            VersionHistory history = new VersionHistory();
            history.setVersion(rs.getInt("version"));
            history.setDescription(rs.getString("description"));
            history.setScriptName(rs.getString("script_name"));
            history.setExecutedAt(rs.getTimestamp("executed_at").toLocalDateTime());
            history.setExecutionTimeMs(rs.getLong("execution_time_ms"));
            history.setStatus(rs.getString("status"));
            history.setErrorMessage(rs.getString("error_message"));
            return history;
        });
    }

    /**
     * 获取数据库信息
     */
    public DatabaseInfo getDatabaseInfo() {
        DatabaseInfo info = new DatabaseInfo();

        try (Connection connection = jdbcTemplate.getDataSource().getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();

            info.setDatabaseProductName(metaData.getDatabaseProductName());
            info.setDatabaseProductVersion(metaData.getDatabaseProductVersion());
            info.setDriverName(metaData.getDriverName());
            info.setDriverVersion(metaData.getDriverVersion());
            info.setUrl(metaData.getURL());
            info.setUserName(metaData.getUserName());

            // 获取表数量
            String tableCountSql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()";
            info.setTableCount(jdbcTemplate.queryForObject(tableCountSql, Integer.class));

            // 获取当前版本
            info.setCurrentVersion(getCurrentDatabaseVersion());
            info.setTargetVersion(CURRENT_VERSION);
            info.setLastChecked(LocalDateTime.now());

        } catch (Exception e) {
            logger.error("获取数据库信息失败", e);
            info.setError(e.getMessage());
        }

        return info;
    }

    /**
     * 版本历史记录
     */
    public static class VersionHistory {
        private int version;
        private String description;
        private String scriptName;
        private LocalDateTime executedAt;
        private long executionTimeMs;
        private String status;
        private String errorMessage;

        // Getters and Setters
        public int getVersion() { return version; }
        public void setVersion(int version) { this.version = version; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getScriptName() { return scriptName; }
        public void setScriptName(String scriptName) { this.scriptName = scriptName; }

        public LocalDateTime getExecutedAt() { return executedAt; }
        public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }

        public long getExecutionTimeMs() { return executionTimeMs; }
        public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }

    /**
     * 数据库信息
     */
    public static class DatabaseInfo {
        private String databaseProductName;
        private String databaseProductVersion;
        private String driverName;
        private String driverVersion;
        private String url;
        private String userName;
        private Integer tableCount;
        private int currentVersion;
        private int targetVersion;
        private LocalDateTime lastChecked;
        private String error;

        // Getters and Setters
        public String getDatabaseProductName() { return databaseProductName; }
        public void setDatabaseProductName(String databaseProductName) { this.databaseProductName = databaseProductName; }

        public String getDatabaseProductVersion() { return databaseProductVersion; }
        public void setDatabaseProductVersion(String databaseProductVersion) { this.databaseProductVersion = databaseProductVersion; }

        public String getDriverName() { return driverName; }
        public void setDriverName(String driverName) { this.driverName = driverName; }

        public String getDriverVersion() { return driverVersion; }
        public void setDriverVersion(String driverVersion) { this.driverVersion = driverVersion; }

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public Integer getTableCount() { return tableCount; }
        public void setTableCount(Integer tableCount) { this.tableCount = tableCount; }

        public int getCurrentVersion() { return currentVersion; }
        public void setCurrentVersion(int currentVersion) { this.currentVersion = currentVersion; }

        public int getTargetVersion() { return targetVersion; }
        public void setTargetVersion(int targetVersion) { this.targetVersion = targetVersion; }

        public LocalDateTime getLastChecked() { return lastChecked; }
        public void setLastChecked(LocalDateTime lastChecked) { this.lastChecked = lastChecked; }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
}

