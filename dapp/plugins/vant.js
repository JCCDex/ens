import Vue from "vue";
import Field from "vant/lib/field";
import Toast from "vant/lib/toast";
import "vant/lib/toast/style";
import "vant/lib/field/style";
import Vue2TouchEvents from "vue2-touch-events";
Vue.use(Vue2TouchEvents)
  .use(Toast)
  .use(Field);
