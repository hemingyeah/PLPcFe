import Quill from 'quill'

//quill编辑器的字体
let Font = Quill.import('formats/font');  
// Font.whitelist = fonts; //将字体加入到白名单 
Quill.register(Font, true);

let fontSizeStyle = Quill.import('attributors/style/size');
let sizes = ['12px', '14px', '16px'];
fontSizeStyle.whitelist = sizes;
Quill.register(fontSizeStyle, true);

export const toolbarOptions = [
  ['bold', 'italic', 'underline'],
  [{'size': sizes}],
  [{'color': []},{'align': []}],
  ['link', 'image','video'] 
];
