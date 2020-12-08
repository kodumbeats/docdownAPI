const express = require("express");
const HTML = require("html-parse-stringify");
const md = require("markdown-it")({
  html: false,
  xhtmlOut: true,
  typographer: true,
})
  .use(require("markdown-it-anchor"), {
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: "§",
  })
  .use(require("markdown-it-toc-done-right")); // require and instantiate
const cors = require("cors");

const app = express();
const port = 3100;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/render", (req, res) => {
  const reqText = req.body.data;
  const payload = { data: md.render(reqText) };
  res.send(payload);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
