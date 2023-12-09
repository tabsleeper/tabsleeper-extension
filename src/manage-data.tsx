import * as React from "react";
import { createRoot } from "react-dom/client";

import ManageData from "@components/views/manage-data";

const container = document.getElementById("container");
const root = createRoot(container);
root.render(<ManageData />);
