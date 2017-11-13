'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var Purgecss = _interopDefault(require('purgecss'));
var webpackSources = require('webpack-sources');
var path = _interopDefault(require('path'));

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var entryPaths = function entryPaths(paths) {
    var ret = paths || [];

    // Convert possible string to an array
    if (typeof ret === 'string') {
        return [ret];
    }

    return ret;
};

var flatten = function flatten(paths) {
    return Array.isArray(paths) ? paths : Object.keys(paths).reduce(function (acc, val) {
        return [].concat(toConsumableArray(acc), toConsumableArray(paths[val]));
    }, []);
};

var entries = function entries(paths, chunkName) {
    if (Array.isArray(paths)) {
        return paths;
    }

    if (!(chunkName in paths)) {
        return [];
    }

    var ret = paths[chunkName];

    return Array.isArray(ret) ? ret : [ret];
};

var assets = function assets() {
    var assets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var extensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    return Object.keys(assets).map(function (name) {
        return extensions.indexOf(path.extname(name.indexOf('?') >= 0 ? name.split('?').slice(0, -1).join('') : name)) >= 0 && { name: name, asset: assets[name] };
    }).filter(function (a) {
        return a;
    });
};

var files = function files() {
    var modules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var extensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var getter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (a) {
        return a;
    };
    return Object.keys(modules).map(function (name) {
        var file = getter(modules[name]);

        if (!file) {
            return null;
        }

        return extensions.indexOf(path.extname(file)) >= 0 && file;
    }).filter(function (a) {
        return a;
    });
};

var PurgecssPlugin = function () {
  function PurgecssPlugin(options) {
    classCallCheck(this, PurgecssPlugin);

    this.options = options;
  }

  createClass(PurgecssPlugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('this-compilation', function (compilation) {
        var entryPaths$$1 = entryPaths(_this.options.paths);

        flatten(entryPaths$$1).forEach(function (p) {
          if (!fs.existsSync(p)) throw new Error('Path ' + p + ' does not exist.');
        });

        compilation.plugin('additional-assets', function (cb) {
          // Go through chunks and purge as configured
          compilation.chunks.forEach(function (chunk) {
            var chunkName = chunk.name,
                files$$1 = chunk.files;

            var modules = chunk.mapModules(function (mod) {
              return mod;
            });
            var assetsToPurge = assets(compilation.assets, ['.css']).filter(function (asset) {
              return files$$1.indexOf(asset.name) >= 0;
            });

            assetsToPurge.forEach(function (_ref) {
              var name = _ref.name,
                  asset = _ref.asset;

              var filesToSearch = entries(entryPaths$$1, chunkName).concat(files(modules, _this.options.moduleExtensions || [], function (file) {
                return file.resource;
              })).filter(function (v) {
                return !v.endsWith('.css');
              });

              // Compile through Purgecss and attach to output.
              // This loses sourcemaps should there be any!
              var purgecss = new Purgecss(_extends({}, _this.options, {
                content: filesToSearch,
                css: [asset.source()],
                stdin: true
              }));
              compilation.assets[name] = new webpackSources.ConcatSource(purgecss.purge()[0].css);
            });
          });

          cb();
        });
      });
    }
  }]);
  return PurgecssPlugin;
}();

module.exports = PurgecssPlugin;