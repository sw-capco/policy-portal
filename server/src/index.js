const { createApp } = require("./app");

const port = Number(process.env.PORT || 4080);
const app = createApp();

app.listen(port, () => {
  // Intentionally minimal logging; no secrets.
  console.log(`policy-portal server listening on :${port}`);
});
