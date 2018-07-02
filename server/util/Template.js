const fs = require('fs');
const path = require('path');

module.exports = {
  /** 渲染模板（开发用） */
  render(data, script, templatePath = '../../src/index.html'){
    let buffer = fs.readFileSync(path.resolve(__dirname, templatePath));
    let template = buffer.toString();

    //注入参数
    template = template.replace('#{initJson}', JSON.stringify(data));
    
    //注入脚本
    if(Array.isArray(script) && script.length > 0) {
      let scriptHtml = '';
      script.forEach(item => scriptHtml += `<script src="${item}"></script>`)
      scriptHtml += `</body>`;

      template = template.replace('</body>', scriptHtml)
    }

    return template;    
  },
}