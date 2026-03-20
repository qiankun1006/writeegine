package com.example.writemyself.util;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.util.*;
import java.util.stream.Collectors;

/**
 * MyBatis Mapper 和 XML 自动生成工具
 * 根据数据库表结构自动生成对应的 Mapper 接口和 XML 映射文件
 */
public class MapperGeneratorUtil {

    private static final String JDBC_URL = "jdbc:mysql://localhost:3306/writeengine?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
    private static final String JDBC_USER = "root";
    private static final String JDBC_PASSWORD = "19961006qk";
    private static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";

    private static final String MAPPER_OUTPUT_PATH = "src/main/java/com/example/writemyself/mapper";
    private static final String XML_OUTPUT_PATH = "src/main/resources/mapper";
    private static final String MODEL_PACKAGE = "com.example.writemyself.model";
    private static final String MAPPER_PACKAGE = "com.example.writemyself.mapper";

    /**
     * 列信息类
     */
    private static class ColumnInfo {
        String columnName;
        String columnType;
        boolean isNullable;
        boolean isPrimaryKey;
        boolean isAutoIncrement;

        public String getJavaType() {
            if (columnType.toLowerCase().contains("int")) {
                return "Integer";
            } else if (columnType.toLowerCase().contains("bigint")) {
                return "Long";
            } else if (columnType.toLowerCase().contains("varchar") || columnType.toLowerCase().contains("char")) {
                return "String";
            } else if (columnType.toLowerCase().contains("datetime") || columnType.toLowerCase().contains("timestamp")) {
                return "LocalDateTime";
            } else if (columnType.toLowerCase().contains("date")) {
                return "LocalDate";
            } else if (columnType.toLowerCase().contains("decimal") || columnType.toLowerCase().contains("numeric")) {
                return "BigDecimal";
            } else if (columnType.toLowerCase().contains("double") || columnType.toLowerCase().contains("float")) {
                return "Double";
            } else if (columnType.toLowerCase().contains("boolean") || columnType.toLowerCase().contains("tinyint(1)")) {
                return "Boolean";
            } else if (columnType.toLowerCase().contains("text") || columnType.toLowerCase().contains("longtext")) {
                return "String";
            } else if (columnType.toLowerCase().contains("json")) {
                return "String";
            }
            return "String";
        }

        public String getJavaFieldName() {
            // 将数据库列名转换为 Java 字段名（驼峰命名）
            String[] parts = columnName.split("_");
            StringBuilder sb = new StringBuilder(parts[0].toLowerCase());
            for (int i = 1; i < parts.length; i++) {
                sb.append(parts[i].substring(0, 1).toUpperCase()).append(parts[i].substring(1).toLowerCase());
            }
            return sb.toString();
        }

        public String getGetterName() {
            String fieldName = getJavaFieldName();
            return "get" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
        }

        public String getSetterName() {
            String fieldName = getJavaFieldName();
            return "set" + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
        }
    }

    /**
     * 表信息类
     */
    private static class TableInfo {
        String tableName;
        String className;
        List<ColumnInfo> columns = new ArrayList<>();

        public String getTableNameCamelCase() {
            // 将表名转换为驼峰命名的类名
            String[] parts = tableName.split("_");
            StringBuilder sb = new StringBuilder();
            for (String part : parts) {
                sb.append(part.substring(0, 1).toUpperCase()).append(part.substring(1).toLowerCase());
            }
            return sb.toString();
        }

        public ColumnInfo getPrimaryKey() {
            return columns.stream().filter(c -> c.isPrimaryKey).findFirst().orElse(null);
        }
    }

    /**
     * 主入口方法
     */
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("用法: java MapperGeneratorUtil <table_name1> <table_name2> ...");
            System.out.println("示例: java MapperGeneratorUtil users orders products");
            System.out.println("\n输入表名来生成 Mapper 和 XML 文件");

            // 如果没有参数，可以使用交互模式
            Scanner scanner = new Scanner(System.in);
            System.out.print("请输入要生成的表名（逗号分隔）: ");
            String input = scanner.nextLine().trim();
            if (!input.isEmpty()) {
                String[] tables = input.split(",");
                for (String table : tables) {
                    generateMapperAndXml(table.trim());
                }
            }
            scanner.close();
        } else {
            for (String tableName : args) {
                generateMapperAndXml(tableName);
            }
        }
    }

    /**
     * 为指定表生成 Mapper 和 XML
     */
    private static void generateMapperAndXml(String tableName) {
        try {
            TableInfo tableInfo = getTableInfo(tableName);
            if (tableInfo == null) {
                System.err.println("表 " + tableName + " 不存在");
                return;
            }

            // 生成 Mapper 接口
            generateMapperInterface(tableInfo);
            System.out.println("✓ Mapper 接口已生成: " + tableInfo.className + "Mapper.java");

            // 生成 XML 文件
            generateXmlFile(tableInfo);
            System.out.println("✓ XML 文件已生成: " + tableInfo.className + "Mapper.xml");

        } catch (Exception e) {
            System.err.println("生成失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 从数据库获取表信息
     */
    private static TableInfo getTableInfo(String tableName) throws Exception {
        Class.forName(JDBC_DRIVER);

        try (Connection conn = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD)) {
            // 获取表列信息
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet columns = metaData.getColumns(null, null, tableName, null);
            ResultSet primaryKeys = metaData.getPrimaryKeys(null, null, tableName);

            Set<String> pkSet = new HashSet<>();
            while (primaryKeys.next()) {
                pkSet.add(primaryKeys.getString("COLUMN_NAME"));
            }

            TableInfo tableInfo = new TableInfo();
            tableInfo.tableName = tableName;
            tableInfo.className = tableInfo.getTableNameCamelCase();

            while (columns.next()) {
                ColumnInfo column = new ColumnInfo();
                column.columnName = columns.getString("COLUMN_NAME");
                column.columnType = columns.getString("TYPE_NAME");
                String columnSize = columns.getString("COLUMN_SIZE");
                if (columnSize != null && !columnSize.isEmpty()) {
                    column.columnType += "(" + columnSize + ")";
                }
                column.isNullable = "YES".equals(columns.getString("IS_NULLABLE"));
                column.isPrimaryKey = pkSet.contains(column.columnName);
                column.isAutoIncrement = "YES".equals(columns.getString("IS_AUTOINCREMENT"));

                tableInfo.columns.add(column);
            }

            return tableInfo;
        }
    }

    /**
     * 生成 Mapper 接口
     */
    private static void generateMapperInterface(TableInfo tableInfo) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("package ").append(MAPPER_PACKAGE).append(";\n\n");

        // 添加导入语句
        sb.append("import ").append(MODEL_PACKAGE).append(".").append(tableInfo.className).append(";\n");
        sb.append("import org.apache.ibatis.annotations.*;\n");
        sb.append("import org.springframework.stereotype.Repository;\n\n");
        sb.append("import java.util.List;\n");
        sb.append("import java.util.Map;\n\n");

        // 接口声明
        sb.append("/**\n");
        sb.append(" * ").append(tableInfo.className).append(" 数据访问 Mapper 接口\n");
        sb.append(" * 使用 MyBatis 注解和 XML 混合模式\n");
        sb.append(" */\n");
        sb.append("@Mapper\n");
        sb.append("@Repository\n");
        sb.append("public interface ").append(tableInfo.className).append("Mapper {\n\n");

        ColumnInfo pk = tableInfo.getPrimaryKey();

        // 插入方法
        sb.append("    /**\n");
        sb.append("     * 插入记录\n");
        sb.append("     */\n");
        sb.append("    @Insert(\"INSERT INTO ").append(tableInfo.tableName).append(" (\")\n");
        sb.append("            + \"").append(tableInfo.columns.stream()
                .filter(c -> !c.isAutoIncrement)
                .map(c -> c.columnName).collect(Collectors.joining(", "))).append(") \"\n");
        sb.append("            + \"VALUES (\")\n");
        sb.append("            + \"").append(tableInfo.columns.stream()
                .filter(c -> !c.isAutoIncrement)
                .map(c -> "#{" + c.getJavaFieldName() + "}").collect(Collectors.joining(", "))).append(")\"\n");
        sb.append("    )\n");
        sb.append("    int insert(").append(tableInfo.className).append(" entity);\n\n");

        // 更新方法
        sb.append("    /**\n");
        sb.append("     * 更新记录\n");
        sb.append("     */\n");
        sb.append("    @Update(\"UPDATE ").append(tableInfo.tableName).append(" SET \")\n");
        sb.append("            + \"").append(tableInfo.columns.stream()
                .filter(c -> !c.isPrimaryKey)
                .map(c -> c.columnName + " = #{" + c.getJavaFieldName() + "}")
                .collect(Collectors.joining(", "))).append(" \"\n");
        if (pk != null) {
            sb.append("            + \"WHERE ").append(pk.columnName).append(" = #{").append(pk.getJavaFieldName()).append("}\"\n");
        }
        sb.append("    )\n");
        sb.append("    int update(").append(tableInfo.className).append(" entity);\n\n");

        // 删除方法
        if (pk != null) {
            sb.append("    /**\n");
            sb.append("     * 根据主键删除\n");
            sb.append("     */\n");
            sb.append("    @Delete(\"DELETE FROM ").append(tableInfo.tableName).append(" WHERE ")
                    .append(pk.columnName).append(" = #{").append(pk.getJavaFieldName()).append("}\")\n");
            sb.append("    int deleteById(@Param(\"").append(pk.getJavaFieldName()).append("\") ").append(pk.getJavaType()).append(" ")
                    .append(pk.getJavaFieldName()).append(");\n\n");

            // 根据 ID 查询
            sb.append("    /**\n");
            sb.append("     * 根据主键查询\n");
            sb.append("     */\n");
            sb.append("    @Select(\"SELECT * FROM ").append(tableInfo.tableName).append(" WHERE ")
                    .append(pk.columnName).append(" = #{").append(pk.getJavaFieldName()).append("}\")\n");
            sb.append("    ").append(tableInfo.className).append(" selectById(@Param(\"").append(pk.getJavaFieldName())
                    .append("\") ").append(pk.getJavaType()).append(" ").append(pk.getJavaFieldName()).append(");\n\n");
        }

        // 查询所有
        sb.append("    /**\n");
        sb.append("     * 查询所有记录\n");
        sb.append("     */\n");
        sb.append("    @Select(\"SELECT * FROM ").append(tableInfo.tableName).append("\")\n");
        sb.append("    List<").append(tableInfo.className).append("> selectAll();\n\n");

        // 统计数量
        sb.append("    /**\n");
        sb.append("     * 统计记录数\n");
        sb.append("     */\n");
        sb.append("    @Select(\"SELECT COUNT(*) FROM ").append(tableInfo.tableName).append("\")\n");
        sb.append("    long count();\n\n");

        // 结束接口
        sb.append("}\n");

        // 写入文件
        String fileName = MAPPER_OUTPUT_PATH + "/" + tableInfo.className + "Mapper.java";
        Files.createDirectories(Paths.get(MAPPER_OUTPUT_PATH));
        Files.write(Paths.get(fileName), sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成 XML 映射文件
     */
    private static void generateXmlFile(TableInfo tableInfo) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<!DOCTYPE mapper PUBLIC \"-//mybatis.org//DTD Mapper 3.0//EN\" \"http://mybatis.org/dtd/mybatis-3-mapper.dtd\">\n\n");
        sb.append("<mapper namespace=\"").append(MAPPER_PACKAGE).append(".").append(tableInfo.className).append("Mapper\">\n\n");

        // ResultMap 定义
        sb.append("    <!-- ").append(tableInfo.className).append(" 结果集映射 -->\n");
        sb.append("    <resultMap id=\"").append(tableInfo.className).append("ResultMap\" type=\"").append(MODEL_PACKAGE).append(".")
                .append(tableInfo.className).append("\">\n");
        for (ColumnInfo column : tableInfo.columns) {
            String columnAttr = column.isPrimaryKey ? "id" : "result";
            sb.append("        <").append(columnAttr).append(" property=\"").append(column.getJavaFieldName())
                    .append("\" column=\"").append(column.columnName).append("\" />\n");
        }
        sb.append("    </resultMap>\n\n");

        // 通用查询 SQL 片段
        sb.append("    <!-- 通用查询字段 -->\n");
        sb.append("    <sql id=\"baseColumns\">\n");
        sb.append("        ").append(tableInfo.columns.stream()
                .map(c -> c.columnName).collect(Collectors.joining(", "))).append("\n");
        sb.append("    </sql>\n\n");

        // 基本的 CRUD 操作（如需要可扩展）
        sb.append("    <!-- 通过条件动态查询 -->\n");
        sb.append("    <select id=\"selectByCondition\" resultMap=\"").append(tableInfo.className).append("ResultMap\">\n");
        sb.append("        SELECT <include refid=\"baseColumns\"/> FROM ").append(tableInfo.tableName).append("\n");
        sb.append("        <where>\n");
        for (ColumnInfo column : tableInfo.columns) {
            sb.append("            <if test=\"").append(column.getJavaFieldName()).append(" != null\">\n");
            sb.append("                AND ").append(column.columnName).append(" = #{").append(column.getJavaFieldName()).append("}\n");
            sb.append("            </if>\n");
        }
        sb.append("        </where>\n");
        sb.append("    </select>\n\n");

        // 分页查询
        sb.append("    <!-- 分页查询 -->\n");
        sb.append("    <select id=\"selectByPage\" resultMap=\"").append(tableInfo.className).append("ResultMap\">\n");
        sb.append("        SELECT <include refid=\"baseColumns\"/> FROM ").append(tableInfo.tableName).append("\n");
        sb.append("        LIMIT #{offset}, #{limit}\n");
        sb.append("    </select>\n\n");

        // 批量插入
        sb.append("    <!-- 批量插入 -->\n");
        sb.append("    <insert id=\"batchInsert\" parameterType=\"java.util.List\">\n");
        sb.append("        INSERT INTO ").append(tableInfo.tableName).append(" (");
        sb.append(tableInfo.columns.stream()
                .filter(c -> !c.isAutoIncrement)
                .map(c -> c.columnName).collect(Collectors.joining(", ")));
        sb.append(")\n");
        sb.append("        VALUES\n");
        sb.append("        <foreach collection=\"list\" item=\"item\" index=\"index\" separator=\",\">\n");
        sb.append("            (");
        sb.append(tableInfo.columns.stream()
                .filter(c -> !c.isAutoIncrement)
                .map(c -> "#{item." + c.getJavaFieldName() + "}")
                .collect(Collectors.joining(", ")));
        sb.append(")\n");
        sb.append("        </foreach>\n");
        sb.append("    </insert>\n\n");

        // 批量更新
        sb.append("    <!-- 批量更新 -->\n");
        sb.append("    <update id=\"batchUpdate\" parameterType=\"java.util.List\">\n");
        ColumnInfo pk = tableInfo.getPrimaryKey();
        if (pk != null) {
            sb.append("        <foreach collection=\"list\" item=\"item\" index=\"index\" separator=\";\">\n");
            sb.append("            UPDATE ").append(tableInfo.tableName).append(" SET\n");
            sb.append("            ").append(tableInfo.columns.stream()
                    .filter(c -> !c.isPrimaryKey)
                    .map(c -> c.columnName + " = #{item." + c.getJavaFieldName() + "}")
                    .collect(Collectors.joining(",\n            "))).append("\n");
            sb.append("            WHERE ").append(pk.columnName).append(" = #{item.").append(pk.getJavaFieldName()).append("}\n");
            sb.append("        </foreach>\n");
        }
        sb.append("    </update>\n\n");

        // 批量删除
        sb.append("    <!-- 批量删除 -->\n");
        if (pk != null) {
            sb.append("    <delete id=\"batchDelete\" parameterType=\"java.util.List\">\n");
            sb.append("        DELETE FROM ").append(tableInfo.tableName).append(" WHERE ").append(pk.columnName).append(" IN\n");
            sb.append("        <foreach collection=\"list\" item=\"id\" open=\"(\" close=\")\" separator=\",\">\n");
            sb.append("            #{id}\n");
            sb.append("        </foreach>\n");
            sb.append("    </delete>\n");
        }

        sb.append("\n</mapper>\n");

        // 写入文件
        String fileName = XML_OUTPUT_PATH + "/" + tableInfo.className + "Mapper.xml";
        Files.createDirectories(Paths.get(XML_OUTPUT_PATH));
        Files.write(Paths.get(fileName), sb.toString().getBytes(StandardCharsets.UTF_8));
    }
}

