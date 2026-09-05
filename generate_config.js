const fs = require('fs');

// 从环境变量读取 API Key
const apiKey = process.env.DEEPSEEK_API_KEY || '';

// 动态生成 config.js 内容
const configContent = `// 此文件由 EdgeOne 部署时动态生成
const CONFIG = {
    DEEPSEEK_API_KEY: "${apiKey}"
};
`;

// 写入 config.js
fs.writeFileSync('config.js', configContent);

console.log('✅ config.js has been successfully generated from environment variables!');
