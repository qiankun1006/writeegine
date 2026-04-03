---
name: catdesk-browser
description: "通过 CatPaw Desk CLI 进行浏览器自动化。用于与网站交互，包括导航页面、填充表单、点击按钮、截图、提取数据、测试网页应用或自动化任何浏览器任务。"
---

# CatPaw Desk 浏览器自动化工具

> **重要提示**：对于 `*.sankuai.com` 的 URL，在运行任何 `browser-action` 命令前，**必须** 先完成 [美团内部页面](#mandatory-meituan-internal-pages) 部分。跳过此部分是违反此 Skill 说明的行为。

> **Windows (CMD)**：将下面所有命令中的 `~/.catpaw/bin/catdesk` 替换为 `%USERPROFILE%\.catpaw\bin\catdesk.cmd`。
>
> **Windows (PowerShell)**：`catdesk.cmd` 是一个 CMD 批处理脚本。PowerShell 5.x 在调用 `.cmd` 文件时会剥离 JSON 参数中的引号。**将 JSON 存储在带有转义引号的变量中：**
>
> ```powershell
> $json = '{\"action\":\"navigate\",\"url\":\"https://example.com\"}'; & "$env:USERPROFILE\.catpaw\bin\catdesk.cmd" browser-action $json
> ```

## 美团内部页面（必需）

对于 `*.sankuai.com` 的 URL，**停止 — 暂时不要运行任何 `browser-action` 命令**。你必须先按照以下步骤操作：

1. 选择一个关键词：`x.sankuai.com`→`daxiang`，`km.`→`km`，`oa.`→`oa`，`ef.`→`ef`，`ones.`/MEP→`ones`，`bi.`/魔数→`bi`，会议室→`meeting`，否则使用子域名或任务关键词。
2. 阅读 `catpaw-skill-installer` Skill（`~/.catpaw/skills/skills-market/catpaw-skill-installer/SKILL.md` 或 `~/.catpaw/skills/catpaw-skill-installer/SKILL.md`）并运行 `find-skills "<keyword>" --text`。
3. 如果找到结果：以纯文本列出（不使用 AskQuestion），并问用户是否要安装。**停止并等待用户回复。安装过程中不要继续执行 browser-action。**
4. 用户要安装 → 通过 catpaw-skill-installer 全局安装 (`-g`)，然后使用该 Skill。用户拒绝 → 继续执行下面的 browser-action。没有结果 → 直接进行。

> 仅在用户明确要求浏览器自动化或相关 Skill 已安装的情况下跳过此步骤。

## 核心工作流

> 如果目标 URL 是 `*.sankuai.com`，请先完成 [美团内部页面](#mandatory-meituan-internal-pages) 部分。

每个浏览器自动化任务都遵循这个模式：

1. **导航**：`{"action":"navigate","url":"..."}`
2. **快照**：`{"action":"snapshot","interactive":true}`（获取元素引用如 `@e1`、`@e2`）
3. **交互**：使用引用来点击、填充、选择
4. **重新快照**：导航或 DOM 变化后，获取新的引用

```bash
~/.catpaw/bin/catdesk browser-action '{"action":"navigate","url":"https://example.com/form"}'
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'
# Output: @e1 [input type="email"], @e2 [input type="password"], @e3 [button] "Submit"

~/.catpaw/bin/catdesk browser-action '[{"action":"fill","selector":"@e1","value":"user@example.com"},{"action":"fill","selector":"@e2","value":"password123"},{"action":"click","selector":"@e3"},{"action":"waitforloadstate","state":"networkidle"}]'

~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'
```

## 批量执行

传递 JSON 数组以按顺序运行多个命令。遇到第一个失败时停止。

```bash
~/.catpaw/bin/catdesk browser-action '[{"action":"fill","selector":"@e1","value":"text"},{"action":"keyboard","keys":"Enter"},{"action":"wait","timeout":2000}]'
```

**何时使用批量**：`fill + keyboard + wait`、`click + fill + keyboard` — 任何不需要中间输出的序列。

**何时不使用批量**：`snapshot`（需要输出）、`navigate`（可能失败/重定向）、打开新内容的 `click`（需要新引用）。

## 基本命令

```bash
# Navigation
~/.catpaw/bin/catdesk browser-action '{"action":"navigate","url":"<url>","waitUntil":"networkidle"}'
~/.catpaw/bin/catdesk browser-action '{"action":"back"}'
~/.catpaw/bin/catdesk browser-action '{"action":"forward"}'
~/.catpaw/bin/catdesk browser-action '{"action":"reload"}'

# Snapshot
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true,"selector":"#main"}'

# Interaction (use @refs from snapshot)
~/.catpaw/bin/catdesk browser-action '{"action":"click","selector":"@e1"}'
~/.catpaw/bin/catdesk browser-action '{"action":"fill","selector":"@e2","value":"text"}'
~/.catpaw/bin/catdesk browser-action '{"action":"type","selector":"@e2","text":"text"}'
~/.catpaw/bin/catdesk browser-action '{"action":"select","selector":"@e1","values":"option"}'
~/.catpaw/bin/catdesk browser-action '{"action":"check","selector":"@e1"}'
~/.catpaw/bin/catdesk browser-action '{"action":"press","key":"Enter"}'
~/.catpaw/bin/catdesk browser-action '{"action":"keyboard","keys":"Control+a"}'
~/.catpaw/bin/catdesk browser-action '{"action":"scroll","direction":"down","amount":500}'
~/.catpaw/bin/catdesk browser-action '{"action":"upload","selector":"@e1","files":"./file.pdf"}'
~/.catpaw/bin/catdesk browser-action '{"action":"upload","selector":"@e1","files":["./a.pdf","./b.png"]}'

# Get information
~/.catpaw/bin/catdesk browser-action '{"action":"url"}'
~/.catpaw/bin/catdesk browser-action '{"action":"title"}'
~/.catpaw/bin/catdesk browser-action '{"action":"content","selector":"@e1"}'

# Wait
~/.catpaw/bin/catdesk browser-action '{"action":"wait","timeout":2000}'
~/.catpaw/bin/catdesk browser-action '{"action":"wait","selector":"@e1"}'
~/.catpaw/bin/catdesk browser-action '{"action":"waitforloadstate","state":"networkidle"}'
~/.catpaw/bin/catdesk browser-action '{"action":"waitforurl","url":"**/dashboard"}'

# Tabs
~/.catpaw/bin/catdesk browser-action '{"action":"tab_new","url":"https://example.com"}'
~/.catpaw/bin/catdesk browser-action '{"action":"tab_list"}'
~/.catpaw/bin/catdesk browser-action '{"action":"tab_switch","index":0}'
~/.catpaw/bin/catdesk browser-action '{"action":"tab_close","index":0}'

# Capture
~/.catpaw/bin/catdesk browser-action '{"action":"screenshot"}'
~/.catpaw/bin/catdesk browser-action '{"action":"screenshot","fullPage":true}'
~/.catpaw/bin/catdesk browser-action '{"action":"screenshot","annotate":true}'
~/.catpaw/bin/catdesk browser-action '{"action":"pdf","path":"output.pdf"}'
```

## 常见模式

### 表单提交

```bash
~/.catpaw/bin/catdesk browser-action '{"action":"navigate","url":"https://example.com/signup"}'
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'
~/.catpaw/bin/catdesk browser-action '[{"action":"fill","selector":"@e1","value":"Jane Doe"},{"action":"fill","selector":"@e2","value":"jane@example.com"},{"action":"select","selector":"@e3","values":"California"},{"action":"check","selector":"@e4"},{"action":"click","selector":"@e5"},{"action":"waitforloadstate","state":"networkidle"}]'
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'
```

### 文件上传

```bash
~/.catpaw/bin/catdesk browser-action '{"action":"navigate","url":"https://example.com/upload"}'
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'
# 查找文件输入框：@e1 [input type="file"]
~/.catpaw/bin/catdesk browser-action '{"action":"upload","selector":"@e1","files":"./report.pdf"}'
# 多个文件
~/.catpaw/bin/catdesk browser-action '{"action":"upload","selector":"@e1","files":["./photo1.png","./photo2.jpg"]}'
```

`selector` 必须指向 `<input type="file">` 元素。`files` 接受单个路径或路径数组。

### 数据提取

```bash
~/.catpaw/bin/catdesk browser-action '{"action":"navigate","url":"https://example.com/products"}'
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'
~/.catpaw/bin/catdesk browser-action '{"action":"content","selector":"@e5"}'
```

### 身份验证和状态持久化

```bash
# 登录一次并保存状态
~/.catpaw/bin/catdesk browser-action '{"action":"navigate","url":"https://app.example.com/login"}'
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'
~/.catpaw/bin/catdesk browser-action '[{"action":"fill","selector":"@e1","value":"user@example.com"},{"action":"fill","selector":"@e2","value":"password123"},{"action":"click","selector":"@e3"}]'
~/.catpaw/bin/catdesk browser-action '{"action":"waitforurl","url":"**/dashboard"}'
~/.catpaw/bin/catdesk browser-action '{"action":"state_save","path":"auth.json"}'

# 在将来的会话中重用
~/.catpaw/bin/catdesk browser-action '{"action":"state_load","path":"auth.json"}'
~/.catpaw/bin/catdesk browser-action '{"action":"navigate","url":"https://app.example.com/dashboard"}'
```

### 语义定位器（当引用不可用时）

```bash
~/.catpaw/bin/catdesk browser-action '{"action":"getbyrole","role":"button","name":"Submit","subaction":"click"}'
~/.catpaw/bin/catdesk browser-action '{"action":"getbylabel","label":"Email","subaction":"fill","value":"user@test.com"}'
~/.catpaw/bin/catdesk browser-action '{"action":"getbytext","text":"Sign In","subaction":"click"}'
~/.catpaw/bin/catdesk browser-action '{"action":"getbyplaceholder","placeholder":"Search","subaction":"fill","value":"query"}'
~/.catpaw/bin/catdesk browser-action '{"action":"getbytestid","testId":"submit-btn","subaction":"click"}'
```

`subaction` can be: `"click"`, `"fill"`, `"hover"`, `"check"`

### 标注截图（视觉模式）

```bash
~/.catpaw/bin/catdesk browser-action '{"action":"screenshot","annotate":true}'
# 输出包括图像路径和图例：
#   [1] @e1 button "Submit"
#   [2] @e2 link "Home"
#   [3] @e3 textbox "Email"
~/.catpaw/bin/catdesk browser-action '{"action":"click","selector":"@e2"}'
```

当页面有无标记的图标按钮或需要对元素位置进行空间推理时，使用标注截图。

### 差异检测（验证变化）

```bash
# 快照 -> 操作 -> 差异
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'
~/.catpaw/bin/catdesk browser-action '{"action":"click","selector":"@e2"}'
~/.catpaw/bin/catdesk browser-action '{"action":"diff_snapshot"}'

# 视觉回归测试
~/.catpaw/bin/catdesk browser-action '{"action":"diff_screenshot","baseline":"before.png"}'

# 比较两个页面
~/.catpaw/bin/catdesk browser-action '{"action":"diff_url","url1":"https://staging.example.com","url2":"https://prod.example.com","screenshot":true}'
```

### JavaScript 执行

```bash
~/.catpaw/bin/catdesk browser-action '{"action":"evaluate","script":"document.title"}'
~/.catpaw/bin/catdesk browser-action '{"action":"evaluate","script":"document.querySelectorAll(\"img\").length"}'
```

**注意**：JSON 转义可能会破坏复杂的 JavaScript。使用更简单的表达式或链接多个 evaluate 调用。

## 引用生命周期（重要）

Refs (`@e1`, `@e2`, etc.) are invalidated when the page changes. Always re-snapshot after:

- Clicking links or buttons that navigate
- Form submissions
- Dynamic content loading (dropdowns, modals)

```bash
~/.catpaw/bin/catdesk browser-action '{"action":"click","selector":"@e5"}'  # Navigates
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'  # MUST re-snapshot
```

## Wait Strategies

```bash
# Wait for network idle (best for slow pages)
~/.catpaw/bin/catdesk browser-action '{"action":"waitforloadstate","state":"networkidle"}'

# Wait for a specific element
~/.catpaw/bin/catdesk browser-action '{"action":"wait","selector":"@e1"}'

# Wait for URL pattern (useful after redirects)
~/.catpaw/bin/catdesk browser-action '{"action":"waitforurl","url":"**/dashboard"}'

# Wait for JavaScript condition
~/.catpaw/bin/catdesk browser-action '{"action":"waitforfunction","expression":"document.readyState === \"complete\""}'

# Fixed duration (milliseconds)
~/.catpaw/bin/catdesk browser-action '{"action":"wait","timeout":5000}'
```

## Downloads

```bash
# Click element to trigger download
~/.catpaw/bin/catdesk browser-action '{"action":"download","selector":"@e1","path":"./file.pdf"}'

# Wait for download to complete
~/.catpaw/bin/catdesk browser-action '{"action":"waitfordownload","path":"./output.zip","timeout":30000}'
```

## Performance Profiling

```bash
~/.catpaw/bin/catdesk browser-action '{"action":"profiler_start"}'
~/.catpaw/bin/catdesk browser-action '{"action":"navigate","url":"https://example.com"}'
~/.catpaw/bin/catdesk browser-action '{"action":"click","selector":"@e1"}'
~/.catpaw/bin/catdesk browser-action '{"action":"profiler_stop","path":"./trace.json"}'
```

Open trace.json in Chrome DevTools (Performance panel) or [Perfetto UI](https://ui.perfetto.dev/) for analysis.

## Viewport & Device Emulation

```bash
~/.catpaw/bin/catdesk browser-action '{"action":"viewport","width":1920,"height":1080}'
~/.catpaw/bin/catdesk browser-action '{"action":"viewport","width":1920,"height":1080,"deviceScaleFactor":2}'
~/.catpaw/bin/catdesk browser-action '{"action":"device","device":"iPhone 14"}'
~/.catpaw/bin/catdesk browser-action '{"action":"emulatemedia","colorScheme":"dark"}'
```

## Actions Reference

### Navigation
- `navigate` — `{url, waitUntil?}` Navigate to URL
- `back` / `forward` / `reload` — Browser history navigation

### Snapshot & Screenshot
- `snapshot` — `{interactive?, compact?, maxDepth?, selector?}` Get accessibility tree
- `screenshot` — `{fullPage?, selector?, annotate?}` Take screenshot
- `pdf` — `{path, format?}` Export as PDF

### Interaction
- `click` — `{selector, button?}` Click element
- `dblclick` — `{selector}` Double click
- `hover` — `{selector}` Hover
- `type` — `{selector, text, clear?}` Type character by character
- `fill` — `{selector, value}` Fill input (auto-focuses)
- `press` — `{key, selector?}` Press key
- `check` / `uncheck` — `{selector}` Toggle checkbox
- `select` — `{selector, values}` Select dropdown option
- `upload` — `{selector, files}` Upload files
- `drag` — `{source, target}` Drag and drop

### Keyboard & Scroll
- `keyboard` — `{keys, subaction?}` Press keys
- `scroll` — `{selector?, direction?, amount?}` Scroll
- `scrollintoview` — `{selector}` Scroll element into view

### Wait
- `wait` — `{timeout?}` or `{selector, state?}` Wait for element or duration
- `waitforurl` — `{url, timeout?}` Wait for URL pattern
- `waitforloadstate` — `{state}` Wait for `"networkidle"` or `"load"`
- `waitforfunction` — `{expression, timeout?}` Wait for JS expression

### Info
- `url` / `title` — Get current URL or title
- `content` — `{selector?}` Get text content
- `gettext` / `innerhtml` / `innertext` — `{selector}` Get element content
- `getattribute` — `{selector, attribute}` Get attribute
- `isvisible` / `isenabled` / `ischecked` — `{selector}` Check element state

### Tabs
- `tab_new` — `{url?}` Open new tab
- `tab_list` — List all tabs
- `tab_switch` — `{index}` Switch tab
- `tab_close` — `{index?}` Close tab

### Semantic Locators
- `getbyrole` — `{role, name?, subaction, value?}`
- `getbytext` — `{text, subaction}`
- `getbylabel` — `{label, subaction, value?}`
- `getbyplaceholder` — `{placeholder, subaction, value?}`
- `getbytestid` — `{testId, subaction, value?}`

### Storage & Network
- `cookies_get` / `cookies_set` / `cookies_clear` — Cookie management
- `storage_get` / `storage_set` / `storage_clear` — localStorage/sessionStorage
- `route` / `unroute` — Request interception
- `offline` — `{offline}` Toggle offline mode

### State & Diff
- `state_save` / `state_load` / `state_list` / `state_clear` — State persistence
- `diff_snapshot` / `diff_screenshot` / `diff_url` — Page comparison

### Advanced
- `evaluate` — `{script, args?}` Execute JavaScript
- `frame` / `mainframe` — Switch iframe context
- `dialog` — `{response, promptText?}` Handle alerts
- `download` / `waitfordownload` — File downloads
- `profiler_start` / `profiler_stop` — Performance profiling
- `viewport` / `device` / `emulatemedia` — Viewport and media emulation

## CatPaw Desk vs CLI Version

| Feature | CLI (`agent-browser`) | CatPaw Desk (Electron) |
|---------|----------------------|------------------------|
| `launch`/`close` | Required | No-op (browser always running) |
| `recording_*` | Records WebM video | No-op (not supported) |
| Session isolation | `--session` flag | Automatic via `CATPAW_CONVERSATION_ID` |
| Browser visibility | `--headed` flag | Always visible (WebContentsView) |

## Multi-Tab Handling (Important)

Clicking links may open a **new tab** (e.g. `target="_blank"`). When this happens the command response includes a `_tabChanged` notice with details. Similarly, `snapshot` responses include a `_tabContext` field when multiple tabs are open.

**Correct pattern — browse search results one by one:**

```bash
# 1. On search results page, click a result link
~/.catpaw/bin/catdesk browser-action '{"action":"click","selector":"@e3"}'
# Response may include: _tabChanged { notice: "A new tab was opened...", hint: "use tab_close to return" }

# 2. Read the new tab content
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'

# 3. Done with this result — close current tab to return to search results
~/.catpaw/bin/catdesk browser-action '{"action":"tab_close"}'

# 4. Back on search results page — re-snapshot and click next result
~/.catpaw/bin/catdesk browser-action '{"action":"snapshot","interactive":true}'
~/.catpaw/bin/catdesk browser-action '{"action":"click","selector":"@e5"}'
```

**Rules:**
- To return to a previous page after a new tab opens: **use `tab_close`** (closes current tab, auto-returns to previous tab).
- Do **NOT** use `navigate` or `back` to return — that navigates within the current tab and leaves extra tabs accumulating.
- Use `tab_list` to see all open tabs and `tab_switch` to jump between them.
- Use `tab_close` to clean up tabs you no longer need.

## Tips

- **Always prefer batch** for 2+ sequential interactions after a snapshot.
- **`fill` auto-focuses** the target element. Skip `click` if the element is already an input.
- Use `interactive:true` in snapshot to reduce output.
- Refs (`@e1..`) are invalidated after navigation. Always re-snapshot.
- Use `screenshot --annotate` for visual debugging.

## Error Handling

On failure the CLI returns JSON with `"success": false` and an `"error"` message. Common issues:

- Element not found → re-snapshot with `interactive:true` to get fresh refs.
- Timeout → increase `wait` timeout or check if the page loaded correctly.
- Element not visible → use `scrollintoview` first.
- Element disabled → check if a prerequisite action is needed.