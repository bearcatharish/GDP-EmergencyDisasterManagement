'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getFunctions = getFunctions;
exports.getTriggers = getTriggers;
exports.getFunction = getFunction;
exports.getTrigger = getTrigger;
exports.createFunction = createFunction;
exports.createTrigger = createTrigger;
exports.create = create;
exports.updateFunction = updateFunction;
exports.updateTrigger = updateTrigger;
exports.update = update;
exports.removeFunction = removeFunction;
exports.removeTrigger = removeTrigger;
exports.remove = remove;

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _decode = require('./decode');

var _decode2 = _interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

function getFunctions() {
  return _CoreManager2['default'].getHooksController().get("functions");
}

function getTriggers() {
  return _CoreManager2['default'].getHooksController().get("triggers");
}

function getFunction(name) {
  return _CoreManager2['default'].getHooksController().get("functions", name);
}

function getTrigger(className, triggerName) {
  return _CoreManager2['default'].getHooksController().get("triggers", className, triggerName);
}

function createFunction(functionName, url) {
  return create({ functionName: functionName, url: url });
}

function createTrigger(className, triggerName, url) {
  return create({ className: className, triggerName: triggerName, url: url });
}

function create(hook) {
  return _CoreManager2['default'].getHooksController().create(hook);
}

function updateFunction(functionName, url) {
  return update({ functionName: functionName, url: url });
}

function updateTrigger(className, triggerName, url) {
  return update({ className: className, triggerName: triggerName, url: url });
}

function update(hook) {
  return _CoreManager2['default'].getHooksController().update(hook);
}

function removeFunction(functionName) {
  return remove({ functionName: functionName });
}

function removeTrigger(className, triggerName) {
  return remove({ className: className, triggerName: triggerName });
}

function remove(hook) {
  return _CoreManager2['default'].getHooksController().remove(hook);
}

_CoreManager2['default'].setHooksController({

  get: function get(type, functionName, triggerName) {
    var url = "/hooks/" + type;
    if (functionName) {
      url += "/" + functionName;
      if (triggerName) {
        url += "/" + triggerName;
      }
    }
    return this.sendRequest("GET", url);
  },

  create: function create(hook) {
    var url;
    if (hook.functionName && hook.url) {
      url = "/hooks/functions";
    } else if (hook.className && hook.triggerName && hook.url) {
      url = "/hooks/triggers";
    } else {
      return _Promise.reject({ error: 'invalid hook declaration', code: 143 });
    }
    return this.sendRequest("POST", url, hook);
  },

  remove: function remove(hook) {
    var url;
    if (hook.functionName) {
      url = "/hooks/functions/" + hook.functionName;
      delete hook.functionName;
    } else if (hook.className && hook.triggerName) {
      url = "/hooks/triggers/" + hook.className + "/" + hook.triggerName;
      delete hook.className;
      delete hook.triggerName;
    } else {
      return _Promise.reject({ error: 'invalid hook declaration', code: 143 });
    }
    return this.sendRequest("PUT", url, { "__op": "Delete" });
  },

  update: function update(hook) {
    var url;
    if (hook.functionName && hook.url) {
      url = "/hooks/functions/" + hook.functionName;
      delete hook.functionName;
    } else if (hook.className && hook.triggerName && hook.url) {
      url = "/hooks/triggers/" + hook.className + "/" + hook.triggerName;
      delete hook.className;
      delete hook.triggerName;
    } else {
      return _Promise.reject({ error: 'invalid hook declaration', code: 143 });
    }
    return this.sendRequest('PUT', url, hook);
  },

  sendRequest: function sendRequest(method, url, body) {
    return _CoreManager2['default'].getRESTController().request(method, url, body, { useMasterKey: true }).then(function (res) {
      var decoded = (0, _decode2['default'])(res);
      if (decoded) {
        return _ParsePromise2['default'].as(decoded);
      }
      return _ParsePromise2['default'].error(new _ParseError2['default'](_ParseError2['default'].INVALID_JSON, 'The server returned an invalid response.'));
    });
  }
});