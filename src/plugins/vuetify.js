import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      light: {
        primary: '#111',
        secondary: '#222222',
        accent: '#3f51b5',
        error: '#f44336',
        warning: '#ff9800',
        info: '#607d8b',
        success: '#4caf50',
        background: '#e7f0f2'
      },
      dark: {
        primary: '#66ff9e',
        secondary: '#4DD0E1',
        accent: '#3f51b5',
        error: '#f44336',
        warning: '#ff9800',
        info: '#607d8b',
        success: '#4caf50',
        background: "#121212"
      }
    }
  }
});
