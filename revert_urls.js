const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir);

const baseUrl = './';

files.forEach(file => {
    if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.json')) {
        let content = fs.readFileSync(path.join(dir, file), 'utf8');
        // Replace absolute URL back to relative path
        let newContent = content.split(baseUrl).join('./');
            
        if (content !== newContent) {
            fs.writeFileSync(path.join(dir, file), newContent, 'utf8');
            console.log(`Reverted URLs in ${file}`);
        }
    }
});
console.log('Path reversion completed!');
