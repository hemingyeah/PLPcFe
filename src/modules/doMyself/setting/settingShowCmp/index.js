import CompanyCard from './CompanyCard.vue'
import IconList from './IconList.vue'
import ShopsList from './ShopsList.vue'
import WikiEnter from './WikiEnter.vue'


import CompanyCardData from '../settingDataCmp/CompanyCardData.vue'
import IconListData from '../settingDataCmp/IconListData.vue'
import ShopsListData from '../settingDataCmp/ShopsListData.vue'
import WikiEnterData from '../settingDataCmp/WikiEnterData.vue'


export default {
  components: {
    [CompanyCard.name]: CompanyCard,
    [IconList.name]: IconList,
    [ShopsList.name]: ShopsList,
    [WikiEnter.name]: WikiEnter,
    [CompanyCardData.name]: CompanyCardData,
    [IconListData.name]: IconListData,
    [ShopsListData.name]: ShopsListData,
    [WikiEnterData.name]: WikiEnterData
  }
}