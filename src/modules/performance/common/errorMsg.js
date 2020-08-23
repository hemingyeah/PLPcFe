export default function(vue, e, ops) {
  ops = ops || {};
  console.error(e)
  if(!e.message) {
    return;
  }
  vue.$notify({
      title: ops.title || '错误',
      message: e.message,
      type: 'error'
  });
}