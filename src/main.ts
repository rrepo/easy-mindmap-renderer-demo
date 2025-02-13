import { createApp } from "vue";
import App from "./App.vue";
import { dragscroll } from "vue-dragscroll";
// import LeaderLine from "leader-line";
// window.LeaderLine = LeaderLine;
const app = createApp(App);
app.directive("dragscroll", dragscroll);
app.mount("#app");
