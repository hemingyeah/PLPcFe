
/**
 * 报表mixins
 */

const HistogramsMixin = {

  computed: {
    /**
     * 当前charts页码数
     */
    chartsPage() {
      let length = (this.data || {}).data.length;
      let ins = length > (this.max / 2);

      return ins ? 2 : 1;
    },
    needPage() {
      return this.chartsPage > 1;
    }
  },

  methods: {
    /**
     * 格式化获取的数据，作为charts基准数据
     * 不满max个填充空数据
     * 为echarts排序再次倒序
     */
    getFormatOriginData () {
      let data = ((this.data || {}).data || []).map((item, idx) => {
        item.idx = idx + 1;
        return item;
      })
      let max = this.max / 2;

      let dataP1 = data.slice(0, 5);
      let dataP2 = data.slice(5, 10);

      const getPaddingList = (list) => {
        if (list.length >= max) return list;

        let subNum = max - list.length;
        let suppleData = [];
        for (let i = 0; i < subNum; i++) {
          // hidden 用于标记markPoint隐藏
          suppleData.push({ hidden: true });
        }
        list = list.concat(suppleData);
        return list;
      }

      // 排序
      return {
        dataP1: getPaddingList(dataP1),
        dataP2: getPaddingList(dataP2)
      }
    },

  },

};

export default HistogramsMixin;
