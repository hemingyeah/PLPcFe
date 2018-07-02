const fs = require('fs');
const path = require('path');

const ROOT_PATH = path.resolve(__dirname,'../../')
console.log(ROOT_PATH)

module.exports = {
  /** 渲染模板（开发用） */
  render(title = '售后宝', data = {}, script, templatePath = 'src/index.html'){
    let buffer = fs.readFileSync(path.resolve(ROOT_PATH, templatePath));
    let template = buffer.toString();
    
    //注入标题
    template = template.replace('#{title}', title)

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