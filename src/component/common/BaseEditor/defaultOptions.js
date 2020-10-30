import Quill from 'quill'
import './style.scss';

//quill编辑器的字体
let fonts = ['SimSun', 'SimHei', 'KaiTi', 'FangSong', 'Arial', 'Times-New-Roman', 'sans-serif'];  
let Font = Quill.import('formats/font');  
Font.whitelist = fonts; //将字体加入到白名单 
Quill.register(Font, true);

let fontSizeStyle = Quill.import('attributors/style/size');
let sizes = ['10px', '12px', '14px', '16px', '20px', '24px', '36px'];
fontSizeStyle.whitelist = sizes;
Quill.register(fontSizeStyle, true);

export const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],
  
  [{'header': 1}, {'header': 2}], // custom button values
  [{'list': 'ordered'}, {'list': 'bullet'}],
  [{'script': 'sub'}, {'script': 'super'}], // superscript/subscript
  [{'indent': '-1'}, {'indent': '+1'}], // outdent/indent
  [{'direction': 'rtl'}], // text direction
  
  [{'size': sizes}], // custom dropdown
  // [{'header': [1, 2, 3, 4, 5, 6, false]}],
  
  [{'color': []}, {'background': []}], // dropdown with defaults from theme
  [{'font': fonts}],
  [{'align': []}],
  
  ['link', 'image'],
  ['clean'] // remove formatting button
];