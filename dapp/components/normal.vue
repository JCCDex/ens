<template>
  <div ref="scroll" flex class="scroll-wrapper" style="height: 100%;overflow-y:scroll;">
    <div flex-box="1" flex="dir:top cross: center">
      <div flex="dir:top" style="margin: 0.9rem 0.3rem 0 0.3rem;">
        <p style="text-align:left;margin-bottom: 0.1rem">
          {{ $t("query_domain") + ":" }}
        </p>
        <van-field v-model="domain" center type="text" :clearable="true" :placeholder="$t('pls_input_domain')" @focus="disableScroll" @blur="enableScroll">
          <img slot="left-icon" src="~/assets/images/search.png" alt="" />
        </van-field>

        <button :disabled="!submitEnable" class="jingchang-button jingchang-search-button" style="width: 100%;margin-top: 0.5rem;" @click="search">
          {{ $t("search") }}
        </button>
      </div>
      <div flex-box="1" flex="cross:bottom">
        <copyright-footer />
      </div>
    </div>
  </div>
</template>
<script>
import BScroll from "@better-scroll/core";
import CopyrightFooter from "@/components/footer";
import scrollIntoView from "@/mixins/scrollIntoView";
import keyEvent from "@/mixins/keyEvent";
import { browser } from "@/js/util";
import { ensInstance } from "@/js/contract";
import tpInfo from "@/js/tp";
import { Toast } from "vant";
import { ENSRegistryContract } from "moac-ens";
const namehash = require("eth-ens-namehash").hash;

export default {
  name: "Normal",
  components: {
    CopyrightFooter
  },
  mixins: [scrollIntoView, keyEvent],
  data() {
    return {
      bs: null,
      domain: "",
      innerHeight: window.innerHeight
    };
  },
  computed: {
    submitEnable() {
      return this.domain;
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.bs && this.bs.destroy();
  },
  methods: {
    init() {
      this.bs = new BScroll(this.$refs.scroll, {
        scrollY: true,
        click: true
      });
    },
    disableScroll() {
      if (browser.versions.ios) {
        this.bs && this.bs.disable();
      }
    },
    enableScroll() {
      if (browser.versions.ios) {
        this.bs && this.bs.enable();
      }
    },
    async search() {
      try {
        Toast.loading({
          duration: 0,
          forbidClick: true,
          loadingType: "spinner",
          message: this.$t("message.querying")
        });
        const address = await tpInfo.getAddress();
        const node = await tpInfo.getNode();
        const instance = ensInstance.init(node);
        let domain = this.domain;

        if (domain !== ENSRegistryContract.rootNode) {
          domain = namehash(domain);
        }
        const owner = await instance.owner(domain);
        setTimeout(async () => {
          Toast.clear();
          if (owner.toLowerCase() === ENSRegistryContract.rootNode) {
            console.log("not register");
            this.$router.push("/search?applied=false&domain=" + encodeURIComponent(this.domain));
          } else if (owner.toLowerCase() !== address.toLowerCase()) {
            console.log("had registered, but isn't owner");
            this.$router.push("/search?applied=true&isOwner=false&domain=" + encodeURIComponent(this.domain));
          } else {
            console.log("had registered and is owner");
            try {
              const resolver = await instance.resolver(domain);
              if (resolver === ENSRegistryContract.rootNode) {
                // set resolver automatically
                console.log("resolver not set");
                instance.setResolver(domain, process.env.ResolverContract, async (err, calldata) => {
                  if (err) {
                    return Toast.fail(err.message);
                  }
                  let hash;
                  try {
                    if (tpInfo.isConnected()) {
                      hash = await instance.sendTransactionByTp("0", calldata, { gasLimit: "50000" });
                    } else {
                      hash = await instance.sendTransaction("0", calldata, process.env.MOAC_SECRET, { gasLimit: "50000" });
                    }
                    console.log("set hash: ", hash);
                    this.$router.push("/search?applied=true&isOwner=true&domain=" + encodeURIComponent(this.domain));
                  } catch (error) {
                    Toast.fail(err.message);
                  }
                });
              } else {
                this.$router.push("/search?applied=true&isOwner=true&domain=" + encodeURIComponent(this.domain));
              }
            } catch (error) {
              Toast.fail(error.message);
            }
          }
        }, 500);
      } catch (error) {
        Toast.fail(error.message);
      }
    }
  }
};
</script>
<style lang="scss"></style>
