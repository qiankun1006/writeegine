package com.example.writemyself.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * OpenPose关键点数据模型
 *
 * 表示OpenPose检测到的单个关键点，包含位置信息和置信度
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OpenPosePoint {

    /**
     * 关键点ID
     * 对应OpenPose的标准关键点编号
     */
    private int id;

    /**
     * 关键点名称
     * 例如：Nose, Neck, RShoulder等
     */
    private String name;

    /**
     * X坐标（归一化坐标，0-1范围）
     * 0表示图像最左侧，1表示图像最右侧
     */
    private float x;

    /**
     * Y坐标（归一化坐标，0-1范围）
     * 0表示图像最上方，1表示图像最下方
     */
    private float y;

    /**
     * 置信度（0-1范围）
     * 表示该关键点检测的可靠性
     */
    private float confidence;

    /**
     * 构造函数（默认置信度为1.0）
     */
    public OpenPosePoint(int id, String name, float x, float y) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.confidence = 1.0f;
    }

    /**
     * 转换为绝对坐标
     *
     * @param imageWidth 图像宽度
     * @param imageHeight 图像高度
     * @return 包含绝对坐标的数组 [x, y]
     */
    public int[] toAbsoluteCoordinates(int imageWidth, int imageHeight) {
        return new int[] {
            Math.round(x * imageWidth),
            Math.round(y * imageHeight)
        };
    }

    /**
     * 计算到另一个关键点的距离
     */
    public double distanceTo(OpenPosePoint other) {
        float dx = this.x - other.x;
        float dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

