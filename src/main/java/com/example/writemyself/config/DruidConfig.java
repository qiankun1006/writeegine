package com.example.writemyself.config;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.support.http.StatViewServlet;
import com.alibaba.druid.support.http.WebStatFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * Druid数据库连接池配置类
 * 配置Druid数据源、监控界面和过滤器
 */
@Configuration
public class DruidConfig {

    private static final Logger logger = LoggerFactory.getLogger(DruidConfig.class);

    /**
     * 配置Druid数据源
     * 使用@ConfigurationProperties读取application.properties中的druid配置
     */
    @Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.druid")
    public DataSource druidDataSource() {
        DruidDataSource druidDataSource = new DruidDataSource();

        try {
            // 设置连接池的监控统计功能
            druidDataSource.setFilters("stat,wall,log4j");

            // 设置连接池的初始化参数
            druidDataSource.setInitialSize(5);
            druidDataSource.setMinIdle(5);
            druidDataSource.setMaxActive(20);
            druidDataSource.setMaxWait(60000);
            druidDataSource.setTimeBetweenEvictionRunsMillis(60000);
            druidDataSource.setMinEvictableIdleTimeMillis(300000);
            druidDataSource.setValidationQuery("SELECT 1");
            druidDataSource.setTestWhileIdle(true);
            druidDataSource.setTestOnBorrow(false);
            druidDataSource.setTestOnReturn(false);
            druidDataSource.setPoolPreparedStatements(true);
            druidDataSource.setMaxPoolPreparedStatementPerConnectionSize(20);

            // 设置连接属性
            druidDataSource.setConnectionProperties("druid.stat.mergeSql=true;druid.stat.slowSqlMillis=5000");

            logger.info("Druid数据源配置完成，初始化大小: {}, 最小空闲: {}, 最大连接: {}",
                    druidDataSource.getInitialSize(),
                    druidDataSource.getMinIdle(),
                    druidDataSource.getMaxActive());

        } catch (SQLException e) {
            logger.error("Druid数据源配置失败", e);
            throw new RuntimeException("Druid数据源配置失败", e);
        }

        return druidDataSource;
    }

    /**
     * 配置Druid监控界面Servlet
     * 访问路径: /druid/*
     */
    @Bean
    public ServletRegistrationBean<StatViewServlet> druidServlet() {
        ServletRegistrationBean<StatViewServlet> servletRegistrationBean =
                new ServletRegistrationBean<>(new StatViewServlet(), "/druid/*");

        // 设置监控界面登录参数
        Map<String, String> initParams = new HashMap<>();
        initParams.put("loginUsername", "admin");
        initParams.put("loginPassword", "admin");
        initParams.put("allow", "127.0.0.1"); // 默认只允许本地访问
        initParams.put("deny", ""); // 拒绝访问的IP
        initParams.put("resetEnable", "false"); // 禁用重置功能

        servletRegistrationBean.setInitParameters(initParams);

        logger.info("Druid监控界面已配置，访问路径: /druid/");

        return servletRegistrationBean;
    }

    /**
     * 配置Druid监控过滤器
     * 用于收集Web应用统计信息
     */
    @Bean
    public FilterRegistrationBean<WebStatFilter> druidFilter() {
        FilterRegistrationBean<WebStatFilter> filterRegistrationBean =
                new FilterRegistrationBean<>(new WebStatFilter());

        // 设置过滤器参数
        Map<String, String> initParams = new HashMap<>();
        initParams.put("exclusions", "*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*");

        filterRegistrationBean.setInitParameters(initParams);
        filterRegistrationBean.setUrlPatterns(Arrays.asList("/*"));

        logger.info("Druid监控过滤器已配置");

        return filterRegistrationBean;
    }

    /**
     * 配置数据库连接健康检查
     * 用于Spring Boot Actuator的健康检查
     */
    @Bean
    public DruidHealthIndicator druidHealthIndicator(DataSource dataSource) {
        return new DruidHealthIndicator(dataSource);
    }

    /**
     * Druid健康检查指示器
     * 自定义健康检查，提供更详细的数据库连接状态信息
     */
    public static class DruidHealthIndicator implements org.springframework.boot.actuate.health.HealthIndicator {

        private final DataSource dataSource;

        public DruidHealthIndicator(DataSource dataSource) {
            this.dataSource = dataSource;
        }

        @Override
        public org.springframework.boot.actuate.health.Health health() {
            if (dataSource instanceof DruidDataSource) {
                DruidDataSource druidDataSource = (DruidDataSource) dataSource;

                try {
                    // 检查数据库连接是否正常
                    if (druidDataSource.isClosed()) {
                        return org.springframework.boot.actuate.health.Health.down()
                                .withDetail("error", "Druid数据源已关闭")
                                .build();
                    }

                    // 获取连接池状态信息
                    int activeCount = druidDataSource.getActiveCount();
                    int poolingCount = druidDataSource.getPoolingCount();
                    long connectCount = druidDataSource.getConnectCount();
                    long closeCount = druidDataSource.getCloseCount();

                    return org.springframework.boot.actuate.health.Health.up()
                            .withDetail("activeConnections", activeCount)
                            .withDetail("poolingConnections", poolingCount)
                            .withDetail("totalConnections", connectCount)
                            .withDetail("closedConnections", closeCount)
                            .withDetail("url", druidDataSource.getUrl())
                            .withDetail("driver", druidDataSource.getDriverClassName())
                            .build();

                } catch (Exception e) {
                    return org.springframework.boot.actuate.health.Health.down(e)
                            .withDetail("error", "检查数据库连接状态时发生异常")
                            .build();
                }
            }

            return org.springframework.boot.actuate.health.Health.unknown()
                    .withDetail("info", "数据源不是Druid类型")
                    .build();
        }
    }
}

