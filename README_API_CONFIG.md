# API 配置说明

## Gemini API Key 配置

为了使用贝贝的 AI 对话功能，需要配置 Gemini API Key。

### 配置步骤

1. **获取 API Key**
   - 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
   - 登录您的 Google 账号
   - 创建新的 API Key

2. **配置 API Key**
   - 复制 `config.js.example` 文件为 `config.js`
   ```bash
   cp config.js.example config.js
   ```
   - 打开 `config.js` 文件
   - 将 `YOUR_API_KEY_HERE` 替换为您的实际 API Key
   ```javascript
   const CONFIG = {
       GEMINI_API_KEY: "您的API_KEY"
   };
   ```

3. **验证配置**
   - 打开 `3d.html` 页面
   - 打开浏览器控制台（F12）
   - 如果看到警告信息，说明 API Key 未正确配置
   - 如果配置正确，可以与贝贝进行对话

### 安全提示

⚠️ **重要**：
- `config.js` 文件已添加到 `.gitignore`，不会被提交到版本控制系统
- 请勿将包含真实 API Key 的 `config.js` 文件提交到 Git
- 如果需要在团队中共享，请使用安全的密钥管理工具

### 故障排除

如果遇到问题：

1. **API Key 未配置**
   - 检查 `config.js` 文件是否存在
   - 检查 `config.js` 中的 `GEMINI_API_KEY` 是否已设置

2. **API 调用失败**
   - 检查 API Key 是否有效
   - 检查网络连接
   - 查看浏览器控制台的错误信息

3. **CORS 错误**
   - Gemini API 支持 CORS，如果遇到问题，可能需要配置代理服务器

### 相关链接

- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Gemini API 文档](https://ai.google.dev/docs)

