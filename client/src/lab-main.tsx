import { createRoot } from "react-dom/client";
import { AnimationLab } from "@/pages/AnimationLab";
import "./index.css";

createRoot(document.getElementById("underground-root")!).render(
  <AnimationLab />
);
