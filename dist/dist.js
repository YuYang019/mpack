
    (function (modules) {
      function require(id) {
        const [fn, mapping] = modules[id]

        function localRequire(name) {
          return require(mapping[name])
        }

        const module = { exports: {} }

        fn(localRequire, module, module.exports)

        return module.exports
      }

      require(0)
    })({0: [
      function (require, module, exports) { "use strict";

var _utils = require("./utils.js");

console.log((0, _utils.add)(1, 2)); },
      {"./utils.js":1},
    ],1: [
      function (require, module, exports) { "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.add = add;

var _name = require("./name.js");

var _name2 = _interopRequireDefault(_name);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function add(a, b) {
  return a + b;
} },
      {"./name.js":2},
    ],2: [
      function (require, module, exports) { "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _age = require("./age.js");

var _age2 = _interopRequireDefault(_age);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var name = 'maoyuyang' + _age2.default;

exports.default = name; },
      {"./age.js":3},
    ],3: [
      function (require, module, exports) { "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _name = require("./name.js");

var _name2 = _interopRequireDefault(_name);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var age = 20;

exports.default = age; },
      {"./name.js":2},
    ],})
  