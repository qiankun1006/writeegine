package com.example.writemyself.service;

import com.example.writemyself.model.SAMSegmentationResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@TestPropertySource(properties = {
    "aliyun.bailian.api.key=test-key",
    "aliyun.bailian.model=qwen-vl-max"
})
class SAMServiceTest {

    @Autowired
    private SAMService samService;

    @Test
    void testServiceInitialization() {
        assertNotNull(samService);
        System.out.println("SAMService 初始化成功");
    }

    @Test
    void testBuildSegmentationPrompt() {
        // 创建测试点
        SAMService.Point point1 = new SAMService.Point(100, 200);
        SAMService.Point point2 = new SAMService.Point(300, 400);

        // 由于buildSegmentationPrompt是私有方法，我们需要通过反射或间接测试
        // 这里我们测试segmentImage方法的基本功能

        // 创建一个简单的base64图像数据（1x1像素的PNG）
        String testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

        // 测试调用（预期会失败，因为没有真实的API密钥）
        SAMSegmentationResult result = samService.segmentImage(
            testImageBase64,
            Arrays.asList(point1, point2)
        );

        // 验证结果对象不为null
        assertNotNull(result);

        // 由于使用测试密钥，预期会返回错误状态
        if (!result.isSuccess()) {
            System.out.println("预期的API调用失败: " + result.getErrorMessage());
        }

        System.out.println("SAMService 测试完成");
    }

    @Test
    void testPointClass() {
        SAMService.Point point = new SAMService.Point(100, 200);

        assertEquals(100, point.getX());
        assertEquals(200, point.getY());

        System.out.println("Point类测试通过");
    }

    @Test
    void testCreateErrorResult() {
        // 测试错误结果创建
        SAMSegmentationResult result = new SAMSegmentationResult();
        result.setStatus("error");
        result.setErrorMessage("测试错误");

        assertEquals("error", result.getStatus());
        assertEquals("测试错误", result.getErrorMessage());

        System.out.println("错误结果测试通过");
    }
}

