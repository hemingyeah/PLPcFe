import { Vue } from 'vue-property-decorator'

export default class VC<Props = {}> extends Vue {
  readonly $props!: Props
  readonly $fast!: {
    biz: {
      initVersionLimitDialog: () => Vue,
      initTeamSelect: () => Vue,
    }
  }
}