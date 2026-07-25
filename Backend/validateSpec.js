// backend/validateSpec.js
//
// Checks that openapi.json is well-formed and follows the OpenAPI spec
// correctly — catches typos, missing required fields, broken references.
// Run with: npm run validate:openapi

const SwaggerParser = require("@apidevtools/swagger-parser");

async function validate() {
  try {
    const api = await SwaggerParser.validate("./openapi.json");
    console.log("✅ OpenAPI spec is valid.");
    console.log(`   Title: ${api.info.title}`);
    console.log(`   Version: ${api.info.version}`);
    console.log(`   Paths documented: ${Object.keys(api.paths).length}`);
  } catch (err) {
    console.error("❌ OpenAPI spec is INVALID:");
    console.error(err.message);
    process.exit(1);
  }
}

validate();
