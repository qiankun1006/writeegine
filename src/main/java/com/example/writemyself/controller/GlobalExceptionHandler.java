package com.example.writemyself.controller;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

import java.util.Date;

/**
 * 全局异常处理器
 * 使用@ControllerAdvice注解，统一处理应用中所有控制器的异常
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理所有未被捕获的异常
     *
     * @param ex 捕获到的异常对象
     * @return ModelAndView对象，返回error视图
     */
    @ExceptionHandler(Exception.class)
    public ModelAndView handleException(Exception ex) {
        // 创建ModelAndView对象，指定视图名称为"error"
        ModelAndView mav = new ModelAndView("error");

        // 向视图传递错误信息
        mav.addObject("status", 500);
        mav.addObject("error", "服务器错误");
        mav.addObject("message", ex.getMessage() != null ? ex.getMessage() : "应用处理请求时发生错误");
        mav.addObject("timestamp", new Date());

        return mav;
    }

    /**
     * 处理空指针异常
     * 这是一个具体的异常处理方法，优先级高于通用的Exception处理
     *
     * @param ex 捕获到的NullPointerException
     * @return ModelAndView对象，返回error视图
     */
    @ExceptionHandler(NullPointerException.class)
    public ModelAndView handleNullPointerException(NullPointerException ex) {
        // 创建ModelAndView对象，指定视图名称为"error"
        ModelAndView mav = new ModelAndView("error");

        // 向视图传递错误信息
        mav.addObject("status", 500);
        mav.addObject("error", "服务器错误");
        mav.addObject("message", "处理请求时发生了一个内部错误");
        mav.addObject("timestamp", new Date());

        return mav;
    }

    /**
     * 处理数字格式异常
     * 当参数无法转换为数字类型时触发
     *
     * @param ex 捕获到的NumberFormatException
     * @return ModelAndView对象，返回error视图
     */
    @ExceptionHandler(NumberFormatException.class)
    public ModelAndView handleNumberFormatException(NumberFormatException ex) {
        // 创建ModelAndView对象，指定视图名称为"error"
        ModelAndView mav = new ModelAndView("error");

        // 向视图传递错误信息
        mav.addObject("status", 400);
        mav.addObject("error", "请求错误");
        mav.addObject("message", "提供的参数格式不正确");
        mav.addObject("timestamp", new Date());

        return mav;
    }
}

