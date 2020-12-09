import { Vue } from 'vue-property-decorator'

export default class VC<P = {}> extends Vue {
  readonly $props!: P
}