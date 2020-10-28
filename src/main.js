import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import {auth} from './firebase'
import './assets/scss/app.scss'
import './registerServiceWorker'

Vue.config.productionTip = false

// ensure firebase initializes before loading
// the app when a user refreshes a page
let app
auth.onAuthStateChanged(user => {
  if (!app) {
    app = new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  }

  if (user) {
    store.dispatch('fetchUserProfile', user)
  }
})

