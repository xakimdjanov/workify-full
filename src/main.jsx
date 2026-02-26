import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./talent/Context/ThemeContext";
import { JobReactionsProvider } from "./talent/Context/JobReactionsContext";
import { FormProvider } from "./Company/context/FormContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <JobReactionsProvider>
        <FormProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </FormProvider>
      </JobReactionsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
