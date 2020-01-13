<template>
  <div ref="scroll" flex class="scroll-wrapper" style="height: 100%;overflow-y:scroll;">
    <div flex-box="1" flex="dir:top cross: center">
      <div flex="dir:top" style="background-color:#fff">
        <search-header :domain="domain" />
        <div v-if="!applied" style="height:2rem;padding: 0 0.4rem;" flex="dir:top cross: center main:center">
          <div flex="cross: center" style="height:0.6rem">
            <div class="not_applied" />

            <div style="color:#EC841F;font-weight:bold;line-height:0.6rem;" class="jingchang-largest-font-size">
              {{ $t("not_apply") }}
            </div>
          </div>
          <div style="margin-top:0.2rem;">
            <span>{{ $t("goto_qq.content1") }}</span>
            <span style="color:#3E72DE">{{ $t("goto_qq.content2") }}</span>
            <span>{{ $t("goto_qq.content3") }}</span>
          </div>
        </div>

        <div v-else style="padding: 0 0.4rem;margin-top:0.4rem" flex="dir:top cross: center main:center">
          <div flex="cross: center" style="margin-bottom:0.2rem;height:0.6rem;">
            <div class="applied" />

            <span style="color:#3ABA67;font-weight:bold;line-height:0.6rem;" class="jingchang-largest-font-size">
              {{ $t("applied") }}
            </span>
          </div>
          <div v-if="isOwner">
            <div style="margin-bottom:0.2rem">
              <span>{{ $t("set_address") }}</span>
            </div>
            <van-field
              v-model="address"
              style="margin-bottom:0.5rem"
              :clearable="true"
              center
              type="textarea"
              :placeholder="$t('pls_input_address')"
              @focus="disableScroll"
              @blur="enableScroll"
            />
            <button :disabled="!submitEnable" class="jingchang-button jingchang-search-button" style="width: 100%;margin-bottom: 0.4rem;" @click="submit">
              {{ $t("submit") }}
            </button>
          </div>
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
import SearchHeader from "@/components/search-header";
import { browser } from "@/js/util";
import { ENSRegistryContract, PublicResolverContract } from "moac-ens";
const namehash = require("eth-ens-namehash").hash;
import { ensInstance, resolverInstance } from "@/js/contract";
import tpInfo from "@/js/tp";

export default {
  name: "SearchResult",
  components: {
    CopyrightFooter,
    SearchHeader
  },
  mixins: [scrollIntoView, keyEvent],
  asyncData({ query }) {
    const { applied, isOwner, domain } = query;
    return {
      applied: applied === "true",
      isOwner: isOwner === "true",
      domain: decodeURIComponent(domain)
    };
  },
  data() {
    return {
      bs: null,
      address: "",
      domain: "",
      applied: false,
      isOwner: false,
      innerHeight: window.innerHeight,
      domainWallet: "",
      resolver: ""
    };
  },
  computed: {
    submitEnable() {
      return this.address !== this.domainWallet && Moac.isValidAddress(this.address.trim());
    }
  },
  created() {
    if (this.isOwner) {
      this.initDomainWallet();
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
    async initDomainWallet() {
      try {
        const node = await tpInfo.getNode();
        const instance = ensInstance.init(node);
        let domain = this.domain;
        if (domain !== ENSRegistryContract.rootNode) {
          domain = namehash(domain);
        }
        const resolver = await instance.resolver(domain);
        console.log("resolver:", resolver);
        if (resolver !== PublicResolverContract.rootNode) {
          this.resolver = resolver;
          const inst = resolverInstance.init(node, resolver);
          const address = await inst.addrWithoutCoinType(domain);
          console.log("address:", address);
          if (address !== PublicResolverContract.rootNode) {
            this.domainWallet = address;
            this.address = address;
          }
        }
      } catch (error) {
        this.resolver = "";
        this.domainWallet = "";
      }
    },
    async submit() {
      if (!this.resolver) {
        this.$router.push("/submit/result?success=false");
      } else {
        try {
          const node = await tpInfo.getNode();
          const inst = resolverInstance.init(node, this.resolver);
          let domain = this.domain;
          if (domain !== ENSRegistryContract.rootNode) {
            domain = namehash(domain);
          }
          inst.setAddrWithoutCoinType(domain, this.address.trim(), async (err, calldata) => {
            try {
              let hash;
              if (tpInfo.isConnected()) {
                hash = await inst.sendTransactionByTp("0", calldata, {
                  gasLimit: "100000"
                });
              } else {
                hash = await inst.sendTransaction("0", calldata, process.env.MOAC_SECRET, { gasLimit: "100000" });
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
    }
  }
};
</script>
<style lang="scss">
.not_applied {
  display: inline-block;
  height: 0.6rem;
  width: 0.6rem;
  background-image: url("../../assets/images/not_apply.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 0.4rem 0.4rem;
}
.applied {
  display: inline-block;
  height: 0.6rem;
  width: 0.6rem;
  background-image: url("../../assets/images/applied.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 0.4rem 0.4rem;
}
</style>
