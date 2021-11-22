<template>
  <v-app>
    <v-app-bar app color="#222" dark>
      <div class="d-flex align-center mr-3">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://i.imgur.com/8vw1KOh.png"
          transition="scale-transition"
          width="40"
        />

        <span>Stellar Asset Explorer</span>
      </div>

      <v-btn text to="/" color="primary">Account Flow</v-btn>
      <v-btn text to="/asset-flow" color="primary">Asset Flow</v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    //
  }),
};
</script>
