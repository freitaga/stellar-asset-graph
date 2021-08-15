<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-3">
          <v-text-field
            hide-details
            outlined
            label="Account Address"
            v-model="account"
            class="mr-2"
          ></v-text-field>
          <v-btn text @click="setupScene" color="primary"
            ><v-icon>mdi-magnify</v-icon> Search</v-btn
          >
          <v-btn-toggle v-model="network" tile color="primary" group>
            <v-btn value="main"> Mainnet </v-btn>
            <v-btn value="test"> Testnet </v-btn>
          </v-btn-toggle>
        </div>
        <div class="d-flex align-center">
          <div class="mr-3">
            <div class="caption text-center">Balances</div>
            <div v-for="balance in balances" :key="balance.asset_code">
              <span class="mr-1 secondary--text">{{
                parseInt(balance.balance)
              }}</span>
              <span class="mr-3">{{ getAssetCode(balance) }}</span>
            </div>
          </div>
          <div>
            <div class="caption text-center">Assets</div>
            <v-btn-toggle v-model="asset" tile color="primary" group>
              <v-btn
                v-for="balance in balances"
                :key="balance.asset_code"
                @click="getPaymentsByAsset(balance)"
              >
                <span class="mr-3">{{ getAssetCode(balance) }}</span>
              </v-btn>
            </v-btn-toggle>
          </div>
        </div>
        <v-btn depressed @click="clearGraphData">Clear Graph</v-btn>
      </v-col>
      <v-col cols="12">
        <div id="graph"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ForceGraph3D from "3d-force-graph";
//import * as d3 from "d3";

export default {
  name: "Home",
  components: {},
  async created() {
    //get 1 layer of payments
    await this.setupScene();
  },
  data() {
    return {
      network: "main",
      asset: null,
      graph: null,
      nodes: [],
      links: [],
      // account: "GC2PPHHCKJEU3ZFOPACXTFJINQLSCN57W4OWHC4FFE6JAU2RCIOYNXQC",
      // account: "GAJ7WLLOWPA42LNW5MOFBJVYMWY6GAUCA3D7S2BJFWWNYLKOFS6UGTZP",
      account: "",
      accountData: null,
      balances: null,
      payments: [],
      assetPayments: [],
      controls: null,
      gui: null,
      NODE_REL_SIZE: 1,
      mockAssetData: {
        _links: {
          self: {
            href: "/explorer/testnet/asset/ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ/history/payments?skip=0&order=desc&limit=100",
          },
          prev: {
            href: "/explorer/testnet/asset/ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ/history/payments?skip=0&order=asc&limit=100&cursor=1804152552304641",
          },
          next: {
            href: "/explorer/testnet/asset/ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ/history/payments?skip=0&order=desc&limit=100&cursor=1377056709419010",
          },
        },
        _embedded: {
          records: [
            {
              id: "1804152552304641",
              paging_token: "1804152552304641",
              type: 1,
              ts: 1626042320,
              accounts: [
                "GAPII7YH4UQKYHTIGZW6US7SRSGNEZUK75FN4Z6HIFZTMGZN5AQ27RO7",
                "GC5VQLGFQQZKKXH6ZRLTYZSDYGMR2PFMVGEXIPDBWLD2EE4DAVGT7X4Q",
              ],
              ledger: 420062,
              tx: "1804152552304640",
              assets: [
                "ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ-2",
              ],
              amount: "100000",
            },
            {
              id: "1803645746159617",
              paging_token: "1803645746159617",
              type: 1,
              ts: 1626041692,
              accounts: [
                "GACS2IOWSCR73YVSCBFVWADP65SQFWBXWQQSA4UYUJ5PE2PUXYMT3LR4",
                "GAPII7YH4UQKYHTIGZW6US7SRSGNEZUK75FN4Z6HIFZTMGZN5AQ27RO7",
              ],
              ledger: 419944,
              tx: "1803645746159616",
              assets: [
                "ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ-2",
              ],
              amount: "100000",
            },
            {
              id: "1803439587725313",
              paging_token: "1803439587725313",
              type: 1,
              ts: 1626041438,
              accounts: [
                "GC3CAPCDFMDS7GGAFQBORNR4VDMWH6POR5TVLJ6Y5DVJIIKR6AIXKDV7",
                "GACS2IOWSCR73YVSCBFVWADP65SQFWBXWQQSA4UYUJ5PE2PUXYMT3LR4",
              ],
              ledger: 419896,
              tx: "1803439587725312",
              assets: [
                "ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ-2",
              ],
              amount: "150000",
            },
            {
              id: "1803340803481601",
              paging_token: "1803340803481601",
              type: 1,
              ts: 1626041317,
              accounts: [
                "GAFUNCUORZ2P7QGXPY2C6Q77P3BPLJ4MJ27SSLWZ7GOTFFC2XR4O667K",
                "GAWI566FEMZIM5Y4AD3XHXS2667OO4BL4CGHXE7CK433LZCWLC33QZ4G",
              ],
              ledger: 419873,
              tx: "1803340803481600",
              assets: [
                "ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ-2",
              ],
              amount: "150000",
            },
            {
              id: "1377653709873154",
              paging_token: "1377653709873154",
              type: 1,
              ts: 1625520487,
              accounts: [
                "GC2PPHHCKJEU3ZFOPACXTFJINQLSCN57W4OWHC4FFE6JAU2RCIOYNXQC",
                "GAFUNCUORZ2P7QGXPY2C6Q77P3BPLJ4MJ27SSLWZ7GOTFFC2XR4O667K",
              ],
              ledger: 320760,
              tx: "1377653709873152",
              assets: [
                "ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ-2",
              ],
              amount: "500000",
            },
            {
              id: "1377589285380098",
              paging_token: "1377589285380098",
              type: 1,
              ts: 1625520410,
              accounts: [
                "GC2PPHHCKJEU3ZFOPACXTFJINQLSCN57W4OWHC4FFE6JAU2RCIOYNXQC",
                "GC3CAPCDFMDS7GGAFQBORNR4VDMWH6POR5TVLJ6Y5DVJIIKR6AIXKDV7",
              ],
              ledger: 320745,
              tx: "1377589285380096",
              assets: [
                "ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ-2",
              ],
              amount: "250000",
            },
            {
              id: "1377503386021890",
              paging_token: "1377503386021890",
              type: 1,
              ts: 1625520305,
              accounts: [
                "GC2PPHHCKJEU3ZFOPACXTFJINQLSCN57W4OWHC4FFE6JAU2RCIOYNXQC",
                "GD7KC4Z4QD6GQD4RTIMO6HNOODOVIDPUKASDOAXMUDY56AGVHEQQSPJY",
              ],
              ledger: 320725,
              tx: "1377503386021888",
              assets: [
                "ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ-2",
              ],
              amount: "150000",
            },
            {
              id: "1377056709419010",
              paging_token: "1377056709419010",
              type: 1,
              ts: 1625519755,
              accounts: [
                "GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ",
                "GC2PPHHCKJEU3ZFOPACXTFJINQLSCN57W4OWHC4FFE6JAU2RCIOYNXQC",
              ],
              ledger: 320621,
              tx: "1377056709419008",
              assets: [
                "ESVTFR-GCJXBG5QKPTBQUFJC6GEWK72YCMVMCVT2QL7XUJ55DWHCUS7HWQZHOKJ-2",
              ],
              amount: "1000000",
            },
          ],
        },
      },
    };
  },
  methods: {
    async setupScene() {
      //clear nodes/links
      if (this.graph) {
        this.clearGraphData();
      }
      this.getAccountData();
      await this.getPayments();
      //this.parseAssetData();
      this.setGraphData();
      //if (!this.graph) {
      this.createGraph();
      //} else {
      //  this.attachGraphData();
      //}
    },
    async clearGraphData() {
      this.nodes = [];
      this.links = [];
      this.payments = [];
      this.asset = null;
      await this.graph?._destructor();
    },
    createGraph() {
      this.graph = ForceGraph3D()
        .height(window.innerHeight * 0.75)
        .nodeColor((d) => {
          if (d.type === "main") {
            return "#4caf50";
          } else {
            return "#f9f9f9";
          }
        })
        // .dagMode("td")
        // .dagLevelDistance(200)
        .backgroundColor("#222")
        .linkColor(() => "rgba(255,255,255,0.2)")
        .nodeRelSize(this.NODE_REL_SIZE)
        // .nodeId("path")
        // .nodeLabel("path")
        .nodeOpacity(0.9)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleWidth(0.8)
        .linkDirectionalParticleSpeed(0.006);

      // Decrease repel intensity
      this.graph.d3Force("charge").strength(-15);

      let nodes = this.nodes;
      let links = this.links;
      this.graph(document.getElementById("graph")).graphData({ nodes, links });
    },
    async attachGraphData() {
      let nodes = this.nodes;
      let links = this.links;
      this.graph(document.getElementById("graph")).graphData({ nodes, links });
    },
    setGraphData() {
      //set data nodes & links

      for (let i = 0; i < this.payments.length; i++) {
        let payment = this.payments[i];

        if (payment.type == "payment") {
          // ignore create account type

          let node1 = this.setOrCreateNode(payment.from);

          let node2 = this.setOrCreateNode(payment.to);

          let link = {
            source: node1,
            target: node2,
          };

          this.links.push(link);
        }
      }

      //add test pair
      // let n1 = {
      //   id: "GC3CAPCDFMDS7GGAFQBORNR4VDMWH6POR5TVLJ6Y5DVJIIKR6AIXKDV7",
      //   name: "GC3CAPCDFMDS7GGAFQBORNR4VDMWH6POR5TVLJ6Y5DVJIIKR6AIXKDV7",
      //   val: 1000,
      // };

      // let n2 = { id: "test", name: "test", val: "test" };

      // let l = {
      //   source: n1,
      //   target: n2,
      // };

      // this.nodes.push(n2);
      // this.links.push(l);
    },
    async getAccountData() {
      let url = this.getAccountApiUrl();

      this.axios.get(url).then((response) => {
        this.accountData = response.data;
        this.balances = this.accountData.balances;
      });
    },
    async getPayments() {
      let pageLimit = 2;
      let url = this.getPaymentsApiUrl();

      for (let i = 0; i < pageLimit; i++) {
        let currUrl = url + "?page=" + i + "&limit=10";
        await this.axios.get(currUrl).then((response) => {
          let payments = response.data._embedded.records;

          //set payment results
          this.payments = this.payments.concat(payments);

          //experiment: if not curr account, get payments for that account
          // payments.forEach((payment) => {
          //   if (payment.to != account && payment.to != this.account) {
          //     this.getPayments(payment.to);
          //   }
          // });
        });
      }
    },
    getPaymentsByAsset(asset) {
      let url = this.getPaymentsUrlByAsset(asset);

      this.axios.get(url).then((response) => {
        this.clearGraphData();
        this.payments = response.data._embedded.records;
        this.parseAssetData();
        this.createGraph();
      });
    },
    parseAssetData() {
      //set data nodes & links

      for (let i = 0; i < this.payments.length; i++) {
        let payment = this.payments[i];

        // ignore create account type

        let node1 = this.setOrCreateNode(payment.from);

        let node2 = this.setOrCreateNode(payment.to);

        let link = {
          source: node1,
          target: node2,
        };

        this.links.push(link);
      }
    },
    // parseAssetData() {
    //   let payments = this.assetPayments;

    //   console.log("asset data: ", payments);

    //   payments.forEach((payment) => {
    //     let node1 = this.setOrCreateNode(payment.accounts[0]);

    //     let node2 = this.setOrCreateNode(payment.accounts[1]);

    //     let link = {
    //       source: node1,
    //       target: node2,
    //     };

    //     this.links.push(link);
    //   });
    // },
    setOrCreateNode(addr) {
      //check if in list already

      let node = {
        id: addr,
        name: addr,
        val: 50,
      };

      if (this.account == addr) {
        node.type = "main";
      } else {
        node.type = "other";
      }

      let existingNode = this._.find(this.nodes, node);

      if (existingNode) {
        return existingNode;
      } else {
        this.nodes.push(node);
        return node;
      }
    },
    getAccountApiUrl() {
      let url = "";

      if (this.network == "main") {
        url = "https://horizon.stellar.org/accounts/";
      } else {
        url = "https://horizon-testnet.stellar.org/accounts/";
      }

      url += this.account;

      return url;
    },
    getPaymentsApiUrl() {
      let url = "";

      if (this.network == "main") {
        url = "https://horizon.stellar.org/accounts/";
      } else {
        url = "https://horizon-testnet.stellar.org/accounts/";
      }

      url += this.account + "/payments";

      return url;
    },
    getPaymentsUrlByAsset(asset) {
      let url = "https://api.stellar.expert/explorer/";

      if (this.network == "main") {
        url += "public";
      } else {
        url += "testnet";
      }

      url += "/payments?asset=" + asset.asset_code + "-" + asset.asset_issuer;

      return url;
    },
    setPaymentGraphData() {},
    getAssetCode(balance) {
      if (balance.asset_type == "native") {
        return "XLM";
      } else {
        return balance.asset_code;
      }
    },
  },
};
</script>
