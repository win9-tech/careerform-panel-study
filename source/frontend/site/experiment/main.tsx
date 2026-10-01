import { LocalPreview } from "./LocalPreview";
import { track } from "./analytics";
import { createRoot } from "react-dom/client";
import "../../src/styles/global.css";
import { Experiment } from "./Experiment";
track("study_opened", {}, true);
createRoot(document.getElementById("root")!).render(import.meta.env.DEV && new URLSearchParams(location.search).get("view") === "compare" ? <LocalPreview /> : <Experiment />);
