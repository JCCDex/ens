<template>
  <div ref="scroll" flex class="scroll-wrapper" style="height: 100%;overflow-y:scroll;">
    <div flex-box="1" flex="dir:top cross: center">
      <div style="background-color: inherit;padding-top: 1rem;color: #979292;text-align:center">
        <img :src="success ? require('~/assets/images/submit_success.png') : require('~/assets/images/submit_fail.png')" width="50%" />
        <p style="color: #24262C;margin-top:0.39rem;">
          {{ success ? $t("submit_success") : $t("submit_fail") }}
        </p>
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

export default {
  name: "SubmitFail",
  components: {
    CopyrightFooter
  },
  asyncData({ query }) {
    const { success } = query;
    return {
      success: success === "true"
    };
  },
  data() {
    return {
      bs: null,
      success: false
    };
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
    }
  }
};
</script>
<style lang="scss"></style>
