import Auth from '@model/entity/Auth'

class InitDataLoginUser {
  userId?: string = ''
  displayName?: string = ''
  staffId?: string = ''
  head?: string = ''
  authorities?: Auth = {}
  tagIds?: string[] = []
  tagIdsWithChildTag?: string[] = []
}

export default InitDataLoginUser