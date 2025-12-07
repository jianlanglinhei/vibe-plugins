#!/usr/bin/env node
import { main } from "../src/index.js";

main().catch((error) => {
  console.error(`[vibe-plugins] ${error.message || error}`);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});

