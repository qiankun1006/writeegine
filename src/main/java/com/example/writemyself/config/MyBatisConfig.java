package com.example.writemyself.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.io.IOException;

/**
 * MyBatis配置类
 * 配置SqlSessionFactory、事务管理和Mapper扫描
 */
@Configuration
@EnableTransactionManagement
@MapperScan(basePackages = "com.example.writemyself.mapper")
public class MyBatisConfig {

    @Autowired
    private DataSource dataSource;

    /**
     * 配置SqlSessionFactory
     */
    @Bean
    public SqlSessionFactory sqlSessionFactory() throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);

        // 设置MyBatis配置
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setMapUnderscoreToCamelCase(true);
        configuration.setDefaultFetchSize(100);
        configuration.setDefaultStatementTimeout(30);
        configuration.setCacheEnabled(true);
        configuration.setLazyLoadingEnabled(true);
        configuration.setAggressiveLazyLoading(false);
        configuration.setMultipleResultSetsEnabled(true);
        configuration.setUseColumnLabel(true);
        configuration.setUseGeneratedKeys(true);
        configuration.setAutoMappingBehavior(org.apache.ibatis.session.AutoMappingBehavior.PARTIAL);
        configuration.setDefaultExecutorType(org.apache.ibatis.session.ExecutorType.SIMPLE);

        sessionFactory.setConfiguration(configuration);

        // 设置类型别名包
        sessionFactory.setTypeAliasesPackage("com.example.writemyself.model,com.example.writemyself.entity");

        // 设置XML映射文件位置
        Resource[] resources = new PathMatchingResourcePatternResolver()
                .getResources("classpath:mapper/*.xml");
        sessionFactory.setMapperLocations(resources);

        return sessionFactory.getObject();
    }

    /**
     * 配置事务管理器
     */
    @Bean
    public PlatformTransactionManager transactionManager() {
        return new DataSourceTransactionManager(dataSource);
    }

    /**
     * 配置MyBatis插件（拦截器）
     * 可以用于SQL执行时间监控、分页等
     */
    @Bean
    public org.apache.ibatis.plugin.Interceptor[] mybatisPlugins() {
        // 这里可以添加自定义的MyBatis插件
        // 例如：分页插件、SQL执行时间监控插件等
        return new org.apache.ibatis.plugin.Interceptor[]{
                // new PageInterceptor(), // 分页插件示例
                // new SqlExecuteTimeInterceptor() // SQL执行时间监控插件示例
        };
    }

    /**
     * 配置类型处理器
     */
    @Bean
    public org.apache.ibatis.type.TypeHandler[] typeHandlers() {
        return new org.apache.ibatis.type.TypeHandler[]{
                // 可以添加自定义的类型处理器
                // 例如：JSON类型处理器、枚举类型处理器等
                // new JsonTypeHandler(),
                // new EnumTypeHandler()
        };
    }
}

