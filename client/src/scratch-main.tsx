import { createRoot } from "react-dom/client";
import { ScratchLab } from "@/pages/ScratchLab";
import "./index.css";

createRoot(document.getElementById("underground-root")!).render(
  <ScratchLab />
);
