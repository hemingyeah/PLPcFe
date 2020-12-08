class EsTaskCustomer {
  public id?: string | null = null
  public name?: string | null = null
  public executorUserId?: string | null = null
  public createUserId?: string | null = null
  // List<LinkedHashMap>
  public  tags?: any[] = []
}

export default EsTaskCustomer