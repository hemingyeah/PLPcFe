// components
import SpareParts from './components/spareParts'
import Service from './components/service'

export default {
  name: "mall-list",
  data() {
    return {
      editableTabsValue: '1'
    }
  },
  components: {
    [SpareParts.name]: SpareParts,
    [Service.name]: Service
  }
};