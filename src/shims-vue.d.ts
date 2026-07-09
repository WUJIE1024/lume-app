/**
 * 全局类型声明：让 TypeScript 认识 .vue 文件。
 * 解决 src/main.ts 引入 ./App.vue 时 TS2307 的报错。
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare const __DEV__: boolean
