const express = require("express");
const app = express();

const port = process.env.PORT || 3000; // EB sets PORT

app.get("/", (req, res) => {
  res.send("Hello from INTEX + Elastic Beanstalk + CodePipeline!");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
