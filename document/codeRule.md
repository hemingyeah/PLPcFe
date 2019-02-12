# Javascript 风格指南

[参考](https://github.com/lin-123/javascript)

### References
- 所有的赋值都用`const`，避免使用`var`。eslint: [prefer-const](https://eslint.org/docs/rules/prefer-const.html)、[no-const-assign](https://eslint.org/docs/rules/no-const-assign.html)
- 如果对参数一定要进行重新赋值，用`let`，而不是`var`。eslint: [no-var](https://eslint.org/docs/rules/no-var.html)

### Objects
- 用对象方法简写。 eslint: [object-shorthand](https://eslint.org/docs/rules/object-shorthand.html)
- 只对那些无效的标示使用引号 ''. eslint: [quote-props](https://eslint.org/docs/rules/quote-props.html)

### Arrays
- 数组需要返回值的方法必须要有return。eslint: [array-callback-return](https://eslint.org/docs/rules/array-callback-return)

### Strings
- 对string用单引号 '' 。 eslint: [quotes](https://eslint.org/docs/rules/quotes.html)
- 用字符串模板而不是字符串拼接来组织可编程字符串。 eslint: [prefer-template](https://eslint.org/docs/rules/prefer-template.html) [template-curly-spacing](https://eslint.org/docs/rules/template-curly-spacing)
- 永远不要在字符串中用eval()，他就是潘多拉盒子。 eslint: [no-eval](https://eslint.org/docs/rules/no-eval)

### Functions
- 不要在非函数块（if、while等等）内声明函数。把这个函数分配给一个变量。浏览器会允许你这样做，但浏览器解析方式不同，这是一个坏消息。eslint: [no-loop-func](https://eslint.org/docs/rules/no-loop-func.html)
- 不要改参数. eslint: [no-param-reassign](https://eslint.org/docs/rules/no-param-reassign.html)

### Arrow Functions
- 8.1 当你一定要用函数表达式（在回调函数里）的时候就用箭头表达式吧。 eslint: [prefer-arrow-callback](https://eslint.org/docs/rules/prefer-arrow-callback.html), [arrow-spacing](https://eslint.org/docs/rules/arrow-spacing.html)

### Comparison Operators & Equality
- 用 === 和 !== 而不是 == 和 !=. eslint: [eqeqeq](https://eslint.org/docs/rules/eqeqeq.html)

- 避免不需要的三元表达式。eslint rules: [no-unneeded-ternary](https://eslint.org/docs/rules/no-unneeded-ternary.html).

- 如果 if 语句中总是需要用 return 返回， 那后续的 else 就不需要写了。 if 块中包含 return， 它后面的 else if 块中也包含了 return， 这个时候就可以把 return 分到多个 if 语句块中。 eslint: [no-else-return](https://eslint.org/docs/rules/no-else-return)

### Destructuring
- 用对象的解构赋值来获取和使用对象某个或多个属性值。 eslint: [prefer-destructuring](https://eslint.org/docs/rules/prefer-destructuring)


- tab用两个空格. eslint: [indent](https://eslint.org/docs/rules/indent.html)
