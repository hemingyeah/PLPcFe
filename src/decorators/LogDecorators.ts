import { createDecorator } from 'vue-class-component'
import Log from '@src/util/log.ts'

// Declare Log decorator.
// const LogDecorators = createDecorator((options: any, key) => {
//   // Keep the original method for later.
//   const originalMethod = options?.methods?.[key]
//   Log.info(options, 'LogDecorators:', 'createDecorator')
//   if (!originalMethod) return
//   // Wrap the method with the logging logic.
//   // @ts-ignore
//   options.methods[key] = function wrapperMethod(...args) {
//     // Print a log.
//     Log.info(args, 'Invoked:', key)
//     // Invoke the original method.
//     originalMethod.apply(this, args)
//   }
// })

function LogDecorators() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = target[propertyKey]
      // @ts-ignore
      target[propertyKey] = function wrapperMethod(...args) {
        // Print a log.
        Log.info(args, 'Invoked:', propertyKey)
        // Invoke the original method.
        originalMethod.apply(this, args)
      }
  }
}

export default LogDecorators