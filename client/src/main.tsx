import { createRoot } from "react-dom/client";
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';
import App from "./App";
import "./index.css";

createRoot(document.getElementById("underground-root")!).render(
  <>
    <DialRoot position="top-right" />
    <App />
  </>
);
