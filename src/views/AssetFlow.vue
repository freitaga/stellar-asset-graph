<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-3">
          <v-text-field
            hide-details
            outlined
            label="Account Address"
            v-model="asset"
            class="mr-2"
          ></v-text-field>
          <!-- <v-btn text @click="generateGraph" color="primary">
            <v-icon>mdi-magnify</v-icon>Search
          </v-btn> -->
          <v-btn text @click="generateGraph" color="primary">
            <v-icon>mdi-magnify</v-icon>Create
          </v-btn>
          <!-- <v-btn text @click="clearGraph" color="secondary"> Reset </v-btn> -->
          <v-btn-toggle v-model="network" tile color="primary" group>
            <v-btn value="main"> Mainnet </v-btn>
            <v-btn value="test"> Testnet </v-btn>
          </v-btn-toggle>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="d-flex align-center">
          <v-text-field
            outlined
            v-model="limit"
            label="# Payments"
            hide-details
            type="number"
          ></v-text-field>
          <v-btn text @click="generateGraph" color="primary" disabled>
            Next Page
          </v-btn>
        </div>
      </v-col>

      <v-col cols="12">
        <div id="sankey_basic"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// eslint-disable-next-line
import { GoogleCharts } from "google-charts";

// async function drawChart() {
//   var data = new GoogleCharts.api.visualization.DataTable();
//   data.addColumn("string", "From");
//   data.addColumn("string", "To");
//   data.addColumn("number", "Weight");
//   data.addRows([
//     ["A", "X", 5],
//     ["A", "Y", 7],
//     ["A", "Z", 6],
//     ["B", "X", 2],
//     ["B", "Y", 9],
//     ["B", "Z", 4],
//   ]);

//   // Sets chart options.
//   var options = {
//     width: 600,
//   };

//   console.log(GoogleCharts.api.visualization);

//   // Instantiates and draws our chart, passing in some options.
//   var chart = new GoogleCharts.api.visualization.Sankey(
//     document.getElementById("sankey_basic")
//   );
//   chart.draw(data, options);
// }

export default {
  name: "AssetFlow",
  created() {
    GoogleCharts.load(this.createGraph, {
      packages: ["sankey"],
    });
  },
  data() {
    return {
      chart: null,
      options: null,
      graphData: [],
      data: [],
      graph: null,
      nodes: [],
      links: [],
      asset: null,
      network: "main",
      timeSlot: 0,
      nextPageUrl: null,
      generation: 0,
      limit: 20,
      colors: [
        "#a6cee3",
        "#b2df8a",
        "#fb9a99",
        "#fdbf6f",
        "#cab2d6",
        "#ffff99",
        "#1f78b4",
        "#33a02c",
      ],
    };
  },
  methods: {
    resetGraph() {
      this.nodes = [];
      this.graphData = [];
      this.links = [];
      this.generation = 0;
      this.graph = null;
      this.data = [];
      if (this.chart) {
        console.log("clearing chart");
        this.chart.clearChart();
      }
    },
    async generateGraph() {
      if (this.chart) {
        this.resetGraph();
      }
      await this.getPaymentsByAsset(this.asset);
      this.createGraph();
      //this.incrementTimeSlot();
    },
    // incrementTimeSlot() {
    //   this.timeSlot++;
    // },
    createGraph() {
      this.graphData = new GoogleCharts.api.visualization.DataTable();
      this.graphData.addColumn("string", "From");
      this.graphData.addColumn("string", "To");
      this.graphData.addColumn("number", "Weight");
      this.graphData.addRows(this.data);

      // Sets chart options.
      this.options = {
        width: window.innerWidth - 50,
        height: window.innerHeight - 250,
        sankey: {
          node: {
            colors: this.colors,
          },
          link: {
            colorMode: "gradient",
            colors: this.colors,
          },
        },
      };

      // Instantiates and draws our chart, passing in some options.
      this.chart = new GoogleCharts.api.visualization.Sankey(
        document.getElementById("sankey_basic")
      );
      this.chart.draw(this.graphData, this.options);
    },
    async getPaymentsByAsset(asset) {
      let url = this.getPaymentsUrlByAsset(asset);

      await this.axios.get(url).then((response) => {
        this.payments = response.data._embedded.records;
        this.nextPageUrl =
          "https://api.stellar.expert" + response.data._links.next.href;
        this.parseAssetData();
      });
    },
    parseAssetData() {
      //set data nodes & links

      for (let i = 0; i < this.payments.length; i++) {
        console.log(this.generation);
        let payment = this.payments[i];

        this.setGraphData(payment);
        this.setGeneration();
      }
    },
    setGraphData(payment) {
      let from = this.setOrCreateNode(payment.from, false);
      let to = this.setOrCreateNode(payment.to, true);
      let amount = parseInt(payment.amount);

      //temp adjustment to show lower values
      if (amount < 600) {
        amount = 50000;
      }

      let data = [from, to, amount];
      console.log("payment data", payment);
      console.log("graph data", data);

      this.data.push(data);
    },
    setOrCreateNode(addr, isDestination) {
      //check if in list already

      let node = {
        addr: addr,
        generation: isDestination ? this.generation + 1 : this.generation, //version
      };

      if (this.account == addr) {
        node.type = "main";
      } else {
        node.type = "other";
      }

      let existingNode = this._.find(this.nodes, function (o) {
        return o.addr == addr;
      });

      if (existingNode) {
        console.log("found existing");
        // new approach: duplicate node and increment
        node = this._.cloneDeep(existingNode);
        this.nodes.push(node);
        // this.updateNodeVersion(node);
        return this.getNodeAddress(node, isDestination);
      } else {
        this.nodes.push(node);
        return this.getNodeAddress(node, isDestination);
      }
    },
    setGeneration() {
      //get all curr generation tx
      let currGenTxs = this.getCurrentGenerationTxs();

      console.log("curr gen txs", currGenTxs);

      //set all existing transactions ahead one
      for (let tx of currGenTxs) {
        console.log(tx);
        let node = this.incrementNodeGeneration(tx);
        let data = [
          this.getNodeAddress(tx, false),
          this.getNodeAddress(node, true),
          100000,
        ];
        this.data.push(data);
      }

      this.generation++;
    },
    getCurrentGenerationTxs() {
      return this._.filter(this.nodes, (o) => {
        return o.generation == this.generation;
      });
    },
    incrementNodeGeneration(node) {
      let nextNode = this._.cloneDeep(node);
      nextNode.generation++;
      this.nodes.push(nextNode);

      return nextNode;
    },
    getPaymentsUrlByAsset(asset) {
      let url = "https://api.stellar.expert/explorer/";

      if (this.network == "main") {
        url += "public";
      } else {
        url += "testnet";
      }

      url += "/payments?asset=" + asset + "&order=asc&limit=" + this.limit;

      return url;
    },
    updateNodeVersion(node) {
      let index = this._.indexOf(this.nodes, node);
      this.nodes[index].v++;
    },
    getNodeAddress(node, isDestination) {
      let generation = isDestination ? this.generation + 1 : this.generation;
      console.log("node generation: ", generation);
      return node.addr + "-" + generation; //grab in context of curr generation
    },
    addTransaction(addr) {
      //take all sankey data and link to themselves except for the new tx
      console.log(addr);
    },
  },
};
</script>