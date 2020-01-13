<template>
  <div class="jingchang-container">
    <div style="position: fixed; height: 100%; width: 100%; top: 0;">
      <component :is="componentId" />
    </div>
  </div>
</template>
<script>
import Admin from "@/components/admin";
import Normal from "@/components/normal";
import accountInfo from "@/js/account";

export default {
  name: "Home",
  components: {
    Admin,
    Normal
  },
  async asyncData() {
    try {
      const isAdmin = await accountInfo.isAdmin();
      return { componentId: isAdmin ? Admin : Normal };
    } catch (error) {
      console.log("error: ", error);
    }
  },
  data() {
    return {
      componentId: ""
    };
  }
};
</script>
<style lang="scss"></style>
