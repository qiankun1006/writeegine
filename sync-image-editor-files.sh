#!/bin/bash

# 图片编辑器文件自动同步脚本
# 用途：确保源文件和构建目录中的文件保持一致

SRC_DIR="/Users/qiankun96/Desktop/meituan/writeengine/src/main/resources/static/js/image-editor"
TARGET_DIR="/Users/qiankun96/Desktop/meituan/writeengine/target/classes/static/js/image-editor"

echo "🔄 开始同步图片编辑器文件..."
echo "源目录: $SRC_DIR"
echo "目标目录: $TARGET_DIR"
echo ""

# 同步关键文件
FILES=(
  "MenuManager.js"
  "app.js"
  "ImageEditor.js"
  "CanvasRenderer.js"
  "Layer.js"
  "Tool.js"
  "EventBus.js"
  "CommandHistory.js"
  "TooltipManager.js"
)

# 同步个别文件
for file in "${FILES[@]}"; do
  if [ -f "$SRC_DIR/$file" ]; then
    cp "$SRC_DIR/$file" "$TARGET_DIR/$file"
    echo "✓ 已同步: $file"
  else
    echo "⚠️  文件不存在: $file"
  fi
done

# 同步整个 tools 目录
echo ""
echo "同步 tools 目录..."
rsync -av "$SRC_DIR/tools/" "$TARGET_DIR/tools/" --delete

# 同步整个 filters 目录
echo ""
echo "同步 filters 目录..."
rsync -av "$SRC_DIR/filters/" "$TARGET_DIR/filters/" --delete

# 同步 core 目录
echo ""
echo "同步 core 目录..."
if [ -d "$SRC_DIR/core" ]; then
  rsync -av "$SRC_DIR/core/" "$TARGET_DIR/core/" --delete
fi

echo ""
echo "%c✓✓✓ 所有文件同步完成！✓✓✓"
echo "time: $(date '+%Y-%m-%d %H:%M:%S')"

