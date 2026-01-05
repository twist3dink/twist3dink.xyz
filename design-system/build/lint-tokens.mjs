import { validateAllOrExit } from "./token-validation.mjs";

// Separate lint/validate entrypoint so CI and developers can validate tokens
// without running the full Style Dictionary build.

const ENABLE_EXPERIMENTAL = process.env.ENABLE_EXPERIMENTAL === "1";

validateAllOrExit({ enableExperimental: ENABLE_EXPERIMENTAL });

console.log("Token schema + contract checks PASSED.");
