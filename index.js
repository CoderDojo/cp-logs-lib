(function (){

  var bunyan = require('bunyan');
  var _ = require('lodash');

  module.exports = function (args) {
    var logger = {};

    /**
     * Returns teh currnt instance of the logger
     * Singleton-like in js, derp.
     * @return {Object} logger  An oject containing all the fn definitions to log
     */
    var getLogger = function () {
      if(_.isEmpty(logger)){
        var level = args.level || 'warn';
        if (process.env.LOGENTRIES_ENABLED === 'true') {
          var Logger = require('le_node');
          var def = {token: process.env.LOGENTRIES_TOKEN,
            levels: { info: 1, warn: 2, error: 3, fatal: 4 }
          };
          var loggerDefinition = Logger.bunyanStream(def);
          if (args.name) loggerDefinition.name = args.name;
          loggerDefinition.level = level;
          logger = bunyan.createLogger(loggerDefinition);
        } else {
          logger = bunyan.createLogger({name: 'cp-dojos-service', level: level});
        }
      }
      return logger;
    };

    return {
      logger : getLogger(),
      log : {
        map: [
          {level: 'all', handler: function () {
            var fn = 'info';
            var fns = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

            //  Lookup the severity as a function to call
            //  (bunyan doesn't support severity as a param, it's necesssarly a fn)
            if (fns.indexOf(arguments[2]) > -1) {
              fn = arguments[2];
            }
            var context = {
              time: arguments[1]
            };

            //  Setup common string (act, plugin)
            if (arguments[4]) context.plugin = arguments[4];
            if (arguments[5]) context.orientation = arguments[5];
            // Clean up the "act" msg
            if (arguments[0]) delete arguments[0];
            if (arguments[1]) delete arguments[1];
            if (arguments[2]) delete arguments[2];

            getLogger()[fn](context, Array.prototype.join.call(arguments, ' '));
          }}
        ]
      }
    };
  };

})();
