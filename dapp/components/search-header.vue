<template>
  <div class="jingchang-large-font-size" style="padding-left:0.4rem; height:1.09rem; line-height:1.09rem;border-bottom: 1px solid #B1B2B7">
    <span>{{ $t("query_result") }}</span>
    <span>{{ domain }}</span>
  </div>
</template>
<script>
export default {
  props: {
    domain: {
      type: String,
      required: true
    }
  }
};
</script>
<style lang="scss"></style>
