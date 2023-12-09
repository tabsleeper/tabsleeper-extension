import * as React from "react";
import { createRoot } from "react-dom/client";

import Popup from "@components/views/popup";

const container = document.getElementById("container");
const root = createRoot(container);
root.render(<Popup />);
