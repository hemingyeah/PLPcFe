import { getRootWindow } from '@src/util/dom'

function logStyle (message: string = '', color: string = '') {
  try {
    console.log(`%c ${message}`, `color: ${color}`)
  } catch (error) {
    console.log('logStyle -> error', error)
  }
}

function logError (message: string = '') {
  logStyle(message, 'red')
}

function logSuccess (message: string = '') {
  logStyle(message, 'green')
}

function logWarning (message: string = '') {
  logStyle(message, 'yellow')
}

function logInfo (data: any, message?: string, functionName?: string) {
  if (Array.isArray(data)) return logTable(data, message, functionName)
  
  try {
    console.info(`${functionName || ''} -> ${message || 'logInfo'} ->`, data)
  } catch (error) {
    console.warn('logInfo -> error', error)
  }

}

function logTable(data: any[], message?: string, functionName?: string) {
  try {
    (message || functionName) && logSuccess(`${functionName || ''} -> ${message || 'logTable'}`)
    console.table(data)
  } catch (error) {
    console.warn('logTable -> error', error)
  }
}

function isShowLog(): boolean {
  try {
    const RootWindow = getRootWindow(window)
    // @ts-ignore
    return window.shb.showLog === true  || RootWindow.shb.showLog === true
  } catch (error) {
    return false
  }
}

class Log {
  public static Start: string = 'start'
  public static End: string = 'end'
  public static showLog: boolean = isShowLog()
  
  public static succ(message: string, functionName?: string) {
    if (!Log.showLog) return
    
    logSuccess(`${functionName || 'logSuccess'} -> ${message}`)
  }
  
  public static error(message: string, functionName?: string) {
    if (!Log.showLog) return
    
    logError(`${functionName || 'logError'} -> ${message}`)
  }
  
  public static warn(message: string, functionName?: string) {
    if (!Log.showLog) return
    
    logWarning(`${functionName || 'logWarning'} -> ${message}`)
  }
  
  public static info(data: any, message?: string, functionName?: string) {
    if (!Log.showLog) return
    
    logInfo(data, message, functionName)
  }
}

export default Log