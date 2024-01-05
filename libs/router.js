_.mixin(require("underscore.string").exports());
_moment.locale("vi");
fsx.readdirSync(path.join(_rootPath, "models")).forEach(function (file) {
  if (path.extname(file) !== ".js") return;
  global[
    "_" + _.classify(_.replaceAll(file.toLowerCase(), ".js", ""))
  ] = require(path.join(_rootPath, "models", file));
  console.info(
    "Modal : ".yellow +
      "_" +
      _.classify(_.replaceAll(file.toLowerCase(), ".js", ""))
  );
});

module.exports = function routers(app) {
  app.locals._moment = _moment;
};
