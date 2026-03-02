/**
 * CanvasUtils.js - Canvas 工具库
 * 提供常用的canvas绘图工具和函数
 */

const CanvasUtils = {
    /**
     * 绘制圆角矩形
     */
    drawRoundRect(ctx, x, y, width, height, radius = 5, fillStyle = '#fff', strokeStyle = '#000') {
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();
    },

    /**
     * 绘制虚线
     */
    drawDashedLine(ctx, x1, y1, x2, y2, dashSize = 5) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        ctx.save();
        ctx.translate(x1, y1);
        ctx.rotate(angle);

        let offset = 0;
        while (offset < distance) {
            ctx.beginPath();
            ctx.moveTo(offset, 0);
            offset += dashSize;
            ctx.lineTo(Math.min(offset, distance), 0);
            ctx.stroke();
            offset += dashSize;
        }

        ctx.restore();
    },

    /**
     * 绘制星形
     */
    drawStar(ctx, centerX, centerY, size, color = '#FFD700') {
        ctx.fillStyle = color;
        ctx.beginPath();

        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = centerX + size * Math.cos(angle);
            const y = centerY + size * Math.sin(angle);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.fill();
    },

    /**
     * 绘制箭头
     */
    drawArrow(ctx, fromX, fromY, toX, toY, headSize = 10, color = '#333') {
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;

        // 绘制箭身
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // 绘制箭头
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headSize * Math.cos(angle - Math.PI / 6), toY - headSize * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headSize * Math.cos(angle + Math.PI / 6), toY - headSize * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    },

    /**
     * 绘制网格
     */
    drawGrid(ctx, width, height, spacing = 20, color = '#e0e0e0', lineWidth = 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        // 竖线
        for (let x = 0; x <= width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // 横线
        for (let y = 0; y <= height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    },

    /**
     * 绘制渐变背景
     */
    drawGradientBg(ctx, width, height, color1 = '#667eea', color2 = '#764ba2') {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    },

    /**
     * 绘制圆形进度条
     */
    drawCircleProgress(ctx, centerX, centerY, radius, progress, color = '#667eea') {
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (progress * Math.PI * 2);

        // 背景圆
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // 进度圆
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        // 中心白圆
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // 文字
        ctx.fillStyle = color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(progress * 100)}%`, centerX, centerY);
    },

    /**
     * 绘制矩形进度条
     */
    drawRectProgress(ctx, x, y, width, height, progress, bgColor = '#f0f0f0', barColor = '#667eea') {
        // 背景
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, width, height);

        // 进度条
        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, width * progress, height);

        // 边框
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    },

    /**
     * 绘制文本居中
     */
    drawTextCenter(ctx, text, x, y, font = '16px Arial', color = '#000') {
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    },

    /**
     * 绘制阴影
     */
    drawShadow(ctx, shape, shadowColor = 'rgba(0,0,0,0.3)', offsetX = 3, offsetY = 3, blur = 5) {
        ctx.shadowColor = shadowColor;
        ctx.shadowOffsetX = offsetX;
        ctx.shadowOffsetY = offsetY;
        ctx.shadowBlur = blur;
    },

    /**
     * 清除阴影
     */
    clearShadow(ctx) {
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
    },

    /**
     * 计算文本宽度
     */
    getTextWidth(ctx, text, font) {
        ctx.font = font;
        return ctx.measureText(text).width;
    },

    /**
     * 绘制多边形
     */
    drawPolygon(ctx, points, fillColor = '#667eea', strokeColor = '#333') {
        if (points.length < 2) return;

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    },

    /**
     * 绘制旋转后的图像
     */
    drawRotatedImage(ctx, image, x, y, angle, scale = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        ctx.restore();
    },

    /**
     * 获取图像数据 (灰度处理)
     */
    toGrayscale(ctx, x, y, width, height) {
        const imageData = ctx.getImageData(x, y, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }

        ctx.putImageData(imageData, x, y);
    },

    /**
     * 绘制文字描边
     */
    drawStrokeText(ctx, text, x, y, font, fillColor, strokeColor, lineWidth = 2) {
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.strokeText(text, x, y);

        ctx.fillStyle = fillColor;
        ctx.fillText(text, x, y);
    },

    /**
     * 生成随机颜色
     */
    randomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
};

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanvasUtils;
}

