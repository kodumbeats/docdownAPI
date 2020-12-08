const express = require("express");
const axios = require("axios");
const HTML = require("html-parse-stringify");
const md = require("markdown-it")();
const cors = require("cors");

const app = express();
const port = 3100;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/render", (req, res) => {
  function findRoot(indexLog) {
    const entries = Object.entries(indexLog);
    const found = entries.findIndex((e) => e[1] == 0);
    return entries[found - 1][0];
  }
  const reqText = req.body.data;
  const ast = HTML.parse(md.render(reqText));
  let indexLog = {
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
    p: 0,
    img: 0,
  };
  const priority = ["h1", "h2", "h3", "h4", "p"];
  let prepend;
  ast.forEach((line) => {
    // define actions for
    switch (line.name) {
      case "h1":
        indexLog.h1 = indexLog.h1 + 1;
        prepend = indexLog.h1;
        line.children[0].content = prepend + " " + line.children[0].content;
        //TODO@kodumbeats: get rid of this variable reset (fix?: add priority order matching, requires finding the first zero in indexLog)
        indexLog.h2 = 0;
        indexLog.h3 = 0;
        indexLog.h4 = 0;
        indexLog.p = 0;
        indexLog.img = 0;
        break;
      case "h2":
        indexLog.h2 = indexLog.h2 + 1;
        prepend = indexLog.h1 + "." + indexLog.h2;
        line.children[0].content = prepend + " " + line.children[0].content;
        indexLog.h3 = 0;
        indexLog.h4 = 0;
        indexLog.p = 0;
        indexLog.img = 0;
        break;
      case "h3":
        indexLog.h3 = indexLog.h3 + 1;
        prepend = indexLog.h1 + "." + indexLog.h2 + "." + indexLog.h3;
        line.children[0].content = prepend + " " + line.children[0].content;
        indexLog.h4 = 0;
        indexLog.p = 0;
        indexLog.img = 0;
        break;
      case "h4":
        indexLog.h4 = indexLog.h4 + 1;
        prepend =
          indexLog.h1 +
          "." +
          indexLog.h2 +
          "." +
          indexLog.h3 +
          "." +
          indexLog.h4;
        line.children[0].content = prepend + " " + line.children[0].content;
        indexLog.p = 0;
        indexLog.img = 0;
        break;
      case "p":
        indexLog.p = indexLog.p + 1;
        const r = findRoot(indexLog);
        switch (r) {
          case "h1":
            prepend = indexLog.h1 + "." + indexLog.p;
            line.children[0].content = prepend + " " + line.children[0].content;
            break;
          case "h2":
            prepend = indexLog.h1 + "." + indexLog.h2 + "." + indexLog.p;
            line.children[0].content = prepend + " " + line.children[0].content;
            break;
          case "h3":
            prepend =
              indexLog.h1 +
              "." +
              indexLog.h2 +
              "." +
              indexLog.h3 +
              "." +
              indexLog.p;
            line.children[0].content = prepend + " " + line.children[0].content;
            break;
          case "h4":
            prepend =
              indexLog.h1 +
              "." +
              indexLog.h2 +
              "." +
              indexLog.h3 +
              "." +
              indexLog.h4 +
              "." +
              indexLog.p;
            line.children[0].content = prepend + " " + line.children[0].content;
            break;
          default:
            console.log("EOF");
        }
        break;
      default:
        console.log(`No case for ${line.name}`);
        break;
    }
  });
  const payload = {
    data: HTML.stringify(ast),
  };
  res.send(payload);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
