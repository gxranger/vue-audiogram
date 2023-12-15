import AudiogramCanvas from "./audiogram-canvas/index"
import {App} from "vue";
const comps = [AudiogramCanvas]
console.log(AudiogramCanvas)
const install = (Vue:App) =>{
  comps.map((component:any)=>{
    console.log(component.name, 'component')
    Vue.component(component.name as string, component);
  })
}

const windowObj = window as any
/* 支持使用标签的方式引入 */
if (typeof windowObj !== 'undefined' && windowObj.Vue) {
  install(windowObj.Vue);
}

export default install
