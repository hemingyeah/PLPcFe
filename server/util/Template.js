const fs = require('fs');
const path = require('path');

const ROOT_PATH = path.resolve(__dirname,'../../')

module.exports = {
  renderWithHtml(title, html = '', script, templatePath = 'src/index.html'){
    let js = this.parseHtml(html);
    return this.render(title, js, script, templatePath);
  },
  renderWithData(title, data = {}, script, templatePath = 'src/index.html'){
    let js = `window._init = '${JSON.stringify(data)}';`
    return this.render(title, js, script, templatePath);
  },
  /** 渲染模板（开发用） */
  render(title = '售后宝', js, script, templatePath = 'src/index.html'){
    let buffer = fs.readFileSync(path.resolve(ROOT_PATH, templatePath));
    let template = buffer.toString();
    
    //注入标题
    template = template.replace('#{title}', title)
    //注入参数
    template = template.replace(`<script data-init="js">window._init = '#{initJson}';</script>`, `<script data-init="js">${js}</script>`);
    
    //注入脚本
    if(Array.isArray(script) && script.length > 0) {
      let scriptHtml = '';
      script.forEach(item => scriptHtml += `<script src="${item}"></script>`)
      scriptHtml += `</body>`;

      template = template.replace('</body>', scriptHtml)
    }

    return template;    
  },
  /** 提取script中的数据 */
  parseHtml(html){
    let scriptReg = /<script data-init="js">(.*?)<\/script>/;
    let result = scriptReg.exec(html);

    return result ? result[1] : null;
  }
}