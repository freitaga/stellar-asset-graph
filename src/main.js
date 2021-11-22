import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

import axios from 'axios'
import VueAxios from 'vue-axios'

import VueLodash from 'vue-lodash'
import lodash from 'lodash'
import VueGoogleCharts from 'vue-google-charts'

Vue.use(require('vue-moment'));
Vue.use(VueGoogleCharts)
Vue.use(VueAxios, axios)
Vue.use(VueLodash, { name: 'custom', lodash: lodash })

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
