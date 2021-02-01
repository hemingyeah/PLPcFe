import GoodsDialog from './GoodsDialog.vue'
import OutStockDialog from './OutStockDialog.vue'

// import BaseGallery from '../../../../../packages/BaseGallery';



export default {
  data() {
    return {
      stateObj: {
        1: {
          name: '待发货',
          key: 'unDeliveredCount',
        },
        2: {
          name: '待收货',
          key: 'unReceivedCount',
        },
        3: {
          name: '已完成',
          key: 'completedCount',
        },
      },
      payObj: {
        1: {
          name: '微信支付'
        }
      }
    }
  },
  components: {
    [GoodsDialog.name]: GoodsDialog,
    [OutStockDialog.name]: OutStockDialog,
  },
  methods: {

    previewImg(url) {
      this.$previewImg(url)
      // if (!url) return
      // let imgDom = document.createElement('img');
      // imgDom.src = url;
      // BaseGallery.preview(imgDom);
    },
  }
}