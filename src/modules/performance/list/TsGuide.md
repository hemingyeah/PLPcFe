# TypeScript

## 基础类型

```typescript
 let isDone: boolean = true;
 let count: number = 6;
 let name: string = 'AaronMao';
 let list: number[] = [1, 2, 4];
 let taskList: Array<number> = [1, 3, 5, 7];
 let eventList: any[] = [1, '123', true]
```

##### 元组 ？
```typescript
let x: [string, number];
x = ['', 1];
// x = [1, ''];  Error
```

##### 枚举
```typescript
enum Color {
  Red,
  Green,
  Blue,
}
// enum Color {Red = 1, Green, Blue} 指定起始值
// enum Color {Red = 1, Green = 2, Blue = 4} 全部手动赋值

let c: Color = Color.Green; // c = 1;

let colorName: string = Color[2]; // colorName = Blue;

```

##### Any
```typescript
let notSure: any = 4;
notSure = "maybe a string instead";
notSure = false; // okay, definitely a boolean
let list: any[] = [1, true, "free"];

```

##### Void ？
> 不表示任何值，只能被赋予 null 或者undefined
##### Null 和 Undefined
> 各自的类型分别是null和undefined，是所有类型的子类型，比如可以赋值给number类型的变量，但不建议。

##### Never ？
##### Object ？

##### 类型断言 ？
```typescript
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;

let strLength: number = (someValue as string).length;
```
