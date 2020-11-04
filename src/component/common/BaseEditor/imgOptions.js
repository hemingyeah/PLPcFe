import { Quill } from 'vue-quill-editor'

// 源码中是import直接倒入，这里要用Quill.import引入
const BlockEmbed = Quill.import('blots/block/embed')

export default class ImageBlot extends BlockEmbed {
  static create(value) {
      let node = super.create();
      node.setAttribute('src', value.src);
      node.setAttribute('data-origin', value.origin);
      return node;
  }

  static value(node) {
      return {
          src: node.getAttribute('src'),
          origin: node.getAttribute('data-origin')
      }
  }
}
ImageBlot.blotName = 'image';
ImageBlot.tagName = 'img';

