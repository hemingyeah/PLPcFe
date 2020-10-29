/* 用户状态 */
export interface UserState {
  key: string,
  value: string,
  label: string,
  color: string,
}

export interface ElSelectOption {
  [x: string]: string
}