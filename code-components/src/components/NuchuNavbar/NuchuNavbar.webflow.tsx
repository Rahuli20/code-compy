import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { NuchuNavbar } from "./NuchuNavbar";
import "./NuchuNavbar.module.css";

export default declareComponent(NuchuNavbar, {
  name: "Nuchu Navbar",
  description: "Blue pill navbar that loads left-hand links from your Webflow Cloud API.",
  group: "Layout",
  props: {
    apiBaseUrl: props.Text({
      name: "API base URL",
      defaultValue: "https://your-site.webflow.io/app",
    }),
    pollIntervalMs: props.Number({
      name: "Refresh interval (ms)",
      defaultValue: 30000,
    }),
    shopUrl: props.Text({
      name: "Shop URL",
      defaultValue: "/shop",
    }),
    shopLabel: props.Text({
      name: "Shop label",
      defaultValue: "shop",
    }),
    languageLabel: props.Text({
      name: "Language label",
      defaultValue: "en",
    }),
    homeUrl: props.Text({
      name: "Home URL",
      defaultValue: "/",
    }),
    profileUrl: props.Text({
      name: "Profile URL",
      defaultValue: "/account",
    }),
    cartUrl: props.Text({
      name: "Cart URL",
      defaultValue: "/cart",
    }),
  },
  options: {
    applyTagSelectors: true,
    ssr: false,
  },
});
