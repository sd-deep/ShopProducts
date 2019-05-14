const fs = require("fs");

const handler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/") {
    console.log("inside if");
    res.write("<html>");
    res.write("<head><title>Send message</title></head>");
    res.write(
      '<body><form action="/message" method="POST"><input type="text" name="message"><button type="Submit">Send</button></form></body>'
    );
    res.write("</html>");
    return res.end();
  }
  if (url === "/message" && method === "POST") {
    console.log("inside message");
    const msgBody = [];
    req.on("data", chunk => {
      console.log(chunk);
      msgBody.push(chunk);
    });
    return req.on("end", () => {
      const parsedBody = Buffer.concat(msgBody).toString();
      const message = parsedBody.split("=")[1];
      console.log(message);
      fs.writeFile("message.txt", message, err => {
        res.statusCode = 302;
        res.setHeader("Location", "/");
        return res.end();
      });
    });
  }

  res.setHeader("Content-Type", "text/html");
  res.write("<html>");
  res.write("<head><title>I am the title</title></head>");
  res.write("<body><h1>This is the heading from node</h1></body>");
  res.write("</html>");
  res.end();
};

module.exports = {
  handler: handler
};
