// apps/backend/src/server.ts
import express from "express";

const app = express();
const PORT = 3001;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => console.log(`Backend running on :${PORT}`));
