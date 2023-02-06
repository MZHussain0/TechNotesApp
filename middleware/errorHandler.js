const { logEvents } = require("./logger");

const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}\t${err.message}\t${err.method}\t${req.url}\t{req.headers.origin}`,
    "errlog.log"
  );

  console.log(err.stack);
  const status = res.statusCode ? res.statusCode : 500; //server error
  res.status(status);
  res.json({ message: err.message, isError: true });
};

module.exports = errorHandler;
