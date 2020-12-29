import { isExperienceEdition } from '@src/util/version.ts'

export default {
  name: 'version-mixin',
  computed: {
    /** 
     * @description 是否为体验版
     * ! 体验版限制了导入功能
    */
    isExperienceEdition() {
      return isExperienceEdition()
    }
  }
}