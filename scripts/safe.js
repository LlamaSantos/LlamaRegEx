/// <reference path='base.js' />

var safe = (function () {
    /// <summary>Object framework for safely navigating an object literal.  This will do the work of determing if a property or chain of properties is undefined or null.</summary>
    var safe = function (obj, predicate) {
        return new safe.fn.init(obj, predicate);
    },
        root, attribute_regex = /(\w+)(=|\^=|\?=|$=)('|")([^"\\]*(\\.[^"\\]*)*)('|")/gi,
        part_regex = /\w+(?=\[)/gi,
        navigate = function (obj, predicate) {
            if (obj && predicate) {
                var parts = predicate.split(/\./);
                for (var i = 0; i < parts.length; ++i) {
                    var part = parts[i];
                    var attrib = null;
                    if (part && part.match(attribute_regex)) {
                        attrib = part.match(attribute_regex);
                        part = part.match(part_regex) || '';
                    }

                    obj = obj && obj[part] ? obj[part] : null;
                    if (obj && obj.isArray() && attrib) {
                        var attribParts = attrib.toString().split(/(\w+)(=|^=)"([^"]*)"/).findAll(function (v) {
                            return v && v !== '';
                        });
                        if (attribParts.length === 3) {
                            var aName = attribParts[0],
                                aComp = attribParts[2],
                                useThis = aName.toLowerCase() === 'this';
                            obj = obj.findAll(function (v) {
                                return useThis ? v == aComp : v[aName] == aComp;
                            });
                        }
                        else throw 'Malformed array filter expression';
                    }
                    if (!obj) break;
                }
            }
            return obj;
        };

    safe.fn = safe.prototype = {
        constructor: safe,
        init: function (_root, predicate) {
            root = navigate(_root, predicate);
        },
        select: function (predicate) {
            if (typeof predicate === 'function' && root) {
                return new safe.fn.init(predicate(root));
            }
            else if (root && predicate) {
                root = navigate(root, predicate);
                return new safe.fn.init(root);
            }
            else {
                return new safe.fn.init(null);
            }
        },
        prop: function (name, value) {
            if (root) {
                root[name] = value;
            }
            return new safe.fn.init(root);
        },
        val: function (defaultValue) {
            return (root || defaultValue) || null;
        }
    };

    safe.fn.init.prototype = safe.fn;

    return safe;
})();
