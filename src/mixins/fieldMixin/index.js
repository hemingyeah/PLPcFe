export default {
  name: 'field-mixin',
  data() {
    return {};
  },
  computed: {
    fieldDesignHeight() {
      return window.innerHeight || document.documentElement.clientHeight || 730;
    }
  },
  methods: {
    setFieldDesignHeight() {
      let elements = document.getElementsByClassName('form-design-center');
      
      if(elements.length) {
        let el = elements[0];
        el.style.height = `${this.fieldDesignHeight - 130}px`;
      }
    }
  }
}