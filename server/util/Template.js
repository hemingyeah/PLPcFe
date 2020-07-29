const fs = require('fs');
const path = require('path');

const ROOT_PATH = path.resolve(__dirname, '../../')

module.exports = {
  // 临时 渲染备件
  renderWithHtmlForPart(title, html = '', script, templatePath = 'src/index.html'){
    let js = this.parseHtmlForPart(html);
    return this.render(title, js, script, templatePath);
  },
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
    let template = fs.readFileSync(path.resolve(ROOT_PATH, templatePath), 'utf-8');
    
    // 注入标题
    template = template.replace('#{title}', title)
    // 注入参数
    template = template.replace('<script data-init="js">window._init = \'#{initJson}\';</script>', `<script data-init="js">${js}</script>`);
    
    // 注入脚本
    if(Array.isArray(script) && script.length > 0) {
      let scriptHtml = '';
      script.forEach(item => scriptHtml += `<script src="${item}"></script>`)
      scriptHtml += '</body>';

      template = template.replace('</body>', scriptHtml)
    }

    return template;    
  },
  /** 提取script中的数据 */
  parseHtml(html){
    let scriptReg = /<script data-init="js">(.*?)<\/script>/;
    let result = scriptReg.exec(html);

    return result ? result[1] : null;
  },
  /** 临时 提取script中的数据 */
  parseHtmlForPart(html){
    let initDataStr = '<script>var _init_data =';
    let newInitDataStr = 'window._init =';
    
    let htmlArr = html.split(initDataStr) || [];
    let initDataAfterHtml = htmlArr[1] || '';

    let initDataAfterHtmlArr = initDataAfterHtml.split('</script>') || [];
    let initData = initDataAfterHtmlArr[0] ? `${newInitDataStr} ${initDataAfterHtmlArr[0]}` : null;
  
    return initData;
  },

}