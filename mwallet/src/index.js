import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { MemoryRouter } from "react-router-dom";
import { Buffer } from 'buffer';
import process from 'process';

// Polyfill Buffer and process globally
window.Buffer = Buffer;
window.process = process;

require('crypto-browserify');
require('stream-browserify');

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </React.StrictMode>
);
