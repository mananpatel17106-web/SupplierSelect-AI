import "dotenv/config";

import { app } from "./app.js";
import "./db/index.js";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});