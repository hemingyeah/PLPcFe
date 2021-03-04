/* model */
import { SynAddressBookResult } from '@model/param/out/DD'
/* util */
import http from '@src/util/http'

export function synAddressBook(corpId: string): Promise<SynAddressBookResult> {
  return http.get('/dd/synAddressBook', { corpId })
}