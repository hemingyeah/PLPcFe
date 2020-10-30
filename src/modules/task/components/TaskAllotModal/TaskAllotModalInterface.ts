export interface User {
  displayName: string
  head?: string
  staffId?: string
  userId: string
}

/* 部门多选选人返回结果 */
export interface DepeMultiUserResult { 
  status: number, 
  data: { 
    users: User[] 
  } 
}