
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createHead } from '@vueuse/head'
const head = createHead()
const gtagScript = document.createElement('script')
gtagScript.setAttribute('async', '')
gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-M0WPETB4KH'
document.head.appendChild(gtagScript)

window.dataLayer = window.dataLayer || []
function gtag() {
  window.dataLayer.push(arguments)
}
window.gtag = gtag

gtag('js', new Date())
gtag('config', 'G-M0WPETB4KH')

createApp(App)
  .use(head)
  .use(router)
  .mount('#app')
