export default {
  name: 'form-desing-mixin',
  data() {
    return {};
  },
  methods: {
    computedFormWidthAndHeight(className) {
      let el = document.getElementsByClassName(className)[0];
      if(!el) return ;

      let width = el.clientWidth;
      let height = el.clientHeight;

      if(!width || !height) return;

      height = height - 120;
      height = height > 800 ? 800 : height;
      width = width - 630;

      let ratioWidth = height * 0.75;
      width = ratioWidth > width ? width : ratioWidth;
      width = width > 460 ? 460 : width;

      let formEl = document.getElementsByClassName('form-design-center')[0];
      if(!formEl) return;

      formEl.style.width = `${width}px`;
      formEl.style.height = `${height}px`;
    },
  }
}