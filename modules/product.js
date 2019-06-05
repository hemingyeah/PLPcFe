module.exports = {
  'product.list': {
    entry: './src/modules/product/list.js'
  },
  'product.view': {
    entry: './src/modules/product/view.js',
    template: 'src/modules/product/index.html'
  },
  'product.edit': {
    entry: './src/modules/product/edit.js',
    template: 'src/modules/product/index.html'
  },
  'product.edit.modal': {
    entry: './src/modules/product/editModal.js',
  },
  'product.template.list': {
    entry: './src/modules/productTemplate/list.js'
  },
  'product.template.view': {
    entry: './src/modules/productTemplate/view.js'
  },
  'product.template.edit': {
    entry: './src/modules/productTemplate/edit.js'
  },
};