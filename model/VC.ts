import { Vue } from 'vue-property-decorator'

export default class VC<P = {}> extends Vue {
  // 安装方法
  static install: (Vue: any) => void
  // 属性
  readonly $props!: P
}