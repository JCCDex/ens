<template>
  <div ref="scroll" flex class="scroll-wrapper" style="height: 100%;overflow-y:scroll;">
    <div flex-box="1" flex="dir:top cross: center">
      <div flex="dir:top" style="margin: 0.93rem 0.4rem 0 0.4rem;">
        <p style="margin-top: 0.21rem;text-align:left;color:#B1B1B1">
          {{ $t("hello") }}
        </p>
        <p style="margin-top: 0.21rem;text-align:left;color:#24262C;font-weight:bold" class="jingchang-largest-font-size">
          {{ $t("admin") }}
        </p>
        <p style="margin-top: 1rem;margin-bottom:0.1rem;text-align:left;">
          {{ $t("domain") }}
        </p>
        <van-field v-model="domain" center type="text" :placeholder="$t('pls_input_domain')" @focus="disableScroll" @blur="enableScroll" />

        <p style="margin-top: 0.2rem;margin-bottom:0.1rem;text-align:left;">
          {{ $t("account") }}
        </p>
        <van-field v-model="address" center type="text" :placeholder="$t('pls_input_address')" @focus="disableScroll" @blur="enableScroll" />

        <div v-show="status" style="height:0.8rem;text-align:left; word-break: break-all;margin-top: 0.5rem;">
          {{ status }}
        </div>
        <div flex style="width:100%;">
          <button :disabled="!queryEnable" class="jingchang-button jingchang-search-button" style="width: 45%;margin-top: 0.5rem;" @click="query">
            {{ $t("search") }}
          </button>
          <button
            :disabled="!submitEnable"
            class="jingchang-button jingchang-search-button"
            style="width: 45%;margin-top: 0.5rem;margin-left:10%"
            @click="submit"
          >
            {{ $t("submit") }}
          </button>
        </div>
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
import { Moac } from "jcc-moac-utils";
import scrollIntoView from "@/mixins/scrollIntoView";
import keyEvent from "@/mixins/keyEvent";
import { browser } from "@/js/util";
import { ENSRegistryContract } from "moac-ens";
import { ensInstance } from "@/js/contract";
import tpInfo from "@/js/tp";
const namehash = require("eth-ens-namehash").hash;

export default {
  name: "Admin",
  components: {
    CopyrightFooter
  },
  mixins: [scrollIntoView, keyEvent],
  data() {
    return {
      bs: null,
      address: "",
      domain: "",
      status: "",
      innerHeight: window.innerHeight
    };
  },
  computed: {
    queryEnable() {
      return this.domain;
    },

    submitEnable() {
      return this.domain && Moac.isValidAddress(this.address.trim());
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
    async query() {
      try {
        const node = await tpInfo.getNode();
        const inst = ensInstance.init(node);
        let domain = this.domain.trim();
        if (domain !== ENSRegistryContract.rootNode) {
          domain = namehash(domain);
        }
        const owner = await inst.owner(domain);
        console.log("owner: ", owner);
        if (owner.toLowerCase() === ENSRegistryContract.rootNode) {
          this.status = this.$t("ownerStatus.not_register");
        } else {
          this.status = this.$t("ownerStatus.had_registered", {
            address: owner
          });
        }
      } catch (error) {
        this.status = this.$t("ownerStatus.query_fail");
      }
    },
    async submit() {
      try {
        const node = await tpInfo.getNode();
        const inst = ensInstance.init(node);
        let domain = this.domain.toLowerCase().trim();
        if (domain !== ENSRegistryContract.rootNode) {
          domain = inst.moac._chain3.sha3(domain);
        }
        inst.setSubnodeOwner(ENSRegistryContract.rootNode, domain, this.address.trim(), async (err, calldata) => {
          try {
            let hash;
            if (tpInfo.isConnected()) {
              hash = await inst.sendTransactionByTp("0", calldata, {
                gasLimit: "50000"
              });
            } else {
              hash = await inst.sendTransaction("0", calldata, process.env.MOAC_SECRET, { gasLimit: "50000" });
            }
            console.log("set hash: ", hash);
            this.$router.push("/submit/result?success=true");
          } catch (error) {
            this.$router.push("/submit/result?success=false");
          }
        });
      } catch (error) {
        this.$router.push("/submit/result?success=false");
      }
    }
  }
};
</script>
<style lang="scss"></style>
