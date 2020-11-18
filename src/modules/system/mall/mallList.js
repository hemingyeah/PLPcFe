// components
import SpareParts from './components/spareParts'
import Service from './components/service'

export default {
  name: "mall-list",
  inject: ['initData'],
  data() {
    return {
      editableTabsValue: '1', //tab切换
    }
  },
  methods: {
    back() {
      window.history.back(-1)
    }
  },
  components: {
    [SpareParts.name]: SpareParts,
    [Service.name]: Service
  }
};