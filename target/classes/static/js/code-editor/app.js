/**
 * Java 代码编辑器应用程序
 * 功能：在线代码编辑、文件管理、代码索引、语法高亮
 */

class CodeEditor {
    constructor() {
        this.files = new Map();
        this.currentFile = 'Main.java';
        this.editor = null;
        this.outlineItems = [];
        this.init();
    }

    /**
     * 初始化编辑器
     */
    init() {
        this.loadMonacoEditor();
        this.setupEventListeners();
        this.loadStoredFiles();
        this.createDefaultFile();
    }

    /**
     * 加载 Monaco 编辑器
     */
    loadMonacoEditor() {
        require.config({
            paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
        });

        require(['vs/editor/editor.main'], () => {
            this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
                value: this.getDefaultCode(),
                language: 'java',
                theme: 'vs-dark',
                fontSize: 13,
                fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
                minimap: { enabled: true },
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                scrollBeyondLastLine: false,
                wordWrap: 'off',
                lineNumbers: 'on',
                glyphMargin: true,
                folding: true,
                renderLineHighlight: 'all',
                showUnused: true,
                bracketPairColorization: {
                    enabled: true,
                    independentColorPoolPerBracketType: true
                },
                'bracketPairColorization.independentColorPoolPerBracketType': true
            });

            // 监听编辑内容变化
            this.editor.onDidChangeModelContent(() => {
                this.onEditorChanged();
            });

            // 监听光标位置变化
            this.editor.onDidChangeCursorPosition((e) => {
                document.getElementById('status-line').textContent = `行: ${e.position.lineNumber}`;
                document.getElementById('status-col').textContent = `列: ${e.position.column}`;
            });

            // 快捷键处理
            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                this.saveFile();
            });

            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
                this.editor.trigger('keyboard', 'editor.action.commentLine', {});
            });

            console.log('✓ Monaco 编辑器已加载');
        });
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 保存按钮
        document.getElementById('save-btn')?.addEventListener('click', () => this.saveFile());

        // 格式化按钮
        document.getElementById('format-btn')?.addEventListener('click', () => this.formatCode());

        // 清空按钮
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clearCode());

        // 新建文件按钮
        document.getElementById('add-file-btn')?.addEventListener('click', () => this.showNewFileDialog());

        // 快速操作按钮
        document.getElementById('insert-class')?.addEventListener('click', () => this.insertClassTemplate());
        document.getElementById('insert-method')?.addEventListener('click', () => this.insertMethodTemplate());
        document.getElementById('insert-main')?.addEventListener('click', () => this.insertMainTemplate());
        document.getElementById('insert-comment')?.addEventListener('click', () => this.insertCommentBlock());

        // 标签页点击
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    const file = tab.dataset.file;
                    this.switchFile(file);
                }
            });

            const closeBtn = tab.querySelector('.tab-close');
            closeBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                const file = tab.dataset.file;
                if (file !== 'Main.java') {
                    this.closeFile(file);
                }
            });
        });

        // 文件树点击
        document.getElementById('file-tree')?.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file-item');
            if (fileItem) {
                const file = fileItem.dataset.file;
                this.switchFile(file);
            }
        });

        // 代码索引搜索
        document.getElementById('outline-search')?.addEventListener('input', (e) => {
            this.filterOutline(e.target.value);
        });

        // 代码索引点击
        document.getElementById('outline-tree')?.addEventListener('click', (e) => {
            const item = e.target.closest('.outline-item');
            if (item) {
                const line = parseInt(item.dataset.line);
                this.goToLine(line);
            }
        });

        console.log('✓ 事件监听已设置');
    }

    /**
     * 获取默认 Java 代码
     */
    getDefaultCode() {
        return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
    }

    /**
     * 创建默认文件
     */
    createDefaultFile() {
        this.files.set('Main.java', {
            name: 'Main.java',
            content: this.getDefaultCode(),
            language: 'java',
            modified: false
        });
        this.updateFileTree();
        this.updateOutline();
    }

    /**
     * 编辑器内容变化处理
     */
    onEditorChanged() {
        const file = this.files.get(this.currentFile);
        if (file) {
            file.content = this.editor.getValue();
            file.modified = true;
            this.updateOutline();
        }
    }

    /**
     * 保存文件
     */
    saveFile() {
        const file = this.files.get(this.currentFile);
        if (file) {
            file.modified = false;
            localStorage.setItem(this.currentFile, file.content);
            this.showNotification('✓ 文件已保存');
            console.log(`✓ 文件 ${this.currentFile} 已保存`);
        }
    }

    /**
     * 格式化代码
     */
    formatCode() {
        if (this.editor) {
            this.editor.getAction('editor.action.formatDocument').run();
            this.showNotification('✨ 代码已格式化');
        }
    }

    /**
     * 清空代码
     */
    clearCode() {
        if (confirm('确定要清空代码吗？')) {
            this.editor?.setValue('');
            this.showNotification('🗑️ 代码已清空');
        }
    }

    /**
     * 显示新建文件对话框
     */
    showNewFileDialog() {
        const dialog = document.getElementById('new-file-dialog');
        document.getElementById('new-filename').value = '';
        dialog?.classList.add('show');
        document.getElementById('new-filename')?.focus();
    }

    /**
     * 创建新文件
     */
    createNewFile() {
        const filename = document.getElementById('new-filename')?.value.trim();
        if (!filename) {
            alert('请输入文件名');
            return;
        }

        const fullname = filename.endsWith('.java') ? filename : filename + '.java';

        if (this.files.has(fullname)) {
            alert('文件已存在');
            return;
        }

        this.files.set(fullname, {
            name: fullname,
            content: `public class ${filename} {\n    \n}`,
            language: 'java',
            modified: false
        });

        this.addTab(fullname);
        this.switchFile(fullname);
        this.updateFileTree();
        this.closeDialog('new-file-dialog');
        this.showNotification(`✓ 文件 ${fullname} 已创建`);
    }

    /**
     * 添加标签页
     */
    addTab(filename) {
        const tabsContainer = document.querySelector('.editor-tabs');
        if (!tabsContainer || tabsContainer.querySelector(`[data-file="${filename}"]`)) {
            return;
        }

        const addBtn = document.getElementById('add-file-btn');
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.file = filename;
        tab.innerHTML = `
            <span>${filename}</span>
            <button class="tab-close" data-file="${filename}">✕</button>
        `;

        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                this.switchFile(filename);
            }
        });

        const closeBtn = tab.querySelector('.tab-close');
        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeFile(filename);
        });

        tabsContainer?.insertBefore(tab, addBtn);
    }

    /**
     * 切换文件
     */
    switchFile(filename) {
        // 保存当前文件
        const currentFile = this.files.get(this.currentFile);
        if (currentFile) {
            currentFile.content = this.editor?.getValue() || '';
        }

        // 加载新文件
        this.currentFile = filename;
        const file = this.files.get(filename);
        if (file && this.editor) {
            this.editor.setValue(file.content);
            monaco.editor.setModelLanguage(this.editor.getModel(), file.language);
        }

        // 更新 UI
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.file === filename);
        });

        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.toggle('active', item.dataset.file === filename);
        });

        document.getElementById('status-file').textContent = `文件: ${filename}`;
        this.updateOutline();

        console.log(`✓ 切换到文件: ${filename}`);
    }

    /**
     * 关闭文件
     */
    closeFile(filename) {
        if (filename === 'Main.java') {
            alert('不能关闭 Main.java 文件');
            return;
        }

        if (confirm(`确定要关闭 ${filename} 吗？`)) {
            this.files.delete(filename);

            // 移除标签页
            document.querySelector(`[data-file="${filename}"]`)?.remove();

            // 移除文件树项
            document.querySelector(`.file-item[data-file="${filename}"]`)?.remove();

            // 切换到其他文件
            if (this.currentFile === filename) {
                this.switchFile('Main.java');
            }

            this.showNotification(`✓ 文件 ${filename} 已关闭`);
        }
    }

    /**
     * 更新文件树
     */
    updateFileTree() {
        const fileTree = document.getElementById('file-tree');
        if (!fileTree) return;

        fileTree.innerHTML = '';
        this.files.forEach((file, filename) => {
            const item = document.createElement('div');
            item.className = `file-item ${filename === this.currentFile ? 'active' : ''}`;
            item.dataset.file = filename;
            item.innerHTML = `
                <span class="file-icon">☕</span>
                <span class="file-name">${filename}</span>
            `;
            fileTree.appendChild(item);
        });
    }

    /**
     * 更新代码索引
     */
    updateOutline() {
        if (!this.editor) return;

        const content = this.editor.getValue();
        this.outlineItems = this.parseJavaCode(content);
        this.renderOutline(this.outlineItems);
    }

    /**
     * 解析 Java 代码
     */
    parseJavaCode(content) {
        const items = [];
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            const lineNum = index + 1;

            // 匹配类定义
            if (/^public\s+class\s+(\w+)/.test(line)) {
                const className = RegExp.$1;
                items.push({
                    type: 'class',
                    name: className,
                    line: lineNum
                });
            }

            // 匹配方法定义
            if (/public|private|protected|static\s+.*\s+(\w+)\s*\(/.test(line) || /^\s+(public|private|protected|static).*\s+(\w+)\s*\(/.test(line)) {
                const methodName = line.match(/(\w+)\s*\(/)?.[1];
                if (methodName && methodName !== 'if' && methodName !== 'for' && methodName !== 'while') {
                    items.push({
                        type: 'method',
                        name: methodName,
                        line: lineNum
                    });
                }
            }

            // 匹配字段定义
            if (/^\s+(private|public|protected)\s+\w+\s+(\w+)\s*[=;]/.test(line)) {
                const fieldName = RegExp.$2;
                items.push({
                    type: 'field',
                    name: fieldName,
                    line: lineNum
                });
            }
        });

        return items;
    }

    /**
     * 渲染代码索引
     */
    renderOutline(items) {
        const outlineTree = document.getElementById('outline-tree');
        if (!outlineTree) return;

        if (items.length === 0) {
            outlineTree.innerHTML = '<div class="outline-loading">没有找到符号</div>';
            return;
        }

        outlineTree.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = `outline-item ${item.type}`;
            div.dataset.line = item.line;
            div.title = `行 ${item.line}`;
            div.innerHTML = `<span>${item.name}</span>`;
            outlineTree.appendChild(div);
        });
    }

    /**
     * 过滤代码索引
     */
    filterOutline(keyword) {
        const filtered = keyword
            ? this.outlineItems.filter(item =>
                item.name.toLowerCase().includes(keyword.toLowerCase())
            )
            : this.outlineItems;

        this.renderOutline(filtered);
    }

    /**
     * 跳转到指定行
     */
    goToLine(line) {
        if (this.editor) {
            this.editor.revealLineInCenter(line);
            this.editor.setPosition({ lineNumber: line, column: 1 });
        }
    }

    /**
     * 插入类模板
     */
    insertClassTemplate() {
        const template = `
public class NewClass {

    // 构造方法
    public NewClass() {

    }

    // 成员方法
    public void method() {

    }
}`;
        this.insertAtCursor(template);
    }

    /**
     * 插入方法模板
     */
    insertMethodTemplate() {
        const template = `
    public void newMethod() {
        // 方法体
    }`;
        this.insertAtCursor(template);
    }

    /**
     * 插入 main 方法
     */
    insertMainTemplate() {
        const template = `
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }`;
        this.insertAtCursor(template);
    }

    /**
     * 插入注释块
     */
    insertCommentBlock() {
        const template = `
    /**
     * 方法描述
     *
     * @param 参数名 参数说明
     * @return 返回值说明
     */`;
        this.insertAtCursor(template);
    }

    /**
     * 在光标位置插入代码
     */
    insertAtCursor(text) {
        if (!this.editor) return;

        const selection = this.editor.getSelection();
        const range = new monaco.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.startLineNumber,
            selection.startColumn
        );

        this.editor.executeEdits('insert', [
            {
                range: range,
                text: text
            }
        ]);

        this.editor.setPosition({
            lineNumber: selection.startLineNumber,
            column: selection.startColumn + text.length
        });
    }

    /**
     * 加载本地存储的文件
     */
    loadStoredFiles() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.endsWith('.java') && key !== 'Main.java') {
                const content = localStorage.getItem(key) || '';
                this.files.set(key, {
                    name: key,
                    content: content,
                    language: 'java',
                    modified: false
                });
                this.addTab(key);
            }
        });
    }

    /**
     * 显示通知
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #4ec9b0;
            color: #1e1e1e;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 999;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

/**
 * 全局函数
 */
function closeDialog(dialogId) {
    document.getElementById(dialogId)?.classList.remove('show');
}

function createNewFile() {
    window.codeEditor?.createNewFile();
}

/**
 * 初始化应用
 */
window.addEventListener('DOMContentLoaded', () => {
    window.codeEditor = new CodeEditor();
    console.log('✓ Java 代码编辑器已初始化');
});

/**
 * 添加动画样式
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

