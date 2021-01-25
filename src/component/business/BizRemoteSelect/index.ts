import BizRemoteSelect from '@src/component/business/BizRemoteSelect/BizRemoteSelect.tsx'

BizRemoteSelect.install = (Vue: any) =>{
  Vue.component(BizRemoteSelect.name, BizRemoteSelect)
}

export default BizRemoteSelect