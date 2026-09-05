# 贝贝聊天功能 API 接入指南

## 📋 概述

贝贝的聊天功能基于 **Google Gemini API** 实现，提供了智能对话能力。本文档详细说明如何配置和使用该功能。

## 🔑 API 配置步骤

### 1. 获取 Gemini API Key

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 使用 Google 账号登录
3. 点击 "Create API Key" 创建新的 API Key
4. 复制生成的 API Key（格式类似：`AIzaSy...`）

### 2. 配置 API Key

1. **检查配置文件是否存在**
   ```bash
   # 如果 config.js 不存在，从示例文件复制
   cp config.js.example config.js
   ```

2. **编辑 `config.js` 文件**
   ```javascript
   const CONFIG = {
       GEMINI_API_KEY: "你的API_KEY_在这里"
   };
   ```

3. **验证配置**
   - 打开浏览器控制台（F12）
   - 访问 `3d.html` 页面
   - 如果看到警告信息，说明 API Key 未正确配置
   - 如果配置正确，可以与贝贝进行对话

## 🔌 API 调用详解

### 当前实现位置

聊天功能的 API 调用代码位于 `3d.html` 文件的 `sendMessage()` 函数中（第 1048-1103 行）。

### API 端点

```javascript
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
```

### 请求格式

```javascript
{
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
        contents: [{ 
            parts: [{ 
                text: "用户输入的消息" 
            }] 
        }],
        systemInstruction: { 
            parts: [{ 
                text: "系统提示词（定义贝贝的性格和行为）" 
            }] 
        }
    })
}
```

### 响应格式

```javascript
{
    candidates: [{
        content: {
            parts: [{
                text: "贝贝的回复内容"
            }]
        }
    }]
}
```

## 💻 代码实现细节

### 1. API Key 读取

```javascript
// 从 config.js 读取 API Key
const apiKey = CONFIG && CONFIG.GEMINI_API_KEY ? CONFIG.GEMINI_API_KEY : "";

// 检查是否配置
if (!apiKey) {
    console.warn("⚠️ Gemini API Key 未配置！请在 config.js 中设置 GEMINI_API_KEY");
}
```

### 2. 发送消息函数

```javascript
async function sendMessage() {
    const inputEl = document.getElementById('user-input');
    const message = inputEl.value.trim();
    if (!message) return;

    // 1. 显示用户消息
    addMessageToChat(message, 'user');
    inputEl.value = '';
    
    // 2. 显示加载状态
    const loadingMsgId = addMessageToChat('贝贝正在思考...', 'loading');
    const sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = true;

    // 3. 准备系统提示词
    const systemPrompt = "你叫贝贝(Beibei)，一只可爱的3D小熊，有仙女翅膀。你住在数字世界里。你性格活泼、友善，喜欢吃蜂蜜、甜点，还喜欢亮晶晶的宝石。你的回答要简短、可爱，多用颜文字(emoji)。如果是中文对话请用中文回复。不要长篇大论。";
    
    try {
        // 4. 调用 Gemini API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });

        const data = await response.json();
        
        // 5. 移除加载消息
        const messagesDiv = document.getElementById('chat-messages');
        const loadingMsg = document.getElementById(loadingMsgId);
        if(loadingMsg) messagesDiv.removeChild(loadingMsg);

        // 6. 处理响应
        if (data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            addMessageToChat(reply, 'bot');
            
            // 7. 触发3D动作：跳跃表示开心
            triggerJump();
        } else {
            addMessageToChat('贝贝好像走神了... (API Error)', 'bot');
        }

    } catch (error) {
        console.error(error);
        const messagesDiv = document.getElementById('chat-messages');
        const loadingMsg = document.getElementById(loadingMsgId);
        if(loadingMsg) messagesDiv.removeChild(loadingMsg);
        addMessageToChat('贝贝连不上网啦... 🌐', 'bot');
    } finally {
        sendBtn.disabled = false;
        inputEl.focus();
    }
}
```

## 🎨 自定义系统提示词

你可以修改 `systemPrompt` 来改变贝贝的性格和回答风格：

```javascript
const systemPrompt = `
你叫贝贝(Beibei)，一只可爱的3D小熊，有仙女翅膀。
你住在数字世界里。

性格特点：
- 活泼、友善
- 喜欢吃蜂蜜、甜点
- 喜欢亮晶晶的宝石
- 热爱贝雕艺术

回答风格：
- 简短、可爱
- 多用颜文字(emoji)
- 中文对话用中文回复
- 不要长篇大论
`;
```

## 🔧 切换到其他 API

如果你想使用其他 AI API（如 OpenAI、Claude 等），需要修改以下部分：

### 1. 修改 API 端点

```javascript
// OpenAI 示例
const apiUrl = 'https://api.openai.com/v1/chat/completions';
```

### 2. 修改请求格式

```javascript
// OpenAI 示例
const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
        ]
    })
});
```

### 3. 修改响应处理

```javascript
// OpenAI 示例
const data = await response.json();
const reply = data.choices[0].message.content;
```

## 🛡️ 安全注意事项

### ⚠️ 重要提示

1. **不要提交 API Key 到 Git**
   - `config.js` 应该添加到 `.gitignore`
   - 使用 `config.js.example` 作为模板

2. **API Key 保护**
   - 在生产环境中，建议使用后端代理
   - 不要在前端代码中硬编码 API Key
   - 考虑使用环境变量或密钥管理服务

3. **CORS 问题**
   - Gemini API 支持 CORS
   - 如果遇到 CORS 错误，可能需要配置代理服务器

### 后端代理方案（推荐）

```javascript
// 前端调用自己的后端
const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message })
});

// 后端处理（Node.js 示例）
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
        })
    });
    const data = await response.json();
    res.json(data);
});
```

## 🐛 故障排除

### 1. API Key 未配置

**症状**：控制台显示警告，无法发送消息

**解决方案**：
- 检查 `config.js` 文件是否存在
- 确认 `GEMINI_API_KEY` 已正确设置
- 检查 API Key 是否有效

### 2. API 调用失败

**症状**：显示 "贝贝连不上网啦..."

**解决方案**：
- 检查网络连接
- 验证 API Key 是否有效
- 查看浏览器控制台的错误信息
- 检查 API 配额是否用完

### 3. CORS 错误

**症状**：浏览器控制台显示 CORS 相关错误

**解决方案**：
- Gemini API 支持 CORS，通常不会有此问题
- 如果遇到，考虑使用后端代理

### 4. 响应格式错误

**症状**：显示 "贝贝好像走神了... (API Error)"

**解决方案**：
- 检查 API 响应格式是否正确
- 查看控制台的 `data` 对象
- 确认 API 版本和端点是否正确

## 📊 API 使用限制

### Gemini API 限制

- **免费额度**：每月有一定的免费请求次数
- **速率限制**：每分钟请求次数有限制
- **模型版本**：当前使用 `gemini-2.5-flash`

### 优化建议

1. **添加请求节流**：防止用户快速点击
2. **实现消息缓存**：相同问题不重复请求
3. **添加错误重试**：网络错误时自动重试
4. **监控 API 使用**：跟踪 API 调用次数和成本

## 📚 相关资源

- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Gemini API 文档](https://ai.google.dev/docs)
- [Gemini API 参考](https://ai.google.dev/api/rest)

## 🔄 更新日志

- **2025-01-XX**：初始版本
- 当前模型：`gemini-2.5-flash`

---

如有问题，请查看浏览器控制台的错误信息，或参考 [README_API_CONFIG.md](./README_API_CONFIG.md)。

