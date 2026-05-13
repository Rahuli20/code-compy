import { declareComponent } from "@webflow/react";
import { props } from "@webflow/data-types";
import { NavbarLinkManager } from "./NavbarLinkManager";
import "./NavbarLinkManager.module.css";

export default declareComponent(NavbarLinkManager, {
  name: "Navbar Link Manager",
  description: "CMS-style panel to add, edit, or remove navbar links via your Webflow Cloud API.",
  group: "Content",
  props: {
    apiBaseUrl: props.Text({
      name: "API base URL",
      defaultValue: "https://your-site.webflow.io/app",
    }),
    adminSecret: props.Text({
      name: "Admin secret",
      defaultValue: "",
    }),
    pollIntervalMs: props.Number({
      name: "Refresh interval (ms)",
      defaultValue: 15000,
    }),
  },
  options: {
    applyTagSelectors: true,
    ssr: false,
  },
});
