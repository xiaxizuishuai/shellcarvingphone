# 🔒 安全分发指南

## ⚠️ 重要警告

**`config.js` 文件包含您的真实 API Key，如果直接发送整个文件夹给别人，API Key 会暴露！**

## 📋 当前风险文件

以下文件包含敏感信息，不应直接分享：

- ✅ `config.js` - **包含真实的 API Key** ⚠️
- ✅ `.gitignore` - 已配置忽略 config.js（Git 版本控制）

## 🛡️ 安全分发方法

### 方法 1：手动排除敏感文件（推荐）

在发送文件夹前，**删除或重命名** `config.js` 文件：

```bash
# Windows PowerShell
Remove-Item config.js

# 或者重命名
Rename-Item config.js config.js.backup
```

**接收方需要：**
1. 复制 `config.js.example` 为 `config.js`
2. 填入自己的 API Key

### 方法 2：使用清理脚本

运行提供的清理脚本（见下方）

### 方法 3：创建分发包

创建一个不包含敏感文件的 ZIP 包

## 🧹 清理脚本

### Windows PowerShell 脚本

创建 `prepare-for-distribution.ps1`：

```powershell
# 准备分发：移除敏感文件
Write-Host "准备项目分发..." -ForegroundColor Green

# 备份 config.js（如果存在）
if (Test-Path "config.js") {
    Write-Host "发现 config.js，正在备份..." -ForegroundColor Yellow
    Copy-Item "config.js" "config.js.backup"
    Remove-Item "config.js"
    Write-Host "✓ config.js 已移除" -ForegroundColor Green
}

# 检查是否还有其他敏感文件
Write-Host "`n检查完成！现在可以安全地分享项目文件夹了。" -ForegroundColor Green
Write-Host "注意：接收方需要复制 config.js.example 为 config.js 并填入自己的 API Key" -ForegroundColor Yellow
```

### 使用方法

```powershell
# 在项目根目录运行
.\prepare-for-distribution.ps1
```

## 📦 创建安全分发包

### 手动创建 ZIP（排除 config.js）

1. 选择项目文件夹
2. 右键 → "发送到" → "压缩(zipped)文件夹"
3. **在压缩前，先删除或排除 `config.js`**

### 使用 PowerShell 创建 ZIP

```powershell
# 排除敏感文件创建 ZIP
$excludeFiles = @('config.js', 'config.js.backup', '.git', 'node_modules')
$zipName = "贝漾涌起-安全版-$(Get-Date -Format 'yyyyMMdd').zip"

Compress-Archive -Path * -DestinationPath $zipName -Exclude $excludeFiles
Write-Host "✓ 已创建安全分发包: $zipName" -ForegroundColor Green
```

## ✅ 分发检查清单

发送文件夹前，请确认：

- [ ] 已删除或排除 `config.js`
- [ ] 已包含 `config.js.example`（模板文件）
- [ ] 已包含 `README_API_CONFIG.md`（配置说明）
- [ ] 已包含 `API_INTEGRATION_GUIDE.md`（API 接入指南）

## 📝 接收方配置指南

接收项目后，需要：

1. **复制配置文件模板**
   ```bash
   # Windows
   copy config.js.example config.js
   
   # 或手动复制并重命名
   ```

2. **编辑 `config.js`**
   ```javascript
   const CONFIG = {
       GEMINI_API_KEY: "你的API_KEY"
   };
   ```

3. **获取 API Key**
   - 访问：https://makersuite.google.com/app/apikey
   - 登录 Google 账号
   - 创建新的 API Key
   - 复制到 `config.js`

4. **测试功能**
   - 打开 `3d.html`
   - 尝试与贝贝聊天
   - 检查浏览器控制台是否有错误

## 🔐 额外安全建议

### 1. API Key 安全

- ✅ 不要将 API Key 提交到 Git
- ✅ 不要分享包含真实 API Key 的文件
- ✅ 定期轮换 API Key
- ✅ 在 Google Cloud Console 中设置 API 使用限制

### 2. 生产环境建议

对于生产环境，建议：

- 使用后端代理 API 调用
- API Key 存储在服务器环境变量中
- 前端不直接调用 API

### 3. 如果 API Key 已泄露

如果 API Key 已经泄露：

1. **立即撤销泄露的 API Key**
   - 访问 Google Cloud Console
   - 删除或禁用该 API Key

2. **创建新的 API Key**
   - 生成新的 API Key
   - 更新所有使用该 Key 的地方

3. **检查 API 使用情况**
   - 查看是否有异常使用
   - 设置使用限制和告警

## 📚 相关文档

- [API 接入指南](./API_INTEGRATION_GUIDE.md)
- [API 配置说明](./README_API_CONFIG.md)

---

**记住：安全第一！分享前一定要检查敏感文件！** 🔒

