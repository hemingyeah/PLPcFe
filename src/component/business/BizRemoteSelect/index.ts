import BizRemoteSelect from '@src/component/business/BizRemoteSelect/BizRemoteSelect.tsx'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
// @ts-ignore
BizRemoteSelect.install = (Vue: any) =>{
  Vue.component(ComponentNameEnum.BizRemoteSelect, BizRemoteSelect)
}

export default BizRemoteSelect