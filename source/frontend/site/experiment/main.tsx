import { track } from "./analytics";
import { createRoot } from "react-dom/client";
import "../../src/styles/global.css";
import { Experiment } from "./Experiment";
track("study_opened", {}, true);
createRoot(document.getElementById("root")!).render(<Experiment />);
