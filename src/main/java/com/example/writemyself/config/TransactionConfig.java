package com.example.writemyself.config;

import org.springframework.aop.Advisor;
import org.springframework.aop.aspectj.AspectJExpressionPointcut;
import org.springframework.aop.support.DefaultPointcutAdvisor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionManager;
import org.springframework.transaction.interceptor.NameMatchTransactionAttributeSource;
import org.springframework.transaction.interceptor.RollbackRuleAttribute;
import org.springframework.transaction.interceptor.RuleBasedTransactionAttribute;
import org.springframework.transaction.interceptor.TransactionInterceptor;

import java.util.Collections;

/**
 * 事务管理配置类
 * 配置事务拦截器和事务属性
 */
@Configuration
public class TransactionConfig {

    /**
     * 配置事务拦截器
     */
    @Bean
    public TransactionInterceptor transactionInterceptor(TransactionManager transactionManager) {
        NameMatchTransactionAttributeSource source = new NameMatchTransactionAttributeSource();

        // 只读事务配置
        RuleBasedTransactionAttribute readOnlyTx = new RuleBasedTransactionAttribute();
        readOnlyTx.setReadOnly(true);
        readOnlyTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_SUPPORTS);

        // 写事务配置（需要事务）
        RuleBasedTransactionAttribute requiredTx = new RuleBasedTransactionAttribute();
        requiredTx.setRollbackRules(Collections.singletonList(new RollbackRuleAttribute(Exception.class)));
        requiredTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);
        requiredTx.setTimeout(30); // 30秒超时

        // 写事务配置（新建事务）
        RuleBasedTransactionAttribute requiresNewTx = new RuleBasedTransactionAttribute();
        requiresNewTx.setRollbackRules(Collections.singletonList(new RollbackRuleAttribute(Exception.class)));
        requiresNewTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        requiresNewTx.setTimeout(30);

        // 方法名匹配规则
        // 查询方法使用只读事务
        source.addTransactionalMethod("get*", readOnlyTx);
        source.addTransactionalMethod("find*", readOnlyTx);
        source.addTransactionalMethod("select*", readOnlyTx);
        source.addTransactionalMethod("query*", readOnlyTx);
        source.addTransactionalMethod("count*", readOnlyTx);
        source.addTransactionalMethod("list*", readOnlyTx);
        source.addTransactionalMethod("search*", readOnlyTx);

        // 增删改方法使用写事务
        source.addTransactionalMethod("add*", requiredTx);
        source.addTransactionalMethod("save*", requiredTx);
        source.addTransactionalMethod("insert*", requiredTx);
        source.addTransactionalMethod("create*", requiredTx);
        source.addTransactionalMethod("update*", requiredTx);
        source.addTransactionalMethod("modify*", requiredTx);
        source.addTransactionalMethod("edit*", requiredTx);
        source.addTransactionalMethod("delete*", requiredTx);
        source.addTransactionalMethod("remove*", requiredTx);
        source.addTransactionalMethod("batch*", requiredTx);

        // 特殊方法使用新建事务
        source.addTransactionalMethod("do*", requiresNewTx);
        source.addTransactionalMethod("process*", requiresNewTx);
        source.addTransactionalMethod("handle*", requiresNewTx);

        return new TransactionInterceptor(transactionManager, source);
    }

    /**
     * 配置事务切面
     */
    @Bean
    public Advisor transactionAdvisor(TransactionInterceptor transactionInterceptor) {
        AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();

        // 切点表达式：拦截service包下的所有方法
        pointcut.setExpression("execution(* com.example.writemyself.service..*.*(..))");

        return new DefaultPointcutAdvisor(pointcut, transactionInterceptor);
    }

    /**
     * 配置MyBatis事务切面
     * 确保MyBatis Mapper的方法也参与事务管理
     */
    @Bean
    public Advisor mybatisTransactionAdvisor(TransactionInterceptor transactionInterceptor) {
        AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();

        // 切点表达式：拦截mapper包下的所有方法
        pointcut.setExpression("execution(* com.example.writemyself.mapper..*.*(..))");

        return new DefaultPointcutAdvisor(pointcut, transactionInterceptor);
    }

    /**
     * 配置事务管理器Bean名称
     * 确保MyBatis和JPA使用同一个事务管理器
     */
    @Bean(name = "transactionManager")
    public TransactionManager platformTransactionManager(TransactionManager transactionManager) {
        return transactionManager;
    }
}

