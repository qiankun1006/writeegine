# Git 远程仓库配置

## GitHub 仓库

- **仓库地址**：https://github.com/qiankun1006/writeegine
- **账号**：qiankun1006

## Personal Access Token

```
<YOUR_PAT_TOKEN>   （本地保存，不提交到 git）
```

- **过期时间**：2026-07-15
- **权限**：Contents - Read and write（仅 writeegine 仓库）

## 推送命令

```bash
git remote set-url origin https://qiankun1006:<YOUR_PAT_TOKEN>@github.com/qiankun1006/writeegine.git
git push origin master
```