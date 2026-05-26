const fs = require('fs');

function replaceFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/sessionStorage/g, 'localStorage');
  fs.writeFileSync(path, content, 'utf8');
  console.log(`Replaced in ${path}`);
}

replaceFile('src/pages/Messages.tsx');
replaceFile('src/pages/Chat.tsx');
