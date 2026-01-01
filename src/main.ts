import { createApp } from "vue";
import App from "./App.vue";

// Import Framework7
import Framework7 from 'framework7/lite-bundle';
import Framework7Vue, { registerComponents } from 'framework7-vue/bundle';

// Import Framework7 Styles
import 'framework7/css/bundle';

// Import Tailwind CSS
import './styles/tailwind.css';

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue);

const app = createApp(App);

// Register Framework7 Vue components
registerComponents(app);

app.mount("#app");
