//! moment.js

; (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            global.moment = factory()
}(this, (function () {
    'use strict';

    var hookCallback;

    function hooks() {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return (Object.getOwnPropertyNames(obj).length === 0);
        } else {
            var k;
            for (k in obj) {
                if (obj.hasOwnProperty(k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            meridiem: null,
            rfc2822: false,
            weekdayMismatch: false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.weekdayMismatch &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid(flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment(obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor(number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false &&
            (typeof console !== 'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set(config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
            '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                !hasOwnProp(childConfig, prop) &&
                isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        lastDay: '[Yesterday at] LT',
        lastWeek: '[Last] dddd [at] LT',
        sameElse: 'L'
    };

    function calendar(key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS: 'h:mm:ss A',
        LT: 'h:mm A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat(key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate() {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal(number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        ss: '%d seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
    };

    function relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias(unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({ unit: u, priority: priorities[u] });
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1 = /\d/;            //       0 - 9
    var match2 = /\d\d/;          //      00 - 99
    var match3 = /\d{3}/;         //     000 - 999
    var match4 = /\d{4}/;         //    0000 - 9999
    var match6 = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2 = /\d\d?/;         //       0 - 99
    var match3to4 = /\d\d\d\d?/;     //     999 - 9999
    var match5to6 = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3 = /\d{1,3}/;       //       0 - 999
    var match1to4 = /\d{1,4}/;       //       0 - 9999
    var match1to6 = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned = /\d+/;           //       0 - inf
    var matchSigned = /[+-]?\d+/;      //    -inf - inf

    var matchOffset = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

    var regexes = {};

    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken(token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken(token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY', 4], 0, 'year');
    addFormatToken(0, ['YYYYY', 5], 0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y', matchSigned);
    addRegexToken('YY', match1to2, match2);
    addRegexToken('YYYY', match1to4, match4);
    addRegexToken('YYYYY', match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear() {
        return isLeapYear(this.year());
    }

    function makeGetSet(unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get(mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function set$1(mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
            }
            else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet(units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M', match1to2);
    addRegexToken('MM', match1to2, match2);
    addRegexToken('MMM', function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths(m, format) {
        if (!m) {
            return isArray(this._months) ? this._months :
                this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort(m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort :
                this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth(mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth(value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    function createDate(y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date = new Date(y, m, d, h, M, s, ms);

        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));

        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w', match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W', match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow: 0, // Sunday is the first day of the week.
        doy: 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek() {
        return this._week.dow;
    }

    function localeFirstDayOfYear() {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d', match1to2);
    addRegexToken('e', match1to2);
    addRegexToken('E', match1to2);
    addRegexToken('dd', function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd', function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd', function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays(m, format) {
        if (!m) {
            return isArray(this._weekdays) ? this._weekdays :
                this._weekdays['standalone'];
        }
        return isArray(this._weekdays) ? this._weekdays[m.day()] :
            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort(m) {
        return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin(m) {
        return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse(weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a', matchMeridiem);
    addRegexToken('A', matchMeridiem);
    addRegexToken('H', match1to2);
    addRegexToken('h', match1to2);
    addRegexToken('k', match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM(input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem(hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour they want. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var localeFamilies = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
            module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                var aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
            else {
                if ((typeof console !== 'undefined') && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn('Locale ' + key + ' not found. Did you forget to load it?');
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale(name, config) {
        if (config !== null) {
            var locale, parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                    'use moment.updateLocale(localeName, config) to change ' +
                    'an existing locale. moment.defineLocale(localeName, ' +
                    'config) should only be used for creating a new locale ' +
                    'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);


            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, tmpLocale, parentConfig = baseConfig;
            // MERGE
            tmpLocale = loadLocale(name);
            if (tmpLocale != null) {
                parentConfig = tmpLocale._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale(key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow(m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH] < 0 || a[MONTH] > 11 ? MONTH :
                    a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                        a[HOUR] < 0 || a[HOUR] > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                            a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE :
                                a[SECOND] < 0 || a[SECOND] > 59 ? SECOND :
                                    a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                                        -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray(config) {
        var i, date, input = [], currentDate, expectedWeekday, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            var curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10)
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    var obsOffsets = {
        UT: 0,
        GMT: 0,
        EDT: -4 * 60,
        EST: -5 * 60,
        CDT: -5 * 60,
        CST: -6 * 60,
        MDT: -6 * 60,
        MST: -7 * 60,
        PDT: -7 * 60,
        PST: -8 * 60
    };

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10);
            var m = hm % 100, h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i));
        if (match) {
            var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        // Final attempt, use Input Fallback
        hooks.createFromInputFallback(config);
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () { };

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () { };

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig(config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({ nullInput: true });
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
            (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        for (var key in m) {
            if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }

        var unitHasDecimal = false;
        for (var i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration(obj) {
        return obj instanceof Duration;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // FORMATTING

    function offset(token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z', matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher);

        if (matches === null) {
            return null;
        }

        var chunk = matches[matches.length - 1] || [];
        var parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ?
            0 :
            parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset(m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () { };

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset(input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone(input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset() {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            }
            else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset(input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime() {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal() {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc() {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration(input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (isNumber(input)) {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : (match[1] === '+') ? 1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                w: parseIso(match[4], sign),
                d: parseIso(match[5], sign),
                h: parseIso(match[6], sign),
                m: parseIso(match[7], sign),
                s: parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso(inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = { milliseconds: 0, months: 0 };

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return { milliseconds: 0, months: 0 };
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                    'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
            diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                        diff < 2 ? 'nextDay' :
                            diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1(time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone() {
        return new Moment(this);
    }

    function isAfter(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween(from, to, units, inclusivity) {
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }

    function isSame(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff(input, units, asFloat) {
        var that,
            zoneDelta,
            output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year': output = monthDiff(this, that) / 12; break;
            case 'month': output = monthDiff(this, that); break;
            case 'quarter': output = monthDiff(this, that) / 3; break;
            case 'second': output = (this - that) / 1e3; break; // 1000
            case 'minute': output = (this - that) / 6e4; break; // 1000 * 60
            case 'hour': output = (this - that) / 36e5; break; // 1000 * 60 * 60
            case 'day': output = (this - that - zoneDelta) / 864e5; break; // 1000 * 60 * 60 * 24, negate dst
            case 'week': output = (this - that - zoneDelta) / 6048e5; break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default: output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff(a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString() {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true;
        var m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect() {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment';
        var zone = '';
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        var prefix = '[' + func + '("]';
        var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
        var datetime = '-MM-DD[T]HH:mm:ss.SSS';
        var suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format(inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from(time, withoutSuffix) {
        if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
                createLocal(time).isValid())) {
            return createDuration({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow(withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to(time, withoutSuffix) {
        if (this.isValid() &&
            ((isMoment(time) && time.isValid()) ||
                createLocal(time).isValid())) {
            return createDuration({ from: this, to: time }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow(withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale(key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData() {
        return this._locale;
    }

    function startOf(units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
            case 'year':
                this.month(0);
            /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
            /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
            case 'date':
                this.hours(0);
            /* falls through */
            case 'hour':
                this.minutes(0);
            /* falls through */
            case 'minute':
                this.seconds(0);
            /* falls through */
            case 'second':
                this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf(units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }

        // 'date' is an alias for 'day', so it should be considered as such.
        if (units === 'date') {
            units = 'day';
        }

        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function valueOf() {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix() {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate() {
        return new Date(this.valueOf());
    }

    function toArray() {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON() {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2() {
        return isValid(this);
    }

    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt() {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg', 'weekYear');
    addWeekYearFormatToken('ggggg', 'weekYear');
    addWeekYearFormatToken('GGGG', 'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G', matchSigned);
    addRegexToken('g', matchSigned);
    addRegexToken('GG', match1to2, match2);
    addRegexToken('gg', match1to2, match2);
    addRegexToken('GGGG', match1to4, match4);
    addRegexToken('gggg', match1to4, match4);
    addRegexToken('GGGGG', match1to6, match6);
    addRegexToken('ggggg', match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(this,
            input,
            this.week(),
            this.weekday(),
            this.localeData()._week.dow,
            this.localeData()._week.doy);
    }

    function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(this,
            input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter(input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D', match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict ?
            (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
            locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD', match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear(input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m', match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s', match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S', match1to3, match1);
    addRegexToken('SS', match1to3, match2);
    addRegexToken('SSS', match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z', 0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr() {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName() {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$2;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix(input) {
        return createLocal(input * 1000);
    }

    function createInZone() {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat(string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;

    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;

    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1(format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl(format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl(localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths(format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort(format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                        (b === 2) ? 'nd' :
                            (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports

    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

    var mathAbs = Math.abs;

    function abs() {
        var data = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);

        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);

        return this;
    }

    function addSubtract$1(duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1(input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1(input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil(number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble() {
        var milliseconds = this._milliseconds;
        var days = this._days;
        var months = this._months;
        var data = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
            (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds = absFloor(milliseconds / 1000);
        data.seconds = seconds % 60;

        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;

        hours = absFloor(minutes / 60);
        data.hours = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days = days;
        data.months = months;
        data.years = years;

        return this;
    }

    function daysToMonths(days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays(months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as(units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week': return days / 7 + milliseconds / 6048e5;
                case 'day': return days + milliseconds / 864e5;
                case 'hour': return days * 24 + milliseconds / 36e5;
                case 'minute': return days * 1440 + milliseconds / 6e4;
                case 'second': return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1() {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs(alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds = makeAs('s');
    var asMinutes = makeAs('m');
    var asHours = makeAs('h');
    var asDays = makeAs('d');
    var asWeeks = makeAs('w');
    var asMonths = makeAs('M');
    var asYears = makeAs('y');

    function clone$1() {
        return createDuration(this);
    }

    function get$2(units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds = makeGetter('seconds');
    var minutes = makeGetter('minutes');
    var hours = makeGetter('hours');
    var days = makeGetter('days');
    var months = makeGetter('months');
    var years = makeGetter('years');

    function weeks() {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        ss: 44,         // a few seconds to seconds
        s: 45,         // seconds to minute
        m: 45,         // minutes to hour
        h: 22,         // hours to day
        d: 26,         // days to month
        M: 11          // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1(posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds = round(duration.as('s'));
        var minutes = round(duration.as('m'));
        var hours = round(duration.as('h'));
        var days = round(duration.as('d'));
        var months = round(duration.as('M'));
        var years = round(duration.as('y'));

        var a = seconds <= thresholds.ss && ['s', seconds] ||
            seconds < thresholds.s && ['ss', seconds] ||
            minutes <= 1 && ['m'] ||
            minutes < thresholds.m && ['mm', minutes] ||
            hours <= 1 && ['h'] ||
            hours < thresholds.h && ['hh', hours] ||
            days <= 1 && ['d'] ||
            days < thresholds.d && ['dd', days] ||
            months <= 1 && ['M'] ||
            months < thresholds.M && ['MM', months] ||
            years <= 1 && ['y'] || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding(roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof (roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize(withSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return ((x > 0) - (x < 0)) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000;
        var days = abs$1(this._days);
        var months = abs$1(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        var totalSign = total < 0 ? '-' : '';
        var ymSign = sign(this._months) !== sign(total) ? '-' : '';
        var daysSign = sign(this._days) !== sign(total) ? '-' : '';
        var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return totalSign + 'P' +
            (Y ? ymSign + Y + 'Y' : '') +
            (M ? ymSign + M + 'M' : '') +
            (D ? daysSign + D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? hmsSign + h + 'H' : '') +
            (m ? hmsSign + m + 'M' : '') +
            (s ? hmsSign + s + 'S' : '');
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid = isValid$1;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.clone = clone$1;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;

    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    hooks.version = '2.22.2';

    setHookCallback(createLocal);

    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',             // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',  // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',   // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD',                             // <input type="date" />
        TIME: 'HH:mm',                                  // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss',                       // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS',                        // <input type="time" step="0.001" />
        WEEK: 'YYYY-[W]WW',                             // <input type="week" />
        MONTH: 'YYYY-MM'                                // <input type="month" />
    };

    return hooks;

})));
/*!
 * Materialize v1.0.0 (http://materializecss.com)
 * Copyright 2014-2017 Materialize
 * MIT License (https://raw.githubusercontent.com/Dogfalo/materialize/master/LICENSE)
 */
var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*! cash-dom 1.3.5, https://github.com/kenwheeler/cash @license MIT */
(function (factory) {
    window.cash = factory();
})(function () {
    var doc = document,
        win = window,
        ArrayProto = Array.prototype,
        slice = ArrayProto.slice,
        filter = ArrayProto.filter,
        push = ArrayProto.push;

    var noop = function () { },
        isFunction = function (item) {
            // @see https://crbug.com/568448
            return typeof item === typeof noop && item.call;
        },
        isString = function (item) {
            return typeof item === typeof "";
        };

    var idMatch = /^#[\w-]*$/,
        classMatch = /^\.[\w-]*$/,
        htmlMatch = /<.+>/,
        singlet = /^\w+$/;

    function find(selector, context) {
        context = context || doc;
        var elems = classMatch.test(selector) ? context.getElementsByClassName(selector.slice(1)) : singlet.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector);
        return elems;
    }

    var frag;
    function parseHTML(str) {
        if (!frag) {
            frag = doc.implementation.createHTMLDocument(null);
            var base = frag.createElement("base");
            base.href = doc.location.href;
            frag.head.appendChild(base);
        }

        frag.body.innerHTML = str;

        return frag.body.childNodes;
    }

    function onReady(fn) {
        if (doc.readyState !== "loading") {
            fn();
        } else {
            doc.addEventListener("DOMContentLoaded", fn);
        }
    }

    function Init(selector, context) {
        if (!selector) {
            return this;
        }

        // If already a cash collection, don't do any further processing
        if (selector.cash && selector !== win) {
            return selector;
        }

        var elems = selector,
            i = 0,
            length;

        if (isString(selector)) {
            elems = idMatch.test(selector) ?
                // If an ID use the faster getElementById check
                doc.getElementById(selector.slice(1)) : htmlMatch.test(selector) ?
                    // If HTML, parse it into real elements
                    parseHTML(selector) :
                    // else use `find`
                    find(selector, context);

            // If function, use as shortcut for DOM ready
        } else if (isFunction(selector)) {
            onReady(selector); return this;
        }

        if (!elems) {
            return this;
        }

        // If a single DOM element is passed in or received via ID, return the single element
        if (elems.nodeType || elems === win) {
            this[0] = elems;
            this.length = 1;
        } else {
            // Treat like an array and loop through each item.
            length = this.length = elems.length;
            for (; i < length; i++) {
                this[i] = elems[i];
            }
        }

        return this;
    }

    function cash(selector, context) {
        return new Init(selector, context);
    }

    var fn = cash.fn = cash.prototype = Init.prototype = { // jshint ignore:line
        cash: true,
        length: 0,
        push: push,
        splice: ArrayProto.splice,
        map: ArrayProto.map,
        init: Init
    };

    Object.defineProperty(fn, "constructor", { value: cash });

    cash.parseHTML = parseHTML;
    cash.noop = noop;
    cash.isFunction = isFunction;
    cash.isString = isString;

    cash.extend = fn.extend = function (target) {
        target = target || {};

        var args = slice.call(arguments),
            length = args.length,
            i = 1;

        if (args.length === 1) {
            target = this;
            i = 0;
        }

        for (; i < length; i++) {
            if (!args[i]) {
                continue;
            }
            for (var key in args[i]) {
                if (args[i].hasOwnProperty(key)) {
                    target[key] = args[i][key];
                }
            }
        }

        return target;
    };

    function each(collection, callback) {
        var l = collection.length,
            i = 0;

        for (; i < l; i++) {
            if (callback.call(collection[i], collection[i], i, collection) === false) {
                break;
            }
        }
    }

    function matches(el, selector) {
        var m = el && (el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector);
        return !!m && m.call(el, selector);
    }

    function getCompareFunction(selector) {
        return (
            /* Use browser's `matches` function if string */
            isString(selector) ? matches :
                /* Match a cash element */
                selector.cash ? function (el) {
                    return selector.is(el);
                } :
                    /* Direct comparison */
                    function (el, selector) {
                        return el === selector;
                    }
        );
    }

    function unique(collection) {
        return cash(slice.call(collection).filter(function (item, index, self) {
            return self.indexOf(item) === index;
        }));
    }

    cash.extend({
        merge: function (first, second) {
            var len = +second.length,
                i = first.length,
                j = 0;

            for (; j < len; i++ , j++) {
                first[i] = second[j];
            }

            first.length = i;
            return first;
        },

        each: each,
        matches: matches,
        unique: unique,
        isArray: Array.isArray,
        isNumeric: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

    });

    var uid = cash.uid = "_cash" + Date.now();

    function getDataCache(node) {
        return node[uid] = node[uid] || {};
    }

    function setData(node, key, value) {
        return getDataCache(node)[key] = value;
    }

    function getData(node, key) {
        var c = getDataCache(node);
        if (c[key] === undefined) {
            c[key] = node.dataset ? node.dataset[key] : cash(node).attr("data-" + key);
        }
        return c[key];
    }

    function removeData(node, key) {
        var c = getDataCache(node);
        if (c) {
            delete c[key];
        } else if (node.dataset) {
            delete node.dataset[key];
        } else {
            cash(node).removeAttr("data-" + name);
        }
    }

    fn.extend({
        data: function (name, value) {
            if (isString(name)) {
                return value === undefined ? getData(this[0], name) : this.each(function (v) {
                    return setData(v, name, value);
                });
            }

            for (var key in name) {
                this.data(key, name[key]);
            }

            return this;
        },

        removeData: function (key) {
            return this.each(function (v) {
                return removeData(v, key);
            });
        }

    });

    var notWhiteMatch = /\S+/g;

    function getClasses(c) {
        return isString(c) && c.match(notWhiteMatch);
    }

    function hasClass(v, c) {
        return v.classList ? v.classList.contains(c) : new RegExp("(^| )" + c + "( |$)", "gi").test(v.className);
    }

    function addClass(v, c, spacedName) {
        if (v.classList) {
            v.classList.add(c);
        } else if (spacedName.indexOf(" " + c + " ")) {
            v.className += " " + c;
        }
    }

    function removeClass(v, c) {
        if (v.classList) {
            v.classList.remove(c);
        } else {
            v.className = v.className.replace(c, "");
        }
    }

    fn.extend({
        addClass: function (c) {
            var classes = getClasses(c);

            return classes ? this.each(function (v) {
                var spacedName = " " + v.className + " ";
                each(classes, function (c) {
                    addClass(v, c, spacedName);
                });
            }) : this;
        },

        attr: function (name, value) {
            if (!name) {
                return undefined;
            }

            if (isString(name)) {
                if (value === undefined) {
                    return this[0] ? this[0].getAttribute ? this[0].getAttribute(name) : this[0][name] : undefined;
                }

                return this.each(function (v) {
                    if (v.setAttribute) {
                        v.setAttribute(name, value);
                    } else {
                        v[name] = value;
                    }
                });
            }

            for (var key in name) {
                this.attr(key, name[key]);
            }

            return this;
        },

        hasClass: function (c) {
            var check = false,
                classes = getClasses(c);
            if (classes && classes.length) {
                this.each(function (v) {
                    check = hasClass(v, classes[0]);
                    return !check;
                });
            }
            return check;
        },

        prop: function (name, value) {
            if (isString(name)) {
                return value === undefined ? this[0][name] : this.each(function (v) {
                    v[name] = value;
                });
            }

            for (var key in name) {
                this.prop(key, name[key]);
            }

            return this;
        },

        removeAttr: function (name) {
            return this.each(function (v) {
                if (v.removeAttribute) {
                    v.removeAttribute(name);
                } else {
                    delete v[name];
                }
            });
        },

        removeClass: function (c) {
            if (!arguments.length) {
                return this.attr("class", "");
            }
            var classes = getClasses(c);
            return classes ? this.each(function (v) {
                each(classes, function (c) {
                    removeClass(v, c);
                });
            }) : this;
        },

        removeProp: function (name) {
            return this.each(function (v) {
                delete v[name];
            });
        },

        toggleClass: function (c, state) {
            if (state !== undefined) {
                return this[state ? "addClass" : "removeClass"](c);
            }
            var classes = getClasses(c);
            return classes ? this.each(function (v) {
                var spacedName = " " + v.className + " ";
                each(classes, function (c) {
                    if (hasClass(v, c)) {
                        removeClass(v, c);
                    } else {
                        addClass(v, c, spacedName);
                    }
                });
            }) : this;
        }
    });

    fn.extend({
        add: function (selector, context) {
            return unique(cash.merge(this, cash(selector, context)));
        },

        each: function (callback) {
            each(this, callback);
            return this;
        },

        eq: function (index) {
            return cash(this.get(index));
        },

        filter: function (selector) {
            if (!selector) {
                return this;
            }

            var comparator = isFunction(selector) ? selector : getCompareFunction(selector);

            return cash(filter.call(this, function (e) {
                return comparator(e, selector);
            }));
        },

        first: function () {
            return this.eq(0);
        },

        get: function (index) {
            if (index === undefined) {
                return slice.call(this);
            }
            return index < 0 ? this[index + this.length] : this[index];
        },

        index: function (elem) {
            var child = elem ? cash(elem)[0] : this[0],
                collection = elem ? this : cash(child).parent().children();
            return slice.call(collection).indexOf(child);
        },

        last: function () {
            return this.eq(-1);
        }

    });

    var camelCase = function () {
        var camelRegex = /(?:^\w|[A-Z]|\b\w)/g,
            whiteSpace = /[\s-_]+/g;
        return function (str) {
            return str.replace(camelRegex, function (letter, index) {
                return letter[index === 0 ? "toLowerCase" : "toUpperCase"]();
            }).replace(whiteSpace, "");
        };
    }();

    var getPrefixedProp = function () {
        var cache = {},
            doc = document,
            div = doc.createElement("div"),
            style = div.style;

        return function (prop) {
            prop = camelCase(prop);
            if (cache[prop]) {
                return cache[prop];
            }

            var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
                prefixes = ["webkit", "moz", "ms", "o"],
                props = (prop + " " + prefixes.join(ucProp + " ") + ucProp).split(" ");

            each(props, function (p) {
                if (p in style) {
                    cache[p] = prop = cache[prop] = p;
                    return false;
                }
            });

            return cache[prop];
        };
    }();

    cash.prefixedProp = getPrefixedProp;
    cash.camelCase = camelCase;

    fn.extend({
        css: function (prop, value) {
            if (isString(prop)) {
                prop = getPrefixedProp(prop);
                return arguments.length > 1 ? this.each(function (v) {
                    return v.style[prop] = value;
                }) : win.getComputedStyle(this[0])[prop];
            }

            for (var key in prop) {
                this.css(key, prop[key]);
            }

            return this;
        }

    });

    function compute(el, prop) {
        return parseInt(win.getComputedStyle(el[0], null)[prop], 10) || 0;
    }

    each(["Width", "Height"], function (v) {
        var lower = v.toLowerCase();

        fn[lower] = function () {
            return this[0].getBoundingClientRect()[lower];
        };

        fn["inner" + v] = function () {
            return this[0]["client" + v];
        };

        fn["outer" + v] = function (margins) {
            return this[0]["offset" + v] + (margins ? compute(this, "margin" + (v === "Width" ? "Left" : "Top")) + compute(this, "margin" + (v === "Width" ? "Right" : "Bottom")) : 0);
        };
    });

    function registerEvent(node, eventName, callback) {
        var eventCache = getData(node, "_cashEvents") || setData(node, "_cashEvents", {});
        eventCache[eventName] = eventCache[eventName] || [];
        eventCache[eventName].push(callback);
        node.addEventListener(eventName, callback);
    }

    function removeEvent(node, eventName, callback) {
        var events = getData(node, "_cashEvents"),
            eventCache = events && events[eventName],
            index;

        if (!eventCache) {
            return;
        }

        if (callback) {
            node.removeEventListener(eventName, callback);
            index = eventCache.indexOf(callback);
            if (index >= 0) {
                eventCache.splice(index, 1);
            }
        } else {
            each(eventCache, function (event) {
                node.removeEventListener(eventName, event);
            });
            eventCache = [];
        }
    }

    fn.extend({
        off: function (eventName, callback) {
            return this.each(function (v) {
                return removeEvent(v, eventName, callback);
            });
        },

        on: function (eventName, delegate, callback, runOnce) {
            // jshint ignore:line
            var originalCallback;
            if (!isString(eventName)) {
                for (var key in eventName) {
                    this.on(key, delegate, eventName[key]);
                }
                return this;
            }

            if (isFunction(delegate)) {
                callback = delegate;
                delegate = null;
            }

            if (eventName === "ready") {
                onReady(callback);
                return this;
            }

            if (delegate) {
                originalCallback = callback;
                callback = function (e) {
                    var t = e.target;
                    while (!matches(t, delegate)) {
                        if (t === this || t === null) {
                            return t = false;
                        }

                        t = t.parentNode;
                    }

                    if (t) {
                        originalCallback.call(t, e);
                    }
                };
            }

            return this.each(function (v) {
                var finalCallback = callback;
                if (runOnce) {
                    finalCallback = function () {
                        callback.apply(this, arguments);
                        removeEvent(v, eventName, finalCallback);
                    };
                }
                registerEvent(v, eventName, finalCallback);
            });
        },

        one: function (eventName, delegate, callback) {
            return this.on(eventName, delegate, callback, true);
        },

        ready: onReady,

        /**
         * Modified
         * Triggers browser event
         * @param String eventName
         * @param Object data - Add properties to event object
         */
        trigger: function (eventName, data) {
            if (document.createEvent) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent(eventName, true, false);
                evt = this.extend(evt, data);
                return this.each(function (v) {
                    return v.dispatchEvent(evt);
                });
            }
        }

    });

    function encode(name, value) {
        return "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value).replace(/%20/g, "+");
    }

    function getSelectMultiple_(el) {
        var values = [];
        each(el.options, function (o) {
            if (o.selected) {
                values.push(o.value);
            }
        });
        return values.length ? values : null;
    }

    function getSelectSingle_(el) {
        var selectedIndex = el.selectedIndex;
        return selectedIndex >= 0 ? el.options[selectedIndex].value : null;
    }

    function getValue(el) {
        var type = el.type;
        if (!type) {
            return null;
        }
        switch (type.toLowerCase()) {
            case "select-one":
                return getSelectSingle_(el);
            case "select-multiple":
                return getSelectMultiple_(el);
            case "radio":
                return el.checked ? el.value : null;
            case "checkbox":
                return el.checked ? el.value : null;
            default:
                return el.value ? el.value : null;
        }
    }

    fn.extend({
        serialize: function () {
            var query = "";

            each(this[0].elements || this, function (el) {
                if (el.disabled || el.tagName === "FIELDSET") {
                    return;
                }
                var name = el.name;
                switch (el.type.toLowerCase()) {
                    case "file":
                    case "reset":
                    case "submit":
                    case "button":
                        break;
                    case "select-multiple":
                        var values = getValue(el);
                        if (values !== null) {
                            each(values, function (value) {
                                query += encode(name, value);
                            });
                        }
                        break;
                    default:
                        var value = getValue(el);
                        if (value !== null) {
                            query += encode(name, value);
                        }
                }
            });

            return query.substr(1);
        },

        val: function (value) {
            if (value === undefined) {
                return getValue(this[0]);
            }

            return this.each(function (v) {
                return v.value = value;
            });
        }

    });

    function insertElement(el, child, prepend) {
        if (prepend) {
            var first = el.childNodes[0];
            el.insertBefore(child, first);
        } else {
            el.appendChild(child);
        }
    }

    function insertContent(parent, child, prepend) {
        var str = isString(child);

        if (!str && child.length) {
            each(child, function (v) {
                return insertContent(parent, v, prepend);
            });
            return;
        }

        each(parent, str ? function (v) {
            return v.insertAdjacentHTML(prepend ? "afterbegin" : "beforeend", child);
        } : function (v, i) {
            return insertElement(v, i === 0 ? child : child.cloneNode(true), prepend);
        });
    }

    fn.extend({
        after: function (selector) {
            cash(selector).insertAfter(this);
            return this;
        },

        append: function (content) {
            insertContent(this, content);
            return this;
        },

        appendTo: function (parent) {
            insertContent(cash(parent), this);
            return this;
        },

        before: function (selector) {
            cash(selector).insertBefore(this);
            return this;
        },

        clone: function () {
            return cash(this.map(function (v) {
                return v.cloneNode(true);
            }));
        },

        empty: function () {
            this.html("");
            return this;
        },

        html: function (content) {
            if (content === undefined) {
                return this[0].innerHTML;
            }
            var source = content.nodeType ? content[0].outerHTML : content;
            return this.each(function (v) {
                return v.innerHTML = source;
            });
        },

        insertAfter: function (selector) {
            var _this = this;

            cash(selector).each(function (el, i) {
                var parent = el.parentNode,
                    sibling = el.nextSibling;
                _this.each(function (v) {
                    parent.insertBefore(i === 0 ? v : v.cloneNode(true), sibling);
                });
            });

            return this;
        },

        insertBefore: function (selector) {
            var _this2 = this;
            cash(selector).each(function (el, i) {
                var parent = el.parentNode;
                _this2.each(function (v) {
                    parent.insertBefore(i === 0 ? v : v.cloneNode(true), el);
                });
            });
            return this;
        },

        prepend: function (content) {
            insertContent(this, content, true);
            return this;
        },

        prependTo: function (parent) {
            insertContent(cash(parent), this, true);
            return this;
        },

        remove: function () {
            return this.each(function (v) {
                if (!!v.parentNode) {
                    return v.parentNode.removeChild(v);
                }
            });
        },

        text: function (content) {
            if (content === undefined) {
                return this[0].textContent;
            }
            return this.each(function (v) {
                return v.textContent = content;
            });
        }

    });

    var docEl = doc.documentElement;

    fn.extend({
        position: function () {
            var el = this[0];
            return {
                left: el.offsetLeft,
                top: el.offsetTop
            };
        },

        offset: function () {
            var rect = this[0].getBoundingClientRect();
            return {
                top: rect.top + win.pageYOffset - docEl.clientTop,
                left: rect.left + win.pageXOffset - docEl.clientLeft
            };
        },

        offsetParent: function () {
            return cash(this[0].offsetParent);
        }

    });

    fn.extend({
        children: function (selector) {
            var elems = [];
            this.each(function (el) {
                push.apply(elems, el.children);
            });
            elems = unique(elems);

            return !selector ? elems : elems.filter(function (v) {
                return matches(v, selector);
            });
        },

        closest: function (selector) {
            if (!selector || this.length < 1) {
                return cash();
            }
            if (this.is(selector)) {
                return this.filter(selector);
            }
            return this.parent().closest(selector);
        },

        is: function (selector) {
            if (!selector) {
                return false;
            }

            var match = false,
                comparator = getCompareFunction(selector);

            this.each(function (el) {
                match = comparator(el, selector);
                return !match;
            });

            return match;
        },

        find: function (selector) {
            if (!selector || selector.nodeType) {
                return cash(selector && this.has(selector).length ? selector : null);
            }

            var elems = [];
            this.each(function (el) {
                push.apply(elems, find(selector, el));
            });

            return unique(elems);
        },

        has: function (selector) {
            var comparator = isString(selector) ? function (el) {
                return find(selector, el).length !== 0;
            } : function (el) {
                return el.contains(selector);
            };

            return this.filter(comparator);
        },

        next: function () {
            return cash(this[0].nextElementSibling);
        },

        not: function (selector) {
            if (!selector) {
                return this;
            }

            var comparator = getCompareFunction(selector);

            return this.filter(function (el) {
                return !comparator(el, selector);
            });
        },

        parent: function () {
            var result = [];

            this.each(function (item) {
                if (item && item.parentNode) {
                    result.push(item.parentNode);
                }
            });

            return unique(result);
        },

        parents: function (selector) {
            var last,
                result = [];

            this.each(function (item) {
                last = item;

                while (last && last.parentNode && last !== doc.body.parentNode) {
                    last = last.parentNode;

                    if (!selector || selector && matches(last, selector)) {
                        result.push(last);
                    }
                }
            });

            return unique(result);
        },

        prev: function () {
            return cash(this[0].previousElementSibling);
        },

        siblings: function (selector) {
            var collection = this.parent().children(selector),
                el = this[0];

            return collection.filter(function (i) {
                return i !== el;
            });
        }

    });

    return cash;
});
;
var Component = function () {
    /**
     * Generic constructor for all components
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Component(classDef, el, options) {
        _classCallCheck(this, Component);

        // Display error if el is valid HTML Element
        if (!(el instanceof Element)) {
            console.error(Error(el + ' is not an HTML Element'));
        }

        // If exists, destroy and reinitialize in child
        var ins = classDef.getInstance(el);
        if (!!ins) {
            ins.destroy();
        }

        this.el = el;
        this.$el = cash(el);
    }

    /**
     * Initializes components
     * @param {class} classDef
     * @param {Element | NodeList | jQuery} els
     * @param {Object} options
     */


    _createClass(Component, null, [{
        key: "init",
        value: function init(classDef, els, options) {
            var instances = null;
            if (els instanceof Element) {
                instances = new classDef(els, options);
            } else if (!!els && (els.jquery || els.cash || els instanceof NodeList)) {
                var instancesArr = [];
                for (var i = 0; i < els.length; i++) {
                    instancesArr.push(new classDef(els[i], options));
                }
                instances = instancesArr;
            }

            return instances;
        }
    }]);

    return Component;
}();

; // Required for Meteor package, the use of window prevents export by Meteor
(function (window) {
    if (window.Package) {
        M = {};
    } else {
        window.M = {};
    }

    // Check for jQuery
    M.jQueryLoaded = !!window.jQuery;
})(window);

// AMD
if (typeof define === 'function' && define.amd) {
    define('M', [], function () {
        return M;
    });

    // Common JS
} else if (typeof exports !== 'undefined' && !exports.nodeType) {
    if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
        exports = module.exports = M;
    }
    exports.default = M;
}

M.version = '1.0.0';

M.keys = {
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    ARROW_UP: 38,
    ARROW_DOWN: 40
};

/**
 * TabPress Keydown handler
 */
M.tabPressed = false;
M.keyDown = false;
var docHandleKeydown = function (e) {
    M.keyDown = true;
    if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
        M.tabPressed = true;
    }
};
var docHandleKeyup = function (e) {
    M.keyDown = false;
    if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
        M.tabPressed = false;
    }
};
var docHandleFocus = function (e) {
    if (M.keyDown) {
        document.body.classList.add('keyboard-focused');
    }
};
var docHandleBlur = function (e) {
    document.body.classList.remove('keyboard-focused');
};
document.addEventListener('keydown', docHandleKeydown, true);
document.addEventListener('keyup', docHandleKeyup, true);
document.addEventListener('focus', docHandleFocus, true);
document.addEventListener('blur', docHandleBlur, true);

/**
 * Initialize jQuery wrapper for plugin
 * @param {Class} plugin  javascript class
 * @param {string} pluginName  jQuery plugin name
 * @param {string} classRef  Class reference name
 */
M.initializeJqueryWrapper = function (plugin, pluginName, classRef) {
    jQuery.fn[pluginName] = function (methodOrOptions) {
        // Call plugin method if valid method name is passed in
        if (plugin.prototype[methodOrOptions]) {
            var params = Array.prototype.slice.call(arguments, 1);

            // Getter methods
            if (methodOrOptions.slice(0, 3) === 'get') {
                var instance = this.first()[0][classRef];
                return instance[methodOrOptions].apply(instance, params);
            }

            // Void methods
            return this.each(function () {
                var instance = this[classRef];
                instance[methodOrOptions].apply(instance, params);
            });

            // Initialize plugin if options or no argument is passed in
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            plugin.init(this, arguments[0]);
            return this;
        }

        // Return error if an unrecognized  method name is passed in
        jQuery.error("Method " + methodOrOptions + " does not exist on jQuery." + pluginName);
    };
};

/**
 * Automatically initialize components
 * @param {Element} context  DOM Element to search within for components
 */
M.AutoInit = function (context) {
    // Use document.body if no context is given
    var root = !!context ? context : document.body;

    var registry = {
        Autocomplete: root.querySelectorAll('.autocomplete:not(.no-autoinit)'),
        Carousel: root.querySelectorAll('.carousel:not(.no-autoinit)'),
        Chips: root.querySelectorAll('.chips:not(.no-autoinit)'),
        Collapsible: root.querySelectorAll('.collapsible:not(.no-autoinit)'),
        Datepicker: root.querySelectorAll('.datepicker:not(.no-autoinit)'),
        Dropdown: root.querySelectorAll('.dropdown-trigger:not(.no-autoinit)'),
        Materialbox: root.querySelectorAll('.materialboxed:not(.no-autoinit)'),
        Modal: root.querySelectorAll('.modal:not(.no-autoinit)'),
        Parallax: root.querySelectorAll('.parallax:not(.no-autoinit)'),
        Pushpin: root.querySelectorAll('.pushpin:not(.no-autoinit)'),
        ScrollSpy: root.querySelectorAll('.scrollspy:not(.no-autoinit)'),
        FormSelect: root.querySelectorAll('select:not(.no-autoinit)'),
        Sidenav: root.querySelectorAll('.sidenav:not(.no-autoinit)'),
        Tabs: root.querySelectorAll('.tabs:not(.no-autoinit)'),
        TapTarget: root.querySelectorAll('.tap-target:not(.no-autoinit)'),
        Timepicker: root.querySelectorAll('.timepicker:not(.no-autoinit)'),
        Tooltip: root.querySelectorAll('.tooltipped:not(.no-autoinit)'),
        FloatingActionButton: root.querySelectorAll('.fixed-action-btn:not(.no-autoinit)')
    };

    for (var pluginName in registry) {
        var plugin = M[pluginName];
        plugin.init(registry[pluginName]);
    }
};

/**
 * Generate approximated selector string for a jQuery object
 * @param {jQuery} obj  jQuery object to be parsed
 * @returns {string}
 */
M.objectSelectorString = function (obj) {
    var tagStr = obj.prop('tagName') || '';
    var idStr = obj.attr('id') || '';
    var classStr = obj.attr('class') || '';
    return (tagStr + idStr + classStr).replace(/\s/g, '');
};

// Unique Random ID
M.guid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
}();

/**
 * Escapes hash from special characters
 * @param {string} hash  String returned from this.hash
 * @returns {string}
 */
M.escapeHash = function (hash) {
    return hash.replace(/(:|\.|\[|\]|,|=|\/)/g, '\\$1');
};

M.elementOrParentIsFixed = function (element) {
    var $element = $(element);
    var $checkElements = $element.add($element.parents());
    var isFixed = false;
    $checkElements.each(function () {
        if ($(this).css('position') === 'fixed') {
            isFixed = true;
            return false;
        }
    });
    return isFixed;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Escapes hash from special characters
 * @param {Element} container  Container element that acts as the boundary
 * @param {Bounding} bounding  element bounding that is being checked
 * @param {Number} offset  offset from edge that counts as exceeding
 * @returns {Edges}
 */
M.checkWithinContainer = function (container, bounding, offset) {
    var edges = {
        top: false,
        right: false,
        bottom: false,
        left: false
    };

    var containerRect = container.getBoundingClientRect();
    // If body element is smaller than viewport, use viewport height instead.
    var containerBottom = container === document.body ? Math.max(containerRect.bottom, window.innerHeight) : containerRect.bottom;

    var scrollLeft = container.scrollLeft;
    var scrollTop = container.scrollTop;

    var scrolledX = bounding.left - scrollLeft;
    var scrolledY = bounding.top - scrollTop;

    // Check for container and viewport for each edge
    if (scrolledX < containerRect.left + offset || scrolledX < offset) {
        edges.left = true;
    }

    if (scrolledX + bounding.width > containerRect.right - offset || scrolledX + bounding.width > window.innerWidth - offset) {
        edges.right = true;
    }

    if (scrolledY < containerRect.top + offset || scrolledY < offset) {
        edges.top = true;
    }

    if (scrolledY + bounding.height > containerBottom - offset || scrolledY + bounding.height > window.innerHeight - offset) {
        edges.bottom = true;
    }

    return edges;
};

M.checkPossibleAlignments = function (el, container, bounding, offset) {
    var canAlign = {
        top: true,
        right: true,
        bottom: true,
        left: true,
        spaceOnTop: null,
        spaceOnRight: null,
        spaceOnBottom: null,
        spaceOnLeft: null
    };

    var containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
    var containerRect = container.getBoundingClientRect();
    var containerHeight = Math.min(containerRect.height, window.innerHeight);
    var containerWidth = Math.min(containerRect.width, window.innerWidth);
    var elOffsetRect = el.getBoundingClientRect();

    var scrollLeft = container.scrollLeft;
    var scrollTop = container.scrollTop;

    var scrolledX = bounding.left - scrollLeft;
    var scrolledYTopEdge = bounding.top - scrollTop;
    var scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

    // Check for container and viewport for left
    canAlign.spaceOnRight = !containerAllowsOverflow ? containerWidth - (scrolledX + bounding.width) : window.innerWidth - (elOffsetRect.left + bounding.width);
    if (canAlign.spaceOnRight < 0) {
        canAlign.left = false;
    }

    // Check for container and viewport for Right
    canAlign.spaceOnLeft = !containerAllowsOverflow ? scrolledX - bounding.width + elOffsetRect.width : elOffsetRect.right - bounding.width;
    if (canAlign.spaceOnLeft < 0) {
        canAlign.right = false;
    }

    // Check for container and viewport for Top
    canAlign.spaceOnBottom = !containerAllowsOverflow ? containerHeight - (scrolledYTopEdge + bounding.height + offset) : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
    if (canAlign.spaceOnBottom < 0) {
        canAlign.top = false;
    }

    // Check for container and viewport for Bottom
    canAlign.spaceOnTop = !containerAllowsOverflow ? scrolledYBottomEdge - (bounding.height - offset) : elOffsetRect.bottom - (bounding.height + offset);
    if (canAlign.spaceOnTop < 0) {
        canAlign.bottom = false;
    }

    return canAlign;
};

M.getOverflowParent = function (element) {
    if (element == null) {
        return null;
    }

    if (element === document.body || getComputedStyle(element).overflow !== 'visible') {
        return element;
    }

    return M.getOverflowParent(element.parentElement);
};

/**
 * Gets id of component from a trigger
 * @param {Element} trigger  trigger
 * @returns {string}
 */
M.getIdFromTrigger = function (trigger) {
    var id = trigger.getAttribute('data-target');
    if (!id) {
        id = trigger.getAttribute('href');
        if (id) {
            id = id.slice(1);
        } else {
            id = '';
        }
    }
    return id;
};

/**
 * Multi browser support for document scroll top
 * @returns {Number}
 */
M.getDocumentScrollTop = function () {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

/**
 * Multi browser support for document scroll left
 * @returns {Number}
 */
M.getDocumentScrollLeft = function () {
    return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Get time in ms
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @type {function}
 * @return {number}
 */
var getTime = Date.now || function () {
    return new Date().getTime();
};

/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. Normally, the throttled function will run
 * as much as it can, without ever going more than once per `wait` duration;
 * but if you'd like to disable the execution on the leading edge, pass
 * `{leading: false}`. To disable execution on the trailing edge, ditto.
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @param {function} func
 * @param {number} wait
 * @param {Object=} options
 * @returns {Function}
 */
M.throttle = function (func, wait, options) {
    var context = void 0,
        args = void 0,
        result = void 0;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function () {
        previous = options.leading === false ? 0 : getTime();
        timeout = null;
        result = func.apply(context, args);
        context = args = null;
    };
    return function () {
        var now = getTime();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
            context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};
; /*
  v2.2.0
  2017 Julian Garnier
  Released under the MIT license
  */
var $jscomp = { scope: {} }; $jscomp.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function (e, r, p) {
    if (p.get || p.set) throw new TypeError("ES3 does not support getters and setters."); e != Array.prototype && e != Object.prototype && (e[r] = p.value);
}; $jscomp.getGlobal = function (e) {
    return "undefined" != typeof window && window === e ? e : "undefined" != typeof global && null != global ? global : e;
}; $jscomp.global = $jscomp.getGlobal(this); $jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function () {
    $jscomp.initSymbol = function () { }; $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
}; $jscomp.symbolCounter_ = 0; $jscomp.Symbol = function (e) {
    return $jscomp.SYMBOL_PREFIX + (e || "") + $jscomp.symbolCounter_++;
};
$jscomp.initSymbolIterator = function () {
    $jscomp.initSymbol(); var e = $jscomp.global.Symbol.iterator; e || (e = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator")); "function" != typeof Array.prototype[e] && $jscomp.defineProperty(Array.prototype, e, {
        configurable: !0, writable: !0, value: function () {
            return $jscomp.arrayIterator(this);
        }
    }); $jscomp.initSymbolIterator = function () { };
}; $jscomp.arrayIterator = function (e) {
    var r = 0; return $jscomp.iteratorPrototype(function () {
        return r < e.length ? { done: !1, value: e[r++] } : { done: !0 };
    });
};
$jscomp.iteratorPrototype = function (e) {
    $jscomp.initSymbolIterator(); e = { next: e }; e[$jscomp.global.Symbol.iterator] = function () {
        return this;
    }; return e;
}; $jscomp.array = $jscomp.array || {}; $jscomp.iteratorFromArray = function (e, r) {
    $jscomp.initSymbolIterator(); e instanceof String && (e += ""); var p = 0,
        m = {
            next: function () {
                if (p < e.length) {
                    var u = p++; return { value: r(u, e[u]), done: !1 };
                } m.next = function () {
                    return { done: !0, value: void 0 };
                }; return m.next();
            }
        }; m[Symbol.iterator] = function () {
            return m;
        }; return m;
};
$jscomp.polyfill = function (e, r, p, m) {
    if (r) {
        p = $jscomp.global; e = e.split("."); for (m = 0; m < e.length - 1; m++) {
            var u = e[m]; u in p || (p[u] = {}); p = p[u];
        } e = e[e.length - 1]; m = p[e]; r = r(m); r != m && null != r && $jscomp.defineProperty(p, e, { configurable: !0, writable: !0, value: r });
    }
}; $jscomp.polyfill("Array.prototype.keys", function (e) {
    return e ? e : function () {
        return $jscomp.iteratorFromArray(this, function (e) {
            return e;
        });
    };
}, "es6-impl", "es3"); var $jscomp$this = this;
(function (r) {
    M.anime = r();
})(function () {
    function e(a) {
        if (!h.col(a)) try {
            return document.querySelectorAll(a);
        } catch (c) { }
    } function r(a, c) {
        for (var d = a.length, b = 2 <= arguments.length ? arguments[1] : void 0, f = [], n = 0; n < d; n++) {
            if (n in a) {
                var k = a[n]; c.call(b, k, n, a) && f.push(k);
            }
        } return f;
    } function p(a) {
        return a.reduce(function (a, d) {
            return a.concat(h.arr(d) ? p(d) : d);
        }, []);
    } function m(a) {
        if (h.arr(a)) return a;
        h.str(a) && (a = e(a) || a); return a instanceof NodeList || a instanceof HTMLCollection ? [].slice.call(a) : [a];
    } function u(a, c) {
        return a.some(function (a) {
            return a === c;
        });
    } function C(a) {
        var c = {},
            d; for (d in a) {
                c[d] = a[d];
            } return c;
    } function D(a, c) {
        var d = C(a),
            b; for (b in a) {
                d[b] = c.hasOwnProperty(b) ? c[b] : a[b];
            } return d;
    } function z(a, c) {
        var d = C(a),
            b; for (b in c) {
                d[b] = h.und(a[b]) ? c[b] : a[b];
            } return d;
    } function T(a) {
        a = a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (a, c, d, k) {
            return c + c + d + d + k + k;
        }); var c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
        a = parseInt(c[1], 16); var d = parseInt(c[2], 16),
            c = parseInt(c[3], 16); return "rgba(" + a + "," + d + "," + c + ",1)";
    } function U(a) {
        function c(a, c, b) {
            0 > b && (b += 1); 1 < b && --b; return b < 1 / 6 ? a + 6 * (c - a) * b : .5 > b ? c : b < 2 / 3 ? a + (c - a) * (2 / 3 - b) * 6 : a;
        } var d = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(a); a = parseInt(d[1]) / 360; var b = parseInt(d[2]) / 100,
            f = parseInt(d[3]) / 100,
            d = d[4] || 1; if (0 == b) f = b = a = f; else {
                var n = .5 > f ? f * (1 + b) : f + b - f * b,
                    k = 2 * f - n,
                    f = c(k, n, a + 1 / 3),
                    b = c(k, n, a); a = c(k, n, a - 1 / 3);
            } return "rgba(" + 255 * f + "," + 255 * b + "," + 255 * a + "," + d + ")";
    } function y(a) {
        if (a = /([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(a)) return a[2];
    } function V(a) {
        if (-1 < a.indexOf("translate") || "perspective" === a) return "px"; if (-1 < a.indexOf("rotate") || -1 < a.indexOf("skew")) return "deg";
    } function I(a, c) {
        return h.fnc(a) ? a(c.target, c.id, c.total) : a;
    } function E(a, c) {
        if (c in a.style) return getComputedStyle(a).getPropertyValue(c.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()) || "0";
    } function J(a, c) {
        if (h.dom(a) && u(W, c)) return "transform"; if (h.dom(a) && (a.getAttribute(c) || h.svg(a) && a[c])) return "attribute"; if (h.dom(a) && "transform" !== c && E(a, c)) return "css"; if (null != a[c]) return "object";
    } function X(a, c) {
        var d = V(c),
            d = -1 < c.indexOf("scale") ? 1 : 0 + d; a = a.style.transform; if (!a) return d; for (var b = [], f = [], n = [], k = /(\w+)\((.+?)\)/g; b = k.exec(a);) {
                f.push(b[1]), n.push(b[2]);
            } a = r(n, function (a, b) {
                return f[b] === c;
            }); return a.length ? a[0] : d;
    } function K(a, c) {
        switch (J(a, c)) {
            case "transform":
                return X(a, c); case "css":
                return E(a, c); case "attribute":
                return a.getAttribute(c);
        }return a[c] || 0;
    } function L(a, c) {
        var d = /^(\*=|\+=|-=)/.exec(a); if (!d) return a; var b = y(a) || 0; c = parseFloat(c); a = parseFloat(a.replace(d[0], "")); switch (d[0][0]) {
            case "+":
                return c + a + b; case "-":
                return c - a + b; case "*":
                return c * a + b;
        }
    } function F(a, c) {
        return Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
    } function M(a) {
        a = a.points; for (var c = 0, d, b = 0; b < a.numberOfItems; b++) {
            var f = a.getItem(b); 0 < b && (c += F(d, f)); d = f;
        } return c;
    } function N(a) {
        if (a.getTotalLength) return a.getTotalLength(); switch (a.tagName.toLowerCase()) {
            case "circle":
                return 2 * Math.PI * a.getAttribute("r"); case "rect":
                return 2 * a.getAttribute("width") + 2 * a.getAttribute("height"); case "line":
                return F({ x: a.getAttribute("x1"), y: a.getAttribute("y1") }, { x: a.getAttribute("x2"), y: a.getAttribute("y2") }); case "polyline":
                return M(a); case "polygon":
                var c = a.points; return M(a) + F(c.getItem(c.numberOfItems - 1), c.getItem(0));
        }
    } function Y(a, c) {
        function d(b) {
            b = void 0 === b ? 0 : b; return a.el.getPointAtLength(1 <= c + b ? c + b : 0);
        } var b = d(),
            f = d(-1),
            n = d(1); switch (a.property) {
                case "x":
                    return b.x; case "y":
                    return b.y;
                case "angle":
                    return 180 * Math.atan2(n.y - f.y, n.x - f.x) / Math.PI;
            }
    } function O(a, c) {
        var d = /-?\d*\.?\d+/g,
            b; b = h.pth(a) ? a.totalLength : a; if (h.col(b)) {
                if (h.rgb(b)) {
                    var f = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(b); b = f ? "rgba(" + f[1] + ",1)" : b;
                } else b = h.hex(b) ? T(b) : h.hsl(b) ? U(b) : void 0;
            } else f = (f = y(b)) ? b.substr(0, b.length - f.length) : b, b = c && !/\s/g.test(b) ? f + c : f; b += ""; return { original: b, numbers: b.match(d) ? b.match(d).map(Number) : [0], strings: h.str(a) || c ? b.split(d) : [] };
    } function P(a) {
        a = a ? p(h.arr(a) ? a.map(m) : m(a)) : []; return r(a, function (a, d, b) {
            return b.indexOf(a) === d;
        });
    } function Z(a) {
        var c = P(a); return c.map(function (a, b) {
            return { target: a, id: b, total: c.length };
        });
    } function aa(a, c) {
        var d = C(c); if (h.arr(a)) {
            var b = a.length; 2 !== b || h.obj(a[0]) ? h.fnc(c.duration) || (d.duration = c.duration / b) : a = { value: a };
        } return m(a).map(function (a, b) {
            b = b ? 0 : c.delay; a = h.obj(a) && !h.pth(a) ? a : { value: a }; h.und(a.delay) && (a.delay = b); return a;
        }).map(function (a) {
            return z(a, d);
        });
    } function ba(a, c) {
        var d = {},
            b; for (b in a) {
                var f = I(a[b], c); h.arr(f) && (f = f.map(function (a) {
                    return I(a, c);
                }), 1 === f.length && (f = f[0])); d[b] = f;
            } d.duration = parseFloat(d.duration); d.delay = parseFloat(d.delay); return d;
    } function ca(a) {
        return h.arr(a) ? A.apply(this, a) : Q[a];
    } function da(a, c) {
        var d; return a.tweens.map(function (b) {
            b = ba(b, c); var f = b.value,
                e = K(c.target, a.name),
                k = d ? d.to.original : e,
                k = h.arr(f) ? f[0] : k,
                w = L(h.arr(f) ? f[1] : f, k),
                e = y(w) || y(k) || y(e); b.from = O(k, e); b.to = O(w, e); b.start = d ? d.end : a.offset; b.end = b.start + b.delay + b.duration; b.easing = ca(b.easing); b.elasticity = (1E3 - Math.min(Math.max(b.elasticity, 1), 999)) / 1E3; b.isPath = h.pth(f); b.isColor = h.col(b.from.original); b.isColor && (b.round = 1); return d = b;
        });
    } function ea(a, c) {
        return r(p(a.map(function (a) {
            return c.map(function (b) {
                var c = J(a.target, b.name); if (c) {
                    var d = da(b, a); b = { type: c, property: b.name, animatable: a, tweens: d, duration: d[d.length - 1].end, delay: d[0].delay };
                } else b = void 0; return b;
            });
        })), function (a) {
            return !h.und(a);
        });
    } function R(a, c, d, b) {
        var f = "delay" === a; return c.length ? (f ? Math.min : Math.max).apply(Math, c.map(function (b) {
            return b[a];
        })) : f ? b.delay : d.offset + b.delay + b.duration;
    } function fa(a) {
        var c = D(ga, a),
            d = D(S, a),
            b = Z(a.targets),
            f = [],
            e = z(c, d),
            k; for (k in a) {
                e.hasOwnProperty(k) || "targets" === k || f.push({ name: k, offset: e.offset, tweens: aa(a[k], d) });
            } a = ea(b, f); return z(c, { children: [], animatables: b, animations: a, duration: R("duration", a, c, d), delay: R("delay", a, c, d) });
    } function q(a) {
        function c() {
            return window.Promise && new Promise(function (a) {
                return p = a;
            });
        } function d(a) {
            return g.reversed ? g.duration - a : a;
        } function b(a) {
            for (var b = 0, c = {}, d = g.animations, f = d.length; b < f;) {
                var e = d[b],
                    k = e.animatable,
                    h = e.tweens,
                    n = h.length - 1,
                    l = h[n]; n && (l = r(h, function (b) {
                        return a < b.end;
                    })[0] || l); for (var h = Math.min(Math.max(a - l.start - l.delay, 0), l.duration) / l.duration, w = isNaN(h) ? 1 : l.easing(h, l.elasticity), h = l.to.strings, p = l.round, n = [], m = void 0, m = l.to.numbers.length, t = 0; t < m; t++) {
                        var x = void 0,
                            x = l.to.numbers[t],
                            q = l.from.numbers[t],
                            x = l.isPath ? Y(l.value, w * x) : q + w * (x - q); p && (l.isColor && 2 < t || (x = Math.round(x * p) / p)); n.push(x);
                    } if (l = h.length) for (m = h[0], w = 0; w < l; w++) {
                        p = h[w + 1], t = n[w], isNaN(t) || (m = p ? m + (t + p) : m + (t + " "));
                    } else m = n[0]; ha[e.type](k.target, e.property, m, c, k.id); e.currentValue = m; b++;
            } if (b = Object.keys(c).length) for (d = 0; d < b; d++) {
                H || (H = E(document.body, "transform") ? "transform" : "-webkit-transform"), g.animatables[d].target.style[H] = c[d].join(" ");
            } g.currentTime = a; g.progress = a / g.duration * 100;
        } function f(a) {
            if (g[a]) g[a](g);
        } function e() {
            g.remaining && !0 !== g.remaining && g.remaining--;
        } function k(a) {
            var k = g.duration,
                n = g.offset,
                w = n + g.delay,
                r = g.currentTime,
                x = g.reversed,
                q = d(a); if (g.children.length) {
                    var u = g.children,
                        v = u.length;
                    if (q >= g.currentTime) for (var G = 0; G < v; G++) {
                        u[G].seek(q);
                    } else for (; v--;) {
                        u[v].seek(q);
                    }
                } if (q >= w || !k) g.began || (g.began = !0, f("begin")), f("run"); if (q > n && q < k) b(q); else if (q <= n && 0 !== r && (b(0), x && e()), q >= k && r !== k || !k) b(k), x || e(); f("update"); a >= k && (g.remaining ? (t = h, "alternate" === g.direction && (g.reversed = !g.reversed)) : (g.pause(), g.completed || (g.completed = !0, f("complete"), "Promise" in window && (p(), m = c()))), l = 0);
        } a = void 0 === a ? {} : a; var h,
            t,
            l = 0,
            p = null,
            m = c(),
            g = fa(a); g.reset = function () {
                var a = g.direction,
                    c = g.loop; g.currentTime = 0; g.progress = 0; g.paused = !0; g.began = !1; g.completed = !1; g.reversed = "reverse" === a; g.remaining = "alternate" === a && 1 === c ? 2 : c; b(0); for (a = g.children.length; a--;) {
                        g.children[a].reset();
                    }
            }; g.tick = function (a) {
                h = a; t || (t = h); k((l + h - t) * q.speed);
            }; g.seek = function (a) {
                k(d(a));
            }; g.pause = function () {
                var a = v.indexOf(g); -1 < a && v.splice(a, 1); g.paused = !0;
            }; g.play = function () {
                g.paused && (g.paused = !1, t = 0, l = d(g.currentTime), v.push(g), B || ia());
            }; g.reverse = function () {
                g.reversed = !g.reversed; t = 0; l = d(g.currentTime);
            }; g.restart = function () {
                g.pause();
                g.reset(); g.play();
            }; g.finished = m; g.reset(); g.autoplay && g.play(); return g;
    } var ga = { update: void 0, begin: void 0, run: void 0, complete: void 0, loop: 1, direction: "normal", autoplay: !0, offset: 0 },
        S = { duration: 1E3, delay: 0, easing: "easeOutElastic", elasticity: 500, round: 0 },
        W = "translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY perspective".split(" "),
        H,
        h = {
            arr: function (a) {
                return Array.isArray(a);
            }, obj: function (a) {
                return -1 < Object.prototype.toString.call(a).indexOf("Object");
            },
            pth: function (a) {
                return h.obj(a) && a.hasOwnProperty("totalLength");
            }, svg: function (a) {
                return a instanceof SVGElement;
            }, dom: function (a) {
                return a.nodeType || h.svg(a);
            }, str: function (a) {
                return "string" === typeof a;
            }, fnc: function (a) {
                return "function" === typeof a;
            }, und: function (a) {
                return "undefined" === typeof a;
            }, hex: function (a) {
                return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)
                );
            }, rgb: function (a) {
                return (/^rgb/.test(a)
                );
            }, hsl: function (a) {
                return (/^hsl/.test(a)
                );
            }, col: function (a) {
                return h.hex(a) || h.rgb(a) || h.hsl(a);
            }
        },
        A = function () {
            function a(a, d, b) {
                return (((1 - 3 * b + 3 * d) * a + (3 * b - 6 * d)) * a + 3 * d) * a;
            } return function (c, d, b, f) {
                if (0 <= c && 1 >= c && 0 <= b && 1 >= b) {
                    var e = new Float32Array(11); if (c !== d || b !== f) for (var k = 0; 11 > k; ++k) {
                        e[k] = a(.1 * k, c, b);
                    } return function (k) {
                        if (c === d && b === f) return k; if (0 === k) return 0; if (1 === k) return 1; for (var h = 0, l = 1; 10 !== l && e[l] <= k; ++l) {
                            h += .1;
                        } --l; var l = h + (k - e[l]) / (e[l + 1] - e[l]) * .1,
                            n = 3 * (1 - 3 * b + 3 * c) * l * l + 2 * (3 * b - 6 * c) * l + 3 * c; if (.001 <= n) {
                                for (h = 0; 4 > h; ++h) {
                                    n = 3 * (1 - 3 * b + 3 * c) * l * l + 2 * (3 * b - 6 * c) * l + 3 * c; if (0 === n) break; var m = a(l, c, b) - k,
                                        l = l - m / n;
                                } k = l;
                            } else if (0 === n) k = l; else {
                                var l = h,
                                    h = h + .1,
                                    g = 0; do {
                                        m = l + (h - l) / 2, n = a(m, c, b) - k, 0 < n ? h = m : l = m;
                                    } while (1e-7 < Math.abs(n) && 10 > ++g); k = m;
                            } return a(k, d, f);
                    };
                }
            };
        }(),
        Q = function () {
            function a(a, b) {
                return 0 === a || 1 === a ? a : -Math.pow(2, 10 * (a - 1)) * Math.sin(2 * (a - 1 - b / (2 * Math.PI) * Math.asin(1)) * Math.PI / b);
            } var c = "Quad Cubic Quart Quint Sine Expo Circ Back Elastic".split(" "),
                d = {
                    In: [[.55, .085, .68, .53], [.55, .055, .675, .19], [.895, .03, .685, .22], [.755, .05, .855, .06], [.47, 0, .745, .715], [.95, .05, .795, .035], [.6, .04, .98, .335], [.6, -.28, .735, .045], a], Out: [[.25, .46, .45, .94], [.215, .61, .355, 1], [.165, .84, .44, 1], [.23, 1, .32, 1], [.39, .575, .565, 1], [.19, 1, .22, 1], [.075, .82, .165, 1], [.175, .885, .32, 1.275], function (b, c) {
                        return 1 - a(1 - b, c);
                    }], InOut: [[.455, .03, .515, .955], [.645, .045, .355, 1], [.77, 0, .175, 1], [.86, 0, .07, 1], [.445, .05, .55, .95], [1, 0, 0, 1], [.785, .135, .15, .86], [.68, -.55, .265, 1.55], function (b, c) {
                        return .5 > b ? a(2 * b, c) / 2 : 1 - a(-2 * b + 2, c) / 2;
                    }]
                },
                b = { linear: A(.25, .25, .75, .75) },
                f = {},
                e; for (e in d) {
                    f.type = e, d[f.type].forEach(function (a) {
                        return function (d, f) {
                            b["ease" + a.type + c[f]] = h.fnc(d) ? d : A.apply($jscomp$this, d);
                        };
                    }(f)), f = { type: f.type };
                } return b;
        }(),
        ha = {
            css: function (a, c, d) {
                return a.style[c] = d;
            }, attribute: function (a, c, d) {
                return a.setAttribute(c, d);
            }, object: function (a, c, d) {
                return a[c] = d;
            }, transform: function (a, c, d, b, f) {
                b[f] || (b[f] = []); b[f].push(c + "(" + d + ")");
            }
        },
        v = [],
        B = 0,
        ia = function () {
            function a() {
                B = requestAnimationFrame(c);
            } function c(c) {
                var b = v.length; if (b) {
                    for (var d = 0; d < b;) {
                        v[d] && v[d].tick(c), d++;
                    } a();
                } else cancelAnimationFrame(B), B = 0;
            } return a;
        }(); q.version = "2.2.0"; q.speed = 1; q.running = v; q.remove = function (a) {
            a = P(a); for (var c = v.length; c--;) {
                for (var d = v[c], b = d.animations, f = b.length; f--;) {
                    u(a, b[f].animatable.target) && (b.splice(f, 1), b.length || d.pause());
                }
            }
        }; q.getValue = K; q.path = function (a, c) {
            var d = h.str(a) ? e(a)[0] : a,
                b = c || 100; return function (a) {
                    return { el: d, property: a, totalLength: N(d) * (b / 100) };
                };
        }; q.setDashoffset = function (a) {
            var c = N(a); a.setAttribute("stroke-dasharray", c); return c;
        }; q.bezier = A; q.easings = Q; q.timeline = function (a) {
            var c = q(a); c.pause(); c.duration = 0; c.add = function (d) {
                c.children.forEach(function (a) {
                    a.began = !0; a.completed = !0;
                }); m(d).forEach(function (b) {
                    var d = z(b, D(S, a || {})); d.targets = d.targets || a.targets; b = c.duration; var e = d.offset; d.autoplay = !1; d.direction = c.direction; d.offset = h.und(e) ? b : L(e, b); c.began = !0; c.completed = !0; c.seek(d.offset); d = q(d); d.began = !0; d.completed = !0; d.duration > b && (c.duration = d.duration); c.children.push(d);
                }); c.seek(0); c.reset(); c.autoplay && c.restart(); return c;
            }; return c;
        }; q.random = function (a, c) {
            return Math.floor(Math.random() * (c - a + 1)) + a;
        }; return q;
});
; (function ($, anim) {
    'use strict';

    var _defaults = {
        accordion: true,
        onOpenStart: undefined,
        onOpenEnd: undefined,
        onCloseStart: undefined,
        onCloseEnd: undefined,
        inDuration: 300,
        outDuration: 300
    };

    /**
     * @class
     *
     */

    var Collapsible = function (_Component) {
        _inherits(Collapsible, _Component);

        /**
         * Construct Collapsible instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Collapsible(el, options) {
            _classCallCheck(this, Collapsible);

            var _this3 = _possibleConstructorReturn(this, (Collapsible.__proto__ || Object.getPrototypeOf(Collapsible)).call(this, Collapsible, el, options));

            _this3.el.M_Collapsible = _this3;

            /**
             * Options for the collapsible
             * @member Collapsible#options
             * @prop {Boolean} [accordion=false] - Type of the collapsible
             * @prop {Function} onOpenStart - Callback function called before collapsible is opened
             * @prop {Function} onOpenEnd - Callback function called after collapsible is opened
             * @prop {Function} onCloseStart - Callback function called before collapsible is closed
             * @prop {Function} onCloseEnd - Callback function called after collapsible is closed
             * @prop {Number} inDuration - Transition in duration in milliseconds.
             * @prop {Number} outDuration - Transition duration in milliseconds.
             */
            _this3.options = $.extend({}, Collapsible.defaults, options);

            // Setup tab indices
            _this3.$headers = _this3.$el.children('li').children('.collapsible-header');
            _this3.$headers.attr('tabindex', 0);

            _this3._setupEventHandlers();

            // Open first active
            var $activeBodies = _this3.$el.children('li.active').children('.collapsible-body');
            if (_this3.options.accordion) {
                // Handle Accordion
                $activeBodies.first().css('display', 'block');
            } else {
                // Handle Expandables
                $activeBodies.css('display', 'block');
            }
            return _this3;
        }

        _createClass(Collapsible, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this.el.M_Collapsible = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                var _this4 = this;

                this._handleCollapsibleClickBound = this._handleCollapsibleClick.bind(this);
                this._handleCollapsibleKeydownBound = this._handleCollapsibleKeydown.bind(this);
                this.el.addEventListener('click', this._handleCollapsibleClickBound);
                this.$headers.each(function (header) {
                    header.addEventListener('keydown', _this4._handleCollapsibleKeydownBound);
                });
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                var _this5 = this;

                this.el.removeEventListener('click', this._handleCollapsibleClickBound);
                this.$headers.each(function (header) {
                    header.removeEventListener('keydown', _this5._handleCollapsibleKeydownBound);
                });
            }

            /**
             * Handle Collapsible Click
             * @param {Event} e
             */

        }, {
            key: "_handleCollapsibleClick",
            value: function _handleCollapsibleClick(e) {
                var $header = $(e.target).closest('.collapsible-header');
                if (e.target && $header.length) {
                    var $collapsible = $header.closest('.collapsible');
                    if ($collapsible[0] === this.el) {
                        var $collapsibleLi = $header.closest('li');
                        var $collapsibleLis = $collapsible.children('li');
                        var isActive = $collapsibleLi[0].classList.contains('active');
                        var index = $collapsibleLis.index($collapsibleLi);

                        if (isActive) {
                            this.close(index);
                        } else {
                            this.open(index);
                        }
                    }
                }
            }

            /**
             * Handle Collapsible Keydown
             * @param {Event} e
             */

        }, {
            key: "_handleCollapsibleKeydown",
            value: function _handleCollapsibleKeydown(e) {
                if (e.keyCode === 13) {
                    this._handleCollapsibleClickBound(e);
                }
            }

            /**
             * Animate in collapsible slide
             * @param {Number} index - 0th index of slide
             */

        }, {
            key: "_animateIn",
            value: function _animateIn(index) {
                var _this6 = this;

                var $collapsibleLi = this.$el.children('li').eq(index);
                if ($collapsibleLi.length) {
                    var $body = $collapsibleLi.children('.collapsible-body');

                    anim.remove($body[0]);
                    $body.css({
                        display: 'block',
                        overflow: 'hidden',
                        height: 0,
                        paddingTop: '',
                        paddingBottom: ''
                    });

                    var pTop = $body.css('padding-top');
                    var pBottom = $body.css('padding-bottom');
                    var finalHeight = $body[0].scrollHeight;
                    $body.css({
                        paddingTop: 0,
                        paddingBottom: 0
                    });

                    anim({
                        targets: $body[0],
                        height: finalHeight,
                        paddingTop: pTop,
                        paddingBottom: pBottom,
                        duration: this.options.inDuration,
                        easing: 'easeInOutCubic',
                        complete: function (anim) {
                            $body.css({
                                overflow: '',
                                paddingTop: '',
                                paddingBottom: '',
                                height: ''
                            });

                            // onOpenEnd callback
                            if (typeof _this6.options.onOpenEnd === 'function') {
                                _this6.options.onOpenEnd.call(_this6, $collapsibleLi[0]);
                            }
                        }
                    });
                }
            }

            /**
             * Animate out collapsible slide
             * @param {Number} index - 0th index of slide to open
             */

        }, {
            key: "_animateOut",
            value: function _animateOut(index) {
                var _this7 = this;

                var $collapsibleLi = this.$el.children('li').eq(index);
                if ($collapsibleLi.length) {
                    var $body = $collapsibleLi.children('.collapsible-body');
                    anim.remove($body[0]);
                    $body.css('overflow', 'hidden');
                    anim({
                        targets: $body[0],
                        height: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        duration: this.options.outDuration,
                        easing: 'easeInOutCubic',
                        complete: function () {
                            $body.css({
                                height: '',
                                overflow: '',
                                padding: '',
                                display: ''
                            });

                            // onCloseEnd callback
                            if (typeof _this7.options.onCloseEnd === 'function') {
                                _this7.options.onCloseEnd.call(_this7, $collapsibleLi[0]);
                            }
                        }
                    });
                }
            }

            /**
             * Open Collapsible
             * @param {Number} index - 0th index of slide
             */

        }, {
            key: "open",
            value: function open(index) {
                var _this8 = this;

                var $collapsibleLi = this.$el.children('li').eq(index);
                if ($collapsibleLi.length && !$collapsibleLi[0].classList.contains('active')) {
                    // onOpenStart callback
                    if (typeof this.options.onOpenStart === 'function') {
                        this.options.onOpenStart.call(this, $collapsibleLi[0]);
                    }

                    // Handle accordion behavior
                    if (this.options.accordion) {
                        var $collapsibleLis = this.$el.children('li');
                        var $activeLis = this.$el.children('li.active');
                        $activeLis.each(function (el) {
                            var index = $collapsibleLis.index($(el));
                            _this8.close(index);
                        });
                    }

                    // Animate in
                    $collapsibleLi[0].classList.add('active');
                    this._animateIn(index);
                }
            }

            /**
             * Close Collapsible
             * @param {Number} index - 0th index of slide
             */

        }, {
            key: "close",
            value: function close(index) {
                var $collapsibleLi = this.$el.children('li').eq(index);
                if ($collapsibleLi.length && $collapsibleLi[0].classList.contains('active')) {
                    // onCloseStart callback
                    if (typeof this.options.onCloseStart === 'function') {
                        this.options.onCloseStart.call(this, $collapsibleLi[0]);
                    }

                    // Animate out
                    $collapsibleLi[0].classList.remove('active');
                    this._animateOut(index);
                }
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Collapsible.__proto__ || Object.getPrototypeOf(Collapsible), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Collapsible;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Collapsible;
    }(Component);

    M.Collapsible = Collapsible;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Collapsible, 'collapsible', 'M_Collapsible');
    }
})(cash, M.anime);
; (function ($, anim) {
    'use strict';

    var _defaults = {
        alignment: 'left',
        autoFocus: true,
        constrainWidth: true,
        container: null,
        coverTrigger: true,
        closeOnClick: true,
        hover: false,
        inDuration: 150,
        outDuration: 250,
        onOpenStart: null,
        onOpenEnd: null,
        onCloseStart: null,
        onCloseEnd: null,
        onItemClick: null
    };

    /**
     * @class
     */

    var Dropdown = function (_Component2) {
        _inherits(Dropdown, _Component2);

        function Dropdown(el, options) {
            _classCallCheck(this, Dropdown);

            var _this9 = _possibleConstructorReturn(this, (Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).call(this, Dropdown, el, options));

            _this9.el.M_Dropdown = _this9;
            Dropdown._dropdowns.push(_this9);

            _this9.id = M.getIdFromTrigger(el);
            _this9.dropdownEl = document.getElementById(_this9.id);
            _this9.$dropdownEl = $(_this9.dropdownEl);

            /**
             * Options for the dropdown
             * @member Dropdown#options
             * @prop {String} [alignment='left'] - Edge which the dropdown is aligned to
             * @prop {Boolean} [autoFocus=true] - Automatically focus dropdown el for keyboard
             * @prop {Boolean} [constrainWidth=true] - Constrain width to width of the button
             * @prop {Element} container - Container element to attach dropdown to (optional)
             * @prop {Boolean} [coverTrigger=true] - Place dropdown over trigger
             * @prop {Boolean} [closeOnClick=true] - Close on click of dropdown item
             * @prop {Boolean} [hover=false] - Open dropdown on hover
             * @prop {Number} [inDuration=150] - Duration of open animation in ms
             * @prop {Number} [outDuration=250] - Duration of close animation in ms
             * @prop {Function} onOpenStart - Function called when dropdown starts opening
             * @prop {Function} onOpenEnd - Function called when dropdown finishes opening
             * @prop {Function} onCloseStart - Function called when dropdown starts closing
             * @prop {Function} onCloseEnd - Function called when dropdown finishes closing
             */
            _this9.options = $.extend({}, Dropdown.defaults, options);

            /**
             * Describes open/close state of dropdown
             * @type {Boolean}
             */
            _this9.isOpen = false;

            /**
             * Describes if dropdown content is scrollable
             * @type {Boolean}
             */
            _this9.isScrollable = false;

            /**
             * Describes if touch moving on dropdown content
             * @type {Boolean}
             */
            _this9.isTouchMoving = false;

            _this9.focusedIndex = -1;
            _this9.filterQuery = [];

            // Move dropdown-content after dropdown-trigger
            if (!!_this9.options.container) {
                $(_this9.options.container).append(_this9.dropdownEl);
            } else {
                _this9.$el.after(_this9.dropdownEl);
            }

            _this9._makeDropdownFocusable();
            _this9._resetFilterQueryBound = _this9._resetFilterQuery.bind(_this9);
            _this9._handleDocumentClickBound = _this9._handleDocumentClick.bind(_this9);
            _this9._handleDocumentTouchmoveBound = _this9._handleDocumentTouchmove.bind(_this9);
            _this9._handleDropdownClickBound = _this9._handleDropdownClick.bind(_this9);
            _this9._handleDropdownKeydownBound = _this9._handleDropdownKeydown.bind(_this9);
            _this9._handleTriggerKeydownBound = _this9._handleTriggerKeydown.bind(_this9);
            _this9._setupEventHandlers();
            return _this9;
        }

        _createClass(Dropdown, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._resetDropdownStyles();
                this._removeEventHandlers();
                Dropdown._dropdowns.splice(Dropdown._dropdowns.indexOf(this), 1);
                this.el.M_Dropdown = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                // Trigger keydown handler
                this.el.addEventListener('keydown', this._handleTriggerKeydownBound);

                // Item click handler
                this.dropdownEl.addEventListener('click', this._handleDropdownClickBound);

                // Hover event handlers
                if (this.options.hover) {
                    this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
                    this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
                    this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
                    this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
                    this.dropdownEl.addEventListener('mouseleave', this._handleMouseLeaveBound);

                    // Click event handlers
                } else {
                    this._handleClickBound = this._handleClick.bind(this);
                    this.el.addEventListener('click', this._handleClickBound);
                }
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.el.removeEventListener('keydown', this._handleTriggerKeydownBound);
                this.dropdownEl.removeEventListener('click', this._handleDropdownClickBound);

                if (this.options.hover) {
                    this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
                    this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
                    this.dropdownEl.removeEventListener('mouseleave', this._handleMouseLeaveBound);
                } else {
                    this.el.removeEventListener('click', this._handleClickBound);
                }
            }
        }, {
            key: "_setupTemporaryEventHandlers",
            value: function _setupTemporaryEventHandlers() {
                // Use capture phase event handler to prevent click
                document.body.addEventListener('click', this._handleDocumentClickBound, true);
                document.body.addEventListener('touchend', this._handleDocumentClickBound);
                document.body.addEventListener('touchmove', this._handleDocumentTouchmoveBound);
                this.dropdownEl.addEventListener('keydown', this._handleDropdownKeydownBound);
            }
        }, {
            key: "_removeTemporaryEventHandlers",
            value: function _removeTemporaryEventHandlers() {
                // Use capture phase event handler to prevent click
                document.body.removeEventListener('click', this._handleDocumentClickBound, true);
                document.body.removeEventListener('touchend', this._handleDocumentClickBound);
                document.body.removeEventListener('touchmove', this._handleDocumentTouchmoveBound);
                this.dropdownEl.removeEventListener('keydown', this._handleDropdownKeydownBound);
            }
        }, {
            key: "_handleClick",
            value: function _handleClick(e) {
                e.preventDefault();
                this.open();
            }
        }, {
            key: "_handleMouseEnter",
            value: function _handleMouseEnter() {
                this.open();
            }
        }, {
            key: "_handleMouseLeave",
            value: function _handleMouseLeave(e) {
                var toEl = e.toElement || e.relatedTarget;
                var leaveToDropdownContent = !!$(toEl).closest('.dropdown-content').length;
                var leaveToActiveDropdownTrigger = false;

                var $closestTrigger = $(toEl).closest('.dropdown-trigger');
                if ($closestTrigger.length && !!$closestTrigger[0].M_Dropdown && $closestTrigger[0].M_Dropdown.isOpen) {
                    leaveToActiveDropdownTrigger = true;
                }

                // Close hover dropdown if mouse did not leave to either active dropdown-trigger or dropdown-content
                if (!leaveToActiveDropdownTrigger && !leaveToDropdownContent) {
                    this.close();
                }
            }
        }, {
            key: "_handleDocumentClick",
            value: function _handleDocumentClick(e) {
                var _this10 = this;

                var $target = $(e.target);
                if (this.options.closeOnClick && $target.closest('.dropdown-content').length && !this.isTouchMoving) {
                    // isTouchMoving to check if scrolling on mobile.
                    setTimeout(function () {
                        _this10.close();
                    }, 0);
                } else if ($target.closest('.dropdown-trigger').length || !$target.closest('.dropdown-content').length) {
                    setTimeout(function () {
                        _this10.close();
                    }, 0);
                }
                this.isTouchMoving = false;
            }
        }, {
            key: "_handleTriggerKeydown",
            value: function _handleTriggerKeydown(e) {
                // ARROW DOWN OR ENTER WHEN SELECT IS CLOSED - open Dropdown
                if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ENTER) && !this.isOpen) {
                    e.preventDefault();
                    this.open();
                }
            }

            /**
             * Handle Document Touchmove
             * @param {Event} e
             */

        }, {
            key: "_handleDocumentTouchmove",
            value: function _handleDocumentTouchmove(e) {
                var $target = $(e.target);
                if ($target.closest('.dropdown-content').length) {
                    this.isTouchMoving = true;
                }
            }

            /**
             * Handle Dropdown Click
             * @param {Event} e
             */

        }, {
            key: "_handleDropdownClick",
            value: function _handleDropdownClick(e) {
                // onItemClick callback
                if (typeof this.options.onItemClick === 'function') {
                    var itemEl = $(e.target).closest('li')[0];
                    this.options.onItemClick.call(this, itemEl);
                }
            }

            /**
             * Handle Dropdown Keydown
             * @param {Event} e
             */

        }, {
            key: "_handleDropdownKeydown",
            value: function _handleDropdownKeydown(e) {
                if (e.which === M.keys.TAB) {
                    e.preventDefault();
                    this.close();

                    // Navigate down dropdown list
                } else if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) && this.isOpen) {
                    e.preventDefault();
                    var direction = e.which === M.keys.ARROW_DOWN ? 1 : -1;
                    var newFocusedIndex = this.focusedIndex;
                    var foundNewIndex = false;
                    do {
                        newFocusedIndex = newFocusedIndex + direction;

                        if (!!this.dropdownEl.children[newFocusedIndex] && this.dropdownEl.children[newFocusedIndex].tabIndex !== -1) {
                            foundNewIndex = true;
                            break;
                        }
                    } while (newFocusedIndex < this.dropdownEl.children.length && newFocusedIndex >= 0);

                    if (foundNewIndex) {
                        this.focusedIndex = newFocusedIndex;
                        this._focusFocusedItem();
                    }

                    // ENTER selects choice on focused item
                } else if (e.which === M.keys.ENTER && this.isOpen) {
                    // Search for <a> and <button>
                    var focusedElement = this.dropdownEl.children[this.focusedIndex];
                    var $activatableElement = $(focusedElement).find('a, button').first();

                    // Click a or button tag if exists, otherwise click li tag
                    if (!!$activatableElement.length) {
                        $activatableElement[0].click();
                    } else if (!!focusedElement) {
                        focusedElement.click();
                    }

                    // Close dropdown on ESC
                } else if (e.which === M.keys.ESC && this.isOpen) {
                    e.preventDefault();
                    this.close();
                }

                // CASE WHEN USER TYPE LETTERS
                var letter = String.fromCharCode(e.which).toLowerCase(),
                    nonLetters = [9, 13, 27, 38, 40];
                if (letter && nonLetters.indexOf(e.which) === -1) {
                    this.filterQuery.push(letter);

                    var string = this.filterQuery.join(''),
                        newOptionEl = $(this.dropdownEl).find('li').filter(function (el) {
                            return $(el).text().toLowerCase().indexOf(string) === 0;
                        })[0];

                    if (newOptionEl) {
                        this.focusedIndex = $(newOptionEl).index();
                        this._focusFocusedItem();
                    }
                }

                this.filterTimeout = setTimeout(this._resetFilterQueryBound, 1000);
            }

            /**
             * Setup dropdown
             */

        }, {
            key: "_resetFilterQuery",
            value: function _resetFilterQuery() {
                this.filterQuery = [];
            }
        }, {
            key: "_resetDropdownStyles",
            value: function _resetDropdownStyles() {
                this.$dropdownEl.css({
                    display: '',
                    width: '',
                    height: '',
                    left: '',
                    top: '',
                    'transform-origin': '',
                    transform: '',
                    opacity: ''
                });
            }
        }, {
            key: "_makeDropdownFocusable",
            value: function _makeDropdownFocusable() {
                // Needed for arrow key navigation
                this.dropdownEl.tabIndex = 0;

                // Only set tabindex if it hasn't been set by user
                $(this.dropdownEl).children().each(function (el) {
                    if (!el.getAttribute('tabindex')) {
                        el.setAttribute('tabindex', 0);
                    }
                });
            }
        }, {
            key: "_focusFocusedItem",
            value: function _focusFocusedItem() {
                if (this.focusedIndex >= 0 && this.focusedIndex < this.dropdownEl.children.length && this.options.autoFocus) {
                    this.dropdownEl.children[this.focusedIndex].focus();
                }
            }
        }, {
            key: "_getDropdownPosition",
            value: function _getDropdownPosition() {
                var offsetParentBRect = this.el.offsetParent.getBoundingClientRect();
                var triggerBRect = this.el.getBoundingClientRect();
                var dropdownBRect = this.dropdownEl.getBoundingClientRect();

                var idealHeight = dropdownBRect.height;
                var idealWidth = dropdownBRect.width;
                var idealXPos = triggerBRect.left - dropdownBRect.left;
                var idealYPos = triggerBRect.top - dropdownBRect.top;

                var dropdownBounds = {
                    left: idealXPos,
                    top: idealYPos,
                    height: idealHeight,
                    width: idealWidth
                };

                // Countainer here will be closest ancestor with overflow: hidden
                var closestOverflowParent = !!this.dropdownEl.offsetParent ? this.dropdownEl.offsetParent : this.dropdownEl.parentNode;

                var alignments = M.checkPossibleAlignments(this.el, closestOverflowParent, dropdownBounds, this.options.coverTrigger ? 0 : triggerBRect.height);

                var verticalAlignment = 'top';
                var horizontalAlignment = this.options.alignment;
                idealYPos += this.options.coverTrigger ? 0 : triggerBRect.height;

                // Reset isScrollable
                this.isScrollable = false;

                if (!alignments.top) {
                    if (alignments.bottom) {
                        verticalAlignment = 'bottom';
                    } else {
                        this.isScrollable = true;

                        // Determine which side has most space and cutoff at correct height
                        if (alignments.spaceOnTop > alignments.spaceOnBottom) {
                            verticalAlignment = 'bottom';
                            idealHeight += alignments.spaceOnTop;
                            idealYPos -= alignments.spaceOnTop;
                        } else {
                            idealHeight += alignments.spaceOnBottom;
                        }
                    }
                }

                // If preferred horizontal alignment is possible
                if (!alignments[horizontalAlignment]) {
                    var oppositeAlignment = horizontalAlignment === 'left' ? 'right' : 'left';
                    if (alignments[oppositeAlignment]) {
                        horizontalAlignment = oppositeAlignment;
                    } else {
                        // Determine which side has most space and cutoff at correct height
                        if (alignments.spaceOnLeft > alignments.spaceOnRight) {
                            horizontalAlignment = 'right';
                            idealWidth += alignments.spaceOnLeft;
                            idealXPos -= alignments.spaceOnLeft;
                        } else {
                            horizontalAlignment = 'left';
                            idealWidth += alignments.spaceOnRight;
                        }
                    }
                }

                if (verticalAlignment === 'bottom') {
                    idealYPos = idealYPos - dropdownBRect.height + (this.options.coverTrigger ? triggerBRect.height : 0);
                }
                if (horizontalAlignment === 'right') {
                    idealXPos = idealXPos - dropdownBRect.width + triggerBRect.width;
                }
                return {
                    x: idealXPos,
                    y: idealYPos,
                    verticalAlignment: verticalAlignment,
                    horizontalAlignment: horizontalAlignment,
                    height: idealHeight,
                    width: idealWidth
                };
            }

            /**
             * Animate in dropdown
             */

        }, {
            key: "_animateIn",
            value: function _animateIn() {
                var _this11 = this;

                anim.remove(this.dropdownEl);
                anim({
                    targets: this.dropdownEl,
                    opacity: {
                        value: [0, 1],
                        easing: 'easeOutQuad'
                    },
                    scaleX: [0.3, 1],
                    scaleY: [0.3, 1],
                    duration: this.options.inDuration,
                    easing: 'easeOutQuint',
                    complete: function (anim) {
                        if (_this11.options.autoFocus) {
                            _this11.dropdownEl.focus();
                        }

                        // onOpenEnd callback
                        if (typeof _this11.options.onOpenEnd === 'function') {
                            _this11.options.onOpenEnd.call(_this11, _this11.el);
                        }
                    }
                });
            }

            /**
             * Animate out dropdown
             */

        }, {
            key: "_animateOut",
            value: function _animateOut() {
                var _this12 = this;

                anim.remove(this.dropdownEl);
                anim({
                    targets: this.dropdownEl,
                    opacity: {
                        value: 0,
                        easing: 'easeOutQuint'
                    },
                    scaleX: 0.3,
                    scaleY: 0.3,
                    duration: this.options.outDuration,
                    easing: 'easeOutQuint',
                    complete: function (anim) {
                        _this12._resetDropdownStyles();

                        // onCloseEnd callback
                        if (typeof _this12.options.onCloseEnd === 'function') {
                            _this12.options.onCloseEnd.call(_this12, _this12.el);
                        }
                    }
                });
            }

            /**
             * Place dropdown
             */

        }, {
            key: "_placeDropdown",
            value: function _placeDropdown() {
                // Set width before calculating positionInfo
                var idealWidth = this.options.constrainWidth ? this.el.getBoundingClientRect().width : this.dropdownEl.getBoundingClientRect().width;
                this.dropdownEl.style.width = idealWidth + 'px';

                var positionInfo = this._getDropdownPosition();
                this.dropdownEl.style.left = positionInfo.x + 'px';
                this.dropdownEl.style.top = positionInfo.y + 'px';
                this.dropdownEl.style.height = positionInfo.height + 'px';
                this.dropdownEl.style.width = positionInfo.width + 'px';
                this.dropdownEl.style.transformOrigin = (positionInfo.horizontalAlignment === 'left' ? '0' : '100%') + " " + (positionInfo.verticalAlignment === 'top' ? '0' : '100%');
            }

            /**
             * Open Dropdown
             */

        }, {
            key: "open",
            value: function open() {
                if (this.isOpen) {
                    return;
                }
                this.isOpen = true;

                // onOpenStart callback
                if (typeof this.options.onOpenStart === 'function') {
                    this.options.onOpenStart.call(this, this.el);
                }

                // Reset styles
                this._resetDropdownStyles();
                this.dropdownEl.style.display = 'block';

                this._placeDropdown();
                this._animateIn();
                this._setupTemporaryEventHandlers();
            }

            /**
             * Close Dropdown
             */

        }, {
            key: "close",
            value: function close() {
                if (!this.isOpen) {
                    return;
                }
                this.isOpen = false;
                this.focusedIndex = -1;

                // onCloseStart callback
                if (typeof this.options.onCloseStart === 'function') {
                    this.options.onCloseStart.call(this, this.el);
                }

                this._animateOut();
                this._removeTemporaryEventHandlers();

                if (this.options.autoFocus) {
                    this.el.focus();
                }
            }

            /**
             * Recalculate dimensions
             */

        }, {
            key: "recalculateDimensions",
            value: function recalculateDimensions() {
                if (this.isOpen) {
                    this.$dropdownEl.css({
                        width: '',
                        height: '',
                        left: '',
                        top: '',
                        'transform-origin': ''
                    });
                    this._placeDropdown();
                }
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Dropdown.__proto__ || Object.getPrototypeOf(Dropdown), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Dropdown;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Dropdown;
    }(Component);

    /**
     * @static
     * @memberof Dropdown
     */


    Dropdown._dropdowns = [];

    M.Dropdown = Dropdown;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Dropdown, 'dropdown', 'M_Dropdown');
    }
})(cash, M.anime);
; (function ($, anim) {
    'use strict';

    var _defaults = {
        opacity: 0.5,
        inDuration: 250,
        outDuration: 250,
        onOpenStart: null,
        onOpenEnd: null,
        onCloseStart: null,
        onCloseEnd: null,
        preventScrolling: true,
        dismissible: true,
        startingTop: '4%',
        endingTop: '10%'
    };

    /**
     * @class
     *
     */

    var Modal = function (_Component3) {
        _inherits(Modal, _Component3);

        /**
         * Construct Modal instance and set up overlay
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Modal(el, options) {
            _classCallCheck(this, Modal);

            var _this13 = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this, Modal, el, options));

            _this13.el.M_Modal = _this13;

            /**
             * Options for the modal
             * @member Modal#options
             * @prop {Number} [opacity=0.5] - Opacity of the modal overlay
             * @prop {Number} [inDuration=250] - Length in ms of enter transition
             * @prop {Number} [outDuration=250] - Length in ms of exit transition
             * @prop {Function} onOpenStart - Callback function called before modal is opened
             * @prop {Function} onOpenEnd - Callback function called after modal is opened
             * @prop {Function} onCloseStart - Callback function called before modal is closed
             * @prop {Function} onCloseEnd - Callback function called after modal is closed
             * @prop {Boolean} [dismissible=true] - Allow modal to be dismissed by keyboard or overlay click
             * @prop {String} [startingTop='4%'] - startingTop
             * @prop {String} [endingTop='10%'] - endingTop
             */
            _this13.options = $.extend({}, Modal.defaults, options);

            /**
             * Describes open/close state of modal
             * @type {Boolean}
             */
            _this13.isOpen = false;

            _this13.id = _this13.$el.attr('id');
            _this13._openingTrigger = undefined;
            _this13.$overlay = $('<div class="modal-overlay"></div>');
            _this13.el.tabIndex = 0;
            _this13._nthModalOpened = 0;

            Modal._count++;
            _this13._setupEventHandlers();
            return _this13;
        }

        _createClass(Modal, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                Modal._count--;
                this._removeEventHandlers();
                this.el.removeAttribute('style');
                this.$overlay.remove();
                this.el.M_Modal = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleOverlayClickBound = this._handleOverlayClick.bind(this);
                this._handleModalCloseClickBound = this._handleModalCloseClick.bind(this);

                if (Modal._count === 1) {
                    document.body.addEventListener('click', this._handleTriggerClick);
                }
                this.$overlay[0].addEventListener('click', this._handleOverlayClickBound);
                this.el.addEventListener('click', this._handleModalCloseClickBound);
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                if (Modal._count === 0) {
                    document.body.removeEventListener('click', this._handleTriggerClick);
                }
                this.$overlay[0].removeEventListener('click', this._handleOverlayClickBound);
                this.el.removeEventListener('click', this._handleModalCloseClickBound);
            }

            /**
             * Handle Trigger Click
             * @param {Event} e
             */

        }, {
            key: "_handleTriggerClick",
            value: function _handleTriggerClick(e) {
                var $trigger = $(e.target).closest('.modal-trigger');
                if ($trigger.length) {
                    var modalId = M.getIdFromTrigger($trigger[0]);
                    var modalInstance = document.getElementById(modalId).M_Modal;
                    if (modalInstance) {
                        modalInstance.open($trigger);
                    }
                    e.preventDefault();
                }
            }

            /**
             * Handle Overlay Click
             */

        }, {
            key: "_handleOverlayClick",
            value: function _handleOverlayClick() {
                if (this.options.dismissible) {
                    this.close();
                }
            }

            /**
             * Handle Modal Close Click
             * @param {Event} e
             */

        }, {
            key: "_handleModalCloseClick",
            value: function _handleModalCloseClick(e) {
                var $closeTrigger = $(e.target).closest('.modal-close');
                if ($closeTrigger.length) {
                    this.close();
                }
            }

            /**
             * Handle Keydown
             * @param {Event} e
             */

        }, {
            key: "_handleKeydown",
            value: function _handleKeydown(e) {
                // ESC key
                if (e.keyCode === 27 && this.options.dismissible) {
                    this.close();
                }
            }

            /**
             * Handle Focus
             * @param {Event} e
             */

        }, {
            key: "_handleFocus",
            value: function _handleFocus(e) {
                // Only trap focus if this modal is the last model opened (prevents loops in nested modals).
                if (!this.el.contains(e.target) && this._nthModalOpened === Modal._modalsOpen) {
                    this.el.focus();
                }
            }

            /**
             * Animate in modal
             */

        }, {
            key: "_animateIn",
            value: function _animateIn() {
                var _this14 = this;

                // Set initial styles
                $.extend(this.el.style, {
                    display: 'block',
                    opacity: 0
                });
                $.extend(this.$overlay[0].style, {
                    display: 'block',
                    opacity: 0
                });

                // Animate overlay
                anim({
                    targets: this.$overlay[0],
                    opacity: this.options.opacity,
                    duration: this.options.inDuration,
                    easing: 'easeOutQuad'
                });

                // Define modal animation options
                var enterAnimOptions = {
                    targets: this.el,
                    duration: this.options.inDuration,
                    easing: 'easeOutCubic',
                    // Handle modal onOpenEnd callback
                    complete: function () {
                        if (typeof _this14.options.onOpenEnd === 'function') {
                            _this14.options.onOpenEnd.call(_this14, _this14.el, _this14._openingTrigger);
                        }
                    }
                };

                // Bottom sheet animation
                if (this.el.classList.contains('bottom-sheet')) {
                    $.extend(enterAnimOptions, {
                        bottom: 0,
                        opacity: 1
                    });
                    anim(enterAnimOptions);

                    // Normal modal animation
                } else {
                    $.extend(enterAnimOptions, {
                        top: [this.options.startingTop, this.options.endingTop],
                        opacity: 1,
                        scaleX: [0.8, 1],
                        scaleY: [0.8, 1]
                    });
                    anim(enterAnimOptions);
                }
            }

            /**
             * Animate out modal
             */

        }, {
            key: "_animateOut",
            value: function _animateOut() {
                var _this15 = this;

                // Animate overlay
                anim({
                    targets: this.$overlay[0],
                    opacity: 0,
                    duration: this.options.outDuration,
                    easing: 'easeOutQuart'
                });

                // Define modal animation options
                var exitAnimOptions = {
                    targets: this.el,
                    duration: this.options.outDuration,
                    easing: 'easeOutCubic',
                    // Handle modal ready callback
                    complete: function () {
                        _this15.el.style.display = 'none';
                        _this15.$overlay.remove();

                        // Call onCloseEnd callback
                        if (typeof _this15.options.onCloseEnd === 'function') {
                            _this15.options.onCloseEnd.call(_this15, _this15.el);
                        }
                    }
                };

                // Bottom sheet animation
                if (this.el.classList.contains('bottom-sheet')) {
                    $.extend(exitAnimOptions, {
                        bottom: '-100%',
                        opacity: 0
                    });
                    anim(exitAnimOptions);

                    // Normal modal animation
                } else {
                    $.extend(exitAnimOptions, {
                        top: [this.options.endingTop, this.options.startingTop],
                        opacity: 0,
                        scaleX: 0.8,
                        scaleY: 0.8
                    });
                    anim(exitAnimOptions);
                }
            }

            /**
             * Open Modal
             * @param {cash} [$trigger]
             */

        }, {
            key: "open",
            value: function open($trigger) {
                if (this.isOpen) {
                    return;
                }

                this.isOpen = true;
                Modal._modalsOpen++;
                this._nthModalOpened = Modal._modalsOpen;

                // Set Z-Index based on number of currently open modals
                this.$overlay[0].style.zIndex = 1000 + Modal._modalsOpen * 2;
                this.el.style.zIndex = 1000 + Modal._modalsOpen * 2 + 1;

                // Set opening trigger, undefined indicates modal was opened by javascript
                this._openingTrigger = !!$trigger ? $trigger[0] : undefined;

                // onOpenStart callback
                if (typeof this.options.onOpenStart === 'function') {
                    this.options.onOpenStart.call(this, this.el, this._openingTrigger);
                }

                if (this.options.preventScrolling) {
                    document.body.style.overflow = 'hidden';
                }

                this.el.classList.add('open');
                this.el.insertAdjacentElement('afterend', this.$overlay[0]);

                if (this.options.dismissible) {
                    this._handleKeydownBound = this._handleKeydown.bind(this);
                    this._handleFocusBound = this._handleFocus.bind(this);
                    document.addEventListener('keydown', this._handleKeydownBound);
                    document.addEventListener('focus', this._handleFocusBound, true);
                }

                anim.remove(this.el);
                anim.remove(this.$overlay[0]);
                this._animateIn();

                // Focus modal
                this.el.focus();

                return this;
            }

            /**
             * Close Modal
             */

        }, {
            key: "close",
            value: function close() {
                if (!this.isOpen) {
                    return;
                }

                this.isOpen = false;
                Modal._modalsOpen--;
                this._nthModalOpened = 0;

                // Call onCloseStart callback
                if (typeof this.options.onCloseStart === 'function') {
                    this.options.onCloseStart.call(this, this.el);
                }

                this.el.classList.remove('open');

                // Enable body scrolling only if there are no more modals open.
                if (Modal._modalsOpen === 0) {
                    document.body.style.overflow = '';
                }

                if (this.options.dismissible) {
                    document.removeEventListener('keydown', this._handleKeydownBound);
                    document.removeEventListener('focus', this._handleFocusBound, true);
                }

                anim.remove(this.el);
                anim.remove(this.$overlay[0]);
                this._animateOut();
                return this;
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Modal.__proto__ || Object.getPrototypeOf(Modal), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Modal;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Modal;
    }(Component);

    /**
     * @static
     * @memberof Modal
     */


    Modal._modalsOpen = 0;

    /**
     * @static
     * @memberof Modal
     */
    Modal._count = 0;

    M.Modal = Modal;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Modal, 'modal', 'M_Modal');
    }
})(cash, M.anime);
; (function ($, anim) {
    'use strict';

    var _defaults = {
        inDuration: 275,
        outDuration: 200,
        onOpenStart: null,
        onOpenEnd: null,
        onCloseStart: null,
        onCloseEnd: null
    };

    /**
     * @class
     *
     */

    var Materialbox = function (_Component4) {
        _inherits(Materialbox, _Component4);

        /**
         * Construct Materialbox instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Materialbox(el, options) {
            _classCallCheck(this, Materialbox);

            var _this16 = _possibleConstructorReturn(this, (Materialbox.__proto__ || Object.getPrototypeOf(Materialbox)).call(this, Materialbox, el, options));

            _this16.el.M_Materialbox = _this16;

            /**
             * Options for the modal
             * @member Materialbox#options
             * @prop {Number} [inDuration=275] - Length in ms of enter transition
             * @prop {Number} [outDuration=200] - Length in ms of exit transition
             * @prop {Function} onOpenStart - Callback function called before materialbox is opened
             * @prop {Function} onOpenEnd - Callback function called after materialbox is opened
             * @prop {Function} onCloseStart - Callback function called before materialbox is closed
             * @prop {Function} onCloseEnd - Callback function called after materialbox is closed
             */
            _this16.options = $.extend({}, Materialbox.defaults, options);

            _this16.overlayActive = false;
            _this16.doneAnimating = true;
            _this16.placeholder = $('<div></div>').addClass('material-placeholder');
            _this16.originalWidth = 0;
            _this16.originalHeight = 0;
            _this16.originInlineStyles = _this16.$el.attr('style');
            _this16.caption = _this16.el.getAttribute('data-caption') || '';

            // Wrap
            _this16.$el.before(_this16.placeholder);
            _this16.placeholder.append(_this16.$el);

            _this16._setupEventHandlers();
            return _this16;
        }

        _createClass(Materialbox, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this.el.M_Materialbox = undefined;

                // Unwrap image
                $(this.placeholder).after(this.el).remove();

                this.$el.removeAttr('style');
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleMaterialboxClickBound = this._handleMaterialboxClick.bind(this);
                this.el.addEventListener('click', this._handleMaterialboxClickBound);
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.el.removeEventListener('click', this._handleMaterialboxClickBound);
            }

            /**
             * Handle Materialbox Click
             * @param {Event} e
             */

        }, {
            key: "_handleMaterialboxClick",
            value: function _handleMaterialboxClick(e) {
                // If already modal, return to original
                if (this.doneAnimating === false || this.overlayActive && this.doneAnimating) {
                    this.close();
                } else {
                    this.open();
                }
            }

            /**
             * Handle Window Scroll
             */

        }, {
            key: "_handleWindowScroll",
            value: function _handleWindowScroll() {
                if (this.overlayActive) {
                    this.close();
                }
            }

            /**
             * Handle Window Resize
             */

        }, {
            key: "_handleWindowResize",
            value: function _handleWindowResize() {
                if (this.overlayActive) {
                    this.close();
                }
            }

            /**
             * Handle Window Resize
             * @param {Event} e
             */

        }, {
            key: "_handleWindowEscape",
            value: function _handleWindowEscape(e) {
                // ESC key
                if (e.keyCode === 27 && this.doneAnimating && this.overlayActive) {
                    this.close();
                }
            }

            /**
             * Find ancestors with overflow: hidden; and make visible
             */

        }, {
            key: "_makeAncestorsOverflowVisible",
            value: function _makeAncestorsOverflowVisible() {
                this.ancestorsChanged = $();
                var ancestor = this.placeholder[0].parentNode;
                while (ancestor !== null && !$(ancestor).is(document)) {
                    var curr = $(ancestor);
                    if (curr.css('overflow') !== 'visible') {
                        curr.css('overflow', 'visible');
                        if (this.ancestorsChanged === undefined) {
                            this.ancestorsChanged = curr;
                        } else {
                            this.ancestorsChanged = this.ancestorsChanged.add(curr);
                        }
                    }
                    ancestor = ancestor.parentNode;
                }
            }

            /**
             * Animate image in
             */

        }, {
            key: "_animateImageIn",
            value: function _animateImageIn() {
                var _this17 = this;

                var animOptions = {
                    targets: this.el,
                    height: [this.originalHeight, this.newHeight],
                    width: [this.originalWidth, this.newWidth],
                    left: M.getDocumentScrollLeft() + this.windowWidth / 2 - this.placeholder.offset().left - this.newWidth / 2,
                    top: M.getDocumentScrollTop() + this.windowHeight / 2 - this.placeholder.offset().top - this.newHeight / 2,
                    duration: this.options.inDuration,
                    easing: 'easeOutQuad',
                    complete: function () {
                        _this17.doneAnimating = true;

                        // onOpenEnd callback
                        if (typeof _this17.options.onOpenEnd === 'function') {
                            _this17.options.onOpenEnd.call(_this17, _this17.el);
                        }
                    }
                };

                // Override max-width or max-height if needed
                this.maxWidth = this.$el.css('max-width');
                this.maxHeight = this.$el.css('max-height');
                if (this.maxWidth !== 'none') {
                    animOptions.maxWidth = this.newWidth;
                }
                if (this.maxHeight !== 'none') {
                    animOptions.maxHeight = this.newHeight;
                }

                anim(animOptions);
            }

            /**
             * Animate image out
             */

        }, {
            key: "_animateImageOut",
            value: function _animateImageOut() {
                var _this18 = this;

                var animOptions = {
                    targets: this.el,
                    width: this.originalWidth,
                    height: this.originalHeight,
                    left: 0,
                    top: 0,
                    duration: this.options.outDuration,
                    easing: 'easeOutQuad',
                    complete: function () {
                        _this18.placeholder.css({
                            height: '',
                            width: '',
                            position: '',
                            top: '',
                            left: ''
                        });

                        // Revert to width or height attribute
                        if (_this18.attrWidth) {
                            _this18.$el.attr('width', _this18.attrWidth);
                        }
                        if (_this18.attrHeight) {
                            _this18.$el.attr('height', _this18.attrHeight);
                        }

                        _this18.$el.removeAttr('style');
                        _this18.originInlineStyles && _this18.$el.attr('style', _this18.originInlineStyles);

                        // Remove class
                        _this18.$el.removeClass('active');
                        _this18.doneAnimating = true;

                        // Remove overflow overrides on ancestors
                        if (_this18.ancestorsChanged.length) {
                            _this18.ancestorsChanged.css('overflow', '');
                        }

                        // onCloseEnd callback
                        if (typeof _this18.options.onCloseEnd === 'function') {
                            _this18.options.onCloseEnd.call(_this18, _this18.el);
                        }
                    }
                };

                anim(animOptions);
            }

            /**
             * Update open and close vars
             */

        }, {
            key: "_updateVars",
            value: function _updateVars() {
                this.windowWidth = window.innerWidth;
                this.windowHeight = window.innerHeight;
                this.caption = this.el.getAttribute('data-caption') || '';
            }

            /**
             * Open Materialbox
             */

        }, {
            key: "open",
            value: function open() {
                var _this19 = this;

                this._updateVars();
                this.originalWidth = this.el.getBoundingClientRect().width;
                this.originalHeight = this.el.getBoundingClientRect().height;

                // Set states
                this.doneAnimating = false;
                this.$el.addClass('active');
                this.overlayActive = true;

                // onOpenStart callback
                if (typeof this.options.onOpenStart === 'function') {
                    this.options.onOpenStart.call(this, this.el);
                }

                // Set positioning for placeholder
                this.placeholder.css({
                    width: this.placeholder[0].getBoundingClientRect().width + 'px',
                    height: this.placeholder[0].getBoundingClientRect().height + 'px',
                    position: 'relative',
                    top: 0,
                    left: 0
                });

                this._makeAncestorsOverflowVisible();

                // Set css on origin
                this.$el.css({
                    position: 'absolute',
                    'z-index': 1000,
                    'will-change': 'left, top, width, height'
                });

                // Change from width or height attribute to css
                this.attrWidth = this.$el.attr('width');
                this.attrHeight = this.$el.attr('height');
                if (this.attrWidth) {
                    this.$el.css('width', this.attrWidth + 'px');
                    this.$el.removeAttr('width');
                }
                if (this.attrHeight) {
                    this.$el.css('width', this.attrHeight + 'px');
                    this.$el.removeAttr('height');
                }

                // Add overlay
                this.$overlay = $('<div id="materialbox-overlay"></div>').css({
                    opacity: 0
                }).one('click', function () {
                    if (_this19.doneAnimating) {
                        _this19.close();
                    }
                });

                // Put before in origin image to preserve z-index layering.
                this.$el.before(this.$overlay);

                // Set dimensions if needed
                var overlayOffset = this.$overlay[0].getBoundingClientRect();
                this.$overlay.css({
                    width: this.windowWidth + 'px',
                    height: this.windowHeight + 'px',
                    left: -1 * overlayOffset.left + 'px',
                    top: -1 * overlayOffset.top + 'px'
                });

                anim.remove(this.el);
                anim.remove(this.$overlay[0]);

                // Animate Overlay
                anim({
                    targets: this.$overlay[0],
                    opacity: 1,
                    duration: this.options.inDuration,
                    easing: 'easeOutQuad'
                });

                // Add and animate caption if it exists
                if (this.caption !== '') {
                    if (this.$photocaption) {
                        anim.remove(this.$photoCaption[0]);
                    }
                    this.$photoCaption = $('<div class="materialbox-caption"></div>');
                    this.$photoCaption.text(this.caption);
                    $('body').append(this.$photoCaption);
                    this.$photoCaption.css({ display: 'inline' });

                    anim({
                        targets: this.$photoCaption[0],
                        opacity: 1,
                        duration: this.options.inDuration,
                        easing: 'easeOutQuad'
                    });
                }

                // Resize Image
                var ratio = 0;
                var widthPercent = this.originalWidth / this.windowWidth;
                var heightPercent = this.originalHeight / this.windowHeight;
                this.newWidth = 0;
                this.newHeight = 0;

                if (widthPercent > heightPercent) {
                    ratio = this.originalHeight / this.originalWidth;
                    this.newWidth = this.windowWidth * 0.9;
                    this.newHeight = this.windowWidth * 0.9 * ratio;
                } else {
                    ratio = this.originalWidth / this.originalHeight;
                    this.newWidth = this.windowHeight * 0.9 * ratio;
                    this.newHeight = this.windowHeight * 0.9;
                }

                this._animateImageIn();

                // Handle Exit triggers
                this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
                this._handleWindowResizeBound = this._handleWindowResize.bind(this);
                this._handleWindowEscapeBound = this._handleWindowEscape.bind(this);

                window.addEventListener('scroll', this._handleWindowScrollBound);
                window.addEventListener('resize', this._handleWindowResizeBound);
                window.addEventListener('keyup', this._handleWindowEscapeBound);
            }

            /**
             * Close Materialbox
             */

        }, {
            key: "close",
            value: function close() {
                var _this20 = this;

                this._updateVars();
                this.doneAnimating = false;

                // onCloseStart callback
                if (typeof this.options.onCloseStart === 'function') {
                    this.options.onCloseStart.call(this, this.el);
                }

                anim.remove(this.el);
                anim.remove(this.$overlay[0]);

                if (this.caption !== '') {
                    anim.remove(this.$photoCaption[0]);
                }

                // disable exit handlers
                window.removeEventListener('scroll', this._handleWindowScrollBound);
                window.removeEventListener('resize', this._handleWindowResizeBound);
                window.removeEventListener('keyup', this._handleWindowEscapeBound);

                anim({
                    targets: this.$overlay[0],
                    opacity: 0,
                    duration: this.options.outDuration,
                    easing: 'easeOutQuad',
                    complete: function () {
                        _this20.overlayActive = false;
                        _this20.$overlay.remove();
                    }
                });

                this._animateImageOut();

                // Remove Caption + reset css settings on image
                if (this.caption !== '') {
                    anim({
                        targets: this.$photoCaption[0],
                        opacity: 0,
                        duration: this.options.outDuration,
                        easing: 'easeOutQuad',
                        complete: function () {
                            _this20.$photoCaption.remove();
                        }
                    });
                }
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Materialbox.__proto__ || Object.getPrototypeOf(Materialbox), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Materialbox;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Materialbox;
    }(Component);

    M.Materialbox = Materialbox;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Materialbox, 'materialbox', 'M_Materialbox');
    }
})(cash, M.anime);
; (function ($) {
    'use strict';

    var _defaults = {
        responsiveThreshold: 0 // breakpoint for swipeable
    };

    var Parallax = function (_Component5) {
        _inherits(Parallax, _Component5);

        function Parallax(el, options) {
            _classCallCheck(this, Parallax);

            var _this21 = _possibleConstructorReturn(this, (Parallax.__proto__ || Object.getPrototypeOf(Parallax)).call(this, Parallax, el, options));

            _this21.el.M_Parallax = _this21;

            /**
             * Options for the Parallax
             * @member Parallax#options
             * @prop {Number} responsiveThreshold
             */
            _this21.options = $.extend({}, Parallax.defaults, options);
            _this21._enabled = window.innerWidth > _this21.options.responsiveThreshold;

            _this21.$img = _this21.$el.find('img').first();
            _this21.$img.each(function () {
                var el = this;
                if (el.complete) $(el).trigger('load');
            });

            _this21._updateParallax();
            _this21._setupEventHandlers();
            _this21._setupStyles();

            Parallax._parallaxes.push(_this21);
            return _this21;
        }

        _createClass(Parallax, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                Parallax._parallaxes.splice(Parallax._parallaxes.indexOf(this), 1);
                this.$img[0].style.transform = '';
                this._removeEventHandlers();

                this.$el[0].M_Parallax = undefined;
            }
        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleImageLoadBound = this._handleImageLoad.bind(this);
                this.$img[0].addEventListener('load', this._handleImageLoadBound);

                if (Parallax._parallaxes.length === 0) {
                    Parallax._handleScrollThrottled = M.throttle(Parallax._handleScroll, 5);
                    window.addEventListener('scroll', Parallax._handleScrollThrottled);

                    Parallax._handleWindowResizeThrottled = M.throttle(Parallax._handleWindowResize, 5);
                    window.addEventListener('resize', Parallax._handleWindowResizeThrottled);
                }
            }
        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.$img[0].removeEventListener('load', this._handleImageLoadBound);

                if (Parallax._parallaxes.length === 0) {
                    window.removeEventListener('scroll', Parallax._handleScrollThrottled);
                    window.removeEventListener('resize', Parallax._handleWindowResizeThrottled);
                }
            }
        }, {
            key: "_setupStyles",
            value: function _setupStyles() {
                this.$img[0].style.opacity = 1;
            }
        }, {
            key: "_handleImageLoad",
            value: function _handleImageLoad() {
                this._updateParallax();
            }
        }, {
            key: "_updateParallax",
            value: function _updateParallax() {
                var containerHeight = this.$el.height() > 0 ? this.el.parentNode.offsetHeight : 500;
                var imgHeight = this.$img[0].offsetHeight;
                var parallaxDist = imgHeight - containerHeight;
                var bottom = this.$el.offset().top + containerHeight;
                var top = this.$el.offset().top;
                var scrollTop = M.getDocumentScrollTop();
                var windowHeight = window.innerHeight;
                var windowBottom = scrollTop + windowHeight;
                var percentScrolled = (windowBottom - top) / (containerHeight + windowHeight);
                var parallax = parallaxDist * percentScrolled;

                if (!this._enabled) {
                    this.$img[0].style.transform = '';
                } else if (bottom > scrollTop && top < scrollTop + windowHeight) {
                    this.$img[0].style.transform = "translate3D(-50%, " + parallax + "px, 0)";
                }
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Parallax.__proto__ || Object.getPrototypeOf(Parallax), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Parallax;
            }
        }, {
            key: "_handleScroll",
            value: function _handleScroll() {
                for (var i = 0; i < Parallax._parallaxes.length; i++) {
                    var parallaxInstance = Parallax._parallaxes[i];
                    parallaxInstance._updateParallax.call(parallaxInstance);
                }
            }
        }, {
            key: "_handleWindowResize",
            value: function _handleWindowResize() {
                for (var i = 0; i < Parallax._parallaxes.length; i++) {
                    var parallaxInstance = Parallax._parallaxes[i];
                    parallaxInstance._enabled = window.innerWidth > parallaxInstance.options.responsiveThreshold;
                }
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Parallax;
    }(Component);

    /**
     * @static
     * @memberof Parallax
     */


    Parallax._parallaxes = [];

    M.Parallax = Parallax;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Parallax, 'parallax', 'M_Parallax');
    }
})(cash);
; (function ($, anim) {
    'use strict';

    var _defaults = {
        duration: 300,
        onShow: null,
        swipeable: false,
        responsiveThreshold: Infinity // breakpoint for swipeable
    };

    /**
     * @class
     *
     */

    var Tabs = function (_Component6) {
        _inherits(Tabs, _Component6);

        /**
         * Construct Tabs instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Tabs(el, options) {
            _classCallCheck(this, Tabs);

            var _this22 = _possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call(this, Tabs, el, options));

            _this22.el.M_Tabs = _this22;

            /**
             * Options for the Tabs
             * @member Tabs#options
             * @prop {Number} duration
             * @prop {Function} onShow
             * @prop {Boolean} swipeable
             * @prop {Number} responsiveThreshold
             */
            _this22.options = $.extend({}, Tabs.defaults, options);

            // Setup
            _this22.$tabLinks = _this22.$el.children('li.tab').children('a');
            _this22.index = 0;
            _this22._setupActiveTabLink();

            // Setup tabs content
            if (_this22.options.swipeable) {
                _this22._setupSwipeableTabs();
            } else {
                _this22._setupNormalTabs();
            }

            // Setup tabs indicator after content to ensure accurate widths
            _this22._setTabsAndTabWidth();
            _this22._createIndicator();

            _this22._setupEventHandlers();
            return _this22;
        }

        _createClass(Tabs, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this._indicator.parentNode.removeChild(this._indicator);

                if (this.options.swipeable) {
                    this._teardownSwipeableTabs();
                } else {
                    this._teardownNormalTabs();
                }

                this.$el[0].M_Tabs = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleWindowResizeBound = this._handleWindowResize.bind(this);
                window.addEventListener('resize', this._handleWindowResizeBound);

                this._handleTabClickBound = this._handleTabClick.bind(this);
                this.el.addEventListener('click', this._handleTabClickBound);
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                window.removeEventListener('resize', this._handleWindowResizeBound);
                this.el.removeEventListener('click', this._handleTabClickBound);
            }

            /**
             * Handle window Resize
             */

        }, {
            key: "_handleWindowResize",
            value: function _handleWindowResize() {
                this._setTabsAndTabWidth();

                if (this.tabWidth !== 0 && this.tabsWidth !== 0) {
                    this._indicator.style.left = this._calcLeftPos(this.$activeTabLink) + 'px';
                    this._indicator.style.right = this._calcRightPos(this.$activeTabLink) + 'px';
                }
            }

            /**
             * Handle tab click
             * @param {Event} e
             */

        }, {
            key: "_handleTabClick",
            value: function _handleTabClick(e) {
                var _this23 = this;

                var tab = $(e.target).closest('li.tab');
                var tabLink = $(e.target).closest('a');

                // Handle click on tab link only
                if (!tabLink.length || !tabLink.parent().hasClass('tab')) {
                    return;
                }

                if (tab.hasClass('disabled')) {
                    e.preventDefault();
                    return;
                }

                // Act as regular link if target attribute is specified.
                if (!!tabLink.attr('target')) {
                    return;
                }

                // Make the old tab inactive.
                this.$activeTabLink.removeClass('active');
                var $oldContent = this.$content;

                // Update the variables with the new link and content
                this.$activeTabLink = tabLink;
                this.$content = $(M.escapeHash(tabLink[0].hash));
                this.$tabLinks = this.$el.children('li.tab').children('a');

                // Make the tab active.
                this.$activeTabLink.addClass('active');
                var prevIndex = this.index;
                this.index = Math.max(this.$tabLinks.index(tabLink), 0);

                // Swap content
                if (this.options.swipeable) {
                    if (this._tabsCarousel) {
                        this._tabsCarousel.set(this.index, function () {
                            if (typeof _this23.options.onShow === 'function') {
                                _this23.options.onShow.call(_this23, _this23.$content[0]);
                            }
                        });
                    }
                } else {
                    if (this.$content.length) {
                        this.$content[0].style.display = 'block';
                        this.$content.addClass('active');
                        if (typeof this.options.onShow === 'function') {
                            this.options.onShow.call(this, this.$content[0]);
                        }

                        if ($oldContent.length && !$oldContent.is(this.$content)) {
                            $oldContent[0].style.display = 'none';
                            $oldContent.removeClass('active');
                        }
                    }
                }

                // Update widths after content is swapped (scrollbar bugfix)
                this._setTabsAndTabWidth();

                // Update indicator
                this._animateIndicator(prevIndex);

                // Prevent the anchor's default click action
                e.preventDefault();
            }

            /**
             * Generate elements for tab indicator.
             */

        }, {
            key: "_createIndicator",
            value: function _createIndicator() {
                var _this24 = this;

                var indicator = document.createElement('li');
                indicator.classList.add('indicator');

                this.el.appendChild(indicator);
                this._indicator = indicator;

                setTimeout(function () {
                    _this24._indicator.style.left = _this24._calcLeftPos(_this24.$activeTabLink) + 'px';
                    _this24._indicator.style.right = _this24._calcRightPos(_this24.$activeTabLink) + 'px';
                }, 0);
            }

            /**
             * Setup first active tab link.
             */

        }, {
            key: "_setupActiveTabLink",
            value: function _setupActiveTabLink() {
                // If the location.hash matches one of the links, use that as the active tab.
                this.$activeTabLink = $(this.$tabLinks.filter('[href="' + location.hash + '"]'));

                // If no match is found, use the first link or any with class 'active' as the initial active tab.
                if (this.$activeTabLink.length === 0) {
                    this.$activeTabLink = this.$el.children('li.tab').children('a.active').first();
                }
                if (this.$activeTabLink.length === 0) {
                    this.$activeTabLink = this.$el.children('li.tab').children('a').first();
                }

                this.$tabLinks.removeClass('active');
                this.$activeTabLink[0].classList.add('active');

                this.index = Math.max(this.$tabLinks.index(this.$activeTabLink), 0);

                if (this.$activeTabLink.length) {
                    this.$content = $(M.escapeHash(this.$activeTabLink[0].hash));
                    this.$content.addClass('active');
                }
            }

            /**
             * Setup swipeable tabs
             */

        }, {
            key: "_setupSwipeableTabs",
            value: function _setupSwipeableTabs() {
                var _this25 = this;

                // Change swipeable according to responsive threshold
                if (window.innerWidth > this.options.responsiveThreshold) {
                    this.options.swipeable = false;
                }

                var $tabsContent = $();
                this.$tabLinks.each(function (link) {
                    var $currContent = $(M.escapeHash(link.hash));
                    $currContent.addClass('carousel-item');
                    $tabsContent = $tabsContent.add($currContent);
                });

                var $tabsWrapper = $('<div class="tabs-content carousel carousel-slider"></div>');
                $tabsContent.first().before($tabsWrapper);
                $tabsWrapper.append($tabsContent);
                $tabsContent[0].style.display = '';

                // Keep active tab index to set initial carousel slide
                var activeTabIndex = this.$activeTabLink.closest('.tab').index();

                this._tabsCarousel = M.Carousel.init($tabsWrapper[0], {
                    fullWidth: true,
                    noWrap: true,
                    onCycleTo: function (item) {
                        var prevIndex = _this25.index;
                        _this25.index = $(item).index();
                        _this25.$activeTabLink.removeClass('active');
                        _this25.$activeTabLink = _this25.$tabLinks.eq(_this25.index);
                        _this25.$activeTabLink.addClass('active');
                        _this25._animateIndicator(prevIndex);
                        if (typeof _this25.options.onShow === 'function') {
                            _this25.options.onShow.call(_this25, _this25.$content[0]);
                        }
                    }
                });

                // Set initial carousel slide to active tab
                this._tabsCarousel.set(activeTabIndex);
            }

            /**
             * Teardown normal tabs.
             */

        }, {
            key: "_teardownSwipeableTabs",
            value: function _teardownSwipeableTabs() {
                var $tabsWrapper = this._tabsCarousel.$el;
                this._tabsCarousel.destroy();

                // Unwrap
                $tabsWrapper.after($tabsWrapper.children());
                $tabsWrapper.remove();
            }

            /**
             * Setup normal tabs.
             */

        }, {
            key: "_setupNormalTabs",
            value: function _setupNormalTabs() {
                // Hide Tabs Content
                this.$tabLinks.not(this.$activeTabLink).each(function (link) {
                    if (!!link.hash) {
                        var $currContent = $(M.escapeHash(link.hash));
                        if ($currContent.length) {
                            $currContent[0].style.display = 'none';
                        }
                    }
                });
            }

            /**
             * Teardown normal tabs.
             */

        }, {
            key: "_teardownNormalTabs",
            value: function _teardownNormalTabs() {
                // show Tabs Content
                this.$tabLinks.each(function (link) {
                    if (!!link.hash) {
                        var $currContent = $(M.escapeHash(link.hash));
                        if ($currContent.length) {
                            $currContent[0].style.display = '';
                        }
                    }
                });
            }

            /**
             * set tabs and tab width
             */

        }, {
            key: "_setTabsAndTabWidth",
            value: function _setTabsAndTabWidth() {
                this.tabsWidth = this.$el.width();
                this.tabWidth = Math.max(this.tabsWidth, this.el.scrollWidth) / this.$tabLinks.length;
            }

            /**
             * Finds right attribute for indicator based on active tab.
             * @param {cash} el
             */

        }, {
            key: "_calcRightPos",
            value: function _calcRightPos(el) {
                return Math.ceil(this.tabsWidth - el.position().left - el[0].getBoundingClientRect().width);
            }

            /**
             * Finds left attribute for indicator based on active tab.
             * @param {cash} el
             */

        }, {
            key: "_calcLeftPos",
            value: function _calcLeftPos(el) {
                return Math.floor(el.position().left);
            }
        }, {
            key: "updateTabIndicator",
            value: function updateTabIndicator() {
                this._setTabsAndTabWidth();
                this._animateIndicator(this.index);
            }

            /**
             * Animates Indicator to active tab.
             * @param {Number} prevIndex
             */

        }, {
            key: "_animateIndicator",
            value: function _animateIndicator(prevIndex) {
                var leftDelay = 0,
                    rightDelay = 0;

                if (this.index - prevIndex >= 0) {
                    leftDelay = 90;
                } else {
                    rightDelay = 90;
                }

                // Animate
                var animOptions = {
                    targets: this._indicator,
                    left: {
                        value: this._calcLeftPos(this.$activeTabLink),
                        delay: leftDelay
                    },
                    right: {
                        value: this._calcRightPos(this.$activeTabLink),
                        delay: rightDelay
                    },
                    duration: this.options.duration,
                    easing: 'easeOutQuad'
                };
                anim.remove(this._indicator);
                anim(animOptions);
            }

            /**
             * Select tab.
             * @param {String} tabId
             */

        }, {
            key: "select",
            value: function select(tabId) {
                var tab = this.$tabLinks.filter('[href="#' + tabId + '"]');
                if (tab.length) {
                    tab.trigger('click');
                }
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Tabs.__proto__ || Object.getPrototypeOf(Tabs), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Tabs;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Tabs;
    }(Component);

    M.Tabs = Tabs;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Tabs, 'tabs', 'M_Tabs');
    }
})(cash, M.anime);
; (function ($, anim) {
    'use strict';

    var _defaults = {
        exitDelay: 200,
        enterDelay: 0,
        html: null,
        margin: 5,
        inDuration: 250,
        outDuration: 200,
        position: 'bottom',
        transitionMovement: 10
    };

    /**
     * @class
     *
     */

    var Tooltip = function (_Component7) {
        _inherits(Tooltip, _Component7);

        /**
         * Construct Tooltip instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Tooltip(el, options) {
            _classCallCheck(this, Tooltip);

            var _this26 = _possibleConstructorReturn(this, (Tooltip.__proto__ || Object.getPrototypeOf(Tooltip)).call(this, Tooltip, el, options));

            _this26.el.M_Tooltip = _this26;
            _this26.options = $.extend({}, Tooltip.defaults, options);

            _this26.isOpen = false;
            _this26.isHovered = false;
            _this26.isFocused = false;
            _this26._appendTooltipEl();
            _this26._setupEventHandlers();
            return _this26;
        }

        _createClass(Tooltip, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                $(this.tooltipEl).remove();
                this._removeEventHandlers();
                this.el.M_Tooltip = undefined;
            }
        }, {
            key: "_appendTooltipEl",
            value: function _appendTooltipEl() {
                var tooltipEl = document.createElement('div');
                tooltipEl.classList.add('material-tooltip');
                this.tooltipEl = tooltipEl;

                var tooltipContentEl = document.createElement('div');
                tooltipContentEl.classList.add('tooltip-content');
                tooltipContentEl.innerHTML = this.options.html;
                tooltipEl.appendChild(tooltipContentEl);
                document.body.appendChild(tooltipEl);
            }
        }, {
            key: "_updateTooltipContent",
            value: function _updateTooltipContent() {
                this.tooltipEl.querySelector('.tooltip-content').innerHTML = this.options.html;
            }
        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
                this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
                this._handleFocusBound = this._handleFocus.bind(this);
                this._handleBlurBound = this._handleBlur.bind(this);
                this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
                this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
                this.el.addEventListener('focus', this._handleFocusBound, true);
                this.el.addEventListener('blur', this._handleBlurBound, true);
            }
        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
                this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
                this.el.removeEventListener('focus', this._handleFocusBound, true);
                this.el.removeEventListener('blur', this._handleBlurBound, true);
            }
        }, {
            key: "open",
            value: function open(isManual) {
                if (this.isOpen) {
                    return;
                }
                isManual = isManual === undefined ? true : undefined; // Default value true
                this.isOpen = true;
                // Update tooltip content with HTML attribute options
                this.options = $.extend({}, this.options, this._getAttributeOptions());
                this._updateTooltipContent();
                this._setEnterDelayTimeout(isManual);
            }
        }, {
            key: "close",
            value: function close() {
                if (!this.isOpen) {
                    return;
                }

                this.isHovered = false;
                this.isFocused = false;
                this.isOpen = false;
                this._setExitDelayTimeout();
            }

            /**
             * Create timeout which delays when the tooltip closes
             */

        }, {
            key: "_setExitDelayTimeout",
            value: function _setExitDelayTimeout() {
                var _this27 = this;

                clearTimeout(this._exitDelayTimeout);

                this._exitDelayTimeout = setTimeout(function () {
                    if (_this27.isHovered || _this27.isFocused) {
                        return;
                    }

                    _this27._animateOut();
                }, this.options.exitDelay);
            }

            /**
             * Create timeout which delays when the toast closes
             */

        }, {
            key: "_setEnterDelayTimeout",
            value: function _setEnterDelayTimeout(isManual) {
                var _this28 = this;

                clearTimeout(this._enterDelayTimeout);

                this._enterDelayTimeout = setTimeout(function () {
                    if (!_this28.isHovered && !_this28.isFocused && !isManual) {
                        return;
                    }

                    _this28._animateIn();
                }, this.options.enterDelay);
            }
        }, {
            key: "_positionTooltip",
            value: function _positionTooltip() {
                var origin = this.el,
                    tooltip = this.tooltipEl,
                    originHeight = origin.offsetHeight,
                    originWidth = origin.offsetWidth,
                    tooltipHeight = tooltip.offsetHeight,
                    tooltipWidth = tooltip.offsetWidth,
                    newCoordinates = void 0,
                    margin = this.options.margin,
                    targetTop = void 0,
                    targetLeft = void 0;

                this.xMovement = 0, this.yMovement = 0;

                targetTop = origin.getBoundingClientRect().top + M.getDocumentScrollTop();
                targetLeft = origin.getBoundingClientRect().left + M.getDocumentScrollLeft();

                if (this.options.position === 'top') {
                    targetTop += -tooltipHeight - margin;
                    targetLeft += originWidth / 2 - tooltipWidth / 2;
                    this.yMovement = -this.options.transitionMovement;
                } else if (this.options.position === 'right') {
                    targetTop += originHeight / 2 - tooltipHeight / 2;
                    targetLeft += originWidth + margin;
                    this.xMovement = this.options.transitionMovement;
                } else if (this.options.position === 'left') {
                    targetTop += originHeight / 2 - tooltipHeight / 2;
                    targetLeft += -tooltipWidth - margin;
                    this.xMovement = -this.options.transitionMovement;
                } else {
                    targetTop += originHeight + margin;
                    targetLeft += originWidth / 2 - tooltipWidth / 2;
                    this.yMovement = this.options.transitionMovement;
                }

                newCoordinates = this._repositionWithinScreen(targetLeft, targetTop, tooltipWidth, tooltipHeight);
                $(tooltip).css({
                    top: newCoordinates.y + 'px',
                    left: newCoordinates.x + 'px'
                });
            }
        }, {
            key: "_repositionWithinScreen",
            value: function _repositionWithinScreen(x, y, width, height) {
                var scrollLeft = M.getDocumentScrollLeft();
                var scrollTop = M.getDocumentScrollTop();
                var newX = x - scrollLeft;
                var newY = y - scrollTop;

                var bounding = {
                    left: newX,
                    top: newY,
                    width: width,
                    height: height
                };

                var offset = this.options.margin + this.options.transitionMovement;
                var edges = M.checkWithinContainer(document.body, bounding, offset);

                if (edges.left) {
                    newX = offset;
                } else if (edges.right) {
                    newX -= newX + width - window.innerWidth;
                }

                if (edges.top) {
                    newY = offset;
                } else if (edges.bottom) {
                    newY -= newY + height - window.innerHeight;
                }

                return {
                    x: newX + scrollLeft,
                    y: newY + scrollTop
                };
            }
        }, {
            key: "_animateIn",
            value: function _animateIn() {
                this._positionTooltip();
                this.tooltipEl.style.visibility = 'visible';
                anim.remove(this.tooltipEl);
                anim({
                    targets: this.tooltipEl,
                    opacity: 1,
                    translateX: this.xMovement,
                    translateY: this.yMovement,
                    duration: this.options.inDuration,
                    easing: 'easeOutCubic'
                });
            }
        }, {
            key: "_animateOut",
            value: function _animateOut() {
                anim.remove(this.tooltipEl);
                anim({
                    targets: this.tooltipEl,
                    opacity: 0,
                    translateX: 0,
                    translateY: 0,
                    duration: this.options.outDuration,
                    easing: 'easeOutCubic'
                });
            }
        }, {
            key: "_handleMouseEnter",
            value: function _handleMouseEnter() {
                this.isHovered = true;
                this.isFocused = false; // Allows close of tooltip when opened by focus.
                this.open(false);
            }
        }, {
            key: "_handleMouseLeave",
            value: function _handleMouseLeave() {
                this.isHovered = false;
                this.isFocused = false; // Allows close of tooltip when opened by focus.
                this.close();
            }
        }, {
            key: "_handleFocus",
            value: function _handleFocus() {
                if (M.tabPressed) {
                    this.isFocused = true;
                    this.open(false);
                }
            }
        }, {
            key: "_handleBlur",
            value: function _handleBlur() {
                this.isFocused = false;
                this.close();
            }
        }, {
            key: "_getAttributeOptions",
            value: function _getAttributeOptions() {
                var attributeOptions = {};
                var tooltipTextOption = this.el.getAttribute('data-tooltip');
                var positionOption = this.el.getAttribute('data-position');

                if (tooltipTextOption) {
                    attributeOptions.html = tooltipTextOption;
                }

                if (positionOption) {
                    attributeOptions.position = positionOption;
                }
                return attributeOptions;
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Tooltip.__proto__ || Object.getPrototypeOf(Tooltip), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Tooltip;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Tooltip;
    }(Component);

    M.Tooltip = Tooltip;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Tooltip, 'tooltip', 'M_Tooltip');
    }
})(cash, M.anime);
; /*!
  * Waves v0.6.4
  * http://fian.my.id/Waves
  *
  * Copyright 2014 Alfiana E. Sibuea and other contributors
  * Released under the MIT license
  * https://github.com/fians/Waves/blob/master/LICENSE
  */

; (function (window) {
    'use strict';

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);

    // Find exact position of element
    function isWindow(obj) {
        return obj !== null && obj === obj.window;
    }

    function getWindow(elem) {
        return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }

    function offset(elem) {
        var docElem,
            win,
            box = { top: 0, left: 0 },
            doc = elem && elem.ownerDocument;

        docElem = doc.documentElement;

        if (typeof elem.getBoundingClientRect !== typeof undefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    function convertStyle(obj) {
        var style = '';

        for (var a in obj) {
            if (obj.hasOwnProperty(a)) {
                style += a + ':' + obj[a] + ';';
            }
        }

        return style;
    }

    var Effect = {

        // Effect delay
        duration: 750,

        show: function (e, element) {

            // Disable right click
            if (e.button === 2) {
                return false;
            }

            var el = element || this;

            // Create ripple
            var ripple = document.createElement('div');
            ripple.className = 'waves-ripple';
            el.appendChild(ripple);

            // Get click coordinate and element witdh
            var pos = offset(el);
            var relativeY = e.pageY - pos.top;
            var relativeX = e.pageX - pos.left;
            var scale = 'scale(' + el.clientWidth / 100 * 10 + ')';

            // Support for touch devices
            if ('touches' in e) {
                relativeY = e.touches[0].pageY - pos.top;
                relativeX = e.touches[0].pageX - pos.left;
            }

            // Attach data to element
            ripple.setAttribute('data-hold', Date.now());
            ripple.setAttribute('data-scale', scale);
            ripple.setAttribute('data-x', relativeX);
            ripple.setAttribute('data-y', relativeY);

            // Set ripple position
            var rippleStyle = {
                'top': relativeY + 'px',
                'left': relativeX + 'px'
            };

            ripple.className = ripple.className + ' waves-notransition';
            ripple.setAttribute('style', convertStyle(rippleStyle));
            ripple.className = ripple.className.replace('waves-notransition', '');

            // Scale the ripple
            rippleStyle['-webkit-transform'] = scale;
            rippleStyle['-moz-transform'] = scale;
            rippleStyle['-ms-transform'] = scale;
            rippleStyle['-o-transform'] = scale;
            rippleStyle.transform = scale;
            rippleStyle.opacity = '1';

            rippleStyle['-webkit-transition-duration'] = Effect.duration + 'ms';
            rippleStyle['-moz-transition-duration'] = Effect.duration + 'ms';
            rippleStyle['-o-transition-duration'] = Effect.duration + 'ms';
            rippleStyle['transition-duration'] = Effect.duration + 'ms';

            rippleStyle['-webkit-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-moz-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['-o-transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';
            rippleStyle['transition-timing-function'] = 'cubic-bezier(0.250, 0.460, 0.450, 0.940)';

            ripple.setAttribute('style', convertStyle(rippleStyle));
        },

        hide: function (e) {
            TouchHandler.touchup(e);

            var el = this;
            var width = el.clientWidth * 1.4;

            // Get first ripple
            var ripple = null;
            var ripples = el.getElementsByClassName('waves-ripple');
            if (ripples.length > 0) {
                ripple = ripples[ripples.length - 1];
            } else {
                return false;
            }

            var relativeX = ripple.getAttribute('data-x');
            var relativeY = ripple.getAttribute('data-y');
            var scale = ripple.getAttribute('data-scale');

            // Get delay beetween mousedown and mouse leave
            var diff = Date.now() - Number(ripple.getAttribute('data-hold'));
            var delay = 350 - diff;

            if (delay < 0) {
                delay = 0;
            }

            // Fade out ripple after delay
            setTimeout(function () {
                var style = {
                    'top': relativeY + 'px',
                    'left': relativeX + 'px',
                    'opacity': '0',

                    // Duration
                    '-webkit-transition-duration': Effect.duration + 'ms',
                    '-moz-transition-duration': Effect.duration + 'ms',
                    '-o-transition-duration': Effect.duration + 'ms',
                    'transition-duration': Effect.duration + 'ms',
                    '-webkit-transform': scale,
                    '-moz-transform': scale,
                    '-ms-transform': scale,
                    '-o-transform': scale,
                    'transform': scale
                };

                ripple.setAttribute('style', convertStyle(style));

                setTimeout(function () {
                    try {
                        el.removeChild(ripple);
                    } catch (e) {
                        return false;
                    }
                }, Effect.duration);
            }, delay);
        },

        // Little hack to make <input> can perform waves effect
        wrapInput: function (elements) {
            for (var a = 0; a < elements.length; a++) {
                var el = elements[a];

                if (el.tagName.toLowerCase() === 'input') {
                    var parent = el.parentNode;

                    // If input already have parent just pass through
                    if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
                        continue;
                    }

                    // Put element class and style to the specified parent
                    var wrapper = document.createElement('i');
                    wrapper.className = el.className + ' waves-input-wrapper';

                    var elementStyle = el.getAttribute('style');

                    if (!elementStyle) {
                        elementStyle = '';
                    }

                    wrapper.setAttribute('style', elementStyle);

                    el.className = 'waves-button-input';
                    el.removeAttribute('style');

                    // Put element as child
                    parent.replaceChild(wrapper, el);
                    wrapper.appendChild(el);
                }
            }
        }
    };

    /**
     * Disable mousedown event for 500ms during and after touch
     */
    var TouchHandler = {
        /* uses an integer rather than bool so there's no issues with
         * needing to clear timeouts if another touch event occurred
         * within the 500ms. Cannot mouseup between touchstart and
         * touchend, nor in the 500ms after touchend. */
        touches: 0,
        allowEvent: function (e) {
            var allow = true;

            if (e.type === 'touchstart') {
                TouchHandler.touches += 1; //push
            } else if (e.type === 'touchend' || e.type === 'touchcancel') {
                setTimeout(function () {
                    if (TouchHandler.touches > 0) {
                        TouchHandler.touches -= 1; //pop after 500ms
                    }
                }, 500);
            } else if (e.type === 'mousedown' && TouchHandler.touches > 0) {
                allow = false;
            }

            return allow;
        },
        touchup: function (e) {
            TouchHandler.allowEvent(e);
        }
    };

    /**
     * Delegated click handler for .waves-effect element.
     * returns null when .waves-effect element not in "click tree"
     */
    function getWavesEffectElement(e) {
        if (TouchHandler.allowEvent(e) === false) {
            return null;
        }

        var element = null;
        var target = e.target || e.srcElement;

        while (target.parentNode !== null) {
            if (!(target instanceof SVGElement) && target.className.indexOf('waves-effect') !== -1) {
                element = target;
                break;
            }
            target = target.parentNode;
        }
        return element;
    }

    /**
     * Bubble the click and show effect if .waves-effect elem was found
     */
    function showEffect(e) {
        var element = getWavesEffectElement(e);

        if (element !== null) {
            Effect.show(e, element);

            if ('ontouchstart' in window) {
                element.addEventListener('touchend', Effect.hide, false);
                element.addEventListener('touchcancel', Effect.hide, false);
            }

            element.addEventListener('mouseup', Effect.hide, false);
            element.addEventListener('mouseleave', Effect.hide, false);
            element.addEventListener('dragend', Effect.hide, false);
        }
    }

    Waves.displayEffect = function (options) {
        options = options || {};

        if ('duration' in options) {
            Effect.duration = options.duration;
        }

        //Wrap input inside <i> tag
        Effect.wrapInput($$('.waves-effect'));

        if ('ontouchstart' in window) {
            document.body.addEventListener('touchstart', showEffect, false);
        }

        document.body.addEventListener('mousedown', showEffect, false);
    };

    /**
     * Attach Waves to an input element (or any element which doesn't
     * bubble mouseup/mousedown events).
     *   Intended to be used with dynamically loaded forms/inputs, or
     * where the user doesn't want a delegated click handler.
     */
    Waves.attach = function (element) {
        //FUTURE: automatically add waves classes and allow users
        // to specify them with an options param? Eg. light/classic/button
        if (element.tagName.toLowerCase() === 'input') {
            Effect.wrapInput([element]);
            element = element.parentNode;
        }

        if ('ontouchstart' in window) {
            element.addEventListener('touchstart', showEffect, false);
        }

        element.addEventListener('mousedown', showEffect, false);
    };

    window.Waves = Waves;

    document.addEventListener('DOMContentLoaded', function () {
        Waves.displayEffect();
    }, false);
})(window);
; (function ($, anim) {
    'use strict';

    var _defaults = {
        html: '',
        displayLength: 4000,
        inDuration: 300,
        outDuration: 375,
        classes: '',
        completeCallback: null,
        activationPercent: 0.8
    };

    var Toast = function () {
        function Toast(options) {
            _classCallCheck(this, Toast);

            /**
             * Options for the toast
             * @member Toast#options
             */
            this.options = $.extend({}, Toast.defaults, options);
            this.message = this.options.html;

            /**
             * Describes current pan state toast
             * @type {Boolean}
             */
            this.panning = false;

            /**
             * Time remaining until toast is removed
             */
            this.timeRemaining = this.options.displayLength;

            if (Toast._toasts.length === 0) {
                Toast._createContainer();
            }

            // Create new toast
            Toast._toasts.push(this);
            var toastElement = this._createToast();
            toastElement.M_Toast = this;
            this.el = toastElement;
            this.$el = $(toastElement);
            this._animateIn();
            this._setTimer();
        }

        _createClass(Toast, [{
            key: "_createToast",


            /**
             * Create toast and append it to toast container
             */
            value: function _createToast() {
                var toast = document.createElement('div');
                toast.classList.add('toast');

                // Add custom classes onto toast
                if (!!this.options.classes.length) {
                    $(toast).addClass(this.options.classes);
                }

                // Set content
                if (typeof HTMLElement === 'object' ? this.message instanceof HTMLElement : this.message && typeof this.message === 'object' && this.message !== null && this.message.nodeType === 1 && typeof this.message.nodeName === 'string') {
                    toast.appendChild(this.message);

                    // Check if it is jQuery object
                } else if (!!this.message.jquery) {
                    $(toast).append(this.message[0]);

                    // Insert as html;
                } else {
                    toast.innerHTML = this.message;
                }

                // Append toasft
                Toast._container.appendChild(toast);
                return toast;
            }

            /**
             * Animate in toast
             */

        }, {
            key: "_animateIn",
            value: function _animateIn() {
                // Animate toast in
                anim({
                    targets: this.el,
                    top: 0,
                    opacity: 1,
                    duration: this.options.inDuration,
                    easing: 'easeOutCubic'
                });
            }

            /**
             * Create setInterval which automatically removes toast when timeRemaining >= 0
             * has been reached
             */

        }, {
            key: "_setTimer",
            value: function _setTimer() {
                var _this29 = this;

                if (this.timeRemaining !== Infinity) {
                    this.counterInterval = setInterval(function () {
                        // If toast is not being dragged, decrease its time remaining
                        if (!_this29.panning) {
                            _this29.timeRemaining -= 20;
                        }

                        // Animate toast out
                        if (_this29.timeRemaining <= 0) {
                            _this29.dismiss();
                        }
                    }, 20);
                }
            }

            /**
             * Dismiss toast with animation
             */

        }, {
            key: "dismiss",
            value: function dismiss() {
                var _this30 = this;

                window.clearInterval(this.counterInterval);
                var activationDistance = this.el.offsetWidth * this.options.activationPercent;

                if (this.wasSwiped) {
                    this.el.style.transition = 'transform .05s, opacity .05s';
                    this.el.style.transform = "translateX(" + activationDistance + "px)";
                    this.el.style.opacity = 0;
                }

                anim({
                    targets: this.el,
                    opacity: 0,
                    marginTop: -40,
                    duration: this.options.outDuration,
                    easing: 'easeOutExpo',
                    complete: function () {
                        // Call the optional callback
                        if (typeof _this30.options.completeCallback === 'function') {
                            _this30.options.completeCallback();
                        }
                        // Remove toast from DOM
                        _this30.$el.remove();
                        Toast._toasts.splice(Toast._toasts.indexOf(_this30), 1);
                        if (Toast._toasts.length === 0) {
                            Toast._removeContainer();
                        }
                    }
                });
            }
        }], [{
            key: "getInstance",


            /**
             * Get Instance
             */
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Toast;
            }

            /**
             * Append toast container and add event handlers
             */

        }, {
            key: "_createContainer",
            value: function _createContainer() {
                var container = document.createElement('div');
                container.setAttribute('id', 'toast-container');

                // Add event handler
                container.addEventListener('touchstart', Toast._onDragStart);
                container.addEventListener('touchmove', Toast._onDragMove);
                container.addEventListener('touchend', Toast._onDragEnd);

                container.addEventListener('mousedown', Toast._onDragStart);
                document.addEventListener('mousemove', Toast._onDragMove);
                document.addEventListener('mouseup', Toast._onDragEnd);

                document.body.appendChild(container);
                Toast._container = container;
            }

            /**
             * Remove toast container and event handlers
             */

        }, {
            key: "_removeContainer",
            value: function _removeContainer() {
                // Add event handler
                document.removeEventListener('mousemove', Toast._onDragMove);
                document.removeEventListener('mouseup', Toast._onDragEnd);

                $(Toast._container).remove();
                Toast._container = null;
            }

            /**
             * Begin drag handler
             * @param {Event} e
             */

        }, {
            key: "_onDragStart",
            value: function _onDragStart(e) {
                if (e.target && $(e.target).closest('.toast').length) {
                    var $toast = $(e.target).closest('.toast');
                    var toast = $toast[0].M_Toast;
                    toast.panning = true;
                    Toast._draggedToast = toast;
                    toast.el.classList.add('panning');
                    toast.el.style.transition = '';
                    toast.startingXPos = Toast._xPos(e);
                    toast.time = Date.now();
                    toast.xPos = Toast._xPos(e);
                }
            }

            /**
             * Drag move handler
             * @param {Event} e
             */

        }, {
            key: "_onDragMove",
            value: function _onDragMove(e) {
                if (!!Toast._draggedToast) {
                    e.preventDefault();
                    var toast = Toast._draggedToast;
                    toast.deltaX = Math.abs(toast.xPos - Toast._xPos(e));
                    toast.xPos = Toast._xPos(e);
                    toast.velocityX = toast.deltaX / (Date.now() - toast.time);
                    toast.time = Date.now();

                    var totalDeltaX = toast.xPos - toast.startingXPos;
                    var activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
                    toast.el.style.transform = "translateX(" + totalDeltaX + "px)";
                    toast.el.style.opacity = 1 - Math.abs(totalDeltaX / activationDistance);
                }
            }

            /**
             * End drag handler
             */

        }, {
            key: "_onDragEnd",
            value: function _onDragEnd() {
                if (!!Toast._draggedToast) {
                    var toast = Toast._draggedToast;
                    toast.panning = false;
                    toast.el.classList.remove('panning');

                    var totalDeltaX = toast.xPos - toast.startingXPos;
                    var activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
                    var shouldBeDismissed = Math.abs(totalDeltaX) > activationDistance || toast.velocityX > 1;

                    // Remove toast
                    if (shouldBeDismissed) {
                        toast.wasSwiped = true;
                        toast.dismiss();

                        // Animate toast back to original position
                    } else {
                        toast.el.style.transition = 'transform .2s, opacity .2s';
                        toast.el.style.transform = '';
                        toast.el.style.opacity = '';
                    }
                    Toast._draggedToast = null;
                }
            }

            /**
             * Get x position of mouse or touch event
             * @param {Event} e
             */

        }, {
            key: "_xPos",
            value: function _xPos(e) {
                if (e.targetTouches && e.targetTouches.length >= 1) {
                    return e.targetTouches[0].clientX;
                }
                // mouse event
                return e.clientX;
            }

            /**
             * Remove all toasts
             */

        }, {
            key: "dismissAll",
            value: function dismissAll() {
                for (var toastIndex in Toast._toasts) {
                    Toast._toasts[toastIndex].dismiss();
                }
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Toast;
    }();

    /**
     * @static
     * @memberof Toast
     * @type {Array.<Toast>}
     */


    Toast._toasts = [];

    /**
     * @static
     * @memberof Toast
     */
    Toast._container = null;

    /**
     * @static
     * @memberof Toast
     * @type {Toast}
     */
    Toast._draggedToast = null;

    M.Toast = Toast;
    M.toast = function (options) {
        return new Toast(options);
    };
})(cash, M.anime);
; (function ($, anim) {
    'use strict';

    var _defaults = {
        edge: 'left',
        draggable: true,
        inDuration: 250,
        outDuration: 200,
        onOpenStart: null,
        onOpenEnd: null,
        onCloseStart: null,
        onCloseEnd: null,
        preventScrolling: true
    };

    /**
     * @class
     */

    var Sidenav = function (_Component8) {
        _inherits(Sidenav, _Component8);

        /**
         * Construct Sidenav instance and set up overlay
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Sidenav(el, options) {
            _classCallCheck(this, Sidenav);

            var _this31 = _possibleConstructorReturn(this, (Sidenav.__proto__ || Object.getPrototypeOf(Sidenav)).call(this, Sidenav, el, options));

            _this31.el.M_Sidenav = _this31;
            _this31.id = _this31.$el.attr('id');

            /**
             * Options for the Sidenav
             * @member Sidenav#options
             * @prop {String} [edge='left'] - Side of screen on which Sidenav appears
             * @prop {Boolean} [draggable=true] - Allow swipe gestures to open/close Sidenav
             * @prop {Number} [inDuration=250] - Length in ms of enter transition
             * @prop {Number} [outDuration=200] - Length in ms of exit transition
             * @prop {Function} onOpenStart - Function called when sidenav starts entering
             * @prop {Function} onOpenEnd - Function called when sidenav finishes entering
             * @prop {Function} onCloseStart - Function called when sidenav starts exiting
             * @prop {Function} onCloseEnd - Function called when sidenav finishes exiting
             */
            _this31.options = $.extend({}, Sidenav.defaults, options);

            /**
             * Describes open/close state of Sidenav
             * @type {Boolean}
             */
            _this31.isOpen = false;

            /**
             * Describes if Sidenav is fixed
             * @type {Boolean}
             */
            _this31.isFixed = _this31.el.classList.contains('sidenav-fixed');

            /**
             * Describes if Sidenav is being draggeed
             * @type {Boolean}
             */
            _this31.isDragged = false;

            // Window size variables for window resize checks
            _this31.lastWindowWidth = window.innerWidth;
            _this31.lastWindowHeight = window.innerHeight;

            _this31._createOverlay();
            _this31._createDragTarget();
            _this31._setupEventHandlers();
            _this31._setupClasses();
            _this31._setupFixed();

            Sidenav._sidenavs.push(_this31);
            return _this31;
        }

        _createClass(Sidenav, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this._enableBodyScrolling();
                this._overlay.parentNode.removeChild(this._overlay);
                this.dragTarget.parentNode.removeChild(this.dragTarget);
                this.el.M_Sidenav = undefined;
                this.el.style.transform = '';

                var index = Sidenav._sidenavs.indexOf(this);
                if (index >= 0) {
                    Sidenav._sidenavs.splice(index, 1);
                }
            }
        }, {
            key: "_createOverlay",
            value: function _createOverlay() {
                var overlay = document.createElement('div');
                this._closeBound = this.close.bind(this);
                overlay.classList.add('sidenav-overlay');

                overlay.addEventListener('click', this._closeBound);

                document.body.appendChild(overlay);
                this._overlay = overlay;
            }
        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                if (Sidenav._sidenavs.length === 0) {
                    document.body.addEventListener('click', this._handleTriggerClick);
                }

                this._handleDragTargetDragBound = this._handleDragTargetDrag.bind(this);
                this._handleDragTargetReleaseBound = this._handleDragTargetRelease.bind(this);
                this._handleCloseDragBound = this._handleCloseDrag.bind(this);
                this._handleCloseReleaseBound = this._handleCloseRelease.bind(this);
                this._handleCloseTriggerClickBound = this._handleCloseTriggerClick.bind(this);

                this.dragTarget.addEventListener('touchmove', this._handleDragTargetDragBound);
                this.dragTarget.addEventListener('touchend', this._handleDragTargetReleaseBound);
                this._overlay.addEventListener('touchmove', this._handleCloseDragBound);
                this._overlay.addEventListener('touchend', this._handleCloseReleaseBound);
                this.el.addEventListener('touchmove', this._handleCloseDragBound);
                this.el.addEventListener('touchend', this._handleCloseReleaseBound);
                this.el.addEventListener('click', this._handleCloseTriggerClickBound);

                // Add resize for side nav fixed
                if (this.isFixed) {
                    this._handleWindowResizeBound = this._handleWindowResize.bind(this);
                    window.addEventListener('resize', this._handleWindowResizeBound);
                }
            }
        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                if (Sidenav._sidenavs.length === 1) {
                    document.body.removeEventListener('click', this._handleTriggerClick);
                }

                this.dragTarget.removeEventListener('touchmove', this._handleDragTargetDragBound);
                this.dragTarget.removeEventListener('touchend', this._handleDragTargetReleaseBound);
                this._overlay.removeEventListener('touchmove', this._handleCloseDragBound);
                this._overlay.removeEventListener('touchend', this._handleCloseReleaseBound);
                this.el.removeEventListener('touchmove', this._handleCloseDragBound);
                this.el.removeEventListener('touchend', this._handleCloseReleaseBound);
                this.el.removeEventListener('click', this._handleCloseTriggerClickBound);

                // Remove resize for side nav fixed
                if (this.isFixed) {
                    window.removeEventListener('resize', this._handleWindowResizeBound);
                }
            }

            /**
             * Handle Trigger Click
             * @param {Event} e
             */

        }, {
            key: "_handleTriggerClick",
            value: function _handleTriggerClick(e) {
                var $trigger = $(e.target).closest('.sidenav-trigger');
                if (e.target && $trigger.length) {
                    var sidenavId = M.getIdFromTrigger($trigger[0]);

                    var sidenavInstance = document.getElementById(sidenavId).M_Sidenav;
                    if (sidenavInstance) {
                        sidenavInstance.open($trigger);
                    }
                    e.preventDefault();
                }
            }

            /**
             * Set variables needed at the beggining of drag
             * and stop any current transition.
             * @param {Event} e
             */

        }, {
            key: "_startDrag",
            value: function _startDrag(e) {
                var clientX = e.targetTouches[0].clientX;
                this.isDragged = true;
                this._startingXpos = clientX;
                this._xPos = this._startingXpos;
                this._time = Date.now();
                this._width = this.el.getBoundingClientRect().width;
                this._overlay.style.display = 'block';
                this._initialScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
                this._verticallyScrolling = false;
                anim.remove(this.el);
                anim.remove(this._overlay);
            }

            /**
             * Set variables needed at each drag move update tick
             * @param {Event} e
             */

        }, {
            key: "_dragMoveUpdate",
            value: function _dragMoveUpdate(e) {
                var clientX = e.targetTouches[0].clientX;
                var currentScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
                this.deltaX = Math.abs(this._xPos - clientX);
                this._xPos = clientX;
                this.velocityX = this.deltaX / (Date.now() - this._time);
                this._time = Date.now();
                if (this._initialScrollTop !== currentScrollTop) {
                    this._verticallyScrolling = true;
                }
            }

            /**
             * Handles Dragging of Sidenav
             * @param {Event} e
             */

        }, {
            key: "_handleDragTargetDrag",
            value: function _handleDragTargetDrag(e) {
                // Check if draggable
                if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
                    return;
                }

                // If not being dragged, set initial drag start variables
                if (!this.isDragged) {
                    this._startDrag(e);
                }

                // Run touchmove updates
                this._dragMoveUpdate(e);

                // Calculate raw deltaX
                var totalDeltaX = this._xPos - this._startingXpos;

                // dragDirection is the attempted user drag direction
                var dragDirection = totalDeltaX > 0 ? 'right' : 'left';

                // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
                totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
                if (this.options.edge === dragDirection) {
                    totalDeltaX = 0;
                }

                /**
                 * transformX is the drag displacement
                 * transformPrefix is the initial transform placement
                 * Invert values if Sidenav is right edge
                 */
                var transformX = totalDeltaX;
                var transformPrefix = 'translateX(-100%)';
                if (this.options.edge === 'right') {
                    transformPrefix = 'translateX(100%)';
                    transformX = -transformX;
                }

                // Calculate open/close percentage of sidenav, with open = 1 and close = 0
                this.percentOpen = Math.min(1, totalDeltaX / this._width);

                // Set transform and opacity styles
                this.el.style.transform = transformPrefix + " translateX(" + transformX + "px)";
                this._overlay.style.opacity = this.percentOpen;
            }

            /**
             * Handle Drag Target Release
             */

        }, {
            key: "_handleDragTargetRelease",
            value: function _handleDragTargetRelease() {
                if (this.isDragged) {
                    if (this.percentOpen > 0.2) {
                        this.open();
                    } else {
                        this._animateOut();
                    }

                    this.isDragged = false;
                    this._verticallyScrolling = false;
                }
            }

            /**
             * Handle Close Drag
             * @param {Event} e
             */

        }, {
            key: "_handleCloseDrag",
            value: function _handleCloseDrag(e) {
                if (this.isOpen) {
                    // Check if draggable
                    if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
                        return;
                    }

                    // If not being dragged, set initial drag start variables
                    if (!this.isDragged) {
                        this._startDrag(e);
                    }

                    // Run touchmove updates
                    this._dragMoveUpdate(e);

                    // Calculate raw deltaX
                    var totalDeltaX = this._xPos - this._startingXpos;

                    // dragDirection is the attempted user drag direction
                    var dragDirection = totalDeltaX > 0 ? 'right' : 'left';

                    // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
                    totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
                    if (this.options.edge !== dragDirection) {
                        totalDeltaX = 0;
                    }

                    var transformX = -totalDeltaX;
                    if (this.options.edge === 'right') {
                        transformX = -transformX;
                    }

                    // Calculate open/close percentage of sidenav, with open = 1 and close = 0
                    this.percentOpen = Math.min(1, 1 - totalDeltaX / this._width);

                    // Set transform and opacity styles
                    this.el.style.transform = "translateX(" + transformX + "px)";
                    this._overlay.style.opacity = this.percentOpen;
                }
            }

            /**
             * Handle Close Release
             */

        }, {
            key: "_handleCloseRelease",
            value: function _handleCloseRelease() {
                if (this.isOpen && this.isDragged) {
                    if (this.percentOpen > 0.8) {
                        this._animateIn();
                    } else {
                        this.close();
                    }

                    this.isDragged = false;
                    this._verticallyScrolling = false;
                }
            }

            /**
             * Handles closing of Sidenav when element with class .sidenav-close
             */

        }, {
            key: "_handleCloseTriggerClick",
            value: function _handleCloseTriggerClick(e) {
                var $closeTrigger = $(e.target).closest('.sidenav-close');
                if ($closeTrigger.length && !this._isCurrentlyFixed()) {
                    this.close();
                }
            }

            /**
             * Handle Window Resize
             */

        }, {
            key: "_handleWindowResize",
            value: function _handleWindowResize() {
                // Only handle horizontal resizes
                if (this.lastWindowWidth !== window.innerWidth) {
                    if (window.innerWidth > 992) {
                        this.open();
                    } else {
                        this.close();
                    }
                }

                this.lastWindowWidth = window.innerWidth;
                this.lastWindowHeight = window.innerHeight;
            }
        }, {
            key: "_setupClasses",
            value: function _setupClasses() {
                if (this.options.edge === 'right') {
                    this.el.classList.add('right-aligned');
                    this.dragTarget.classList.add('right-aligned');
                }
            }
        }, {
            key: "_removeClasses",
            value: function _removeClasses() {
                this.el.classList.remove('right-aligned');
                this.dragTarget.classList.remove('right-aligned');
            }
        }, {
            key: "_setupFixed",
            value: function _setupFixed() {
                if (this._isCurrentlyFixed()) {
                    this.open();
                }
            }
        }, {
            key: "_isCurrentlyFixed",
            value: function _isCurrentlyFixed() {
                return this.isFixed && window.innerWidth > 992;
            }
        }, {
            key: "_createDragTarget",
            value: function _createDragTarget() {
                var dragTarget = document.createElement('div');
                dragTarget.classList.add('drag-target');
                document.body.appendChild(dragTarget);
                this.dragTarget = dragTarget;
            }
        }, {
            key: "_preventBodyScrolling",
            value: function _preventBodyScrolling() {
                var body = document.body;
                body.style.overflow = 'hidden';
            }
        }, {
            key: "_enableBodyScrolling",
            value: function _enableBodyScrolling() {
                var body = document.body;
                body.style.overflow = '';
            }
        }, {
            key: "open",
            value: function open() {
                if (this.isOpen === true) {
                    return;
                }

                this.isOpen = true;

                // Run onOpenStart callback
                if (typeof this.options.onOpenStart === 'function') {
                    this.options.onOpenStart.call(this, this.el);
                }

                // Handle fixed Sidenav
                if (this._isCurrentlyFixed()) {
                    anim.remove(this.el);
                    anim({
                        targets: this.el,
                        translateX: 0,
                        duration: 0,
                        easing: 'easeOutQuad'
                    });
                    this._enableBodyScrolling();
                    this._overlay.style.display = 'none';

                    // Handle non-fixed Sidenav
                } else {
                    if (this.options.preventScrolling) {
                        this._preventBodyScrolling();
                    }

                    if (!this.isDragged || this.percentOpen != 1) {
                        this._animateIn();
                    }
                }
            }
        }, {
            key: "close",
            value: function close() {
                if (this.isOpen === false) {
                    return;
                }

                this.isOpen = false;

                // Run onCloseStart callback
                if (typeof this.options.onCloseStart === 'function') {
                    this.options.onCloseStart.call(this, this.el);
                }

                // Handle fixed Sidenav
                if (this._isCurrentlyFixed()) {
                    var transformX = this.options.edge === 'left' ? '-105%' : '105%';
                    this.el.style.transform = "translateX(" + transformX + ")";

                    // Handle non-fixed Sidenav
                } else {
                    this._enableBodyScrolling();

                    if (!this.isDragged || this.percentOpen != 0) {
                        this._animateOut();
                    } else {
                        this._overlay.style.display = 'none';
                    }
                }
            }
        }, {
            key: "_animateIn",
            value: function _animateIn() {
                this._animateSidenavIn();
                this._animateOverlayIn();
            }
        }, {
            key: "_animateSidenavIn",
            value: function _animateSidenavIn() {
                var _this32 = this;

                var slideOutPercent = this.options.edge === 'left' ? -1 : 1;
                if (this.isDragged) {
                    slideOutPercent = this.options.edge === 'left' ? slideOutPercent + this.percentOpen : slideOutPercent - this.percentOpen;
                }

                anim.remove(this.el);
                anim({
                    targets: this.el,
                    translateX: [slideOutPercent * 100 + "%", 0],
                    duration: this.options.inDuration,
                    easing: 'easeOutQuad',
                    complete: function () {
                        // Run onOpenEnd callback
                        if (typeof _this32.options.onOpenEnd === 'function') {
                            _this32.options.onOpenEnd.call(_this32, _this32.el);
                        }
                    }
                });
            }
        }, {
            key: "_animateOverlayIn",
            value: function _animateOverlayIn() {
                var start = 0;
                if (this.isDragged) {
                    start = this.percentOpen;
                } else {
                    $(this._overlay).css({
                        display: 'block'
                    });
                }

                anim.remove(this._overlay);
                anim({
                    targets: this._overlay,
                    opacity: [start, 1],
                    duration: this.options.inDuration,
                    easing: 'easeOutQuad'
                });
            }
        }, {
            key: "_animateOut",
            value: function _animateOut() {
                this._animateSidenavOut();
                this._animateOverlayOut();
            }
        }, {
            key: "_animateSidenavOut",
            value: function _animateSidenavOut() {
                var _this33 = this;

                var endPercent = this.options.edge === 'left' ? -1 : 1;
                var slideOutPercent = 0;
                if (this.isDragged) {
                    slideOutPercent = this.options.edge === 'left' ? endPercent + this.percentOpen : endPercent - this.percentOpen;
                }

                anim.remove(this.el);
                anim({
                    targets: this.el,
                    translateX: [slideOutPercent * 100 + "%", endPercent * 105 + "%"],
                    duration: this.options.outDuration,
                    easing: 'easeOutQuad',
                    complete: function () {
                        // Run onOpenEnd callback
                        if (typeof _this33.options.onCloseEnd === 'function') {
                            _this33.options.onCloseEnd.call(_this33, _this33.el);
                        }
                    }
                });
            }
        }, {
            key: "_animateOverlayOut",
            value: function _animateOverlayOut() {
                var _this34 = this;

                anim.remove(this._overlay);
                anim({
                    targets: this._overlay,
                    opacity: 0,
                    duration: this.options.outDuration,
                    easing: 'easeOutQuad',
                    complete: function () {
                        $(_this34._overlay).css('display', 'none');
                    }
                });
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Sidenav.__proto__ || Object.getPrototypeOf(Sidenav), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Sidenav;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Sidenav;
    }(Component);

    /**
     * @static
     * @memberof Sidenav
     * @type {Array.<Sidenav>}
     */


    Sidenav._sidenavs = [];

    M.Sidenav = Sidenav;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Sidenav, 'sidenav', 'M_Sidenav');
    }
})(cash, M.anime);
; (function ($, anim) {
    'use strict';

    var _defaults = {
        throttle: 100,
        scrollOffset: 200, // offset - 200 allows elements near bottom of page to scroll
        activeClass: 'active',
        getActiveElement: function (id) {
            return 'a[href="#' + id + '"]';
        }
    };

    /**
     * @class
     *
     */

    var ScrollSpy = function (_Component9) {
        _inherits(ScrollSpy, _Component9);

        /**
         * Construct ScrollSpy instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function ScrollSpy(el, options) {
            _classCallCheck(this, ScrollSpy);

            var _this35 = _possibleConstructorReturn(this, (ScrollSpy.__proto__ || Object.getPrototypeOf(ScrollSpy)).call(this, ScrollSpy, el, options));

            _this35.el.M_ScrollSpy = _this35;

            /**
             * Options for the modal
             * @member Modal#options
             * @prop {Number} [throttle=100] - Throttle of scroll handler
             * @prop {Number} [scrollOffset=200] - Offset for centering element when scrolled to
             * @prop {String} [activeClass='active'] - Class applied to active elements
             * @prop {Function} [getActiveElement] - Used to find active element
             */
            _this35.options = $.extend({}, ScrollSpy.defaults, options);

            // setup
            ScrollSpy._elements.push(_this35);
            ScrollSpy._count++;
            ScrollSpy._increment++;
            _this35.tickId = -1;
            _this35.id = ScrollSpy._increment;
            _this35._setupEventHandlers();
            _this35._handleWindowScroll();
            return _this35;
        }

        _createClass(ScrollSpy, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                ScrollSpy._elements.splice(ScrollSpy._elements.indexOf(this), 1);
                ScrollSpy._elementsInView.splice(ScrollSpy._elementsInView.indexOf(this), 1);
                ScrollSpy._visibleElements.splice(ScrollSpy._visibleElements.indexOf(this.$el), 1);
                ScrollSpy._count--;
                this._removeEventHandlers();
                $(this.options.getActiveElement(this.$el.attr('id'))).removeClass(this.options.activeClass);
                this.el.M_ScrollSpy = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                var throttledResize = M.throttle(this._handleWindowScroll, 200);
                this._handleThrottledResizeBound = throttledResize.bind(this);
                this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
                if (ScrollSpy._count === 1) {
                    window.addEventListener('scroll', this._handleWindowScrollBound);
                    window.addEventListener('resize', this._handleThrottledResizeBound);
                    document.body.addEventListener('click', this._handleTriggerClick);
                }
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                if (ScrollSpy._count === 0) {
                    window.removeEventListener('scroll', this._handleWindowScrollBound);
                    window.removeEventListener('resize', this._handleThrottledResizeBound);
                    document.body.removeEventListener('click', this._handleTriggerClick);
                }
            }

            /**
             * Handle Trigger Click
             * @param {Event} e
             */

        }, {
            key: "_handleTriggerClick",
            value: function _handleTriggerClick(e) {
                var $trigger = $(e.target);
                for (var i = ScrollSpy._elements.length - 1; i >= 0; i--) {
                    var scrollspy = ScrollSpy._elements[i];
                    if ($trigger.is('a[href="#' + scrollspy.$el.attr('id') + '"]')) {
                        e.preventDefault();
                        var offset = scrollspy.$el.offset().top + 1;

                        anim({
                            targets: [document.documentElement, document.body],
                            scrollTop: offset - scrollspy.options.scrollOffset,
                            duration: 400,
                            easing: 'easeOutCubic'
                        });
                        break;
                    }
                }
            }

            /**
             * Handle Window Scroll
             */

        }, {
            key: "_handleWindowScroll",
            value: function _handleWindowScroll() {
                // unique tick id
                ScrollSpy._ticks++;

                // viewport rectangle
                var top = M.getDocumentScrollTop(),
                    left = M.getDocumentScrollLeft(),
                    right = left + window.innerWidth,
                    bottom = top + window.innerHeight;

                // determine which elements are in view
                var intersections = ScrollSpy._findElements(top, right, bottom, left);
                for (var i = 0; i < intersections.length; i++) {
                    var scrollspy = intersections[i];
                    var lastTick = scrollspy.tickId;
                    if (lastTick < 0) {
                        // entered into view
                        scrollspy._enter();
                    }

                    // update tick id
                    scrollspy.tickId = ScrollSpy._ticks;
                }

                for (var _i = 0; _i < ScrollSpy._elementsInView.length; _i++) {
                    var _scrollspy = ScrollSpy._elementsInView[_i];
                    var _lastTick = _scrollspy.tickId;
                    if (_lastTick >= 0 && _lastTick !== ScrollSpy._ticks) {
                        // exited from view
                        _scrollspy._exit();
                        _scrollspy.tickId = -1;
                    }
                }

                // remember elements in view for next tick
                ScrollSpy._elementsInView = intersections;
            }

            /**
             * Find elements that are within the boundary
             * @param {number} top
             * @param {number} right
             * @param {number} bottom
             * @param {number} left
             * @return {Array.<ScrollSpy>}   A collection of elements
             */

        }, {
            key: "_enter",
            value: function _enter() {
                ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
                    return value.height() != 0;
                });

                if (ScrollSpy._visibleElements[0]) {
                    $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);
                    if (ScrollSpy._visibleElements[0][0].M_ScrollSpy && this.id < ScrollSpy._visibleElements[0][0].M_ScrollSpy.id) {
                        ScrollSpy._visibleElements.unshift(this.$el);
                    } else {
                        ScrollSpy._visibleElements.push(this.$el);
                    }
                } else {
                    ScrollSpy._visibleElements.push(this.$el);
                }

                $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
            }
        }, {
            key: "_exit",
            value: function _exit() {
                var _this36 = this;

                ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
                    return value.height() != 0;
                });

                if (ScrollSpy._visibleElements[0]) {
                    $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);

                    ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (el) {
                        return el.attr('id') != _this36.$el.attr('id');
                    });
                    if (ScrollSpy._visibleElements[0]) {
                        // Check if empty
                        $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
                    }
                }
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(ScrollSpy.__proto__ || Object.getPrototypeOf(ScrollSpy), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_ScrollSpy;
            }
        }, {
            key: "_findElements",
            value: function _findElements(top, right, bottom, left) {
                var hits = [];
                for (var i = 0; i < ScrollSpy._elements.length; i++) {
                    var scrollspy = ScrollSpy._elements[i];
                    var currTop = top + scrollspy.options.scrollOffset || 200;

                    if (scrollspy.$el.height() > 0) {
                        var elTop = scrollspy.$el.offset().top,
                            elLeft = scrollspy.$el.offset().left,
                            elRight = elLeft + scrollspy.$el.width(),
                            elBottom = elTop + scrollspy.$el.height();

                        var isIntersect = !(elLeft > right || elRight < left || elTop > bottom || elBottom < currTop);

                        if (isIntersect) {
                            hits.push(scrollspy);
                        }
                    }
                }
                return hits;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return ScrollSpy;
    }(Component);

    /**
     * @static
     * @memberof ScrollSpy
     * @type {Array.<ScrollSpy>}
     */


    ScrollSpy._elements = [];

    /**
     * @static
     * @memberof ScrollSpy
     * @type {Array.<ScrollSpy>}
     */
    ScrollSpy._elementsInView = [];

    /**
     * @static
     * @memberof ScrollSpy
     * @type {Array.<cash>}
     */
    ScrollSpy._visibleElements = [];

    /**
     * @static
     * @memberof ScrollSpy
     */
    ScrollSpy._count = 0;

    /**
     * @static
     * @memberof ScrollSpy
     */
    ScrollSpy._increment = 0;

    /**
     * @static
     * @memberof ScrollSpy
     */
    ScrollSpy._ticks = 0;

    M.ScrollSpy = ScrollSpy;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(ScrollSpy, 'scrollSpy', 'M_ScrollSpy');
    }
})(cash, M.anime);
; (function ($) {
    'use strict';

    var _defaults = {
        data: {}, // Autocomplete data set
        limit: Infinity, // Limit of results the autocomplete shows
        onAutocomplete: null, // Callback for when autocompleted
        minLength: 1, // Min characters before autocomplete starts
        sortFunction: function (a, b, inputString) {
            // Sort function for sorting autocomplete results
            return a.indexOf(inputString) - b.indexOf(inputString);
        }
    };

    /**
     * @class
     *
     */

    var Autocomplete = function (_Component10) {
        _inherits(Autocomplete, _Component10);

        /**
         * Construct Autocomplete instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Autocomplete(el, options) {
            _classCallCheck(this, Autocomplete);

            var _this37 = _possibleConstructorReturn(this, (Autocomplete.__proto__ || Object.getPrototypeOf(Autocomplete)).call(this, Autocomplete, el, options));

            _this37.el.M_Autocomplete = _this37;

            /**
             * Options for the autocomplete
             * @member Autocomplete#options
             * @prop {Number} duration
             * @prop {Number} dist
             * @prop {number} shift
             * @prop {number} padding
             * @prop {Boolean} fullWidth
             * @prop {Boolean} indicators
             * @prop {Boolean} noWrap
             * @prop {Function} onCycleTo
             */
            _this37.options = $.extend({}, Autocomplete.defaults, options);

            // Setup
            _this37.isOpen = false;
            _this37.count = 0;
            _this37.activeIndex = -1;
            _this37.oldVal;
            _this37.$inputField = _this37.$el.closest('.input-field');
            _this37.$active = $();
            _this37._mousedown = false;
            _this37._setupDropdown();

            _this37._setupEventHandlers();
            return _this37;
        }

        _createClass(Autocomplete, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this._removeDropdown();
                this.el.M_Autocomplete = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleInputBlurBound = this._handleInputBlur.bind(this);
                this._handleInputKeyupAndFocusBound = this._handleInputKeyupAndFocus.bind(this);
                this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
                this._handleInputClickBound = this._handleInputClick.bind(this);
                this._handleContainerMousedownAndTouchstartBound = this._handleContainerMousedownAndTouchstart.bind(this);
                this._handleContainerMouseupAndTouchendBound = this._handleContainerMouseupAndTouchend.bind(this);

                this.el.addEventListener('blur', this._handleInputBlurBound);
                this.el.addEventListener('keyup', this._handleInputKeyupAndFocusBound);
                this.el.addEventListener('focus', this._handleInputKeyupAndFocusBound);
                this.el.addEventListener('keydown', this._handleInputKeydownBound);
                this.el.addEventListener('click', this._handleInputClickBound);
                this.container.addEventListener('mousedown', this._handleContainerMousedownAndTouchstartBound);
                this.container.addEventListener('mouseup', this._handleContainerMouseupAndTouchendBound);

                if (typeof window.ontouchstart !== 'undefined') {
                    this.container.addEventListener('touchstart', this._handleContainerMousedownAndTouchstartBound);
                    this.container.addEventListener('touchend', this._handleContainerMouseupAndTouchendBound);
                }
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.el.removeEventListener('blur', this._handleInputBlurBound);
                this.el.removeEventListener('keyup', this._handleInputKeyupAndFocusBound);
                this.el.removeEventListener('focus', this._handleInputKeyupAndFocusBound);
                this.el.removeEventListener('keydown', this._handleInputKeydownBound);
                this.el.removeEventListener('click', this._handleInputClickBound);
                this.container.removeEventListener('mousedown', this._handleContainerMousedownAndTouchstartBound);
                this.container.removeEventListener('mouseup', this._handleContainerMouseupAndTouchendBound);

                if (typeof window.ontouchstart !== 'undefined') {
                    this.container.removeEventListener('touchstart', this._handleContainerMousedownAndTouchstartBound);
                    this.container.removeEventListener('touchend', this._handleContainerMouseupAndTouchendBound);
                }
            }

            /**
             * Setup dropdown
             */

        }, {
            key: "_setupDropdown",
            value: function _setupDropdown() {
                var _this38 = this;

                this.container = document.createElement('ul');
                this.container.id = "autocomplete-options-" + M.guid();
                $(this.container).addClass('autocomplete-content dropdown-content');
                this.$inputField.append(this.container);
                this.el.setAttribute('data-target', this.container.id);

                this.dropdown = M.Dropdown.init(this.el, {
                    autoFocus: false,
                    closeOnClick: false,
                    coverTrigger: false,
                    onItemClick: function (itemEl) {
                        _this38.selectOption($(itemEl));
                    }
                });

                // Sketchy removal of dropdown click handler
                this.el.removeEventListener('click', this.dropdown._handleClickBound);
            }

            /**
             * Remove dropdown
             */

        }, {
            key: "_removeDropdown",
            value: function _removeDropdown() {
                this.container.parentNode.removeChild(this.container);
            }

            /**
             * Handle Input Blur
             */

        }, {
            key: "_handleInputBlur",
            value: function _handleInputBlur() {
                if (!this._mousedown) {
                    this.close();
                    this._resetAutocomplete();
                }
            }

            /**
             * Handle Input Keyup and Focus
             * @param {Event} e
             */

        }, {
            key: "_handleInputKeyupAndFocus",
            value: function _handleInputKeyupAndFocus(e) {
                if (e.type === 'keyup') {
                    Autocomplete._keydown = false;
                }

                this.count = 0;
                var val = this.el.value.toLowerCase();

                // Don't capture enter or arrow key usage.
                if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40) {
                    return;
                }

                // Check if the input isn't empty
                // Check if focus triggered by tab
                if (this.oldVal !== val && (M.tabPressed || e.type !== 'focus')) {
                    this.open();
                }

                // Update oldVal
                this.oldVal = val;
            }

            /**
             * Handle Input Keydown
             * @param {Event} e
             */

        }, {
            key: "_handleInputKeydown",
            value: function _handleInputKeydown(e) {
                Autocomplete._keydown = true;

                // Arrow keys and enter key usage
                var keyCode = e.keyCode,
                    liElement = void 0,
                    numItems = $(this.container).children('li').length;

                // select element on Enter
                if (keyCode === M.keys.ENTER && this.activeIndex >= 0) {
                    liElement = $(this.container).children('li').eq(this.activeIndex);
                    if (liElement.length) {
                        this.selectOption(liElement);
                        e.preventDefault();
                    }
                    return;
                }

                // Capture up and down key
                if (keyCode === M.keys.ARROW_UP || keyCode === M.keys.ARROW_DOWN) {
                    e.preventDefault();

                    if (keyCode === M.keys.ARROW_UP && this.activeIndex > 0) {
                        this.activeIndex--;
                    }

                    if (keyCode === M.keys.ARROW_DOWN && this.activeIndex < numItems - 1) {
                        this.activeIndex++;
                    }

                    this.$active.removeClass('active');
                    if (this.activeIndex >= 0) {
                        this.$active = $(this.container).children('li').eq(this.activeIndex);
                        this.$active.addClass('active');
                    }
                }
            }

            /**
             * Handle Input Click
             * @param {Event} e
             */

        }, {
            key: "_handleInputClick",
            value: function _handleInputClick(e) {
                this.open();
            }

            /**
             * Handle Container Mousedown and Touchstart
             * @param {Event} e
             */

        }, {
            key: "_handleContainerMousedownAndTouchstart",
            value: function _handleContainerMousedownAndTouchstart(e) {
                this._mousedown = true;
            }

            /**
             * Handle Container Mouseup and Touchend
             * @param {Event} e
             */

        }, {
            key: "_handleContainerMouseupAndTouchend",
            value: function _handleContainerMouseupAndTouchend(e) {
                this._mousedown = false;
            }

            /**
             * Highlight partial match
             */

        }, {
            key: "_highlight",
            value: function _highlight(string, $el) {
                var img = $el.find('img');
                var matchStart = $el.text().toLowerCase().indexOf('' + string.toLowerCase() + ''),
                    matchEnd = matchStart + string.length - 1,
                    beforeMatch = $el.text().slice(0, matchStart),
                    matchText = $el.text().slice(matchStart, matchEnd + 1),
                    afterMatch = $el.text().slice(matchEnd + 1);
                $el.html("<span>" + beforeMatch + "<span class='highlight'>" + matchText + "</span>" + afterMatch + "</span>");
                if (img.length) {
                    $el.prepend(img);
                }
            }

            /**
             * Reset current element position
             */

        }, {
            key: "_resetCurrentElement",
            value: function _resetCurrentElement() {
                this.activeIndex = -1;
                this.$active.removeClass('active');
            }

            /**
             * Reset autocomplete elements
             */

        }, {
            key: "_resetAutocomplete",
            value: function _resetAutocomplete() {
                $(this.container).empty();
                this._resetCurrentElement();
                this.oldVal = null;
                this.isOpen = false;
                this._mousedown = false;
            }

            /**
             * Select autocomplete option
             * @param {Element} el  Autocomplete option list item element
             */

        }, {
            key: "selectOption",
            value: function selectOption(el) {
                var text = el.text().trim();
                this.el.value = text;
                this.$el.trigger('change');
                this._resetAutocomplete();
                this.close();

                // Handle onAutocomplete callback.
                if (typeof this.options.onAutocomplete === 'function') {
                    this.options.onAutocomplete.call(this, text);
                }
            }

            /**
             * Render dropdown content
             * @param {Object} data  data set
             * @param {String} val  current input value
             */

        }, {
            key: "_renderDropdown",
            value: function _renderDropdown(data, val) {
                var _this39 = this;

                this._resetAutocomplete();

                var matchingData = [];

                // Gather all matching data
                for (var key in data) {
                    if (data.hasOwnProperty(key) && key.toLowerCase().indexOf(val) !== -1) {
                        // Break if past limit
                        if (this.count >= this.options.limit) {
                            break;
                        }

                        var entry = {
                            data: data[key],
                            key: key
                        };
                        matchingData.push(entry);

                        this.count++;
                    }
                }

                // Sort
                if (this.options.sortFunction) {
                    var sortFunctionBound = function (a, b) {
                        return _this39.options.sortFunction(a.key.toLowerCase(), b.key.toLowerCase(), val.toLowerCase());
                    };
                    matchingData.sort(sortFunctionBound);
                }

                // Render
                for (var i = 0; i < matchingData.length; i++) {
                    var _entry = matchingData[i];
                    var $autocompleteOption = $('<li></li>');
                    if (!!_entry.data) {
                        $autocompleteOption.append("<img src=\"" + _entry.data + "\" class=\"right circle\"><span>" + _entry.key + "</span>");
                    } else {
                        $autocompleteOption.append('<span>' + _entry.key + '</span>');
                    }

                    $(this.container).append($autocompleteOption);
                    this._highlight(val, $autocompleteOption);
                }
            }

            /**
             * Open Autocomplete Dropdown
             */

        }, {
            key: "open",
            value: function open() {
                var val = this.el.value.toLowerCase();

                this._resetAutocomplete();

                if (val.length >= this.options.minLength) {
                    this.isOpen = true;
                    this._renderDropdown(this.options.data, val);
                }

                // Open dropdown
                if (!this.dropdown.isOpen) {
                    this.dropdown.open();
                } else {
                    // Recalculate dropdown when its already open
                    this.dropdown.recalculateDimensions();
                }
            }

            /**
             * Close Autocomplete Dropdown
             */

        }, {
            key: "close",
            value: function close() {
                this.dropdown.close();
            }

            /**
             * Update Data
             * @param {Object} data
             */

        }, {
            key: "updateData",
            value: function updateData(data) {
                var val = this.el.value.toLowerCase();
                this.options.data = data;

                if (this.isOpen) {
                    this._renderDropdown(data, val);
                }
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Autocomplete.__proto__ || Object.getPrototypeOf(Autocomplete), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Autocomplete;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Autocomplete;
    }(Component);

    /**
     * @static
     * @memberof Autocomplete
     */


    Autocomplete._keydown = false;

    M.Autocomplete = Autocomplete;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Autocomplete, 'autocomplete', 'M_Autocomplete');
    }
})(cash);
; (function ($) {
    // Function to update labels of text fields
    M.updateTextFields = function () {
        var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';
        $(input_selector).each(function (element, index) {
            var $this = $(this);
            if (element.value.length > 0 || $(element).is(':focus') || element.autofocus || $this.attr('placeholder') !== null) {
                $this.siblings('label').addClass('active');
            } else if (element.validity) {
                $this.siblings('label').toggleClass('active', element.validity.badInput === true);
            } else {
                $this.siblings('label').removeClass('active');
            }
        });
    };

    M.validate_field = function (object) {
        var hasLength = object.attr('data-length') !== null;
        var lenAttr = parseInt(object.attr('data-length'));
        var len = object[0].value.length;

        if (len === 0 && object[0].validity.badInput === false && !object.is(':required')) {
            if (object.hasClass('validate')) {
                object.removeClass('valid');
                object.removeClass('invalid');
            }
        } else {
            if (object.hasClass('validate')) {
                // Check for character counter attributes
                if (object.is(':valid') && hasLength && len <= lenAttr || object.is(':valid') && !hasLength) {
                    object.removeClass('invalid');
                    object.addClass('valid');
                } else {
                    object.removeClass('valid');
                    object.addClass('invalid');
                }
            }
        }
    };

    M.textareaAutoResize = function ($textarea) {
        // Wrap if native element
        if ($textarea instanceof Element) {
            $textarea = $($textarea);
        }

        if (!$textarea.length) {
            console.error('No textarea element found');
            return;
        }

        // Textarea Auto Resize
        var hiddenDiv = $('.hiddendiv').first();
        if (!hiddenDiv.length) {
            hiddenDiv = $('<div class="hiddendiv common"></div>');
            $('body').append(hiddenDiv);
        }

        // Set font properties of hiddenDiv
        var fontFamily = $textarea.css('font-family');
        var fontSize = $textarea.css('font-size');
        var lineHeight = $textarea.css('line-height');

        // Firefox can't handle padding shorthand.
        var paddingTop = $textarea.css('padding-top');
        var paddingRight = $textarea.css('padding-right');
        var paddingBottom = $textarea.css('padding-bottom');
        var paddingLeft = $textarea.css('padding-left');

        if (fontSize) {
            hiddenDiv.css('font-size', fontSize);
        }
        if (fontFamily) {
            hiddenDiv.css('font-family', fontFamily);
        }
        if (lineHeight) {
            hiddenDiv.css('line-height', lineHeight);
        }
        if (paddingTop) {
            hiddenDiv.css('padding-top', paddingTop);
        }
        if (paddingRight) {
            hiddenDiv.css('padding-right', paddingRight);
        }
        if (paddingBottom) {
            hiddenDiv.css('padding-bottom', paddingBottom);
        }
        if (paddingLeft) {
            hiddenDiv.css('padding-left', paddingLeft);
        }

        // Set original-height, if none
        if (!$textarea.data('original-height')) {
            $textarea.data('original-height', $textarea.height());
        }

        if ($textarea.attr('wrap') === 'off') {
            hiddenDiv.css('overflow-wrap', 'normal').css('white-space', 'pre');
        }

        hiddenDiv.text($textarea[0].value + '\n');
        var content = hiddenDiv.html().replace(/\n/g, '<br>');
        hiddenDiv.html(content);

        // When textarea is hidden, width goes crazy.
        // Approximate with half of window size

        if ($textarea[0].offsetWidth > 0 && $textarea[0].offsetHeight > 0) {
            hiddenDiv.css('width', $textarea.width() + 'px');
        } else {
            hiddenDiv.css('width', window.innerWidth / 2 + 'px');
        }

        /**
         * Resize if the new height is greater than the
         * original height of the textarea
         */
        if ($textarea.data('original-height') <= hiddenDiv.innerHeight()) {
            $textarea.css('height', hiddenDiv.innerHeight() + 'px');
        } else if ($textarea[0].value.length < $textarea.data('previous-length')) {
            /**
             * In case the new height is less than original height, it
             * means the textarea has less text than before
             * So we set the height to the original one
             */
            $textarea.css('height', $textarea.data('original-height') + 'px');
        }
        $textarea.data('previous-length', $textarea[0].value.length);
    };

    $(document).ready(function () {
        // Text based inputs
        var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';

        // Add active if form auto complete
        $(document).on('change', input_selector, function () {
            if (this.value.length !== 0 || $(this).attr('placeholder') !== null) {
                $(this).siblings('label').addClass('active');
            }
            M.validate_field($(this));
        });

        // Add active if input element has been pre-populated on document ready
        $(document).ready(function () {
            M.updateTextFields();
        });

        // HTML DOM FORM RESET handling
        $(document).on('reset', function (e) {
            var formReset = $(e.target);
            if (formReset.is('form')) {
                formReset.find(input_selector).removeClass('valid').removeClass('invalid');
                formReset.find(input_selector).each(function (e) {
                    if (this.value.length) {
                        $(this).siblings('label').removeClass('active');
                    }
                });

                // Reset select (after native reset)
                setTimeout(function () {
                    formReset.find('select').each(function () {
                        // check if initialized
                        if (this.M_FormSelect) {
                            $(this).trigger('change');
                        }
                    });
                }, 0);
            }
        });

        /**
         * Add active when element has focus
         * @param {Event} e
         */
        document.addEventListener('focus', function (e) {
            if ($(e.target).is(input_selector)) {
                $(e.target).siblings('label, .prefix').addClass('active');
            }
        }, true);

        /**
         * Remove active when element is blurred
         * @param {Event} e
         */
        document.addEventListener('blur', function (e) {
            var $inputElement = $(e.target);
            if ($inputElement.is(input_selector)) {
                var selector = '.prefix';

                if ($inputElement[0].value.length === 0 && $inputElement[0].validity.badInput !== true && $inputElement.attr('placeholder') === null) {
                    selector += ', label';
                }
                $inputElement.siblings(selector).removeClass('active');
                M.validate_field($inputElement);
            }
        }, true);

        // Radio and Checkbox focus class
        var radio_checkbox = 'input[type=radio], input[type=checkbox]';
        $(document).on('keyup', radio_checkbox, function (e) {
            // TAB, check if tabbing to radio or checkbox.
            if (e.which === M.keys.TAB) {
                $(this).addClass('tabbed');
                var $this = $(this);
                $this.one('blur', function (e) {
                    $(this).removeClass('tabbed');
                });
                return;
            }
        });

        var text_area_selector = '.materialize-textarea';
        $(text_area_selector).each(function () {
            var $textarea = $(this);
            /**
             * Resize textarea on document load after storing
             * the original height and the original length
             */
            $textarea.data('original-height', $textarea.height());
            $textarea.data('previous-length', this.value.length);
            M.textareaAutoResize($textarea);
        });

        $(document).on('keyup', text_area_selector, function () {
            M.textareaAutoResize($(this));
        });
        $(document).on('keydown', text_area_selector, function () {
            M.textareaAutoResize($(this));
        });

        // File Input Path
        $(document).on('change', '.file-field input[type="file"]', function () {
            var file_field = $(this).closest('.file-field');
            var path_input = file_field.find('input.file-path');
            var files = $(this)[0].files;
            var file_names = [];
            for (var i = 0; i < files.length; i++) {
                file_names.push(files[i].name);
            }
            path_input[0].value = file_names.join(', ');
            path_input.trigger('change');
        });
    }); // End of $(document).ready
})(cash);
; (function ($, anim) {
    'use strict';

    var _defaults = {
        indicators: true,
        height: 400,
        duration: 500,
        interval: 6000
    };

    /**
     * @class
     *
     */

    var Slider = function (_Component11) {
        _inherits(Slider, _Component11);

        /**
         * Construct Slider instance and set up overlay
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Slider(el, options) {
            _classCallCheck(this, Slider);

            var _this40 = _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, Slider, el, options));

            _this40.el.M_Slider = _this40;

            /**
             * Options for the modal
             * @member Slider#options
             * @prop {Boolean} [indicators=true] - Show indicators
             * @prop {Number} [height=400] - height of slider
             * @prop {Number} [duration=500] - Length in ms of slide transition
             * @prop {Number} [interval=6000] - Length in ms of slide interval
             */
            _this40.options = $.extend({}, Slider.defaults, options);

            // setup
            _this40.$slider = _this40.$el.find('.slides');
            _this40.$slides = _this40.$slider.children('li');
            _this40.activeIndex = _this40.$slides.filter(function (item) {
                return $(item).hasClass('active');
            }).first().index();
            if (_this40.activeIndex != -1) {
                _this40.$active = _this40.$slides.eq(_this40.activeIndex);
            }

            _this40._setSliderHeight();

            // Set initial positions of captions
            _this40.$slides.find('.caption').each(function (el) {
                _this40._animateCaptionIn(el, 0);
            });

            // Move img src into background-image
            _this40.$slides.find('img').each(function (el) {
                var placeholderBase64 = 'data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
                if ($(el).attr('src') !== placeholderBase64) {
                    $(el).css('background-image', 'url("' + $(el).attr('src') + '")');
                    $(el).attr('src', placeholderBase64);
                }
            });

            _this40._setupIndicators();

            // Show active slide
            if (_this40.$active) {
                _this40.$active.css('display', 'block');
            } else {
                _this40.$slides.first().addClass('active');
                anim({
                    targets: _this40.$slides.first()[0],
                    opacity: 1,
                    duration: _this40.options.duration,
                    easing: 'easeOutQuad'
                });

                _this40.activeIndex = 0;
                _this40.$active = _this40.$slides.eq(_this40.activeIndex);

                // Update indicators
                if (_this40.options.indicators) {
                    _this40.$indicators.eq(_this40.activeIndex).addClass('active');
                }
            }

            // Adjust height to current slide
            _this40.$active.find('img').each(function (el) {
                anim({
                    targets: _this40.$active.find('.caption')[0],
                    opacity: 1,
                    translateX: 0,
                    translateY: 0,
                    duration: _this40.options.duration,
                    easing: 'easeOutQuad'
                });
            });

            _this40._setupEventHandlers();

            // auto scroll
            _this40.start();
            return _this40;
        }

        _createClass(Slider, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this.pause();
                this._removeIndicators();
                this._removeEventHandlers();
                this.el.M_Slider = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                var _this41 = this;

                this._handleIntervalBound = this._handleInterval.bind(this);
                this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);

                if (this.options.indicators) {
                    this.$indicators.each(function (el) {
                        el.addEventListener('click', _this41._handleIndicatorClickBound);
                    });
                }
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                var _this42 = this;

                if (this.options.indicators) {
                    this.$indicators.each(function (el) {
                        el.removeEventListener('click', _this42._handleIndicatorClickBound);
                    });
                }
            }

            /**
             * Handle indicator click
             * @param {Event} e
             */

        }, {
            key: "_handleIndicatorClick",
            value: function _handleIndicatorClick(e) {
                var currIndex = $(e.target).index();
                this.set(currIndex);
            }

            /**
             * Handle Interval
             */

        }, {
            key: "_handleInterval",
            value: function _handleInterval() {
                var newActiveIndex = this.$slider.find('.active').index();
                if (this.$slides.length === newActiveIndex + 1) newActiveIndex = 0;
                // loop to start
                else newActiveIndex += 1;

                this.set(newActiveIndex);
            }

            /**
             * Animate in caption
             * @param {Element} caption
             * @param {Number} duration
             */

        }, {
            key: "_animateCaptionIn",
            value: function _animateCaptionIn(caption, duration) {
                var animOptions = {
                    targets: caption,
                    opacity: 0,
                    duration: duration,
                    easing: 'easeOutQuad'
                };

                if ($(caption).hasClass('center-align')) {
                    animOptions.translateY = -100;
                } else if ($(caption).hasClass('right-align')) {
                    animOptions.translateX = 100;
                } else if ($(caption).hasClass('left-align')) {
                    animOptions.translateX = -100;
                }

                anim(animOptions);
            }

            /**
             * Set height of slider
             */

        }, {
            key: "_setSliderHeight",
            value: function _setSliderHeight() {
                // If fullscreen, do nothing
                if (!this.$el.hasClass('fullscreen')) {
                    if (this.options.indicators) {
                        // Add height if indicators are present
                        this.$el.css('height', this.options.height + 40 + 'px');
                    } else {
                        this.$el.css('height', this.options.height + 'px');
                    }
                    this.$slider.css('height', this.options.height + 'px');
                }
            }

            /**
             * Setup indicators
             */

        }, {
            key: "_setupIndicators",
            value: function _setupIndicators() {
                var _this43 = this;

                if (this.options.indicators) {
                    this.$indicators = $('<ul class="indicators"></ul>');
                    this.$slides.each(function (el, index) {
                        var $indicator = $('<li class="indicator-item"></li>');
                        _this43.$indicators.append($indicator[0]);
                    });
                    this.$el.append(this.$indicators[0]);
                    this.$indicators = this.$indicators.children('li.indicator-item');
                }
            }

            /**
             * Remove indicators
             */

        }, {
            key: "_removeIndicators",
            value: function _removeIndicators() {
                this.$el.find('ul.indicators').remove();
            }

            /**
             * Cycle to nth item
             * @param {Number} index
             */

        }, {
            key: "set",
            value: function set(index) {
                var _this44 = this;

                // Wrap around indices.
                if (index >= this.$slides.length) index = 0; else if (index < 0) index = this.$slides.length - 1;

                // Only do if index changes
                if (this.activeIndex != index) {
                    this.$active = this.$slides.eq(this.activeIndex);
                    var $caption = this.$active.find('.caption');
                    this.$active.removeClass('active');

                    anim({
                        targets: this.$active[0],
                        opacity: 0,
                        duration: this.options.duration,
                        easing: 'easeOutQuad',
                        complete: function () {
                            _this44.$slides.not('.active').each(function (el) {
                                anim({
                                    targets: el,
                                    opacity: 0,
                                    translateX: 0,
                                    translateY: 0,
                                    duration: 0,
                                    easing: 'easeOutQuad'
                                });
                            });
                        }
                    });

                    this._animateCaptionIn($caption[0], this.options.duration);

                    // Update indicators
                    if (this.options.indicators) {
                        this.$indicators.eq(this.activeIndex).removeClass('active');
                        this.$indicators.eq(index).addClass('active');
                    }

                    anim({
                        targets: this.$slides.eq(index)[0],
                        opacity: 1,
                        duration: this.options.duration,
                        easing: 'easeOutQuad'
                    });

                    anim({
                        targets: this.$slides.eq(index).find('.caption')[0],
                        opacity: 1,
                        translateX: 0,
                        translateY: 0,
                        duration: this.options.duration,
                        delay: this.options.duration,
                        easing: 'easeOutQuad'
                    });

                    this.$slides.eq(index).addClass('active');
                    this.activeIndex = index;

                    // Reset interval
                    this.start();
                }
            }

            /**
             * Pause slider interval
             */

        }, {
            key: "pause",
            value: function pause() {
                clearInterval(this.interval);
            }

            /**
             * Start slider interval
             */

        }, {
            key: "start",
            value: function start() {
                clearInterval(this.interval);
                this.interval = setInterval(this._handleIntervalBound, this.options.duration + this.options.interval);
            }

            /**
             * Move to next slide
             */

        }, {
            key: "next",
            value: function next() {
                var newIndex = this.activeIndex + 1;

                // Wrap around indices.
                if (newIndex >= this.$slides.length) newIndex = 0; else if (newIndex < 0) newIndex = this.$slides.length - 1;

                this.set(newIndex);
            }

            /**
             * Move to previous slide
             */

        }, {
            key: "prev",
            value: function prev() {
                var newIndex = this.activeIndex - 1;

                // Wrap around indices.
                if (newIndex >= this.$slides.length) newIndex = 0; else if (newIndex < 0) newIndex = this.$slides.length - 1;

                this.set(newIndex);
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Slider.__proto__ || Object.getPrototypeOf(Slider), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Slider;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Slider;
    }(Component);

    M.Slider = Slider;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Slider, 'slider', 'M_Slider');
    }
})(cash, M.anime);
; (function ($, anim) {
    $(document).on('click', '.card', function (e) {
        if ($(this).children('.card-reveal').length) {
            var $card = $(e.target).closest('.card');
            if ($card.data('initialOverflow') === undefined) {
                $card.data('initialOverflow', $card.css('overflow') === undefined ? '' : $card.css('overflow'));
            }
            var $cardReveal = $(this).find('.card-reveal');
            if ($(e.target).is($('.card-reveal .card-title')) || $(e.target).is($('.card-reveal .card-title i'))) {
                // Make Reveal animate down and display none
                anim({
                    targets: $cardReveal[0],
                    translateY: 0,
                    duration: 225,
                    easing: 'easeInOutQuad',
                    complete: function (anim) {
                        var el = anim.animatables[0].target;
                        $(el).css({ display: 'none' });
                        $card.css('overflow', $card.data('initialOverflow'));
                    }
                });
            } else if ($(e.target).is($('.card .activator')) || $(e.target).is($('.card .activator i'))) {
                $card.css('overflow', 'hidden');
                $cardReveal.css({ display: 'block' });
                anim({
                    targets: $cardReveal[0],
                    translateY: '-100%',
                    duration: 300,
                    easing: 'easeInOutQuad'
                });
            }
        }
    });
})(cash, M.anime);
; (function ($) {
    'use strict';

    var _defaults = {
        data: [],
        placeholder: '',
        secondaryPlaceholder: '',
        autocompleteOptions: {},
        limit: Infinity,
        onChipAdd: null,
        onChipSelect: null,
        onChipDelete: null
    };

    /**
     * @typedef {Object} chip
     * @property {String} tag  chip tag string
     * @property {String} [image]  chip avatar image string
     */

    /**
     * @class
     *
     */

    var Chips = function (_Component12) {
        _inherits(Chips, _Component12);

        /**
         * Construct Chips instance and set up overlay
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Chips(el, options) {
            _classCallCheck(this, Chips);

            var _this45 = _possibleConstructorReturn(this, (Chips.__proto__ || Object.getPrototypeOf(Chips)).call(this, Chips, el, options));

            _this45.el.M_Chips = _this45;

            /**
             * Options for the modal
             * @member Chips#options
             * @prop {Array} data
             * @prop {String} placeholder
             * @prop {String} secondaryPlaceholder
             * @prop {Object} autocompleteOptions
             */
            _this45.options = $.extend({}, Chips.defaults, options);

            _this45.$el.addClass('chips input-field');
            _this45.chipsData = [];
            _this45.$chips = $();
            _this45._setupInput();
            _this45.hasAutocomplete = Object.keys(_this45.options.autocompleteOptions).length > 0;

            // Set input id
            if (!_this45.$input.attr('id')) {
                _this45.$input.attr('id', M.guid());
            }

            // Render initial chips
            if (_this45.options.data.length) {
                _this45.chipsData = _this45.options.data;
                _this45._renderChips(_this45.chipsData);
            }

            // Setup autocomplete if needed
            if (_this45.hasAutocomplete) {
                _this45._setupAutocomplete();
            }

            _this45._setPlaceholder();
            _this45._setupLabel();
            _this45._setupEventHandlers();
            return _this45;
        }

        _createClass(Chips, [{
            key: "getData",


            /**
             * Get Chips Data
             */
            value: function getData() {
                return this.chipsData;
            }

            /**
             * Teardown component
             */

        }, {
            key: "destroy",
            value: function destroy() {
                this._removeEventHandlers();
                this.$chips.remove();
                this.el.M_Chips = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleChipClickBound = this._handleChipClick.bind(this);
                this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
                this._handleInputFocusBound = this._handleInputFocus.bind(this);
                this._handleInputBlurBound = this._handleInputBlur.bind(this);

                this.el.addEventListener('click', this._handleChipClickBound);
                document.addEventListener('keydown', Chips._handleChipsKeydown);
                document.addEventListener('keyup', Chips._handleChipsKeyup);
                this.el.addEventListener('blur', Chips._handleChipsBlur, true);
                this.$input[0].addEventListener('focus', this._handleInputFocusBound);
                this.$input[0].addEventListener('blur', this._handleInputBlurBound);
                this.$input[0].addEventListener('keydown', this._handleInputKeydownBound);
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.el.removeEventListener('click', this._handleChipClickBound);
                document.removeEventListener('keydown', Chips._handleChipsKeydown);
                document.removeEventListener('keyup', Chips._handleChipsKeyup);
                this.el.removeEventListener('blur', Chips._handleChipsBlur, true);
                this.$input[0].removeEventListener('focus', this._handleInputFocusBound);
                this.$input[0].removeEventListener('blur', this._handleInputBlurBound);
                this.$input[0].removeEventListener('keydown', this._handleInputKeydownBound);
            }

            /**
             * Handle Chip Click
             * @param {Event} e
             */

        }, {
            key: "_handleChipClick",
            value: function _handleChipClick(e) {
                var $chip = $(e.target).closest('.chip');
                var clickedClose = $(e.target).is('.close');
                if ($chip.length) {
                    var index = $chip.index();
                    if (clickedClose) {
                        // delete chip
                        this.deleteChip(index);
                        this.$input[0].focus();
                    } else {
                        // select chip
                        this.selectChip(index);
                    }

                    // Default handle click to focus on input
                } else {
                    this.$input[0].focus();
                }
            }

            /**
             * Handle Chips Keydown
             * @param {Event} e
             */

        }, {
            key: "_handleInputFocus",


            /**
             * Handle Input Focus
             */
            value: function _handleInputFocus() {
                this.$el.addClass('focus');
            }

            /**
             * Handle Input Blur
             */

        }, {
            key: "_handleInputBlur",
            value: function _handleInputBlur() {
                this.$el.removeClass('focus');
            }

            /**
             * Handle Input Keydown
             * @param {Event} e
             */

        }, {
            key: "_handleInputKeydown",
            value: function _handleInputKeydown(e) {
                Chips._keydown = true;

                // enter
                if (e.keyCode === 13) {
                    // Override enter if autocompleting.
                    if (this.hasAutocomplete && this.autocomplete && this.autocomplete.isOpen) {
                        return;
                    }

                    e.preventDefault();
                    this.addChip({
                        tag: this.$input[0].value
                    });
                    this.$input[0].value = '';

                    // delete or left
                } else if ((e.keyCode === 8 || e.keyCode === 37) && this.$input[0].value === '' && this.chipsData.length) {
                    e.preventDefault();
                    this.selectChip(this.chipsData.length - 1);
                }
            }

            /**
             * Render Chip
             * @param {chip} chip
             * @return {Element}
             */

        }, {
            key: "_renderChip",
            value: function _renderChip(chip) {
                if (!chip.tag) {
                    return;
                }

                var renderedChip = document.createElement('div');
                var closeIcon = document.createElement('i');
                renderedChip.classList.add('chip');
                renderedChip.textContent = chip.tag;
                renderedChip.setAttribute('tabindex', 0);
                $(closeIcon).addClass('material-icons close');
                closeIcon.textContent = 'close';

                // attach image if needed
                if (chip.image) {
                    var img = document.createElement('img');
                    img.setAttribute('src', chip.image);
                    renderedChip.insertBefore(img, renderedChip.firstChild);
                }

                renderedChip.appendChild(closeIcon);
                return renderedChip;
            }

            /**
             * Render Chips
             */

        }, {
            key: "_renderChips",
            value: function _renderChips() {
                this.$chips.remove();
                for (var i = 0; i < this.chipsData.length; i++) {
                    var chipEl = this._renderChip(this.chipsData[i]);
                    this.$el.append(chipEl);
                    this.$chips.add(chipEl);
                }

                // move input to end
                this.$el.append(this.$input[0]);
            }

            /**
             * Setup Autocomplete
             */

        }, {
            key: "_setupAutocomplete",
            value: function _setupAutocomplete() {
                var _this46 = this;

                this.options.autocompleteOptions.onAutocomplete = function (val) {
                    _this46.addChip({
                        tag: val
                    });
                    _this46.$input[0].value = '';
                    _this46.$input[0].focus();
                };

                this.autocomplete = M.Autocomplete.init(this.$input[0], this.options.autocompleteOptions);
            }

            /**
             * Setup Input
             */

        }, {
            key: "_setupInput",
            value: function _setupInput() {
                this.$input = this.$el.find('input');
                if (!this.$input.length) {
                    this.$input = $('<input></input>');
                    this.$el.append(this.$input);
                }

                this.$input.addClass('input');
            }

            /**
             * Setup Label
             */

        }, {
            key: "_setupLabel",
            value: function _setupLabel() {
                this.$label = this.$el.find('label');
                if (this.$label.length) {
                    this.$label.setAttribute('for', this.$input.attr('id'));
                }
            }

            /**
             * Set placeholder
             */

        }, {
            key: "_setPlaceholder",
            value: function _setPlaceholder() {
                if (this.chipsData !== undefined && !this.chipsData.length && this.options.placeholder) {
                    $(this.$input).prop('placeholder', this.options.placeholder);
                } else if ((this.chipsData === undefined || !!this.chipsData.length) && this.options.secondaryPlaceholder) {
                    $(this.$input).prop('placeholder', this.options.secondaryPlaceholder);
                }
            }

            /**
             * Check if chip is valid
             * @param {chip} chip
             */

        }, {
            key: "_isValid",
            value: function _isValid(chip) {
                if (chip.hasOwnProperty('tag') && chip.tag !== '') {
                    var exists = false;
                    for (var i = 0; i < this.chipsData.length; i++) {
                        if (this.chipsData[i].tag === chip.tag) {
                            exists = true;
                            break;
                        }
                    }
                    return !exists;
                }

                return false;
            }

            /**
             * Add chip
             * @param {chip} chip
             */

        }, {
            key: "addChip",
            value: function addChip(chip) {
                if (!this._isValid(chip) || this.chipsData.length >= this.options.limit) {
                    return;
                }

                var renderedChip = this._renderChip(chip);
                this.$chips.add(renderedChip);
                this.chipsData.push(chip);
                $(this.$input).before(renderedChip);
                this._setPlaceholder();

                // fire chipAdd callback
                if (typeof this.options.onChipAdd === 'function') {
                    this.options.onChipAdd.call(this, this.$el, renderedChip);
                }
            }

            /**
             * Delete chip
             * @param {Number} chip
             */

        }, {
            key: "deleteChip",
            value: function deleteChip(chipIndex) {
                var $chip = this.$chips.eq(chipIndex);
                this.$chips.eq(chipIndex).remove();
                this.$chips = this.$chips.filter(function (el) {
                    return $(el).index() >= 0;
                });
                this.chipsData.splice(chipIndex, 1);
                this._setPlaceholder();

                // fire chipDelete callback
                if (typeof this.options.onChipDelete === 'function') {
                    this.options.onChipDelete.call(this, this.$el, $chip[0]);
                }
            }

            /**
             * Select chip
             * @param {Number} chip
             */

        }, {
            key: "selectChip",
            value: function selectChip(chipIndex) {
                var $chip = this.$chips.eq(chipIndex);
                this._selectedChip = $chip;
                $chip[0].focus();

                // fire chipSelect callback
                if (typeof this.options.onChipSelect === 'function') {
                    this.options.onChipSelect.call(this, this.$el, $chip[0]);
                }
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Chips.__proto__ || Object.getPrototypeOf(Chips), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Chips;
            }
        }, {
            key: "_handleChipsKeydown",
            value: function _handleChipsKeydown(e) {
                Chips._keydown = true;

                var $chips = $(e.target).closest('.chips');
                var chipsKeydown = e.target && $chips.length;

                // Don't handle keydown inputs on input and textarea
                if ($(e.target).is('input, textarea') || !chipsKeydown) {
                    return;
                }

                var currChips = $chips[0].M_Chips;

                // backspace and delete
                if (e.keyCode === 8 || e.keyCode === 46) {
                    e.preventDefault();

                    var selectIndex = currChips.chipsData.length;
                    if (currChips._selectedChip) {
                        var index = currChips._selectedChip.index();
                        currChips.deleteChip(index);
                        currChips._selectedChip = null;

                        // Make sure selectIndex doesn't go negative
                        selectIndex = Math.max(index - 1, 0);
                    }

                    if (currChips.chipsData.length) {
                        currChips.selectChip(selectIndex);
                    }

                    // left arrow key
                } else if (e.keyCode === 37) {
                    if (currChips._selectedChip) {
                        var _selectIndex = currChips._selectedChip.index() - 1;
                        if (_selectIndex < 0) {
                            return;
                        }
                        currChips.selectChip(_selectIndex);
                    }

                    // right arrow key
                } else if (e.keyCode === 39) {
                    if (currChips._selectedChip) {
                        var _selectIndex2 = currChips._selectedChip.index() + 1;

                        if (_selectIndex2 >= currChips.chipsData.length) {
                            currChips.$input[0].focus();
                        } else {
                            currChips.selectChip(_selectIndex2);
                        }
                    }
                }
            }

            /**
             * Handle Chips Keyup
             * @param {Event} e
             */

        }, {
            key: "_handleChipsKeyup",
            value: function _handleChipsKeyup(e) {
                Chips._keydown = false;
            }

            /**
             * Handle Chips Blur
             * @param {Event} e
             */

        }, {
            key: "_handleChipsBlur",
            value: function _handleChipsBlur(e) {
                if (!Chips._keydown) {
                    var $chips = $(e.target).closest('.chips');
                    var currChips = $chips[0].M_Chips;

                    currChips._selectedChip = null;
                }
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Chips;
    }(Component);

    /**
     * @static
     * @memberof Chips
     */


    Chips._keydown = false;

    M.Chips = Chips;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Chips, 'chips', 'M_Chips');
    }

    $(document).ready(function () {
        // Handle removal of static chips.
        $(document.body).on('click', '.chip .close', function () {
            var $chips = $(this).closest('.chips');
            if ($chips.length && $chips[0].M_Chips) {
                return;
            }
            $(this).closest('.chip').remove();
        });
    });
})(cash);
; (function ($) {
    'use strict';

    var _defaults = {
        top: 0,
        bottom: Infinity,
        offset: 0,
        onPositionChange: null
    };

    /**
     * @class
     *
     */

    var Pushpin = function (_Component13) {
        _inherits(Pushpin, _Component13);

        /**
         * Construct Pushpin instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Pushpin(el, options) {
            _classCallCheck(this, Pushpin);

            var _this47 = _possibleConstructorReturn(this, (Pushpin.__proto__ || Object.getPrototypeOf(Pushpin)).call(this, Pushpin, el, options));

            _this47.el.M_Pushpin = _this47;

            /**
             * Options for the modal
             * @member Pushpin#options
             */
            _this47.options = $.extend({}, Pushpin.defaults, options);

            _this47.originalOffset = _this47.el.offsetTop;
            Pushpin._pushpins.push(_this47);
            _this47._setupEventHandlers();
            _this47._updatePosition();
            return _this47;
        }

        _createClass(Pushpin, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this.el.style.top = null;
                this._removePinClasses();
                this._removeEventHandlers();

                // Remove pushpin Inst
                var index = Pushpin._pushpins.indexOf(this);
                Pushpin._pushpins.splice(index, 1);
            }
        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                document.addEventListener('scroll', Pushpin._updateElements);
            }
        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                document.removeEventListener('scroll', Pushpin._updateElements);
            }
        }, {
            key: "_updatePosition",
            value: function _updatePosition() {
                var scrolled = M.getDocumentScrollTop() + this.options.offset;

                if (this.options.top <= scrolled && this.options.bottom >= scrolled && !this.el.classList.contains('pinned')) {
                    this._removePinClasses();
                    this.el.style.top = this.options.offset + "px";
                    this.el.classList.add('pinned');

                    // onPositionChange callback
                    if (typeof this.options.onPositionChange === 'function') {
                        this.options.onPositionChange.call(this, 'pinned');
                    }
                }

                // Add pin-top (when scrolled position is above top)
                if (scrolled < this.options.top && !this.el.classList.contains('pin-top')) {
                    this._removePinClasses();
                    this.el.style.top = 0;
                    this.el.classList.add('pin-top');

                    // onPositionChange callback
                    if (typeof this.options.onPositionChange === 'function') {
                        this.options.onPositionChange.call(this, 'pin-top');
                    }
                }

                // Add pin-bottom (when scrolled position is below bottom)
                if (scrolled > this.options.bottom && !this.el.classList.contains('pin-bottom')) {
                    this._removePinClasses();
                    this.el.classList.add('pin-bottom');
                    this.el.style.top = this.options.bottom - this.originalOffset + "px";

                    // onPositionChange callback
                    if (typeof this.options.onPositionChange === 'function') {
                        this.options.onPositionChange.call(this, 'pin-bottom');
                    }
                }
            }
        }, {
            key: "_removePinClasses",
            value: function _removePinClasses() {
                // IE 11 bug (can't remove multiple classes in one line)
                this.el.classList.remove('pin-top');
                this.el.classList.remove('pinned');
                this.el.classList.remove('pin-bottom');
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Pushpin.__proto__ || Object.getPrototypeOf(Pushpin), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Pushpin;
            }
        }, {
            key: "_updateElements",
            value: function _updateElements() {
                for (var elIndex in Pushpin._pushpins) {
                    var pInstance = Pushpin._pushpins[elIndex];
                    pInstance._updatePosition();
                }
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Pushpin;
    }(Component);

    /**
     * @static
     * @memberof Pushpin
     */


    Pushpin._pushpins = [];

    M.Pushpin = Pushpin;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Pushpin, 'pushpin', 'M_Pushpin');
    }
})(cash);
; (function ($, anim) {
    'use strict';

    var _defaults = {
        direction: 'top',
        hoverEnabled: true,
        toolbarEnabled: false
    };

    $.fn.reverse = [].reverse;

    /**
     * @class
     *
     */

    var FloatingActionButton = function (_Component14) {
        _inherits(FloatingActionButton, _Component14);

        /**
         * Construct FloatingActionButton instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function FloatingActionButton(el, options) {
            _classCallCheck(this, FloatingActionButton);

            var _this48 = _possibleConstructorReturn(this, (FloatingActionButton.__proto__ || Object.getPrototypeOf(FloatingActionButton)).call(this, FloatingActionButton, el, options));

            _this48.el.M_FloatingActionButton = _this48;

            /**
             * Options for the fab
             * @member FloatingActionButton#options
             * @prop {Boolean} [direction] - Direction fab menu opens
             * @prop {Boolean} [hoverEnabled=true] - Enable hover vs click
             * @prop {Boolean} [toolbarEnabled=false] - Enable toolbar transition
             */
            _this48.options = $.extend({}, FloatingActionButton.defaults, options);

            _this48.isOpen = false;
            _this48.$anchor = _this48.$el.children('a').first();
            _this48.$menu = _this48.$el.children('ul').first();
            _this48.$floatingBtns = _this48.$el.find('ul .btn-floating');
            _this48.$floatingBtnsReverse = _this48.$el.find('ul .btn-floating').reverse();
            _this48.offsetY = 0;
            _this48.offsetX = 0;

            _this48.$el.addClass("direction-" + _this48.options.direction);
            if (_this48.options.direction === 'top') {
                _this48.offsetY = 40;
            } else if (_this48.options.direction === 'right') {
                _this48.offsetX = -40;
            } else if (_this48.options.direction === 'bottom') {
                _this48.offsetY = -40;
            } else {
                _this48.offsetX = 40;
            }
            _this48._setupEventHandlers();
            return _this48;
        }

        _createClass(FloatingActionButton, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this.el.M_FloatingActionButton = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleFABClickBound = this._handleFABClick.bind(this);
                this._handleOpenBound = this.open.bind(this);
                this._handleCloseBound = this.close.bind(this);

                if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
                    this.el.addEventListener('mouseenter', this._handleOpenBound);
                    this.el.addEventListener('mouseleave', this._handleCloseBound);
                } else {
                    this.el.addEventListener('click', this._handleFABClickBound);
                }
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
                    this.el.removeEventListener('mouseenter', this._handleOpenBound);
                    this.el.removeEventListener('mouseleave', this._handleCloseBound);
                } else {
                    this.el.removeEventListener('click', this._handleFABClickBound);
                }
            }

            /**
             * Handle FAB Click
             */

        }, {
            key: "_handleFABClick",
            value: function _handleFABClick() {
                if (this.isOpen) {
                    this.close();
                } else {
                    this.open();
                }
            }

            /**
             * Handle Document Click
             * @param {Event} e
             */

        }, {
            key: "_handleDocumentClick",
            value: function _handleDocumentClick(e) {
                if (!$(e.target).closest(this.$menu).length) {
                    this.close();
                }
            }

            /**
             * Open FAB
             */

        }, {
            key: "open",
            value: function open() {
                if (this.isOpen) {
                    return;
                }

                if (this.options.toolbarEnabled) {
                    this._animateInToolbar();
                } else {
                    this._animateInFAB();
                }
                this.isOpen = true;
            }

            /**
             * Close FAB
             */

        }, {
            key: "close",
            value: function close() {
                if (!this.isOpen) {
                    return;
                }

                if (this.options.toolbarEnabled) {
                    window.removeEventListener('scroll', this._handleCloseBound, true);
                    document.body.removeEventListener('click', this._handleDocumentClickBound, true);
                    this._animateOutToolbar();
                } else {
                    this._animateOutFAB();
                }
                this.isOpen = false;
            }

            /**
             * Classic FAB Menu open
             */

        }, {
            key: "_animateInFAB",
            value: function _animateInFAB() {
                var _this49 = this;

                this.$el.addClass('active');

                var time = 0;
                this.$floatingBtnsReverse.each(function (el) {
                    anim({
                        targets: el,
                        opacity: 1,
                        scale: [0.4, 1],
                        translateY: [_this49.offsetY, 0],
                        translateX: [_this49.offsetX, 0],
                        duration: 275,
                        delay: time,
                        easing: 'easeInOutQuad'
                    });
                    time += 40;
                });
            }

            /**
             * Classic FAB Menu close
             */

        }, {
            key: "_animateOutFAB",
            value: function _animateOutFAB() {
                var _this50 = this;

                this.$floatingBtnsReverse.each(function (el) {
                    anim.remove(el);
                    anim({
                        targets: el,
                        opacity: 0,
                        scale: 0.4,
                        translateY: _this50.offsetY,
                        translateX: _this50.offsetX,
                        duration: 175,
                        easing: 'easeOutQuad',
                        complete: function () {
                            _this50.$el.removeClass('active');
                        }
                    });
                });
            }

            /**
             * Toolbar transition Menu open
             */

        }, {
            key: "_animateInToolbar",
            value: function _animateInToolbar() {
                var _this51 = this;

                var scaleFactor = void 0;
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;
                var btnRect = this.el.getBoundingClientRect();
                var backdrop = $('<div class="fab-backdrop"></div>');
                var fabColor = this.$anchor.css('background-color');
                this.$anchor.append(backdrop);

                this.offsetX = btnRect.left - windowWidth / 2 + btnRect.width / 2;
                this.offsetY = windowHeight - btnRect.bottom;
                scaleFactor = windowWidth / backdrop[0].clientWidth;
                this.btnBottom = btnRect.bottom;
                this.btnLeft = btnRect.left;
                this.btnWidth = btnRect.width;

                // Set initial state
                this.$el.addClass('active');
                this.$el.css({
                    'text-align': 'center',
                    width: '100%',
                    bottom: 0,
                    left: 0,
                    transform: 'translateX(' + this.offsetX + 'px)',
                    transition: 'none'
                });
                this.$anchor.css({
                    transform: 'translateY(' + -this.offsetY + 'px)',
                    transition: 'none'
                });
                backdrop.css({
                    'background-color': fabColor
                });

                setTimeout(function () {
                    _this51.$el.css({
                        transform: '',
                        transition: 'transform .2s cubic-bezier(0.550, 0.085, 0.680, 0.530), background-color 0s linear .2s'
                    });
                    _this51.$anchor.css({
                        overflow: 'visible',
                        transform: '',
                        transition: 'transform .2s'
                    });

                    setTimeout(function () {
                        _this51.$el.css({
                            overflow: 'hidden',
                            'background-color': fabColor
                        });
                        backdrop.css({
                            transform: 'scale(' + scaleFactor + ')',
                            transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
                        });
                        _this51.$menu.children('li').children('a').css({
                            opacity: 1
                        });

                        // Scroll to close.
                        _this51._handleDocumentClickBound = _this51._handleDocumentClick.bind(_this51);
                        window.addEventListener('scroll', _this51._handleCloseBound, true);
                        document.body.addEventListener('click', _this51._handleDocumentClickBound, true);
                    }, 100);
                }, 0);
            }

            /**
             * Toolbar transition Menu close
             */

        }, {
            key: "_animateOutToolbar",
            value: function _animateOutToolbar() {
                var _this52 = this;

                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;
                var backdrop = this.$el.find('.fab-backdrop');
                var fabColor = this.$anchor.css('background-color');

                this.offsetX = this.btnLeft - windowWidth / 2 + this.btnWidth / 2;
                this.offsetY = windowHeight - this.btnBottom;

                // Hide backdrop
                this.$el.removeClass('active');
                this.$el.css({
                    'background-color': 'transparent',
                    transition: 'none'
                });
                this.$anchor.css({
                    transition: 'none'
                });
                backdrop.css({
                    transform: 'scale(0)',
                    'background-color': fabColor
                });
                this.$menu.children('li').children('a').css({
                    opacity: ''
                });

                setTimeout(function () {
                    backdrop.remove();

                    // Set initial state.
                    _this52.$el.css({
                        'text-align': '',
                        width: '',
                        bottom: '',
                        left: '',
                        overflow: '',
                        'background-color': '',
                        transform: 'translate3d(' + -_this52.offsetX + 'px,0,0)'
                    });
                    _this52.$anchor.css({
                        overflow: '',
                        transform: 'translate3d(0,' + _this52.offsetY + 'px,0)'
                    });

                    setTimeout(function () {
                        _this52.$el.css({
                            transform: 'translate3d(0,0,0)',
                            transition: 'transform .2s'
                        });
                        _this52.$anchor.css({
                            transform: 'translate3d(0,0,0)',
                            transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
                        });
                    }, 20);
                }, 200);
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(FloatingActionButton.__proto__ || Object.getPrototypeOf(FloatingActionButton), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_FloatingActionButton;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return FloatingActionButton;
    }(Component);

    M.FloatingActionButton = FloatingActionButton;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(FloatingActionButton, 'floatingActionButton', 'M_FloatingActionButton');
    }
})(cash, M.anime);
; (function ($) {
    'use strict';

    var _defaults = {
        // Close when date is selected
        autoClose: false,

        // the default output format for the input field value
        format: 'mmm dd, yyyy',

        // Used to create date object from current input string
        parse: null,

        // The initial date to view when first opened
        defaultDate: null,

        // Make the `defaultDate` the initial selected value
        setDefaultDate: false,

        disableWeekends: false,

        disableDayFn: null,

        // First day of week (0: Sunday, 1: Monday etc)
        firstDay: 0,

        // The earliest date that can be selected
        minDate: null,
        // Thelatest date that can be selected
        maxDate: null,

        // Number of years either side, or array of upper/lower range
        yearRange: 10,

        // used internally (don't config outside)
        minYear: 0,
        maxYear: 9999,
        minMonth: undefined,
        maxMonth: undefined,

        startRange: null,
        endRange: null,

        isRTL: false,

        // Render the month after year in the calendar title
        showMonthAfterYear: false,

        // Render days of the calendar grid that fall in the next or previous month
        showDaysInNextAndPreviousMonths: false,

        // Specify a DOM element to render the calendar in
        container: null,

        // Show clear button
        showClearBtn: false,

        // internationalization
        i18n: {
            cancel: 'Cancel',
            clear: 'Clear',
            done: 'Ok',
            previousMonth: '‹',
            nextMonth: '›',
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            weekdaysAbbrev: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
        },

        // events array
        events: [],

        // callback function
        onSelect: null,
        onOpen: null,
        onClose: null,
        onDraw: null
    };

    /**
     * @class
     *
     */

    var Datepicker = function (_Component15) {
        _inherits(Datepicker, _Component15);

        /**
         * Construct Datepicker instance and set up overlay
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Datepicker(el, options) {
            _classCallCheck(this, Datepicker);

            var _this53 = _possibleConstructorReturn(this, (Datepicker.__proto__ || Object.getPrototypeOf(Datepicker)).call(this, Datepicker, el, options));

            _this53.el.M_Datepicker = _this53;

            _this53.options = $.extend({}, Datepicker.defaults, options);

            // make sure i18n defaults are not lost when only few i18n option properties are passed
            if (!!options && options.hasOwnProperty('i18n') && typeof options.i18n === 'object') {
                _this53.options.i18n = $.extend({}, Datepicker.defaults.i18n, options.i18n);
            }

            // Remove time component from minDate and maxDate options
            if (_this53.options.minDate) _this53.options.minDate.setHours(0, 0, 0, 0);
            if (_this53.options.maxDate) _this53.options.maxDate.setHours(0, 0, 0, 0);

            _this53.id = M.guid();

            _this53._setupVariables();
            _this53._insertHTMLIntoDOM();
            _this53._setupModal();

            _this53._setupEventHandlers();

            if (!_this53.options.defaultDate) {
                _this53.options.defaultDate = new Date(Date.parse(_this53.el.value));
            }

            var defDate = _this53.options.defaultDate;
            if (Datepicker._isDate(defDate)) {
                if (_this53.options.setDefaultDate) {
                    _this53.setDate(defDate, true);
                    _this53.setInputValue();
                } else {
                    _this53.gotoDate(defDate);
                }
            } else {
                _this53.gotoDate(new Date());
            }

            /**
             * Describes open/close state of datepicker
             * @type {Boolean}
             */
            _this53.isOpen = false;
            return _this53;
        }

        _createClass(Datepicker, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this.modal.destroy();
                $(this.modalEl).remove();
                this.destroySelects();
                this.el.M_Datepicker = undefined;
            }
        }, {
            key: "destroySelects",
            value: function destroySelects() {
                var oldYearSelect = this.calendarEl.querySelector('.orig-select-year');
                if (oldYearSelect) {
                    M.FormSelect.getInstance(oldYearSelect).destroy();
                }
                var oldMonthSelect = this.calendarEl.querySelector('.orig-select-month');
                if (oldMonthSelect) {
                    M.FormSelect.getInstance(oldMonthSelect).destroy();
                }
            }
        }, {
            key: "_insertHTMLIntoDOM",
            value: function _insertHTMLIntoDOM() {
                if (this.options.showClearBtn) {
                    $(this.clearBtn).css({ visibility: '' });
                    this.clearBtn.innerHTML = this.options.i18n.clear;
                }

                this.doneBtn.innerHTML = this.options.i18n.done;
                this.cancelBtn.innerHTML = this.options.i18n.cancel;

                if (this.options.container) {
                    this.$modalEl.appendTo(this.options.container);
                } else {
                    this.$modalEl.insertBefore(this.el);
                }
            }
        }, {
            key: "_setupModal",
            value: function _setupModal() {
                var _this54 = this;

                this.modalEl.id = 'modal-' + this.id;
                this.modal = M.Modal.init(this.modalEl, {
                    onCloseEnd: function () {
                        _this54.isOpen = false;
                    }
                });
            }
        }, {
            key: "toString",
            value: function toString(format) {
                var _this55 = this;

                format = format || this.options.format;
                if (!Datepicker._isDate(this.date)) {
                    return '';
                }

                var formatArray = format.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g);
                var formattedDate = formatArray.map(function (label) {
                    if (_this55.formats[label]) {
                        return _this55.formats[label]();
                    }

                    return label;
                }).join('');
                return formattedDate;
            }
        }, {
            key: "setDate",
            value: function setDate(date, preventOnSelect) {
                if (!date) {
                    this.date = null;
                    this._renderDateDisplay();
                    return this.draw();
                }
                if (typeof date === 'string') {
                    date = new Date(Date.parse(date));
                }
                if (!Datepicker._isDate(date)) {
                    return;
                }

                var min = this.options.minDate,
                    max = this.options.maxDate;

                if (Datepicker._isDate(min) && date < min) {
                    date = min;
                } else if (Datepicker._isDate(max) && date > max) {
                    date = max;
                }

                this.date = new Date(date.getTime());

                this._renderDateDisplay();

                Datepicker._setToStartOfDay(this.date);
                this.gotoDate(this.date);

                if (!preventOnSelect && typeof this.options.onSelect === 'function') {
                    this.options.onSelect.call(this, this.date);
                }
            }
        }, {
            key: "setInputValue",
            value: function setInputValue() {
                this.el.value = this.toString();
                this.$el.trigger('change', { firedBy: this });
            }
        }, {
            key: "_renderDateDisplay",
            value: function _renderDateDisplay() {
                var displayDate = Datepicker._isDate(this.date) ? this.date : new Date();
                var i18n = this.options.i18n;
                var day = i18n.weekdaysShort[displayDate.getDay()];
                var month = i18n.monthsShort[displayDate.getMonth()];
                var date = displayDate.getDate();
                this.yearTextEl.innerHTML = displayDate.getFullYear();
                this.dateTextEl.innerHTML = day + ", " + month + " " + date;
            }

            /**
             * change view to a specific date
             */

        }, {
            key: "gotoDate",
            value: function gotoDate(date) {
                var newCalendar = true;

                if (!Datepicker._isDate(date)) {
                    return;
                }

                if (this.calendars) {
                    var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
                        lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1),
                        visibleDate = date.getTime();
                    // get the end of the month
                    lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
                    lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
                    newCalendar = visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate;
                }

                if (newCalendar) {
                    this.calendars = [{
                        month: date.getMonth(),
                        year: date.getFullYear()
                    }];
                }

                this.adjustCalendars();
            }
        }, {
            key: "adjustCalendars",
            value: function adjustCalendars() {
                this.calendars[0] = this.adjustCalendar(this.calendars[0]);
                this.draw();
            }
        }, {
            key: "adjustCalendar",
            value: function adjustCalendar(calendar) {
                if (calendar.month < 0) {
                    calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
                    calendar.month += 12;
                }
                if (calendar.month > 11) {
                    calendar.year += Math.floor(Math.abs(calendar.month) / 12);
                    calendar.month -= 12;
                }
                return calendar;
            }
        }, {
            key: "nextMonth",
            value: function nextMonth() {
                this.calendars[0].month++;
                this.adjustCalendars();
            }
        }, {
            key: "prevMonth",
            value: function prevMonth() {
                this.calendars[0].month--;
                this.adjustCalendars();
            }
        }, {
            key: "render",
            value: function render(year, month, randId) {
                var opts = this.options,
                    now = new Date(),
                    days = Datepicker._getDaysInMonth(year, month),
                    before = new Date(year, month, 1).getDay(),
                    data = [],
                    row = [];
                Datepicker._setToStartOfDay(now);
                if (opts.firstDay > 0) {
                    before -= opts.firstDay;
                    if (before < 0) {
                        before += 7;
                    }
                }
                var previousMonth = month === 0 ? 11 : month - 1,
                    nextMonth = month === 11 ? 0 : month + 1,
                    yearOfPreviousMonth = month === 0 ? year - 1 : year,
                    yearOfNextMonth = month === 11 ? year + 1 : year,
                    daysInPreviousMonth = Datepicker._getDaysInMonth(yearOfPreviousMonth, previousMonth);
                var cells = days + before,
                    after = cells;
                while (after > 7) {
                    after -= 7;
                }
                cells += 7 - after;
                var isWeekSelected = false;
                for (var i = 0, r = 0; i < cells; i++) {
                    var day = new Date(year, month, 1 + (i - before)),
                        isSelected = Datepicker._isDate(this.date) ? Datepicker._compareDates(day, this.date) : false,
                        isToday = Datepicker._compareDates(day, now),
                        hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false,
                        isEmpty = i < before || i >= days + before,
                        dayNumber = 1 + (i - before),
                        monthNumber = month,
                        yearNumber = year,
                        isStartRange = opts.startRange && Datepicker._compareDates(opts.startRange, day),
                        isEndRange = opts.endRange && Datepicker._compareDates(opts.endRange, day),
                        isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
                        isDisabled = opts.minDate && day < opts.minDate || opts.maxDate && day > opts.maxDate || opts.disableWeekends && Datepicker._isWeekend(day) || opts.disableDayFn && opts.disableDayFn(day);

                    if (isEmpty) {
                        if (i < before) {
                            dayNumber = daysInPreviousMonth + dayNumber;
                            monthNumber = previousMonth;
                            yearNumber = yearOfPreviousMonth;
                        } else {
                            dayNumber = dayNumber - days;
                            monthNumber = nextMonth;
                            yearNumber = yearOfNextMonth;
                        }
                    }

                    var dayConfig = {
                        day: dayNumber,
                        month: monthNumber,
                        year: yearNumber,
                        hasEvent: hasEvent,
                        isSelected: isSelected,
                        isToday: isToday,
                        isDisabled: isDisabled,
                        isEmpty: isEmpty,
                        isStartRange: isStartRange,
                        isEndRange: isEndRange,
                        isInRange: isInRange,
                        showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths
                    };

                    row.push(this.renderDay(dayConfig));

                    if (++r === 7) {
                        data.push(this.renderRow(row, opts.isRTL, isWeekSelected));
                        row = [];
                        r = 0;
                        isWeekSelected = false;
                    }
                }
                return this.renderTable(opts, data, randId);
            }
        }, {
            key: "renderDay",
            value: function renderDay(opts) {
                var arr = [];
                var ariaSelected = 'false';
                if (opts.isEmpty) {
                    if (opts.showDaysInNextAndPreviousMonths) {
                        arr.push('is-outside-current-month');
                        arr.push('is-selection-disabled');
                    } else {
                        return '<td class="is-empty"></td>';
                    }
                }
                if (opts.isDisabled) {
                    arr.push('is-disabled');
                }

                if (opts.isToday) {
                    arr.push('is-today');
                }
                if (opts.isSelected) {
                    arr.push('is-selected');
                    ariaSelected = 'true';
                }
                if (opts.hasEvent) {
                    arr.push('has-event');
                }
                if (opts.isInRange) {
                    arr.push('is-inrange');
                }
                if (opts.isStartRange) {
                    arr.push('is-startrange');
                }
                if (opts.isEndRange) {
                    arr.push('is-endrange');
                }
                return "<td data-day=\"" + opts.day + "\" class=\"" + arr.join(' ') + "\" aria-selected=\"" + ariaSelected + "\">" + ("<button class=\"datepicker-day-button\" type=\"button\" data-year=\"" + opts.year + "\" data-month=\"" + opts.month + "\" data-day=\"" + opts.day + "\">" + opts.day + "</button>") + '</td>';
            }
        }, {
            key: "renderRow",
            value: function renderRow(days, isRTL, isRowSelected) {
                return '<tr class="datepicker-row' + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
            }
        }, {
            key: "renderTable",
            value: function renderTable(opts, data, randId) {
                return '<div class="datepicker-table-wrapper"><table cellpadding="0" cellspacing="0" class="datepicker-table" role="grid" aria-labelledby="' + randId + '">' + this.renderHead(opts) + this.renderBody(data) + '</table></div>';
            }
        }, {
            key: "renderHead",
            value: function renderHead(opts) {
                var i = void 0,
                    arr = [];
                for (i = 0; i < 7; i++) {
                    arr.push("<th scope=\"col\"><abbr title=\"" + this.renderDayName(opts, i) + "\">" + this.renderDayName(opts, i, true) + "</abbr></th>");
                }
                return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
            }
        }, {
            key: "renderBody",
            value: function renderBody(rows) {
                return '<tbody>' + rows.join('') + '</tbody>';
            }
        }, {
            key: "renderTitle",
            value: function renderTitle(instance, c, year, month, refYear, randId) {
                var i = void 0,
                    j = void 0,
                    arr = void 0,
                    opts = this.options,
                    isMinYear = year === opts.minYear,
                    isMaxYear = year === opts.maxYear,
                    html = '<div id="' + randId + '" class="datepicker-controls" role="heading" aria-live="assertive">',
                    monthHtml = void 0,
                    yearHtml = void 0,
                    prev = true,
                    next = true;

                for (arr = [], i = 0; i < 12; i++) {
                    arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' + (i === month ? ' selected="selected"' : '') + (isMinYear && i < opts.minMonth || isMaxYear && i > opts.maxMonth ? 'disabled="disabled"' : '') + '>' + opts.i18n.months[i] + '</option>');
                }

                monthHtml = '<select class="datepicker-select orig-select-month" tabindex="-1">' + arr.join('') + '</select>';

                if ($.isArray(opts.yearRange)) {
                    i = opts.yearRange[0];
                    j = opts.yearRange[1] + 1;
                } else {
                    i = year - opts.yearRange;
                    j = 1 + year + opts.yearRange;
                }

                for (arr = []; i < j && i <= opts.maxYear; i++) {
                    if (i >= opts.minYear) {
                        arr.push("<option value=\"" + i + "\" " + (i === year ? 'selected="selected"' : '') + ">" + i + "</option>");
                    }
                }

                yearHtml = "<select class=\"datepicker-select orig-select-year\" tabindex=\"-1\">" + arr.join('') + "</select>";

                var leftArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/></svg>';
                html += "<button class=\"month-prev" + (prev ? '' : ' is-disabled') + "\" type=\"button\">" + leftArrow + "</button>";

                html += '<div class="selects-container">';
                if (opts.showMonthAfterYear) {
                    html += yearHtml + monthHtml;
                } else {
                    html += monthHtml + yearHtml;
                }
                html += '</div>';

                if (isMinYear && (month === 0 || opts.minMonth >= month)) {
                    prev = false;
                }

                if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
                    next = false;
                }

                var rightArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/><path d="M0-.25h24v24H0z" fill="none"/></svg>';
                html += "<button class=\"month-next" + (next ? '' : ' is-disabled') + "\" type=\"button\">" + rightArrow + "</button>";

                return html += '</div>';
            }

            /**
             * refresh the HTML
             */

        }, {
            key: "draw",
            value: function draw(force) {
                if (!this.isOpen && !force) {
                    return;
                }
                var opts = this.options,
                    minYear = opts.minYear,
                    maxYear = opts.maxYear,
                    minMonth = opts.minMonth,
                    maxMonth = opts.maxMonth,
                    html = '',
                    randId = void 0;

                if (this._y <= minYear) {
                    this._y = minYear;
                    if (!isNaN(minMonth) && this._m < minMonth) {
                        this._m = minMonth;
                    }
                }
                if (this._y >= maxYear) {
                    this._y = maxYear;
                    if (!isNaN(maxMonth) && this._m > maxMonth) {
                        this._m = maxMonth;
                    }
                }

                randId = 'datepicker-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);

                for (var c = 0; c < 1; c++) {
                    this._renderDateDisplay();
                    html += this.renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId);
                }

                this.destroySelects();

                this.calendarEl.innerHTML = html;

                // Init Materialize Select
                var yearSelect = this.calendarEl.querySelector('.orig-select-year');
                var monthSelect = this.calendarEl.querySelector('.orig-select-month');
                M.FormSelect.init(yearSelect, {
                    classes: 'select-year',
                    dropdownOptions: { container: document.body, constrainWidth: false }
                });
                M.FormSelect.init(monthSelect, {
                    classes: 'select-month',
                    dropdownOptions: { container: document.body, constrainWidth: false }
                });

                // Add change handlers for select
                yearSelect.addEventListener('change', this._handleYearChange.bind(this));
                monthSelect.addEventListener('change', this._handleMonthChange.bind(this));

                if (typeof this.options.onDraw === 'function') {
                    this.options.onDraw(this);
                }
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
                this._handleInputClickBound = this._handleInputClick.bind(this);
                this._handleInputChangeBound = this._handleInputChange.bind(this);
                this._handleCalendarClickBound = this._handleCalendarClick.bind(this);
                this._finishSelectionBound = this._finishSelection.bind(this);
                this._handleMonthChange = this._handleMonthChange.bind(this);
                this._closeBound = this.close.bind(this);

                this.el.addEventListener('click', this._handleInputClickBound);
                this.el.addEventListener('keydown', this._handleInputKeydownBound);
                this.el.addEventListener('change', this._handleInputChangeBound);
                this.calendarEl.addEventListener('click', this._handleCalendarClickBound);
                this.doneBtn.addEventListener('click', this._finishSelectionBound);
                this.cancelBtn.addEventListener('click', this._closeBound);

                if (this.options.showClearBtn) {
                    this._handleClearClickBound = this._handleClearClick.bind(this);
                    this.clearBtn.addEventListener('click', this._handleClearClickBound);
                }
            }
        }, {
            key: "_setupVariables",
            value: function _setupVariables() {
                var _this56 = this;

                this.$modalEl = $(Datepicker._template);
                this.modalEl = this.$modalEl[0];

                this.calendarEl = this.modalEl.querySelector('.datepicker-calendar');

                this.yearTextEl = this.modalEl.querySelector('.year-text');
                this.dateTextEl = this.modalEl.querySelector('.date-text');
                if (this.options.showClearBtn) {
                    this.clearBtn = this.modalEl.querySelector('.datepicker-clear');
                }
                this.doneBtn = this.modalEl.querySelector('.datepicker-done');
                this.cancelBtn = this.modalEl.querySelector('.datepicker-cancel');

                this.formats = {
                    d: function () {
                        return _this56.date.getDate();
                    },
                    dd: function () {
                        var d = _this56.date.getDate();
                        return (d < 10 ? '0' : '') + d;
                    },
                    ddd: function () {
                        return _this56.options.i18n.weekdaysShort[_this56.date.getDay()];
                    },
                    dddd: function () {
                        return _this56.options.i18n.weekdays[_this56.date.getDay()];
                    },
                    m: function () {
                        return _this56.date.getMonth() + 1;
                    },
                    mm: function () {
                        var m = _this56.date.getMonth() + 1;
                        return (m < 10 ? '0' : '') + m;
                    },
                    mmm: function () {
                        return _this56.options.i18n.monthsShort[_this56.date.getMonth()];
                    },
                    mmmm: function () {
                        return _this56.options.i18n.months[_this56.date.getMonth()];
                    },
                    yy: function () {
                        return ('' + _this56.date.getFullYear()).slice(2);
                    },
                    yyyy: function () {
                        return _this56.date.getFullYear();
                    }
                };
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.el.removeEventListener('click', this._handleInputClickBound);
                this.el.removeEventListener('keydown', this._handleInputKeydownBound);
                this.el.removeEventListener('change', this._handleInputChangeBound);
                this.calendarEl.removeEventListener('click', this._handleCalendarClickBound);
            }
        }, {
            key: "_handleInputClick",
            value: function _handleInputClick() {
                this.open();
            }
        }, {
            key: "_handleInputKeydown",
            value: function _handleInputKeydown(e) {
                if (e.which === M.keys.ENTER) {
                    e.preventDefault();
                    this.open();
                }
            }
        }, {
            key: "_handleCalendarClick",
            value: function _handleCalendarClick(e) {
                if (!this.isOpen) {
                    return;
                }

                var $target = $(e.target);
                if (!$target.hasClass('is-disabled')) {
                    if ($target.hasClass('datepicker-day-button') && !$target.hasClass('is-empty') && !$target.parent().hasClass('is-disabled')) {
                        this.setDate(new Date(e.target.getAttribute('data-year'), e.target.getAttribute('data-month'), e.target.getAttribute('data-day')));
                        if (this.options.autoClose) {
                            this._finishSelection();
                        }
                    } else if ($target.closest('.month-prev').length) {
                        this.prevMonth();
                    } else if ($target.closest('.month-next').length) {
                        this.nextMonth();
                    }
                }
            }
        }, {
            key: "_handleClearClick",
            value: function _handleClearClick() {
                this.date = null;
                this.setInputValue();
                this.close();
            }
        }, {
            key: "_handleMonthChange",
            value: function _handleMonthChange(e) {
                this.gotoMonth(e.target.value);
            }
        }, {
            key: "_handleYearChange",
            value: function _handleYearChange(e) {
                this.gotoYear(e.target.value);
            }

            /**
             * change view to a specific month (zero-index, e.g. 0: January)
             */

        }, {
            key: "gotoMonth",
            value: function gotoMonth(month) {
                if (!isNaN(month)) {
                    this.calendars[0].month = parseInt(month, 10);
                    this.adjustCalendars();
                }
            }

            /**
             * change view to a specific full year (e.g. "2012")
             */

        }, {
            key: "gotoYear",
            value: function gotoYear(year) {
                if (!isNaN(year)) {
                    this.calendars[0].year = parseInt(year, 10);
                    this.adjustCalendars();
                }
            }
        }, {
            key: "_handleInputChange",
            value: function _handleInputChange(e) {
                var date = void 0;

                // Prevent change event from being fired when triggered by the plugin
                if (e.firedBy === this) {
                    return;
                }
                if (this.options.parse) {
                    date = this.options.parse(this.el.value, this.options.format);
                } else {
                    date = new Date(Date.parse(this.el.value));
                }

                if (Datepicker._isDate(date)) {
                    this.setDate(date);
                }
            }
        }, {
            key: "renderDayName",
            value: function renderDayName(opts, day, abbr) {
                day += opts.firstDay;
                while (day >= 7) {
                    day -= 7;
                }
                return abbr ? opts.i18n.weekdaysAbbrev[day] : opts.i18n.weekdays[day];
            }

            /**
             * Set input value to the selected date and close Datepicker
             */

        }, {
            key: "_finishSelection",
            value: function _finishSelection() {
                this.setInputValue();
                this.close();
            }

            /**
             * Open Datepicker
             */

        }, {
            key: "open",
            value: function open() {
                if (this.isOpen) {
                    return;
                }

                this.isOpen = true;
                if (typeof this.options.onOpen === 'function') {
                    this.options.onOpen.call(this);
                }
                this.draw();
                this.modal.open();
                return this;
            }

            /**
             * Close Datepicker
             */

        }, {
            key: "close",
            value: function close() {
                if (!this.isOpen) {
                    return;
                }

                this.isOpen = false;
                if (typeof this.options.onClose === 'function') {
                    this.options.onClose.call(this);
                }
                this.modal.close();
                return this;
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Datepicker.__proto__ || Object.getPrototypeOf(Datepicker), "init", this).call(this, this, els, options);
            }
        }, {
            key: "_isDate",
            value: function _isDate(obj) {
                return (/Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime())
                );
            }
        }, {
            key: "_isWeekend",
            value: function _isWeekend(date) {
                var day = date.getDay();
                return day === 0 || day === 6;
            }
        }, {
            key: "_setToStartOfDay",
            value: function _setToStartOfDay(date) {
                if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
            }
        }, {
            key: "_getDaysInMonth",
            value: function _getDaysInMonth(year, month) {
                return [31, Datepicker._isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
            }
        }, {
            key: "_isLeapYear",
            value: function _isLeapYear(year) {
                // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
                return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
            }
        }, {
            key: "_compareDates",
            value: function _compareDates(a, b) {
                // weak date comparison (use setToStartOfDay(date) to ensure correct result)
                return a.getTime() === b.getTime();
            }
        }, {
            key: "_setToStartOfDay",
            value: function _setToStartOfDay(date) {
                if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Datepicker;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Datepicker;
    }(Component);

    Datepicker._template = ['<div class= "modal datepicker-modal">', '<div class="modal-content datepicker-container">', '<div class="datepicker-date-display">', '<span class="year-text"></span>', '<span class="date-text"></span>', '</div>', '<div class="datepicker-calendar-container">', '<div class="datepicker-calendar"></div>', '<div class="datepicker-footer">', '<button class="btn-flat datepicker-clear waves-effect" style="visibility: hidden;" type="button"></button>', '<div class="confirmation-btns">', '<button class="btn-flat datepicker-cancel waves-effect" type="button"></button>', '<button class="btn-flat datepicker-done waves-effect" type="button"></button>', '</div>', '</div>', '</div>', '</div>', '</div>'].join('');

    M.Datepicker = Datepicker;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Datepicker, 'datepicker', 'M_Datepicker');
    }
})(cash);
; (function ($) {
    'use strict';

    var _defaults = {
        dialRadius: 135,
        outerRadius: 105,
        innerRadius: 70,
        tickRadius: 20,
        duration: 350,
        container: null,
        defaultTime: 'now', // default time, 'now' or '13:14' e.g.
        fromNow: 0, // Millisecond offset from the defaultTime
        showClearBtn: false,

        // internationalization
        i18n: {
            cancel: 'Cancel',
            clear: 'Clear',
            done: 'Ok'
        },

        autoClose: false, // auto close when minute is selected
        twelveHour: true, // change to 12 hour AM/PM clock from 24 hour
        vibrate: true, // vibrate the device when dragging clock hand

        // Callbacks
        onOpenStart: null,
        onOpenEnd: null,
        onCloseStart: null,
        onCloseEnd: null,
        onSelect: null
    };

    /**
     * @class
     *
     */

    var Timepicker = function (_Component16) {
        _inherits(Timepicker, _Component16);

        function Timepicker(el, options) {
            _classCallCheck(this, Timepicker);

            var _this57 = _possibleConstructorReturn(this, (Timepicker.__proto__ || Object.getPrototypeOf(Timepicker)).call(this, Timepicker, el, options));

            _this57.el.M_Timepicker = _this57;

            _this57.options = $.extend({}, Timepicker.defaults, options);

            _this57.id = M.guid();
            _this57._insertHTMLIntoDOM();
            _this57._setupModal();
            _this57._setupVariables();
            _this57._setupEventHandlers();

            _this57._clockSetup();
            _this57._pickerSetup();
            return _this57;
        }

        _createClass(Timepicker, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this.modal.destroy();
                $(this.modalEl).remove();
                this.el.M_Timepicker = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
                this._handleInputClickBound = this._handleInputClick.bind(this);
                this._handleClockClickStartBound = this._handleClockClickStart.bind(this);
                this._handleDocumentClickMoveBound = this._handleDocumentClickMove.bind(this);
                this._handleDocumentClickEndBound = this._handleDocumentClickEnd.bind(this);

                this.el.addEventListener('click', this._handleInputClickBound);
                this.el.addEventListener('keydown', this._handleInputKeydownBound);
                this.plate.addEventListener('mousedown', this._handleClockClickStartBound);
                this.plate.addEventListener('touchstart', this._handleClockClickStartBound);

                $(this.spanHours).on('click', this.showView.bind(this, 'hours'));
                $(this.spanMinutes).on('click', this.showView.bind(this, 'minutes'));
            }
        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.el.removeEventListener('click', this._handleInputClickBound);
                this.el.removeEventListener('keydown', this._handleInputKeydownBound);
            }
        }, {
            key: "_handleInputClick",
            value: function _handleInputClick() {
                this.open();
            }
        }, {
            key: "_handleInputKeydown",
            value: function _handleInputKeydown(e) {
                if (e.which === M.keys.ENTER) {
                    e.preventDefault();
                    this.open();
                }
            }
        }, {
            key: "_handleClockClickStart",
            value: function _handleClockClickStart(e) {
                e.preventDefault();
                var clockPlateBR = this.plate.getBoundingClientRect();
                var offset = { x: clockPlateBR.left, y: clockPlateBR.top };

                this.x0 = offset.x + this.options.dialRadius;
                this.y0 = offset.y + this.options.dialRadius;
                this.moved = false;
                var clickPos = Timepicker._Pos(e);
                this.dx = clickPos.x - this.x0;
                this.dy = clickPos.y - this.y0;

                // Set clock hands
                this.setHand(this.dx, this.dy, false);

                // Mousemove on document
                document.addEventListener('mousemove', this._handleDocumentClickMoveBound);
                document.addEventListener('touchmove', this._handleDocumentClickMoveBound);

                // Mouseup on document
                document.addEventListener('mouseup', this._handleDocumentClickEndBound);
                document.addEventListener('touchend', this._handleDocumentClickEndBound);
            }
        }, {
            key: "_handleDocumentClickMove",
            value: function _handleDocumentClickMove(e) {
                e.preventDefault();
                var clickPos = Timepicker._Pos(e);
                var x = clickPos.x - this.x0;
                var y = clickPos.y - this.y0;
                this.moved = true;
                this.setHand(x, y, false, true);
            }
        }, {
            key: "_handleDocumentClickEnd",
            value: function _handleDocumentClickEnd(e) {
                var _this58 = this;

                e.preventDefault();
                document.removeEventListener('mouseup', this._handleDocumentClickEndBound);
                document.removeEventListener('touchend', this._handleDocumentClickEndBound);
                var clickPos = Timepicker._Pos(e);
                var x = clickPos.x - this.x0;
                var y = clickPos.y - this.y0;
                if (this.moved && x === this.dx && y === this.dy) {
                    this.setHand(x, y);
                }

                if (this.currentView === 'hours') {
                    this.showView('minutes', this.options.duration / 2);
                } else if (this.options.autoClose) {
                    $(this.minutesView).addClass('timepicker-dial-out');
                    setTimeout(function () {
                        _this58.done();
                    }, this.options.duration / 2);
                }

                if (typeof this.options.onSelect === 'function') {
                    this.options.onSelect.call(this, this.hours, this.minutes);
                }

                // Unbind mousemove event
                document.removeEventListener('mousemove', this._handleDocumentClickMoveBound);
                document.removeEventListener('touchmove', this._handleDocumentClickMoveBound);
            }
        }, {
            key: "_insertHTMLIntoDOM",
            value: function _insertHTMLIntoDOM() {
                this.$modalEl = $(Timepicker._template);
                this.modalEl = this.$modalEl[0];
                this.modalEl.id = 'modal-' + this.id;

                // Append popover to input by default
                var containerEl = document.querySelector(this.options.container);
                if (this.options.container && !!containerEl) {
                    this.$modalEl.appendTo(containerEl);
                } else {
                    this.$modalEl.insertBefore(this.el);
                }
            }
        }, {
            key: "_setupModal",
            value: function _setupModal() {
                var _this59 = this;

                this.modal = M.Modal.init(this.modalEl, {
                    onOpenStart: this.options.onOpenStart,
                    onOpenEnd: this.options.onOpenEnd,
                    onCloseStart: this.options.onCloseStart,
                    onCloseEnd: function () {
                        if (typeof _this59.options.onCloseEnd === 'function') {
                            _this59.options.onCloseEnd.call(_this59);
                        }
                        _this59.isOpen = false;
                    }
                });
            }
        }, {
            key: "_setupVariables",
            value: function _setupVariables() {
                this.currentView = 'hours';
                this.vibrate = navigator.vibrate ? 'vibrate' : navigator.webkitVibrate ? 'webkitVibrate' : null;

                this._canvas = this.modalEl.querySelector('.timepicker-canvas');
                this.plate = this.modalEl.querySelector('.timepicker-plate');

                this.hoursView = this.modalEl.querySelector('.timepicker-hours');
                this.minutesView = this.modalEl.querySelector('.timepicker-minutes');
                this.spanHours = this.modalEl.querySelector('.timepicker-span-hours');
                this.spanMinutes = this.modalEl.querySelector('.timepicker-span-minutes');
                this.spanAmPm = this.modalEl.querySelector('.timepicker-span-am-pm');
                this.footer = this.modalEl.querySelector('.timepicker-footer');
                this.amOrPm = 'PM';
            }
        }, {
            key: "_pickerSetup",
            value: function _pickerSetup() {
                var $clearBtn = $("<button class=\"btn-flat timepicker-clear waves-effect\" style=\"visibility: hidden;\" type=\"button\" tabindex=\"" + (this.options.twelveHour ? '3' : '1') + "\">" + this.options.i18n.clear + "</button>").appendTo(this.footer).on('click', this.clear.bind(this));
                if (this.options.showClearBtn) {
                    $clearBtn.css({ visibility: '' });
                }

                var confirmationBtnsContainer = $('<div class="confirmation-btns"></div>');
                $('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' + (this.options.twelveHour ? '3' : '1') + '">' + this.options.i18n.cancel + '</button>').appendTo(confirmationBtnsContainer).on('click', this.close.bind(this));
                $('<button class="btn-flat timepicker-close waves-effect" type="button" tabindex="' + (this.options.twelveHour ? '3' : '1') + '">' + this.options.i18n.done + '</button>').appendTo(confirmationBtnsContainer).on('click', this.done.bind(this));
                confirmationBtnsContainer.appendTo(this.footer);
            }
        }, {
            key: "_clockSetup",
            value: function _clockSetup() {
                if (this.options.twelveHour) {
                    this.$amBtn = $('<div class="am-btn">AM</div>');
                    this.$pmBtn = $('<div class="pm-btn">PM</div>');
                    this.$amBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
                    this.$pmBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
                }

                this._buildHoursView();
                this._buildMinutesView();
                this._buildSVGClock();
            }
        }, {
            key: "_buildSVGClock",
            value: function _buildSVGClock() {
                // Draw clock hands and others
                var dialRadius = this.options.dialRadius;
                var tickRadius = this.options.tickRadius;
                var diameter = dialRadius * 2;

                var svg = Timepicker._createSVGEl('svg');
                svg.setAttribute('class', 'timepicker-svg');
                svg.setAttribute('width', diameter);
                svg.setAttribute('height', diameter);
                var g = Timepicker._createSVGEl('g');
                g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
                var bearing = Timepicker._createSVGEl('circle');
                bearing.setAttribute('class', 'timepicker-canvas-bearing');
                bearing.setAttribute('cx', 0);
                bearing.setAttribute('cy', 0);
                bearing.setAttribute('r', 4);
                var hand = Timepicker._createSVGEl('line');
                hand.setAttribute('x1', 0);
                hand.setAttribute('y1', 0);
                var bg = Timepicker._createSVGEl('circle');
                bg.setAttribute('class', 'timepicker-canvas-bg');
                bg.setAttribute('r', tickRadius);
                g.appendChild(hand);
                g.appendChild(bg);
                g.appendChild(bearing);
                svg.appendChild(g);
                this._canvas.appendChild(svg);

                this.hand = hand;
                this.bg = bg;
                this.bearing = bearing;
                this.g = g;
            }
        }, {
            key: "_buildHoursView",
            value: function _buildHoursView() {
                var $tick = $('<div class="timepicker-tick"></div>');
                // Hours view
                if (this.options.twelveHour) {
                    for (var i = 1; i < 13; i += 1) {
                        var tick = $tick.clone();
                        var radian = i / 6 * Math.PI;
                        var radius = this.options.outerRadius;
                        tick.css({
                            left: this.options.dialRadius + Math.sin(radian) * radius - this.options.tickRadius + 'px',
                            top: this.options.dialRadius - Math.cos(radian) * radius - this.options.tickRadius + 'px'
                        });
                        tick.html(i === 0 ? '00' : i);
                        this.hoursView.appendChild(tick[0]);
                        // tick.on(mousedownEvent, mousedown);
                    }
                } else {
                    for (var _i2 = 0; _i2 < 24; _i2 += 1) {
                        var _tick = $tick.clone();
                        var _radian = _i2 / 6 * Math.PI;
                        var inner = _i2 > 0 && _i2 < 13;
                        var _radius = inner ? this.options.innerRadius : this.options.outerRadius;
                        _tick.css({
                            left: this.options.dialRadius + Math.sin(_radian) * _radius - this.options.tickRadius + 'px',
                            top: this.options.dialRadius - Math.cos(_radian) * _radius - this.options.tickRadius + 'px'
                        });
                        _tick.html(_i2 === 0 ? '00' : _i2);
                        this.hoursView.appendChild(_tick[0]);
                        // tick.on(mousedownEvent, mousedown);
                    }
                }
            }
        }, {
            key: "_buildMinutesView",
            value: function _buildMinutesView() {
                var $tick = $('<div class="timepicker-tick"></div>');
                // Minutes view
                for (var i = 0; i < 60; i += 5) {
                    var tick = $tick.clone();
                    var radian = i / 30 * Math.PI;
                    tick.css({
                        left: this.options.dialRadius + Math.sin(radian) * this.options.outerRadius - this.options.tickRadius + 'px',
                        top: this.options.dialRadius - Math.cos(radian) * this.options.outerRadius - this.options.tickRadius + 'px'
                    });
                    tick.html(Timepicker._addLeadingZero(i));
                    this.minutesView.appendChild(tick[0]);
                }
            }
        }, {
            key: "_handleAmPmClick",
            value: function _handleAmPmClick(e) {
                var $btnClicked = $(e.target);
                this.amOrPm = $btnClicked.hasClass('am-btn') ? 'AM' : 'PM';
                this._updateAmPmView();
            }
        }, {
            key: "_updateAmPmView",
            value: function _updateAmPmView() {
                if (this.options.twelveHour) {
                    this.$amBtn.toggleClass('text-primary', this.amOrPm === 'AM');
                    this.$pmBtn.toggleClass('text-primary', this.amOrPm === 'PM');
                }
            }
        }, {
            key: "_updateTimeFromInput",
            value: function _updateTimeFromInput() {
                // Get the time
                var value = ((this.el.value || this.options.defaultTime || '') + '').split(':');
                if (this.options.twelveHour && !(typeof value[1] === 'undefined')) {
                    if (value[1].toUpperCase().indexOf('AM') > 0) {
                        this.amOrPm = 'AM';
                    } else {
                        this.amOrPm = 'PM';
                    }
                    value[1] = value[1].replace('AM', '').replace('PM', '');
                }
                if (value[0] === 'now') {
                    var now = new Date(+new Date() + this.options.fromNow);
                    value = [now.getHours(), now.getMinutes()];
                    if (this.options.twelveHour) {
                        this.amOrPm = value[0] >= 12 && value[0] < 24 ? 'PM' : 'AM';
                    }
                }
                this.hours = +value[0] || 0;
                this.minutes = +value[1] || 0;
                this.spanHours.innerHTML = this.hours;
                this.spanMinutes.innerHTML = Timepicker._addLeadingZero(this.minutes);

                this._updateAmPmView();
            }
        }, {
            key: "showView",
            value: function showView(view, delay) {
                if (view === 'minutes' && $(this.hoursView).css('visibility') === 'visible') {
                    // raiseCallback(this.options.beforeHourSelect);
                }
                var isHours = view === 'hours',
                    nextView = isHours ? this.hoursView : this.minutesView,
                    hideView = isHours ? this.minutesView : this.hoursView;
                this.currentView = view;

                $(this.spanHours).toggleClass('text-primary', isHours);
                $(this.spanMinutes).toggleClass('text-primary', !isHours);

                // Transition view
                hideView.classList.add('timepicker-dial-out');
                $(nextView).css('visibility', 'visible').removeClass('timepicker-dial-out');

                // Reset clock hand
                this.resetClock(delay);

                // After transitions ended
                clearTimeout(this.toggleViewTimer);
                this.toggleViewTimer = setTimeout(function () {
                    $(hideView).css('visibility', 'hidden');
                }, this.options.duration);
            }
        }, {
            key: "resetClock",
            value: function resetClock(delay) {
                var view = this.currentView,
                    value = this[view],
                    isHours = view === 'hours',
                    unit = Math.PI / (isHours ? 6 : 30),
                    radian = value * unit,
                    radius = isHours && value > 0 && value < 13 ? this.options.innerRadius : this.options.outerRadius,
                    x = Math.sin(radian) * radius,
                    y = -Math.cos(radian) * radius,
                    self = this;

                if (delay) {
                    $(this.canvas).addClass('timepicker-canvas-out');
                    setTimeout(function () {
                        $(self.canvas).removeClass('timepicker-canvas-out');
                        self.setHand(x, y);
                    }, delay);
                } else {
                    this.setHand(x, y);
                }
            }
        }, {
            key: "setHand",
            value: function setHand(x, y, roundBy5) {
                var _this60 = this;

                var radian = Math.atan2(x, -y),
                    isHours = this.currentView === 'hours',
                    unit = Math.PI / (isHours || roundBy5 ? 6 : 30),
                    z = Math.sqrt(x * x + y * y),
                    inner = isHours && z < (this.options.outerRadius + this.options.innerRadius) / 2,
                    radius = inner ? this.options.innerRadius : this.options.outerRadius;

                if (this.options.twelveHour) {
                    radius = this.options.outerRadius;
                }

                // Radian should in range [0, 2PI]
                if (radian < 0) {
                    radian = Math.PI * 2 + radian;
                }

                // Get the round value
                var value = Math.round(radian / unit);

                // Get the round radian
                radian = value * unit;

                // Correct the hours or minutes
                if (this.options.twelveHour) {
                    if (isHours) {
                        if (value === 0) value = 12;
                    } else {
                        if (roundBy5) value *= 5;
                        if (value === 60) value = 0;
                    }
                } else {
                    if (isHours) {
                        if (value === 12) {
                            value = 0;
                        }
                        value = inner ? value === 0 ? 12 : value : value === 0 ? 0 : value + 12;
                    } else {
                        if (roundBy5) {
                            value *= 5;
                        }
                        if (value === 60) {
                            value = 0;
                        }
                    }
                }

                // Once hours or minutes changed, vibrate the device
                if (this[this.currentView] !== value) {
                    if (this.vibrate && this.options.vibrate) {
                        // Do not vibrate too frequently
                        if (!this.vibrateTimer) {
                            navigator[this.vibrate](10);
                            this.vibrateTimer = setTimeout(function () {
                                _this60.vibrateTimer = null;
                            }, 100);
                        }
                    }
                }

                this[this.currentView] = value;
                if (isHours) {
                    this['spanHours'].innerHTML = value;
                } else {
                    this['spanMinutes'].innerHTML = Timepicker._addLeadingZero(value);
                }

                // Set clock hand and others' position
                var cx1 = Math.sin(radian) * (radius - this.options.tickRadius),
                    cy1 = -Math.cos(radian) * (radius - this.options.tickRadius),
                    cx2 = Math.sin(radian) * radius,
                    cy2 = -Math.cos(radian) * radius;
                this.hand.setAttribute('x2', cx1);
                this.hand.setAttribute('y2', cy1);
                this.bg.setAttribute('cx', cx2);
                this.bg.setAttribute('cy', cy2);
            }
        }, {
            key: "open",
            value: function open() {
                if (this.isOpen) {
                    return;
                }

                this.isOpen = true;
                this._updateTimeFromInput();
                this.showView('hours');

                this.modal.open();
            }
        }, {
            key: "close",
            value: function close() {
                if (!this.isOpen) {
                    return;
                }

                this.isOpen = false;
                this.modal.close();
            }

            /**
             * Finish timepicker selection.
             */

        }, {
            key: "done",
            value: function done(e, clearValue) {
                // Set input value
                var last = this.el.value;
                var value = clearValue ? '' : Timepicker._addLeadingZero(this.hours) + ':' + Timepicker._addLeadingZero(this.minutes);
                this.time = value;
                if (!clearValue && this.options.twelveHour) {
                    value = value + " " + this.amOrPm;
                }
                this.el.value = value;

                // Trigger change event
                if (value !== last) {
                    this.$el.trigger('change');
                }

                this.close();
                this.el.focus();
            }
        }, {
            key: "clear",
            value: function clear() {
                this.done(null, true);
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Timepicker.__proto__ || Object.getPrototypeOf(Timepicker), "init", this).call(this, this, els, options);
            }
        }, {
            key: "_addLeadingZero",
            value: function _addLeadingZero(num) {
                return (num < 10 ? '0' : '') + num;
            }
        }, {
            key: "_createSVGEl",
            value: function _createSVGEl(name) {
                var svgNS = 'http://www.w3.org/2000/svg';
                return document.createElementNS(svgNS, name);
            }

            /**
             * @typedef {Object} Point
             * @property {number} x The X Coordinate
             * @property {number} y The Y Coordinate
             */

            /**
             * Get x position of mouse or touch event
             * @param {Event} e
             * @return {Point} x and y location
             */

        }, {
            key: "_Pos",
            value: function _Pos(e) {
                if (e.targetTouches && e.targetTouches.length >= 1) {
                    return { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
                }
                // mouse event
                return { x: e.clientX, y: e.clientY };
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Timepicker;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Timepicker;
    }(Component);

    Timepicker._template = ['<div class= "modal timepicker-modal">', '<div class="modal-content timepicker-container">', '<div class="timepicker-digital-display">', '<div class="timepicker-text-container">', '<div class="timepicker-display-column">', '<span class="timepicker-span-hours text-primary"></span>', ':', '<span class="timepicker-span-minutes"></span>', '</div>', '<div class="timepicker-display-column timepicker-display-am-pm">', '<div class="timepicker-span-am-pm"></div>', '</div>', '</div>', '</div>', '<div class="timepicker-analog-display">', '<div class="timepicker-plate">', '<div class="timepicker-canvas"></div>', '<div class="timepicker-dial timepicker-hours"></div>', '<div class="timepicker-dial timepicker-minutes timepicker-dial-out"></div>', '</div>', '<div class="timepicker-footer"></div>', '</div>', '</div>', '</div>'].join('');

    M.Timepicker = Timepicker;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Timepicker, 'timepicker', 'M_Timepicker');
    }
})(cash);
; (function ($) {
    'use strict';

    var _defaults = {};

    /**
     * @class
     *
     */

    var CharacterCounter = function (_Component17) {
        _inherits(CharacterCounter, _Component17);

        /**
         * Construct CharacterCounter instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function CharacterCounter(el, options) {
            _classCallCheck(this, CharacterCounter);

            var _this61 = _possibleConstructorReturn(this, (CharacterCounter.__proto__ || Object.getPrototypeOf(CharacterCounter)).call(this, CharacterCounter, el, options));

            _this61.el.M_CharacterCounter = _this61;

            /**
             * Options for the character counter
             */
            _this61.options = $.extend({}, CharacterCounter.defaults, options);

            _this61.isInvalid = false;
            _this61.isValidLength = false;
            _this61._setupCounter();
            _this61._setupEventHandlers();
            return _this61;
        }

        _createClass(CharacterCounter, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this.el.CharacterCounter = undefined;
                this._removeCounter();
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleUpdateCounterBound = this.updateCounter.bind(this);

                this.el.addEventListener('focus', this._handleUpdateCounterBound, true);
                this.el.addEventListener('input', this._handleUpdateCounterBound, true);
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.el.removeEventListener('focus', this._handleUpdateCounterBound, true);
                this.el.removeEventListener('input', this._handleUpdateCounterBound, true);
            }

            /**
             * Setup counter element
             */

        }, {
            key: "_setupCounter",
            value: function _setupCounter() {
                this.counterEl = document.createElement('span');
                $(this.counterEl).addClass('character-counter').css({
                    float: 'right',
                    'font-size': '12px',
                    height: 1
                });

                this.$el.parent().append(this.counterEl);
            }

            /**
             * Remove counter element
             */

        }, {
            key: "_removeCounter",
            value: function _removeCounter() {
                $(this.counterEl).remove();
            }

            /**
             * Update counter
             */

        }, {
            key: "updateCounter",
            value: function updateCounter() {
                var maxLength = +this.$el.attr('data-length'),
                    actualLength = this.el.value.length;
                this.isValidLength = actualLength <= maxLength;
                var counterString = actualLength;

                if (maxLength) {
                    counterString += '/' + maxLength;
                    this._validateInput();
                }

                $(this.counterEl).html(counterString);
            }

            /**
             * Add validation classes
             */

        }, {
            key: "_validateInput",
            value: function _validateInput() {
                if (this.isValidLength && this.isInvalid) {
                    this.isInvalid = false;
                    this.$el.removeClass('invalid');
                } else if (!this.isValidLength && !this.isInvalid) {
                    this.isInvalid = true;
                    this.$el.removeClass('valid');
                    this.$el.addClass('invalid');
                }
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(CharacterCounter.__proto__ || Object.getPrototypeOf(CharacterCounter), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_CharacterCounter;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return CharacterCounter;
    }(Component);

    M.CharacterCounter = CharacterCounter;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(CharacterCounter, 'characterCounter', 'M_CharacterCounter');
    }
})(cash);
; (function ($) {
    'use strict';

    var _defaults = {
        duration: 200, // ms
        dist: -100, // zoom scale TODO: make this more intuitive as an option
        shift: 0, // spacing for center image
        padding: 0, // Padding between non center items
        numVisible: 5, // Number of visible items in carousel
        fullWidth: false, // Change to full width styles
        indicators: false, // Toggle indicators
        noWrap: false, // Don't wrap around and cycle through items.
        onCycleTo: null // Callback for when a new slide is cycled to.
    };

    /**
     * @class
     *
     */

    var Carousel = function (_Component18) {
        _inherits(Carousel, _Component18);

        /**
         * Construct Carousel instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Carousel(el, options) {
            _classCallCheck(this, Carousel);

            var _this62 = _possibleConstructorReturn(this, (Carousel.__proto__ || Object.getPrototypeOf(Carousel)).call(this, Carousel, el, options));

            _this62.el.M_Carousel = _this62;

            /**
             * Options for the carousel
             * @member Carousel#options
             * @prop {Number} duration
             * @prop {Number} dist
             * @prop {Number} shift
             * @prop {Number} padding
             * @prop {Number} numVisible
             * @prop {Boolean} fullWidth
             * @prop {Boolean} indicators
             * @prop {Boolean} noWrap
             * @prop {Function} onCycleTo
             */
            _this62.options = $.extend({}, Carousel.defaults, options);

            // Setup
            _this62.hasMultipleSlides = _this62.$el.find('.carousel-item').length > 1;
            _this62.showIndicators = _this62.options.indicators && _this62.hasMultipleSlides;
            _this62.noWrap = _this62.options.noWrap || !_this62.hasMultipleSlides;
            _this62.pressed = false;
            _this62.dragged = false;
            _this62.offset = _this62.target = 0;
            _this62.images = [];
            _this62.itemWidth = _this62.$el.find('.carousel-item').first().innerWidth();
            _this62.itemHeight = _this62.$el.find('.carousel-item').first().innerHeight();
            _this62.dim = _this62.itemWidth * 2 + _this62.options.padding || 1; // Make sure dim is non zero for divisions.
            _this62._autoScrollBound = _this62._autoScroll.bind(_this62);
            _this62._trackBound = _this62._track.bind(_this62);

            // Full Width carousel setup
            if (_this62.options.fullWidth) {
                _this62.options.dist = 0;
                _this62._setCarouselHeight();

                // Offset fixed items when indicators.
                if (_this62.showIndicators) {
                    _this62.$el.find('.carousel-fixed-item').addClass('with-indicators');
                }
            }

            // Iterate through slides
            _this62.$indicators = $('<ul class="indicators"></ul>');
            _this62.$el.find('.carousel-item').each(function (el, i) {
                _this62.images.push(el);
                if (_this62.showIndicators) {
                    var $indicator = $('<li class="indicator-item"></li>');

                    // Add active to first by default.
                    if (i === 0) {
                        $indicator[0].classList.add('active');
                    }

                    _this62.$indicators.append($indicator);
                }
            });
            if (_this62.showIndicators) {
                _this62.$el.append(_this62.$indicators);
            }
            _this62.count = _this62.images.length;

            // Cap numVisible at count
            _this62.options.numVisible = Math.min(_this62.count, _this62.options.numVisible);

            // Setup cross browser string
            _this62.xform = 'transform';
            ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
                var e = prefix + 'Transform';
                if (typeof document.body.style[e] !== 'undefined') {
                    _this62.xform = e;
                    return false;
                }
                return true;
            });

            _this62._setupEventHandlers();
            _this62._scroll(_this62.offset);
            return _this62;
        }

        _createClass(Carousel, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this.el.M_Carousel = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                var _this63 = this;

                this._handleCarouselTapBound = this._handleCarouselTap.bind(this);
                this._handleCarouselDragBound = this._handleCarouselDrag.bind(this);
                this._handleCarouselReleaseBound = this._handleCarouselRelease.bind(this);
                this._handleCarouselClickBound = this._handleCarouselClick.bind(this);

                if (typeof window.ontouchstart !== 'undefined') {
                    this.el.addEventListener('touchstart', this._handleCarouselTapBound);
                    this.el.addEventListener('touchmove', this._handleCarouselDragBound);
                    this.el.addEventListener('touchend', this._handleCarouselReleaseBound);
                }

                this.el.addEventListener('mousedown', this._handleCarouselTapBound);
                this.el.addEventListener('mousemove', this._handleCarouselDragBound);
                this.el.addEventListener('mouseup', this._handleCarouselReleaseBound);
                this.el.addEventListener('mouseleave', this._handleCarouselReleaseBound);
                this.el.addEventListener('click', this._handleCarouselClickBound);

                if (this.showIndicators && this.$indicators) {
                    this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);
                    this.$indicators.find('.indicator-item').each(function (el, i) {
                        el.addEventListener('click', _this63._handleIndicatorClickBound);
                    });
                }

                // Resize
                var throttledResize = M.throttle(this._handleResize, 200);
                this._handleThrottledResizeBound = throttledResize.bind(this);

                window.addEventListener('resize', this._handleThrottledResizeBound);
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                var _this64 = this;

                if (typeof window.ontouchstart !== 'undefined') {
                    this.el.removeEventListener('touchstart', this._handleCarouselTapBound);
                    this.el.removeEventListener('touchmove', this._handleCarouselDragBound);
                    this.el.removeEventListener('touchend', this._handleCarouselReleaseBound);
                }
                this.el.removeEventListener('mousedown', this._handleCarouselTapBound);
                this.el.removeEventListener('mousemove', this._handleCarouselDragBound);
                this.el.removeEventListener('mouseup', this._handleCarouselReleaseBound);
                this.el.removeEventListener('mouseleave', this._handleCarouselReleaseBound);
                this.el.removeEventListener('click', this._handleCarouselClickBound);

                if (this.showIndicators && this.$indicators) {
                    this.$indicators.find('.indicator-item').each(function (el, i) {
                        el.removeEventListener('click', _this64._handleIndicatorClickBound);
                    });
                }

                window.removeEventListener('resize', this._handleThrottledResizeBound);
            }

            /**
             * Handle Carousel Tap
             * @param {Event} e
             */

        }, {
            key: "_handleCarouselTap",
            value: function _handleCarouselTap(e) {
                // Fixes firefox draggable image bug
                if (e.type === 'mousedown' && $(e.target).is('img')) {
                    e.preventDefault();
                }
                this.pressed = true;
                this.dragged = false;
                this.verticalDragged = false;
                this.reference = this._xpos(e);
                this.referenceY = this._ypos(e);

                this.velocity = this.amplitude = 0;
                this.frame = this.offset;
                this.timestamp = Date.now();
                clearInterval(this.ticker);
                this.ticker = setInterval(this._trackBound, 100);
            }

            /**
             * Handle Carousel Drag
             * @param {Event} e
             */

        }, {
            key: "_handleCarouselDrag",
            value: function _handleCarouselDrag(e) {
                var x = void 0,
                    y = void 0,
                    delta = void 0,
                    deltaY = void 0;
                if (this.pressed) {
                    x = this._xpos(e);
                    y = this._ypos(e);
                    delta = this.reference - x;
                    deltaY = Math.abs(this.referenceY - y);
                    if (deltaY < 30 && !this.verticalDragged) {
                        // If vertical scrolling don't allow dragging.
                        if (delta > 2 || delta < -2) {
                            this.dragged = true;
                            this.reference = x;
                            this._scroll(this.offset + delta);
                        }
                    } else if (this.dragged) {
                        // If dragging don't allow vertical scroll.
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    } else {
                        // Vertical scrolling.
                        this.verticalDragged = true;
                    }
                }

                if (this.dragged) {
                    // If dragging don't allow vertical scroll.
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            /**
             * Handle Carousel Release
             * @param {Event} e
             */

        }, {
            key: "_handleCarouselRelease",
            value: function _handleCarouselRelease(e) {
                if (this.pressed) {
                    this.pressed = false;
                } else {
                    return;
                }

                clearInterval(this.ticker);
                this.target = this.offset;
                if (this.velocity > 10 || this.velocity < -10) {
                    this.amplitude = 0.9 * this.velocity;
                    this.target = this.offset + this.amplitude;
                }
                this.target = Math.round(this.target / this.dim) * this.dim;

                // No wrap of items.
                if (this.noWrap) {
                    if (this.target >= this.dim * (this.count - 1)) {
                        this.target = this.dim * (this.count - 1);
                    } else if (this.target < 0) {
                        this.target = 0;
                    }
                }
                this.amplitude = this.target - this.offset;
                this.timestamp = Date.now();
                requestAnimationFrame(this._autoScrollBound);

                if (this.dragged) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return false;
            }

            /**
             * Handle Carousel CLick
             * @param {Event} e
             */

        }, {
            key: "_handleCarouselClick",
            value: function _handleCarouselClick(e) {
                // Disable clicks if carousel was dragged.
                if (this.dragged) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                } else if (!this.options.fullWidth) {
                    var clickedIndex = $(e.target).closest('.carousel-item').index();
                    var diff = this._wrap(this.center) - clickedIndex;

                    // Disable clicks if carousel was shifted by click
                    if (diff !== 0) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    this._cycleTo(clickedIndex);
                }
            }

            /**
             * Handle Indicator CLick
             * @param {Event} e
             */

        }, {
            key: "_handleIndicatorClick",
            value: function _handleIndicatorClick(e) {
                e.stopPropagation();

                var indicator = $(e.target).closest('.indicator-item');
                if (indicator.length) {
                    this._cycleTo(indicator.index());
                }
            }

            /**
             * Handle Throttle Resize
             * @param {Event} e
             */

        }, {
            key: "_handleResize",
            value: function _handleResize(e) {
                if (this.options.fullWidth) {
                    this.itemWidth = this.$el.find('.carousel-item').first().innerWidth();
                    this.imageHeight = this.$el.find('.carousel-item.active').height();
                    this.dim = this.itemWidth * 2 + this.options.padding;
                    this.offset = this.center * 2 * this.itemWidth;
                    this.target = this.offset;
                    this._setCarouselHeight(true);
                } else {
                    this._scroll();
                }
            }

            /**
             * Set carousel height based on first slide
             * @param {Booleam} imageOnly - true for image slides
             */

        }, {
            key: "_setCarouselHeight",
            value: function _setCarouselHeight(imageOnly) {
                var _this65 = this;

                var firstSlide = this.$el.find('.carousel-item.active').length ? this.$el.find('.carousel-item.active').first() : this.$el.find('.carousel-item').first();
                var firstImage = firstSlide.find('img').first();
                if (firstImage.length) {
                    if (firstImage[0].complete) {
                        // If image won't trigger the load event
                        var imageHeight = firstImage.height();
                        if (imageHeight > 0) {
                            this.$el.css('height', imageHeight + 'px');
                        } else {
                            // If image still has no height, use the natural dimensions to calculate
                            var naturalWidth = firstImage[0].naturalWidth;
                            var naturalHeight = firstImage[0].naturalHeight;
                            var adjustedHeight = this.$el.width() / naturalWidth * naturalHeight;
                            this.$el.css('height', adjustedHeight + 'px');
                        }
                    } else {
                        // Get height when image is loaded normally
                        firstImage.one('load', function (el, i) {
                            _this65.$el.css('height', el.offsetHeight + 'px');
                        });
                    }
                } else if (!imageOnly) {
                    var slideHeight = firstSlide.height();
                    this.$el.css('height', slideHeight + 'px');
                }
            }

            /**
             * Get x position from event
             * @param {Event} e
             */

        }, {
            key: "_xpos",
            value: function _xpos(e) {
                // touch event
                if (e.targetTouches && e.targetTouches.length >= 1) {
                    return e.targetTouches[0].clientX;
                }

                // mouse event
                return e.clientX;
            }

            /**
             * Get y position from event
             * @param {Event} e
             */

        }, {
            key: "_ypos",
            value: function _ypos(e) {
                // touch event
                if (e.targetTouches && e.targetTouches.length >= 1) {
                    return e.targetTouches[0].clientY;
                }

                // mouse event
                return e.clientY;
            }

            /**
             * Wrap index
             * @param {Number} x
             */

        }, {
            key: "_wrap",
            value: function _wrap(x) {
                return x >= this.count ? x % this.count : x < 0 ? this._wrap(this.count + x % this.count) : x;
            }

            /**
             * Tracks scrolling information
             */

        }, {
            key: "_track",
            value: function _track() {
                var now = void 0,
                    elapsed = void 0,
                    delta = void 0,
                    v = void 0;

                now = Date.now();
                elapsed = now - this.timestamp;
                this.timestamp = now;
                delta = this.offset - this.frame;
                this.frame = this.offset;

                v = 1000 * delta / (1 + elapsed);
                this.velocity = 0.8 * v + 0.2 * this.velocity;
            }

            /**
             * Auto scrolls to nearest carousel item.
             */

        }, {
            key: "_autoScroll",
            value: function _autoScroll() {
                var elapsed = void 0,
                    delta = void 0;

                if (this.amplitude) {
                    elapsed = Date.now() - this.timestamp;
                    delta = this.amplitude * Math.exp(-elapsed / this.options.duration);
                    if (delta > 2 || delta < -2) {
                        this._scroll(this.target - delta);
                        requestAnimationFrame(this._autoScrollBound);
                    } else {
                        this._scroll(this.target);
                    }
                }
            }

            /**
             * Scroll to target
             * @param {Number} x
             */

        }, {
            key: "_scroll",
            value: function _scroll(x) {
                var _this66 = this;

                // Track scrolling state
                if (!this.$el.hasClass('scrolling')) {
                    this.el.classList.add('scrolling');
                }
                if (this.scrollingTimeout != null) {
                    window.clearTimeout(this.scrollingTimeout);
                }
                this.scrollingTimeout = window.setTimeout(function () {
                    _this66.$el.removeClass('scrolling');
                }, this.options.duration);

                // Start actual scroll
                var i = void 0,
                    half = void 0,
                    delta = void 0,
                    dir = void 0,
                    tween = void 0,
                    el = void 0,
                    alignment = void 0,
                    zTranslation = void 0,
                    tweenedOpacity = void 0,
                    centerTweenedOpacity = void 0;
                var lastCenter = this.center;
                var numVisibleOffset = 1 / this.options.numVisible;

                this.offset = typeof x === 'number' ? x : this.offset;
                this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
                delta = this.offset - this.center * this.dim;
                dir = delta < 0 ? 1 : -1;
                tween = -dir * delta * 2 / this.dim;
                half = this.count >> 1;

                if (this.options.fullWidth) {
                    alignment = 'translateX(0)';
                    centerTweenedOpacity = 1;
                } else {
                    alignment = 'translateX(' + (this.el.clientWidth - this.itemWidth) / 2 + 'px) ';
                    alignment += 'translateY(' + (this.el.clientHeight - this.itemHeight) / 2 + 'px)';
                    centerTweenedOpacity = 1 - numVisibleOffset * tween;
                }

                // Set indicator active
                if (this.showIndicators) {
                    var diff = this.center % this.count;
                    var activeIndicator = this.$indicators.find('.indicator-item.active');
                    if (activeIndicator.index() !== diff) {
                        activeIndicator.removeClass('active');
                        this.$indicators.find('.indicator-item').eq(diff)[0].classList.add('active');
                    }
                }

                // center
                // Don't show wrapped items.
                if (!this.noWrap || this.center >= 0 && this.center < this.count) {
                    el = this.images[this._wrap(this.center)];

                    // Add active class to center item.
                    if (!$(el).hasClass('active')) {
                        this.$el.find('.carousel-item').removeClass('active');
                        el.classList.add('active');
                    }
                    var transformString = alignment + " translateX(" + -delta / 2 + "px) translateX(" + dir * this.options.shift * tween * i + "px) translateZ(" + this.options.dist * tween + "px)";
                    this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
                }

                for (i = 1; i <= half; ++i) {
                    // right side
                    if (this.options.fullWidth) {
                        zTranslation = this.options.dist;
                        tweenedOpacity = i === half && delta < 0 ? 1 - tween : 1;
                    } else {
                        zTranslation = this.options.dist * (i * 2 + tween * dir);
                        tweenedOpacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
                    }
                    // Don't show wrapped items.
                    if (!this.noWrap || this.center + i < this.count) {
                        el = this.images[this._wrap(this.center + i)];
                        var _transformString = alignment + " translateX(" + (this.options.shift + (this.dim * i - delta) / 2) + "px) translateZ(" + zTranslation + "px)";
                        this._updateItemStyle(el, tweenedOpacity, -i, _transformString);
                    }

                    // left side
                    if (this.options.fullWidth) {
                        zTranslation = this.options.dist;
                        tweenedOpacity = i === half && delta > 0 ? 1 - tween : 1;
                    } else {
                        zTranslation = this.options.dist * (i * 2 - tween * dir);
                        tweenedOpacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
                    }
                    // Don't show wrapped items.
                    if (!this.noWrap || this.center - i >= 0) {
                        el = this.images[this._wrap(this.center - i)];
                        var _transformString2 = alignment + " translateX(" + (-this.options.shift + (-this.dim * i - delta) / 2) + "px) translateZ(" + zTranslation + "px)";
                        this._updateItemStyle(el, tweenedOpacity, -i, _transformString2);
                    }
                }

                // center
                // Don't show wrapped items.
                if (!this.noWrap || this.center >= 0 && this.center < this.count) {
                    el = this.images[this._wrap(this.center)];
                    var _transformString3 = alignment + " translateX(" + -delta / 2 + "px) translateX(" + dir * this.options.shift * tween + "px) translateZ(" + this.options.dist * tween + "px)";
                    this._updateItemStyle(el, centerTweenedOpacity, 0, _transformString3);
                }

                // onCycleTo callback
                var $currItem = this.$el.find('.carousel-item').eq(this._wrap(this.center));
                if (lastCenter !== this.center && typeof this.options.onCycleTo === 'function') {
                    this.options.onCycleTo.call(this, $currItem[0], this.dragged);
                }

                // One time callback
                if (typeof this.oneTimeCallback === 'function') {
                    this.oneTimeCallback.call(this, $currItem[0], this.dragged);
                    this.oneTimeCallback = null;
                }
            }

            /**
             * Cycle to target
             * @param {Element} el
             * @param {Number} opacity
             * @param {Number} zIndex
             * @param {String} transform
             */

        }, {
            key: "_updateItemStyle",
            value: function _updateItemStyle(el, opacity, zIndex, transform) {
                el.style[this.xform] = transform;
                el.style.zIndex = zIndex;
                el.style.opacity = opacity;
                el.style.visibility = 'visible';
            }

            /**
             * Cycle to target
             * @param {Number} n
             * @param {Function} callback
             */

        }, {
            key: "_cycleTo",
            value: function _cycleTo(n, callback) {
                var diff = this.center % this.count - n;

                // Account for wraparound.
                if (!this.noWrap) {
                    if (diff < 0) {
                        if (Math.abs(diff + this.count) < Math.abs(diff)) {
                            diff += this.count;
                        }
                    } else if (diff > 0) {
                        if (Math.abs(diff - this.count) < diff) {
                            diff -= this.count;
                        }
                    }
                }

                this.target = this.dim * Math.round(this.offset / this.dim);
                // Next
                if (diff < 0) {
                    this.target += this.dim * Math.abs(diff);

                    // Prev
                } else if (diff > 0) {
                    this.target -= this.dim * diff;
                }

                // Set one time callback
                if (typeof callback === 'function') {
                    this.oneTimeCallback = callback;
                }

                // Scroll
                if (this.offset !== this.target) {
                    this.amplitude = this.target - this.offset;
                    this.timestamp = Date.now();
                    requestAnimationFrame(this._autoScrollBound);
                }
            }

            /**
             * Cycle to next item
             * @param {Number} [n]
             */

        }, {
            key: "next",
            value: function next(n) {
                if (n === undefined || isNaN(n)) {
                    n = 1;
                }

                var index = this.center + n;
                if (index >= this.count || index < 0) {
                    if (this.noWrap) {
                        return;
                    }

                    index = this._wrap(index);
                }
                this._cycleTo(index);
            }

            /**
             * Cycle to previous item
             * @param {Number} [n]
             */

        }, {
            key: "prev",
            value: function prev(n) {
                if (n === undefined || isNaN(n)) {
                    n = 1;
                }

                var index = this.center - n;
                if (index >= this.count || index < 0) {
                    if (this.noWrap) {
                        return;
                    }

                    index = this._wrap(index);
                }

                this._cycleTo(index);
            }

            /**
             * Cycle to nth item
             * @param {Number} [n]
             * @param {Function} callback
             */

        }, {
            key: "set",
            value: function set(n, callback) {
                if (n === undefined || isNaN(n)) {
                    n = 0;
                }

                if (n > this.count || n < 0) {
                    if (this.noWrap) {
                        return;
                    }

                    n = this._wrap(n);
                }

                this._cycleTo(n, callback);
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Carousel.__proto__ || Object.getPrototypeOf(Carousel), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Carousel;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Carousel;
    }(Component);

    M.Carousel = Carousel;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Carousel, 'carousel', 'M_Carousel');
    }
})(cash);
; (function ($) {
    'use strict';

    var _defaults = {
        onOpen: undefined,
        onClose: undefined
    };

    /**
     * @class
     *
     */

    var TapTarget = function (_Component19) {
        _inherits(TapTarget, _Component19);

        /**
         * Construct TapTarget instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function TapTarget(el, options) {
            _classCallCheck(this, TapTarget);

            var _this67 = _possibleConstructorReturn(this, (TapTarget.__proto__ || Object.getPrototypeOf(TapTarget)).call(this, TapTarget, el, options));

            _this67.el.M_TapTarget = _this67;

            /**
             * Options for the select
             * @member TapTarget#options
             * @prop {Function} onOpen - Callback function called when feature discovery is opened
             * @prop {Function} onClose - Callback function called when feature discovery is closed
             */
            _this67.options = $.extend({}, TapTarget.defaults, options);

            _this67.isOpen = false;

            // setup
            _this67.$origin = $('#' + _this67.$el.attr('data-target'));
            _this67._setup();

            _this67._calculatePositioning();
            _this67._setupEventHandlers();
            return _this67;
        }

        _createClass(TapTarget, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this.el.TapTarget = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
                this._handleTargetClickBound = this._handleTargetClick.bind(this);
                this._handleOriginClickBound = this._handleOriginClick.bind(this);

                this.el.addEventListener('click', this._handleTargetClickBound);
                this.originEl.addEventListener('click', this._handleOriginClickBound);

                // Resize
                var throttledResize = M.throttle(this._handleResize, 200);
                this._handleThrottledResizeBound = throttledResize.bind(this);

                window.addEventListener('resize', this._handleThrottledResizeBound);
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.el.removeEventListener('click', this._handleTargetClickBound);
                this.originEl.removeEventListener('click', this._handleOriginClickBound);
                window.removeEventListener('resize', this._handleThrottledResizeBound);
            }

            /**
             * Handle Target Click
             * @param {Event} e
             */

        }, {
            key: "_handleTargetClick",
            value: function _handleTargetClick(e) {
                this.open();
            }

            /**
             * Handle Origin Click
             * @param {Event} e
             */

        }, {
            key: "_handleOriginClick",
            value: function _handleOriginClick(e) {
                this.close();
            }

            /**
             * Handle Resize
             * @param {Event} e
             */

        }, {
            key: "_handleResize",
            value: function _handleResize(e) {
                this._calculatePositioning();
            }

            /**
             * Handle Resize
             * @param {Event} e
             */

        }, {
            key: "_handleDocumentClick",
            value: function _handleDocumentClick(e) {
                if (!$(e.target).closest('.tap-target-wrapper').length) {
                    this.close();
                    e.preventDefault();
                    e.stopPropagation();
                }
            }

            /**
             * Setup Tap Target
             */

        }, {
            key: "_setup",
            value: function _setup() {
                // Creating tap target
                this.wrapper = this.$el.parent()[0];
                this.waveEl = $(this.wrapper).find('.tap-target-wave')[0];
                this.originEl = $(this.wrapper).find('.tap-target-origin')[0];
                this.contentEl = this.$el.find('.tap-target-content')[0];

                // Creating wrapper
                if (!$(this.wrapper).hasClass('.tap-target-wrapper')) {
                    this.wrapper = document.createElement('div');
                    this.wrapper.classList.add('tap-target-wrapper');
                    this.$el.before($(this.wrapper));
                    this.wrapper.append(this.el);
                }

                // Creating content
                if (!this.contentEl) {
                    this.contentEl = document.createElement('div');
                    this.contentEl.classList.add('tap-target-content');
                    this.$el.append(this.contentEl);
                }

                // Creating foreground wave
                if (!this.waveEl) {
                    this.waveEl = document.createElement('div');
                    this.waveEl.classList.add('tap-target-wave');

                    // Creating origin
                    if (!this.originEl) {
                        this.originEl = this.$origin.clone(true, true);
                        this.originEl.addClass('tap-target-origin');
                        this.originEl.removeAttr('id');
                        this.originEl.removeAttr('style');
                        this.originEl = this.originEl[0];
                        this.waveEl.append(this.originEl);
                    }

                    this.wrapper.append(this.waveEl);
                }
            }

            /**
             * Calculate positioning
             */

        }, {
            key: "_calculatePositioning",
            value: function _calculatePositioning() {
                // Element or parent is fixed position?
                var isFixed = this.$origin.css('position') === 'fixed';
                if (!isFixed) {
                    var parents = this.$origin.parents();
                    for (var i = 0; i < parents.length; i++) {
                        isFixed = $(parents[i]).css('position') == 'fixed';
                        if (isFixed) {
                            break;
                        }
                    }
                }

                // Calculating origin
                var originWidth = this.$origin.outerWidth();
                var originHeight = this.$origin.outerHeight();
                var originTop = isFixed ? this.$origin.offset().top - M.getDocumentScrollTop() : this.$origin.offset().top;
                var originLeft = isFixed ? this.$origin.offset().left - M.getDocumentScrollLeft() : this.$origin.offset().left;

                // Calculating screen
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;
                var centerX = windowWidth / 2;
                var centerY = windowHeight / 2;
                var isLeft = originLeft <= centerX;
                var isRight = originLeft > centerX;
                var isTop = originTop <= centerY;
                var isBottom = originTop > centerY;
                var isCenterX = originLeft >= windowWidth * 0.25 && originLeft <= windowWidth * 0.75;

                // Calculating tap target
                var tapTargetWidth = this.$el.outerWidth();
                var tapTargetHeight = this.$el.outerHeight();
                var tapTargetTop = originTop + originHeight / 2 - tapTargetHeight / 2;
                var tapTargetLeft = originLeft + originWidth / 2 - tapTargetWidth / 2;
                var tapTargetPosition = isFixed ? 'fixed' : 'absolute';

                // Calculating content
                var tapTargetTextWidth = isCenterX ? tapTargetWidth : tapTargetWidth / 2 + originWidth;
                var tapTargetTextHeight = tapTargetHeight / 2;
                var tapTargetTextTop = isTop ? tapTargetHeight / 2 : 0;
                var tapTargetTextBottom = 0;
                var tapTargetTextLeft = isLeft && !isCenterX ? tapTargetWidth / 2 - originWidth : 0;
                var tapTargetTextRight = 0;
                var tapTargetTextPadding = originWidth;
                var tapTargetTextAlign = isBottom ? 'bottom' : 'top';

                // Calculating wave
                var tapTargetWaveWidth = originWidth > originHeight ? originWidth * 2 : originWidth * 2;
                var tapTargetWaveHeight = tapTargetWaveWidth;
                var tapTargetWaveTop = tapTargetHeight / 2 - tapTargetWaveHeight / 2;
                var tapTargetWaveLeft = tapTargetWidth / 2 - tapTargetWaveWidth / 2;

                // Setting tap target
                var tapTargetWrapperCssObj = {};
                tapTargetWrapperCssObj.top = isTop ? tapTargetTop + 'px' : '';
                tapTargetWrapperCssObj.right = isRight ? windowWidth - tapTargetLeft - tapTargetWidth + 'px' : '';
                tapTargetWrapperCssObj.bottom = isBottom ? windowHeight - tapTargetTop - tapTargetHeight + 'px' : '';
                tapTargetWrapperCssObj.left = isLeft ? tapTargetLeft + 'px' : '';
                tapTargetWrapperCssObj.position = tapTargetPosition;
                $(this.wrapper).css(tapTargetWrapperCssObj);

                // Setting content
                $(this.contentEl).css({
                    width: tapTargetTextWidth + 'px',
                    height: tapTargetTextHeight + 'px',
                    top: tapTargetTextTop + 'px',
                    right: tapTargetTextRight + 'px',
                    bottom: tapTargetTextBottom + 'px',
                    left: tapTargetTextLeft + 'px',
                    padding: tapTargetTextPadding + 'px',
                    verticalAlign: tapTargetTextAlign
                });

                // Setting wave
                $(this.waveEl).css({
                    top: tapTargetWaveTop + 'px',
                    left: tapTargetWaveLeft + 'px',
                    width: tapTargetWaveWidth + 'px',
                    height: tapTargetWaveHeight + 'px'
                });
            }

            /**
             * Open TapTarget
             */

        }, {
            key: "open",
            value: function open() {
                if (this.isOpen) {
                    return;
                }

                // onOpen callback
                if (typeof this.options.onOpen === 'function') {
                    this.options.onOpen.call(this, this.$origin[0]);
                }

                this.isOpen = true;
                this.wrapper.classList.add('open');

                document.body.addEventListener('click', this._handleDocumentClickBound, true);
                document.body.addEventListener('touchend', this._handleDocumentClickBound);
            }

            /**
             * Close Tap Target
             */

        }, {
            key: "close",
            value: function close() {
                if (!this.isOpen) {
                    return;
                }

                // onClose callback
                if (typeof this.options.onClose === 'function') {
                    this.options.onClose.call(this, this.$origin[0]);
                }

                this.isOpen = false;
                this.wrapper.classList.remove('open');

                document.body.removeEventListener('click', this._handleDocumentClickBound, true);
                document.body.removeEventListener('touchend', this._handleDocumentClickBound);
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(TapTarget.__proto__ || Object.getPrototypeOf(TapTarget), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_TapTarget;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return TapTarget;
    }(Component);

    M.TapTarget = TapTarget;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(TapTarget, 'tapTarget', 'M_TapTarget');
    }
})(cash);
; (function ($) {
    'use strict';

    var _defaults = {
        classes: '',
        dropdownOptions: {}
    };

    /**
     * @class
     *
     */

    var FormSelect = function (_Component20) {
        _inherits(FormSelect, _Component20);

        /**
         * Construct FormSelect instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function FormSelect(el, options) {
            _classCallCheck(this, FormSelect);

            // Don't init if browser default version
            var _this68 = _possibleConstructorReturn(this, (FormSelect.__proto__ || Object.getPrototypeOf(FormSelect)).call(this, FormSelect, el, options));

            if (_this68.$el.hasClass('browser-default')) {
                return _possibleConstructorReturn(_this68);
            }

            _this68.el.M_FormSelect = _this68;

            /**
             * Options for the select
             * @member FormSelect#options
             */
            _this68.options = $.extend({}, FormSelect.defaults, options);

            _this68.isMultiple = _this68.$el.prop('multiple');

            // Setup
            _this68.el.tabIndex = -1;
            _this68._keysSelected = {};
            _this68._valueDict = {}; // Maps key to original and generated option element.
            _this68._setupDropdown();

            _this68._setupEventHandlers();
            return _this68;
        }

        _createClass(FormSelect, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this._removeDropdown();
                this.el.M_FormSelect = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                var _this69 = this;

                this._handleSelectChangeBound = this._handleSelectChange.bind(this);
                this._handleOptionClickBound = this._handleOptionClick.bind(this);
                this._handleInputClickBound = this._handleInputClick.bind(this);

                $(this.dropdownOptions).find('li:not(.optgroup)').each(function (el) {
                    el.addEventListener('click', _this69._handleOptionClickBound);
                });
                this.el.addEventListener('change', this._handleSelectChangeBound);
                this.input.addEventListener('click', this._handleInputClickBound);
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                var _this70 = this;

                $(this.dropdownOptions).find('li:not(.optgroup)').each(function (el) {
                    el.removeEventListener('click', _this70._handleOptionClickBound);
                });
                this.el.removeEventListener('change', this._handleSelectChangeBound);
                this.input.removeEventListener('click', this._handleInputClickBound);
            }

            /**
             * Handle Select Change
             * @param {Event} e
             */

        }, {
            key: "_handleSelectChange",
            value: function _handleSelectChange(e) {
                this._setValueToInput();
            }

            /**
             * Handle Option Click
             * @param {Event} e
             */

        }, {
            key: "_handleOptionClick",
            value: function _handleOptionClick(e) {
                e.preventDefault();
                var option = $(e.target).closest('li')[0];
                var key = option.id;
                if (!$(option).hasClass('disabled') && !$(option).hasClass('optgroup') && key.length) {
                    var selected = true;

                    if (this.isMultiple) {
                        // Deselect placeholder option if still selected.
                        var placeholderOption = $(this.dropdownOptions).find('li.disabled.selected');
                        if (placeholderOption.length) {
                            placeholderOption.removeClass('selected');
                            placeholderOption.find('input[type="checkbox"]').prop('checked', false);
                            this._toggleEntryFromArray(placeholderOption[0].id);
                        }
                        selected = this._toggleEntryFromArray(key);
                    } else {
                        $(this.dropdownOptions).find('li').removeClass('selected');
                        $(option).toggleClass('selected', selected);
                    }

                    // Set selected on original select option
                    // Only trigger if selected state changed
                    var prevSelected = $(this._valueDict[key].el).prop('selected');
                    if (prevSelected !== selected) {
                        $(this._valueDict[key].el).prop('selected', selected);
                        this.$el.trigger('change');
                    }
                }

                e.stopPropagation();
            }

            /**
             * Handle Input Click
             */

        }, {
            key: "_handleInputClick",
            value: function _handleInputClick() {
                if (this.dropdown && this.dropdown.isOpen) {
                    this._setValueToInput();
                    this._setSelectedStates();
                }
            }

            /**
             * Setup dropdown
             */

        }, {
            key: "_setupDropdown",
            value: function _setupDropdown() {
                var _this71 = this;

                this.wrapper = document.createElement('div');
                $(this.wrapper).addClass('select-wrapper ' + this.options.classes);
                this.$el.before($(this.wrapper));
                this.wrapper.appendChild(this.el);

                if (this.el.disabled) {
                    this.wrapper.classList.add('disabled');
                }

                // Create dropdown
                this.$selectOptions = this.$el.children('option, optgroup');
                this.dropdownOptions = document.createElement('ul');
                this.dropdownOptions.id = "select-options-" + M.guid();
                $(this.dropdownOptions).addClass('dropdown-content select-dropdown ' + (this.isMultiple ? 'multiple-select-dropdown' : ''));

                // Create dropdown structure.
                if (this.$selectOptions.length) {
                    this.$selectOptions.each(function (el) {
                        if ($(el).is('option')) {
                            // Direct descendant option.
                            var optionEl = void 0;
                            if (_this71.isMultiple) {
                                optionEl = _this71._appendOptionWithIcon(_this71.$el, el, 'multiple');
                            } else {
                                optionEl = _this71._appendOptionWithIcon(_this71.$el, el);
                            }

                            _this71._addOptionToValueDict(el, optionEl);
                        } else if ($(el).is('optgroup')) {
                            // Optgroup.
                            var selectOptions = $(el).children('option');
                            $(_this71.dropdownOptions).append($('<li class="optgroup"><span>' + el.getAttribute('label') + '</span></li>')[0]);

                            selectOptions.each(function (el) {
                                var optionEl = _this71._appendOptionWithIcon(_this71.$el, el, 'optgroup-option');
                                _this71._addOptionToValueDict(el, optionEl);
                            });
                        }
                    });
                }

                this.$el.after(this.dropdownOptions);

                // Add input dropdown
                this.input = document.createElement('input');
                $(this.input).addClass('select-dropdown dropdown-trigger');
                this.input.setAttribute('type', 'text');
                this.input.setAttribute('readonly', 'true');
                this.input.setAttribute('data-target', this.dropdownOptions.id);
                if (this.el.disabled) {
                    $(this.input).prop('disabled', 'true');
                }

                this.$el.before(this.input);
                this._setValueToInput();

                // Add caret
                var dropdownIcon = $('<svg class="caret" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
                this.$el.before(dropdownIcon[0]);

                // Initialize dropdown
                if (!this.el.disabled) {
                    var dropdownOptions = $.extend({}, this.options.dropdownOptions);

                    // Add callback for centering selected option when dropdown content is scrollable
                    dropdownOptions.onOpenEnd = function (el) {
                        var selectedOption = $(_this71.dropdownOptions).find('.selected').first();

                        if (selectedOption.length) {
                            // Focus selected option in dropdown
                            M.keyDown = true;
                            _this71.dropdown.focusedIndex = selectedOption.index();
                            _this71.dropdown._focusFocusedItem();
                            M.keyDown = false;

                            // Handle scrolling to selected option
                            if (_this71.dropdown.isScrollable) {
                                var scrollOffset = selectedOption[0].getBoundingClientRect().top - _this71.dropdownOptions.getBoundingClientRect().top; // scroll to selected option
                                scrollOffset -= _this71.dropdownOptions.clientHeight / 2; // center in dropdown
                                _this71.dropdownOptions.scrollTop = scrollOffset;
                            }
                        }
                    };

                    if (this.isMultiple) {
                        dropdownOptions.closeOnClick = false;
                    }
                    this.dropdown = M.Dropdown.init(this.input, dropdownOptions);
                }

                // Add initial selections
                this._setSelectedStates();
            }

            /**
             * Add option to value dict
             * @param {Element} el  original option element
             * @param {Element} optionEl  generated option element
             */

        }, {
            key: "_addOptionToValueDict",
            value: function _addOptionToValueDict(el, optionEl) {
                var index = Object.keys(this._valueDict).length;
                var key = this.dropdownOptions.id + index;
                var obj = {};
                optionEl.id = key;

                obj.el = el;
                obj.optionEl = optionEl;
                this._valueDict[key] = obj;
            }

            /**
             * Remove dropdown
             */

        }, {
            key: "_removeDropdown",
            value: function _removeDropdown() {
                $(this.wrapper).find('.caret').remove();
                $(this.input).remove();
                $(this.dropdownOptions).remove();
                $(this.wrapper).before(this.$el);
                $(this.wrapper).remove();
            }

            /**
             * Setup dropdown
             * @param {Element} select  select element
             * @param {Element} option  option element from select
             * @param {String} type
             * @return {Element}  option element added
             */

        }, {
            key: "_appendOptionWithIcon",
            value: function _appendOptionWithIcon(select, option, type) {
                // Add disabled attr if disabled
                var disabledClass = option.disabled ? 'disabled ' : '';
                var optgroupClass = type === 'optgroup-option' ? 'optgroup-option ' : '';
                var multipleCheckbox = this.isMultiple ? "<label><input type=\"checkbox\"" + disabledClass + "\"/><span>" + option.innerHTML + "</span></label>" : option.innerHTML;
                var liEl = $('<li></li>');
                var spanEl = $('<span></span>');
                spanEl.html(multipleCheckbox);
                liEl.addClass(disabledClass + " " + optgroupClass);
                liEl.append(spanEl);

                // add icons
                var iconUrl = option.getAttribute('data-icon');
                if (!!iconUrl) {
                    var imgEl = $("<img alt=\"\" src=\"" + iconUrl + "\">");
                    liEl.prepend(imgEl);
                }

                // Check for multiple type.
                $(this.dropdownOptions).append(liEl[0]);
                return liEl[0];
            }

            /**
             * Toggle entry from option
             * @param {String} key  Option key
             * @return {Boolean}  if entry was added or removed
             */

        }, {
            key: "_toggleEntryFromArray",
            value: function _toggleEntryFromArray(key) {
                var notAdded = !this._keysSelected.hasOwnProperty(key);
                var $optionLi = $(this._valueDict[key].optionEl);

                if (notAdded) {
                    this._keysSelected[key] = true;
                } else {
                    delete this._keysSelected[key];
                }

                $optionLi.toggleClass('selected', notAdded);

                // Set checkbox checked value
                $optionLi.find('input[type="checkbox"]').prop('checked', notAdded);

                // use notAdded instead of true (to detect if the option is selected or not)
                $optionLi.prop('selected', notAdded);

                return notAdded;
            }

            /**
             * Set text value to input
             */

        }, {
            key: "_setValueToInput",
            value: function _setValueToInput() {
                var values = [];
                var options = this.$el.find('option');

                options.each(function (el) {
                    if ($(el).prop('selected')) {
                        var text = $(el).text();
                        values.push(text);
                    }
                });

                if (!values.length) {
                    var firstDisabled = this.$el.find('option:disabled').eq(0);
                    if (firstDisabled.length && firstDisabled[0].value === '') {
                        values.push(firstDisabled.text());
                    }
                }

                this.input.value = values.join(', ');
            }

            /**
             * Set selected state of dropdown to match actual select element
             */

        }, {
            key: "_setSelectedStates",
            value: function _setSelectedStates() {
                this._keysSelected = {};

                for (var key in this._valueDict) {
                    var option = this._valueDict[key];
                    var optionIsSelected = $(option.el).prop('selected');
                    $(option.optionEl).find('input[type="checkbox"]').prop('checked', optionIsSelected);
                    if (optionIsSelected) {
                        this._activateOption($(this.dropdownOptions), $(option.optionEl));
                        this._keysSelected[key] = true;
                    } else {
                        $(option.optionEl).removeClass('selected');
                    }
                }
            }

            /**
             * Make option as selected and scroll to selected position
             * @param {jQuery} collection  Select options jQuery element
             * @param {Element} newOption  element of the new option
             */

        }, {
            key: "_activateOption",
            value: function _activateOption(collection, newOption) {
                if (newOption) {
                    if (!this.isMultiple) {
                        collection.find('li.selected').removeClass('selected');
                    }
                    var option = $(newOption);
                    option.addClass('selected');
                }
            }

            /**
             * Get Selected Values
             * @return {Array}  Array of selected values
             */

        }, {
            key: "getSelectedValues",
            value: function getSelectedValues() {
                var selectedValues = [];
                for (var key in this._keysSelected) {
                    selectedValues.push(this._valueDict[key].el.value);
                }
                return selectedValues;
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(FormSelect.__proto__ || Object.getPrototypeOf(FormSelect), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_FormSelect;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return FormSelect;
    }(Component);

    M.FormSelect = FormSelect;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(FormSelect, 'formSelect', 'M_FormSelect');
    }
})(cash);
; (function ($, anim) {
    'use strict';

    var _defaults = {};

    /**
     * @class
     *
     */

    var Range = function (_Component21) {
        _inherits(Range, _Component21);

        /**
         * Construct Range instance
         * @constructor
         * @param {Element} el
         * @param {Object} options
         */
        function Range(el, options) {
            _classCallCheck(this, Range);

            var _this72 = _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).call(this, Range, el, options));

            _this72.el.M_Range = _this72;

            /**
             * Options for the range
             * @member Range#options
             */
            _this72.options = $.extend({}, Range.defaults, options);

            _this72._mousedown = false;

            // Setup
            _this72._setupThumb();

            _this72._setupEventHandlers();
            return _this72;
        }

        _createClass(Range, [{
            key: "destroy",


            /**
             * Teardown component
             */
            value: function destroy() {
                this._removeEventHandlers();
                this._removeThumb();
                this.el.M_Range = undefined;
            }

            /**
             * Setup Event Handlers
             */

        }, {
            key: "_setupEventHandlers",
            value: function _setupEventHandlers() {
                this._handleRangeChangeBound = this._handleRangeChange.bind(this);
                this._handleRangeMousedownTouchstartBound = this._handleRangeMousedownTouchstart.bind(this);
                this._handleRangeInputMousemoveTouchmoveBound = this._handleRangeInputMousemoveTouchmove.bind(this);
                this._handleRangeMouseupTouchendBound = this._handleRangeMouseupTouchend.bind(this);
                this._handleRangeBlurMouseoutTouchleaveBound = this._handleRangeBlurMouseoutTouchleave.bind(this);

                this.el.addEventListener('change', this._handleRangeChangeBound);

                this.el.addEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
                this.el.addEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

                this.el.addEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
                this.el.addEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
                this.el.addEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

                this.el.addEventListener('mouseup', this._handleRangeMouseupTouchendBound);
                this.el.addEventListener('touchend', this._handleRangeMouseupTouchendBound);

                this.el.addEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
                this.el.addEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
                this.el.addEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
            }

            /**
             * Remove Event Handlers
             */

        }, {
            key: "_removeEventHandlers",
            value: function _removeEventHandlers() {
                this.el.removeEventListener('change', this._handleRangeChangeBound);

                this.el.removeEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
                this.el.removeEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

                this.el.removeEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
                this.el.removeEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
                this.el.removeEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

                this.el.removeEventListener('mouseup', this._handleRangeMouseupTouchendBound);
                this.el.removeEventListener('touchend', this._handleRangeMouseupTouchendBound);

                this.el.removeEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
                this.el.removeEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
                this.el.removeEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
            }

            /**
             * Handle Range Change
             * @param {Event} e
             */

        }, {
            key: "_handleRangeChange",
            value: function _handleRangeChange() {
                $(this.value).html(this.$el.val());

                if (!$(this.thumb).hasClass('active')) {
                    this._showRangeBubble();
                }

                var offsetLeft = this._calcRangeOffset();
                $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
            }

            /**
             * Handle Range Mousedown and Touchstart
             * @param {Event} e
             */

        }, {
            key: "_handleRangeMousedownTouchstart",
            value: function _handleRangeMousedownTouchstart(e) {
                // Set indicator value
                $(this.value).html(this.$el.val());

                this._mousedown = true;
                this.$el.addClass('active');

                if (!$(this.thumb).hasClass('active')) {
                    this._showRangeBubble();
                }

                if (e.type !== 'input') {
                    var offsetLeft = this._calcRangeOffset();
                    $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
                }
            }

            /**
             * Handle Range Input, Mousemove and Touchmove
             */

        }, {
            key: "_handleRangeInputMousemoveTouchmove",
            value: function _handleRangeInputMousemoveTouchmove() {
                if (this._mousedown) {
                    if (!$(this.thumb).hasClass('active')) {
                        this._showRangeBubble();
                    }

                    var offsetLeft = this._calcRangeOffset();
                    $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
                    $(this.value).html(this.$el.val());
                }
            }

            /**
             * Handle Range Mouseup and Touchend
             */

        }, {
            key: "_handleRangeMouseupTouchend",
            value: function _handleRangeMouseupTouchend() {
                this._mousedown = false;
                this.$el.removeClass('active');
            }

            /**
             * Handle Range Blur, Mouseout and Touchleave
             */

        }, {
            key: "_handleRangeBlurMouseoutTouchleave",
            value: function _handleRangeBlurMouseoutTouchleave() {
                if (!this._mousedown) {
                    var paddingLeft = parseInt(this.$el.css('padding-left'));
                    var marginLeft = 7 + paddingLeft + 'px';

                    if ($(this.thumb).hasClass('active')) {
                        anim.remove(this.thumb);
                        anim({
                            targets: this.thumb,
                            height: 0,
                            width: 0,
                            top: 10,
                            easing: 'easeOutQuad',
                            marginLeft: marginLeft,
                            duration: 100
                        });
                    }
                    $(this.thumb).removeClass('active');
                }
            }

            /**
             * Setup dropdown
             */

        }, {
            key: "_setupThumb",
            value: function _setupThumb() {
                this.thumb = document.createElement('span');
                this.value = document.createElement('span');
                $(this.thumb).addClass('thumb');
                $(this.value).addClass('value');
                $(this.thumb).append(this.value);
                this.$el.after(this.thumb);
            }

            /**
             * Remove dropdown
             */

        }, {
            key: "_removeThumb",
            value: function _removeThumb() {
                $(this.thumb).remove();
            }

            /**
             * morph thumb into bubble
             */

        }, {
            key: "_showRangeBubble",
            value: function _showRangeBubble() {
                var paddingLeft = parseInt($(this.thumb).parent().css('padding-left'));
                var marginLeft = -7 + paddingLeft + 'px'; // TODO: fix magic number?
                anim.remove(this.thumb);
                anim({
                    targets: this.thumb,
                    height: 30,
                    width: 30,
                    top: -30,
                    marginLeft: marginLeft,
                    duration: 300,
                    easing: 'easeOutQuint'
                });
            }

            /**
             * Calculate the offset of the thumb
             * @return {Number}  offset in pixels
             */

        }, {
            key: "_calcRangeOffset",
            value: function _calcRangeOffset() {
                var width = this.$el.width() - 15;
                var max = parseFloat(this.$el.attr('max')) || 100; // Range default max
                var min = parseFloat(this.$el.attr('min')) || 0; // Range default min
                var percent = (parseFloat(this.$el.val()) - min) / (max - min);
                return percent * width;
            }
        }], [{
            key: "init",
            value: function init(els, options) {
                return _get(Range.__proto__ || Object.getPrototypeOf(Range), "init", this).call(this, this, els, options);
            }

            /**
             * Get Instance
             */

        }, {
            key: "getInstance",
            value: function getInstance(el) {
                var domElem = !!el.jquery ? el[0] : el;
                return domElem.M_Range;
            }
        }, {
            key: "defaults",
            get: function () {
                return _defaults;
            }
        }]);

        return Range;
    }(Component);

    M.Range = Range;

    if (M.jQueryLoaded) {
        M.initializeJqueryWrapper(Range, 'range', 'M_Range');
    }

    Range.init($('input[type=range]'));
})(cash, M.anime);

/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 2.7.3
 *
 * Copyright 2018 Chart.js Contributors
 * Released under the MIT license
 * https://github.com/chartjs/Chart.js/blob/master/LICENSE.md
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Chart = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/* MIT license */
var colorNames = require(6);

module.exports = {
   getRgba: getRgba,
   getHsla: getHsla,
   getRgb: getRgb,
   getHsl: getHsl,
   getHwb: getHwb,
   getAlpha: getAlpha,

   hexString: hexString,
   rgbString: rgbString,
   rgbaString: rgbaString,
   percentString: percentString,
   percentaString: percentaString,
   hslString: hslString,
   hslaString: hslaString,
   hwbString: hwbString,
   keyword: keyword
}

function getRgba(string) {
   if (!string) {
      return;
   }
   var abbr =  /^#([a-fA-F0-9]{3})$/i,
       hex =  /^#([a-fA-F0-9]{6})$/i,
       rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/i,
       per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/i,
       keyword = /(\w+)/;

   var rgb = [0, 0, 0],
       a = 1,
       match = string.match(abbr);
   if (match) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i] + match[i], 16);
      }
   }
   else if (match = string.match(hex)) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match.slice(i * 2, i * 2 + 2), 16);
      }
   }
   else if (match = string.match(rgba)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i + 1]);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(per)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(keyword)) {
      if (match[1] == "transparent") {
         return [0, 0, 0, 0];
      }
      rgb = colorNames[match[1]];
      if (!rgb) {
         return;
      }
   }

   for (var i = 0; i < rgb.length; i++) {
      rgb[i] = scale(rgb[i], 0, 255);
   }
   if (!a && a != 0) {
      a = 1;
   }
   else {
      a = scale(a, 0, 1);
   }
   rgb[3] = a;
   return rgb;
}

function getHsla(string) {
   if (!string) {
      return;
   }
   var hsl = /^hsla?\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;
   var match = string.match(hsl);
   if (match) {
      var alpha = parseFloat(match[4]);
      var h = scale(parseInt(match[1]), 0, 360),
          s = scale(parseFloat(match[2]), 0, 100),
          l = scale(parseFloat(match[3]), 0, 100),
          a = scale(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, s, l, a];
   }
}

function getHwb(string) {
   if (!string) {
      return;
   }
   var hwb = /^hwb\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;
   var match = string.match(hwb);
   if (match) {
    var alpha = parseFloat(match[4]);
      var h = scale(parseInt(match[1]), 0, 360),
          w = scale(parseFloat(match[2]), 0, 100),
          b = scale(parseFloat(match[3]), 0, 100),
          a = scale(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, w, b, a];
   }
}

function getRgb(string) {
   var rgba = getRgba(string);
   return rgba && rgba.slice(0, 3);
}

function getHsl(string) {
  var hsla = getHsla(string);
  return hsla && hsla.slice(0, 3);
}

function getAlpha(string) {
   var vals = getRgba(string);
   if (vals) {
      return vals[3];
   }
   else if (vals = getHsla(string)) {
      return vals[3];
   }
   else if (vals = getHwb(string)) {
      return vals[3];
   }
}

// generators
function hexString(rgb) {
   return "#" + hexDouble(rgb[0]) + hexDouble(rgb[1])
              + hexDouble(rgb[2]);
}

function rgbString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return rgbaString(rgba, alpha);
   }
   return "rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")";
}

function rgbaString(rgba, alpha) {
   if (alpha === undefined) {
      alpha = (rgba[3] !== undefined ? rgba[3] : 1);
   }
   return "rgba(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2]
           + ", " + alpha + ")";
}

function percentString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return percentaString(rgba, alpha);
   }
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);

   return "rgb(" + r + "%, " + g + "%, " + b + "%)";
}

function percentaString(rgba, alpha) {
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);
   return "rgba(" + r + "%, " + g + "%, " + b + "%, " + (alpha || rgba[3] || 1) + ")";
}

function hslString(hsla, alpha) {
   if (alpha < 1 || (hsla[3] && hsla[3] < 1)) {
      return hslaString(hsla, alpha);
   }
   return "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)";
}

function hslaString(hsla, alpha) {
   if (alpha === undefined) {
      alpha = (hsla[3] !== undefined ? hsla[3] : 1);
   }
   return "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, "
           + alpha + ")";
}

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
function hwbString(hwb, alpha) {
   if (alpha === undefined) {
      alpha = (hwb[3] !== undefined ? hwb[3] : 1);
   }
   return "hwb(" + hwb[0] + ", " + hwb[1] + "%, " + hwb[2] + "%"
           + (alpha !== undefined && alpha !== 1 ? ", " + alpha : "") + ")";
}

function keyword(rgb) {
  return reverseNames[rgb.slice(0, 3)];
}

// helpers
function scale(num, min, max) {
   return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
  var str = num.toString(16).toUpperCase();
  return (str.length < 2) ? "0" + str : str;
}


//create a list of reverse color names
var reverseNames = {};
for (var name in colorNames) {
   reverseNames[colorNames[name]] = name;
}

},{"6":6}],3:[function(require,module,exports){
/* MIT license */
var convert = require(5);
var string = require(2);

var Color = function (obj) {
	if (obj instanceof Color) {
		return obj;
	}
	if (!(this instanceof Color)) {
		return new Color(obj);
	}

	this.valid = false;
	this.values = {
		rgb: [0, 0, 0],
		hsl: [0, 0, 0],
		hsv: [0, 0, 0],
		hwb: [0, 0, 0],
		cmyk: [0, 0, 0, 0],
		alpha: 1
	};

	// parse Color() argument
	var vals;
	if (typeof obj === 'string') {
		vals = string.getRgba(obj);
		if (vals) {
			this.setValues('rgb', vals);
		} else if (vals = string.getHsla(obj)) {
			this.setValues('hsl', vals);
		} else if (vals = string.getHwb(obj)) {
			this.setValues('hwb', vals);
		}
	} else if (typeof obj === 'object') {
		vals = obj;
		if (vals.r !== undefined || vals.red !== undefined) {
			this.setValues('rgb', vals);
		} else if (vals.l !== undefined || vals.lightness !== undefined) {
			this.setValues('hsl', vals);
		} else if (vals.v !== undefined || vals.value !== undefined) {
			this.setValues('hsv', vals);
		} else if (vals.w !== undefined || vals.whiteness !== undefined) {
			this.setValues('hwb', vals);
		} else if (vals.c !== undefined || vals.cyan !== undefined) {
			this.setValues('cmyk', vals);
		}
	}
};

Color.prototype = {
	isValid: function () {
		return this.valid;
	},
	rgb: function () {
		return this.setSpace('rgb', arguments);
	},
	hsl: function () {
		return this.setSpace('hsl', arguments);
	},
	hsv: function () {
		return this.setSpace('hsv', arguments);
	},
	hwb: function () {
		return this.setSpace('hwb', arguments);
	},
	cmyk: function () {
		return this.setSpace('cmyk', arguments);
	},

	rgbArray: function () {
		return this.values.rgb;
	},
	hslArray: function () {
		return this.values.hsl;
	},
	hsvArray: function () {
		return this.values.hsv;
	},
	hwbArray: function () {
		var values = this.values;
		if (values.alpha !== 1) {
			return values.hwb.concat([values.alpha]);
		}
		return values.hwb;
	},
	cmykArray: function () {
		return this.values.cmyk;
	},
	rgbaArray: function () {
		var values = this.values;
		return values.rgb.concat([values.alpha]);
	},
	hslaArray: function () {
		var values = this.values;
		return values.hsl.concat([values.alpha]);
	},
	alpha: function (val) {
		if (val === undefined) {
			return this.values.alpha;
		}
		this.setValues('alpha', val);
		return this;
	},

	red: function (val) {
		return this.setChannel('rgb', 0, val);
	},
	green: function (val) {
		return this.setChannel('rgb', 1, val);
	},
	blue: function (val) {
		return this.setChannel('rgb', 2, val);
	},
	hue: function (val) {
		if (val) {
			val %= 360;
			val = val < 0 ? 360 + val : val;
		}
		return this.setChannel('hsl', 0, val);
	},
	saturation: function (val) {
		return this.setChannel('hsl', 1, val);
	},
	lightness: function (val) {
		return this.setChannel('hsl', 2, val);
	},
	saturationv: function (val) {
		return this.setChannel('hsv', 1, val);
	},
	whiteness: function (val) {
		return this.setChannel('hwb', 1, val);
	},
	blackness: function (val) {
		return this.setChannel('hwb', 2, val);
	},
	value: function (val) {
		return this.setChannel('hsv', 2, val);
	},
	cyan: function (val) {
		return this.setChannel('cmyk', 0, val);
	},
	magenta: function (val) {
		return this.setChannel('cmyk', 1, val);
	},
	yellow: function (val) {
		return this.setChannel('cmyk', 2, val);
	},
	black: function (val) {
		return this.setChannel('cmyk', 3, val);
	},

	hexString: function () {
		return string.hexString(this.values.rgb);
	},
	rgbString: function () {
		return string.rgbString(this.values.rgb, this.values.alpha);
	},
	rgbaString: function () {
		return string.rgbaString(this.values.rgb, this.values.alpha);
	},
	percentString: function () {
		return string.percentString(this.values.rgb, this.values.alpha);
	},
	hslString: function () {
		return string.hslString(this.values.hsl, this.values.alpha);
	},
	hslaString: function () {
		return string.hslaString(this.values.hsl, this.values.alpha);
	},
	hwbString: function () {
		return string.hwbString(this.values.hwb, this.values.alpha);
	},
	keyword: function () {
		return string.keyword(this.values.rgb, this.values.alpha);
	},

	rgbNumber: function () {
		var rgb = this.values.rgb;
		return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
	},

	luminosity: function () {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		var rgb = this.values.rgb;
		var lum = [];
		for (var i = 0; i < rgb.length; i++) {
			var chan = rgb[i] / 255;
			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
		}
		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},

	contrast: function (color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		var lum1 = this.luminosity();
		var lum2 = color2.luminosity();
		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}
		return (lum2 + 0.05) / (lum1 + 0.05);
	},

	level: function (color2) {
		var contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7.1) {
			return 'AAA';
		}

		return (contrastRatio >= 4.5) ? 'AA' : '';
	},

	dark: function () {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		var rgb = this.values.rgb;
		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return yiq < 128;
	},

	light: function () {
		return !this.dark();
	},

	negate: function () {
		var rgb = [];
		for (var i = 0; i < 3; i++) {
			rgb[i] = 255 - this.values.rgb[i];
		}
		this.setValues('rgb', rgb);
		return this;
	},

	lighten: function (ratio) {
		var hsl = this.values.hsl;
		hsl[2] += hsl[2] * ratio;
		this.setValues('hsl', hsl);
		return this;
	},

	darken: function (ratio) {
		var hsl = this.values.hsl;
		hsl[2] -= hsl[2] * ratio;
		this.setValues('hsl', hsl);
		return this;
	},

	saturate: function (ratio) {
		var hsl = this.values.hsl;
		hsl[1] += hsl[1] * ratio;
		this.setValues('hsl', hsl);
		return this;
	},

	desaturate: function (ratio) {
		var hsl = this.values.hsl;
		hsl[1] -= hsl[1] * ratio;
		this.setValues('hsl', hsl);
		return this;
	},

	whiten: function (ratio) {
		var hwb = this.values.hwb;
		hwb[1] += hwb[1] * ratio;
		this.setValues('hwb', hwb);
		return this;
	},

	blacken: function (ratio) {
		var hwb = this.values.hwb;
		hwb[2] += hwb[2] * ratio;
		this.setValues('hwb', hwb);
		return this;
	},

	greyscale: function () {
		var rgb = this.values.rgb;
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		this.setValues('rgb', [val, val, val]);
		return this;
	},

	clearer: function (ratio) {
		var alpha = this.values.alpha;
		this.setValues('alpha', alpha - (alpha * ratio));
		return this;
	},

	opaquer: function (ratio) {
		var alpha = this.values.alpha;
		this.setValues('alpha', alpha + (alpha * ratio));
		return this;
	},

	rotate: function (degrees) {
		var hsl = this.values.hsl;
		var hue = (hsl[0] + degrees) % 360;
		hsl[0] = hue < 0 ? 360 + hue : hue;
		this.setValues('hsl', hsl);
		return this;
	},

	/**
	 * Ported from sass implementation in C
	 * https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
	 */
	mix: function (mixinColor, weight) {
		var color1 = this;
		var color2 = mixinColor;
		var p = weight === undefined ? 0.5 : weight;

		var w = 2 * p - 1;
		var a = color1.alpha() - color2.alpha();

		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		var w2 = 1 - w1;

		return this
			.rgb(
				w1 * color1.red() + w2 * color2.red(),
				w1 * color1.green() + w2 * color2.green(),
				w1 * color1.blue() + w2 * color2.blue()
			)
			.alpha(color1.alpha() * p + color2.alpha() * (1 - p));
	},

	toJSON: function () {
		return this.rgb();
	},

	clone: function () {
		// NOTE(SB): using node-clone creates a dependency to Buffer when using browserify,
		// making the final build way to big to embed in Chart.js. So let's do it manually,
		// assuming that values to clone are 1 dimension arrays containing only numbers,
		// except 'alpha' which is a number.
		var result = new Color();
		var source = this.values;
		var target = result.values;
		var value, type;

		for (var prop in source) {
			if (source.hasOwnProperty(prop)) {
				value = source[prop];
				type = ({}).toString.call(value);
				if (type === '[object Array]') {
					target[prop] = value.slice(0);
				} else if (type === '[object Number]') {
					target[prop] = value;
				} else {
					console.error('unexpected color value:', value);
				}
			}
		}

		return result;
	}
};

Color.prototype.spaces = {
	rgb: ['red', 'green', 'blue'],
	hsl: ['hue', 'saturation', 'lightness'],
	hsv: ['hue', 'saturation', 'value'],
	hwb: ['hue', 'whiteness', 'blackness'],
	cmyk: ['cyan', 'magenta', 'yellow', 'black']
};

Color.prototype.maxes = {
	rgb: [255, 255, 255],
	hsl: [360, 100, 100],
	hsv: [360, 100, 100],
	hwb: [360, 100, 100],
	cmyk: [100, 100, 100, 100]
};

Color.prototype.getValues = function (space) {
	var values = this.values;
	var vals = {};

	for (var i = 0; i < space.length; i++) {
		vals[space.charAt(i)] = values[space][i];
	}

	if (values.alpha !== 1) {
		vals.a = values.alpha;
	}

	// {r: 255, g: 255, b: 255, a: 0.4}
	return vals;
};

Color.prototype.setValues = function (space, vals) {
	var values = this.values;
	var spaces = this.spaces;
	var maxes = this.maxes;
	var alpha = 1;
	var i;

	this.valid = true;

	if (space === 'alpha') {
		alpha = vals;
	} else if (vals.length) {
		// [10, 10, 10]
		values[space] = vals.slice(0, space.length);
		alpha = vals[space.length];
	} else if (vals[space.charAt(0)] !== undefined) {
		// {r: 10, g: 10, b: 10}
		for (i = 0; i < space.length; i++) {
			values[space][i] = vals[space.charAt(i)];
		}

		alpha = vals.a;
	} else if (vals[spaces[space][0]] !== undefined) {
		// {red: 10, green: 10, blue: 10}
		var chans = spaces[space];

		for (i = 0; i < space.length; i++) {
			values[space][i] = vals[chans[i]];
		}

		alpha = vals.alpha;
	}

	values.alpha = Math.max(0, Math.min(1, (alpha === undefined ? values.alpha : alpha)));

	if (space === 'alpha') {
		return false;
	}

	var capped;

	// cap values of the space prior converting all values
	for (i = 0; i < space.length; i++) {
		capped = Math.max(0, Math.min(maxes[space][i], values[space][i]));
		values[space][i] = Math.round(capped);
	}

	// convert to all the other color spaces
	for (var sname in spaces) {
		if (sname !== space) {
			values[sname] = convert[space][sname](values[space]);
		}
	}

	return true;
};

Color.prototype.setSpace = function (space, args) {
	var vals = args[0];

	if (vals === undefined) {
		// color.rgb()
		return this.getValues(space);
	}

	// color.rgb(10, 10, 10)
	if (typeof vals === 'number') {
		vals = Array.prototype.slice.call(args);
	}

	this.setValues(space, vals);
	return this;
};

Color.prototype.setChannel = function (space, index, val) {
	var svalues = this.values[space];
	if (val === undefined) {
		// color.red()
		return svalues[index];
	} else if (val === svalues[index]) {
		// color.red(color.red())
		return this;
	}

	// color.red(100)
	svalues[index] = val;
	this.setValues(space, svalues);

	return this;
};

if (typeof window !== 'undefined') {
	window.Color = Color;
}

module.exports = Color;

},{"2":2,"5":5}],4:[function(require,module,exports){
/* MIT license */

module.exports = {
  rgb2hsl: rgb2hsl,
  rgb2hsv: rgb2hsv,
  rgb2hwb: rgb2hwb,
  rgb2cmyk: rgb2cmyk,
  rgb2keyword: rgb2keyword,
  rgb2xyz: rgb2xyz,
  rgb2lab: rgb2lab,
  rgb2lch: rgb2lch,

  hsl2rgb: hsl2rgb,
  hsl2hsv: hsl2hsv,
  hsl2hwb: hsl2hwb,
  hsl2cmyk: hsl2cmyk,
  hsl2keyword: hsl2keyword,

  hsv2rgb: hsv2rgb,
  hsv2hsl: hsv2hsl,
  hsv2hwb: hsv2hwb,
  hsv2cmyk: hsv2cmyk,
  hsv2keyword: hsv2keyword,

  hwb2rgb: hwb2rgb,
  hwb2hsl: hwb2hsl,
  hwb2hsv: hwb2hsv,
  hwb2cmyk: hwb2cmyk,
  hwb2keyword: hwb2keyword,

  cmyk2rgb: cmyk2rgb,
  cmyk2hsl: cmyk2hsl,
  cmyk2hsv: cmyk2hsv,
  cmyk2hwb: cmyk2hwb,
  cmyk2keyword: cmyk2keyword,

  keyword2rgb: keyword2rgb,
  keyword2hsl: keyword2hsl,
  keyword2hsv: keyword2hsv,
  keyword2hwb: keyword2hwb,
  keyword2cmyk: keyword2cmyk,
  keyword2lab: keyword2lab,
  keyword2xyz: keyword2xyz,

  xyz2rgb: xyz2rgb,
  xyz2lab: xyz2lab,
  xyz2lch: xyz2lch,

  lab2xyz: lab2xyz,
  lab2rgb: lab2rgb,
  lab2lch: lab2lch,

  lch2lab: lch2lab,
  lch2xyz: lch2xyz,
  lch2rgb: lch2rgb
}


function rgb2hsl(rgb) {
  var r = rgb[0]/255,
      g = rgb[1]/255,
      b = rgb[2]/255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, l;

  if (max == min)
    h = 0;
  else if (r == max)
    h = (g - b) / delta;
  else if (g == max)
    h = 2 + (b - r) / delta;
  else if (b == max)
    h = 4 + (r - g)/ delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  l = (min + max) / 2;

  if (max == min)
    s = 0;
  else if (l <= 0.5)
    s = delta / (max + min);
  else
    s = delta / (2 - max - min);

  return [h, s * 100, l * 100];
}

function rgb2hsv(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, v;

  if (max == 0)
    s = 0;
  else
    s = (delta/max * 1000)/10;

  if (max == min)
    h = 0;
  else if (r == max)
    h = (g - b) / delta;
  else if (g == max)
    h = 2 + (b - r) / delta;
  else if (b == max)
    h = 4 + (r - g) / delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  v = ((max / 255) * 1000) / 10;

  return [h, s, v];
}

function rgb2hwb(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      h = rgb2hsl(rgb)[0],
      w = 1/255 * Math.min(r, Math.min(g, b)),
      b = 1 - 1/255 * Math.max(r, Math.max(g, b));

  return [h, w * 100, b * 100];
}

function rgb2cmyk(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      c, m, y, k;

  k = Math.min(1 - r, 1 - g, 1 - b);
  c = (1 - r - k) / (1 - k) || 0;
  m = (1 - g - k) / (1 - k) || 0;
  y = (1 - b - k) / (1 - k) || 0;
  return [c * 100, m * 100, y * 100, k * 100];
}

function rgb2keyword(rgb) {
  return reverseKeywords[JSON.stringify(rgb)];
}

function rgb2xyz(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;

  // assume sRGB
  r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

  var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
  var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
  var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

  return [x * 100, y *100, z * 100];
}

function rgb2lab(rgb) {
  var xyz = rgb2xyz(rgb),
        x = xyz[0],
        y = xyz[1],
        z = xyz[2],
        l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

function rgb2lch(args) {
  return lab2lch(rgb2lab(args));
}

function hsl2rgb(hsl) {
  var h = hsl[0] / 360,
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      t1, t2, t3, rgb, val;

  if (s == 0) {
    val = l * 255;
    return [val, val, val];
  }

  if (l < 0.5)
    t2 = l * (1 + s);
  else
    t2 = l + s - l * s;
  t1 = 2 * l - t2;

  rgb = [0, 0, 0];
  for (var i = 0; i < 3; i++) {
    t3 = h + 1 / 3 * - (i - 1);
    t3 < 0 && t3++;
    t3 > 1 && t3--;

    if (6 * t3 < 1)
      val = t1 + (t2 - t1) * 6 * t3;
    else if (2 * t3 < 1)
      val = t2;
    else if (3 * t3 < 2)
      val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    else
      val = t1;

    rgb[i] = val * 255;
  }

  return rgb;
}

function hsl2hsv(hsl) {
  var h = hsl[0],
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      sv, v;

  if(l === 0) {
      // no need to do calc on black
      // also avoids divide by 0 error
      return [0, 0, 0];
  }

  l *= 2;
  s *= (l <= 1) ? l : 2 - l;
  v = (l + s) / 2;
  sv = (2 * s) / (l + s);
  return [h, sv * 100, v * 100];
}

function hsl2hwb(args) {
  return rgb2hwb(hsl2rgb(args));
}

function hsl2cmyk(args) {
  return rgb2cmyk(hsl2rgb(args));
}

function hsl2keyword(args) {
  return rgb2keyword(hsl2rgb(args));
}


function hsv2rgb(hsv) {
  var h = hsv[0] / 60,
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      hi = Math.floor(h) % 6;

  var f = h - Math.floor(h),
      p = 255 * v * (1 - s),
      q = 255 * v * (1 - (s * f)),
      t = 255 * v * (1 - (s * (1 - f))),
      v = 255 * v;

  switch(hi) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    case 5:
      return [v, p, q];
  }
}

function hsv2hsl(hsv) {
  var h = hsv[0],
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      sl, l;

  l = (2 - s) * v;
  sl = s * v;
  sl /= (l <= 1) ? l : 2 - l;
  sl = sl || 0;
  l /= 2;
  return [h, sl * 100, l * 100];
}

function hsv2hwb(args) {
  return rgb2hwb(hsv2rgb(args))
}

function hsv2cmyk(args) {
  return rgb2cmyk(hsv2rgb(args));
}

function hsv2keyword(args) {
  return rgb2keyword(hsv2rgb(args));
}

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
function hwb2rgb(hwb) {
  var h = hwb[0] / 360,
      wh = hwb[1] / 100,
      bl = hwb[2] / 100,
      ratio = wh + bl,
      i, v, f, n;

  // wh + bl cant be > 1
  if (ratio > 1) {
    wh /= ratio;
    bl /= ratio;
  }

  i = Math.floor(6 * h);
  v = 1 - bl;
  f = 6 * h - i;
  if ((i & 0x01) != 0) {
    f = 1 - f;
  }
  n = wh + f * (v - wh);  // linear interpolation

  switch (i) {
    default:
    case 6:
    case 0: r = v; g = n; b = wh; break;
    case 1: r = n; g = v; b = wh; break;
    case 2: r = wh; g = v; b = n; break;
    case 3: r = wh; g = n; b = v; break;
    case 4: r = n; g = wh; b = v; break;
    case 5: r = v; g = wh; b = n; break;
  }

  return [r * 255, g * 255, b * 255];
}

function hwb2hsl(args) {
  return rgb2hsl(hwb2rgb(args));
}

function hwb2hsv(args) {
  return rgb2hsv(hwb2rgb(args));
}

function hwb2cmyk(args) {
  return rgb2cmyk(hwb2rgb(args));
}

function hwb2keyword(args) {
  return rgb2keyword(hwb2rgb(args));
}

function cmyk2rgb(cmyk) {
  var c = cmyk[0] / 100,
      m = cmyk[1] / 100,
      y = cmyk[2] / 100,
      k = cmyk[3] / 100,
      r, g, b;

  r = 1 - Math.min(1, c * (1 - k) + k);
  g = 1 - Math.min(1, m * (1 - k) + k);
  b = 1 - Math.min(1, y * (1 - k) + k);
  return [r * 255, g * 255, b * 255];
}

function cmyk2hsl(args) {
  return rgb2hsl(cmyk2rgb(args));
}

function cmyk2hsv(args) {
  return rgb2hsv(cmyk2rgb(args));
}

function cmyk2hwb(args) {
  return rgb2hwb(cmyk2rgb(args));
}

function cmyk2keyword(args) {
  return rgb2keyword(cmyk2rgb(args));
}


function xyz2rgb(xyz) {
  var x = xyz[0] / 100,
      y = xyz[1] / 100,
      z = xyz[2] / 100,
      r, g, b;

  r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
  g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
  b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

  // assume sRGB
  r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
    : r = (r * 12.92);

  g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
    : g = (g * 12.92);

  b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
    : b = (b * 12.92);

  r = Math.min(Math.max(0, r), 1);
  g = Math.min(Math.max(0, g), 1);
  b = Math.min(Math.max(0, b), 1);

  return [r * 255, g * 255, b * 255];
}

function xyz2lab(xyz) {
  var x = xyz[0],
      y = xyz[1],
      z = xyz[2],
      l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

function xyz2lch(args) {
  return lab2lch(xyz2lab(args));
}

function lab2xyz(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      x, y, z, y2;

  if (l <= 8) {
    y = (l * 100) / 903.3;
    y2 = (7.787 * (y / 100)) + (16 / 116);
  } else {
    y = 100 * Math.pow((l + 16) / 116, 3);
    y2 = Math.pow(y / 100, 1/3);
  }

  x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);

  z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);

  return [x, y, z];
}

function lab2lch(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      hr, h, c;

  hr = Math.atan2(b, a);
  h = hr * 360 / 2 / Math.PI;
  if (h < 0) {
    h += 360;
  }
  c = Math.sqrt(a * a + b * b);
  return [l, c, h];
}

function lab2rgb(args) {
  return xyz2rgb(lab2xyz(args));
}

function lch2lab(lch) {
  var l = lch[0],
      c = lch[1],
      h = lch[2],
      a, b, hr;

  hr = h / 360 * 2 * Math.PI;
  a = c * Math.cos(hr);
  b = c * Math.sin(hr);
  return [l, a, b];
}

function lch2xyz(args) {
  return lab2xyz(lch2lab(args));
}

function lch2rgb(args) {
  return lab2rgb(lch2lab(args));
}

function keyword2rgb(keyword) {
  return cssKeywords[keyword];
}

function keyword2hsl(args) {
  return rgb2hsl(keyword2rgb(args));
}

function keyword2hsv(args) {
  return rgb2hsv(keyword2rgb(args));
}

function keyword2hwb(args) {
  return rgb2hwb(keyword2rgb(args));
}

function keyword2cmyk(args) {
  return rgb2cmyk(keyword2rgb(args));
}

function keyword2lab(args) {
  return rgb2lab(keyword2rgb(args));
}

function keyword2xyz(args) {
  return rgb2xyz(keyword2rgb(args));
}

var cssKeywords = {
  aliceblue:  [240,248,255],
  antiquewhite: [250,235,215],
  aqua: [0,255,255],
  aquamarine: [127,255,212],
  azure:  [240,255,255],
  beige:  [245,245,220],
  bisque: [255,228,196],
  black:  [0,0,0],
  blanchedalmond: [255,235,205],
  blue: [0,0,255],
  blueviolet: [138,43,226],
  brown:  [165,42,42],
  burlywood:  [222,184,135],
  cadetblue:  [95,158,160],
  chartreuse: [127,255,0],
  chocolate:  [210,105,30],
  coral:  [255,127,80],
  cornflowerblue: [100,149,237],
  cornsilk: [255,248,220],
  crimson:  [220,20,60],
  cyan: [0,255,255],
  darkblue: [0,0,139],
  darkcyan: [0,139,139],
  darkgoldenrod:  [184,134,11],
  darkgray: [169,169,169],
  darkgreen:  [0,100,0],
  darkgrey: [169,169,169],
  darkkhaki:  [189,183,107],
  darkmagenta:  [139,0,139],
  darkolivegreen: [85,107,47],
  darkorange: [255,140,0],
  darkorchid: [153,50,204],
  darkred:  [139,0,0],
  darksalmon: [233,150,122],
  darkseagreen: [143,188,143],
  darkslateblue:  [72,61,139],
  darkslategray:  [47,79,79],
  darkslategrey:  [47,79,79],
  darkturquoise:  [0,206,209],
  darkviolet: [148,0,211],
  deeppink: [255,20,147],
  deepskyblue:  [0,191,255],
  dimgray:  [105,105,105],
  dimgrey:  [105,105,105],
  dodgerblue: [30,144,255],
  firebrick:  [178,34,34],
  floralwhite:  [255,250,240],
  forestgreen:  [34,139,34],
  fuchsia:  [255,0,255],
  gainsboro:  [220,220,220],
  ghostwhite: [248,248,255],
  gold: [255,215,0],
  goldenrod:  [218,165,32],
  gray: [128,128,128],
  green:  [0,128,0],
  greenyellow:  [173,255,47],
  grey: [128,128,128],
  honeydew: [240,255,240],
  hotpink:  [255,105,180],
  indianred:  [205,92,92],
  indigo: [75,0,130],
  ivory:  [255,255,240],
  khaki:  [240,230,140],
  lavender: [230,230,250],
  lavenderblush:  [255,240,245],
  lawngreen:  [124,252,0],
  lemonchiffon: [255,250,205],
  lightblue:  [173,216,230],
  lightcoral: [240,128,128],
  lightcyan:  [224,255,255],
  lightgoldenrodyellow: [250,250,210],
  lightgray:  [211,211,211],
  lightgreen: [144,238,144],
  lightgrey:  [211,211,211],
  lightpink:  [255,182,193],
  lightsalmon:  [255,160,122],
  lightseagreen:  [32,178,170],
  lightskyblue: [135,206,250],
  lightslategray: [119,136,153],
  lightslategrey: [119,136,153],
  lightsteelblue: [176,196,222],
  lightyellow:  [255,255,224],
  lime: [0,255,0],
  limegreen:  [50,205,50],
  linen:  [250,240,230],
  magenta:  [255,0,255],
  maroon: [128,0,0],
  mediumaquamarine: [102,205,170],
  mediumblue: [0,0,205],
  mediumorchid: [186,85,211],
  mediumpurple: [147,112,219],
  mediumseagreen: [60,179,113],
  mediumslateblue:  [123,104,238],
  mediumspringgreen:  [0,250,154],
  mediumturquoise:  [72,209,204],
  mediumvioletred:  [199,21,133],
  midnightblue: [25,25,112],
  mintcream:  [245,255,250],
  mistyrose:  [255,228,225],
  moccasin: [255,228,181],
  navajowhite:  [255,222,173],
  navy: [0,0,128],
  oldlace:  [253,245,230],
  olive:  [128,128,0],
  olivedrab:  [107,142,35],
  orange: [255,165,0],
  orangered:  [255,69,0],
  orchid: [218,112,214],
  palegoldenrod:  [238,232,170],
  palegreen:  [152,251,152],
  paleturquoise:  [175,238,238],
  palevioletred:  [219,112,147],
  papayawhip: [255,239,213],
  peachpuff:  [255,218,185],
  peru: [205,133,63],
  pink: [255,192,203],
  plum: [221,160,221],
  powderblue: [176,224,230],
  purple: [128,0,128],
  rebeccapurple: [102, 51, 153],
  red:  [255,0,0],
  rosybrown:  [188,143,143],
  royalblue:  [65,105,225],
  saddlebrown:  [139,69,19],
  salmon: [250,128,114],
  sandybrown: [244,164,96],
  seagreen: [46,139,87],
  seashell: [255,245,238],
  sienna: [160,82,45],
  silver: [192,192,192],
  skyblue:  [135,206,235],
  slateblue:  [106,90,205],
  slategray:  [112,128,144],
  slategrey:  [112,128,144],
  snow: [255,250,250],
  springgreen:  [0,255,127],
  steelblue:  [70,130,180],
  tan:  [210,180,140],
  teal: [0,128,128],
  thistle:  [216,191,216],
  tomato: [255,99,71],
  turquoise:  [64,224,208],
  violet: [238,130,238],
  wheat:  [245,222,179],
  white:  [255,255,255],
  whitesmoke: [245,245,245],
  yellow: [255,255,0],
  yellowgreen:  [154,205,50]
};

var reverseKeywords = {};
for (var key in cssKeywords) {
  reverseKeywords[JSON.stringify(cssKeywords[key])] = key;
}

},{}],5:[function(require,module,exports){
var conversions = require(4);

var convert = function() {
   return new Converter();
}

for (var func in conversions) {
  // export Raw versions
  convert[func + "Raw"] =  (function(func) {
    // accept array or plain args
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      return conversions[func](arg);
    }
  })(func);

  var pair = /(\w+)2(\w+)/.exec(func),
      from = pair[1],
      to = pair[2];

  // export rgb2hsl and ["rgb"]["hsl"]
  convert[from] = convert[from] || {};

  convert[from][to] = convert[func] = (function(func) { 
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      
      var val = conversions[func](arg);
      if (typeof val == "string" || val === undefined)
        return val; // keyword

      for (var i = 0; i < val.length; i++)
        val[i] = Math.round(val[i]);
      return val;
    }
  })(func);
}


/* Converter does lazy conversion and caching */
var Converter = function() {
   this.convs = {};
};

/* Either get the values for a space or
  set the values for a space, depending on args */
Converter.prototype.routeSpace = function(space, args) {
   var values = args[0];
   if (values === undefined) {
      // color.rgb()
      return this.getValues(space);
   }
   // color.rgb(10, 10, 10)
   if (typeof values == "number") {
      values = Array.prototype.slice.call(args);        
   }

   return this.setValues(space, values);
};
  
/* Set the values for a space, invalidating cache */
Converter.prototype.setValues = function(space, values) {
   this.space = space;
   this.convs = {};
   this.convs[space] = values;
   return this;
};

/* Get the values for a space. If there's already
  a conversion for the space, fetch it, otherwise
  compute it */
Converter.prototype.getValues = function(space) {
   var vals = this.convs[space];
   if (!vals) {
      var fspace = this.space,
          from = this.convs[fspace];
      vals = convert[fspace][space](from);

      this.convs[space] = vals;
   }
  return vals;
};

["rgb", "hsl", "hsv", "cmyk", "keyword"].forEach(function(space) {
   Converter.prototype[space] = function(vals) {
      return this.routeSpace(space, arguments);
   }
});

module.exports = convert;
},{"4":4}],6:[function(require,module,exports){
'use strict'

module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

},{}],7:[function(require,module,exports){
/**
 * @namespace Chart
 */
var Chart = require(30)();

Chart.helpers = require(46);

// @todo dispatch these helpers into appropriated helpers/helpers.* file and write unit tests!
require(28)(Chart);

Chart.Animation = require(22);
Chart.animationService = require(23);
Chart.defaults = require(26);
Chart.Element = require(27);
Chart.elements = require(41);
Chart.Interaction = require(29);
Chart.layouts = require(31);
Chart.platform = require(49);
Chart.plugins = require(32);
Chart.Scale = require(33);
Chart.scaleService = require(34);
Chart.Ticks = require(35);
Chart.Tooltip = require(36);

require(24)(Chart);
require(25)(Chart);

require(56)(Chart);
require(54)(Chart);
require(55)(Chart);
require(57)(Chart);
require(58)(Chart);
require(59)(Chart);

// Controllers must be loaded after elements
// See Chart.core.datasetController.dataElementType
require(15)(Chart);
require(16)(Chart);
require(17)(Chart);
require(18)(Chart);
require(19)(Chart);
require(20)(Chart);
require(21)(Chart);

require(8)(Chart);
require(9)(Chart);
require(10)(Chart);
require(11)(Chart);
require(12)(Chart);
require(13)(Chart);
require(14)(Chart);

// Loading built-in plugins
var plugins = require(50);
for (var k in plugins) {
	if (plugins.hasOwnProperty(k)) {
		Chart.plugins.register(plugins[k]);
	}
}

Chart.platform.initialize();

module.exports = Chart;
if (typeof window !== 'undefined') {
	window.Chart = Chart;
}

// DEPRECATIONS

/**
 * Provided for backward compatibility, not available anymore
 * @namespace Chart.Legend
 * @deprecated since version 2.1.5
 * @todo remove at version 3
 * @private
 */
Chart.Legend = plugins.legend._element;

/**
 * Provided for backward compatibility, not available anymore
 * @namespace Chart.Title
 * @deprecated since version 2.1.5
 * @todo remove at version 3
 * @private
 */
Chart.Title = plugins.title._element;

/**
 * Provided for backward compatibility, use Chart.plugins instead
 * @namespace Chart.pluginService
 * @deprecated since version 2.1.5
 * @todo remove at version 3
 * @private
 */
Chart.pluginService = Chart.plugins;

/**
 * Provided for backward compatibility, inheriting from Chart.PlugingBase has no
 * effect, instead simply create/register plugins via plain JavaScript objects.
 * @interface Chart.PluginBase
 * @deprecated since version 2.5.0
 * @todo remove at version 3
 * @private
 */
Chart.PluginBase = Chart.Element.extend({});

/**
 * Provided for backward compatibility, use Chart.helpers.canvas instead.
 * @namespace Chart.canvasHelpers
 * @deprecated since version 2.6.0
 * @todo remove at version 3
 * @private
 */
Chart.canvasHelpers = Chart.helpers.canvas;

/**
 * Provided for backward compatibility, use Chart.layouts instead.
 * @namespace Chart.layoutService
 * @deprecated since version 2.8.0
 * @todo remove at version 3
 * @private
 */
Chart.layoutService = Chart.layouts;

},{"10":10,"11":11,"12":12,"13":13,"14":14,"15":15,"16":16,"17":17,"18":18,"19":19,"20":20,"21":21,"22":22,"23":23,"24":24,"25":25,"26":26,"27":27,"28":28,"29":29,"30":30,"31":31,"32":32,"33":33,"34":34,"35":35,"36":36,"41":41,"46":46,"49":49,"50":50,"54":54,"55":55,"56":56,"57":57,"58":58,"59":59,"8":8,"9":9}],8:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

	Chart.Bar = function(context, config) {
		config.type = 'bar';

		return new Chart(context, config);
	};

};

},{}],9:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

	Chart.Bubble = function(context, config) {
		config.type = 'bubble';
		return new Chart(context, config);
	};

};

},{}],10:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

	Chart.Doughnut = function(context, config) {
		config.type = 'doughnut';

		return new Chart(context, config);
	};

};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

	Chart.Line = function(context, config) {
		config.type = 'line';

		return new Chart(context, config);
	};

};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

	Chart.PolarArea = function(context, config) {
		config.type = 'polarArea';

		return new Chart(context, config);
	};

};

},{}],13:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

	Chart.Radar = function(context, config) {
		config.type = 'radar';

		return new Chart(context, config);
	};

};

},{}],14:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {
	Chart.Scatter = function(context, config) {
		config.type = 'scatter';
		return new Chart(context, config);
	};
};

},{}],15:[function(require,module,exports){
'use strict';

var defaults = require(26);
var elements = require(41);
var helpers = require(46);

defaults._set('bar', {
	hover: {
		mode: 'label'
	},

	scales: {
		xAxes: [{
			type: 'category',

			// Specific to Bar Controller
			categoryPercentage: 0.8,
			barPercentage: 0.9,

			// offset settings
			offset: true,

			// grid line settings
			gridLines: {
				offsetGridLines: true
			}
		}],

		yAxes: [{
			type: 'linear'
		}]
	}
});

defaults._set('horizontalBar', {
	hover: {
		mode: 'index',
		axis: 'y'
	},

	scales: {
		xAxes: [{
			type: 'linear',
			position: 'bottom'
		}],

		yAxes: [{
			position: 'left',
			type: 'category',

			// Specific to Horizontal Bar Controller
			categoryPercentage: 0.8,
			barPercentage: 0.9,

			// offset settings
			offset: true,

			// grid line settings
			gridLines: {
				offsetGridLines: true
			}
		}]
	},

	elements: {
		rectangle: {
			borderSkipped: 'left'
		}
	},

	tooltips: {
		callbacks: {
			title: function(item, data) {
				// Pick first xLabel for now
				var title = '';

				if (item.length > 0) {
					if (item[0].yLabel) {
						title = item[0].yLabel;
					} else if (data.labels.length > 0 && item[0].index < data.labels.length) {
						title = data.labels[item[0].index];
					}
				}

				return title;
			},

			label: function(item, data) {
				var datasetLabel = data.datasets[item.datasetIndex].label || '';
				return datasetLabel + ': ' + item.xLabel;
			}
		},
		mode: 'index',
		axis: 'y'
	}
});

/**
 * Computes the "optimal" sample size to maintain bars equally sized while preventing overlap.
 * @private
 */
function computeMinSampleSize(scale, pixels) {
	var min = scale.isHorizontal() ? scale.width : scale.height;
	var ticks = scale.getTicks();
	var prev, curr, i, ilen;

	for (i = 1, ilen = pixels.length; i < ilen; ++i) {
		min = Math.min(min, pixels[i] - pixels[i - 1]);
	}

	for (i = 0, ilen = ticks.length; i < ilen; ++i) {
		curr = scale.getPixelForTick(i);
		min = i > 0 ? Math.min(min, curr - prev) : min;
		prev = curr;
	}

	return min;
}

/**
 * Computes an "ideal" category based on the absolute bar thickness or, if undefined or null,
 * uses the smallest interval (see computeMinSampleSize) that prevents bar overlapping. This
 * mode currently always generates bars equally sized (until we introduce scriptable options?).
 * @private
 */
function computeFitCategoryTraits(index, ruler, options) {
	var thickness = options.barThickness;
	var count = ruler.stackCount;
	var curr = ruler.pixels[index];
	var size, ratio;

	if (helpers.isNullOrUndef(thickness)) {
		size = ruler.min * options.categoryPercentage;
		ratio = options.barPercentage;
	} else {
		// When bar thickness is enforced, category and bar percentages are ignored.
		// Note(SB): we could add support for relative bar thickness (e.g. barThickness: '50%')
		// and deprecate barPercentage since this value is ignored when thickness is absolute.
		size = thickness * count;
		ratio = 1;
	}

	return {
		chunk: size / count,
		ratio: ratio,
		start: curr - (size / 2)
	};
}

/**
 * Computes an "optimal" category that globally arranges bars side by side (no gap when
 * percentage options are 1), based on the previous and following categories. This mode
 * generates bars with different widths when data are not evenly spaced.
 * @private
 */
function computeFlexCategoryTraits(index, ruler, options) {
	var pixels = ruler.pixels;
	var curr = pixels[index];
	var prev = index > 0 ? pixels[index - 1] : null;
	var next = index < pixels.length - 1 ? pixels[index + 1] : null;
	var percent = options.categoryPercentage;
	var start, size;

	if (prev === null) {
		// first data: its size is double based on the next point or,
		// if it's also the last data, we use the scale end extremity.
		prev = curr - (next === null ? ruler.end - curr : next - curr);
	}

	if (next === null) {
		// last data: its size is also double based on the previous point.
		next = curr + curr - prev;
	}

	start = curr - ((curr - prev) / 2) * percent;
	size = ((next - prev) / 2) * percent;

	return {
		chunk: size / ruler.stackCount,
		ratio: options.barPercentage,
		start: start
	};
}

module.exports = function(Chart) {

	Chart.controllers.bar = Chart.DatasetController.extend({

		dataElementType: elements.Rectangle,

		initialize: function() {
			var me = this;
			var meta;

			Chart.DatasetController.prototype.initialize.apply(me, arguments);

			meta = me.getMeta();
			meta.stack = me.getDataset().stack;
			meta.bar = true;
		},

		update: function(reset) {
			var me = this;
			var rects = me.getMeta().data;
			var i, ilen;

			me._ruler = me.getRuler();

			for (i = 0, ilen = rects.length; i < ilen; ++i) {
				me.updateElement(rects[i], i, reset);
			}
		},

		updateElement: function(rectangle, index, reset) {
			var me = this;
			var chart = me.chart;
			var meta = me.getMeta();
			var dataset = me.getDataset();
			var custom = rectangle.custom || {};
			var rectangleOptions = chart.options.elements.rectangle;

			rectangle._xScale = me.getScaleForId(meta.xAxisID);
			rectangle._yScale = me.getScaleForId(meta.yAxisID);
			rectangle._datasetIndex = me.index;
			rectangle._index = index;

			rectangle._model = {
				datasetLabel: dataset.label,
				label: chart.data.labels[index],
				borderSkipped: custom.borderSkipped ? custom.borderSkipped : rectangleOptions.borderSkipped,
				backgroundColor: custom.backgroundColor ? custom.backgroundColor : helpers.valueAtIndexOrDefault(dataset.backgroundColor, index, rectangleOptions.backgroundColor),
				borderColor: custom.borderColor ? custom.borderColor : helpers.valueAtIndexOrDefault(dataset.borderColor, index, rectangleOptions.borderColor),
				borderWidth: custom.borderWidth ? custom.borderWidth : helpers.valueAtIndexOrDefault(dataset.borderWidth, index, rectangleOptions.borderWidth)
			};

			me.updateElementGeometry(rectangle, index, reset);

			rectangle.pivot();
		},

		/**
		 * @private
		 */
		updateElementGeometry: function(rectangle, index, reset) {
			var me = this;
			var model = rectangle._model;
			var vscale = me.getValueScale();
			var base = vscale.getBasePixel();
			var horizontal = vscale.isHorizontal();
			var ruler = me._ruler || me.getRuler();
			var vpixels = me.calculateBarValuePixels(me.index, index);
			var ipixels = me.calculateBarIndexPixels(me.index, index, ruler);

			model.horizontal = horizontal;
			model.base = reset ? base : vpixels.base;
			model.x = horizontal ? reset ? base : vpixels.head : ipixels.center;
			model.y = horizontal ? ipixels.center : reset ? base : vpixels.head;
			model.height = horizontal ? ipixels.size : undefined;
			model.width = horizontal ? undefined : ipixels.size;
		},

		/**
		 * @private
		 */
		getValueScaleId: function() {
			return this.getMeta().yAxisID;
		},

		/**
		 * @private
		 */
		getIndexScaleId: function() {
			return this.getMeta().xAxisID;
		},

		/**
		 * @private
		 */
		getValueScale: function() {
			return this.getScaleForId(this.getValueScaleId());
		},

		/**
		 * @private
		 */
		getIndexScale: function() {
			return this.getScaleForId(this.getIndexScaleId());
		},

		/**
		 * Returns the stacks based on groups and bar visibility.
		 * @param {Number} [last] - The dataset index
		 * @returns {Array} The stack list
		 * @private
		 */
		_getStacks: function(last) {
			var me = this;
			var chart = me.chart;
			var scale = me.getIndexScale();
			var stacked = scale.options.stacked;
			var ilen = last === undefined ? chart.data.datasets.length : last + 1;
			var stacks = [];
			var i, meta;

			for (i = 0; i < ilen; ++i) {
				meta = chart.getDatasetMeta(i);
				if (meta.bar && chart.isDatasetVisible(i) &&
					(stacked === false ||
					(stacked === true && stacks.indexOf(meta.stack) === -1) ||
					(stacked === undefined && (meta.stack === undefined || stacks.indexOf(meta.stack) === -1)))) {
					stacks.push(meta.stack);
				}
			}

			return stacks;
		},

		/**
		 * Returns the effective number of stacks based on groups and bar visibility.
		 * @private
		 */
		getStackCount: function() {
			return this._getStacks().length;
		},

		/**
		 * Returns the stack index for the given dataset based on groups and bar visibility.
		 * @param {Number} [datasetIndex] - The dataset index
		 * @param {String} [name] - The stack name to find
		 * @returns {Number} The stack index
		 * @private
		 */
		getStackIndex: function(datasetIndex, name) {
			var stacks = this._getStacks(datasetIndex);
			var index = (name !== undefined)
				? stacks.indexOf(name)
				: -1; // indexOf returns -1 if element is not present

			return (index === -1)
				? stacks.length - 1
				: index;
		},

		/**
		 * @private
		 */
		getRuler: function() {
			var me = this;
			var scale = me.getIndexScale();
			var stackCount = me.getStackCount();
			var datasetIndex = me.index;
			var isHorizontal = scale.isHorizontal();
			var start = isHorizontal ? scale.left : scale.top;
			var end = start + (isHorizontal ? scale.width : scale.height);
			var pixels = [];
			var i, ilen, min;

			for (i = 0, ilen = me.getMeta().data.length; i < ilen; ++i) {
				pixels.push(scale.getPixelForValue(null, i, datasetIndex));
			}

			min = helpers.isNullOrUndef(scale.options.barThickness)
				? computeMinSampleSize(scale, pixels)
				: -1;

			return {
				min: min,
				pixels: pixels,
				start: start,
				end: end,
				stackCount: stackCount,
				scale: scale
			};
		},

		/**
		 * Note: pixel values are not clamped to the scale area.
		 * @private
		 */
		calculateBarValuePixels: function(datasetIndex, index) {
			var me = this;
			var chart = me.chart;
			var meta = me.getMeta();
			var scale = me.getValueScale();
			var datasets = chart.data.datasets;
			var value = scale.getRightValue(datasets[datasetIndex].data[index]);
			var stacked = scale.options.stacked;
			var stack = meta.stack;
			var start = 0;
			var i, imeta, ivalue, base, head, size;

			if (stacked || (stacked === undefined && stack !== undefined)) {
				for (i = 0; i < datasetIndex; ++i) {
					imeta = chart.getDatasetMeta(i);

					if (imeta.bar &&
						imeta.stack === stack &&
						imeta.controller.getValueScaleId() === scale.id &&
						chart.isDatasetVisible(i)) {

						ivalue = scale.getRightValue(datasets[i].data[index]);
						if ((value < 0 && ivalue < 0) || (value >= 0 && ivalue > 0)) {
							start += ivalue;
						}
					}
				}
			}

			base = scale.getPixelForValue(start);
			head = scale.getPixelForValue(start + value);
			size = (head - base) / 2;

			return {
				size: size,
				base: base,
				head: head,
				center: head + size / 2
			};
		},

		/**
		 * @private
		 */
		calculateBarIndexPixels: function(datasetIndex, index, ruler) {
			var me = this;
			var options = ruler.scale.options;
			var range = options.barThickness === 'flex'
				? computeFlexCategoryTraits(index, ruler, options)
				: computeFitCategoryTraits(index, ruler, options);

			var stackIndex = me.getStackIndex(datasetIndex, me.getMeta().stack);
			var center = range.start + (range.chunk * stackIndex) + (range.chunk / 2);
			var size = Math.min(
				helpers.valueOrDefault(options.maxBarThickness, Infinity),
				range.chunk * range.ratio);

			return {
				base: center - size / 2,
				head: center + size / 2,
				center: center,
				size: size
			};
		},

		draw: function() {
			var me = this;
			var chart = me.chart;
			var scale = me.getValueScale();
			var rects = me.getMeta().data;
			var dataset = me.getDataset();
			var ilen = rects.length;
			var i = 0;

			helpers.canvas.clipArea(chart.ctx, chart.chartArea);

			for (; i < ilen; ++i) {
				if (!isNaN(scale.getRightValue(dataset.data[i]))) {
					rects[i].draw();
				}
			}

			helpers.canvas.unclipArea(chart.ctx);
		},
	});

	Chart.controllers.horizontalBar = Chart.controllers.bar.extend({
		/**
		 * @private
		 */
		getValueScaleId: function() {
			return this.getMeta().xAxisID;
		},

		/**
		 * @private
		 */
		getIndexScaleId: function() {
			return this.getMeta().yAxisID;
		}
	});
};

},{"26":26,"41":41,"46":46}],16:[function(require,module,exports){
'use strict';

var defaults = require(26);
var elements = require(41);
var helpers = require(46);

defaults._set('bubble', {
	hover: {
		mode: 'single'
	},

	scales: {
		xAxes: [{
			type: 'linear', // bubble should probably use a linear scale by default
			position: 'bottom',
			id: 'x-axis-0' // need an ID so datasets can reference the scale
		}],
		yAxes: [{
			type: 'linear',
			position: 'left',
			id: 'y-axis-0'
		}]
	},

	tooltips: {
		callbacks: {
			title: function() {
				// Title doesn't make sense for scatter since we format the data as a point
				return '';
			},
			label: function(item, data) {
				var datasetLabel = data.datasets[item.datasetIndex].label || '';
				var dataPoint = data.datasets[item.datasetIndex].data[item.index];
				return datasetLabel + ': (' + item.xLabel + ', ' + item.yLabel + ', ' + dataPoint.r + ')';
			}
		}
	}
});


module.exports = function(Chart) {

	Chart.controllers.bubble = Chart.DatasetController.extend({
		/**
		 * @protected
		 */
		dataElementType: elements.Point,

		/**
		 * @protected
		 */
		update: function(reset) {
			var me = this;
			var meta = me.getMeta();
			var points = meta.data;

			// Update Points
			helpers.each(points, function(point, index) {
				me.updateElement(point, index, reset);
			});
		},

		/**
		 * @protected
		 */
		updateElement: function(point, index, reset) {
			var me = this;
			var meta = me.getMeta();
			var custom = point.custom || {};
			var xScale = me.getScaleForId(meta.xAxisID);
			var yScale = me.getScaleForId(meta.yAxisID);
			var options = me._resolveElementOptions(point, index);
			var data = me.getDataset().data[index];
			var dsIndex = me.index;

			var x = reset ? xScale.getPixelForDecimal(0.5) : xScale.getPixelForValue(typeof data === 'object' ? data : NaN, index, dsIndex);
			var y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(data, index, dsIndex);

			point._xScale = xScale;
			point._yScale = yScale;
			point._options = options;
			point._datasetIndex = dsIndex;
			point._index = index;
			point._model = {
				backgroundColor: options.backgroundColor,
				borderColor: options.borderColor,
				borderWidth: options.borderWidth,
				hitRadius: options.hitRadius,
				pointStyle: options.pointStyle,
				rotation: options.rotation,
				radius: reset ? 0 : options.radius,
				skip: custom.skip || isNaN(x) || isNaN(y),
				x: x,
				y: y,
			};

			point.pivot();
		},

		/**
		 * @protected
		 */
		setHoverStyle: function(point) {
			var model = point._model;
			var options = point._options;
			point.$previousStyle = {
				backgroundColor: model.backgroundColor,
				borderColor: model.borderColor,
				borderWidth: model.borderWidth,
				radius: model.radius
			};
			model.backgroundColor = helpers.valueOrDefault(options.hoverBackgroundColor, helpers.getHoverColor(options.backgroundColor));
			model.borderColor = helpers.valueOrDefault(options.hoverBorderColor, helpers.getHoverColor(options.borderColor));
			model.borderWidth = helpers.valueOrDefault(options.hoverBorderWidth, options.borderWidth);
			model.radius = options.radius + options.hoverRadius;
		},

		/**
		 * @private
		 */
		_resolveElementOptions: function(point, index) {
			var me = this;
			var chart = me.chart;
			var datasets = chart.data.datasets;
			var dataset = datasets[me.index];
			var custom = point.custom || {};
			var options = chart.options.elements.point;
			var resolve = helpers.options.resolve;
			var data = dataset.data[index];
			var values = {};
			var i, ilen, key;

			// Scriptable options
			var context = {
				chart: chart,
				dataIndex: index,
				dataset: dataset,
				datasetIndex: me.index
			};

			var keys = [
				'backgroundColor',
				'borderColor',
				'borderWidth',
				'hoverBackgroundColor',
				'hoverBorderColor',
				'hoverBorderWidth',
				'hoverRadius',
				'hitRadius',
				'pointStyle',
				'rotation'
			];

			for (i = 0, ilen = keys.length; i < ilen; ++i) {
				key = keys[i];
				values[key] = resolve([
					custom[key],
					dataset[key],
					options[key]
				], context, index);
			}

			// Custom radius resolution
			values.radius = resolve([
				custom.radius,
				data ? data.r : undefined,
				dataset.radius,
				options.radius
			], context, index);
			return values;
		}
	});
};

},{"26":26,"41":41,"46":46}],17:[function(require,module,exports){
'use strict';

var defaults = require(26);
var elements = require(41);
var helpers = require(46);

defaults._set('doughnut', {
	animation: {
		// Boolean - Whether we animate the rotation of the Doughnut
		animateRotate: true,
		// Boolean - Whether we animate scaling the Doughnut from the centre
		animateScale: false
	},
	hover: {
		mode: 'single'
	},
	legendCallback: function(chart) {
		var text = [];
		text.push('<ul class="' + chart.id + '-legend">');

		var data = chart.data;
		var datasets = data.datasets;
		var labels = data.labels;

		if (datasets.length) {
			for (var i = 0; i < datasets[0].data.length; ++i) {
				text.push('<li><span style="background-color:' + datasets[0].backgroundColor[i] + '"></span>');
				if (labels[i]) {
					text.push(labels[i]);
				}
				text.push('</li>');
			}
		}

		text.push('</ul>');
		return text.join('');
	},
	legend: {
		labels: {
			generateLabels: function(chart) {
				var data = chart.data;
				if (data.labels.length && data.datasets.length) {
					return data.labels.map(function(label, i) {
						var meta = chart.getDatasetMeta(0);
						var ds = data.datasets[0];
						var arc = meta.data[i];
						var custom = arc && arc.custom || {};
						var valueAtIndexOrDefault = helpers.valueAtIndexOrDefault;
						var arcOpts = chart.options.elements.arc;
						var fill = custom.backgroundColor ? custom.backgroundColor : valueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
						var stroke = custom.borderColor ? custom.borderColor : valueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
						var bw = custom.borderWidth ? custom.borderWidth : valueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

						return {
							text: label,
							fillStyle: fill,
							strokeStyle: stroke,
							lineWidth: bw,
							hidden: isNaN(ds.data[i]) || meta.data[i].hidden,

							// Extra data used for toggling the correct item
							index: i
						};
					});
				}
				return [];
			}
		},

		onClick: function(e, legendItem) {
			var index = legendItem.index;
			var chart = this.chart;
			var i, ilen, meta;

			for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
				meta = chart.getDatasetMeta(i);
				// toggle visibility of index if exists
				if (meta.data[index]) {
					meta.data[index].hidden = !meta.data[index].hidden;
				}
			}

			chart.update();
		}
	},

	// The percentage of the chart that we cut out of the middle.
	cutoutPercentage: 50,

	// The rotation of the chart, where the first data arc begins.
	rotation: Math.PI * -0.5,

	// The total circumference of the chart.
	circumference: Math.PI * 2.0,

	// Need to override these to give a nice default
	tooltips: {
		callbacks: {
			title: function() {
				return '';
			},
			label: function(tooltipItem, data) {
				var dataLabel = data.labels[tooltipItem.index];
				var value = ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

				if (helpers.isArray(dataLabel)) {
					// show value on first line of multiline label
					// need to clone because we are changing the value
					dataLabel = dataLabel.slice();
					dataLabel[0] += value;
				} else {
					dataLabel += value;
				}

				return dataLabel;
			}
		}
	}
});

defaults._set('pie', helpers.clone(defaults.doughnut));
defaults._set('pie', {
	cutoutPercentage: 0
});

module.exports = function(Chart) {

	Chart.controllers.doughnut = Chart.controllers.pie = Chart.DatasetController.extend({

		dataElementType: elements.Arc,

		linkScales: helpers.noop,

		// Get index of the dataset in relation to the visible datasets. This allows determining the inner and outer radius correctly
		getRingIndex: function(datasetIndex) {
			var ringIndex = 0;

			for (var j = 0; j < datasetIndex; ++j) {
				if (this.chart.isDatasetVisible(j)) {
					++ringIndex;
				}
			}

			return ringIndex;
		},

		update: function(reset) {
			var me = this;
			var chart = me.chart;
			var chartArea = chart.chartArea;
			var opts = chart.options;
			var arcOpts = opts.elements.arc;
			var availableWidth = chartArea.right - chartArea.left - arcOpts.borderWidth;
			var availableHeight = chartArea.bottom - chartArea.top - arcOpts.borderWidth;
			var minSize = Math.min(availableWidth, availableHeight);
			var offset = {x: 0, y: 0};
			var meta = me.getMeta();
			var cutoutPercentage = opts.cutoutPercentage;
			var circumference = opts.circumference;

			// If the chart's circumference isn't a full circle, calculate minSize as a ratio of the width/height of the arc
			if (circumference < Math.PI * 2.0) {
				var startAngle = opts.rotation % (Math.PI * 2.0);
				startAngle += Math.PI * 2.0 * (startAngle >= Math.PI ? -1 : startAngle < -Math.PI ? 1 : 0);
				var endAngle = startAngle + circumference;
				var start = {x: Math.cos(startAngle), y: Math.sin(startAngle)};
				var end = {x: Math.cos(endAngle), y: Math.sin(endAngle)};
				var contains0 = (startAngle <= 0 && endAngle >= 0) || (startAngle <= Math.PI * 2.0 && Math.PI * 2.0 <= endAngle);
				var contains90 = (startAngle <= Math.PI * 0.5 && Math.PI * 0.5 <= endAngle) || (startAngle <= Math.PI * 2.5 && Math.PI * 2.5 <= endAngle);
				var contains180 = (startAngle <= -Math.PI && -Math.PI <= endAngle) || (startAngle <= Math.PI && Math.PI <= endAngle);
				var contains270 = (startAngle <= -Math.PI * 0.5 && -Math.PI * 0.5 <= endAngle) || (startAngle <= Math.PI * 1.5 && Math.PI * 1.5 <= endAngle);
				var cutout = cutoutPercentage / 100.0;
				var min = {x: contains180 ? -1 : Math.min(start.x * (start.x < 0 ? 1 : cutout), end.x * (end.x < 0 ? 1 : cutout)), y: contains270 ? -1 : Math.min(start.y * (start.y < 0 ? 1 : cutout), end.y * (end.y < 0 ? 1 : cutout))};
				var max = {x: contains0 ? 1 : Math.max(start.x * (start.x > 0 ? 1 : cutout), end.x * (end.x > 0 ? 1 : cutout)), y: contains90 ? 1 : Math.max(start.y * (start.y > 0 ? 1 : cutout), end.y * (end.y > 0 ? 1 : cutout))};
				var size = {width: (max.x - min.x) * 0.5, height: (max.y - min.y) * 0.5};
				minSize = Math.min(availableWidth / size.width, availableHeight / size.height);
				offset = {x: (max.x + min.x) * -0.5, y: (max.y + min.y) * -0.5};
			}

			chart.borderWidth = me.getMaxBorderWidth(meta.data);
			chart.outerRadius = Math.max((minSize - chart.borderWidth) / 2, 0);
			chart.innerRadius = Math.max(cutoutPercentage ? (chart.outerRadius / 100) * (cutoutPercentage) : 0, 0);
			chart.radiusLength = (chart.outerRadius - chart.innerRadius) / chart.getVisibleDatasetCount();
			chart.offsetX = offset.x * chart.outerRadius;
			chart.offsetY = offset.y * chart.outerRadius;

			meta.total = me.calculateTotal();

			me.outerRadius = chart.outerRadius - (chart.radiusLength * me.getRingIndex(me.index));
			me.innerRadius = Math.max(me.outerRadius - chart.radiusLength, 0);

			helpers.each(meta.data, function(arc, index) {
				me.updateElement(arc, index, reset);
			});
		},

		updateElement: function(arc, index, reset) {
			var me = this;
			var chart = me.chart;
			var chartArea = chart.chartArea;
			var opts = chart.options;
			var animationOpts = opts.animation;
			var centerX = (chartArea.left + chartArea.right) / 2;
			var centerY = (chartArea.top + chartArea.bottom) / 2;
			var startAngle = opts.rotation; // non reset case handled later
			var endAngle = opts.rotation; // non reset case handled later
			var dataset = me.getDataset();
			var circumference = reset && animationOpts.animateRotate ? 0 : arc.hidden ? 0 : me.calculateCircumference(dataset.data[index]) * (opts.circumference / (2.0 * Math.PI));
			var innerRadius = reset && animationOpts.animateScale ? 0 : me.innerRadius;
			var outerRadius = reset && animationOpts.animateScale ? 0 : me.outerRadius;
			var valueAtIndexOrDefault = helpers.valueAtIndexOrDefault;

			helpers.extend(arc, {
				// Utility
				_datasetIndex: me.index,
				_index: index,

				// Desired view properties
				_model: {
					x: centerX + chart.offsetX,
					y: centerY + chart.offsetY,
					startAngle: startAngle,
					endAngle: endAngle,
					circumference: circumference,
					outerRadius: outerRadius,
					innerRadius: innerRadius,
					label: valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index])
				}
			});

			var model = arc._model;

			// Resets the visual styles
			var custom = arc.custom || {};
			var valueOrDefault = helpers.valueAtIndexOrDefault;
			var elementOpts = this.chart.options.elements.arc;
			model.backgroundColor = custom.backgroundColor ? custom.backgroundColor : valueOrDefault(dataset.backgroundColor, index, elementOpts.backgroundColor);
			model.borderColor = custom.borderColor ? custom.borderColor : valueOrDefault(dataset.borderColor, index, elementOpts.borderColor);
			model.borderWidth = custom.borderWidth ? custom.borderWidth : valueOrDefault(dataset.borderWidth, index, elementOpts.borderWidth);

			// Set correct angles if not resetting
			if (!reset || !animationOpts.animateRotate) {
				if (index === 0) {
					model.startAngle = opts.rotation;
				} else {
					model.startAngle = me.getMeta().data[index - 1]._model.endAngle;
				}

				model.endAngle = model.startAngle + model.circumference;
			}

			arc.pivot();
		},

		calculateTotal: function() {
			var dataset = this.getDataset();
			var meta = this.getMeta();
			var total = 0;
			var value;

			helpers.each(meta.data, function(element, index) {
				value = dataset.data[index];
				if (!isNaN(value) && !element.hidden) {
					total += Math.abs(value);
				}
			});

			/* if (total === 0) {
				total = NaN;
			}*/

			return total;
		},

		calculateCircumference: function(value) {
			var total = this.getMeta().total;
			if (total > 0 && !isNaN(value)) {
				return (Math.PI * 2.0) * (Math.abs(value) / total);
			}
			return 0;
		},

		// gets the max border or hover width to properly scale pie charts
		getMaxBorderWidth: function(arcs) {
			var max = 0;
			var index = this.index;
			var length = arcs.length;
			var borderWidth;
			var hoverWidth;

			for (var i = 0; i < length; i++) {
				borderWidth = arcs[i]._model ? arcs[i]._model.borderWidth : 0;
				hoverWidth = arcs[i]._chart ? arcs[i]._chart.config.data.datasets[index].hoverBorderWidth : 0;

				max = borderWidth > max ? borderWidth : max;
				max = hoverWidth > max ? hoverWidth : max;
			}
			return max;
		}
	});
};

},{"26":26,"41":41,"46":46}],18:[function(require,module,exports){
'use strict';

var defaults = require(26);
var elements = require(41);
var helpers = require(46);

defaults._set('line', {
	showLines: true,
	spanGaps: false,

	hover: {
		mode: 'label'
	},

	scales: {
		xAxes: [{
			type: 'category',
			id: 'x-axis-0'
		}],
		yAxes: [{
			type: 'linear',
			id: 'y-axis-0'
		}]
	}
});

module.exports = function(Chart) {

	function lineEnabled(dataset, options) {
		return helpers.valueOrDefault(dataset.showLine, options.showLines);
	}

	Chart.controllers.line = Chart.DatasetController.extend({

		datasetElementType: elements.Line,

		dataElementType: elements.Point,

		update: function(reset) {
			var me = this;
			var meta = me.getMeta();
			var line = meta.dataset;
			var points = meta.data || [];
			var options = me.chart.options;
			var lineElementOptions = options.elements.line;
			var scale = me.getScaleForId(meta.yAxisID);
			var i, ilen, custom;
			var dataset = me.getDataset();
			var showLine = lineEnabled(dataset, options);

			// Update Line
			if (showLine) {
				custom = line.custom || {};

				// Compatibility: If the properties are defined with only the old name, use those values
				if ((dataset.tension !== undefined) && (dataset.lineTension === undefined)) {
					dataset.lineTension = dataset.tension;
				}

				// Utility
				line._scale = scale;
				line._datasetIndex = me.index;
				// Data
				line._children = points;
				// Model
				line._model = {
					// Appearance
					// The default behavior of lines is to break at null values, according
					// to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
					// This option gives lines the ability to span gaps
					spanGaps: dataset.spanGaps ? dataset.spanGaps : options.spanGaps,
					tension: custom.tension ? custom.tension : helpers.valueOrDefault(dataset.lineTension, lineElementOptions.tension),
					backgroundColor: custom.backgroundColor ? custom.backgroundColor : (dataset.backgroundColor || lineElementOptions.backgroundColor),
					borderWidth: custom.borderWidth ? custom.borderWidth : (dataset.borderWidth || lineElementOptions.borderWidth),
					borderColor: custom.borderColor ? custom.borderColor : (dataset.borderColor || lineElementOptions.borderColor),
					borderCapStyle: custom.borderCapStyle ? custom.borderCapStyle : (dataset.borderCapStyle || lineElementOptions.borderCapStyle),
					borderDash: custom.borderDash ? custom.borderDash : (dataset.borderDash || lineElementOptions.borderDash),
					borderDashOffset: custom.borderDashOffset ? custom.borderDashOffset : (dataset.borderDashOffset || lineElementOptions.borderDashOffset),
					borderJoinStyle: custom.borderJoinStyle ? custom.borderJoinStyle : (dataset.borderJoinStyle || lineElementOptions.borderJoinStyle),
					fill: custom.fill ? custom.fill : (dataset.fill !== undefined ? dataset.fill : lineElementOptions.fill),
					steppedLine: custom.steppedLine ? custom.steppedLine : helpers.valueOrDefault(dataset.steppedLine, lineElementOptions.stepped),
					cubicInterpolationMode: custom.cubicInterpolationMode ? custom.cubicInterpolationMode : helpers.valueOrDefault(dataset.cubicInterpolationMode, lineElementOptions.cubicInterpolationMode),
				};

				line.pivot();
			}

			// Update Points
			for (i = 0, ilen = points.length; i < ilen; ++i) {
				me.updateElement(points[i], i, reset);
			}

			if (showLine && line._model.tension !== 0) {
				me.updateBezierControlPoints();
			}

			// Now pivot the point for animation
			for (i = 0, ilen = points.length; i < ilen; ++i) {
				points[i].pivot();
			}
		},

		getPointBackgroundColor: function(point, index) {
			var backgroundColor = this.chart.options.elements.point.backgroundColor;
			var dataset = this.getDataset();
			var custom = point.custom || {};

			if (custom.backgroundColor) {
				backgroundColor = custom.backgroundColor;
			} else if (dataset.pointBackgroundColor) {
				backgroundColor = helpers.valueAtIndexOrDefault(dataset.pointBackgroundColor, index, backgroundColor);
			} else if (dataset.backgroundColor) {
				backgroundColor = dataset.backgroundColor;
			}

			return backgroundColor;
		},

		getPointBorderColor: function(point, index) {
			var borderColor = this.chart.options.elements.point.borderColor;
			var dataset = this.getDataset();
			var custom = point.custom || {};

			if (custom.borderColor) {
				borderColor = custom.borderColor;
			} else if (dataset.pointBorderColor) {
				borderColor = helpers.valueAtIndexOrDefault(dataset.pointBorderColor, index, borderColor);
			} else if (dataset.borderColor) {
				borderColor = dataset.borderColor;
			}

			return borderColor;
		},

		getPointBorderWidth: function(point, index) {
			var borderWidth = this.chart.options.elements.point.borderWidth;
			var dataset = this.getDataset();
			var custom = point.custom || {};

			if (!isNaN(custom.borderWidth)) {
				borderWidth = custom.borderWidth;
			} else if (!isNaN(dataset.pointBorderWidth) || helpers.isArray(dataset.pointBorderWidth)) {
				borderWidth = helpers.valueAtIndexOrDefault(dataset.pointBorderWidth, index, borderWidth);
			} else if (!isNaN(dataset.borderWidth)) {
				borderWidth = dataset.borderWidth;
			}

			return borderWidth;
		},

		getPointRotation: function(point, index) {
			var pointRotation = this.chart.options.elements.point.rotation;
			var dataset = this.getDataset();
			var custom = point.custom || {};

			if (!isNaN(custom.rotation)) {
				pointRotation = custom.rotation;
			} else if (!isNaN(dataset.pointRotation) || helpers.isArray(dataset.pointRotation)) {
				pointRotation = helpers.valueAtIndexOrDefault(dataset.pointRotation, index, pointRotation);
			}
			return pointRotation;
		},

		updateElement: function(point, index, reset) {
			var me = this;
			var meta = me.getMeta();
			var custom = point.custom || {};
			var dataset = me.getDataset();
			var datasetIndex = me.index;
			var value = dataset.data[index];
			var yScale = me.getScaleForId(meta.yAxisID);
			var xScale = me.getScaleForId(meta.xAxisID);
			var pointOptions = me.chart.options.elements.point;
			var x, y;

			// Compatibility: If the properties are defined with only the old name, use those values
			if ((dataset.radius !== undefined) && (dataset.pointRadius === undefined)) {
				dataset.pointRadius = dataset.radius;
			}
			if ((dataset.hitRadius !== undefined) && (dataset.pointHitRadius === undefined)) {
				dataset.pointHitRadius = dataset.hitRadius;
			}

			x = xScale.getPixelForValue(typeof value === 'object' ? value : NaN, index, datasetIndex);
			y = reset ? yScale.getBasePixel() : me.calculatePointY(value, index, datasetIndex);

			// Utility
			point._xScale = xScale;
			point._yScale = yScale;
			point._datasetIndex = datasetIndex;
			point._index = index;

			// Desired view properties
			point._model = {
				x: x,
				y: y,
				skip: custom.skip || isNaN(x) || isNaN(y),
				// Appearance
				radius: custom.radius || helpers.valueAtIndexOrDefault(dataset.pointRadius, index, pointOptions.radius),
				pointStyle: custom.pointStyle || helpers.valueAtIndexOrDefault(dataset.pointStyle, index, pointOptions.pointStyle),
				rotation: me.getPointRotation(point, index),
				backgroundColor: me.getPointBackgroundColor(point, index),
				borderColor: me.getPointBorderColor(point, index),
				borderWidth: me.getPointBorderWidth(point, index),
				tension: meta.dataset._model ? meta.dataset._model.tension : 0,
				steppedLine: meta.dataset._model ? meta.dataset._model.steppedLine : false,
				// Tooltip
				hitRadius: custom.hitRadius || helpers.valueAtIndexOrDefault(dataset.pointHitRadius, index, pointOptions.hitRadius)
			};
		},

		calculatePointY: function(value, index, datasetIndex) {
			var me = this;
			var chart = me.chart;
			var meta = me.getMeta();
			var yScale = me.getScaleForId(meta.yAxisID);
			var sumPos = 0;
			var sumNeg = 0;
			var i, ds, dsMeta;

			if (yScale.options.stacked) {
				for (i = 0; i < datasetIndex; i++) {
					ds = chart.data.datasets[i];
					dsMeta = chart.getDatasetMeta(i);
					if (dsMeta.type === 'line' && dsMeta.yAxisID === yScale.id && chart.isDatasetVisible(i)) {
						var stackedRightValue = Number(yScale.getRightValue(ds.data[index]));
						if (stackedRightValue < 0) {
							sumNeg += stackedRightValue || 0;
						} else {
							sumPos += stackedRightValue || 0;
						}
					}
				}

				var rightValue = Number(yScale.getRightValue(value));
				if (rightValue < 0) {
					return yScale.getPixelForValue(sumNeg + rightValue);
				}
				return yScale.getPixelForValue(sumPos + rightValue);
			}

			return yScale.getPixelForValue(value);
		},

		updateBezierControlPoints: function() {
			var me = this;
			var meta = me.getMeta();
			var area = me.chart.chartArea;
			var points = (meta.data || []);
			var i, ilen, point, model, controlPoints;

			// Only consider points that are drawn in case the spanGaps option is used
			if (meta.dataset._model.spanGaps) {
				points = points.filter(function(pt) {
					return !pt._model.skip;
				});
			}

			function capControlPoint(pt, min, max) {
				return Math.max(Math.min(pt, max), min);
			}

			if (meta.dataset._model.cubicInterpolationMode === 'monotone') {
				helpers.splineCurveMonotone(points);
			} else {
				for (i = 0, ilen = points.length; i < ilen; ++i) {
					point = points[i];
					model = point._model;
					controlPoints = helpers.splineCurve(
						helpers.previousItem(points, i)._model,
						model,
						helpers.nextItem(points, i)._model,
						meta.dataset._model.tension
					);
					model.controlPointPreviousX = controlPoints.previous.x;
					model.controlPointPreviousY = controlPoints.previous.y;
					model.controlPointNextX = controlPoints.next.x;
					model.controlPointNextY = controlPoints.next.y;
				}
			}

			if (me.chart.options.elements.line.capBezierPoints) {
				for (i = 0, ilen = points.length; i < ilen; ++i) {
					model = points[i]._model;
					model.controlPointPreviousX = capControlPoint(model.controlPointPreviousX, area.left, area.right);
					model.controlPointPreviousY = capControlPoint(model.controlPointPreviousY, area.top, area.bottom);
					model.controlPointNextX = capControlPoint(model.controlPointNextX, area.left, area.right);
					model.controlPointNextY = capControlPoint(model.controlPointNextY, area.top, area.bottom);
				}
			}
		},

		draw: function() {
			var me = this;
			var chart = me.chart;
			var meta = me.getMeta();
			var points = meta.data || [];
			var area = chart.chartArea;
			var ilen = points.length;
			var halfBorderWidth;
			var i = 0;

			if (lineEnabled(me.getDataset(), chart.options)) {
				halfBorderWidth = (meta.dataset._model.borderWidth || 0) / 2;

				helpers.canvas.clipArea(chart.ctx, {
					left: area.left,
					right: area.right,
					top: area.top - halfBorderWidth,
					bottom: area.bottom + halfBorderWidth
				});

				meta.dataset.draw();

				helpers.canvas.unclipArea(chart.ctx);
			}

			// Draw the points
			for (; i < ilen; ++i) {
				points[i].draw(area);
			}
		},

		setHoverStyle: function(element) {
			// Point
			var dataset = this.chart.data.datasets[element._datasetIndex];
			var index = element._index;
			var custom = element.custom || {};
			var model = element._model;

			element.$previousStyle = {
				backgroundColor: model.backgroundColor,
				borderColor: model.borderColor,
				borderWidth: model.borderWidth,
				radius: model.radius
			};

			model.backgroundColor = custom.hoverBackgroundColor || helpers.valueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.getHoverColor(model.backgroundColor));
			model.borderColor = custom.hoverBorderColor || helpers.valueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.getHoverColor(model.borderColor));
			model.borderWidth = custom.hoverBorderWidth || helpers.valueAtIndexOrDefault(dataset.pointHoverBorderWidth, index, model.borderWidth);
			model.radius = custom.hoverRadius || helpers.valueAtIndexOrDefault(dataset.pointHoverRadius, index, this.chart.options.elements.point.hoverRadius);
		},
	});
};

},{"26":26,"41":41,"46":46}],19:[function(require,module,exports){
'use strict';

var defaults = require(26);
var elements = require(41);
var helpers = require(46);

defaults._set('polarArea', {
	scale: {
		type: 'radialLinear',
		angleLines: {
			display: false
		},
		gridLines: {
			circular: true
		},
		pointLabels: {
			display: false
		},
		ticks: {
			beginAtZero: true
		}
	},

	// Boolean - Whether to animate the rotation of the chart
	animation: {
		animateRotate: true,
		animateScale: true
	},

	startAngle: -0.5 * Math.PI,
	legendCallback: function(chart) {
		var text = [];
		text.push('<ul class="' + chart.id + '-legend">');

		var data = chart.data;
		var datasets = data.datasets;
		var labels = data.labels;

		if (datasets.length) {
			for (var i = 0; i < datasets[0].data.length; ++i) {
				text.push('<li><span style="background-color:' + datasets[0].backgroundColor[i] + '"></span>');
				if (labels[i]) {
					text.push(labels[i]);
				}
				text.push('</li>');
			}
		}

		text.push('</ul>');
		return text.join('');
	},
	legend: {
		labels: {
			generateLabels: function(chart) {
				var data = chart.data;
				if (data.labels.length && data.datasets.length) {
					return data.labels.map(function(label, i) {
						var meta = chart.getDatasetMeta(0);
						var ds = data.datasets[0];
						var arc = meta.data[i];
						var custom = arc.custom || {};
						var valueAtIndexOrDefault = helpers.valueAtIndexOrDefault;
						var arcOpts = chart.options.elements.arc;
						var fill = custom.backgroundColor ? custom.backgroundColor : valueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
						var stroke = custom.borderColor ? custom.borderColor : valueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
						var bw = custom.borderWidth ? custom.borderWidth : valueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

						return {
							text: label,
							fillStyle: fill,
							strokeStyle: stroke,
							lineWidth: bw,
							hidden: isNaN(ds.data[i]) || meta.data[i].hidden,

							// Extra data used for toggling the correct item
							index: i
						};
					});
				}
				return [];
			}
		},

		onClick: function(e, legendItem) {
			var index = legendItem.index;
			var chart = this.chart;
			var i, ilen, meta;

			for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
				meta = chart.getDatasetMeta(i);
				meta.data[index].hidden = !meta.data[index].hidden;
			}

			chart.update();
		}
	},

	// Need to override these to give a nice default
	tooltips: {
		callbacks: {
			title: function() {
				return '';
			},
			label: function(item, data) {
				return data.labels[item.index] + ': ' + item.yLabel;
			}
		}
	}
});

module.exports = function(Chart) {

	Chart.controllers.polarArea = Chart.DatasetController.extend({

		dataElementType: elements.Arc,

		linkScales: helpers.noop,

		update: function(reset) {
			var me = this;
			var dataset = me.getDataset();
			var meta = me.getMeta();
			var start = me.chart.options.startAngle || 0;
			var starts = me._starts = [];
			var angles = me._angles = [];
			var i, ilen, angle;

			me._updateRadius();

			meta.count = me.countVisibleElements();

			for (i = 0, ilen = dataset.data.length; i < ilen; i++) {
				starts[i] = start;
				angle = me._computeAngle(i);
				angles[i] = angle;
				start += angle;
			}

			helpers.each(meta.data, function(arc, index) {
				me.updateElement(arc, index, reset);
			});
		},

		/**
		 * @private
		 */
		_updateRadius: function() {
			var me = this;
			var chart = me.chart;
			var chartArea = chart.chartArea;
			var opts = chart.options;
			var arcOpts = opts.elements.arc;
			var minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);

			chart.outerRadius = Math.max((minSize - arcOpts.borderWidth / 2) / 2, 0);
			chart.innerRadius = Math.max(opts.cutoutPercentage ? (chart.outerRadius / 100) * (opts.cutoutPercentage) : 1, 0);
			chart.radiusLength = (chart.outerRadius - chart.innerRadius) / chart.getVisibleDatasetCount();

			me.outerRadius = chart.outerRadius - (chart.radiusLength * me.index);
			me.innerRadius = me.outerRadius - chart.radiusLength;
		},

		updateElement: function(arc, index, reset) {
			var me = this;
			var chart = me.chart;
			var dataset = me.getDataset();
			var opts = chart.options;
			var animationOpts = opts.animation;
			var scale = chart.scale;
			var labels = chart.data.labels;

			var centerX = scale.xCenter;
			var centerY = scale.yCenter;

			// var negHalfPI = -0.5 * Math.PI;
			var datasetStartAngle = opts.startAngle;
			var distance = arc.hidden ? 0 : scale.getDistanceFromCenterForValue(dataset.data[index]);
			var startAngle = me._starts[index];
			var endAngle = startAngle + (arc.hidden ? 0 : me._angles[index]);

			var resetRadius = animationOpts.animateScale ? 0 : scale.getDistanceFromCenterForValue(dataset.data[index]);

			helpers.extend(arc, {
				// Utility
				_datasetIndex: me.index,
				_index: index,
				_scale: scale,

				// Desired view properties
				_model: {
					x: centerX,
					y: centerY,
					innerRadius: 0,
					outerRadius: reset ? resetRadius : distance,
					startAngle: reset && animationOpts.animateRotate ? datasetStartAngle : startAngle,
					endAngle: reset && animationOpts.animateRotate ? datasetStartAngle : endAngle,
					label: helpers.valueAtIndexOrDefault(labels, index, labels[index])
				}
			});

			// Apply border and fill style
			var elementOpts = this.chart.options.elements.arc;
			var custom = arc.custom || {};
			var valueOrDefault = helpers.valueAtIndexOrDefault;
			var model = arc._model;

			model.backgroundColor = custom.backgroundColor ? custom.backgroundColor : valueOrDefault(dataset.backgroundColor, index, elementOpts.backgroundColor);
			model.borderColor = custom.borderColor ? custom.borderColor : valueOrDefault(dataset.borderColor, index, elementOpts.borderColor);
			model.borderWidth = custom.borderWidth ? custom.borderWidth : valueOrDefault(dataset.borderWidth, index, elementOpts.borderWidth);

			arc.pivot();
		},

		countVisibleElements: function() {
			var dataset = this.getDataset();
			var meta = this.getMeta();
			var count = 0;

			helpers.each(meta.data, function(element, index) {
				if (!isNaN(dataset.data[index]) && !element.hidden) {
					count++;
				}
			});

			return count;
		},

		/**
		 * @private
		 */
		_computeAngle: function(index) {
			var me = this;
			var count = this.getMeta().count;
			var dataset = me.getDataset();
			var meta = me.getMeta();

			if (isNaN(dataset.data[index]) || meta.data[index].hidden) {
				return 0;
			}

			// Scriptable options
			var context = {
				chart: me.chart,
				dataIndex: index,
				dataset: dataset,
				datasetIndex: me.index
			};

			return helpers.options.resolve([
				me.chart.options.elements.arc.angle,
				(2 * Math.PI) / count
			], context, index);
		}
	});
};

},{"26":26,"41":41,"46":46}],20:[function(require,module,exports){
'use strict';

var defaults = require(26);
var elements = require(41);
var helpers = require(46);

defaults._set('radar', {
	scale: {
		type: 'radialLinear'
	},
	elements: {
		line: {
			tension: 0 // no bezier in radar
		}
	}
});

module.exports = function(Chart) {

	Chart.controllers.radar = Chart.DatasetController.extend({

		datasetElementType: elements.Line,

		dataElementType: elements.Point,

		linkScales: helpers.noop,

		update: function(reset) {
			var me = this;
			var meta = me.getMeta();
			var line = meta.dataset;
			var points = meta.data;
			var custom = line.custom || {};
			var dataset = me.getDataset();
			var lineElementOptions = me.chart.options.elements.line;
			var scale = me.chart.scale;

			// Compatibility: If the properties are defined with only the old name, use those values
			if ((dataset.tension !== undefined) && (dataset.lineTension === undefined)) {
				dataset.lineTension = dataset.tension;
			}

			helpers.extend(meta.dataset, {
				// Utility
				_datasetIndex: me.index,
				_scale: scale,
				// Data
				_children: points,
				_loop: true,
				// Model
				_model: {
					// Appearance
					tension: custom.tension ? custom.tension : helpers.valueOrDefault(dataset.lineTension, lineElementOptions.tension),
					backgroundColor: custom.backgroundColor ? custom.backgroundColor : (dataset.backgroundColor || lineElementOptions.backgroundColor),
					borderWidth: custom.borderWidth ? custom.borderWidth : (dataset.borderWidth || lineElementOptions.borderWidth),
					borderColor: custom.borderColor ? custom.borderColor : (dataset.borderColor || lineElementOptions.borderColor),
					fill: custom.fill ? custom.fill : (dataset.fill !== undefined ? dataset.fill : lineElementOptions.fill),
					borderCapStyle: custom.borderCapStyle ? custom.borderCapStyle : (dataset.borderCapStyle || lineElementOptions.borderCapStyle),
					borderDash: custom.borderDash ? custom.borderDash : (dataset.borderDash || lineElementOptions.borderDash),
					borderDashOffset: custom.borderDashOffset ? custom.borderDashOffset : (dataset.borderDashOffset || lineElementOptions.borderDashOffset),
					borderJoinStyle: custom.borderJoinStyle ? custom.borderJoinStyle : (dataset.borderJoinStyle || lineElementOptions.borderJoinStyle),
				}
			});

			meta.dataset.pivot();

			// Update Points
			helpers.each(points, function(point, index) {
				me.updateElement(point, index, reset);
			}, me);

			// Update bezier control points
			me.updateBezierControlPoints();
		},
		updateElement: function(point, index, reset) {
			var me = this;
			var custom = point.custom || {};
			var dataset = me.getDataset();
			var scale = me.chart.scale;
			var pointElementOptions = me.chart.options.elements.point;
			var pointPosition = scale.getPointPositionForValue(index, dataset.data[index]);

			// Compatibility: If the properties are defined with only the old name, use those values
			if ((dataset.radius !== undefined) && (dataset.pointRadius === undefined)) {
				dataset.pointRadius = dataset.radius;
			}
			if ((dataset.hitRadius !== undefined) && (dataset.pointHitRadius === undefined)) {
				dataset.pointHitRadius = dataset.hitRadius;
			}

			helpers.extend(point, {
				// Utility
				_datasetIndex: me.index,
				_index: index,
				_scale: scale,

				// Desired view properties
				_model: {
					x: reset ? scale.xCenter : pointPosition.x, // value not used in dataset scale, but we want a consistent API between scales
					y: reset ? scale.yCenter : pointPosition.y,

					// Appearance
					tension: custom.tension ? custom.tension : helpers.valueOrDefault(dataset.lineTension, me.chart.options.elements.line.tension),
					radius: custom.radius ? custom.radius : helpers.valueAtIndexOrDefault(dataset.pointRadius, index, pointElementOptions.radius),
					backgroundColor: custom.backgroundColor ? custom.backgroundColor : helpers.valueAtIndexOrDefault(dataset.pointBackgroundColor, index, pointElementOptions.backgroundColor),
					borderColor: custom.borderColor ? custom.borderColor : helpers.valueAtIndexOrDefault(dataset.pointBorderColor, index, pointElementOptions.borderColor),
					borderWidth: custom.borderWidth ? custom.borderWidth : helpers.valueAtIndexOrDefault(dataset.pointBorderWidth, index, pointElementOptions.borderWidth),
					pointStyle: custom.pointStyle ? custom.pointStyle : helpers.valueAtIndexOrDefault(dataset.pointStyle, index, pointElementOptions.pointStyle),
					rotation: custom.rotation ? custom.rotation : helpers.valueAtIndexOrDefault(dataset.pointRotation, index, pointElementOptions.rotation),

					// Tooltip
					hitRadius: custom.hitRadius ? custom.hitRadius : helpers.valueAtIndexOrDefault(dataset.pointHitRadius, index, pointElementOptions.hitRadius)
				}
			});

			point._model.skip = custom.skip ? custom.skip : (isNaN(point._model.x) || isNaN(point._model.y));
		},
		updateBezierControlPoints: function() {
			var chartArea = this.chart.chartArea;
			var meta = this.getMeta();

			helpers.each(meta.data, function(point, index) {
				var model = point._model;
				var controlPoints = helpers.splineCurve(
					helpers.previousItem(meta.data, index, true)._model,
					model,
					helpers.nextItem(meta.data, index, true)._model,
					model.tension
				);

				// Prevent the bezier going outside of the bounds of the graph
				model.controlPointPreviousX = Math.max(Math.min(controlPoints.previous.x, chartArea.right), chartArea.left);
				model.controlPointPreviousY = Math.max(Math.min(controlPoints.previous.y, chartArea.bottom), chartArea.top);

				model.controlPointNextX = Math.max(Math.min(controlPoints.next.x, chartArea.right), chartArea.left);
				model.controlPointNextY = Math.max(Math.min(controlPoints.next.y, chartArea.bottom), chartArea.top);

				// Now pivot the point for animation
				point.pivot();
			});
		},

		setHoverStyle: function(point) {
			// Point
			var dataset = this.chart.data.datasets[point._datasetIndex];
			var custom = point.custom || {};
			var index = point._index;
			var model = point._model;

			point.$previousStyle = {
				backgroundColor: model.backgroundColor,
				borderColor: model.borderColor,
				borderWidth: model.borderWidth,
				radius: model.radius
			};

			model.radius = custom.hoverRadius ? custom.hoverRadius : helpers.valueAtIndexOrDefault(dataset.pointHoverRadius, index, this.chart.options.elements.point.hoverRadius);
			model.backgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor : helpers.valueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.getHoverColor(model.backgroundColor));
			model.borderColor = custom.hoverBorderColor ? custom.hoverBorderColor : helpers.valueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.getHoverColor(model.borderColor));
			model.borderWidth = custom.hoverBorderWidth ? custom.hoverBorderWidth : helpers.valueAtIndexOrDefault(dataset.pointHoverBorderWidth, index, model.borderWidth);
		},
	});
};

},{"26":26,"41":41,"46":46}],21:[function(require,module,exports){
'use strict';

var defaults = require(26);

defaults._set('scatter', {
	hover: {
		mode: 'single'
	},

	scales: {
		xAxes: [{
			id: 'x-axis-1',    // need an ID so datasets can reference the scale
			type: 'linear',    // scatter should not use a category axis
			position: 'bottom'
		}],
		yAxes: [{
			id: 'y-axis-1',
			type: 'linear',
			position: 'left'
		}]
	},

	showLines: false,

	tooltips: {
		callbacks: {
			title: function() {
				return '';     // doesn't make sense for scatter since data are formatted as a point
			},
			label: function(item) {
				return '(' + item.xLabel + ', ' + item.yLabel + ')';
			}
		}
	}
});

module.exports = function(Chart) {

	// Scatter charts use line controllers
	Chart.controllers.scatter = Chart.controllers.line;

};

},{"26":26}],22:[function(require,module,exports){
'use strict';

var Element = require(27);

var exports = module.exports = Element.extend({
	chart: null, // the animation associated chart instance
	currentStep: 0, // the current animation step
	numSteps: 60, // default number of steps
	easing: '', // the easing to use for this animation
	render: null, // render function used by the animation service

	onAnimationProgress: null, // user specified callback to fire on each step of the animation
	onAnimationComplete: null, // user specified callback to fire when the animation finishes
});

// DEPRECATIONS

/**
 * Provided for backward compatibility, use Chart.Animation instead
 * @prop Chart.Animation#animationObject
 * @deprecated since version 2.6.0
 * @todo remove at version 3
 */
Object.defineProperty(exports.prototype, 'animationObject', {
	get: function() {
		return this;
	}
});

/**
 * Provided for backward compatibility, use Chart.Animation#chart instead
 * @prop Chart.Animation#chartInstance
 * @deprecated since version 2.6.0
 * @todo remove at version 3
 */
Object.defineProperty(exports.prototype, 'chartInstance', {
	get: function() {
		return this.chart;
	},
	set: function(value) {
		this.chart = value;
	}
});

},{"27":27}],23:[function(require,module,exports){
/* global window: false */
'use strict';

var defaults = require(26);
var helpers = require(46);

defaults._set('global', {
	animation: {
		duration: 1000,
		easing: 'easeOutQuart',
		onProgress: helpers.noop,
		onComplete: helpers.noop
	}
});

module.exports = {
	frameDuration: 17,
	animations: [],
	dropFrames: 0,
	request: null,

	/**
	 * @param {Chart} chart - The chart to animate.
	 * @param {Chart.Animation} animation - The animation that we will animate.
	 * @param {Number} duration - The animation duration in ms.
	 * @param {Boolean} lazy - if true, the chart is not marked as animating to enable more responsive interactions
	 */
	addAnimation: function(chart, animation, duration, lazy) {
		var animations = this.animations;
		var i, ilen;

		animation.chart = chart;

		if (!lazy) {
			chart.animating = true;
		}

		for (i = 0, ilen = animations.length; i < ilen; ++i) {
			if (animations[i].chart === chart) {
				animations[i] = animation;
				return;
			}
		}

		animations.push(animation);

		// If there are no animations queued, manually kickstart a digest, for lack of a better word
		if (animations.length === 1) {
			this.requestAnimationFrame();
		}
	},

	cancelAnimation: function(chart) {
		var index = helpers.findIndex(this.animations, function(animation) {
			return animation.chart === chart;
		});

		if (index !== -1) {
			this.animations.splice(index, 1);
			chart.animating = false;
		}
	},

	requestAnimationFrame: function() {
		var me = this;
		if (me.request === null) {
			// Skip animation frame requests until the active one is executed.
			// This can happen when processing mouse events, e.g. 'mousemove'
			// and 'mouseout' events will trigger multiple renders.
			me.request = helpers.requestAnimFrame.call(window, function() {
				me.request = null;
				me.startDigest();
			});
		}
	},

	/**
	 * @private
	 */
	startDigest: function() {
		var me = this;
		var startTime = Date.now();
		var framesToDrop = 0;

		if (me.dropFrames > 1) {
			framesToDrop = Math.floor(me.dropFrames);
			me.dropFrames = me.dropFrames % 1;
		}

		me.advance(1 + framesToDrop);

		var endTime = Date.now();

		me.dropFrames += (endTime - startTime) / me.frameDuration;

		// Do we have more stuff to animate?
		if (me.animations.length > 0) {
			me.requestAnimationFrame();
		}
	},

	/**
	 * @private
	 */
	advance: function(count) {
		var animations = this.animations;
		var animation, chart;
		var i = 0;

		while (i < animations.length) {
			animation = animations[i];
			chart = animation.chart;

			animation.currentStep = (animation.currentStep || 0) + count;
			animation.currentStep = Math.min(animation.currentStep, animation.numSteps);

			helpers.callback(animation.render, [chart, animation], chart);
			helpers.callback(animation.onAnimationProgress, [animation], chart);

			if (animation.currentStep >= animation.numSteps) {
				helpers.callback(animation.onAnimationComplete, [animation], chart);
				chart.animating = false;
				animations.splice(i, 1);
			} else {
				++i;
			}
		}
	}
};

},{"26":26,"46":46}],24:[function(require,module,exports){
'use strict';

var Animation = require(22);
var animations = require(23);
var defaults = require(26);
var helpers = require(46);
var Interaction = require(29);
var layouts = require(31);
var platform = require(49);
var plugins = require(32);
var scaleService = require(34);
var Tooltip = require(36);

module.exports = function(Chart) {

	// Create a dictionary of chart types, to allow for extension of existing types
	Chart.types = {};

	// Store a reference to each instance - allowing us to globally resize chart instances on window resize.
	// Destroy method on the chart will remove the instance of the chart from this reference.
	Chart.instances = {};

	// Controllers available for dataset visualization eg. bar, line, slice, etc.
	Chart.controllers = {};

	/**
	 * Initializes the given config with global and chart default values.
	 */
	function initConfig(config) {
		config = config || {};

		// Do NOT use configMerge() for the data object because this method merges arrays
		// and so would change references to labels and datasets, preventing data updates.
		var data = config.data = config.data || {};
		data.datasets = data.datasets || [];
		data.labels = data.labels || [];

		config.options = helpers.configMerge(
			defaults.global,
			defaults[config.type],
			config.options || {});

		return config;
	}

	/**
	 * Updates the config of the chart
	 * @param chart {Chart} chart to update the options for
	 */
	function updateConfig(chart) {
		var newOptions = chart.options;

		helpers.each(chart.scales, function(scale) {
			layouts.removeBox(chart, scale);
		});

		newOptions = helpers.configMerge(
			Chart.defaults.global,
			Chart.defaults[chart.config.type],
			newOptions);

		chart.options = chart.config.options = newOptions;
		chart.ensureScalesHaveIDs();
		chart.buildOrUpdateScales();
		// Tooltip
		chart.tooltip._options = newOptions.tooltips;
		chart.tooltip.initialize();
	}

	function positionIsHorizontal(position) {
		return position === 'top' || position === 'bottom';
	}

	helpers.extend(Chart.prototype, /** @lends Chart */ {
		/**
		 * @private
		 */
		construct: function(item, config) {
			var me = this;

			config = initConfig(config);

			var context = platform.acquireContext(item, config);
			var canvas = context && context.canvas;
			var height = canvas && canvas.height;
			var width = canvas && canvas.width;

			me.id = helpers.uid();
			me.ctx = context;
			me.canvas = canvas;
			me.config = config;
			me.width = width;
			me.height = height;
			me.aspectRatio = height ? width / height : null;
			me.options = config.options;
			me._bufferedRender = false;

			/**
			 * Provided for backward compatibility, Chart and Chart.Controller have been merged,
			 * the "instance" still need to be defined since it might be called from plugins.
			 * @prop Chart#chart
			 * @deprecated since version 2.6.0
			 * @todo remove at version 3
			 * @private
			 */
			me.chart = me;
			me.controller = me; // chart.chart.controller #inception

			// Add the chart instance to the global namespace
			Chart.instances[me.id] = me;

			// Define alias to the config data: `chart.data === chart.config.data`
			Object.defineProperty(me, 'data', {
				get: function() {
					return me.config.data;
				},
				set: function(value) {
					me.config.data = value;
				}
			});

			if (!context || !canvas) {
				// The given item is not a compatible context2d element, let's return before finalizing
				// the chart initialization but after setting basic chart / controller properties that
				// can help to figure out that the chart is not valid (e.g chart.canvas !== null);
				// https://github.com/chartjs/Chart.js/issues/2807
				console.error("Failed to create chart: can't acquire context from the given item");
				return;
			}

			me.initialize();
			me.update();
		},

		/**
		 * @private
		 */
		initialize: function() {
			var me = this;

			// Before init plugin notification
			plugins.notify(me, 'beforeInit');

			helpers.retinaScale(me, me.options.devicePixelRatio);

			me.bindEvents();

			if (me.options.responsive) {
				// Initial resize before chart draws (must be silent to preserve initial animations).
				me.resize(true);
			}

			// Make sure scales have IDs and are built before we build any controllers.
			me.ensureScalesHaveIDs();
			me.buildOrUpdateScales();
			me.initToolTip();

			// After init plugin notification
			plugins.notify(me, 'afterInit');

			return me;
		},

		clear: function() {
			helpers.canvas.clear(this);
			return this;
		},

		stop: function() {
			// Stops any current animation loop occurring
			animations.cancelAnimation(this);
			return this;
		},

		resize: function(silent) {
			var me = this;
			var options = me.options;
			var canvas = me.canvas;
			var aspectRatio = (options.maintainAspectRatio && me.aspectRatio) || null;

			// the canvas render width and height will be casted to integers so make sure that
			// the canvas display style uses the same integer values to avoid blurring effect.

			// Set to 0 instead of canvas.size because the size defaults to 300x150 if the element is collapsed
			var newWidth = Math.max(0, Math.floor(helpers.getMaximumWidth(canvas)));
			var newHeight = Math.max(0, Math.floor(aspectRatio ? newWidth / aspectRatio : helpers.getMaximumHeight(canvas)));

			if (me.width === newWidth && me.height === newHeight) {
				return;
			}

			canvas.width = me.width = newWidth;
			canvas.height = me.height = newHeight;
			canvas.style.width = newWidth + 'px';
			canvas.style.height = newHeight + 'px';

			helpers.retinaScale(me, options.devicePixelRatio);

			if (!silent) {
				// Notify any plugins about the resize
				var newSize = {width: newWidth, height: newHeight};
				plugins.notify(me, 'resize', [newSize]);

				// Notify of resize
				if (me.options.onResize) {
					me.options.onResize(me, newSize);
				}

				me.stop();
				me.update({
					duration: me.options.responsiveAnimationDuration
				});
			}
		},

		ensureScalesHaveIDs: function() {
			var options = this.options;
			var scalesOptions = options.scales || {};
			var scaleOptions = options.scale;

			helpers.each(scalesOptions.xAxes, function(xAxisOptions, index) {
				xAxisOptions.id = xAxisOptions.id || ('x-axis-' + index);
			});

			helpers.each(scalesOptions.yAxes, function(yAxisOptions, index) {
				yAxisOptions.id = yAxisOptions.id || ('y-axis-' + index);
			});

			if (scaleOptions) {
				scaleOptions.id = scaleOptions.id || 'scale';
			}
		},

		/**
		 * Builds a map of scale ID to scale object for future lookup.
		 */
		buildOrUpdateScales: function() {
			var me = this;
			var options = me.options;
			var scales = me.scales || {};
			var items = [];
			var updated = Object.keys(scales).reduce(function(obj, id) {
				obj[id] = false;
				return obj;
			}, {});

			if (options.scales) {
				items = items.concat(
					(options.scales.xAxes || []).map(function(xAxisOptions) {
						return {options: xAxisOptions, dtype: 'category', dposition: 'bottom'};
					}),
					(options.scales.yAxes || []).map(function(yAxisOptions) {
						return {options: yAxisOptions, dtype: 'linear', dposition: 'left'};
					})
				);
			}

			if (options.scale) {
				items.push({
					options: options.scale,
					dtype: 'radialLinear',
					isDefault: true,
					dposition: 'chartArea'
				});
			}

			helpers.each(items, function(item) {
				var scaleOptions = item.options;
				var id = scaleOptions.id;
				var scaleType = helpers.valueOrDefault(scaleOptions.type, item.dtype);

				if (positionIsHorizontal(scaleOptions.position) !== positionIsHorizontal(item.dposition)) {
					scaleOptions.position = item.dposition;
				}

				updated[id] = true;
				var scale = null;
				if (id in scales && scales[id].type === scaleType) {
					scale = scales[id];
					scale.options = scaleOptions;
					scale.ctx = me.ctx;
					scale.chart = me;
				} else {
					var scaleClass = scaleService.getScaleConstructor(scaleType);
					if (!scaleClass) {
						return;
					}
					scale = new scaleClass({
						id: id,
						type: scaleType,
						options: scaleOptions,
						ctx: me.ctx,
						chart: me
					});
					scales[scale.id] = scale;
				}

				scale.mergeTicksOptions();

				// TODO(SB): I think we should be able to remove this custom case (options.scale)
				// and consider it as a regular scale part of the "scales"" map only! This would
				// make the logic easier and remove some useless? custom code.
				if (item.isDefault) {
					me.scale = scale;
				}
			});
			// clear up discarded scales
			helpers.each(updated, function(hasUpdated, id) {
				if (!hasUpdated) {
					delete scales[id];
				}
			});

			me.scales = scales;

			scaleService.addScalesToLayout(this);
		},

		buildOrUpdateControllers: function() {
			var me = this;
			var types = [];
			var newControllers = [];

			helpers.each(me.data.datasets, function(dataset, datasetIndex) {
				var meta = me.getDatasetMeta(datasetIndex);
				var type = dataset.type || me.config.type;

				if (meta.type && meta.type !== type) {
					me.destroyDatasetMeta(datasetIndex);
					meta = me.getDatasetMeta(datasetIndex);
				}
				meta.type = type;

				types.push(meta.type);

				if (meta.controller) {
					meta.controller.updateIndex(datasetIndex);
					meta.controller.linkScales();
				} else {
					var ControllerClass = Chart.controllers[meta.type];
					if (ControllerClass === undefined) {
						throw new Error('"' + meta.type + '" is not a chart type.');
					}

					meta.controller = new ControllerClass(me, datasetIndex);
					newControllers.push(meta.controller);
				}
			}, me);

			return newControllers;
		},

		/**
		 * Reset the elements of all datasets
		 * @private
		 */
		resetElements: function() {
			var me = this;
			helpers.each(me.data.datasets, function(dataset, datasetIndex) {
				me.getDatasetMeta(datasetIndex).controller.reset();
			}, me);
		},

		/**
		* Resets the chart back to it's state before the initial animation
		*/
		reset: function() {
			this.resetElements();
			this.tooltip.initialize();
		},

		update: function(config) {
			var me = this;

			if (!config || typeof config !== 'object') {
				// backwards compatibility
				config = {
					duration: config,
					lazy: arguments[1]
				};
			}

			updateConfig(me);

			// plugins options references might have change, let's invalidate the cache
			// https://github.com/chartjs/Chart.js/issues/5111#issuecomment-355934167
			plugins._invalidate(me);

			if (plugins.notify(me, 'beforeUpdate') === false) {
				return;
			}

			// In case the entire data object changed
			me.tooltip._data = me.data;

			// Make sure dataset controllers are updated and new controllers are reset
			var newControllers = me.buildOrUpdateControllers();

			// Make sure all dataset controllers have correct meta data counts
			helpers.each(me.data.datasets, function(dataset, datasetIndex) {
				me.getDatasetMeta(datasetIndex).controller.buildOrUpdateElements();
			}, me);

			me.updateLayout();

			// Can only reset the new controllers after the scales have been updated
			if (me.options.animation && me.options.animation.duration) {
				helpers.each(newControllers, function(controller) {
					controller.reset();
				});
			}

			me.updateDatasets();

			// Need to reset tooltip in case it is displayed with elements that are removed
			// after update.
			me.tooltip.initialize();

			// Last active contains items that were previously in the tooltip.
			// When we reset the tooltip, we need to clear it
			me.lastActive = [];

			// Do this before render so that any plugins that need final scale updates can use it
			plugins.notify(me, 'afterUpdate');

			if (me._bufferedRender) {
				me._bufferedRequest = {
					duration: config.duration,
					easing: config.easing,
					lazy: config.lazy
				};
			} else {
				me.render(config);
			}
		},

		/**
		 * Updates the chart layout unless a plugin returns `false` to the `beforeLayout`
		 * hook, in which case, plugins will not be called on `afterLayout`.
		 * @private
		 */
		updateLayout: function() {
			var me = this;

			if (plugins.notify(me, 'beforeLayout') === false) {
				return;
			}

			layouts.update(this, this.width, this.height);

			/**
			 * Provided for backward compatibility, use `afterLayout` instead.
			 * @method IPlugin#afterScaleUpdate
			 * @deprecated since version 2.5.0
			 * @todo remove at version 3
			 * @private
			 */
			plugins.notify(me, 'afterScaleUpdate');
			plugins.notify(me, 'afterLayout');
		},

		/**
		 * Updates all datasets unless a plugin returns `false` to the `beforeDatasetsUpdate`
		 * hook, in which case, plugins will not be called on `afterDatasetsUpdate`.
		 * @private
		 */
		updateDatasets: function() {
			var me = this;

			if (plugins.notify(me, 'beforeDatasetsUpdate') === false) {
				return;
			}

			for (var i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
				me.updateDataset(i);
			}

			plugins.notify(me, 'afterDatasetsUpdate');
		},

		/**
		 * Updates dataset at index unless a plugin returns `false` to the `beforeDatasetUpdate`
		 * hook, in which case, plugins will not be called on `afterDatasetUpdate`.
		 * @private
		 */
		updateDataset: function(index) {
			var me = this;
			var meta = me.getDatasetMeta(index);
			var args = {
				meta: meta,
				index: index
			};

			if (plugins.notify(me, 'beforeDatasetUpdate', [args]) === false) {
				return;
			}

			meta.controller.update();

			plugins.notify(me, 'afterDatasetUpdate', [args]);
		},

		render: function(config) {
			var me = this;

			if (!config || typeof config !== 'object') {
				// backwards compatibility
				config = {
					duration: config,
					lazy: arguments[1]
				};
			}

			var duration = config.duration;
			var lazy = config.lazy;

			if (plugins.notify(me, 'beforeRender') === false) {
				return;
			}

			var animationOptions = me.options.animation;
			var onComplete = function(animation) {
				plugins.notify(me, 'afterRender');
				helpers.callback(animationOptions && animationOptions.onComplete, [animation], me);
			};

			if (animationOptions && ((typeof duration !== 'undefined' && duration !== 0) || (typeof duration === 'undefined' && animationOptions.duration !== 0))) {
				var animation = new Animation({
					numSteps: (duration || animationOptions.duration) / 16.66, // 60 fps
					easing: config.easing || animationOptions.easing,

					render: function(chart, animationObject) {
						var easingFunction = helpers.easing.effects[animationObject.easing];
						var currentStep = animationObject.currentStep;
						var stepDecimal = currentStep / animationObject.numSteps;

						chart.draw(easingFunction(stepDecimal), stepDecimal, currentStep);
					},

					onAnimationProgress: animationOptions.onProgress,
					onAnimationComplete: onComplete
				});

				animations.addAnimation(me, animation, duration, lazy);
			} else {
				me.draw();

				// See https://github.com/chartjs/Chart.js/issues/3781
				onComplete(new Animation({numSteps: 0, chart: me}));
			}

			return me;
		},

		draw: function(easingValue) {
			var me = this;

			me.clear();

			if (helpers.isNullOrUndef(easingValue)) {
				easingValue = 1;
			}

			me.transition(easingValue);

			if (me.width <= 0 || me.height <= 0) {
				return;
			}

			if (plugins.notify(me, 'beforeDraw', [easingValue]) === false) {
				return;
			}

			// Draw all the scales
			helpers.each(me.boxes, function(box) {
				box.draw(me.chartArea);
			}, me);

			if (me.scale) {
				me.scale.draw();
			}

			me.drawDatasets(easingValue);
			me._drawTooltip(easingValue);

			plugins.notify(me, 'afterDraw', [easingValue]);
		},

		/**
		 * @private
		 */
		transition: function(easingValue) {
			var me = this;

			for (var i = 0, ilen = (me.data.datasets || []).length; i < ilen; ++i) {
				if (me.isDatasetVisible(i)) {
					me.getDatasetMeta(i).controller.transition(easingValue);
				}
			}

			me.tooltip.transition(easingValue);
		},

		/**
		 * Draws all datasets unless a plugin returns `false` to the `beforeDatasetsDraw`
		 * hook, in which case, plugins will not be called on `afterDatasetsDraw`.
		 * @private
		 */
		drawDatasets: function(easingValue) {
			var me = this;

			if (plugins.notify(me, 'beforeDatasetsDraw', [easingValue]) === false) {
				return;
			}

			// Draw datasets reversed to support proper line stacking
			for (var i = (me.data.datasets || []).length - 1; i >= 0; --i) {
				if (me.isDatasetVisible(i)) {
					me.drawDataset(i, easingValue);
				}
			}

			plugins.notify(me, 'afterDatasetsDraw', [easingValue]);
		},

		/**
		 * Draws dataset at index unless a plugin returns `false` to the `beforeDatasetDraw`
		 * hook, in which case, plugins will not be called on `afterDatasetDraw`.
		 * @private
		 */
		drawDataset: function(index, easingValue) {
			var me = this;
			var meta = me.getDatasetMeta(index);
			var args = {
				meta: meta,
				index: index,
				easingValue: easingValue
			};

			if (plugins.notify(me, 'beforeDatasetDraw', [args]) === false) {
				return;
			}

			meta.controller.draw(easingValue);

			plugins.notify(me, 'afterDatasetDraw', [args]);
		},

		/**
		 * Draws tooltip unless a plugin returns `false` to the `beforeTooltipDraw`
		 * hook, in which case, plugins will not be called on `afterTooltipDraw`.
		 * @private
		 */
		_drawTooltip: function(easingValue) {
			var me = this;
			var tooltip = me.tooltip;
			var args = {
				tooltip: tooltip,
				easingValue: easingValue
			};

			if (plugins.notify(me, 'beforeTooltipDraw', [args]) === false) {
				return;
			}

			tooltip.draw();

			plugins.notify(me, 'afterTooltipDraw', [args]);
		},

		// Get the single element that was clicked on
		// @return : An object containing the dataset index and element index of the matching element. Also contains the rectangle that was draw
		getElementAtEvent: function(e) {
			return Interaction.modes.single(this, e);
		},

		getElementsAtEvent: function(e) {
			return Interaction.modes.label(this, e, {intersect: true});
		},

		getElementsAtXAxis: function(e) {
			return Interaction.modes['x-axis'](this, e, {intersect: true});
		},

		getElementsAtEventForMode: function(e, mode, options) {
			var method = Interaction.modes[mode];
			if (typeof method === 'function') {
				return method(this, e, options);
			}

			return [];
		},

		getDatasetAtEvent: function(e) {
			return Interaction.modes.dataset(this, e, {intersect: true});
		},

		getDatasetMeta: function(datasetIndex) {
			var me = this;
			var dataset = me.data.datasets[datasetIndex];
			if (!dataset._meta) {
				dataset._meta = {};
			}

			var meta = dataset._meta[me.id];
			if (!meta) {
				meta = dataset._meta[me.id] = {
					type: null,
					data: [],
					dataset: null,
					controller: null,
					hidden: null,			// See isDatasetVisible() comment
					xAxisID: null,
					yAxisID: null
				};
			}

			return meta;
		},

		getVisibleDatasetCount: function() {
			var count = 0;
			for (var i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
				if (this.isDatasetVisible(i)) {
					count++;
				}
			}
			return count;
		},

		isDatasetVisible: function(datasetIndex) {
			var meta = this.getDatasetMeta(datasetIndex);

			// meta.hidden is a per chart dataset hidden flag override with 3 states: if true or false,
			// the dataset.hidden value is ignored, else if null, the dataset hidden state is returned.
			return typeof meta.hidden === 'boolean' ? !meta.hidden : !this.data.datasets[datasetIndex].hidden;
		},

		generateLegend: function() {
			return this.options.legendCallback(this);
		},

		/**
		 * @private
		 */
		destroyDatasetMeta: function(datasetIndex) {
			var id = this.id;
			var dataset = this.data.datasets[datasetIndex];
			var meta = dataset._meta && dataset._meta[id];

			if (meta) {
				meta.controller.destroy();
				delete dataset._meta[id];
			}
		},

		destroy: function() {
			var me = this;
			var canvas = me.canvas;
			var i, ilen;

			me.stop();

			// dataset controllers need to cleanup associated data
			for (i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
				me.destroyDatasetMeta(i);
			}

			if (canvas) {
				me.unbindEvents();
				helpers.canvas.clear(me);
				platform.releaseContext(me.ctx);
				me.canvas = null;
				me.ctx = null;
			}

			plugins.notify(me, 'destroy');

			delete Chart.instances[me.id];
		},

		toBase64Image: function() {
			return this.canvas.toDataURL.apply(this.canvas, arguments);
		},

		initToolTip: function() {
			var me = this;
			me.tooltip = new Tooltip({
				_chart: me,
				_chartInstance: me, // deprecated, backward compatibility
				_data: me.data,
				_options: me.options.tooltips
			}, me);
		},

		/**
		 * @private
		 */
		bindEvents: function() {
			var me = this;
			var listeners = me._listeners = {};
			var listener = function() {
				me.eventHandler.apply(me, arguments);
			};

			helpers.each(me.options.events, function(type) {
				platform.addEventListener(me, type, listener);
				listeners[type] = listener;
			});

			// Elements used to detect size change should not be injected for non responsive charts.
			// See https://github.com/chartjs/Chart.js/issues/2210
			if (me.options.responsive) {
				listener = function() {
					me.resize();
				};

				platform.addEventListener(me, 'resize', listener);
				listeners.resize = listener;
			}
		},

		/**
		 * @private
		 */
		unbindEvents: function() {
			var me = this;
			var listeners = me._listeners;
			if (!listeners) {
				return;
			}

			delete me._listeners;
			helpers.each(listeners, function(listener, type) {
				platform.removeEventListener(me, type, listener);
			});
		},

		updateHoverStyle: function(elements, mode, enabled) {
			var method = enabled ? 'setHoverStyle' : 'removeHoverStyle';
			var element, i, ilen;

			for (i = 0, ilen = elements.length; i < ilen; ++i) {
				element = elements[i];
				if (element) {
					this.getDatasetMeta(element._datasetIndex).controller[method](element);
				}
			}
		},

		/**
		 * @private
		 */
		eventHandler: function(e) {
			var me = this;
			var tooltip = me.tooltip;

			if (plugins.notify(me, 'beforeEvent', [e]) === false) {
				return;
			}

			// Buffer any update calls so that renders do not occur
			me._bufferedRender = true;
			me._bufferedRequest = null;

			var changed = me.handleEvent(e);
			// for smooth tooltip animations issue #4989
			// the tooltip should be the source of change
			// Animation check workaround:
			// tooltip._start will be null when tooltip isn't animating
			if (tooltip) {
				changed = tooltip._start
					? tooltip.handleEvent(e)
					: changed | tooltip.handleEvent(e);
			}

			plugins.notify(me, 'afterEvent', [e]);

			var bufferedRequest = me._bufferedRequest;
			if (bufferedRequest) {
				// If we have an update that was triggered, we need to do a normal render
				me.render(bufferedRequest);
			} else if (changed && !me.animating) {
				// If entering, leaving, or changing elements, animate the change via pivot
				me.stop();

				// We only need to render at this point. Updating will cause scales to be
				// recomputed generating flicker & using more memory than necessary.
				me.render({
					duration: me.options.hover.animationDuration,
					lazy: true
				});
			}

			me._bufferedRender = false;
			me._bufferedRequest = null;

			return me;
		},

		/**
		 * Handle an event
		 * @private
		 * @param {IEvent} event the event to handle
		 * @return {Boolean} true if the chart needs to re-render
		 */
		handleEvent: function(e) {
			var me = this;
			var options = me.options || {};
			var hoverOptions = options.hover;
			var changed = false;

			me.lastActive = me.lastActive || [];

			// Find Active Elements for hover and tooltips
			if (e.type === 'mouseout') {
				me.active = [];
			} else {
				me.active = me.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions);
			}

			// Invoke onHover hook
			// Need to call with native event here to not break backwards compatibility
			helpers.callback(options.onHover || options.hover.onHover, [e.native, me.active], me);

			if (e.type === 'mouseup' || e.type === 'click') {
				if (options.onClick) {
					// Use e.native here for backwards compatibility
					options.onClick.call(me, e.native, me.active);
				}
			}

			// Remove styling for last active (even if it may still be active)
			if (me.lastActive.length) {
				me.updateHoverStyle(me.lastActive, hoverOptions.mode, false);
			}

			// Built in hover styling
			if (me.active.length && hoverOptions.mode) {
				me.updateHoverStyle(me.active, hoverOptions.mode, true);
			}

			changed = !helpers.arrayEquals(me.active, me.lastActive);

			// Remember Last Actives
			me.lastActive = me.active;

			return changed;
		}
	});

	/**
	 * Provided for backward compatibility, use Chart instead.
	 * @class Chart.Controller
	 * @deprecated since version 2.6.0
	 * @todo remove at version 3
	 * @private
	 */
	Chart.Controller = Chart;
};

},{"22":22,"23":23,"26":26,"29":29,"31":31,"32":32,"34":34,"36":36,"46":46,"49":49}],25:[function(require,module,exports){
'use strict';

var helpers = require(46);

module.exports = function(Chart) {

	var arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'];

	/**
	 * Hooks the array methods that add or remove values ('push', pop', 'shift', 'splice',
	 * 'unshift') and notify the listener AFTER the array has been altered. Listeners are
	 * called on the 'onData*' callbacks (e.g. onDataPush, etc.) with same arguments.
	 */
	function listenArrayEvents(array, listener) {
		if (array._chartjs) {
			array._chartjs.listeners.push(listener);
			return;
		}

		Object.defineProperty(array, '_chartjs', {
			configurable: true,
			enumerable: false,
			value: {
				listeners: [listener]
			}
		});

		arrayEvents.forEach(function(key) {
			var method = 'onData' + key.charAt(0).toUpperCase() + key.slice(1);
			var base = array[key];

			Object.defineProperty(array, key, {
				configurable: true,
				enumerable: false,
				value: function() {
					var args = Array.prototype.slice.call(arguments);
					var res = base.apply(this, args);

					helpers.each(array._chartjs.listeners, function(object) {
						if (typeof object[method] === 'function') {
							object[method].apply(object, args);
						}
					});

					return res;
				}
			});
		});
	}

	/**
	 * Removes the given array event listener and cleanup extra attached properties (such as
	 * the _chartjs stub and overridden methods) if array doesn't have any more listeners.
	 */
	function unlistenArrayEvents(array, listener) {
		var stub = array._chartjs;
		if (!stub) {
			return;
		}

		var listeners = stub.listeners;
		var index = listeners.indexOf(listener);
		if (index !== -1) {
			listeners.splice(index, 1);
		}

		if (listeners.length > 0) {
			return;
		}

		arrayEvents.forEach(function(key) {
			delete array[key];
		});

		delete array._chartjs;
	}

	// Base class for all dataset controllers (line, bar, etc)
	Chart.DatasetController = function(chart, datasetIndex) {
		this.initialize(chart, datasetIndex);
	};

	helpers.extend(Chart.DatasetController.prototype, {

		/**
		 * Element type used to generate a meta dataset (e.g. Chart.element.Line).
		 * @type {Chart.core.element}
		 */
		datasetElementType: null,

		/**
		 * Element type used to generate a meta data (e.g. Chart.element.Point).
		 * @type {Chart.core.element}
		 */
		dataElementType: null,

		initialize: function(chart, datasetIndex) {
			var me = this;
			me.chart = chart;
			me.index = datasetIndex;
			me.linkScales();
			me.addElements();
		},

		updateIndex: function(datasetIndex) {
			this.index = datasetIndex;
		},

		linkScales: function() {
			var me = this;
			var meta = me.getMeta();
			var dataset = me.getDataset();

			if (meta.xAxisID === null || !(meta.xAxisID in me.chart.scales)) {
				meta.xAxisID = dataset.xAxisID || me.chart.options.scales.xAxes[0].id;
			}
			if (meta.yAxisID === null || !(meta.yAxisID in me.chart.scales)) {
				meta.yAxisID = dataset.yAxisID || me.chart.options.scales.yAxes[0].id;
			}
		},

		getDataset: function() {
			return this.chart.data.datasets[this.index];
		},

		getMeta: function() {
			return this.chart.getDatasetMeta(this.index);
		},

		getScaleForId: function(scaleID) {
			return this.chart.scales[scaleID];
		},

		reset: function() {
			this.update(true);
		},

		/**
		 * @private
		 */
		destroy: function() {
			if (this._data) {
				unlistenArrayEvents(this._data, this);
			}
		},

		createMetaDataset: function() {
			var me = this;
			var type = me.datasetElementType;
			return type && new type({
				_chart: me.chart,
				_datasetIndex: me.index
			});
		},

		createMetaData: function(index) {
			var me = this;
			var type = me.dataElementType;
			return type && new type({
				_chart: me.chart,
				_datasetIndex: me.index,
				_index: index
			});
		},

		addElements: function() {
			var me = this;
			var meta = me.getMeta();
			var data = me.getDataset().data || [];
			var metaData = meta.data;
			var i, ilen;

			for (i = 0, ilen = data.length; i < ilen; ++i) {
				metaData[i] = metaData[i] || me.createMetaData(i);
			}

			meta.dataset = meta.dataset || me.createMetaDataset();
		},

		addElementAndReset: function(index) {
			var element = this.createMetaData(index);
			this.getMeta().data.splice(index, 0, element);
			this.updateElement(element, index, true);
		},

		buildOrUpdateElements: function() {
			var me = this;
			var dataset = me.getDataset();
			var data = dataset.data || (dataset.data = []);

			// In order to correctly handle data addition/deletion animation (an thus simulate
			// real-time charts), we need to monitor these data modifications and synchronize
			// the internal meta data accordingly.
			if (me._data !== data) {
				if (me._data) {
					// This case happens when the user replaced the data array instance.
					unlistenArrayEvents(me._data, me);
				}

				listenArrayEvents(data, me);
				me._data = data;
			}

			// Re-sync meta data in case the user replaced the data array or if we missed
			// any updates and so make sure that we handle number of datapoints changing.
			me.resyncElements();
		},

		update: helpers.noop,

		transition: function(easingValue) {
			var meta = this.getMeta();
			var elements = meta.data || [];
			var ilen = elements.length;
			var i = 0;

			for (; i < ilen; ++i) {
				elements[i].transition(easingValue);
			}

			if (meta.dataset) {
				meta.dataset.transition(easingValue);
			}
		},

		draw: function() {
			var meta = this.getMeta();
			var elements = meta.data || [];
			var ilen = elements.length;
			var i = 0;

			if (meta.dataset) {
				meta.dataset.draw();
			}

			for (; i < ilen; ++i) {
				elements[i].draw();
			}
		},

		removeHoverStyle: function(element) {
			helpers.merge(element._model, element.$previousStyle || {});
			delete element.$previousStyle;
		},

		setHoverStyle: function(element) {
			var dataset = this.chart.data.datasets[element._datasetIndex];
			var index = element._index;
			var custom = element.custom || {};
			var valueOrDefault = helpers.valueAtIndexOrDefault;
			var getHoverColor = helpers.getHoverColor;
			var model = element._model;

			element.$previousStyle = {
				backgroundColor: model.backgroundColor,
				borderColor: model.borderColor,
				borderWidth: model.borderWidth
			};

			model.backgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor : valueOrDefault(dataset.hoverBackgroundColor, index, getHoverColor(model.backgroundColor));
			model.borderColor = custom.hoverBorderColor ? custom.hoverBorderColor : valueOrDefault(dataset.hoverBorderColor, index, getHoverColor(model.borderColor));
			model.borderWidth = custom.hoverBorderWidth ? custom.hoverBorderWidth : valueOrDefault(dataset.hoverBorderWidth, index, model.borderWidth);
		},

		/**
		 * @private
		 */
		resyncElements: function() {
			var me = this;
			var meta = me.getMeta();
			var data = me.getDataset().data;
			var numMeta = meta.data.length;
			var numData = data.length;

			if (numData < numMeta) {
				meta.data.splice(numData, numMeta - numData);
			} else if (numData > numMeta) {
				me.insertElements(numMeta, numData - numMeta);
			}
		},

		/**
		 * @private
		 */
		insertElements: function(start, count) {
			for (var i = 0; i < count; ++i) {
				this.addElementAndReset(start + i);
			}
		},

		/**
		 * @private
		 */
		onDataPush: function() {
			this.insertElements(this.getDataset().data.length - 1, arguments.length);
		},

		/**
		 * @private
		 */
		onDataPop: function() {
			this.getMeta().data.pop();
		},

		/**
		 * @private
		 */
		onDataShift: function() {
			this.getMeta().data.shift();
		},

		/**
		 * @private
		 */
		onDataSplice: function(start, count) {
			this.getMeta().data.splice(start, count);
			this.insertElements(start, arguments.length - 2);
		},

		/**
		 * @private
		 */
		onDataUnshift: function() {
			this.insertElements(0, arguments.length);
		}
	});

	Chart.DatasetController.extend = helpers.inherits;
};

},{"46":46}],26:[function(require,module,exports){
'use strict';

var helpers = require(46);

module.exports = {
	/**
	 * @private
	 */
	_set: function(scope, values) {
		return helpers.merge(this[scope] || (this[scope] = {}), values);
	}
};

},{"46":46}],27:[function(require,module,exports){
'use strict';

var color = require(3);
var helpers = require(46);

function interpolate(start, view, model, ease) {
	var keys = Object.keys(model);
	var i, ilen, key, actual, origin, target, type, c0, c1;

	for (i = 0, ilen = keys.length; i < ilen; ++i) {
		key = keys[i];

		target = model[key];

		// if a value is added to the model after pivot() has been called, the view
		// doesn't contain it, so let's initialize the view to the target value.
		if (!view.hasOwnProperty(key)) {
			view[key] = target;
		}

		actual = view[key];

		if (actual === target || key[0] === '_') {
			continue;
		}

		if (!start.hasOwnProperty(key)) {
			start[key] = actual;
		}

		origin = start[key];

		type = typeof target;

		if (type === typeof origin) {
			if (type === 'string') {
				c0 = color(origin);
				if (c0.valid) {
					c1 = color(target);
					if (c1.valid) {
						view[key] = c1.mix(c0, ease).rgbString();
						continue;
					}
				}
			} else if (type === 'number' && isFinite(origin) && isFinite(target)) {
				view[key] = origin + (target - origin) * ease;
				continue;
			}
		}

		view[key] = target;
	}
}

var Element = function(configuration) {
	helpers.extend(this, configuration);
	this.initialize.apply(this, arguments);
};

helpers.extend(Element.prototype, {

	initialize: function() {
		this.hidden = false;
	},

	pivot: function() {
		var me = this;
		if (!me._view) {
			me._view = helpers.clone(me._model);
		}
		me._start = {};
		return me;
	},

	transition: function(ease) {
		var me = this;
		var model = me._model;
		var start = me._start;
		var view = me._view;

		// No animation -> No Transition
		if (!model || ease === 1) {
			me._view = model;
			me._start = null;
			return me;
		}

		if (!view) {
			view = me._view = {};
		}

		if (!start) {
			start = me._start = {};
		}

		interpolate(start, view, model, ease);

		return me;
	},

	tooltipPosition: function() {
		return {
			x: this._model.x,
			y: this._model.y
		};
	},

	hasValue: function() {
		return helpers.isNumber(this._model.x) && helpers.isNumber(this._model.y);
	}
});

Element.extend = helpers.inherits;

module.exports = Element;

},{"3":3,"46":46}],28:[function(require,module,exports){
/* global window: false */
/* global document: false */
'use strict';

var color = require(3);
var defaults = require(26);
var helpers = require(46);
var scaleService = require(34);

module.exports = function() {

	// -- Basic js utility methods

	helpers.configMerge = function(/* objects ... */) {
		return helpers.merge(helpers.clone(arguments[0]), [].slice.call(arguments, 1), {
			merger: function(key, target, source, options) {
				var tval = target[key] || {};
				var sval = source[key];

				if (key === 'scales') {
					// scale config merging is complex. Add our own function here for that
					target[key] = helpers.scaleMerge(tval, sval);
				} else if (key === 'scale') {
					// used in polar area & radar charts since there is only one scale
					target[key] = helpers.merge(tval, [scaleService.getScaleDefaults(sval.type), sval]);
				} else {
					helpers._merger(key, target, source, options);
				}
			}
		});
	};

	helpers.scaleMerge = function(/* objects ... */) {
		return helpers.merge(helpers.clone(arguments[0]), [].slice.call(arguments, 1), {
			merger: function(key, target, source, options) {
				if (key === 'xAxes' || key === 'yAxes') {
					var slen = source[key].length;
					var i, type, scale;

					if (!target[key]) {
						target[key] = [];
					}

					for (i = 0; i < slen; ++i) {
						scale = source[key][i];
						type = helpers.valueOrDefault(scale.type, key === 'xAxes' ? 'category' : 'linear');

						if (i >= target[key].length) {
							target[key].push({});
						}

						if (!target[key][i].type || (scale.type && scale.type !== target[key][i].type)) {
							// new/untyped scale or type changed: let's apply the new defaults
							// then merge source scale to correctly overwrite the defaults.
							helpers.merge(target[key][i], [scaleService.getScaleDefaults(type), scale]);
						} else {
							// scales type are the same
							helpers.merge(target[key][i], scale);
						}
					}
				} else {
					helpers._merger(key, target, source, options);
				}
			}
		});
	};

	helpers.where = function(collection, filterCallback) {
		if (helpers.isArray(collection) && Array.prototype.filter) {
			return collection.filter(filterCallback);
		}
		var filtered = [];

		helpers.each(collection, function(item) {
			if (filterCallback(item)) {
				filtered.push(item);
			}
		});

		return filtered;
	};
	helpers.findIndex = Array.prototype.findIndex ?
		function(array, callback, scope) {
			return array.findIndex(callback, scope);
		} :
		function(array, callback, scope) {
			scope = scope === undefined ? array : scope;
			for (var i = 0, ilen = array.length; i < ilen; ++i) {
				if (callback.call(scope, array[i], i, array)) {
					return i;
				}
			}
			return -1;
		};
	helpers.findNextWhere = function(arrayToSearch, filterCallback, startIndex) {
		// Default to start of the array
		if (helpers.isNullOrUndef(startIndex)) {
			startIndex = -1;
		}
		for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
			var currentItem = arrayToSearch[i];
			if (filterCallback(currentItem)) {
				return currentItem;
			}
		}
	};
	helpers.findPreviousWhere = function(arrayToSearch, filterCallback, startIndex) {
		// Default to end of the array
		if (helpers.isNullOrUndef(startIndex)) {
			startIndex = arrayToSearch.length;
		}
		for (var i = startIndex - 1; i >= 0; i--) {
			var currentItem = arrayToSearch[i];
			if (filterCallback(currentItem)) {
				return currentItem;
			}
		}
	};

	// -- Math methods
	helpers.isNumber = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};
	helpers.almostEquals = function(x, y, epsilon) {
		return Math.abs(x - y) < epsilon;
	};
	helpers.almostWhole = function(x, epsilon) {
		var rounded = Math.round(x);
		return (((rounded - epsilon) < x) && ((rounded + epsilon) > x));
	};
	helpers.max = function(array) {
		return array.reduce(function(max, value) {
			if (!isNaN(value)) {
				return Math.max(max, value);
			}
			return max;
		}, Number.NEGATIVE_INFINITY);
	};
	helpers.min = function(array) {
		return array.reduce(function(min, value) {
			if (!isNaN(value)) {
				return Math.min(min, value);
			}
			return min;
		}, Number.POSITIVE_INFINITY);
	};
	helpers.sign = Math.sign ?
		function(x) {
			return Math.sign(x);
		} :
		function(x) {
			x = +x; // convert to a number
			if (x === 0 || isNaN(x)) {
				return x;
			}
			return x > 0 ? 1 : -1;
		};
	helpers.log10 = Math.log10 ?
		function(x) {
			return Math.log10(x);
		} :
		function(x) {
			var exponent = Math.log(x) * Math.LOG10E; // Math.LOG10E = 1 / Math.LN10.
			// Check for whole powers of 10,
			// which due to floating point rounding error should be corrected.
			var powerOf10 = Math.round(exponent);
			var isPowerOf10 = x === Math.pow(10, powerOf10);

			return isPowerOf10 ? powerOf10 : exponent;
		};
	helpers.toRadians = function(degrees) {
		return degrees * (Math.PI / 180);
	};
	helpers.toDegrees = function(radians) {
		return radians * (180 / Math.PI);
	};
	// Gets the angle from vertical upright to the point about a centre.
	helpers.getAngleFromPoint = function(centrePoint, anglePoint) {
		var distanceFromXCenter = anglePoint.x - centrePoint.x;
		var distanceFromYCenter = anglePoint.y - centrePoint.y;
		var radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);

		var angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);

		if (angle < (-0.5 * Math.PI)) {
			angle += 2.0 * Math.PI; // make sure the returned angle is in the range of (-PI/2, 3PI/2]
		}

		return {
			angle: angle,
			distance: radialDistanceFromCenter
		};
	};
	helpers.distanceBetweenPoints = function(pt1, pt2) {
		return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
	};
	helpers.aliasPixel = function(pixelWidth) {
		return (pixelWidth % 2 === 0) ? 0 : 0.5;
	};
	helpers.splineCurve = function(firstPoint, middlePoint, afterPoint, t) {
		// Props to Rob Spencer at scaled innovation for his post on splining between points
		// http://scaledinnovation.com/analytics/splines/aboutSplines.html

		// This function must also respect "skipped" points

		var previous = firstPoint.skip ? middlePoint : firstPoint;
		var current = middlePoint;
		var next = afterPoint.skip ? middlePoint : afterPoint;

		var d01 = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
		var d12 = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));

		var s01 = d01 / (d01 + d12);
		var s12 = d12 / (d01 + d12);

		// If all points are the same, s01 & s02 will be inf
		s01 = isNaN(s01) ? 0 : s01;
		s12 = isNaN(s12) ? 0 : s12;

		var fa = t * s01; // scaling factor for triangle Ta
		var fb = t * s12;

		return {
			previous: {
				x: current.x - fa * (next.x - previous.x),
				y: current.y - fa * (next.y - previous.y)
			},
			next: {
				x: current.x + fb * (next.x - previous.x),
				y: current.y + fb * (next.y - previous.y)
			}
		};
	};
	helpers.EPSILON = Number.EPSILON || 1e-14;
	helpers.splineCurveMonotone = function(points) {
		// This function calculates Bézier control points in a similar way than |splineCurve|,
		// but preserves monotonicity of the provided data and ensures no local extremums are added
		// between the dataset discrete points due to the interpolation.
		// See : https://en.wikipedia.org/wiki/Monotone_cubic_interpolation

		var pointsWithTangents = (points || []).map(function(point) {
			return {
				model: point._model,
				deltaK: 0,
				mK: 0
			};
		});

		// Calculate slopes (deltaK) and initialize tangents (mK)
		var pointsLen = pointsWithTangents.length;
		var i, pointBefore, pointCurrent, pointAfter;
		for (i = 0; i < pointsLen; ++i) {
			pointCurrent = pointsWithTangents[i];
			if (pointCurrent.model.skip) {
				continue;
			}

			pointBefore = i > 0 ? pointsWithTangents[i - 1] : null;
			pointAfter = i < pointsLen - 1 ? pointsWithTangents[i + 1] : null;
			if (pointAfter && !pointAfter.model.skip) {
				var slopeDeltaX = (pointAfter.model.x - pointCurrent.model.x);

				// In the case of two points that appear at the same x pixel, slopeDeltaX is 0
				pointCurrent.deltaK = slopeDeltaX !== 0 ? (pointAfter.model.y - pointCurrent.model.y) / slopeDeltaX : 0;
			}

			if (!pointBefore || pointBefore.model.skip) {
				pointCurrent.mK = pointCurrent.deltaK;
			} else if (!pointAfter || pointAfter.model.skip) {
				pointCurrent.mK = pointBefore.deltaK;
			} else if (this.sign(pointBefore.deltaK) !== this.sign(pointCurrent.deltaK)) {
				pointCurrent.mK = 0;
			} else {
				pointCurrent.mK = (pointBefore.deltaK + pointCurrent.deltaK) / 2;
			}
		}

		// Adjust tangents to ensure monotonic properties
		var alphaK, betaK, tauK, squaredMagnitude;
		for (i = 0; i < pointsLen - 1; ++i) {
			pointCurrent = pointsWithTangents[i];
			pointAfter = pointsWithTangents[i + 1];
			if (pointCurrent.model.skip || pointAfter.model.skip) {
				continue;
			}

			if (helpers.almostEquals(pointCurrent.deltaK, 0, this.EPSILON)) {
				pointCurrent.mK = pointAfter.mK = 0;
				continue;
			}

			alphaK = pointCurrent.mK / pointCurrent.deltaK;
			betaK = pointAfter.mK / pointCurrent.deltaK;
			squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
			if (squaredMagnitude <= 9) {
				continue;
			}

			tauK = 3 / Math.sqrt(squaredMagnitude);
			pointCurrent.mK = alphaK * tauK * pointCurrent.deltaK;
			pointAfter.mK = betaK * tauK * pointCurrent.deltaK;
		}

		// Compute control points
		var deltaX;
		for (i = 0; i < pointsLen; ++i) {
			pointCurrent = pointsWithTangents[i];
			if (pointCurrent.model.skip) {
				continue;
			}

			pointBefore = i > 0 ? pointsWithTangents[i - 1] : null;
			pointAfter = i < pointsLen - 1 ? pointsWithTangents[i + 1] : null;
			if (pointBefore && !pointBefore.model.skip) {
				deltaX = (pointCurrent.model.x - pointBefore.model.x) / 3;
				pointCurrent.model.controlPointPreviousX = pointCurrent.model.x - deltaX;
				pointCurrent.model.controlPointPreviousY = pointCurrent.model.y - deltaX * pointCurrent.mK;
			}
			if (pointAfter && !pointAfter.model.skip) {
				deltaX = (pointAfter.model.x - pointCurrent.model.x) / 3;
				pointCurrent.model.controlPointNextX = pointCurrent.model.x + deltaX;
				pointCurrent.model.controlPointNextY = pointCurrent.model.y + deltaX * pointCurrent.mK;
			}
		}
	};
	helpers.nextItem = function(collection, index, loop) {
		if (loop) {
			return index >= collection.length - 1 ? collection[0] : collection[index + 1];
		}
		return index >= collection.length - 1 ? collection[collection.length - 1] : collection[index + 1];
	};
	helpers.previousItem = function(collection, index, loop) {
		if (loop) {
			return index <= 0 ? collection[collection.length - 1] : collection[index - 1];
		}
		return index <= 0 ? collection[0] : collection[index - 1];
	};
	// Implementation of the nice number algorithm used in determining where axis labels will go
	helpers.niceNum = function(range, round) {
		var exponent = Math.floor(helpers.log10(range));
		var fraction = range / Math.pow(10, exponent);
		var niceFraction;

		if (round) {
			if (fraction < 1.5) {
				niceFraction = 1;
			} else if (fraction < 3) {
				niceFraction = 2;
			} else if (fraction < 7) {
				niceFraction = 5;
			} else {
				niceFraction = 10;
			}
		} else if (fraction <= 1.0) {
			niceFraction = 1;
		} else if (fraction <= 2) {
			niceFraction = 2;
		} else if (fraction <= 5) {
			niceFraction = 5;
		} else {
			niceFraction = 10;
		}

		return niceFraction * Math.pow(10, exponent);
	};
	// Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
	helpers.requestAnimFrame = (function() {
		if (typeof window === 'undefined') {
			return function(callback) {
				callback();
			};
		}
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) {
				return window.setTimeout(callback, 1000 / 60);
			};
	}());
	// -- DOM methods
	helpers.getRelativePosition = function(evt, chart) {
		var mouseX, mouseY;
		var e = evt.originalEvent || evt;
		var canvas = evt.target || evt.srcElement;
		var boundingRect = canvas.getBoundingClientRect();

		var touches = e.touches;
		if (touches && touches.length > 0) {
			mouseX = touches[0].clientX;
			mouseY = touches[0].clientY;

		} else {
			mouseX = e.clientX;
			mouseY = e.clientY;
		}

		// Scale mouse coordinates into canvas coordinates
		// by following the pattern laid out by 'jerryj' in the comments of
		// http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
		var paddingLeft = parseFloat(helpers.getStyle(canvas, 'padding-left'));
		var paddingTop = parseFloat(helpers.getStyle(canvas, 'padding-top'));
		var paddingRight = parseFloat(helpers.getStyle(canvas, 'padding-right'));
		var paddingBottom = parseFloat(helpers.getStyle(canvas, 'padding-bottom'));
		var width = boundingRect.right - boundingRect.left - paddingLeft - paddingRight;
		var height = boundingRect.bottom - boundingRect.top - paddingTop - paddingBottom;

		// We divide by the current device pixel ratio, because the canvas is scaled up by that amount in each direction. However
		// the backend model is in unscaled coordinates. Since we are going to deal with our model coordinates, we go back here
		mouseX = Math.round((mouseX - boundingRect.left - paddingLeft) / (width) * canvas.width / chart.currentDevicePixelRatio);
		mouseY = Math.round((mouseY - boundingRect.top - paddingTop) / (height) * canvas.height / chart.currentDevicePixelRatio);

		return {
			x: mouseX,
			y: mouseY
		};

	};

	// Private helper function to convert max-width/max-height values that may be percentages into a number
	function parseMaxStyle(styleValue, node, parentProperty) {
		var valueInPixels;
		if (typeof styleValue === 'string') {
			valueInPixels = parseInt(styleValue, 10);

			if (styleValue.indexOf('%') !== -1) {
				// percentage * size in dimension
				valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
			}
		} else {
			valueInPixels = styleValue;
		}

		return valueInPixels;
	}

	/**
	 * Returns if the given value contains an effective constraint.
	 * @private
	 */
	function isConstrainedValue(value) {
		return value !== undefined && value !== null && value !== 'none';
	}

	// Private helper to get a constraint dimension
	// @param domNode : the node to check the constraint on
	// @param maxStyle : the style that defines the maximum for the direction we are using (maxWidth / maxHeight)
	// @param percentageProperty : property of parent to use when calculating width as a percentage
	// @see http://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser
	function getConstraintDimension(domNode, maxStyle, percentageProperty) {
		var view = document.defaultView;
		var parentNode = helpers._getParentNode(domNode);
		var constrainedNode = view.getComputedStyle(domNode)[maxStyle];
		var constrainedContainer = view.getComputedStyle(parentNode)[maxStyle];
		var hasCNode = isConstrainedValue(constrainedNode);
		var hasCContainer = isConstrainedValue(constrainedContainer);
		var infinity = Number.POSITIVE_INFINITY;

		if (hasCNode || hasCContainer) {
			return Math.min(
				hasCNode ? parseMaxStyle(constrainedNode, domNode, percentageProperty) : infinity,
				hasCContainer ? parseMaxStyle(constrainedContainer, parentNode, percentageProperty) : infinity);
		}

		return 'none';
	}
	// returns Number or undefined if no constraint
	helpers.getConstraintWidth = function(domNode) {
		return getConstraintDimension(domNode, 'max-width', 'clientWidth');
	};
	// returns Number or undefined if no constraint
	helpers.getConstraintHeight = function(domNode) {
		return getConstraintDimension(domNode, 'max-height', 'clientHeight');
	};
	/**
	 * @private
 	 */
	helpers._calculatePadding = function(container, padding, parentDimension) {
		padding = helpers.getStyle(container, padding);

		return padding.indexOf('%') > -1 ? parentDimension / parseInt(padding, 10) : parseInt(padding, 10);
	};
	/**
	 * @private
	 */
	helpers._getParentNode = function(domNode) {
		var parent = domNode.parentNode;
		if (parent && parent.host) {
			parent = parent.host;
		}
		return parent;
	};
	helpers.getMaximumWidth = function(domNode) {
		var container = helpers._getParentNode(domNode);
		if (!container) {
			return domNode.clientWidth;
		}

		var clientWidth = container.clientWidth;
		var paddingLeft = helpers._calculatePadding(container, 'padding-left', clientWidth);
		var paddingRight = helpers._calculatePadding(container, 'padding-right', clientWidth);

		var w = clientWidth - paddingLeft - paddingRight;
		var cw = helpers.getConstraintWidth(domNode);
		return isNaN(cw) ? w : Math.min(w, cw);
	};
	helpers.getMaximumHeight = function(domNode) {
		var container = helpers._getParentNode(domNode);
		if (!container) {
			return domNode.clientHeight;
		}

		var clientHeight = container.clientHeight;
		var paddingTop = helpers._calculatePadding(container, 'padding-top', clientHeight);
		var paddingBottom = helpers._calculatePadding(container, 'padding-bottom', clientHeight);

		var h = clientHeight - paddingTop - paddingBottom;
		var ch = helpers.getConstraintHeight(domNode);
		return isNaN(ch) ? h : Math.min(h, ch);
	};
	helpers.getStyle = function(el, property) {
		return el.currentStyle ?
			el.currentStyle[property] :
			document.defaultView.getComputedStyle(el, null).getPropertyValue(property);
	};
	helpers.retinaScale = function(chart, forceRatio) {
		var pixelRatio = chart.currentDevicePixelRatio = forceRatio || (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
		if (pixelRatio === 1) {
			return;
		}

		var canvas = chart.canvas;
		var height = chart.height;
		var width = chart.width;

		canvas.height = height * pixelRatio;
		canvas.width = width * pixelRatio;
		chart.ctx.scale(pixelRatio, pixelRatio);

		// If no style has been set on the canvas, the render size is used as display size,
		// making the chart visually bigger, so let's enforce it to the "correct" values.
		// See https://github.com/chartjs/Chart.js/issues/3575
		if (!canvas.style.height && !canvas.style.width) {
			canvas.style.height = height + 'px';
			canvas.style.width = width + 'px';
		}
	};
	// -- Canvas methods
	helpers.fontString = function(pixelSize, fontStyle, fontFamily) {
		return fontStyle + ' ' + pixelSize + 'px ' + fontFamily;
	};
	helpers.longestText = function(ctx, font, arrayOfThings, cache) {
		cache = cache || {};
		var data = cache.data = cache.data || {};
		var gc = cache.garbageCollect = cache.garbageCollect || [];

		if (cache.font !== font) {
			data = cache.data = {};
			gc = cache.garbageCollect = [];
			cache.font = font;
		}

		ctx.font = font;
		var longest = 0;
		helpers.each(arrayOfThings, function(thing) {
			// Undefined strings and arrays should not be measured
			if (thing !== undefined && thing !== null && helpers.isArray(thing) !== true) {
				longest = helpers.measureText(ctx, data, gc, longest, thing);
			} else if (helpers.isArray(thing)) {
				// if it is an array lets measure each element
				// to do maybe simplify this function a bit so we can do this more recursively?
				helpers.each(thing, function(nestedThing) {
					// Undefined strings and arrays should not be measured
					if (nestedThing !== undefined && nestedThing !== null && !helpers.isArray(nestedThing)) {
						longest = helpers.measureText(ctx, data, gc, longest, nestedThing);
					}
				});
			}
		});

		var gcLen = gc.length / 2;
		if (gcLen > arrayOfThings.length) {
			for (var i = 0; i < gcLen; i++) {
				delete data[gc[i]];
			}
			gc.splice(0, gcLen);
		}
		return longest;
	};
	helpers.measureText = function(ctx, data, gc, longest, string) {
		var textWidth = data[string];
		if (!textWidth) {
			textWidth = data[string] = ctx.measureText(string).width;
			gc.push(string);
		}
		if (textWidth > longest) {
			longest = textWidth;
		}
		return longest;
	};
	helpers.numberOfLabelLines = function(arrayOfThings) {
		var numberOfLines = 1;
		helpers.each(arrayOfThings, function(thing) {
			if (helpers.isArray(thing)) {
				if (thing.length > numberOfLines) {
					numberOfLines = thing.length;
				}
			}
		});
		return numberOfLines;
	};

	helpers.color = !color ?
		function(value) {
			console.error('Color.js not found!');
			return value;
		} :
		function(value) {
			/* global CanvasGradient */
			if (value instanceof CanvasGradient) {
				value = defaults.global.defaultColor;
			}

			return color(value);
		};

	helpers.getHoverColor = function(colorValue) {
		/* global CanvasPattern */
		return (colorValue instanceof CanvasPattern) ?
			colorValue :
			helpers.color(colorValue).saturate(0.5).darken(0.1).rgbString();
	};
};

},{"26":26,"3":3,"34":34,"46":46}],29:[function(require,module,exports){
'use strict';

var helpers = require(46);

/**
 * Helper function to get relative position for an event
 * @param {Event|IEvent} event - The event to get the position for
 * @param {Chart} chart - The chart
 * @returns {Point} the event position
 */
function getRelativePosition(e, chart) {
	if (e.native) {
		return {
			x: e.x,
			y: e.y
		};
	}

	return helpers.getRelativePosition(e, chart);
}

/**
 * Helper function to traverse all of the visible elements in the chart
 * @param chart {chart} the chart
 * @param handler {Function} the callback to execute for each visible item
 */
function parseVisibleItems(chart, handler) {
	var datasets = chart.data.datasets;
	var meta, i, j, ilen, jlen;

	for (i = 0, ilen = datasets.length; i < ilen; ++i) {
		if (!chart.isDatasetVisible(i)) {
			continue;
		}

		meta = chart.getDatasetMeta(i);
		for (j = 0, jlen = meta.data.length; j < jlen; ++j) {
			var element = meta.data[j];
			if (!element._view.skip) {
				handler(element);
			}
		}
	}
}

/**
 * Helper function to get the items that intersect the event position
 * @param items {ChartElement[]} elements to filter
 * @param position {Point} the point to be nearest to
 * @return {ChartElement[]} the nearest items
 */
function getIntersectItems(chart, position) {
	var elements = [];

	parseVisibleItems(chart, function(element) {
		if (element.inRange(position.x, position.y)) {
			elements.push(element);
		}
	});

	return elements;
}

/**
 * Helper function to get the items nearest to the event position considering all visible items in teh chart
 * @param chart {Chart} the chart to look at elements from
 * @param position {Point} the point to be nearest to
 * @param intersect {Boolean} if true, only consider items that intersect the position
 * @param distanceMetric {Function} function to provide the distance between points
 * @return {ChartElement[]} the nearest items
 */
function getNearestItems(chart, position, intersect, distanceMetric) {
	var minDistance = Number.POSITIVE_INFINITY;
	var nearestItems = [];

	parseVisibleItems(chart, function(element) {
		if (intersect && !element.inRange(position.x, position.y)) {
			return;
		}

		var center = element.getCenterPoint();
		var distance = distanceMetric(position, center);

		if (distance < minDistance) {
			nearestItems = [element];
			minDistance = distance;
		} else if (distance === minDistance) {
			// Can have multiple items at the same distance in which case we sort by size
			nearestItems.push(element);
		}
	});

	return nearestItems;
}

/**
 * Get a distance metric function for two points based on the
 * axis mode setting
 * @param {String} axis the axis mode. x|y|xy
 */
function getDistanceMetricForAxis(axis) {
	var useX = axis.indexOf('x') !== -1;
	var useY = axis.indexOf('y') !== -1;

	return function(pt1, pt2) {
		var deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
		var deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
		return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
	};
}

function indexMode(chart, e, options) {
	var position = getRelativePosition(e, chart);
	// Default axis for index mode is 'x' to match old behaviour
	options.axis = options.axis || 'x';
	var distanceMetric = getDistanceMetricForAxis(options.axis);
	var items = options.intersect ? getIntersectItems(chart, position) : getNearestItems(chart, position, false, distanceMetric);
	var elements = [];

	if (!items.length) {
		return [];
	}

	chart.data.datasets.forEach(function(dataset, datasetIndex) {
		if (chart.isDatasetVisible(datasetIndex)) {
			var meta = chart.getDatasetMeta(datasetIndex);
			var element = meta.data[items[0]._index];

			// don't count items that are skipped (null data)
			if (element && !element._view.skip) {
				elements.push(element);
			}
		}
	});

	return elements;
}

/**
 * @interface IInteractionOptions
 */
/**
 * If true, only consider items that intersect the point
 * @name IInterfaceOptions#boolean
 * @type Boolean
 */

/**
 * Contains interaction related functions
 * @namespace Chart.Interaction
 */
module.exports = {
	// Helper function for different modes
	modes: {
		single: function(chart, e) {
			var position = getRelativePosition(e, chart);
			var elements = [];

			parseVisibleItems(chart, function(element) {
				if (element.inRange(position.x, position.y)) {
					elements.push(element);
					return elements;
				}
			});

			return elements.slice(0, 1);
		},

		/**
		 * @function Chart.Interaction.modes.label
		 * @deprecated since version 2.4.0
		 * @todo remove at version 3
		 * @private
		 */
		label: indexMode,

		/**
		 * Returns items at the same index. If the options.intersect parameter is true, we only return items if we intersect something
		 * If the options.intersect mode is false, we find the nearest item and return the items at the same index as that item
		 * @function Chart.Interaction.modes.index
		 * @since v2.4.0
		 * @param chart {chart} the chart we are returning items from
		 * @param e {Event} the event we are find things at
		 * @param options {IInteractionOptions} options to use during interaction
		 * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		index: indexMode,

		/**
		 * Returns items in the same dataset. If the options.intersect parameter is true, we only return items if we intersect something
		 * If the options.intersect is false, we find the nearest item and return the items in that dataset
		 * @function Chart.Interaction.modes.dataset
		 * @param chart {chart} the chart we are returning items from
		 * @param e {Event} the event we are find things at
		 * @param options {IInteractionOptions} options to use during interaction
		 * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		dataset: function(chart, e, options) {
			var position = getRelativePosition(e, chart);
			options.axis = options.axis || 'xy';
			var distanceMetric = getDistanceMetricForAxis(options.axis);
			var items = options.intersect ? getIntersectItems(chart, position) : getNearestItems(chart, position, false, distanceMetric);

			if (items.length > 0) {
				items = chart.getDatasetMeta(items[0]._datasetIndex).data;
			}

			return items;
		},

		/**
		 * @function Chart.Interaction.modes.x-axis
		 * @deprecated since version 2.4.0. Use index mode and intersect == true
		 * @todo remove at version 3
		 * @private
		 */
		'x-axis': function(chart, e) {
			return indexMode(chart, e, {intersect: false});
		},

		/**
		 * Point mode returns all elements that hit test based on the event position
		 * of the event
		 * @function Chart.Interaction.modes.intersect
		 * @param chart {chart} the chart we are returning items from
		 * @param e {Event} the event we are find things at
		 * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		point: function(chart, e) {
			var position = getRelativePosition(e, chart);
			return getIntersectItems(chart, position);
		},

		/**
		 * nearest mode returns the element closest to the point
		 * @function Chart.Interaction.modes.intersect
		 * @param chart {chart} the chart we are returning items from
		 * @param e {Event} the event we are find things at
		 * @param options {IInteractionOptions} options to use
		 * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		nearest: function(chart, e, options) {
			var position = getRelativePosition(e, chart);
			options.axis = options.axis || 'xy';
			var distanceMetric = getDistanceMetricForAxis(options.axis);
			var nearestItems = getNearestItems(chart, position, options.intersect, distanceMetric);

			// We have multiple items at the same distance from the event. Now sort by smallest
			if (nearestItems.length > 1) {
				nearestItems.sort(function(a, b) {
					var sizeA = a.getArea();
					var sizeB = b.getArea();
					var ret = sizeA - sizeB;

					if (ret === 0) {
						// if equal sort by dataset index
						ret = a._datasetIndex - b._datasetIndex;
					}

					return ret;
				});
			}

			// Return only 1 item
			return nearestItems.slice(0, 1);
		},

		/**
		 * x mode returns the elements that hit-test at the current x coordinate
		 * @function Chart.Interaction.modes.x
		 * @param chart {chart} the chart we are returning items from
		 * @param e {Event} the event we are find things at
		 * @param options {IInteractionOptions} options to use
		 * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		x: function(chart, e, options) {
			var position = getRelativePosition(e, chart);
			var items = [];
			var intersectsItem = false;

			parseVisibleItems(chart, function(element) {
				if (element.inXRange(position.x)) {
					items.push(element);
				}

				if (element.inRange(position.x, position.y)) {
					intersectsItem = true;
				}
			});

			// If we want to trigger on an intersect and we don't have any items
			// that intersect the position, return nothing
			if (options.intersect && !intersectsItem) {
				items = [];
			}
			return items;
		},

		/**
		 * y mode returns the elements that hit-test at the current y coordinate
		 * @function Chart.Interaction.modes.y
		 * @param chart {chart} the chart we are returning items from
		 * @param e {Event} the event we are find things at
		 * @param options {IInteractionOptions} options to use
		 * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
		 */
		y: function(chart, e, options) {
			var position = getRelativePosition(e, chart);
			var items = [];
			var intersectsItem = false;

			parseVisibleItems(chart, function(element) {
				if (element.inYRange(position.y)) {
					items.push(element);
				}

				if (element.inRange(position.x, position.y)) {
					intersectsItem = true;
				}
			});

			// If we want to trigger on an intersect and we don't have any items
			// that intersect the position, return nothing
			if (options.intersect && !intersectsItem) {
				items = [];
			}
			return items;
		}
	}
};

},{"46":46}],30:[function(require,module,exports){
'use strict';

var defaults = require(26);

defaults._set('global', {
	responsive: true,
	responsiveAnimationDuration: 0,
	maintainAspectRatio: true,
	events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
	hover: {
		onHover: null,
		mode: 'nearest',
		intersect: true,
		animationDuration: 400
	},
	onClick: null,
	defaultColor: 'rgba(0,0,0,0.1)',
	defaultFontColor: '#666',
	defaultFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
	defaultFontSize: 12,
	defaultFontStyle: 'normal',
	showLines: true,

	// Element defaults defined in element extensions
	elements: {},

	// Layout options such as padding
	layout: {
		padding: {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		}
	}
});

module.exports = function() {

	// Occupy the global variable of Chart, and create a simple base class
	var Chart = function(item, config) {
		this.construct(item, config);
		return this;
	};

	Chart.Chart = Chart;

	return Chart;
};

},{"26":26}],31:[function(require,module,exports){
'use strict';

var helpers = require(46);

function filterByPosition(array, position) {
	return helpers.where(array, function(v) {
		return v.position === position;
	});
}

function sortByWeight(array, reverse) {
	array.forEach(function(v, i) {
		v._tmpIndex_ = i;
		return v;
	});
	array.sort(function(a, b) {
		var v0 = reverse ? b : a;
		var v1 = reverse ? a : b;
		return v0.weight === v1.weight ?
			v0._tmpIndex_ - v1._tmpIndex_ :
			v0.weight - v1.weight;
	});
	array.forEach(function(v) {
		delete v._tmpIndex_;
	});
}

/**
 * @interface ILayoutItem
 * @prop {String} position - The position of the item in the chart layout. Possible values are
 * 'left', 'top', 'right', 'bottom', and 'chartArea'
 * @prop {Number} weight - The weight used to sort the item. Higher weights are further away from the chart area
 * @prop {Boolean} fullWidth - if true, and the item is horizontal, then push vertical boxes down
 * @prop {Function} isHorizontal - returns true if the layout item is horizontal (ie. top or bottom)
 * @prop {Function} update - Takes two parameters: width and height. Returns size of item
 * @prop {Function} getPadding -  Returns an object with padding on the edges
 * @prop {Number} width - Width of item. Must be valid after update()
 * @prop {Number} height - Height of item. Must be valid after update()
 * @prop {Number} left - Left edge of the item. Set by layout system and cannot be used in update
 * @prop {Number} top - Top edge of the item. Set by layout system and cannot be used in update
 * @prop {Number} right - Right edge of the item. Set by layout system and cannot be used in update
 * @prop {Number} bottom - Bottom edge of the item. Set by layout system and cannot be used in update
 */

// The layout service is very self explanatory.  It's responsible for the layout within a chart.
// Scales, Legends and Plugins all rely on the layout service and can easily register to be placed anywhere they need
// It is this service's responsibility of carrying out that layout.
module.exports = {
	defaults: {},

	/**
	 * Register a box to a chart.
	 * A box is simply a reference to an object that requires layout. eg. Scales, Legend, Title.
	 * @param {Chart} chart - the chart to use
	 * @param {ILayoutItem} item - the item to add to be layed out
	 */
	addBox: function(chart, item) {
		if (!chart.boxes) {
			chart.boxes = [];
		}

		// initialize item with default values
		item.fullWidth = item.fullWidth || false;
		item.position = item.position || 'top';
		item.weight = item.weight || 0;

		chart.boxes.push(item);
	},

	/**
	 * Remove a layoutItem from a chart
	 * @param {Chart} chart - the chart to remove the box from
	 * @param {Object} layoutItem - the item to remove from the layout
	 */
	removeBox: function(chart, layoutItem) {
		var index = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
		if (index !== -1) {
			chart.boxes.splice(index, 1);
		}
	},

	/**
	 * Sets (or updates) options on the given `item`.
	 * @param {Chart} chart - the chart in which the item lives (or will be added to)
	 * @param {Object} item - the item to configure with the given options
	 * @param {Object} options - the new item options.
	 */
	configure: function(chart, item, options) {
		var props = ['fullWidth', 'position', 'weight'];
		var ilen = props.length;
		var i = 0;
		var prop;

		for (; i < ilen; ++i) {
			prop = props[i];
			if (options.hasOwnProperty(prop)) {
				item[prop] = options[prop];
			}
		}
	},

	/**
	 * Fits boxes of the given chart into the given size by having each box measure itself
	 * then running a fitting algorithm
	 * @param {Chart} chart - the chart
	 * @param {Number} width - the width to fit into
	 * @param {Number} height - the height to fit into
	 */
	update: function(chart, width, height) {
		if (!chart) {
			return;
		}

		var layoutOptions = chart.options.layout || {};
		var padding = helpers.options.toPadding(layoutOptions.padding);
		var leftPadding = padding.left;
		var rightPadding = padding.right;
		var topPadding = padding.top;
		var bottomPadding = padding.bottom;

		var leftBoxes = filterByPosition(chart.boxes, 'left');
		var rightBoxes = filterByPosition(chart.boxes, 'right');
		var topBoxes = filterByPosition(chart.boxes, 'top');
		var bottomBoxes = filterByPosition(chart.boxes, 'bottom');
		var chartAreaBoxes = filterByPosition(chart.boxes, 'chartArea');

		// Sort boxes by weight. A higher weight is further away from the chart area
		sortByWeight(leftBoxes, true);
		sortByWeight(rightBoxes, false);
		sortByWeight(topBoxes, true);
		sortByWeight(bottomBoxes, false);

		// Essentially we now have any number of boxes on each of the 4 sides.
		// Our canvas looks like the following.
		// The areas L1 and L2 are the left axes. R1 is the right axis, T1 is the top axis and
		// B1 is the bottom axis
		// There are also 4 quadrant-like locations (left to right instead of clockwise) reserved for chart overlays
		// These locations are single-box locations only, when trying to register a chartArea location that is already taken,
		// an error will be thrown.
		//
		// |----------------------------------------------------|
		// |                  T1 (Full Width)                   |
		// |----------------------------------------------------|
		// |    |    |                 T2                  |    |
		// |    |----|-------------------------------------|----|
		// |    |    | C1 |                           | C2 |    |
		// |    |    |----|                           |----|    |
		// |    |    |                                     |    |
		// | L1 | L2 |           ChartArea (C0)            | R1 |
		// |    |    |                                     |    |
		// |    |    |----|                           |----|    |
		// |    |    | C3 |                           | C4 |    |
		// |    |----|-------------------------------------|----|
		// |    |    |                 B1                  |    |
		// |----------------------------------------------------|
		// |                  B2 (Full Width)                   |
		// |----------------------------------------------------|
		//
		// What we do to find the best sizing, we do the following
		// 1. Determine the minimum size of the chart area.
		// 2. Split the remaining width equally between each vertical axis
		// 3. Split the remaining height equally between each horizontal axis
		// 4. Give each layout the maximum size it can be. The layout will return it's minimum size
		// 5. Adjust the sizes of each axis based on it's minimum reported size.
		// 6. Refit each axis
		// 7. Position each axis in the final location
		// 8. Tell the chart the final location of the chart area
		// 9. Tell any axes that overlay the chart area the positions of the chart area

		// Step 1
		var chartWidth = width - leftPadding - rightPadding;
		var chartHeight = height - topPadding - bottomPadding;
		var chartAreaWidth = chartWidth / 2; // min 50%
		var chartAreaHeight = chartHeight / 2; // min 50%

		// Step 2
		var verticalBoxWidth = (width - chartAreaWidth) / (leftBoxes.length + rightBoxes.length);

		// Step 3
		var horizontalBoxHeight = (height - chartAreaHeight) / (topBoxes.length + bottomBoxes.length);

		// Step 4
		var maxChartAreaWidth = chartWidth;
		var maxChartAreaHeight = chartHeight;
		var minBoxSizes = [];

		function getMinimumBoxSize(box) {
			var minSize;
			var isHorizontal = box.isHorizontal();

			if (isHorizontal) {
				minSize = box.update(box.fullWidth ? chartWidth : maxChartAreaWidth, horizontalBoxHeight);
				maxChartAreaHeight -= minSize.height;
			} else {
				minSize = box.update(verticalBoxWidth, maxChartAreaHeight);
				maxChartAreaWidth -= minSize.width;
			}

			minBoxSizes.push({
				horizontal: isHorizontal,
				minSize: minSize,
				box: box,
			});
		}

		helpers.each(leftBoxes.concat(rightBoxes, topBoxes, bottomBoxes), getMinimumBoxSize);

		// If a horizontal box has padding, we move the left boxes over to avoid ugly charts (see issue #2478)
		var maxHorizontalLeftPadding = 0;
		var maxHorizontalRightPadding = 0;
		var maxVerticalTopPadding = 0;
		var maxVerticalBottomPadding = 0;

		helpers.each(topBoxes.concat(bottomBoxes), function(horizontalBox) {
			if (horizontalBox.getPadding) {
				var boxPadding = horizontalBox.getPadding();
				maxHorizontalLeftPadding = Math.max(maxHorizontalLeftPadding, boxPadding.left);
				maxHorizontalRightPadding = Math.max(maxHorizontalRightPadding, boxPadding.right);
			}
		});

		helpers.each(leftBoxes.concat(rightBoxes), function(verticalBox) {
			if (verticalBox.getPadding) {
				var boxPadding = verticalBox.getPadding();
				maxVerticalTopPadding = Math.max(maxVerticalTopPadding, boxPadding.top);
				maxVerticalBottomPadding = Math.max(maxVerticalBottomPadding, boxPadding.bottom);
			}
		});

		// At this point, maxChartAreaHeight and maxChartAreaWidth are the size the chart area could
		// be if the axes are drawn at their minimum sizes.
		// Steps 5 & 6
		var totalLeftBoxesWidth = leftPadding;
		var totalRightBoxesWidth = rightPadding;
		var totalTopBoxesHeight = topPadding;
		var totalBottomBoxesHeight = bottomPadding;

		// Function to fit a box
		function fitBox(box) {
			var minBoxSize = helpers.findNextWhere(minBoxSizes, function(minBox) {
				return minBox.box === box;
			});

			if (minBoxSize) {
				if (box.isHorizontal()) {
					var scaleMargin = {
						left: Math.max(totalLeftBoxesWidth, maxHorizontalLeftPadding),
						right: Math.max(totalRightBoxesWidth, maxHorizontalRightPadding),
						top: 0,
						bottom: 0
					};

					// Don't use min size here because of label rotation. When the labels are rotated, their rotation highly depends
					// on the margin. Sometimes they need to increase in size slightly
					box.update(box.fullWidth ? chartWidth : maxChartAreaWidth, chartHeight / 2, scaleMargin);
				} else {
					box.update(minBoxSize.minSize.width, maxChartAreaHeight);
				}
			}
		}

		// Update, and calculate the left and right margins for the horizontal boxes
		helpers.each(leftBoxes.concat(rightBoxes), fitBox);

		helpers.each(leftBoxes, function(box) {
			totalLeftBoxesWidth += box.width;
		});

		helpers.each(rightBoxes, function(box) {
			totalRightBoxesWidth += box.width;
		});

		// Set the Left and Right margins for the horizontal boxes
		helpers.each(topBoxes.concat(bottomBoxes), fitBox);

		// Figure out how much margin is on the top and bottom of the vertical boxes
		helpers.each(topBoxes, function(box) {
			totalTopBoxesHeight += box.height;
		});

		helpers.each(bottomBoxes, function(box) {
			totalBottomBoxesHeight += box.height;
		});

		function finalFitVerticalBox(box) {
			var minBoxSize = helpers.findNextWhere(minBoxSizes, function(minSize) {
				return minSize.box === box;
			});

			var scaleMargin = {
				left: 0,
				right: 0,
				top: totalTopBoxesHeight,
				bottom: totalBottomBoxesHeight
			};

			if (minBoxSize) {
				box.update(minBoxSize.minSize.width, maxChartAreaHeight, scaleMargin);
			}
		}

		// Let the left layout know the final margin
		helpers.each(leftBoxes.concat(rightBoxes), finalFitVerticalBox);

		// Recalculate because the size of each layout might have changed slightly due to the margins (label rotation for instance)
		totalLeftBoxesWidth = leftPadding;
		totalRightBoxesWidth = rightPadding;
		totalTopBoxesHeight = topPadding;
		totalBottomBoxesHeight = bottomPadding;

		helpers.each(leftBoxes, function(box) {
			totalLeftBoxesWidth += box.width;
		});

		helpers.each(rightBoxes, function(box) {
			totalRightBoxesWidth += box.width;
		});

		helpers.each(topBoxes, function(box) {
			totalTopBoxesHeight += box.height;
		});
		helpers.each(bottomBoxes, function(box) {
			totalBottomBoxesHeight += box.height;
		});

		// We may be adding some padding to account for rotated x axis labels
		var leftPaddingAddition = Math.max(maxHorizontalLeftPadding - totalLeftBoxesWidth, 0);
		totalLeftBoxesWidth += leftPaddingAddition;
		totalRightBoxesWidth += Math.max(maxHorizontalRightPadding - totalRightBoxesWidth, 0);

		var topPaddingAddition = Math.max(maxVerticalTopPadding - totalTopBoxesHeight, 0);
		totalTopBoxesHeight += topPaddingAddition;
		totalBottomBoxesHeight += Math.max(maxVerticalBottomPadding - totalBottomBoxesHeight, 0);

		// Figure out if our chart area changed. This would occur if the dataset layout label rotation
		// changed due to the application of the margins in step 6. Since we can only get bigger, this is safe to do
		// without calling `fit` again
		var newMaxChartAreaHeight = height - totalTopBoxesHeight - totalBottomBoxesHeight;
		var newMaxChartAreaWidth = width - totalLeftBoxesWidth - totalRightBoxesWidth;

		if (newMaxChartAreaWidth !== maxChartAreaWidth || newMaxChartAreaHeight !== maxChartAreaHeight) {
			helpers.each(leftBoxes, function(box) {
				box.height = newMaxChartAreaHeight;
			});

			helpers.each(rightBoxes, function(box) {
				box.height = newMaxChartAreaHeight;
			});

			helpers.each(topBoxes, function(box) {
				if (!box.fullWidth) {
					box.width = newMaxChartAreaWidth;
				}
			});

			helpers.each(bottomBoxes, function(box) {
				if (!box.fullWidth) {
					box.width = newMaxChartAreaWidth;
				}
			});

			maxChartAreaHeight = newMaxChartAreaHeight;
			maxChartAreaWidth = newMaxChartAreaWidth;
		}

		// Step 7 - Position the boxes
		var left = leftPadding + leftPaddingAddition;
		var top = topPadding + topPaddingAddition;

		function placeBox(box) {
			if (box.isHorizontal()) {
				box.left = box.fullWidth ? leftPadding : totalLeftBoxesWidth;
				box.right = box.fullWidth ? width - rightPadding : totalLeftBoxesWidth + maxChartAreaWidth;
				box.top = top;
				box.bottom = top + box.height;

				// Move to next point
				top = box.bottom;

			} else {

				box.left = left;
				box.right = left + box.width;
				box.top = totalTopBoxesHeight;
				box.bottom = totalTopBoxesHeight + maxChartAreaHeight;

				// Move to next point
				left = box.right;
			}
		}

		helpers.each(leftBoxes.concat(topBoxes), placeBox);

		// Account for chart width and height
		left += maxChartAreaWidth;
		top += maxChartAreaHeight;

		helpers.each(rightBoxes, placeBox);
		helpers.each(bottomBoxes, placeBox);

		// Step 8
		chart.chartArea = {
			left: totalLeftBoxesWidth,
			top: totalTopBoxesHeight,
			right: totalLeftBoxesWidth + maxChartAreaWidth,
			bottom: totalTopBoxesHeight + maxChartAreaHeight
		};

		// Step 9
		helpers.each(chartAreaBoxes, function(box) {
			box.left = chart.chartArea.left;
			box.top = chart.chartArea.top;
			box.right = chart.chartArea.right;
			box.bottom = chart.chartArea.bottom;

			box.update(maxChartAreaWidth, maxChartAreaHeight);
		});
	}
};

},{"46":46}],32:[function(require,module,exports){
'use strict';

var defaults = require(26);
var helpers = require(46);

defaults._set('global', {
	plugins: {}
});

/**
 * The plugin service singleton
 * @namespace Chart.plugins
 * @since 2.1.0
 */
module.exports = {
	/**
	 * Globally registered plugins.
	 * @private
	 */
	_plugins: [],

	/**
	 * This identifier is used to invalidate the descriptors cache attached to each chart
	 * when a global plugin is registered or unregistered. In this case, the cache ID is
	 * incremented and descriptors are regenerated during following API calls.
	 * @private
	 */
	_cacheId: 0,

	/**
	 * Registers the given plugin(s) if not already registered.
	 * @param {Array|Object} plugins plugin instance(s).
	 */
	register: function(plugins) {
		var p = this._plugins;
		([]).concat(plugins).forEach(function(plugin) {
			if (p.indexOf(plugin) === -1) {
				p.push(plugin);
			}
		});

		this._cacheId++;
	},

	/**
	 * Unregisters the given plugin(s) only if registered.
	 * @param {Array|Object} plugins plugin instance(s).
	 */
	unregister: function(plugins) {
		var p = this._plugins;
		([]).concat(plugins).forEach(function(plugin) {
			var idx = p.indexOf(plugin);
			if (idx !== -1) {
				p.splice(idx, 1);
			}
		});

		this._cacheId++;
	},

	/**
	 * Remove all registered plugins.
	 * @since 2.1.5
	 */
	clear: function() {
		this._plugins = [];
		this._cacheId++;
	},

	/**
	 * Returns the number of registered plugins?
	 * @returns {Number}
	 * @since 2.1.5
	 */
	count: function() {
		return this._plugins.length;
	},

	/**
	 * Returns all registered plugin instances.
	 * @returns {Array} array of plugin objects.
	 * @since 2.1.5
	 */
	getAll: function() {
		return this._plugins;
	},

	/**
	 * Calls enabled plugins for `chart` on the specified hook and with the given args.
	 * This method immediately returns as soon as a plugin explicitly returns false. The
	 * returned value can be used, for instance, to interrupt the current action.
	 * @param {Object} chart - The chart instance for which plugins should be called.
	 * @param {String} hook - The name of the plugin method to call (e.g. 'beforeUpdate').
	 * @param {Array} [args] - Extra arguments to apply to the hook call.
	 * @returns {Boolean} false if any of the plugins return false, else returns true.
	 */
	notify: function(chart, hook, args) {
		var descriptors = this.descriptors(chart);
		var ilen = descriptors.length;
		var i, descriptor, plugin, params, method;

		for (i = 0; i < ilen; ++i) {
			descriptor = descriptors[i];
			plugin = descriptor.plugin;
			method = plugin[hook];
			if (typeof method === 'function') {
				params = [chart].concat(args || []);
				params.push(descriptor.options);
				if (method.apply(plugin, params) === false) {
					return false;
				}
			}
		}

		return true;
	},

	/**
	 * Returns descriptors of enabled plugins for the given chart.
	 * @returns {Array} [{ plugin, options }]
	 * @private
	 */
	descriptors: function(chart) {
		var cache = chart.$plugins || (chart.$plugins = {});
		if (cache.id === this._cacheId) {
			return cache.descriptors;
		}

		var plugins = [];
		var descriptors = [];
		var config = (chart && chart.config) || {};
		var options = (config.options && config.options.plugins) || {};

		this._plugins.concat(config.plugins || []).forEach(function(plugin) {
			var idx = plugins.indexOf(plugin);
			if (idx !== -1) {
				return;
			}

			var id = plugin.id;
			var opts = options[id];
			if (opts === false) {
				return;
			}

			if (opts === true) {
				opts = helpers.clone(defaults.global.plugins[id]);
			}

			plugins.push(plugin);
			descriptors.push({
				plugin: plugin,
				options: opts || {}
			});
		});

		cache.descriptors = descriptors;
		cache.id = this._cacheId;
		return descriptors;
	},

	/**
	 * Invalidates cache for the given chart: descriptors hold a reference on plugin option,
	 * but in some cases, this reference can be changed by the user when updating options.
	 * https://github.com/chartjs/Chart.js/issues/5111#issuecomment-355934167
	 * @private
	 */
	_invalidate: function(chart) {
		delete chart.$plugins;
	}
};

/**
 * Plugin extension hooks.
 * @interface IPlugin
 * @since 2.1.0
 */
/**
 * @method IPlugin#beforeInit
 * @desc Called before initializing `chart`.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#afterInit
 * @desc Called after `chart` has been initialized and before the first update.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeUpdate
 * @desc Called before updating `chart`. If any plugin returns `false`, the update
 * is cancelled (and thus subsequent render(s)) until another `update` is triggered.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 * @returns {Boolean} `false` to cancel the chart update.
 */
/**
 * @method IPlugin#afterUpdate
 * @desc Called after `chart` has been updated and before rendering. Note that this
 * hook will not be called if the chart update has been previously cancelled.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeDatasetsUpdate
 * @desc Called before updating the `chart` datasets. If any plugin returns `false`,
 * the datasets update is cancelled until another `update` is triggered.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 * @returns {Boolean} false to cancel the datasets update.
 * @since version 2.1.5
*/
/**
 * @method IPlugin#afterDatasetsUpdate
 * @desc Called after the `chart` datasets have been updated. Note that this hook
 * will not be called if the datasets update has been previously cancelled.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 * @since version 2.1.5
 */
/**
 * @method IPlugin#beforeDatasetUpdate
 * @desc Called before updating the `chart` dataset at the given `args.index`. If any plugin
 * returns `false`, the datasets update is cancelled until another `update` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {Object} args - The call arguments.
 * @param {Number} args.index - The dataset index.
 * @param {Object} args.meta - The dataset metadata.
 * @param {Object} options - The plugin options.
 * @returns {Boolean} `false` to cancel the chart datasets drawing.
 */
/**
 * @method IPlugin#afterDatasetUpdate
 * @desc Called after the `chart` datasets at the given `args.index` has been updated. Note
 * that this hook will not be called if the datasets update has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {Object} args - The call arguments.
 * @param {Number} args.index - The dataset index.
 * @param {Object} args.meta - The dataset metadata.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeLayout
 * @desc Called before laying out `chart`. If any plugin returns `false`,
 * the layout update is cancelled until another `update` is triggered.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 * @returns {Boolean} `false` to cancel the chart layout.
 */
/**
 * @method IPlugin#afterLayout
 * @desc Called after the `chart` has been layed out. Note that this hook will not
 * be called if the layout update has been previously cancelled.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeRender
 * @desc Called before rendering `chart`. If any plugin returns `false`,
 * the rendering is cancelled until another `render` is triggered.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 * @returns {Boolean} `false` to cancel the chart rendering.
 */
/**
 * @method IPlugin#afterRender
 * @desc Called after the `chart` has been fully rendered (and animation completed). Note
 * that this hook will not be called if the rendering has been previously cancelled.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeDraw
 * @desc Called before drawing `chart` at every animation frame specified by the given
 * easing value. If any plugin returns `false`, the frame drawing is cancelled until
 * another `render` is triggered.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Number} easingValue - The current animation value, between 0.0 and 1.0.
 * @param {Object} options - The plugin options.
 * @returns {Boolean} `false` to cancel the chart drawing.
 */
/**
 * @method IPlugin#afterDraw
 * @desc Called after the `chart` has been drawn for the specific easing value. Note
 * that this hook will not be called if the drawing has been previously cancelled.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Number} easingValue - The current animation value, between 0.0 and 1.0.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeDatasetsDraw
 * @desc Called before drawing the `chart` datasets. If any plugin returns `false`,
 * the datasets drawing is cancelled until another `render` is triggered.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Number} easingValue - The current animation value, between 0.0 and 1.0.
 * @param {Object} options - The plugin options.
 * @returns {Boolean} `false` to cancel the chart datasets drawing.
 */
/**
 * @method IPlugin#afterDatasetsDraw
 * @desc Called after the `chart` datasets have been drawn. Note that this hook
 * will not be called if the datasets drawing has been previously cancelled.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Number} easingValue - The current animation value, between 0.0 and 1.0.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeDatasetDraw
 * @desc Called before drawing the `chart` dataset at the given `args.index` (datasets
 * are drawn in the reverse order). If any plugin returns `false`, the datasets drawing
 * is cancelled until another `render` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {Object} args - The call arguments.
 * @param {Number} args.index - The dataset index.
 * @param {Object} args.meta - The dataset metadata.
 * @param {Number} args.easingValue - The current animation value, between 0.0 and 1.0.
 * @param {Object} options - The plugin options.
 * @returns {Boolean} `false` to cancel the chart datasets drawing.
 */
/**
 * @method IPlugin#afterDatasetDraw
 * @desc Called after the `chart` datasets at the given `args.index` have been drawn
 * (datasets are drawn in the reverse order). Note that this hook will not be called
 * if the datasets drawing has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {Object} args - The call arguments.
 * @param {Number} args.index - The dataset index.
 * @param {Object} args.meta - The dataset metadata.
 * @param {Number} args.easingValue - The current animation value, between 0.0 and 1.0.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeTooltipDraw
 * @desc Called before drawing the `tooltip`. If any plugin returns `false`,
 * the tooltip drawing is cancelled until another `render` is triggered.
 * @param {Chart} chart - The chart instance.
 * @param {Object} args - The call arguments.
 * @param {Object} args.tooltip - The tooltip.
 * @param {Number} args.easingValue - The current animation value, between 0.0 and 1.0.
 * @param {Object} options - The plugin options.
 * @returns {Boolean} `false` to cancel the chart tooltip drawing.
 */
/**
 * @method IPlugin#afterTooltipDraw
 * @desc Called after drawing the `tooltip`. Note that this hook will not
 * be called if the tooltip drawing has been previously cancelled.
 * @param {Chart} chart - The chart instance.
 * @param {Object} args - The call arguments.
 * @param {Object} args.tooltip - The tooltip.
 * @param {Number} args.easingValue - The current animation value, between 0.0 and 1.0.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#beforeEvent
 * @desc Called before processing the specified `event`. If any plugin returns `false`,
 * the event will be discarded.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {IEvent} event - The event object.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#afterEvent
 * @desc Called after the `event` has been consumed. Note that this hook
 * will not be called if the `event` has been previously discarded.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {IEvent} event - The event object.
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#resize
 * @desc Called after the chart as been resized.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Number} size - The new canvas display size (eq. canvas.style width & height).
 * @param {Object} options - The plugin options.
 */
/**
 * @method IPlugin#destroy
 * @desc Called after the chart as been destroyed.
 * @param {Chart.Controller} chart - The chart instance.
 * @param {Object} options - The plugin options.
 */

},{"26":26,"46":46}],33:[function(require,module,exports){
'use strict';

var defaults = require(26);
var Element = require(27);
var helpers = require(46);
var Ticks = require(35);

defaults._set('scale', {
	display: true,
	position: 'left',
	offset: false,

	// grid line settings
	gridLines: {
		display: true,
		color: 'rgba(0, 0, 0, 0.1)',
		lineWidth: 1,
		drawBorder: true,
		drawOnChartArea: true,
		drawTicks: true,
		tickMarkLength: 10,
		zeroLineWidth: 1,
		zeroLineColor: 'rgba(0,0,0,0.25)',
		zeroLineBorderDash: [],
		zeroLineBorderDashOffset: 0.0,
		offsetGridLines: false,
		borderDash: [],
		borderDashOffset: 0.0
	},

	// scale label
	scaleLabel: {
		// display property
		display: false,

		// actual label
		labelString: '',

		// line height
		lineHeight: 1.2,

		// top/bottom padding
		padding: {
			top: 4,
			bottom: 4
		}
	},

	// label settings
	ticks: {
		beginAtZero: false,
		minRotation: 0,
		maxRotation: 50,
		mirror: false,
		padding: 0,
		reverse: false,
		display: true,
		autoSkip: true,
		autoSkipPadding: 0,
		labelOffset: 0,
		// We pass through arrays to be rendered as multiline labels, we convert Others to strings here.
		callback: Ticks.formatters.values,
		minor: {},
		major: {}
	}
});

function labelsFromTicks(ticks) {
	var labels = [];
	var i, ilen;

	for (i = 0, ilen = ticks.length; i < ilen; ++i) {
		labels.push(ticks[i].label);
	}

	return labels;
}

function getLineValue(scale, index, offsetGridLines) {
	var lineValue = scale.getPixelForTick(index);

	if (offsetGridLines) {
		if (index === 0) {
			lineValue -= (scale.getPixelForTick(1) - lineValue) / 2;
		} else {
			lineValue -= (lineValue - scale.getPixelForTick(index - 1)) / 2;
		}
	}
	return lineValue;
}

function computeTextSize(context, tick, font) {
	return helpers.isArray(tick) ?
		helpers.longestText(context, font, tick) :
		context.measureText(tick).width;
}

function parseFontOptions(options) {
	var valueOrDefault = helpers.valueOrDefault;
	var globalDefaults = defaults.global;
	var size = valueOrDefault(options.fontSize, globalDefaults.defaultFontSize);
	var style = valueOrDefault(options.fontStyle, globalDefaults.defaultFontStyle);
	var family = valueOrDefault(options.fontFamily, globalDefaults.defaultFontFamily);

	return {
		size: size,
		style: style,
		family: family,
		font: helpers.fontString(size, style, family)
	};
}

function parseLineHeight(options) {
	return helpers.options.toLineHeight(
		helpers.valueOrDefault(options.lineHeight, 1.2),
		helpers.valueOrDefault(options.fontSize, defaults.global.defaultFontSize));
}

module.exports = Element.extend({
	/**
	 * Get the padding needed for the scale
	 * @method getPadding
	 * @private
	 * @returns {Padding} the necessary padding
	 */
	getPadding: function() {
		var me = this;
		return {
			left: me.paddingLeft || 0,
			top: me.paddingTop || 0,
			right: me.paddingRight || 0,
			bottom: me.paddingBottom || 0
		};
	},

	/**
	 * Returns the scale tick objects ({label, major})
	 * @since 2.7
	 */
	getTicks: function() {
		return this._ticks;
	},

	// These methods are ordered by lifecyle. Utilities then follow.
	// Any function defined here is inherited by all scale types.
	// Any function can be extended by the scale type

	mergeTicksOptions: function() {
		var ticks = this.options.ticks;
		if (ticks.minor === false) {
			ticks.minor = {
				display: false
			};
		}
		if (ticks.major === false) {
			ticks.major = {
				display: false
			};
		}
		for (var key in ticks) {
			if (key !== 'major' && key !== 'minor') {
				if (typeof ticks.minor[key] === 'undefined') {
					ticks.minor[key] = ticks[key];
				}
				if (typeof ticks.major[key] === 'undefined') {
					ticks.major[key] = ticks[key];
				}
			}
		}
	},
	beforeUpdate: function() {
		helpers.callback(this.options.beforeUpdate, [this]);
	},

	update: function(maxWidth, maxHeight, margins) {
		var me = this;
		var i, ilen, labels, label, ticks, tick;

		// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
		me.beforeUpdate();

		// Absorb the master measurements
		me.maxWidth = maxWidth;
		me.maxHeight = maxHeight;
		me.margins = helpers.extend({
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		}, margins);
		me.longestTextCache = me.longestTextCache || {};

		// Dimensions
		me.beforeSetDimensions();
		me.setDimensions();
		me.afterSetDimensions();

		// Data min/max
		me.beforeDataLimits();
		me.determineDataLimits();
		me.afterDataLimits();

		// Ticks - `this.ticks` is now DEPRECATED!
		// Internal ticks are now stored as objects in the PRIVATE `this._ticks` member
		// and must not be accessed directly from outside this class. `this.ticks` being
		// around for long time and not marked as private, we can't change its structure
		// without unexpected breaking changes. If you need to access the scale ticks,
		// use scale.getTicks() instead.

		me.beforeBuildTicks();

		// New implementations should return an array of objects but for BACKWARD COMPAT,
		// we still support no return (`this.ticks` internally set by calling this method).
		ticks = me.buildTicks() || [];

		me.afterBuildTicks();

		me.beforeTickToLabelConversion();

		// New implementations should return the formatted tick labels but for BACKWARD
		// COMPAT, we still support no return (`this.ticks` internally changed by calling
		// this method and supposed to contain only string values).
		labels = me.convertTicksToLabels(ticks) || me.ticks;

		me.afterTickToLabelConversion();

		me.ticks = labels;   // BACKWARD COMPATIBILITY

		// IMPORTANT: from this point, we consider that `this.ticks` will NEVER change!

		// BACKWARD COMPAT: synchronize `_ticks` with labels (so potentially `this.ticks`)
		for (i = 0, ilen = labels.length; i < ilen; ++i) {
			label = labels[i];
			tick = ticks[i];
			if (!tick) {
				ticks.push(tick = {
					label: label,
					major: false
				});
			} else {
				tick.label = label;
			}
		}

		me._ticks = ticks;

		// Tick Rotation
		me.beforeCalculateTickRotation();
		me.calculateTickRotation();
		me.afterCalculateTickRotation();
		// Fit
		me.beforeFit();
		me.fit();
		me.afterFit();
		//
		me.afterUpdate();

		return me.minSize;

	},
	afterUpdate: function() {
		helpers.callback(this.options.afterUpdate, [this]);
	},

	//

	beforeSetDimensions: function() {
		helpers.callback(this.options.beforeSetDimensions, [this]);
	},
	setDimensions: function() {
		var me = this;
		// Set the unconstrained dimension before label rotation
		if (me.isHorizontal()) {
			// Reset position before calculating rotation
			me.width = me.maxWidth;
			me.left = 0;
			me.right = me.width;
		} else {
			me.height = me.maxHeight;

			// Reset position before calculating rotation
			me.top = 0;
			me.bottom = me.height;
		}

		// Reset padding
		me.paddingLeft = 0;
		me.paddingTop = 0;
		me.paddingRight = 0;
		me.paddingBottom = 0;
	},
	afterSetDimensions: function() {
		helpers.callback(this.options.afterSetDimensions, [this]);
	},

	// Data limits
	beforeDataLimits: function() {
		helpers.callback(this.options.beforeDataLimits, [this]);
	},
	determineDataLimits: helpers.noop,
	afterDataLimits: function() {
		helpers.callback(this.options.afterDataLimits, [this]);
	},

	//
	beforeBuildTicks: function() {
		helpers.callback(this.options.beforeBuildTicks, [this]);
	},
	buildTicks: helpers.noop,
	afterBuildTicks: function() {
		helpers.callback(this.options.afterBuildTicks, [this]);
	},

	beforeTickToLabelConversion: function() {
		helpers.callback(this.options.beforeTickToLabelConversion, [this]);
	},
	convertTicksToLabels: function() {
		var me = this;
		// Convert ticks to strings
		var tickOpts = me.options.ticks;
		me.ticks = me.ticks.map(tickOpts.userCallback || tickOpts.callback, this);
	},
	afterTickToLabelConversion: function() {
		helpers.callback(this.options.afterTickToLabelConversion, [this]);
	},

	//

	beforeCalculateTickRotation: function() {
		helpers.callback(this.options.beforeCalculateTickRotation, [this]);
	},
	calculateTickRotation: function() {
		var me = this;
		var context = me.ctx;
		var tickOpts = me.options.ticks;
		var labels = labelsFromTicks(me._ticks);

		// Get the width of each grid by calculating the difference
		// between x offsets between 0 and 1.
		var tickFont = parseFontOptions(tickOpts);
		context.font = tickFont.font;

		var labelRotation = tickOpts.minRotation || 0;

		if (labels.length && me.options.display && me.isHorizontal()) {
			var originalLabelWidth = helpers.longestText(context, tickFont.font, labels, me.longestTextCache);
			var labelWidth = originalLabelWidth;
			var cosRotation, sinRotation;

			// Allow 3 pixels x2 padding either side for label readability
			var tickWidth = me.getPixelForTick(1) - me.getPixelForTick(0) - 6;

			// Max label rotation can be set or default to 90 - also act as a loop counter
			while (labelWidth > tickWidth && labelRotation < tickOpts.maxRotation) {
				var angleRadians = helpers.toRadians(labelRotation);
				cosRotation = Math.cos(angleRadians);
				sinRotation = Math.sin(angleRadians);

				if (sinRotation * originalLabelWidth > me.maxHeight) {
					// go back one step
					labelRotation--;
					break;
				}

				labelRotation++;
				labelWidth = cosRotation * originalLabelWidth;
			}
		}

		me.labelRotation = labelRotation;
	},
	afterCalculateTickRotation: function() {
		helpers.callback(this.options.afterCalculateTickRotation, [this]);
	},

	//

	beforeFit: function() {
		helpers.callback(this.options.beforeFit, [this]);
	},
	fit: function() {
		var me = this;
		// Reset
		var minSize = me.minSize = {
			width: 0,
			height: 0
		};

		var labels = labelsFromTicks(me._ticks);

		var opts = me.options;
		var tickOpts = opts.ticks;
		var scaleLabelOpts = opts.scaleLabel;
		var gridLineOpts = opts.gridLines;
		var display = opts.display;
		var isHorizontal = me.isHorizontal();

		var tickFont = parseFontOptions(tickOpts);
		var tickMarkLength = opts.gridLines.tickMarkLength;

		// Width
		if (isHorizontal) {
			// subtract the margins to line up with the chartArea if we are a full width scale
			minSize.width = me.isFullWidth() ? me.maxWidth - me.margins.left - me.margins.right : me.maxWidth;
		} else {
			minSize.width = display && gridLineOpts.drawTicks ? tickMarkLength : 0;
		}

		// height
		if (isHorizontal) {
			minSize.height = display && gridLineOpts.drawTicks ? tickMarkLength : 0;
		} else {
			minSize.height = me.maxHeight; // fill all the height
		}

		// Are we showing a title for the scale?
		if (scaleLabelOpts.display && display) {
			var scaleLabelLineHeight = parseLineHeight(scaleLabelOpts);
			var scaleLabelPadding = helpers.options.toPadding(scaleLabelOpts.padding);
			var deltaHeight = scaleLabelLineHeight + scaleLabelPadding.height;

			if (isHorizontal) {
				minSize.height += deltaHeight;
			} else {
				minSize.width += deltaHeight;
			}
		}

		// Don't bother fitting the ticks if we are not showing them
		if (tickOpts.display && display) {
			var largestTextWidth = helpers.longestText(me.ctx, tickFont.font, labels, me.longestTextCache);
			var tallestLabelHeightInLines = helpers.numberOfLabelLines(labels);
			var lineSpace = tickFont.size * 0.5;
			var tickPadding = me.options.ticks.padding;

			if (isHorizontal) {
				// A horizontal axis is more constrained by the height.
				me.longestLabelWidth = largestTextWidth;

				var angleRadians = helpers.toRadians(me.labelRotation);
				var cosRotation = Math.cos(angleRadians);
				var sinRotation = Math.sin(angleRadians);

				// TODO - improve this calculation
				var labelHeight = (sinRotation * largestTextWidth)
					+ (tickFont.size * tallestLabelHeightInLines)
					+ (lineSpace * (tallestLabelHeightInLines - 1))
					+ lineSpace; // padding

				minSize.height = Math.min(me.maxHeight, minSize.height + labelHeight + tickPadding);

				me.ctx.font = tickFont.font;
				var firstLabelWidth = computeTextSize(me.ctx, labels[0], tickFont.font);
				var lastLabelWidth = computeTextSize(me.ctx, labels[labels.length - 1], tickFont.font);

				// Ensure that our ticks are always inside the canvas. When rotated, ticks are right aligned
				// which means that the right padding is dominated by the font height
				if (me.labelRotation !== 0) {
					me.paddingLeft = opts.position === 'bottom' ? (cosRotation * firstLabelWidth) + 3 : (cosRotation * lineSpace) + 3; // add 3 px to move away from canvas edges
					me.paddingRight = opts.position === 'bottom' ? (cosRotation * lineSpace) + 3 : (cosRotation * lastLabelWidth) + 3;
				} else {
					me.paddingLeft = firstLabelWidth / 2 + 3; // add 3 px to move away from canvas edges
					me.paddingRight = lastLabelWidth / 2 + 3;
				}
			} else {
				// A vertical axis is more constrained by the width. Labels are the
				// dominant factor here, so get that length first and account for padding
				if (tickOpts.mirror) {
					largestTextWidth = 0;
				} else {
					// use lineSpace for consistency with horizontal axis
					// tickPadding is not implemented for horizontal
					largestTextWidth += tickPadding + lineSpace;
				}

				minSize.width = Math.min(me.maxWidth, minSize.width + largestTextWidth);

				me.paddingTop = tickFont.size / 2;
				me.paddingBottom = tickFont.size / 2;
			}
		}

		me.handleMargins();

		me.width = minSize.width;
		me.height = minSize.height;
	},

	/**
	 * Handle margins and padding interactions
	 * @private
	 */
	handleMargins: function() {
		var me = this;
		if (me.margins) {
			me.paddingLeft = Math.max(me.paddingLeft - me.margins.left, 0);
			me.paddingTop = Math.max(me.paddingTop - me.margins.top, 0);
			me.paddingRight = Math.max(me.paddingRight - me.margins.right, 0);
			me.paddingBottom = Math.max(me.paddingBottom - me.margins.bottom, 0);
		}
	},

	afterFit: function() {
		helpers.callback(this.options.afterFit, [this]);
	},

	// Shared Methods
	isHorizontal: function() {
		return this.options.position === 'top' || this.options.position === 'bottom';
	},
	isFullWidth: function() {
		return (this.options.fullWidth);
	},

	// Get the correct value. NaN bad inputs, If the value type is object get the x or y based on whether we are horizontal or not
	getRightValue: function(rawValue) {
		// Null and undefined values first
		if (helpers.isNullOrUndef(rawValue)) {
			return NaN;
		}
		// isNaN(object) returns true, so make sure NaN is checking for a number; Discard Infinite values
		if (typeof rawValue === 'number' && !isFinite(rawValue)) {
			return NaN;
		}
		// If it is in fact an object, dive in one more level
		if (rawValue) {
			if (this.isHorizontal()) {
				if (rawValue.x !== undefined) {
					return this.getRightValue(rawValue.x);
				}
			} else if (rawValue.y !== undefined) {
				return this.getRightValue(rawValue.y);
			}
		}

		// Value is good, return it
		return rawValue;
	},

	/**
	 * Used to get the value to display in the tooltip for the data at the given index
	 * @param index
	 * @param datasetIndex
	 */
	getLabelForIndex: helpers.noop,

	/**
	 * Returns the location of the given data point. Value can either be an index or a numerical value
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param value
	 * @param index
	 * @param datasetIndex
	 */
	getPixelForValue: helpers.noop,

	/**
	 * Used to get the data value from a given pixel. This is the inverse of getPixelForValue
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param pixel
	 */
	getValueForPixel: helpers.noop,

	/**
	 * Returns the location of the tick at the given index
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 */
	getPixelForTick: function(index) {
		var me = this;
		var offset = me.options.offset;
		if (me.isHorizontal()) {
			var innerWidth = me.width - (me.paddingLeft + me.paddingRight);
			var tickWidth = innerWidth / Math.max((me._ticks.length - (offset ? 0 : 1)), 1);
			var pixel = (tickWidth * index) + me.paddingLeft;

			if (offset) {
				pixel += tickWidth / 2;
			}

			var finalVal = me.left + Math.round(pixel);
			finalVal += me.isFullWidth() ? me.margins.left : 0;
			return finalVal;
		}
		var innerHeight = me.height - (me.paddingTop + me.paddingBottom);
		return me.top + (index * (innerHeight / (me._ticks.length - 1)));
	},

	/**
	 * Utility for getting the pixel location of a percentage of scale
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 */
	getPixelForDecimal: function(decimal) {
		var me = this;
		if (me.isHorizontal()) {
			var innerWidth = me.width - (me.paddingLeft + me.paddingRight);
			var valueOffset = (innerWidth * decimal) + me.paddingLeft;

			var finalVal = me.left + Math.round(valueOffset);
			finalVal += me.isFullWidth() ? me.margins.left : 0;
			return finalVal;
		}
		return me.top + (decimal * me.height);
	},

	/**
	 * Returns the pixel for the minimum chart value
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 */
	getBasePixel: function() {
		return this.getPixelForValue(this.getBaseValue());
	},

	getBaseValue: function() {
		var me = this;
		var min = me.min;
		var max = me.max;

		return me.beginAtZero ? 0 :
			min < 0 && max < 0 ? max :
			min > 0 && max > 0 ? min :
			0;
	},

	/**
	 * Returns a subset of ticks to be plotted to avoid overlapping labels.
	 * @private
	 */
	_autoSkip: function(ticks) {
		var skipRatio;
		var me = this;
		var isHorizontal = me.isHorizontal();
		var optionTicks = me.options.ticks.minor;
		var tickCount = ticks.length;
		var labelRotationRadians = helpers.toRadians(me.labelRotation);
		var cosRotation = Math.cos(labelRotationRadians);
		var longestRotatedLabel = me.longestLabelWidth * cosRotation;
		var result = [];
		var i, tick, shouldSkip;

		// figure out the maximum number of gridlines to show
		var maxTicks;
		if (optionTicks.maxTicksLimit) {
			maxTicks = optionTicks.maxTicksLimit;
		}

		if (isHorizontal) {
			skipRatio = false;

			if ((longestRotatedLabel + optionTicks.autoSkipPadding) * tickCount > (me.width - (me.paddingLeft + me.paddingRight))) {
				skipRatio = 1 + Math.floor(((longestRotatedLabel + optionTicks.autoSkipPadding) * tickCount) / (me.width - (me.paddingLeft + me.paddingRight)));
			}

			// if they defined a max number of optionTicks,
			// increase skipRatio until that number is met
			if (maxTicks && tickCount > maxTicks) {
				skipRatio = Math.max(skipRatio, Math.floor(tickCount / maxTicks));
			}
		}

		for (i = 0; i < tickCount; i++) {
			tick = ticks[i];

			// Since we always show the last tick,we need may need to hide the last shown one before
			shouldSkip = (skipRatio > 1 && i % skipRatio > 0) || (i % skipRatio === 0 && i + skipRatio >= tickCount);
			if (shouldSkip && i !== tickCount - 1) {
				// leave tick in place but make sure it's not displayed (#4635)
				delete tick.label;
			}
			result.push(tick);
		}
		return result;
	},

	// Actually draw the scale on the canvas
	// @param {rectangle} chartArea : the area of the chart to draw full grid lines on
	draw: function(chartArea) {
		var me = this;
		var options = me.options;
		if (!options.display) {
			return;
		}

		var context = me.ctx;
		var globalDefaults = defaults.global;
		var optionTicks = options.ticks.minor;
		var optionMajorTicks = options.ticks.major || optionTicks;
		var gridLines = options.gridLines;
		var scaleLabel = options.scaleLabel;

		var isRotated = me.labelRotation !== 0;
		var isHorizontal = me.isHorizontal();

		var ticks = optionTicks.autoSkip ? me._autoSkip(me.getTicks()) : me.getTicks();
		var tickFontColor = helpers.valueOrDefault(optionTicks.fontColor, globalDefaults.defaultFontColor);
		var tickFont = parseFontOptions(optionTicks);
		var majorTickFontColor = helpers.valueOrDefault(optionMajorTicks.fontColor, globalDefaults.defaultFontColor);
		var majorTickFont = parseFontOptions(optionMajorTicks);

		var tl = gridLines.drawTicks ? gridLines.tickMarkLength : 0;

		var scaleLabelFontColor = helpers.valueOrDefault(scaleLabel.fontColor, globalDefaults.defaultFontColor);
		var scaleLabelFont = parseFontOptions(scaleLabel);
		var scaleLabelPadding = helpers.options.toPadding(scaleLabel.padding);
		var labelRotationRadians = helpers.toRadians(me.labelRotation);

		var itemsToDraw = [];

		var axisWidth = me.options.gridLines.lineWidth;
		var xTickStart = options.position === 'right' ? me.left : me.right - axisWidth - tl;
		var xTickEnd = options.position === 'right' ? me.left + tl : me.right;
		var yTickStart = options.position === 'bottom' ? me.top + axisWidth : me.bottom - tl - axisWidth;
		var yTickEnd = options.position === 'bottom' ? me.top + axisWidth + tl : me.bottom + axisWidth;

		helpers.each(ticks, function(tick, index) {
			// autoskipper skipped this tick (#4635)
			if (helpers.isNullOrUndef(tick.label)) {
				return;
			}

			var label = tick.label;
			var lineWidth, lineColor, borderDash, borderDashOffset;
			if (index === me.zeroLineIndex && options.offset === gridLines.offsetGridLines) {
				// Draw the first index specially
				lineWidth = gridLines.zeroLineWidth;
				lineColor = gridLines.zeroLineColor;
				borderDash = gridLines.zeroLineBorderDash;
				borderDashOffset = gridLines.zeroLineBorderDashOffset;
			} else {
				lineWidth = helpers.valueAtIndexOrDefault(gridLines.lineWidth, index);
				lineColor = helpers.valueAtIndexOrDefault(gridLines.color, index);
				borderDash = helpers.valueOrDefault(gridLines.borderDash, globalDefaults.borderDash);
				borderDashOffset = helpers.valueOrDefault(gridLines.borderDashOffset, globalDefaults.borderDashOffset);
			}

			// Common properties
			var tx1, ty1, tx2, ty2, x1, y1, x2, y2, labelX, labelY;
			var textAlign = 'middle';
			var textBaseline = 'middle';
			var tickPadding = optionTicks.padding;

			if (isHorizontal) {
				var labelYOffset = tl + tickPadding;

				if (options.position === 'bottom') {
					// bottom
					textBaseline = !isRotated ? 'top' : 'middle';
					textAlign = !isRotated ? 'center' : 'right';
					labelY = me.top + labelYOffset;
				} else {
					// top
					textBaseline = !isRotated ? 'bottom' : 'middle';
					textAlign = !isRotated ? 'center' : 'left';
					labelY = me.bottom - labelYOffset;
				}

				var xLineValue = getLineValue(me, index, gridLines.offsetGridLines && ticks.length > 1);
				if (xLineValue < me.left) {
					lineColor = 'rgba(0,0,0,0)';
				}
				xLineValue += helpers.aliasPixel(lineWidth);

				labelX = me.getPixelForTick(index) + optionTicks.labelOffset; // x values for optionTicks (need to consider offsetLabel option)

				tx1 = tx2 = x1 = x2 = xLineValue;
				ty1 = yTickStart;
				ty2 = yTickEnd;
				y1 = chartArea.top;
				y2 = chartArea.bottom + axisWidth;
			} else {
				var isLeft = options.position === 'left';
				var labelXOffset;

				if (optionTicks.mirror) {
					textAlign = isLeft ? 'left' : 'right';
					labelXOffset = tickPadding;
				} else {
					textAlign = isLeft ? 'right' : 'left';
					labelXOffset = tl + tickPadding;
				}

				labelX = isLeft ? me.right - labelXOffset : me.left + labelXOffset;

				var yLineValue = getLineValue(me, index, gridLines.offsetGridLines && ticks.length > 1);
				if (yLineValue < me.top) {
					lineColor = 'rgba(0,0,0,0)';
				}
				yLineValue += helpers.aliasPixel(lineWidth);

				labelY = me.getPixelForTick(index) + optionTicks.labelOffset;

				tx1 = xTickStart;
				tx2 = xTickEnd;
				x1 = chartArea.left;
				x2 = chartArea.right + axisWidth;
				ty1 = ty2 = y1 = y2 = yLineValue;
			}

			itemsToDraw.push({
				tx1: tx1,
				ty1: ty1,
				tx2: tx2,
				ty2: ty2,
				x1: x1,
				y1: y1,
				x2: x2,
				y2: y2,
				labelX: labelX,
				labelY: labelY,
				glWidth: lineWidth,
				glColor: lineColor,
				glBorderDash: borderDash,
				glBorderDashOffset: borderDashOffset,
				rotation: -1 * labelRotationRadians,
				label: label,
				major: tick.major,
				textBaseline: textBaseline,
				textAlign: textAlign
			});
		});

		// Draw all of the tick labels, tick marks, and grid lines at the correct places
		helpers.each(itemsToDraw, function(itemToDraw) {
			if (gridLines.display) {
				context.save();
				context.lineWidth = itemToDraw.glWidth;
				context.strokeStyle = itemToDraw.glColor;
				if (context.setLineDash) {
					context.setLineDash(itemToDraw.glBorderDash);
					context.lineDashOffset = itemToDraw.glBorderDashOffset;
				}

				context.beginPath();

				if (gridLines.drawTicks) {
					context.moveTo(itemToDraw.tx1, itemToDraw.ty1);
					context.lineTo(itemToDraw.tx2, itemToDraw.ty2);
				}

				if (gridLines.drawOnChartArea) {
					context.moveTo(itemToDraw.x1, itemToDraw.y1);
					context.lineTo(itemToDraw.x2, itemToDraw.y2);
				}

				context.stroke();
				context.restore();
			}

			if (optionTicks.display) {
				// Make sure we draw text in the correct color and font
				context.save();
				context.translate(itemToDraw.labelX, itemToDraw.labelY);
				context.rotate(itemToDraw.rotation);
				context.font = itemToDraw.major ? majorTickFont.font : tickFont.font;
				context.fillStyle = itemToDraw.major ? majorTickFontColor : tickFontColor;
				context.textBaseline = itemToDraw.textBaseline;
				context.textAlign = itemToDraw.textAlign;

				var label = itemToDraw.label;
				if (helpers.isArray(label)) {
					var lineCount = label.length;
					var lineHeight = tickFont.size * 1.5;
					var y = me.isHorizontal() ? 0 : -lineHeight * (lineCount - 1) / 2;

					for (var i = 0; i < lineCount; ++i) {
						// We just make sure the multiline element is a string here..
						context.fillText('' + label[i], 0, y);
						// apply same lineSpacing as calculated @ L#320
						y += lineHeight;
					}
				} else {
					context.fillText(label, 0, 0);
				}
				context.restore();
			}
		});

		if (scaleLabel.display) {
			// Draw the scale label
			var scaleLabelX;
			var scaleLabelY;
			var rotation = 0;
			var halfLineHeight = parseLineHeight(scaleLabel) / 2;

			if (isHorizontal) {
				scaleLabelX = me.left + ((me.right - me.left) / 2); // midpoint of the width
				scaleLabelY = options.position === 'bottom'
					? me.bottom - halfLineHeight - scaleLabelPadding.bottom
					: me.top + halfLineHeight + scaleLabelPadding.top;
			} else {
				var isLeft = options.position === 'left';
				scaleLabelX = isLeft
					? me.left + halfLineHeight + scaleLabelPadding.top
					: me.right - halfLineHeight - scaleLabelPadding.top;
				scaleLabelY = me.top + ((me.bottom - me.top) / 2);
				rotation = isLeft ? -0.5 * Math.PI : 0.5 * Math.PI;
			}

			context.save();
			context.translate(scaleLabelX, scaleLabelY);
			context.rotate(rotation);
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillStyle = scaleLabelFontColor; // render in correct colour
			context.font = scaleLabelFont.font;
			context.fillText(scaleLabel.labelString, 0, 0);
			context.restore();
		}

		if (gridLines.drawBorder) {
			// Draw the line at the edge of the axis
			context.lineWidth = helpers.valueAtIndexOrDefault(gridLines.lineWidth, 0);
			context.strokeStyle = helpers.valueAtIndexOrDefault(gridLines.color, 0);
			var x1 = me.left;
			var x2 = me.right + axisWidth;
			var y1 = me.top;
			var y2 = me.bottom + axisWidth;

			var aliasPixel = helpers.aliasPixel(context.lineWidth);
			if (isHorizontal) {
				y1 = y2 = options.position === 'top' ? me.bottom : me.top;
				y1 += aliasPixel;
				y2 += aliasPixel;
			} else {
				x1 = x2 = options.position === 'left' ? me.right : me.left;
				x1 += aliasPixel;
				x2 += aliasPixel;
			}

			context.beginPath();
			context.moveTo(x1, y1);
			context.lineTo(x2, y2);
			context.stroke();
		}
	}
});

},{"26":26,"27":27,"35":35,"46":46}],34:[function(require,module,exports){
'use strict';

var defaults = require(26);
var helpers = require(46);
var layouts = require(31);

module.exports = {
	// Scale registration object. Extensions can register new scale types (such as log or DB scales) and then
	// use the new chart options to grab the correct scale
	constructors: {},
	// Use a registration function so that we can move to an ES6 map when we no longer need to support
	// old browsers

	// Scale config defaults
	defaults: {},
	registerScaleType: function(type, scaleConstructor, scaleDefaults) {
		this.constructors[type] = scaleConstructor;
		this.defaults[type] = helpers.clone(scaleDefaults);
	},
	getScaleConstructor: function(type) {
		return this.constructors.hasOwnProperty(type) ? this.constructors[type] : undefined;
	},
	getScaleDefaults: function(type) {
		// Return the scale defaults merged with the global settings so that we always use the latest ones
		return this.defaults.hasOwnProperty(type) ? helpers.merge({}, [defaults.scale, this.defaults[type]]) : {};
	},
	updateScaleDefaults: function(type, additions) {
		var me = this;
		if (me.defaults.hasOwnProperty(type)) {
			me.defaults[type] = helpers.extend(me.defaults[type], additions);
		}
	},
	addScalesToLayout: function(chart) {
		// Adds each scale to the chart.boxes array to be sized accordingly
		helpers.each(chart.scales, function(scale) {
			// Set ILayoutItem parameters for backwards compatibility
			scale.fullWidth = scale.options.fullWidth;
			scale.position = scale.options.position;
			scale.weight = scale.options.weight;
			layouts.addBox(chart, scale);
		});
	}
};

},{"26":26,"31":31,"46":46}],35:[function(require,module,exports){
'use strict';

var helpers = require(46);

/**
 * Namespace to hold static tick generation functions
 * @namespace Chart.Ticks
 */
module.exports = {
	/**
	 * Namespace to hold formatters for different types of ticks
	 * @namespace Chart.Ticks.formatters
	 */
	formatters: {
		/**
		 * Formatter for value labels
		 * @method Chart.Ticks.formatters.values
		 * @param value the value to display
		 * @return {String|Array} the label to display
		 */
		values: function(value) {
			return helpers.isArray(value) ? value : '' + value;
		},

		/**
		 * Formatter for linear numeric ticks
		 * @method Chart.Ticks.formatters.linear
		 * @param tickValue {Number} the value to be formatted
		 * @param index {Number} the position of the tickValue parameter in the ticks array
		 * @param ticks {Array<Number>} the list of ticks being converted
		 * @return {String} string representation of the tickValue parameter
		 */
		linear: function(tickValue, index, ticks) {
			// If we have lots of ticks, don't use the ones
			var delta = ticks.length > 3 ? ticks[2] - ticks[1] : ticks[1] - ticks[0];

			// If we have a number like 2.5 as the delta, figure out how many decimal places we need
			if (Math.abs(delta) > 1) {
				if (tickValue !== Math.floor(tickValue)) {
					// not an integer
					delta = tickValue - Math.floor(tickValue);
				}
			}

			var logDelta = helpers.log10(Math.abs(delta));
			var tickString = '';

			if (tickValue !== 0) {
				var maxTick = Math.max(Math.abs(ticks[0]), Math.abs(ticks[ticks.length - 1]));
				if (maxTick < 1e-4) { // all ticks are small numbers; use scientific notation
					var logTick = helpers.log10(Math.abs(tickValue));
					tickString = tickValue.toExponential(Math.floor(logTick) - Math.floor(logDelta));
				} else {
					var numDecimal = -1 * Math.floor(logDelta);
					numDecimal = Math.max(Math.min(numDecimal, 20), 0); // toFixed has a max of 20 decimal places
					tickString = tickValue.toFixed(numDecimal);
				}
			} else {
				tickString = '0'; // never show decimal places for 0
			}

			return tickString;
		},

		logarithmic: function(tickValue, index, ticks) {
			var remain = tickValue / (Math.pow(10, Math.floor(helpers.log10(tickValue))));

			if (tickValue === 0) {
				return '0';
			} else if (remain === 1 || remain === 2 || remain === 5 || index === 0 || index === ticks.length - 1) {
				return tickValue.toExponential();
			}
			return '';
		}
	}
};

},{"46":46}],36:[function(require,module,exports){
'use strict';

var defaults = require(26);
var Element = require(27);
var helpers = require(46);

defaults._set('global', {
	tooltips: {
		enabled: true,
		custom: null,
		mode: 'nearest',
		position: 'average',
		intersect: true,
		backgroundColor: 'rgba(0,0,0,0.8)',
		titleFontStyle: 'bold',
		titleSpacing: 2,
		titleMarginBottom: 6,
		titleFontColor: '#fff',
		titleAlign: 'left',
		bodySpacing: 2,
		bodyFontColor: '#fff',
		bodyAlign: 'left',
		footerFontStyle: 'bold',
		footerSpacing: 2,
		footerMarginTop: 6,
		footerFontColor: '#fff',
		footerAlign: 'left',
		yPadding: 6,
		xPadding: 6,
		caretPadding: 2,
		caretSize: 5,
		cornerRadius: 6,
		multiKeyBackground: '#fff',
		displayColors: true,
		borderColor: 'rgba(0,0,0,0)',
		borderWidth: 0,
		callbacks: {
			// Args are: (tooltipItems, data)
			beforeTitle: helpers.noop,
			title: function(tooltipItems, data) {
				// Pick first xLabel for now
				var title = '';
				var labels = data.labels;
				var labelCount = labels ? labels.length : 0;

				if (tooltipItems.length > 0) {
					var item = tooltipItems[0];

					if (item.xLabel) {
						title = item.xLabel;
					} else if (labelCount > 0 && item.index < labelCount) {
						title = labels[item.index];
					}
				}

				return title;
			},
			afterTitle: helpers.noop,

			// Args are: (tooltipItems, data)
			beforeBody: helpers.noop,

			// Args are: (tooltipItem, data)
			beforeLabel: helpers.noop,
			label: function(tooltipItem, data) {
				var label = data.datasets[tooltipItem.datasetIndex].label || '';

				if (label) {
					label += ': ';
				}
				label += tooltipItem.yLabel;
				return label;
			},
			labelColor: function(tooltipItem, chart) {
				var meta = chart.getDatasetMeta(tooltipItem.datasetIndex);
				var activeElement = meta.data[tooltipItem.index];
				var view = activeElement._view;
				return {
					borderColor: view.borderColor,
					backgroundColor: view.backgroundColor
				};
			},
			labelTextColor: function() {
				return this._options.bodyFontColor;
			},
			afterLabel: helpers.noop,

			// Args are: (tooltipItems, data)
			afterBody: helpers.noop,

			// Args are: (tooltipItems, data)
			beforeFooter: helpers.noop,
			footer: helpers.noop,
			afterFooter: helpers.noop
		}
	}
});

var positioners = {
	/**
	 * Average mode places the tooltip at the average position of the elements shown
	 * @function Chart.Tooltip.positioners.average
	 * @param elements {ChartElement[]} the elements being displayed in the tooltip
	 * @returns {Point} tooltip position
	 */
	average: function(elements) {
		if (!elements.length) {
			return false;
		}

		var i, len;
		var x = 0;
		var y = 0;
		var count = 0;

		for (i = 0, len = elements.length; i < len; ++i) {
			var el = elements[i];
			if (el && el.hasValue()) {
				var pos = el.tooltipPosition();
				x += pos.x;
				y += pos.y;
				++count;
			}
		}

		return {
			x: Math.round(x / count),
			y: Math.round(y / count)
		};
	},

	/**
	 * Gets the tooltip position nearest of the item nearest to the event position
	 * @function Chart.Tooltip.positioners.nearest
	 * @param elements {Chart.Element[]} the tooltip elements
	 * @param eventPosition {Point} the position of the event in canvas coordinates
	 * @returns {Point} the tooltip position
	 */
	nearest: function(elements, eventPosition) {
		var x = eventPosition.x;
		var y = eventPosition.y;
		var minDistance = Number.POSITIVE_INFINITY;
		var i, len, nearestElement;

		for (i = 0, len = elements.length; i < len; ++i) {
			var el = elements[i];
			if (el && el.hasValue()) {
				var center = el.getCenterPoint();
				var d = helpers.distanceBetweenPoints(eventPosition, center);

				if (d < minDistance) {
					minDistance = d;
					nearestElement = el;
				}
			}
		}

		if (nearestElement) {
			var tp = nearestElement.tooltipPosition();
			x = tp.x;
			y = tp.y;
		}

		return {
			x: x,
			y: y
		};
	}
};

/**
 * Helper method to merge the opacity into a color
 */
function mergeOpacity(colorString, opacity) {
	var color = helpers.color(colorString);
	return color.alpha(opacity * color.alpha()).rgbaString();
}

// Helper to push or concat based on if the 2nd parameter is an array or not
function pushOrConcat(base, toPush) {
	if (toPush) {
		if (helpers.isArray(toPush)) {
			// base = base.concat(toPush);
			Array.prototype.push.apply(base, toPush);
		} else {
			base.push(toPush);
		}
	}

	return base;
}

/**
 * Returns array of strings split by newline
 * @param {String} value - The value to split by newline.
 * @returns {Array} value if newline present - Returned from String split() method
 * @function
 */
function splitNewlines(str) {
	if ((typeof str === 'string' || str instanceof String) && str.indexOf('\n') > -1) {
		return str.split('\n');
	}
	return str;
}


// Private helper to create a tooltip item model
// @param element : the chart element (point, arc, bar) to create the tooltip item for
// @return : new tooltip item
function createTooltipItem(element) {
	var xScale = element._xScale;
	var yScale = element._yScale || element._scale; // handle radar || polarArea charts
	var index = element._index;
	var datasetIndex = element._datasetIndex;

	return {
		xLabel: xScale ? xScale.getLabelForIndex(index, datasetIndex) : '',
		yLabel: yScale ? yScale.getLabelForIndex(index, datasetIndex) : '',
		index: index,
		datasetIndex: datasetIndex,
		x: element._model.x,
		y: element._model.y
	};
}

/**
 * Helper to get the reset model for the tooltip
 * @param tooltipOpts {Object} the tooltip options
 */
function getBaseModel(tooltipOpts) {
	var globalDefaults = defaults.global;
	var valueOrDefault = helpers.valueOrDefault;

	return {
		// Positioning
		xPadding: tooltipOpts.xPadding,
		yPadding: tooltipOpts.yPadding,
		xAlign: tooltipOpts.xAlign,
		yAlign: tooltipOpts.yAlign,

		// Body
		bodyFontColor: tooltipOpts.bodyFontColor,
		_bodyFontFamily: valueOrDefault(tooltipOpts.bodyFontFamily, globalDefaults.defaultFontFamily),
		_bodyFontStyle: valueOrDefault(tooltipOpts.bodyFontStyle, globalDefaults.defaultFontStyle),
		_bodyAlign: tooltipOpts.bodyAlign,
		bodyFontSize: valueOrDefault(tooltipOpts.bodyFontSize, globalDefaults.defaultFontSize),
		bodySpacing: tooltipOpts.bodySpacing,

		// Title
		titleFontColor: tooltipOpts.titleFontColor,
		_titleFontFamily: valueOrDefault(tooltipOpts.titleFontFamily, globalDefaults.defaultFontFamily),
		_titleFontStyle: valueOrDefault(tooltipOpts.titleFontStyle, globalDefaults.defaultFontStyle),
		titleFontSize: valueOrDefault(tooltipOpts.titleFontSize, globalDefaults.defaultFontSize),
		_titleAlign: tooltipOpts.titleAlign,
		titleSpacing: tooltipOpts.titleSpacing,
		titleMarginBottom: tooltipOpts.titleMarginBottom,

		// Footer
		footerFontColor: tooltipOpts.footerFontColor,
		_footerFontFamily: valueOrDefault(tooltipOpts.footerFontFamily, globalDefaults.defaultFontFamily),
		_footerFontStyle: valueOrDefault(tooltipOpts.footerFontStyle, globalDefaults.defaultFontStyle),
		footerFontSize: valueOrDefault(tooltipOpts.footerFontSize, globalDefaults.defaultFontSize),
		_footerAlign: tooltipOpts.footerAlign,
		footerSpacing: tooltipOpts.footerSpacing,
		footerMarginTop: tooltipOpts.footerMarginTop,

		// Appearance
		caretSize: tooltipOpts.caretSize,
		cornerRadius: tooltipOpts.cornerRadius,
		backgroundColor: tooltipOpts.backgroundColor,
		opacity: 0,
		legendColorBackground: tooltipOpts.multiKeyBackground,
		displayColors: tooltipOpts.displayColors,
		borderColor: tooltipOpts.borderColor,
		borderWidth: tooltipOpts.borderWidth
	};
}

/**
 * Get the size of the tooltip
 */
function getTooltipSize(tooltip, model) {
	var ctx = tooltip._chart.ctx;

	var height = model.yPadding * 2; // Tooltip Padding
	var width = 0;

	// Count of all lines in the body
	var body = model.body;
	var combinedBodyLength = body.reduce(function(count, bodyItem) {
		return count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length;
	}, 0);
	combinedBodyLength += model.beforeBody.length + model.afterBody.length;

	var titleLineCount = model.title.length;
	var footerLineCount = model.footer.length;
	var titleFontSize = model.titleFontSize;
	var bodyFontSize = model.bodyFontSize;
	var footerFontSize = model.footerFontSize;

	height += titleLineCount * titleFontSize; // Title Lines
	height += titleLineCount ? (titleLineCount - 1) * model.titleSpacing : 0; // Title Line Spacing
	height += titleLineCount ? model.titleMarginBottom : 0; // Title's bottom Margin
	height += combinedBodyLength * bodyFontSize; // Body Lines
	height += combinedBodyLength ? (combinedBodyLength - 1) * model.bodySpacing : 0; // Body Line Spacing
	height += footerLineCount ? model.footerMarginTop : 0; // Footer Margin
	height += footerLineCount * (footerFontSize); // Footer Lines
	height += footerLineCount ? (footerLineCount - 1) * model.footerSpacing : 0; // Footer Line Spacing

	// Title width
	var widthPadding = 0;
	var maxLineWidth = function(line) {
		width = Math.max(width, ctx.measureText(line).width + widthPadding);
	};

	ctx.font = helpers.fontString(titleFontSize, model._titleFontStyle, model._titleFontFamily);
	helpers.each(model.title, maxLineWidth);

	// Body width
	ctx.font = helpers.fontString(bodyFontSize, model._bodyFontStyle, model._bodyFontFamily);
	helpers.each(model.beforeBody.concat(model.afterBody), maxLineWidth);

	// Body lines may include some extra width due to the color box
	widthPadding = model.displayColors ? (bodyFontSize + 2) : 0;
	helpers.each(body, function(bodyItem) {
		helpers.each(bodyItem.before, maxLineWidth);
		helpers.each(bodyItem.lines, maxLineWidth);
		helpers.each(bodyItem.after, maxLineWidth);
	});

	// Reset back to 0
	widthPadding = 0;

	// Footer width
	ctx.font = helpers.fontString(footerFontSize, model._footerFontStyle, model._footerFontFamily);
	helpers.each(model.footer, maxLineWidth);

	// Add padding
	width += 2 * model.xPadding;

	return {
		width: width,
		height: height
	};
}

/**
 * Helper to get the alignment of a tooltip given the size
 */
function determineAlignment(tooltip, size) {
	var model = tooltip._model;
	var chart = tooltip._chart;
	var chartArea = tooltip._chart.chartArea;
	var xAlign = 'center';
	var yAlign = 'center';

	if (model.y < size.height) {
		yAlign = 'top';
	} else if (model.y > (chart.height - size.height)) {
		yAlign = 'bottom';
	}

	var lf, rf; // functions to determine left, right alignment
	var olf, orf; // functions to determine if left/right alignment causes tooltip to go outside chart
	var yf; // function to get the y alignment if the tooltip goes outside of the left or right edges
	var midX = (chartArea.left + chartArea.right) / 2;
	var midY = (chartArea.top + chartArea.bottom) / 2;

	if (yAlign === 'center') {
		lf = function(x) {
			return x <= midX;
		};
		rf = function(x) {
			return x > midX;
		};
	} else {
		lf = function(x) {
			return x <= (size.width / 2);
		};
		rf = function(x) {
			return x >= (chart.width - (size.width / 2));
		};
	}

	olf = function(x) {
		return x + size.width + model.caretSize + model.caretPadding > chart.width;
	};
	orf = function(x) {
		return x - size.width - model.caretSize - model.caretPadding < 0;
	};
	yf = function(y) {
		return y <= midY ? 'top' : 'bottom';
	};

	if (lf(model.x)) {
		xAlign = 'left';

		// Is tooltip too wide and goes over the right side of the chart.?
		if (olf(model.x)) {
			xAlign = 'center';
			yAlign = yf(model.y);
		}
	} else if (rf(model.x)) {
		xAlign = 'right';

		// Is tooltip too wide and goes outside left edge of canvas?
		if (orf(model.x)) {
			xAlign = 'center';
			yAlign = yf(model.y);
		}
	}

	var opts = tooltip._options;
	return {
		xAlign: opts.xAlign ? opts.xAlign : xAlign,
		yAlign: opts.yAlign ? opts.yAlign : yAlign
	};
}

/**
 * Helper to get the location a tooltip needs to be placed at given the initial position (via the vm) and the size and alignment
 */
function getBackgroundPoint(vm, size, alignment, chart) {
	// Background Position
	var x = vm.x;
	var y = vm.y;

	var caretSize = vm.caretSize;
	var caretPadding = vm.caretPadding;
	var cornerRadius = vm.cornerRadius;
	var xAlign = alignment.xAlign;
	var yAlign = alignment.yAlign;
	var paddingAndSize = caretSize + caretPadding;
	var radiusAndPadding = cornerRadius + caretPadding;

	if (xAlign === 'right') {
		x -= size.width;
	} else if (xAlign === 'center') {
		x -= (size.width / 2);
		if (x + size.width > chart.width) {
			x = chart.width - size.width;
		}
		if (x < 0) {
			x = 0;
		}
	}

	if (yAlign === 'top') {
		y += paddingAndSize;
	} else if (yAlign === 'bottom') {
		y -= size.height + paddingAndSize;
	} else {
		y -= (size.height / 2);
	}

	if (yAlign === 'center') {
		if (xAlign === 'left') {
			x += paddingAndSize;
		} else if (xAlign === 'right') {
			x -= paddingAndSize;
		}
	} else if (xAlign === 'left') {
		x -= radiusAndPadding;
	} else if (xAlign === 'right') {
		x += radiusAndPadding;
	}

	return {
		x: x,
		y: y
	};
}

/**
 * Helper to build before and after body lines
 */
function getBeforeAfterBodyLines(callback) {
	return pushOrConcat([], splitNewlines(callback));
}

var exports = module.exports = Element.extend({
	initialize: function() {
		this._model = getBaseModel(this._options);
		this._lastActive = [];
	},

	// Get the title
	// Args are: (tooltipItem, data)
	getTitle: function() {
		var me = this;
		var opts = me._options;
		var callbacks = opts.callbacks;

		var beforeTitle = callbacks.beforeTitle.apply(me, arguments);
		var title = callbacks.title.apply(me, arguments);
		var afterTitle = callbacks.afterTitle.apply(me, arguments);

		var lines = [];
		lines = pushOrConcat(lines, splitNewlines(beforeTitle));
		lines = pushOrConcat(lines, splitNewlines(title));
		lines = pushOrConcat(lines, splitNewlines(afterTitle));

		return lines;
	},

	// Args are: (tooltipItem, data)
	getBeforeBody: function() {
		return getBeforeAfterBodyLines(this._options.callbacks.beforeBody.apply(this, arguments));
	},

	// Args are: (tooltipItem, data)
	getBody: function(tooltipItems, data) {
		var me = this;
		var callbacks = me._options.callbacks;
		var bodyItems = [];

		helpers.each(tooltipItems, function(tooltipItem) {
			var bodyItem = {
				before: [],
				lines: [],
				after: []
			};
			pushOrConcat(bodyItem.before, splitNewlines(callbacks.beforeLabel.call(me, tooltipItem, data)));
			pushOrConcat(bodyItem.lines, callbacks.label.call(me, tooltipItem, data));
			pushOrConcat(bodyItem.after, splitNewlines(callbacks.afterLabel.call(me, tooltipItem, data)));

			bodyItems.push(bodyItem);
		});

		return bodyItems;
	},

	// Args are: (tooltipItem, data)
	getAfterBody: function() {
		return getBeforeAfterBodyLines(this._options.callbacks.afterBody.apply(this, arguments));
	},

	// Get the footer and beforeFooter and afterFooter lines
	// Args are: (tooltipItem, data)
	getFooter: function() {
		var me = this;
		var callbacks = me._options.callbacks;

		var beforeFooter = callbacks.beforeFooter.apply(me, arguments);
		var footer = callbacks.footer.apply(me, arguments);
		var afterFooter = callbacks.afterFooter.apply(me, arguments);

		var lines = [];
		lines = pushOrConcat(lines, splitNewlines(beforeFooter));
		lines = pushOrConcat(lines, splitNewlines(footer));
		lines = pushOrConcat(lines, splitNewlines(afterFooter));

		return lines;
	},

	update: function(changed) {
		var me = this;
		var opts = me._options;

		// Need to regenerate the model because its faster than using extend and it is necessary due to the optimization in Chart.Element.transition
		// that does _view = _model if ease === 1. This causes the 2nd tooltip update to set properties in both the view and model at the same time
		// which breaks any animations.
		var existingModel = me._model;
		var model = me._model = getBaseModel(opts);
		var active = me._active;

		var data = me._data;

		// In the case where active.length === 0 we need to keep these at existing values for good animations
		var alignment = {
			xAlign: existingModel.xAlign,
			yAlign: existingModel.yAlign
		};
		var backgroundPoint = {
			x: existingModel.x,
			y: existingModel.y
		};
		var tooltipSize = {
			width: existingModel.width,
			height: existingModel.height
		};
		var tooltipPosition = {
			x: existingModel.caretX,
			y: existingModel.caretY
		};

		var i, len;

		if (active.length) {
			model.opacity = 1;

			var labelColors = [];
			var labelTextColors = [];
			tooltipPosition = positioners[opts.position].call(me, active, me._eventPosition);

			var tooltipItems = [];
			for (i = 0, len = active.length; i < len; ++i) {
				tooltipItems.push(createTooltipItem(active[i]));
			}

			// If the user provided a filter function, use it to modify the tooltip items
			if (opts.filter) {
				tooltipItems = tooltipItems.filter(function(a) {
					return opts.filter(a, data);
				});
			}

			// If the user provided a sorting function, use it to modify the tooltip items
			if (opts.itemSort) {
				tooltipItems = tooltipItems.sort(function(a, b) {
					return opts.itemSort(a, b, data);
				});
			}

			// Determine colors for boxes
			helpers.each(tooltipItems, function(tooltipItem) {
				labelColors.push(opts.callbacks.labelColor.call(me, tooltipItem, me._chart));
				labelTextColors.push(opts.callbacks.labelTextColor.call(me, tooltipItem, me._chart));
			});


			// Build the Text Lines
			model.title = me.getTitle(tooltipItems, data);
			model.beforeBody = me.getBeforeBody(tooltipItems, data);
			model.body = me.getBody(tooltipItems, data);
			model.afterBody = me.getAfterBody(tooltipItems, data);
			model.footer = me.getFooter(tooltipItems, data);

			// Initial positioning and colors
			model.x = Math.round(tooltipPosition.x);
			model.y = Math.round(tooltipPosition.y);
			model.caretPadding = opts.caretPadding;
			model.labelColors = labelColors;
			model.labelTextColors = labelTextColors;

			// data points
			model.dataPoints = tooltipItems;

			// We need to determine alignment of the tooltip
			tooltipSize = getTooltipSize(this, model);
			alignment = determineAlignment(this, tooltipSize);
			// Final Size and Position
			backgroundPoint = getBackgroundPoint(model, tooltipSize, alignment, me._chart);
		} else {
			model.opacity = 0;
		}

		model.xAlign = alignment.xAlign;
		model.yAlign = alignment.yAlign;
		model.x = backgroundPoint.x;
		model.y = backgroundPoint.y;
		model.width = tooltipSize.width;
		model.height = tooltipSize.height;

		// Point where the caret on the tooltip points to
		model.caretX = tooltipPosition.x;
		model.caretY = tooltipPosition.y;

		me._model = model;

		if (changed && opts.custom) {
			opts.custom.call(me, model);
		}

		return me;
	},

	drawCaret: function(tooltipPoint, size) {
		var ctx = this._chart.ctx;
		var vm = this._view;
		var caretPosition = this.getCaretPosition(tooltipPoint, size, vm);

		ctx.lineTo(caretPosition.x1, caretPosition.y1);
		ctx.lineTo(caretPosition.x2, caretPosition.y2);
		ctx.lineTo(caretPosition.x3, caretPosition.y3);
	},
	getCaretPosition: function(tooltipPoint, size, vm) {
		var x1, x2, x3, y1, y2, y3;
		var caretSize = vm.caretSize;
		var cornerRadius = vm.cornerRadius;
		var xAlign = vm.xAlign;
		var yAlign = vm.yAlign;
		var ptX = tooltipPoint.x;
		var ptY = tooltipPoint.y;
		var width = size.width;
		var height = size.height;

		if (yAlign === 'center') {
			y2 = ptY + (height / 2);

			if (xAlign === 'left') {
				x1 = ptX;
				x2 = x1 - caretSize;
				x3 = x1;

				y1 = y2 + caretSize;
				y3 = y2 - caretSize;
			} else {
				x1 = ptX + width;
				x2 = x1 + caretSize;
				x3 = x1;

				y1 = y2 - caretSize;
				y3 = y2 + caretSize;
			}
		} else {
			if (xAlign === 'left') {
				x2 = ptX + cornerRadius + (caretSize);
				x1 = x2 - caretSize;
				x3 = x2 + caretSize;
			} else if (xAlign === 'right') {
				x2 = ptX + width - cornerRadius - caretSize;
				x1 = x2 - caretSize;
				x3 = x2 + caretSize;
			} else {
				x2 = vm.caretX;
				x1 = x2 - caretSize;
				x3 = x2 + caretSize;
			}
			if (yAlign === 'top') {
				y1 = ptY;
				y2 = y1 - caretSize;
				y3 = y1;
			} else {
				y1 = ptY + height;
				y2 = y1 + caretSize;
				y3 = y1;
				// invert drawing order
				var tmp = x3;
				x3 = x1;
				x1 = tmp;
			}
		}
		return {x1: x1, x2: x2, x3: x3, y1: y1, y2: y2, y3: y3};
	},

	drawTitle: function(pt, vm, ctx, opacity) {
		var title = vm.title;

		if (title.length) {
			ctx.textAlign = vm._titleAlign;
			ctx.textBaseline = 'top';

			var titleFontSize = vm.titleFontSize;
			var titleSpacing = vm.titleSpacing;

			ctx.fillStyle = mergeOpacity(vm.titleFontColor, opacity);
			ctx.font = helpers.fontString(titleFontSize, vm._titleFontStyle, vm._titleFontFamily);

			var i, len;
			for (i = 0, len = title.length; i < len; ++i) {
				ctx.fillText(title[i], pt.x, pt.y);
				pt.y += titleFontSize + titleSpacing; // Line Height and spacing

				if (i + 1 === title.length) {
					pt.y += vm.titleMarginBottom - titleSpacing; // If Last, add margin, remove spacing
				}
			}
		}
	},

	drawBody: function(pt, vm, ctx, opacity) {
		var bodyFontSize = vm.bodyFontSize;
		var bodySpacing = vm.bodySpacing;
		var body = vm.body;

		ctx.textAlign = vm._bodyAlign;
		ctx.textBaseline = 'top';
		ctx.font = helpers.fontString(bodyFontSize, vm._bodyFontStyle, vm._bodyFontFamily);

		// Before Body
		var xLinePadding = 0;
		var fillLineOfText = function(line) {
			ctx.fillText(line, pt.x + xLinePadding, pt.y);
			pt.y += bodyFontSize + bodySpacing;
		};

		// Before body lines
		ctx.fillStyle = mergeOpacity(vm.bodyFontColor, opacity);
		helpers.each(vm.beforeBody, fillLineOfText);

		var drawColorBoxes = vm.displayColors;
		xLinePadding = drawColorBoxes ? (bodyFontSize + 2) : 0;

		// Draw body lines now
		helpers.each(body, function(bodyItem, i) {
			var textColor = mergeOpacity(vm.labelTextColors[i], opacity);
			ctx.fillStyle = textColor;
			helpers.each(bodyItem.before, fillLineOfText);

			helpers.each(bodyItem.lines, function(line) {
				// Draw Legend-like boxes if needed
				if (drawColorBoxes) {
					// Fill a white rect so that colours merge nicely if the opacity is < 1
					ctx.fillStyle = mergeOpacity(vm.legendColorBackground, opacity);
					ctx.fillRect(pt.x, pt.y, bodyFontSize, bodyFontSize);

					// Border
					ctx.lineWidth = 1;
					ctx.strokeStyle = mergeOpacity(vm.labelColors[i].borderColor, opacity);
					ctx.strokeRect(pt.x, pt.y, bodyFontSize, bodyFontSize);

					// Inner square
					ctx.fillStyle = mergeOpacity(vm.labelColors[i].backgroundColor, opacity);
					ctx.fillRect(pt.x + 1, pt.y + 1, bodyFontSize - 2, bodyFontSize - 2);
					ctx.fillStyle = textColor;
				}

				fillLineOfText(line);
			});

			helpers.each(bodyItem.after, fillLineOfText);
		});

		// Reset back to 0 for after body
		xLinePadding = 0;

		// After body lines
		helpers.each(vm.afterBody, fillLineOfText);
		pt.y -= bodySpacing; // Remove last body spacing
	},

	drawFooter: function(pt, vm, ctx, opacity) {
		var footer = vm.footer;

		if (footer.length) {
			pt.y += vm.footerMarginTop;

			ctx.textAlign = vm._footerAlign;
			ctx.textBaseline = 'top';

			ctx.fillStyle = mergeOpacity(vm.footerFontColor, opacity);
			ctx.font = helpers.fontString(vm.footerFontSize, vm._footerFontStyle, vm._footerFontFamily);

			helpers.each(footer, function(line) {
				ctx.fillText(line, pt.x, pt.y);
				pt.y += vm.footerFontSize + vm.footerSpacing;
			});
		}
	},

	drawBackground: function(pt, vm, ctx, tooltipSize, opacity) {
		ctx.fillStyle = mergeOpacity(vm.backgroundColor, opacity);
		ctx.strokeStyle = mergeOpacity(vm.borderColor, opacity);
		ctx.lineWidth = vm.borderWidth;
		var xAlign = vm.xAlign;
		var yAlign = vm.yAlign;
		var x = pt.x;
		var y = pt.y;
		var width = tooltipSize.width;
		var height = tooltipSize.height;
		var radius = vm.cornerRadius;

		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		if (yAlign === 'top') {
			this.drawCaret(pt, tooltipSize);
		}
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		if (yAlign === 'center' && xAlign === 'right') {
			this.drawCaret(pt, tooltipSize);
		}
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		if (yAlign === 'bottom') {
			this.drawCaret(pt, tooltipSize);
		}
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		if (yAlign === 'center' && xAlign === 'left') {
			this.drawCaret(pt, tooltipSize);
		}
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();

		ctx.fill();

		if (vm.borderWidth > 0) {
			ctx.stroke();
		}
	},

	draw: function() {
		var ctx = this._chart.ctx;
		var vm = this._view;

		if (vm.opacity === 0) {
			return;
		}

		var tooltipSize = {
			width: vm.width,
			height: vm.height
		};
		var pt = {
			x: vm.x,
			y: vm.y
		};

		// IE11/Edge does not like very small opacities, so snap to 0
		var opacity = Math.abs(vm.opacity < 1e-3) ? 0 : vm.opacity;

		// Truthy/falsey value for empty tooltip
		var hasTooltipContent = vm.title.length || vm.beforeBody.length || vm.body.length || vm.afterBody.length || vm.footer.length;

		if (this._options.enabled && hasTooltipContent) {
			// Draw Background
			this.drawBackground(pt, vm, ctx, tooltipSize, opacity);

			// Draw Title, Body, and Footer
			pt.x += vm.xPadding;
			pt.y += vm.yPadding;

			// Titles
			this.drawTitle(pt, vm, ctx, opacity);

			// Body
			this.drawBody(pt, vm, ctx, opacity);

			// Footer
			this.drawFooter(pt, vm, ctx, opacity);
		}
	},

	/**
	 * Handle an event
	 * @private
	 * @param {IEvent} event - The event to handle
	 * @returns {Boolean} true if the tooltip changed
	 */
	handleEvent: function(e) {
		var me = this;
		var options = me._options;
		var changed = false;

		me._lastActive = me._lastActive || [];

		// Find Active Elements for tooltips
		if (e.type === 'mouseout') {
			me._active = [];
		} else {
			me._active = me._chart.getElementsAtEventForMode(e, options.mode, options);
		}

		// Remember Last Actives
		changed = !helpers.arrayEquals(me._active, me._lastActive);

		// Only handle target event on tooltip change
		if (changed) {
			me._lastActive = me._active;

			if (options.enabled || options.custom) {
				me._eventPosition = {
					x: e.x,
					y: e.y
				};

				me.update(true);
				me.pivot();
			}
		}

		return changed;
	}
});

/**
 * @namespace Chart.Tooltip.positioners
 */
exports.positioners = positioners;


},{"26":26,"27":27,"46":46}],37:[function(require,module,exports){
'use strict';

var defaults = require(26);
var Element = require(27);
var helpers = require(46);

defaults._set('global', {
	elements: {
		arc: {
			backgroundColor: defaults.global.defaultColor,
			borderColor: '#fff',
			borderWidth: 2
		}
	}
});

module.exports = Element.extend({
	inLabelRange: function(mouseX) {
		var vm = this._view;

		if (vm) {
			return (Math.pow(mouseX - vm.x, 2) < Math.pow(vm.radius + vm.hoverRadius, 2));
		}
		return false;
	},

	inRange: function(chartX, chartY) {
		var vm = this._view;

		if (vm) {
			var pointRelativePosition = helpers.getAngleFromPoint(vm, {x: chartX, y: chartY});
			var	angle = pointRelativePosition.angle;
			var distance = pointRelativePosition.distance;

			// Sanitise angle range
			var startAngle = vm.startAngle;
			var endAngle = vm.endAngle;
			while (endAngle < startAngle) {
				endAngle += 2.0 * Math.PI;
			}
			while (angle > endAngle) {
				angle -= 2.0 * Math.PI;
			}
			while (angle < startAngle) {
				angle += 2.0 * Math.PI;
			}

			// Check if within the range of the open/close angle
			var betweenAngles = (angle >= startAngle && angle <= endAngle);
			var withinRadius = (distance >= vm.innerRadius && distance <= vm.outerRadius);

			return (betweenAngles && withinRadius);
		}
		return false;
	},

	getCenterPoint: function() {
		var vm = this._view;
		var halfAngle = (vm.startAngle + vm.endAngle) / 2;
		var halfRadius = (vm.innerRadius + vm.outerRadius) / 2;
		return {
			x: vm.x + Math.cos(halfAngle) * halfRadius,
			y: vm.y + Math.sin(halfAngle) * halfRadius
		};
	},

	getArea: function() {
		var vm = this._view;
		return Math.PI * ((vm.endAngle - vm.startAngle) / (2 * Math.PI)) * (Math.pow(vm.outerRadius, 2) - Math.pow(vm.innerRadius, 2));
	},

	tooltipPosition: function() {
		var vm = this._view;
		var centreAngle = vm.startAngle + ((vm.endAngle - vm.startAngle) / 2);
		var rangeFromCentre = (vm.outerRadius - vm.innerRadius) / 2 + vm.innerRadius;

		return {
			x: vm.x + (Math.cos(centreAngle) * rangeFromCentre),
			y: vm.y + (Math.sin(centreAngle) * rangeFromCentre)
		};
	},

	draw: function() {
		var ctx = this._chart.ctx;
		var vm = this._view;
		var sA = vm.startAngle;
		var eA = vm.endAngle;

		ctx.beginPath();

		ctx.arc(vm.x, vm.y, vm.outerRadius, sA, eA);
		ctx.arc(vm.x, vm.y, vm.innerRadius, eA, sA, true);

		ctx.closePath();
		ctx.strokeStyle = vm.borderColor;
		ctx.lineWidth = vm.borderWidth;

		ctx.fillStyle = vm.backgroundColor;

		ctx.fill();
		ctx.lineJoin = 'bevel';

		if (vm.borderWidth) {
			ctx.stroke();
		}
	}
});

},{"26":26,"27":27,"46":46}],38:[function(require,module,exports){
'use strict';

var defaults = require(26);
var Element = require(27);
var helpers = require(46);

var globalDefaults = defaults.global;

defaults._set('global', {
	elements: {
		line: {
			tension: 0.4,
			backgroundColor: globalDefaults.defaultColor,
			borderWidth: 3,
			borderColor: globalDefaults.defaultColor,
			borderCapStyle: 'butt',
			borderDash: [],
			borderDashOffset: 0.0,
			borderJoinStyle: 'miter',
			capBezierPoints: true,
			fill: true, // do we fill in the area between the line and its base axis
		}
	}
});

module.exports = Element.extend({
	draw: function() {
		var me = this;
		var vm = me._view;
		var ctx = me._chart.ctx;
		var spanGaps = vm.spanGaps;
		var points = me._children.slice(); // clone array
		var globalOptionLineElements = globalDefaults.elements.line;
		var lastDrawnIndex = -1;
		var index, current, previous, currentVM;

		// If we are looping, adding the first point again
		if (me._loop && points.length) {
			points.push(points[0]);
		}

		ctx.save();

		// Stroke Line Options
		ctx.lineCap = vm.borderCapStyle || globalOptionLineElements.borderCapStyle;

		// IE 9 and 10 do not support line dash
		if (ctx.setLineDash) {
			ctx.setLineDash(vm.borderDash || globalOptionLineElements.borderDash);
		}

		ctx.lineDashOffset = vm.borderDashOffset || globalOptionLineElements.borderDashOffset;
		ctx.lineJoin = vm.borderJoinStyle || globalOptionLineElements.borderJoinStyle;
		ctx.lineWidth = vm.borderWidth || globalOptionLineElements.borderWidth;
		ctx.strokeStyle = vm.borderColor || globalDefaults.defaultColor;

		// Stroke Line
		ctx.beginPath();
		lastDrawnIndex = -1;

		for (index = 0; index < points.length; ++index) {
			current = points[index];
			previous = helpers.previousItem(points, index);
			currentVM = current._view;

			// First point moves to it's starting position no matter what
			if (index === 0) {
				if (!currentVM.skip) {
					ctx.moveTo(currentVM.x, currentVM.y);
					lastDrawnIndex = index;
				}
			} else {
				previous = lastDrawnIndex === -1 ? previous : points[lastDrawnIndex];

				if (!currentVM.skip) {
					if ((lastDrawnIndex !== (index - 1) && !spanGaps) || lastDrawnIndex === -1) {
						// There was a gap and this is the first point after the gap
						ctx.moveTo(currentVM.x, currentVM.y);
					} else {
						// Line to next point
						helpers.canvas.lineTo(ctx, previous._view, current._view);
					}
					lastDrawnIndex = index;
				}
			}
		}

		ctx.stroke();
		ctx.restore();
	}
});

},{"26":26,"27":27,"46":46}],39:[function(require,module,exports){
'use strict';

var defaults = require(26);
var Element = require(27);
var helpers = require(46);

var defaultColor = defaults.global.defaultColor;

defaults._set('global', {
	elements: {
		point: {
			radius: 3,
			pointStyle: 'circle',
			backgroundColor: defaultColor,
			borderColor: defaultColor,
			borderWidth: 1,
			// Hover
			hitRadius: 1,
			hoverRadius: 4,
			hoverBorderWidth: 1
		}
	}
});

function xRange(mouseX) {
	var vm = this._view;
	return vm ? (Math.abs(mouseX - vm.x) < vm.radius + vm.hitRadius) : false;
}

function yRange(mouseY) {
	var vm = this._view;
	return vm ? (Math.abs(mouseY - vm.y) < vm.radius + vm.hitRadius) : false;
}

module.exports = Element.extend({
	inRange: function(mouseX, mouseY) {
		var vm = this._view;
		return vm ? ((Math.pow(mouseX - vm.x, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(vm.hitRadius + vm.radius, 2)) : false;
	},

	inLabelRange: xRange,
	inXRange: xRange,
	inYRange: yRange,

	getCenterPoint: function() {
		var vm = this._view;
		return {
			x: vm.x,
			y: vm.y
		};
	},

	getArea: function() {
		return Math.PI * Math.pow(this._view.radius, 2);
	},

	tooltipPosition: function() {
		var vm = this._view;
		return {
			x: vm.x,
			y: vm.y,
			padding: vm.radius + vm.borderWidth
		};
	},

	draw: function(chartArea) {
		var vm = this._view;
		var model = this._model;
		var ctx = this._chart.ctx;
		var pointStyle = vm.pointStyle;
		var rotation = vm.rotation;
		var radius = vm.radius;
		var x = vm.x;
		var y = vm.y;
		var errMargin = 1.01; // 1.01 is margin for Accumulated error. (Especially Edge, IE.)

		if (vm.skip) {
			return;
		}

		// Clipping for Points.
		if (chartArea === undefined || (model.x >= chartArea.left && chartArea.right * errMargin >= model.x && model.y >= chartArea.top && chartArea.bottom * errMargin >= model.y)) {
			ctx.strokeStyle = vm.borderColor || defaultColor;
			ctx.lineWidth = helpers.valueOrDefault(vm.borderWidth, defaults.global.elements.point.borderWidth);
			ctx.fillStyle = vm.backgroundColor || defaultColor;
			helpers.canvas.drawPoint(ctx, pointStyle, radius, x, y, rotation);
		}
	}
});

},{"26":26,"27":27,"46":46}],40:[function(require,module,exports){
'use strict';

var defaults = require(26);
var Element = require(27);

defaults._set('global', {
	elements: {
		rectangle: {
			backgroundColor: defaults.global.defaultColor,
			borderColor: defaults.global.defaultColor,
			borderSkipped: 'bottom',
			borderWidth: 0
		}
	}
});

function isVertical(bar) {
	return bar._view.width !== undefined;
}

/**
 * Helper function to get the bounds of the bar regardless of the orientation
 * @param bar {Chart.Element.Rectangle} the bar
 * @return {Bounds} bounds of the bar
 * @private
 */
function getBarBounds(bar) {
	var vm = bar._view;
	var x1, x2, y1, y2;

	if (isVertical(bar)) {
		// vertical
		var halfWidth = vm.width / 2;
		x1 = vm.x - halfWidth;
		x2 = vm.x + halfWidth;
		y1 = Math.min(vm.y, vm.base);
		y2 = Math.max(vm.y, vm.base);
	} else {
		// horizontal bar
		var halfHeight = vm.height / 2;
		x1 = Math.min(vm.x, vm.base);
		x2 = Math.max(vm.x, vm.base);
		y1 = vm.y - halfHeight;
		y2 = vm.y + halfHeight;
	}

	return {
		left: x1,
		top: y1,
		right: x2,
		bottom: y2
	};
}

module.exports = Element.extend({
	draw: function() {
		var ctx = this._chart.ctx;
		var vm = this._view;
		var left, right, top, bottom, signX, signY, borderSkipped;
		var borderWidth = vm.borderWidth;

		if (!vm.horizontal) {
			// bar
			left = vm.x - vm.width / 2;
			right = vm.x + vm.width / 2;
			top = vm.y;
			bottom = vm.base;
			signX = 1;
			signY = bottom > top ? 1 : -1;
			borderSkipped = vm.borderSkipped || 'bottom';
		} else {
			// horizontal bar
			left = vm.base;
			right = vm.x;
			top = vm.y - vm.height / 2;
			bottom = vm.y + vm.height / 2;
			signX = right > left ? 1 : -1;
			signY = 1;
			borderSkipped = vm.borderSkipped || 'left';
		}

		// Canvas doesn't allow us to stroke inside the width so we can
		// adjust the sizes to fit if we're setting a stroke on the line
		if (borderWidth) {
			// borderWidth shold be less than bar width and bar height.
			var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
			borderWidth = borderWidth > barSize ? barSize : borderWidth;
			var halfStroke = borderWidth / 2;
			// Adjust borderWidth when bar top position is near vm.base(zero).
			var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
			var borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
			var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
			var borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
			// not become a vertical line?
			if (borderLeft !== borderRight) {
				top = borderTop;
				bottom = borderBottom;
			}
			// not become a horizontal line?
			if (borderTop !== borderBottom) {
				left = borderLeft;
				right = borderRight;
			}
		}

		ctx.beginPath();
		ctx.fillStyle = vm.backgroundColor;
		ctx.strokeStyle = vm.borderColor;
		ctx.lineWidth = borderWidth;

		// Corner points, from bottom-left to bottom-right clockwise
		// | 1 2 |
		// | 0 3 |
		var corners = [
			[left, bottom],
			[left, top],
			[right, top],
			[right, bottom]
		];

		// Find first (starting) corner with fallback to 'bottom'
		var borders = ['bottom', 'left', 'top', 'right'];
		var startCorner = borders.indexOf(borderSkipped, 0);
		if (startCorner === -1) {
			startCorner = 0;
		}

		function cornerAt(index) {
			return corners[(startCorner + index) % 4];
		}

		// Draw rectangle from 'startCorner'
		var corner = cornerAt(0);
		ctx.moveTo(corner[0], corner[1]);

		for (var i = 1; i < 4; i++) {
			corner = cornerAt(i);
			ctx.lineTo(corner[0], corner[1]);
		}

		ctx.fill();
		if (borderWidth) {
			ctx.stroke();
		}
	},

	height: function() {
		var vm = this._view;
		return vm.base - vm.y;
	},

	inRange: function(mouseX, mouseY) {
		var inRange = false;

		if (this._view) {
			var bounds = getBarBounds(this);
			inRange = mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom;
		}

		return inRange;
	},

	inLabelRange: function(mouseX, mouseY) {
		var me = this;
		if (!me._view) {
			return false;
		}

		var inRange = false;
		var bounds = getBarBounds(me);

		if (isVertical(me)) {
			inRange = mouseX >= bounds.left && mouseX <= bounds.right;
		} else {
			inRange = mouseY >= bounds.top && mouseY <= bounds.bottom;
		}

		return inRange;
	},

	inXRange: function(mouseX) {
		var bounds = getBarBounds(this);
		return mouseX >= bounds.left && mouseX <= bounds.right;
	},

	inYRange: function(mouseY) {
		var bounds = getBarBounds(this);
		return mouseY >= bounds.top && mouseY <= bounds.bottom;
	},

	getCenterPoint: function() {
		var vm = this._view;
		var x, y;
		if (isVertical(this)) {
			x = vm.x;
			y = (vm.y + vm.base) / 2;
		} else {
			x = (vm.x + vm.base) / 2;
			y = vm.y;
		}

		return {x: x, y: y};
	},

	getArea: function() {
		var vm = this._view;
		return vm.width * Math.abs(vm.y - vm.base);
	},

	tooltipPosition: function() {
		var vm = this._view;
		return {
			x: vm.x,
			y: vm.y
		};
	}
});

},{"26":26,"27":27}],41:[function(require,module,exports){
'use strict';

module.exports = {};
module.exports.Arc = require(37);
module.exports.Line = require(38);
module.exports.Point = require(39);
module.exports.Rectangle = require(40);

},{"37":37,"38":38,"39":39,"40":40}],42:[function(require,module,exports){
'use strict';

var helpers = require(43);

/**
 * @namespace Chart.helpers.canvas
 */
var exports = module.exports = {
	/**
	 * Clears the entire canvas associated to the given `chart`.
	 * @param {Chart} chart - The chart for which to clear the canvas.
	 */
	clear: function(chart) {
		chart.ctx.clearRect(0, 0, chart.width, chart.height);
	},

	/**
	 * Creates a "path" for a rectangle with rounded corners at position (x, y) with a
	 * given size (width, height) and the same `radius` for all corners.
	 * @param {CanvasRenderingContext2D} ctx - The canvas 2D Context.
	 * @param {Number} x - The x axis of the coordinate for the rectangle starting point.
	 * @param {Number} y - The y axis of the coordinate for the rectangle starting point.
	 * @param {Number} width - The rectangle's width.
	 * @param {Number} height - The rectangle's height.
	 * @param {Number} radius - The rounded amount (in pixels) for the four corners.
	 * @todo handle `radius` as top-left, top-right, bottom-right, bottom-left array/object?
	 */
	roundedRect: function(ctx, x, y, width, height, radius) {
		if (radius) {
			// NOTE(SB) `epsilon` helps to prevent minor artifacts appearing
			// on Chrome when `r` is exactly half the height or the width.
			var epsilon = 0.0000001;
			var r = Math.min(radius, (height / 2) - epsilon, (width / 2) - epsilon);

			ctx.moveTo(x + r, y);
			ctx.lineTo(x + width - r, y);
			ctx.arcTo(x + width, y, x + width, y + r, r);
			ctx.lineTo(x + width, y + height - r);
			ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
			ctx.lineTo(x + r, y + height);
			ctx.arcTo(x, y + height, x, y + height - r, r);
			ctx.lineTo(x, y + r);
			ctx.arcTo(x, y, x + r, y, r);
			ctx.closePath();
			ctx.moveTo(x, y);
		} else {
			ctx.rect(x, y, width, height);
		}
	},

	drawPoint: function(ctx, style, radius, x, y, rotation) {
		var type, edgeLength, xOffset, yOffset, height, size;
		rotation = rotation || 0;

		if (style && typeof style === 'object') {
			type = style.toString();
			if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
				ctx.drawImage(style, x - style.width / 2, y - style.height / 2, style.width, style.height);
				return;
			}
		}

		if (isNaN(radius) || radius <= 0) {
			return;
		}

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(rotation * Math.PI / 180);
		ctx.beginPath();

		switch (style) {
		// Default includes circle
		default:
			ctx.arc(0, 0, radius, 0, Math.PI * 2);
			ctx.closePath();
			break;
		case 'triangle':
			edgeLength = 3 * radius / Math.sqrt(3);
			height = edgeLength * Math.sqrt(3) / 2;
			ctx.moveTo(-edgeLength / 2, height / 3);
			ctx.lineTo(edgeLength / 2, height / 3);
			ctx.lineTo(0, -2 * height / 3);
			ctx.closePath();
			break;
		case 'rect':
			size = 1 / Math.SQRT2 * radius;
			ctx.rect(-size, -size, 2 * size, 2 * size);
			break;
		case 'rectRounded':
			var offset = radius / Math.SQRT2;
			var leftX = -offset;
			var topY = -offset;
			var sideSize = Math.SQRT2 * radius;

			// NOTE(SB) the rounded rect implementation changed to use `arcTo`
			// instead of `quadraticCurveTo` since it generates better results
			// when rect is almost a circle. 0.425 (instead of 0.5) produces
			// results visually closer to the previous impl.
			this.roundedRect(ctx, leftX, topY, sideSize, sideSize, radius * 0.425);
			break;
		case 'rectRot':
			size = 1 / Math.SQRT2 * radius;
			ctx.moveTo(-size, 0);
			ctx.lineTo(0, size);
			ctx.lineTo(size, 0);
			ctx.lineTo(0, -size);
			ctx.closePath();
			break;
		case 'cross':
			ctx.moveTo(0, radius);
			ctx.lineTo(0, -radius);
			ctx.moveTo(-radius, 0);
			ctx.lineTo(radius, 0);
			break;
		case 'crossRot':
			xOffset = Math.cos(Math.PI / 4) * radius;
			yOffset = Math.sin(Math.PI / 4) * radius;
			ctx.moveTo(-xOffset, -yOffset);
			ctx.lineTo(xOffset, yOffset);
			ctx.moveTo(-xOffset, yOffset);
			ctx.lineTo(xOffset, -yOffset);
			break;
		case 'star':
			ctx.moveTo(0, radius);
			ctx.lineTo(0, -radius);
			ctx.moveTo(-radius, 0);
			ctx.lineTo(radius, 0);
			xOffset = Math.cos(Math.PI / 4) * radius;
			yOffset = Math.sin(Math.PI / 4) * radius;
			ctx.moveTo(-xOffset, -yOffset);
			ctx.lineTo(xOffset, yOffset);
			ctx.moveTo(-xOffset, yOffset);
			ctx.lineTo(xOffset, -yOffset);
			break;
		case 'line':
			ctx.moveTo(-radius, 0);
			ctx.lineTo(radius, 0);
			break;
		case 'dash':
			ctx.moveTo(0, 0);
			ctx.lineTo(radius, 0);
			break;
		}

		ctx.fill();
		ctx.stroke();
		ctx.restore();
	},

	clipArea: function(ctx, area) {
		ctx.save();
		ctx.beginPath();
		ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
		ctx.clip();
	},

	unclipArea: function(ctx) {
		ctx.restore();
	},

	lineTo: function(ctx, previous, target, flip) {
		if (target.steppedLine) {
			if ((target.steppedLine === 'after' && !flip) || (target.steppedLine !== 'after' && flip)) {
				ctx.lineTo(previous.x, target.y);
			} else {
				ctx.lineTo(target.x, previous.y);
			}
			ctx.lineTo(target.x, target.y);
			return;
		}

		if (!target.tension) {
			ctx.lineTo(target.x, target.y);
			return;
		}

		ctx.bezierCurveTo(
			flip ? previous.controlPointPreviousX : previous.controlPointNextX,
			flip ? previous.controlPointPreviousY : previous.controlPointNextY,
			flip ? target.controlPointNextX : target.controlPointPreviousX,
			flip ? target.controlPointNextY : target.controlPointPreviousY,
			target.x,
			target.y);
	}
};

// DEPRECATIONS

/**
 * Provided for backward compatibility, use Chart.helpers.canvas.clear instead.
 * @namespace Chart.helpers.clear
 * @deprecated since version 2.7.0
 * @todo remove at version 3
 * @private
 */
helpers.clear = exports.clear;

/**
 * Provided for backward compatibility, use Chart.helpers.canvas.roundedRect instead.
 * @namespace Chart.helpers.drawRoundedRectangle
 * @deprecated since version 2.7.0
 * @todo remove at version 3
 * @private
 */
helpers.drawRoundedRectangle = function(ctx) {
	ctx.beginPath();
	exports.roundedRect.apply(exports, arguments);
};

},{"43":43}],43:[function(require,module,exports){
'use strict';

/**
 * @namespace Chart.helpers
 */
var helpers = {
	/**
	 * An empty function that can be used, for example, for optional callback.
	 */
	noop: function() {},

	/**
	 * Returns a unique id, sequentially generated from a global variable.
	 * @returns {Number}
	 * @function
	 */
	uid: (function() {
		var id = 0;
		return function() {
			return id++;
		};
	}()),

	/**
	 * Returns true if `value` is neither null nor undefined, else returns false.
	 * @param {*} value - The value to test.
	 * @returns {Boolean}
	 * @since 2.7.0
	 */
	isNullOrUndef: function(value) {
		return value === null || typeof value === 'undefined';
	},

	/**
	 * Returns true if `value` is an array, else returns false.
	 * @param {*} value - The value to test.
	 * @returns {Boolean}
	 * @function
	 */
	isArray: Array.isArray ? Array.isArray : function(value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	},

	/**
	 * Returns true if `value` is an object (excluding null), else returns false.
	 * @param {*} value - The value to test.
	 * @returns {Boolean}
	 * @since 2.7.0
	 */
	isObject: function(value) {
		return value !== null && Object.prototype.toString.call(value) === '[object Object]';
	},

	/**
	 * Returns `value` if defined, else returns `defaultValue`.
	 * @param {*} value - The value to return if defined.
	 * @param {*} defaultValue - The value to return if `value` is undefined.
	 * @returns {*}
	 */
	valueOrDefault: function(value, defaultValue) {
		return typeof value === 'undefined' ? defaultValue : value;
	},

	/**
	 * Returns value at the given `index` in array if defined, else returns `defaultValue`.
	 * @param {Array} value - The array to lookup for value at `index`.
	 * @param {Number} index - The index in `value` to lookup for value.
	 * @param {*} defaultValue - The value to return if `value[index]` is undefined.
	 * @returns {*}
	 */
	valueAtIndexOrDefault: function(value, index, defaultValue) {
		return helpers.valueOrDefault(helpers.isArray(value) ? value[index] : value, defaultValue);
	},

	/**
	 * Calls `fn` with the given `args` in the scope defined by `thisArg` and returns the
	 * value returned by `fn`. If `fn` is not a function, this method returns undefined.
	 * @param {Function} fn - The function to call.
	 * @param {Array|undefined|null} args - The arguments with which `fn` should be called.
	 * @param {Object} [thisArg] - The value of `this` provided for the call to `fn`.
	 * @returns {*}
	 */
	callback: function(fn, args, thisArg) {
		if (fn && typeof fn.call === 'function') {
			return fn.apply(thisArg, args);
		}
	},

	/**
	 * Note(SB) for performance sake, this method should only be used when loopable type
	 * is unknown or in none intensive code (not called often and small loopable). Else
	 * it's preferable to use a regular for() loop and save extra function calls.
	 * @param {Object|Array} loopable - The object or array to be iterated.
	 * @param {Function} fn - The function to call for each item.
	 * @param {Object} [thisArg] - The value of `this` provided for the call to `fn`.
	 * @param {Boolean} [reverse] - If true, iterates backward on the loopable.
	 */
	each: function(loopable, fn, thisArg, reverse) {
		var i, len, keys;
		if (helpers.isArray(loopable)) {
			len = loopable.length;
			if (reverse) {
				for (i = len - 1; i >= 0; i--) {
					fn.call(thisArg, loopable[i], i);
				}
			} else {
				for (i = 0; i < len; i++) {
					fn.call(thisArg, loopable[i], i);
				}
			}
		} else if (helpers.isObject(loopable)) {
			keys = Object.keys(loopable);
			len = keys.length;
			for (i = 0; i < len; i++) {
				fn.call(thisArg, loopable[keys[i]], keys[i]);
			}
		}
	},

	/**
	 * Returns true if the `a0` and `a1` arrays have the same content, else returns false.
	 * @see http://stackoverflow.com/a/14853974
	 * @param {Array} a0 - The array to compare
	 * @param {Array} a1 - The array to compare
	 * @returns {Boolean}
	 */
	arrayEquals: function(a0, a1) {
		var i, ilen, v0, v1;

		if (!a0 || !a1 || a0.length !== a1.length) {
			return false;
		}

		for (i = 0, ilen = a0.length; i < ilen; ++i) {
			v0 = a0[i];
			v1 = a1[i];

			if (v0 instanceof Array && v1 instanceof Array) {
				if (!helpers.arrayEquals(v0, v1)) {
					return false;
				}
			} else if (v0 !== v1) {
				// NOTE: two different object instances will never be equal: {x:20} != {x:20}
				return false;
			}
		}

		return true;
	},

	/**
	 * Returns a deep copy of `source` without keeping references on objects and arrays.
	 * @param {*} source - The value to clone.
	 * @returns {*}
	 */
	clone: function(source) {
		if (helpers.isArray(source)) {
			return source.map(helpers.clone);
		}

		if (helpers.isObject(source)) {
			var target = {};
			var keys = Object.keys(source);
			var klen = keys.length;
			var k = 0;

			for (; k < klen; ++k) {
				target[keys[k]] = helpers.clone(source[keys[k]]);
			}

			return target;
		}

		return source;
	},

	/**
	 * The default merger when Chart.helpers.merge is called without merger option.
	 * Note(SB): this method is also used by configMerge and scaleMerge as fallback.
	 * @private
	 */
	_merger: function(key, target, source, options) {
		var tval = target[key];
		var sval = source[key];

		if (helpers.isObject(tval) && helpers.isObject(sval)) {
			helpers.merge(tval, sval, options);
		} else {
			target[key] = helpers.clone(sval);
		}
	},

	/**
	 * Merges source[key] in target[key] only if target[key] is undefined.
	 * @private
	 */
	_mergerIf: function(key, target, source) {
		var tval = target[key];
		var sval = source[key];

		if (helpers.isObject(tval) && helpers.isObject(sval)) {
			helpers.mergeIf(tval, sval);
		} else if (!target.hasOwnProperty(key)) {
			target[key] = helpers.clone(sval);
		}
	},

	/**
	 * Recursively deep copies `source` properties into `target` with the given `options`.
	 * IMPORTANT: `target` is not cloned and will be updated with `source` properties.
	 * @param {Object} target - The target object in which all sources are merged into.
	 * @param {Object|Array(Object)} source - Object(s) to merge into `target`.
	 * @param {Object} [options] - Merging options:
	 * @param {Function} [options.merger] - The merge method (key, target, source, options)
	 * @returns {Object} The `target` object.
	 */
	merge: function(target, source, options) {
		var sources = helpers.isArray(source) ? source : [source];
		var ilen = sources.length;
		var merge, i, keys, klen, k;

		if (!helpers.isObject(target)) {
			return target;
		}

		options = options || {};
		merge = options.merger || helpers._merger;

		for (i = 0; i < ilen; ++i) {
			source = sources[i];
			if (!helpers.isObject(source)) {
				continue;
			}

			keys = Object.keys(source);
			for (k = 0, klen = keys.length; k < klen; ++k) {
				merge(keys[k], target, source, options);
			}
		}

		return target;
	},

	/**
	 * Recursively deep copies `source` properties into `target` *only* if not defined in target.
	 * IMPORTANT: `target` is not cloned and will be updated with `source` properties.
	 * @param {Object} target - The target object in which all sources are merged into.
	 * @param {Object|Array(Object)} source - Object(s) to merge into `target`.
	 * @returns {Object} The `target` object.
	 */
	mergeIf: function(target, source) {
		return helpers.merge(target, source, {merger: helpers._mergerIf});
	},

	/**
	 * Applies the contents of two or more objects together into the first object.
	 * @param {Object} target - The target object in which all objects are merged into.
	 * @param {Object} arg1 - Object containing additional properties to merge in target.
	 * @param {Object} argN - Additional objects containing properties to merge in target.
	 * @returns {Object} The `target` object.
	 */
	extend: function(target) {
		var setFn = function(value, key) {
			target[key] = value;
		};
		for (var i = 1, ilen = arguments.length; i < ilen; ++i) {
			helpers.each(arguments[i], setFn);
		}
		return target;
	},

	/**
	 * Basic javascript inheritance based on the model created in Backbone.js
	 */
	inherits: function(extensions) {
		var me = this;
		var ChartElement = (extensions && extensions.hasOwnProperty('constructor')) ? extensions.constructor : function() {
			return me.apply(this, arguments);
		};

		var Surrogate = function() {
			this.constructor = ChartElement;
		};

		Surrogate.prototype = me.prototype;
		ChartElement.prototype = new Surrogate();
		ChartElement.extend = helpers.inherits;

		if (extensions) {
			helpers.extend(ChartElement.prototype, extensions);
		}

		ChartElement.__super__ = me.prototype;
		return ChartElement;
	}
};

module.exports = helpers;

// DEPRECATIONS

/**
 * Provided for backward compatibility, use Chart.helpers.callback instead.
 * @function Chart.helpers.callCallback
 * @deprecated since version 2.6.0
 * @todo remove at version 3
 * @private
 */
helpers.callCallback = helpers.callback;

/**
 * Provided for backward compatibility, use Array.prototype.indexOf instead.
 * Array.prototype.indexOf compatibility: Chrome, Opera, Safari, FF1.5+, IE9+
 * @function Chart.helpers.indexOf
 * @deprecated since version 2.7.0
 * @todo remove at version 3
 * @private
 */
helpers.indexOf = function(array, item, fromIndex) {
	return Array.prototype.indexOf.call(array, item, fromIndex);
};

/**
 * Provided for backward compatibility, use Chart.helpers.valueOrDefault instead.
 * @function Chart.helpers.getValueOrDefault
 * @deprecated since version 2.7.0
 * @todo remove at version 3
 * @private
 */
helpers.getValueOrDefault = helpers.valueOrDefault;

/**
 * Provided for backward compatibility, use Chart.helpers.valueAtIndexOrDefault instead.
 * @function Chart.helpers.getValueAtIndexOrDefault
 * @deprecated since version 2.7.0
 * @todo remove at version 3
 * @private
 */
helpers.getValueAtIndexOrDefault = helpers.valueAtIndexOrDefault;

},{}],44:[function(require,module,exports){
'use strict';

var helpers = require(43);

/**
 * Easing functions adapted from Robert Penner's easing equations.
 * @namespace Chart.helpers.easingEffects
 * @see http://www.robertpenner.com/easing/
 */
var effects = {
	linear: function(t) {
		return t;
	},

	easeInQuad: function(t) {
		return t * t;
	},

	easeOutQuad: function(t) {
		return -t * (t - 2);
	},

	easeInOutQuad: function(t) {
		if ((t /= 0.5) < 1) {
			return 0.5 * t * t;
		}
		return -0.5 * ((--t) * (t - 2) - 1);
	},

	easeInCubic: function(t) {
		return t * t * t;
	},

	easeOutCubic: function(t) {
		return (t = t - 1) * t * t + 1;
	},

	easeInOutCubic: function(t) {
		if ((t /= 0.5) < 1) {
			return 0.5 * t * t * t;
		}
		return 0.5 * ((t -= 2) * t * t + 2);
	},

	easeInQuart: function(t) {
		return t * t * t * t;
	},

	easeOutQuart: function(t) {
		return -((t = t - 1) * t * t * t - 1);
	},

	easeInOutQuart: function(t) {
		if ((t /= 0.5) < 1) {
			return 0.5 * t * t * t * t;
		}
		return -0.5 * ((t -= 2) * t * t * t - 2);
	},

	easeInQuint: function(t) {
		return t * t * t * t * t;
	},

	easeOutQuint: function(t) {
		return (t = t - 1) * t * t * t * t + 1;
	},

	easeInOutQuint: function(t) {
		if ((t /= 0.5) < 1) {
			return 0.5 * t * t * t * t * t;
		}
		return 0.5 * ((t -= 2) * t * t * t * t + 2);
	},

	easeInSine: function(t) {
		return -Math.cos(t * (Math.PI / 2)) + 1;
	},

	easeOutSine: function(t) {
		return Math.sin(t * (Math.PI / 2));
	},

	easeInOutSine: function(t) {
		return -0.5 * (Math.cos(Math.PI * t) - 1);
	},

	easeInExpo: function(t) {
		return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
	},

	easeOutExpo: function(t) {
		return (t === 1) ? 1 : -Math.pow(2, -10 * t) + 1;
	},

	easeInOutExpo: function(t) {
		if (t === 0) {
			return 0;
		}
		if (t === 1) {
			return 1;
		}
		if ((t /= 0.5) < 1) {
			return 0.5 * Math.pow(2, 10 * (t - 1));
		}
		return 0.5 * (-Math.pow(2, -10 * --t) + 2);
	},

	easeInCirc: function(t) {
		if (t >= 1) {
			return t;
		}
		return -(Math.sqrt(1 - t * t) - 1);
	},

	easeOutCirc: function(t) {
		return Math.sqrt(1 - (t = t - 1) * t);
	},

	easeInOutCirc: function(t) {
		if ((t /= 0.5) < 1) {
			return -0.5 * (Math.sqrt(1 - t * t) - 1);
		}
		return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
	},

	easeInElastic: function(t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t === 0) {
			return 0;
		}
		if (t === 1) {
			return 1;
		}
		if (!p) {
			p = 0.3;
		}
		if (a < 1) {
			a = 1;
			s = p / 4;
		} else {
			s = p / (2 * Math.PI) * Math.asin(1 / a);
		}
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
	},

	easeOutElastic: function(t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t === 0) {
			return 0;
		}
		if (t === 1) {
			return 1;
		}
		if (!p) {
			p = 0.3;
		}
		if (a < 1) {
			a = 1;
			s = p / 4;
		} else {
			s = p / (2 * Math.PI) * Math.asin(1 / a);
		}
		return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
	},

	easeInOutElastic: function(t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t === 0) {
			return 0;
		}
		if ((t /= 0.5) === 2) {
			return 1;
		}
		if (!p) {
			p = 0.45;
		}
		if (a < 1) {
			a = 1;
			s = p / 4;
		} else {
			s = p / (2 * Math.PI) * Math.asin(1 / a);
		}
		if (t < 1) {
			return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
		}
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
	},
	easeInBack: function(t) {
		var s = 1.70158;
		return t * t * ((s + 1) * t - s);
	},

	easeOutBack: function(t) {
		var s = 1.70158;
		return (t = t - 1) * t * ((s + 1) * t + s) + 1;
	},

	easeInOutBack: function(t) {
		var s = 1.70158;
		if ((t /= 0.5) < 1) {
			return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s));
		}
		return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
	},

	easeInBounce: function(t) {
		return 1 - effects.easeOutBounce(1 - t);
	},

	easeOutBounce: function(t) {
		if (t < (1 / 2.75)) {
			return 7.5625 * t * t;
		}
		if (t < (2 / 2.75)) {
			return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
		}
		if (t < (2.5 / 2.75)) {
			return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
		}
		return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
	},

	easeInOutBounce: function(t) {
		if (t < 0.5) {
			return effects.easeInBounce(t * 2) * 0.5;
		}
		return effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
	}
};

module.exports = {
	effects: effects
};

// DEPRECATIONS

/**
 * Provided for backward compatibility, use Chart.helpers.easing.effects instead.
 * @function Chart.helpers.easingEffects
 * @deprecated since version 2.7.0
 * @todo remove at version 3
 * @private
 */
helpers.easingEffects = effects;

},{"43":43}],45:[function(require,module,exports){
'use strict';

var helpers = require(43);

/**
 * @alias Chart.helpers.options
 * @namespace
 */
module.exports = {
	/**
	 * Converts the given line height `value` in pixels for a specific font `size`.
	 * @param {Number|String} value - The lineHeight to parse (eg. 1.6, '14px', '75%', '1.6em').
	 * @param {Number} size - The font size (in pixels) used to resolve relative `value`.
	 * @returns {Number} The effective line height in pixels (size * 1.2 if value is invalid).
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
	 * @since 2.7.0
	 */
	toLineHeight: function(value, size) {
		var matches = ('' + value).match(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
		if (!matches || matches[1] === 'normal') {
			return size * 1.2;
		}

		value = +matches[2];

		switch (matches[3]) {
		case 'px':
			return value;
		case '%':
			value /= 100;
			break;
		default:
			break;
		}

		return size * value;
	},

	/**
	 * Converts the given value into a padding object with pre-computed width/height.
	 * @param {Number|Object} value - If a number, set the value to all TRBL component,
	 *  else, if and object, use defined properties and sets undefined ones to 0.
	 * @returns {Object} The padding values (top, right, bottom, left, width, height)
	 * @since 2.7.0
	 */
	toPadding: function(value) {
		var t, r, b, l;

		if (helpers.isObject(value)) {
			t = +value.top || 0;
			r = +value.right || 0;
			b = +value.bottom || 0;
			l = +value.left || 0;
		} else {
			t = r = b = l = +value || 0;
		}

		return {
			top: t,
			right: r,
			bottom: b,
			left: l,
			height: t + b,
			width: l + r
		};
	},

	/**
	 * Evaluates the given `inputs` sequentially and returns the first defined value.
	 * @param {Array[]} inputs - An array of values, falling back to the last value.
	 * @param {Object} [context] - If defined and the current value is a function, the value
	 * is called with `context` as first argument and the result becomes the new input.
	 * @param {Number} [index] - If defined and the current value is an array, the value
	 * at `index` become the new input.
	 * @since 2.7.0
	 */
	resolve: function(inputs, context, index) {
		var i, ilen, value;

		for (i = 0, ilen = inputs.length; i < ilen; ++i) {
			value = inputs[i];
			if (value === undefined) {
				continue;
			}
			if (context !== undefined && typeof value === 'function') {
				value = value(context);
			}
			if (index !== undefined && helpers.isArray(value)) {
				value = value[index];
			}
			if (value !== undefined) {
				return value;
			}
		}
	}
};

},{"43":43}],46:[function(require,module,exports){
'use strict';

module.exports = require(43);
module.exports.easing = require(44);
module.exports.canvas = require(42);
module.exports.options = require(45);

},{"42":42,"43":43,"44":44,"45":45}],47:[function(require,module,exports){
/**
 * Platform fallback implementation (minimal).
 * @see https://github.com/chartjs/Chart.js/pull/4591#issuecomment-319575939
 */

module.exports = {
	acquireContext: function(item) {
		if (item && item.canvas) {
			// Support for any object associated to a canvas (including a context2d)
			item = item.canvas;
		}

		return item && item.getContext('2d') || null;
	}
};

},{}],48:[function(require,module,exports){
/**
 * Chart.Platform implementation for targeting a web browser
 */

'use strict';

var helpers = require(46);

var EXPANDO_KEY = '$chartjs';
var CSS_PREFIX = 'chartjs-';
var CSS_RENDER_MONITOR = CSS_PREFIX + 'render-monitor';
var CSS_RENDER_ANIMATION = CSS_PREFIX + 'render-animation';
var ANIMATION_START_EVENTS = ['animationstart', 'webkitAnimationStart'];

/**
 * DOM event types -> Chart.js event types.
 * Note: only events with different types are mapped.
 * @see https://developer.mozilla.org/en-US/docs/Web/Events
 */
var EVENT_TYPES = {
	touchstart: 'mousedown',
	touchmove: 'mousemove',
	touchend: 'mouseup',
	pointerenter: 'mouseenter',
	pointerdown: 'mousedown',
	pointermove: 'mousemove',
	pointerup: 'mouseup',
	pointerleave: 'mouseout',
	pointerout: 'mouseout'
};

/**
 * The "used" size is the final value of a dimension property after all calculations have
 * been performed. This method uses the computed style of `element` but returns undefined
 * if the computed style is not expressed in pixels. That can happen in some cases where
 * `element` has a size relative to its parent and this last one is not yet displayed,
 * for example because of `display: none` on a parent node.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 * @returns {Number} Size in pixels or undefined if unknown.
 */
function readUsedSize(element, property) {
	var value = helpers.getStyle(element, property);
	var matches = value && value.match(/^(\d+)(\.\d+)?px$/);
	return matches ? Number(matches[1]) : undefined;
}

/**
 * Initializes the canvas style and render size without modifying the canvas display size,
 * since responsiveness is handled by the controller.resize() method. The config is used
 * to determine the aspect ratio to apply in case no explicit height has been specified.
 */
function initCanvas(canvas, config) {
	var style = canvas.style;

	// NOTE(SB) canvas.getAttribute('width') !== canvas.width: in the first case it
	// returns null or '' if no explicit value has been set to the canvas attribute.
	var renderHeight = canvas.getAttribute('height');
	var renderWidth = canvas.getAttribute('width');

	// Chart.js modifies some canvas values that we want to restore on destroy
	canvas[EXPANDO_KEY] = {
		initial: {
			height: renderHeight,
			width: renderWidth,
			style: {
				display: style.display,
				height: style.height,
				width: style.width
			}
		}
	};

	// Force canvas to display as block to avoid extra space caused by inline
	// elements, which would interfere with the responsive resize process.
	// https://github.com/chartjs/Chart.js/issues/2538
	style.display = style.display || 'block';

	if (renderWidth === null || renderWidth === '') {
		var displayWidth = readUsedSize(canvas, 'width');
		if (displayWidth !== undefined) {
			canvas.width = displayWidth;
		}
	}

	if (renderHeight === null || renderHeight === '') {
		if (canvas.style.height === '') {
			// If no explicit render height and style height, let's apply the aspect ratio,
			// which one can be specified by the user but also by charts as default option
			// (i.e. options.aspectRatio). If not specified, use canvas aspect ratio of 2.
			canvas.height = canvas.width / (config.options.aspectRatio || 2);
		} else {
			var displayHeight = readUsedSize(canvas, 'height');
			if (displayWidth !== undefined) {
				canvas.height = displayHeight;
			}
		}
	}

	return canvas;
}

/**
 * Detects support for options object argument in addEventListener.
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
 * @private
 */
var supportsEventListenerOptions = (function() {
	var supports = false;
	try {
		var options = Object.defineProperty({}, 'passive', {
			get: function() {
				supports = true;
			}
		});
		window.addEventListener('e', null, options);
	} catch (e) {
		// continue regardless of error
	}
	return supports;
}());

// Default passive to true as expected by Chrome for 'touchstart' and 'touchend' events.
// https://github.com/chartjs/Chart.js/issues/4287
var eventListenerOptions = supportsEventListenerOptions ? {passive: true} : false;

function addEventListener(node, type, listener) {
	node.addEventListener(type, listener, eventListenerOptions);
}

function removeEventListener(node, type, listener) {
	node.removeEventListener(type, listener, eventListenerOptions);
}

function createEvent(type, chart, x, y, nativeEvent) {
	return {
		type: type,
		chart: chart,
		native: nativeEvent || null,
		x: x !== undefined ? x : null,
		y: y !== undefined ? y : null,
	};
}

function fromNativeEvent(event, chart) {
	var type = EVENT_TYPES[event.type] || event.type;
	var pos = helpers.getRelativePosition(event, chart);
	return createEvent(type, chart, pos.x, pos.y, event);
}

function throttled(fn, thisArg) {
	var ticking = false;
	var args = [];

	return function() {
		args = Array.prototype.slice.call(arguments);
		thisArg = thisArg || this;

		if (!ticking) {
			ticking = true;
			helpers.requestAnimFrame.call(window, function() {
				ticking = false;
				fn.apply(thisArg, args);
			});
		}
	};
}

// Implementation based on https://github.com/marcj/css-element-queries
function createResizer(handler) {
	var resizer = document.createElement('div');
	var cls = CSS_PREFIX + 'size-monitor';
	var maxSize = 1000000;
	var style =
		'position:absolute;' +
		'left:0;' +
		'top:0;' +
		'right:0;' +
		'bottom:0;' +
		'overflow:hidden;' +
		'pointer-events:none;' +
		'visibility:hidden;' +
		'z-index:-1;';

	resizer.style.cssText = style;
	resizer.className = cls;
	resizer.innerHTML =
		'<div class="' + cls + '-expand" style="' + style + '">' +
			'<div style="' +
				'position:absolute;' +
				'width:' + maxSize + 'px;' +
				'height:' + maxSize + 'px;' +
				'left:0;' +
				'top:0">' +
			'</div>' +
		'</div>' +
		'<div class="' + cls + '-shrink" style="' + style + '">' +
			'<div style="' +
				'position:absolute;' +
				'width:200%;' +
				'height:200%;' +
				'left:0; ' +
				'top:0">' +
			'</div>' +
		'</div>';

	var expand = resizer.childNodes[0];
	var shrink = resizer.childNodes[1];

	resizer._reset = function() {
		expand.scrollLeft = maxSize;
		expand.scrollTop = maxSize;
		shrink.scrollLeft = maxSize;
		shrink.scrollTop = maxSize;
	};
	var onScroll = function() {
		resizer._reset();
		handler();
	};

	addEventListener(expand, 'scroll', onScroll.bind(expand, 'expand'));
	addEventListener(shrink, 'scroll', onScroll.bind(shrink, 'shrink'));

	return resizer;
}

// https://davidwalsh.name/detect-node-insertion
function watchForRender(node, handler) {
	var expando = node[EXPANDO_KEY] || (node[EXPANDO_KEY] = {});
	var proxy = expando.renderProxy = function(e) {
		if (e.animationName === CSS_RENDER_ANIMATION) {
			handler();
		}
	};

	helpers.each(ANIMATION_START_EVENTS, function(type) {
		addEventListener(node, type, proxy);
	});

	// #4737: Chrome might skip the CSS animation when the CSS_RENDER_MONITOR class
	// is removed then added back immediately (same animation frame?). Accessing the
	// `offsetParent` property will force a reflow and re-evaluate the CSS animation.
	// https://gist.github.com/paulirish/5d52fb081b3570c81e3a#box-metrics
	// https://github.com/chartjs/Chart.js/issues/4737
	expando.reflow = !!node.offsetParent;

	node.classList.add(CSS_RENDER_MONITOR);
}

function unwatchForRender(node) {
	var expando = node[EXPANDO_KEY] || {};
	var proxy = expando.renderProxy;

	if (proxy) {
		helpers.each(ANIMATION_START_EVENTS, function(type) {
			removeEventListener(node, type, proxy);
		});

		delete expando.renderProxy;
	}

	node.classList.remove(CSS_RENDER_MONITOR);
}

function addResizeListener(node, listener, chart) {
	var expando = node[EXPANDO_KEY] || (node[EXPANDO_KEY] = {});

	// Let's keep track of this added resizer and thus avoid DOM query when removing it.
	var resizer = expando.resizer = createResizer(throttled(function() {
		if (expando.resizer) {
			return listener(createEvent('resize', chart));
		}
	}));

	// The resizer needs to be attached to the node parent, so we first need to be
	// sure that `node` is attached to the DOM before injecting the resizer element.
	watchForRender(node, function() {
		if (expando.resizer) {
			var container = node.parentNode;
			if (container && container !== resizer.parentNode) {
				container.insertBefore(resizer, container.firstChild);
			}

			// The container size might have changed, let's reset the resizer state.
			resizer._reset();
		}
	});
}

function removeResizeListener(node) {
	var expando = node[EXPANDO_KEY] || {};
	var resizer = expando.resizer;

	delete expando.resizer;
	unwatchForRender(node);

	if (resizer && resizer.parentNode) {
		resizer.parentNode.removeChild(resizer);
	}
}

function injectCSS(platform, css) {
	// http://stackoverflow.com/q/3922139
	var style = platform._style || document.createElement('style');
	if (!platform._style) {
		platform._style = style;
		css = '/* Chart.js */\n' + css;
		style.setAttribute('type', 'text/css');
		document.getElementsByTagName('head')[0].appendChild(style);
	}

	style.appendChild(document.createTextNode(css));
}

module.exports = {
	/**
	 * This property holds whether this platform is enabled for the current environment.
	 * Currently used by platform.js to select the proper implementation.
	 * @private
	 */
	_enabled: typeof window !== 'undefined' && typeof document !== 'undefined',

	initialize: function() {
		var keyframes = 'from{opacity:0.99}to{opacity:1}';

		injectCSS(this,
			// DOM rendering detection
			// https://davidwalsh.name/detect-node-insertion
			'@-webkit-keyframes ' + CSS_RENDER_ANIMATION + '{' + keyframes + '}' +
			'@keyframes ' + CSS_RENDER_ANIMATION + '{' + keyframes + '}' +
			'.' + CSS_RENDER_MONITOR + '{' +
				'-webkit-animation:' + CSS_RENDER_ANIMATION + ' 0.001s;' +
				'animation:' + CSS_RENDER_ANIMATION + ' 0.001s;' +
			'}'
		);
	},

	acquireContext: function(item, config) {
		if (typeof item === 'string') {
			item = document.getElementById(item);
		} else if (item.length) {
			// Support for array based queries (such as jQuery)
			item = item[0];
		}

		if (item && item.canvas) {
			// Support for any object associated to a canvas (including a context2d)
			item = item.canvas;
		}

		// To prevent canvas fingerprinting, some add-ons undefine the getContext
		// method, for example: https://github.com/kkapsner/CanvasBlocker
		// https://github.com/chartjs/Chart.js/issues/2807
		var context = item && item.getContext && item.getContext('2d');

		// `instanceof HTMLCanvasElement/CanvasRenderingContext2D` fails when the item is
		// inside an iframe or when running in a protected environment. We could guess the
		// types from their toString() value but let's keep things flexible and assume it's
		// a sufficient condition if the item has a context2D which has item as `canvas`.
		// https://github.com/chartjs/Chart.js/issues/3887
		// https://github.com/chartjs/Chart.js/issues/4102
		// https://github.com/chartjs/Chart.js/issues/4152
		if (context && context.canvas === item) {
			initCanvas(item, config);
			return context;
		}

		return null;
	},

	releaseContext: function(context) {
		var canvas = context.canvas;
		if (!canvas[EXPANDO_KEY]) {
			return;
		}

		var initial = canvas[EXPANDO_KEY].initial;
		['height', 'width'].forEach(function(prop) {
			var value = initial[prop];
			if (helpers.isNullOrUndef(value)) {
				canvas.removeAttribute(prop);
			} else {
				canvas.setAttribute(prop, value);
			}
		});

		helpers.each(initial.style || {}, function(value, key) {
			canvas.style[key] = value;
		});

		// The canvas render size might have been changed (and thus the state stack discarded),
		// we can't use save() and restore() to restore the initial state. So make sure that at
		// least the canvas context is reset to the default state by setting the canvas width.
		// https://www.w3.org/TR/2011/WD-html5-20110525/the-canvas-element.html
		canvas.width = canvas.width;

		delete canvas[EXPANDO_KEY];
	},

	addEventListener: function(chart, type, listener) {
		var canvas = chart.canvas;
		if (type === 'resize') {
			// Note: the resize event is not supported on all browsers.
			addResizeListener(canvas, listener, chart);
			return;
		}

		var expando = listener[EXPANDO_KEY] || (listener[EXPANDO_KEY] = {});
		var proxies = expando.proxies || (expando.proxies = {});
		var proxy = proxies[chart.id + '_' + type] = function(event) {
			listener(fromNativeEvent(event, chart));
		};

		addEventListener(canvas, type, proxy);
	},

	removeEventListener: function(chart, type, listener) {
		var canvas = chart.canvas;
		if (type === 'resize') {
			// Note: the resize event is not supported on all browsers.
			removeResizeListener(canvas, listener);
			return;
		}

		var expando = listener[EXPANDO_KEY] || {};
		var proxies = expando.proxies || {};
		var proxy = proxies[chart.id + '_' + type];
		if (!proxy) {
			return;
		}

		removeEventListener(canvas, type, proxy);
	}
};

// DEPRECATIONS

/**
 * Provided for backward compatibility, use EventTarget.addEventListener instead.
 * EventTarget.addEventListener compatibility: Chrome, Opera 7, Safari, FF1.5+, IE9+
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @function Chart.helpers.addEvent
 * @deprecated since version 2.7.0
 * @todo remove at version 3
 * @private
 */
helpers.addEvent = addEventListener;

/**
 * Provided for backward compatibility, use EventTarget.removeEventListener instead.
 * EventTarget.removeEventListener compatibility: Chrome, Opera 7, Safari, FF1.5+, IE9+
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
 * @function Chart.helpers.removeEvent
 * @deprecated since version 2.7.0
 * @todo remove at version 3
 * @private
 */
helpers.removeEvent = removeEventListener;

},{"46":46}],49:[function(require,module,exports){
'use strict';

var helpers = require(46);
var basic = require(47);
var dom = require(48);

// @TODO Make possible to select another platform at build time.
var implementation = dom._enabled ? dom : basic;

/**
 * @namespace Chart.platform
 * @see https://chartjs.gitbooks.io/proposals/content/Platform.html
 * @since 2.4.0
 */
module.exports = helpers.extend({
	/**
	 * @since 2.7.0
	 */
	initialize: function() {},

	/**
	 * Called at chart construction time, returns a context2d instance implementing
	 * the [W3C Canvas 2D Context API standard]{@link https://www.w3.org/TR/2dcontext/}.
	 * @param {*} item - The native item from which to acquire context (platform specific)
	 * @param {Object} options - The chart options
	 * @returns {CanvasRenderingContext2D} context2d instance
	 */
	acquireContext: function() {},

	/**
	 * Called at chart destruction time, releases any resources associated to the context
	 * previously returned by the acquireContext() method.
	 * @param {CanvasRenderingContext2D} context - The context2d instance
	 * @returns {Boolean} true if the method succeeded, else false
	 */
	releaseContext: function() {},

	/**
	 * Registers the specified listener on the given chart.
	 * @param {Chart} chart - Chart from which to listen for event
	 * @param {String} type - The ({@link IEvent}) type to listen for
	 * @param {Function} listener - Receives a notification (an object that implements
	 * the {@link IEvent} interface) when an event of the specified type occurs.
	 */
	addEventListener: function() {},

	/**
	 * Removes the specified listener previously registered with addEventListener.
	 * @param {Chart} chart -Chart from which to remove the listener
	 * @param {String} type - The ({@link IEvent}) type to remove
	 * @param {Function} listener - The listener function to remove from the event target.
	 */
	removeEventListener: function() {}

}, implementation);

/**
 * @interface IPlatform
 * Allows abstracting platform dependencies away from the chart
 * @borrows Chart.platform.acquireContext as acquireContext
 * @borrows Chart.platform.releaseContext as releaseContext
 * @borrows Chart.platform.addEventListener as addEventListener
 * @borrows Chart.platform.removeEventListener as removeEventListener
 */

/**
 * @interface IEvent
 * @prop {String} type - The event type name, possible values are:
 * 'contextmenu', 'mouseenter', 'mousedown', 'mousemove', 'mouseup', 'mouseout',
 * 'click', 'dblclick', 'keydown', 'keypress', 'keyup' and 'resize'
 * @prop {*} native - The original native event (null for emulated events, e.g. 'resize')
 * @prop {Number} x - The mouse x position, relative to the canvas (null for incompatible events)
 * @prop {Number} y - The mouse y position, relative to the canvas (null for incompatible events)
 */

},{"46":46,"47":47,"48":48}],50:[function(require,module,exports){
'use strict';

module.exports = {};
module.exports.filler = require(51);
module.exports.legend = require(52);
module.exports.title = require(53);

},{"51":51,"52":52,"53":53}],51:[function(require,module,exports){
/**
 * Plugin based on discussion from the following Chart.js issues:
 * @see https://github.com/chartjs/Chart.js/issues/2380#issuecomment-279961569
 * @see https://github.com/chartjs/Chart.js/issues/2440#issuecomment-256461897
 */

'use strict';

var defaults = require(26);
var elements = require(41);
var helpers = require(46);

defaults._set('global', {
	plugins: {
		filler: {
			propagate: true
		}
	}
});

var mappers = {
	dataset: function(source) {
		var index = source.fill;
		var chart = source.chart;
		var meta = chart.getDatasetMeta(index);
		var visible = meta && chart.isDatasetVisible(index);
		var points = (visible && meta.dataset._children) || [];
		var length = points.length || 0;

		return !length ? null : function(point, i) {
			return (i < length && points[i]._view) || null;
		};
	},

	boundary: function(source) {
		var boundary = source.boundary;
		var x = boundary ? boundary.x : null;
		var y = boundary ? boundary.y : null;

		return function(point) {
			return {
				x: x === null ? point.x : x,
				y: y === null ? point.y : y,
			};
		};
	}
};

// @todo if (fill[0] === '#')
function decodeFill(el, index, count) {
	var model = el._model || {};
	var fill = model.fill;
	var target;

	if (fill === undefined) {
		fill = !!model.backgroundColor;
	}

	if (fill === false || fill === null) {
		return false;
	}

	if (fill === true) {
		return 'origin';
	}

	target = parseFloat(fill, 10);
	if (isFinite(target) && Math.floor(target) === target) {
		if (fill[0] === '-' || fill[0] === '+') {
			target = index + target;
		}

		if (target === index || target < 0 || target >= count) {
			return false;
		}

		return target;
	}

	switch (fill) {
	// compatibility
	case 'bottom':
		return 'start';
	case 'top':
		return 'end';
	case 'zero':
		return 'origin';
	// supported boundaries
	case 'origin':
	case 'start':
	case 'end':
		return fill;
	// invalid fill values
	default:
		return false;
	}
}

function computeBoundary(source) {
	var model = source.el._model || {};
	var scale = source.el._scale || {};
	var fill = source.fill;
	var target = null;
	var horizontal;

	if (isFinite(fill)) {
		return null;
	}

	// Backward compatibility: until v3, we still need to support boundary values set on
	// the model (scaleTop, scaleBottom and scaleZero) because some external plugins and
	// controllers might still use it (e.g. the Smith chart).

	if (fill === 'start') {
		target = model.scaleBottom === undefined ? scale.bottom : model.scaleBottom;
	} else if (fill === 'end') {
		target = model.scaleTop === undefined ? scale.top : model.scaleTop;
	} else if (model.scaleZero !== undefined) {
		target = model.scaleZero;
	} else if (scale.getBasePosition) {
		target = scale.getBasePosition();
	} else if (scale.getBasePixel) {
		target = scale.getBasePixel();
	}

	if (target !== undefined && target !== null) {
		if (target.x !== undefined && target.y !== undefined) {
			return target;
		}

		if (typeof target === 'number' && isFinite(target)) {
			horizontal = scale.isHorizontal();
			return {
				x: horizontal ? target : null,
				y: horizontal ? null : target
			};
		}
	}

	return null;
}

function resolveTarget(sources, index, propagate) {
	var source = sources[index];
	var fill = source.fill;
	var visited = [index];
	var target;

	if (!propagate) {
		return fill;
	}

	while (fill !== false && visited.indexOf(fill) === -1) {
		if (!isFinite(fill)) {
			return fill;
		}

		target = sources[fill];
		if (!target) {
			return false;
		}

		if (target.visible) {
			return fill;
		}

		visited.push(fill);
		fill = target.fill;
	}

	return false;
}

function createMapper(source) {
	var fill = source.fill;
	var type = 'dataset';

	if (fill === false) {
		return null;
	}

	if (!isFinite(fill)) {
		type = 'boundary';
	}

	return mappers[type](source);
}

function isDrawable(point) {
	return point && !point.skip;
}

function drawArea(ctx, curve0, curve1, len0, len1) {
	var i;

	if (!len0 || !len1) {
		return;
	}

	// building first area curve (normal)
	ctx.moveTo(curve0[0].x, curve0[0].y);
	for (i = 1; i < len0; ++i) {
		helpers.canvas.lineTo(ctx, curve0[i - 1], curve0[i]);
	}

	// joining the two area curves
	ctx.lineTo(curve1[len1 - 1].x, curve1[len1 - 1].y);

	// building opposite area curve (reverse)
	for (i = len1 - 1; i > 0; --i) {
		helpers.canvas.lineTo(ctx, curve1[i], curve1[i - 1], true);
	}
}

function doFill(ctx, points, mapper, view, color, loop) {
	var count = points.length;
	var span = view.spanGaps;
	var curve0 = [];
	var curve1 = [];
	var len0 = 0;
	var len1 = 0;
	var i, ilen, index, p0, p1, d0, d1;

	ctx.beginPath();

	for (i = 0, ilen = (count + !!loop); i < ilen; ++i) {
		index = i % count;
		p0 = points[index]._view;
		p1 = mapper(p0, index, view);
		d0 = isDrawable(p0);
		d1 = isDrawable(p1);

		if (d0 && d1) {
			len0 = curve0.push(p0);
			len1 = curve1.push(p1);
		} else if (len0 && len1) {
			if (!span) {
				drawArea(ctx, curve0, curve1, len0, len1);
				len0 = len1 = 0;
				curve0 = [];
				curve1 = [];
			} else {
				if (d0) {
					curve0.push(p0);
				}
				if (d1) {
					curve1.push(p1);
				}
			}
		}
	}

	drawArea(ctx, curve0, curve1, len0, len1);

	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
}

module.exports = {
	id: 'filler',

	afterDatasetsUpdate: function(chart, options) {
		var count = (chart.data.datasets || []).length;
		var propagate = options.propagate;
		var sources = [];
		var meta, i, el, source;

		for (i = 0; i < count; ++i) {
			meta = chart.getDatasetMeta(i);
			el = meta.dataset;
			source = null;

			if (el && el._model && el instanceof elements.Line) {
				source = {
					visible: chart.isDatasetVisible(i),
					fill: decodeFill(el, i, count),
					chart: chart,
					el: el
				};
			}

			meta.$filler = source;
			sources.push(source);
		}

		for (i = 0; i < count; ++i) {
			source = sources[i];
			if (!source) {
				continue;
			}

			source.fill = resolveTarget(sources, i, propagate);
			source.boundary = computeBoundary(source);
			source.mapper = createMapper(source);
		}
	},

	beforeDatasetDraw: function(chart, args) {
		var meta = args.meta.$filler;
		if (!meta) {
			return;
		}

		var ctx = chart.ctx;
		var el = meta.el;
		var view = el._view;
		var points = el._children || [];
		var mapper = meta.mapper;
		var color = view.backgroundColor || defaults.global.defaultColor;

		if (mapper && color && points.length) {
			helpers.canvas.clipArea(ctx, chart.chartArea);
			doFill(ctx, points, mapper, view, color, el._loop);
			helpers.canvas.unclipArea(ctx);
		}
	}
};

},{"26":26,"41":41,"46":46}],52:[function(require,module,exports){
'use strict';

var defaults = require(26);
var Element = require(27);
var helpers = require(46);
var layouts = require(31);

var noop = helpers.noop;

defaults._set('global', {
	legend: {
		display: true,
		position: 'top',
		fullWidth: true,
		reverse: false,
		weight: 1000,

		// a callback that will handle
		onClick: function(e, legendItem) {
			var index = legendItem.datasetIndex;
			var ci = this.chart;
			var meta = ci.getDatasetMeta(index);

			// See controller.isDatasetVisible comment
			meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;

			// We hid a dataset ... rerender the chart
			ci.update();
		},

		onHover: null,

		labels: {
			boxWidth: 40,
			padding: 10,
			// Generates labels shown in the legend
			// Valid properties to return:
			// text : text to display
			// fillStyle : fill of coloured box
			// strokeStyle: stroke of coloured box
			// hidden : if this legend item refers to a hidden item
			// lineCap : cap style for line
			// lineDash
			// lineDashOffset :
			// lineJoin :
			// lineWidth :
			generateLabels: function(chart) {
				var data = chart.data;
				return helpers.isArray(data.datasets) ? data.datasets.map(function(dataset, i) {
					return {
						text: dataset.label,
						fillStyle: (!helpers.isArray(dataset.backgroundColor) ? dataset.backgroundColor : dataset.backgroundColor[0]),
						hidden: !chart.isDatasetVisible(i),
						lineCap: dataset.borderCapStyle,
						lineDash: dataset.borderDash,
						lineDashOffset: dataset.borderDashOffset,
						lineJoin: dataset.borderJoinStyle,
						lineWidth: dataset.borderWidth,
						strokeStyle: dataset.borderColor,
						pointStyle: dataset.pointStyle,

						// Below is extra data used for toggling the datasets
						datasetIndex: i
					};
				}, this) : [];
			}
		}
	},

	legendCallback: function(chart) {
		var text = [];
		text.push('<ul class="' + chart.id + '-legend">');
		for (var i = 0; i < chart.data.datasets.length; i++) {
			text.push('<li><span style="background-color:' + chart.data.datasets[i].backgroundColor + '"></span>');
			if (chart.data.datasets[i].label) {
				text.push(chart.data.datasets[i].label);
			}
			text.push('</li>');
		}
		text.push('</ul>');
		return text.join('');
	}
});

/**
 * Helper function to get the box width based on the usePointStyle option
 * @param labelopts {Object} the label options on the legend
 * @param fontSize {Number} the label font size
 * @return {Number} width of the color box area
 */
function getBoxWidth(labelOpts, fontSize) {
	return labelOpts.usePointStyle ?
		fontSize * Math.SQRT2 :
		labelOpts.boxWidth;
}

/**
 * IMPORTANT: this class is exposed publicly as Chart.Legend, backward compatibility required!
 */
var Legend = Element.extend({

	initialize: function(config) {
		helpers.extend(this, config);

		// Contains hit boxes for each dataset (in dataset order)
		this.legendHitBoxes = [];

		// Are we in doughnut mode which has a different data type
		this.doughnutMode = false;
	},

	// These methods are ordered by lifecycle. Utilities then follow.
	// Any function defined here is inherited by all legend types.
	// Any function can be extended by the legend type

	beforeUpdate: noop,
	update: function(maxWidth, maxHeight, margins) {
		var me = this;

		// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
		me.beforeUpdate();

		// Absorb the master measurements
		me.maxWidth = maxWidth;
		me.maxHeight = maxHeight;
		me.margins = margins;

		// Dimensions
		me.beforeSetDimensions();
		me.setDimensions();
		me.afterSetDimensions();
		// Labels
		me.beforeBuildLabels();
		me.buildLabels();
		me.afterBuildLabels();

		// Fit
		me.beforeFit();
		me.fit();
		me.afterFit();
		//
		me.afterUpdate();

		return me.minSize;
	},
	afterUpdate: noop,

	//

	beforeSetDimensions: noop,
	setDimensions: function() {
		var me = this;
		// Set the unconstrained dimension before label rotation
		if (me.isHorizontal()) {
			// Reset position before calculating rotation
			me.width = me.maxWidth;
			me.left = 0;
			me.right = me.width;
		} else {
			me.height = me.maxHeight;

			// Reset position before calculating rotation
			me.top = 0;
			me.bottom = me.height;
		}

		// Reset padding
		me.paddingLeft = 0;
		me.paddingTop = 0;
		me.paddingRight = 0;
		me.paddingBottom = 0;

		// Reset minSize
		me.minSize = {
			width: 0,
			height: 0
		};
	},
	afterSetDimensions: noop,

	//

	beforeBuildLabels: noop,
	buildLabels: function() {
		var me = this;
		var labelOpts = me.options.labels || {};
		var legendItems = helpers.callback(labelOpts.generateLabels, [me.chart], me) || [];

		if (labelOpts.filter) {
			legendItems = legendItems.filter(function(item) {
				return labelOpts.filter(item, me.chart.data);
			});
		}

		if (me.options.reverse) {
			legendItems.reverse();
		}

		me.legendItems = legendItems;
	},
	afterBuildLabels: noop,

	//

	beforeFit: noop,
	fit: function() {
		var me = this;
		var opts = me.options;
		var labelOpts = opts.labels;
		var display = opts.display;

		var ctx = me.ctx;

		var globalDefault = defaults.global;
		var valueOrDefault = helpers.valueOrDefault;
		var fontSize = valueOrDefault(labelOpts.fontSize, globalDefault.defaultFontSize);
		var fontStyle = valueOrDefault(labelOpts.fontStyle, globalDefault.defaultFontStyle);
		var fontFamily = valueOrDefault(labelOpts.fontFamily, globalDefault.defaultFontFamily);
		var labelFont = helpers.fontString(fontSize, fontStyle, fontFamily);

		// Reset hit boxes
		var hitboxes = me.legendHitBoxes = [];

		var minSize = me.minSize;
		var isHorizontal = me.isHorizontal();

		if (isHorizontal) {
			minSize.width = me.maxWidth; // fill all the width
			minSize.height = display ? 10 : 0;
		} else {
			minSize.width = display ? 10 : 0;
			minSize.height = me.maxHeight; // fill all the height
		}

		// Increase sizes here
		if (display) {
			ctx.font = labelFont;

			if (isHorizontal) {
				// Labels

				// Width of each line of legend boxes. Labels wrap onto multiple lines when there are too many to fit on one
				var lineWidths = me.lineWidths = [0];
				var totalHeight = me.legendItems.length ? fontSize + (labelOpts.padding) : 0;

				ctx.textAlign = 'left';
				ctx.textBaseline = 'top';

				helpers.each(me.legendItems, function(legendItem, i) {
					var boxWidth = getBoxWidth(labelOpts, fontSize);
					var width = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

					if (lineWidths[lineWidths.length - 1] + width + labelOpts.padding >= me.width) {
						totalHeight += fontSize + (labelOpts.padding);
						lineWidths[lineWidths.length] = me.left;
					}

					// Store the hitbox width and height here. Final position will be updated in `draw`
					hitboxes[i] = {
						left: 0,
						top: 0,
						width: width,
						height: fontSize
					};

					lineWidths[lineWidths.length - 1] += width + labelOpts.padding;
				});

				minSize.height += totalHeight;

			} else {
				var vPadding = labelOpts.padding;
				var columnWidths = me.columnWidths = [];
				var totalWidth = labelOpts.padding;
				var currentColWidth = 0;
				var currentColHeight = 0;
				var itemHeight = fontSize + vPadding;

				helpers.each(me.legendItems, function(legendItem, i) {
					var boxWidth = getBoxWidth(labelOpts, fontSize);
					var itemWidth = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

					// If too tall, go to new column
					if (currentColHeight + itemHeight > minSize.height) {
						totalWidth += currentColWidth + labelOpts.padding;
						columnWidths.push(currentColWidth); // previous column width

						currentColWidth = 0;
						currentColHeight = 0;
					}

					// Get max width
					currentColWidth = Math.max(currentColWidth, itemWidth);
					currentColHeight += itemHeight;

					// Store the hitbox width and height here. Final position will be updated in `draw`
					hitboxes[i] = {
						left: 0,
						top: 0,
						width: itemWidth,
						height: fontSize
					};
				});

				totalWidth += currentColWidth;
				columnWidths.push(currentColWidth);
				minSize.width += totalWidth;
			}
		}

		me.width = minSize.width;
		me.height = minSize.height;
	},
	afterFit: noop,

	// Shared Methods
	isHorizontal: function() {
		return this.options.position === 'top' || this.options.position === 'bottom';
	},

	// Actually draw the legend on the canvas
	draw: function() {
		var me = this;
		var opts = me.options;
		var labelOpts = opts.labels;
		var globalDefault = defaults.global;
		var lineDefault = globalDefault.elements.line;
		var legendWidth = me.width;
		var lineWidths = me.lineWidths;

		if (opts.display) {
			var ctx = me.ctx;
			var valueOrDefault = helpers.valueOrDefault;
			var fontColor = valueOrDefault(labelOpts.fontColor, globalDefault.defaultFontColor);
			var fontSize = valueOrDefault(labelOpts.fontSize, globalDefault.defaultFontSize);
			var fontStyle = valueOrDefault(labelOpts.fontStyle, globalDefault.defaultFontStyle);
			var fontFamily = valueOrDefault(labelOpts.fontFamily, globalDefault.defaultFontFamily);
			var labelFont = helpers.fontString(fontSize, fontStyle, fontFamily);
			var cursor;

			// Canvas setup
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.lineWidth = 0.5;
			ctx.strokeStyle = fontColor; // for strikethrough effect
			ctx.fillStyle = fontColor; // render in correct colour
			ctx.font = labelFont;

			var boxWidth = getBoxWidth(labelOpts, fontSize);
			var hitboxes = me.legendHitBoxes;

			// current position
			var drawLegendBox = function(x, y, legendItem) {
				if (isNaN(boxWidth) || boxWidth <= 0) {
					return;
				}

				// Set the ctx for the box
				ctx.save();

				ctx.fillStyle = valueOrDefault(legendItem.fillStyle, globalDefault.defaultColor);
				ctx.lineCap = valueOrDefault(legendItem.lineCap, lineDefault.borderCapStyle);
				ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, lineDefault.borderDashOffset);
				ctx.lineJoin = valueOrDefault(legendItem.lineJoin, lineDefault.borderJoinStyle);
				ctx.lineWidth = valueOrDefault(legendItem.lineWidth, lineDefault.borderWidth);
				ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, globalDefault.defaultColor);
				var isLineWidthZero = (valueOrDefault(legendItem.lineWidth, lineDefault.borderWidth) === 0);

				if (ctx.setLineDash) {
					// IE 9 and 10 do not support line dash
					ctx.setLineDash(valueOrDefault(legendItem.lineDash, lineDefault.borderDash));
				}

				if (opts.labels && opts.labels.usePointStyle) {
					// Recalculate x and y for drawPoint() because its expecting
					// x and y to be center of figure (instead of top left)
					var radius = fontSize * Math.SQRT2 / 2;
					var offSet = radius / Math.SQRT2;
					var centerX = x + offSet;
					var centerY = y + offSet;

					// Draw pointStyle as legend symbol
					helpers.canvas.drawPoint(ctx, legendItem.pointStyle, radius, centerX, centerY);
				} else {
					// Draw box as legend symbol
					if (!isLineWidthZero) {
						ctx.strokeRect(x, y, boxWidth, fontSize);
					}
					ctx.fillRect(x, y, boxWidth, fontSize);
				}

				ctx.restore();
			};
			var fillText = function(x, y, legendItem, textWidth) {
				var halfFontSize = fontSize / 2;
				var xLeft = boxWidth + halfFontSize + x;
				var yMiddle = y + halfFontSize;

				ctx.fillText(legendItem.text, xLeft, yMiddle);

				if (legendItem.hidden) {
					// Strikethrough the text if hidden
					ctx.beginPath();
					ctx.lineWidth = 2;
					ctx.moveTo(xLeft, yMiddle);
					ctx.lineTo(xLeft + textWidth, yMiddle);
					ctx.stroke();
				}
			};

			// Horizontal
			var isHorizontal = me.isHorizontal();
			if (isHorizontal) {
				cursor = {
					x: me.left + ((legendWidth - lineWidths[0]) / 2),
					y: me.top + labelOpts.padding,
					line: 0
				};
			} else {
				cursor = {
					x: me.left + labelOpts.padding,
					y: me.top + labelOpts.padding,
					line: 0
				};
			}

			var itemHeight = fontSize + labelOpts.padding;
			helpers.each(me.legendItems, function(legendItem, i) {
				var textWidth = ctx.measureText(legendItem.text).width;
				var width = boxWidth + (fontSize / 2) + textWidth;
				var x = cursor.x;
				var y = cursor.y;

				if (isHorizontal) {
					if (x + width >= legendWidth) {
						y = cursor.y += itemHeight;
						cursor.line++;
						x = cursor.x = me.left + ((legendWidth - lineWidths[cursor.line]) / 2);
					}
				} else if (y + itemHeight > me.bottom) {
					x = cursor.x = x + me.columnWidths[cursor.line] + labelOpts.padding;
					y = cursor.y = me.top + labelOpts.padding;
					cursor.line++;
				}

				drawLegendBox(x, y, legendItem);

				hitboxes[i].left = x;
				hitboxes[i].top = y;

				// Fill the actual label
				fillText(x, y, legendItem, textWidth);

				if (isHorizontal) {
					cursor.x += width + (labelOpts.padding);
				} else {
					cursor.y += itemHeight;
				}

			});
		}
	},

	/**
	 * Handle an event
	 * @private
	 * @param {IEvent} event - The event to handle
	 * @return {Boolean} true if a change occured
	 */
	handleEvent: function(e) {
		var me = this;
		var opts = me.options;
		var type = e.type === 'mouseup' ? 'click' : e.type;
		var changed = false;

		if (type === 'mousemove') {
			if (!opts.onHover) {
				return;
			}
		} else if (type === 'click') {
			if (!opts.onClick) {
				return;
			}
		} else {
			return;
		}

		// Chart event already has relative position in it
		var x = e.x;
		var y = e.y;

		if (x >= me.left && x <= me.right && y >= me.top && y <= me.bottom) {
			// See if we are touching one of the dataset boxes
			var lh = me.legendHitBoxes;
			for (var i = 0; i < lh.length; ++i) {
				var hitBox = lh[i];

				if (x >= hitBox.left && x <= hitBox.left + hitBox.width && y >= hitBox.top && y <= hitBox.top + hitBox.height) {
					// Touching an element
					if (type === 'click') {
						// use e.native for backwards compatibility
						opts.onClick.call(me, e.native, me.legendItems[i]);
						changed = true;
						break;
					} else if (type === 'mousemove') {
						// use e.native for backwards compatibility
						opts.onHover.call(me, e.native, me.legendItems[i]);
						changed = true;
						break;
					}
				}
			}
		}

		return changed;
	}
});

function createNewLegendAndAttach(chart, legendOpts) {
	var legend = new Legend({
		ctx: chart.ctx,
		options: legendOpts,
		chart: chart
	});

	layouts.configure(chart, legend, legendOpts);
	layouts.addBox(chart, legend);
	chart.legend = legend;
}

module.exports = {
	id: 'legend',

	/**
	 * Backward compatibility: since 2.1.5, the legend is registered as a plugin, making
	 * Chart.Legend obsolete. To avoid a breaking change, we export the Legend as part of
	 * the plugin, which one will be re-exposed in the chart.js file.
	 * https://github.com/chartjs/Chart.js/pull/2640
	 * @private
	 */
	_element: Legend,

	beforeInit: function(chart) {
		var legendOpts = chart.options.legend;

		if (legendOpts) {
			createNewLegendAndAttach(chart, legendOpts);
		}
	},

	beforeUpdate: function(chart) {
		var legendOpts = chart.options.legend;
		var legend = chart.legend;

		if (legendOpts) {
			helpers.mergeIf(legendOpts, defaults.global.legend);

			if (legend) {
				layouts.configure(chart, legend, legendOpts);
				legend.options = legendOpts;
			} else {
				createNewLegendAndAttach(chart, legendOpts);
			}
		} else if (legend) {
			layouts.removeBox(chart, legend);
			delete chart.legend;
		}
	},

	afterEvent: function(chart, e) {
		var legend = chart.legend;
		if (legend) {
			legend.handleEvent(e);
		}
	}
};

},{"26":26,"27":27,"31":31,"46":46}],53:[function(require,module,exports){
'use strict';

var defaults = require(26);
var Element = require(27);
var helpers = require(46);
var layouts = require(31);

var noop = helpers.noop;

defaults._set('global', {
	title: {
		display: false,
		fontStyle: 'bold',
		fullWidth: true,
		lineHeight: 1.2,
		padding: 10,
		position: 'top',
		text: '',
		weight: 2000         // by default greater than legend (1000) to be above
	}
});

/**
 * IMPORTANT: this class is exposed publicly as Chart.Legend, backward compatibility required!
 */
var Title = Element.extend({
	initialize: function(config) {
		var me = this;
		helpers.extend(me, config);

		// Contains hit boxes for each dataset (in dataset order)
		me.legendHitBoxes = [];
	},

	// These methods are ordered by lifecycle. Utilities then follow.

	beforeUpdate: noop,
	update: function(maxWidth, maxHeight, margins) {
		var me = this;

		// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
		me.beforeUpdate();

		// Absorb the master measurements
		me.maxWidth = maxWidth;
		me.maxHeight = maxHeight;
		me.margins = margins;

		// Dimensions
		me.beforeSetDimensions();
		me.setDimensions();
		me.afterSetDimensions();
		// Labels
		me.beforeBuildLabels();
		me.buildLabels();
		me.afterBuildLabels();

		// Fit
		me.beforeFit();
		me.fit();
		me.afterFit();
		//
		me.afterUpdate();

		return me.minSize;

	},
	afterUpdate: noop,

	//

	beforeSetDimensions: noop,
	setDimensions: function() {
		var me = this;
		// Set the unconstrained dimension before label rotation
		if (me.isHorizontal()) {
			// Reset position before calculating rotation
			me.width = me.maxWidth;
			me.left = 0;
			me.right = me.width;
		} else {
			me.height = me.maxHeight;

			// Reset position before calculating rotation
			me.top = 0;
			me.bottom = me.height;
		}

		// Reset padding
		me.paddingLeft = 0;
		me.paddingTop = 0;
		me.paddingRight = 0;
		me.paddingBottom = 0;

		// Reset minSize
		me.minSize = {
			width: 0,
			height: 0
		};
	},
	afterSetDimensions: noop,

	//

	beforeBuildLabels: noop,
	buildLabels: noop,
	afterBuildLabels: noop,

	//

	beforeFit: noop,
	fit: function() {
		var me = this;
		var valueOrDefault = helpers.valueOrDefault;
		var opts = me.options;
		var display = opts.display;
		var fontSize = valueOrDefault(opts.fontSize, defaults.global.defaultFontSize);
		var minSize = me.minSize;
		var lineCount = helpers.isArray(opts.text) ? opts.text.length : 1;
		var lineHeight = helpers.options.toLineHeight(opts.lineHeight, fontSize);
		var textSize = display ? (lineCount * lineHeight) + (opts.padding * 2) : 0;

		if (me.isHorizontal()) {
			minSize.width = me.maxWidth; // fill all the width
			minSize.height = textSize;
		} else {
			minSize.width = textSize;
			minSize.height = me.maxHeight; // fill all the height
		}

		me.width = minSize.width;
		me.height = minSize.height;

	},
	afterFit: noop,

	// Shared Methods
	isHorizontal: function() {
		var pos = this.options.position;
		return pos === 'top' || pos === 'bottom';
	},

	// Actually draw the title block on the canvas
	draw: function() {
		var me = this;
		var ctx = me.ctx;
		var valueOrDefault = helpers.valueOrDefault;
		var opts = me.options;
		var globalDefaults = defaults.global;

		if (opts.display) {
			var fontSize = valueOrDefault(opts.fontSize, globalDefaults.defaultFontSize);
			var fontStyle = valueOrDefault(opts.fontStyle, globalDefaults.defaultFontStyle);
			var fontFamily = valueOrDefault(opts.fontFamily, globalDefaults.defaultFontFamily);
			var titleFont = helpers.fontString(fontSize, fontStyle, fontFamily);
			var lineHeight = helpers.options.toLineHeight(opts.lineHeight, fontSize);
			var offset = lineHeight / 2 + opts.padding;
			var rotation = 0;
			var top = me.top;
			var left = me.left;
			var bottom = me.bottom;
			var right = me.right;
			var maxWidth, titleX, titleY;

			ctx.fillStyle = valueOrDefault(opts.fontColor, globalDefaults.defaultFontColor); // render in correct colour
			ctx.font = titleFont;

			// Horizontal
			if (me.isHorizontal()) {
				titleX = left + ((right - left) / 2); // midpoint of the width
				titleY = top + offset;
				maxWidth = right - left;
			} else {
				titleX = opts.position === 'left' ? left + offset : right - offset;
				titleY = top + ((bottom - top) / 2);
				maxWidth = bottom - top;
				rotation = Math.PI * (opts.position === 'left' ? -0.5 : 0.5);
			}

			ctx.save();
			ctx.translate(titleX, titleY);
			ctx.rotate(rotation);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';

			var text = opts.text;
			if (helpers.isArray(text)) {
				var y = 0;
				for (var i = 0; i < text.length; ++i) {
					ctx.fillText(text[i], 0, y, maxWidth);
					y += lineHeight;
				}
			} else {
				ctx.fillText(text, 0, 0, maxWidth);
			}

			ctx.restore();
		}
	}
});

function createNewTitleBlockAndAttach(chart, titleOpts) {
	var title = new Title({
		ctx: chart.ctx,
		options: titleOpts,
		chart: chart
	});

	layouts.configure(chart, title, titleOpts);
	layouts.addBox(chart, title);
	chart.titleBlock = title;
}

module.exports = {
	id: 'title',

	/**
	 * Backward compatibility: since 2.1.5, the title is registered as a plugin, making
	 * Chart.Title obsolete. To avoid a breaking change, we export the Title as part of
	 * the plugin, which one will be re-exposed in the chart.js file.
	 * https://github.com/chartjs/Chart.js/pull/2640
	 * @private
	 */
	_element: Title,

	beforeInit: function(chart) {
		var titleOpts = chart.options.title;

		if (titleOpts) {
			createNewTitleBlockAndAttach(chart, titleOpts);
		}
	},

	beforeUpdate: function(chart) {
		var titleOpts = chart.options.title;
		var titleBlock = chart.titleBlock;

		if (titleOpts) {
			helpers.mergeIf(titleOpts, defaults.global.title);

			if (titleBlock) {
				layouts.configure(chart, titleBlock, titleOpts);
				titleBlock.options = titleOpts;
			} else {
				createNewTitleBlockAndAttach(chart, titleOpts);
			}
		} else if (titleBlock) {
			layouts.removeBox(chart, titleBlock);
			delete chart.titleBlock;
		}
	}
};

},{"26":26,"27":27,"31":31,"46":46}],54:[function(require,module,exports){
'use strict';

var Scale = require(33);
var scaleService = require(34);

module.exports = function() {

	// Default config for a category scale
	var defaultConfig = {
		position: 'bottom'
	};

	var DatasetScale = Scale.extend({
		/**
		* Internal function to get the correct labels. If data.xLabels or data.yLabels are defined, use those
		* else fall back to data.labels
		* @private
		*/
		getLabels: function() {
			var data = this.chart.data;
			return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels;
		},

		determineDataLimits: function() {
			var me = this;
			var labels = me.getLabels();
			me.minIndex = 0;
			me.maxIndex = labels.length - 1;
			var findIndex;

			if (me.options.ticks.min !== undefined) {
				// user specified min value
				findIndex = labels.indexOf(me.options.ticks.min);
				me.minIndex = findIndex !== -1 ? findIndex : me.minIndex;
			}

			if (me.options.ticks.max !== undefined) {
				// user specified max value
				findIndex = labels.indexOf(me.options.ticks.max);
				me.maxIndex = findIndex !== -1 ? findIndex : me.maxIndex;
			}

			me.min = labels[me.minIndex];
			me.max = labels[me.maxIndex];
		},

		buildTicks: function() {
			var me = this;
			var labels = me.getLabels();
			// If we are viewing some subset of labels, slice the original array
			me.ticks = (me.minIndex === 0 && me.maxIndex === labels.length - 1) ? labels : labels.slice(me.minIndex, me.maxIndex + 1);
		},

		getLabelForIndex: function(index, datasetIndex) {
			var me = this;
			var data = me.chart.data;
			var isHorizontal = me.isHorizontal();

			if (data.yLabels && !isHorizontal) {
				return me.getRightValue(data.datasets[datasetIndex].data[index]);
			}
			return me.ticks[index - me.minIndex];
		},

		// Used to get data value locations.  Value can either be an index or a numerical value
		getPixelForValue: function(value, index) {
			var me = this;
			var offset = me.options.offset;
			// 1 is added because we need the length but we have the indexes
			var offsetAmt = Math.max((me.maxIndex + 1 - me.minIndex - (offset ? 0 : 1)), 1);

			// If value is a data object, then index is the index in the data array,
			// not the index of the scale. We need to change that.
			var valueCategory;
			if (value !== undefined && value !== null) {
				valueCategory = me.isHorizontal() ? value.x : value.y;
			}
			if (valueCategory !== undefined || (value !== undefined && isNaN(index))) {
				var labels = me.getLabels();
				value = valueCategory || value;
				var idx = labels.indexOf(value);
				index = idx !== -1 ? idx : index;
			}

			if (me.isHorizontal()) {
				var valueWidth = me.width / offsetAmt;
				var widthOffset = (valueWidth * (index - me.minIndex));

				if (offset) {
					widthOffset += (valueWidth / 2);
				}

				return me.left + Math.round(widthOffset);
			}
			var valueHeight = me.height / offsetAmt;
			var heightOffset = (valueHeight * (index - me.minIndex));

			if (offset) {
				heightOffset += (valueHeight / 2);
			}

			return me.top + Math.round(heightOffset);
		},
		getPixelForTick: function(index) {
			return this.getPixelForValue(this.ticks[index], index + this.minIndex, null);
		},
		getValueForPixel: function(pixel) {
			var me = this;
			var offset = me.options.offset;
			var value;
			var offsetAmt = Math.max((me._ticks.length - (offset ? 0 : 1)), 1);
			var horz = me.isHorizontal();
			var valueDimension = (horz ? me.width : me.height) / offsetAmt;

			pixel -= horz ? me.left : me.top;

			if (offset) {
				pixel -= (valueDimension / 2);
			}

			if (pixel <= 0) {
				value = 0;
			} else {
				value = Math.round(pixel / valueDimension);
			}

			return value + me.minIndex;
		},
		getBasePixel: function() {
			return this.bottom;
		}
	});

	scaleService.registerScaleType('category', DatasetScale, defaultConfig);
};

},{"33":33,"34":34}],55:[function(require,module,exports){
'use strict';

var defaults = require(26);
var helpers = require(46);
var scaleService = require(34);
var Ticks = require(35);

module.exports = function(Chart) {

	var defaultConfig = {
		position: 'left',
		ticks: {
			callback: Ticks.formatters.linear
		}
	};

	var LinearScale = Chart.LinearScaleBase.extend({

		determineDataLimits: function() {
			var me = this;
			var opts = me.options;
			var chart = me.chart;
			var data = chart.data;
			var datasets = data.datasets;
			var isHorizontal = me.isHorizontal();
			var DEFAULT_MIN = 0;
			var DEFAULT_MAX = 1;

			function IDMatches(meta) {
				return isHorizontal ? meta.xAxisID === me.id : meta.yAxisID === me.id;
			}

			// First Calculate the range
			me.min = null;
			me.max = null;

			var hasStacks = opts.stacked;
			if (hasStacks === undefined) {
				helpers.each(datasets, function(dataset, datasetIndex) {
					if (hasStacks) {
						return;
					}

					var meta = chart.getDatasetMeta(datasetIndex);
					if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta) &&
						meta.stack !== undefined) {
						hasStacks = true;
					}
				});
			}

			if (opts.stacked || hasStacks) {
				var valuesPerStack = {};

				helpers.each(datasets, function(dataset, datasetIndex) {
					var meta = chart.getDatasetMeta(datasetIndex);
					var key = [
						meta.type,
						// we have a separate stack for stack=undefined datasets when the opts.stacked is undefined
						((opts.stacked === undefined && meta.stack === undefined) ? datasetIndex : ''),
						meta.stack
					].join('.');

					if (valuesPerStack[key] === undefined) {
						valuesPerStack[key] = {
							positiveValues: [],
							negativeValues: []
						};
					}

					// Store these per type
					var positiveValues = valuesPerStack[key].positiveValues;
					var negativeValues = valuesPerStack[key].negativeValues;

					if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
						helpers.each(dataset.data, function(rawValue, index) {
							var value = +me.getRightValue(rawValue);
							if (isNaN(value) || meta.data[index].hidden) {
								return;
							}

							positiveValues[index] = positiveValues[index] || 0;
							negativeValues[index] = negativeValues[index] || 0;

							if (opts.relativePoints) {
								positiveValues[index] = 100;
							} else if (value < 0) {
								negativeValues[index] += value;
							} else {
								positiveValues[index] += value;
							}
						});
					}
				});

				helpers.each(valuesPerStack, function(valuesForType) {
					var values = valuesForType.positiveValues.concat(valuesForType.negativeValues);
					var minVal = helpers.min(values);
					var maxVal = helpers.max(values);
					me.min = me.min === null ? minVal : Math.min(me.min, minVal);
					me.max = me.max === null ? maxVal : Math.max(me.max, maxVal);
				});

			} else {
				helpers.each(datasets, function(dataset, datasetIndex) {
					var meta = chart.getDatasetMeta(datasetIndex);
					if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
						helpers.each(dataset.data, function(rawValue, index) {
							var value = +me.getRightValue(rawValue);
							if (isNaN(value) || meta.data[index].hidden) {
								return;
							}

							if (me.min === null) {
								me.min = value;
							} else if (value < me.min) {
								me.min = value;
							}

							if (me.max === null) {
								me.max = value;
							} else if (value > me.max) {
								me.max = value;
							}
						});
					}
				});
			}

			me.min = isFinite(me.min) && !isNaN(me.min) ? me.min : DEFAULT_MIN;
			me.max = isFinite(me.max) && !isNaN(me.max) ? me.max : DEFAULT_MAX;

			// Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
			this.handleTickRangeOptions();
		},
		getTickLimit: function() {
			var maxTicks;
			var me = this;
			var tickOpts = me.options.ticks;

			if (me.isHorizontal()) {
				maxTicks = Math.min(tickOpts.maxTicksLimit ? tickOpts.maxTicksLimit : 11, Math.ceil(me.width / 50));
			} else {
				// The factor of 2 used to scale the font size has been experimentally determined.
				var tickFontSize = helpers.valueOrDefault(tickOpts.fontSize, defaults.global.defaultFontSize);
				maxTicks = Math.min(tickOpts.maxTicksLimit ? tickOpts.maxTicksLimit : 11, Math.ceil(me.height / (2 * tickFontSize)));
			}

			return maxTicks;
		},
		// Called after the ticks are built. We need
		handleDirectionalChanges: function() {
			if (!this.isHorizontal()) {
				// We are in a vertical orientation. The top value is the highest. So reverse the array
				this.ticks.reverse();
			}
		},
		getLabelForIndex: function(index, datasetIndex) {
			return +this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);
		},
		// Utils
		getPixelForValue: function(value) {
			// This must be called after fit has been run so that
			// this.left, this.top, this.right, and this.bottom have been defined
			var me = this;
			var start = me.start;

			var rightValue = +me.getRightValue(value);
			var pixel;
			var range = me.end - start;

			if (me.isHorizontal()) {
				pixel = me.left + (me.width / range * (rightValue - start));
			} else {
				pixel = me.bottom - (me.height / range * (rightValue - start));
			}
			return pixel;
		},
		getValueForPixel: function(pixel) {
			var me = this;
			var isHorizontal = me.isHorizontal();
			var innerDimension = isHorizontal ? me.width : me.height;
			var offset = (isHorizontal ? pixel - me.left : me.bottom - pixel) / innerDimension;
			return me.start + ((me.end - me.start) * offset);
		},
		getPixelForTick: function(index) {
			return this.getPixelForValue(this.ticksAsNumbers[index]);
		}
	});

	scaleService.registerScaleType('linear', LinearScale, defaultConfig);
};

},{"26":26,"34":34,"35":35,"46":46}],56:[function(require,module,exports){
'use strict';

var helpers = require(46);
var Scale = require(33);

/**
 * Generate a set of linear ticks
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {Array<Number>} array of tick values
 */
function generateTicks(generationOptions, dataRange) {
	var ticks = [];
	// To get a "nice" value for the tick spacing, we will use the appropriately named
	// "nice number" algorithm. See http://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
	// for details.

	var factor;
	var precision;
	var spacing;

	if (generationOptions.stepSize && generationOptions.stepSize > 0) {
		spacing = generationOptions.stepSize;
	} else {
		var niceRange = helpers.niceNum(dataRange.max - dataRange.min, false);
		spacing = helpers.niceNum(niceRange / (generationOptions.maxTicks - 1), true);

		precision = generationOptions.precision;
		if (precision !== undefined) {
			// If the user specified a precision, round to that number of decimal places
			factor = Math.pow(10, precision);
			spacing = Math.ceil(spacing * factor) / factor;
		}
	}
	var niceMin = Math.floor(dataRange.min / spacing) * spacing;
	var niceMax = Math.ceil(dataRange.max / spacing) * spacing;

	// If min, max and stepSize is set and they make an evenly spaced scale use it.
	if (!helpers.isNullOrUndef(generationOptions.min) && !helpers.isNullOrUndef(generationOptions.max) && generationOptions.stepSize) {
		// If very close to our whole number, use it.
		if (helpers.almostWhole((generationOptions.max - generationOptions.min) / generationOptions.stepSize, spacing / 1000)) {
			niceMin = generationOptions.min;
			niceMax = generationOptions.max;
		}
	}

	var numSpaces = (niceMax - niceMin) / spacing;
	// If very close to our rounded value, use it.
	if (helpers.almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
		numSpaces = Math.round(numSpaces);
	} else {
		numSpaces = Math.ceil(numSpaces);
	}

	precision = 1;
	if (spacing < 1) {
		precision = Math.pow(10, 1 - Math.floor(helpers.log10(spacing)));
		niceMin = Math.round(niceMin * precision) / precision;
		niceMax = Math.round(niceMax * precision) / precision;
	}
	ticks.push(generationOptions.min !== undefined ? generationOptions.min : niceMin);
	for (var j = 1; j < numSpaces; ++j) {
		ticks.push(Math.round((niceMin + j * spacing) * precision) / precision);
	}
	ticks.push(generationOptions.max !== undefined ? generationOptions.max : niceMax);

	return ticks;
}

module.exports = function(Chart) {

	var noop = helpers.noop;

	Chart.LinearScaleBase = Scale.extend({
		getRightValue: function(value) {
			if (typeof value === 'string') {
				return +value;
			}
			return Scale.prototype.getRightValue.call(this, value);
		},

		handleTickRangeOptions: function() {
			var me = this;
			var opts = me.options;
			var tickOpts = opts.ticks;

			// If we are forcing it to begin at 0, but 0 will already be rendered on the chart,
			// do nothing since that would make the chart weird. If the user really wants a weird chart
			// axis, they can manually override it
			if (tickOpts.beginAtZero) {
				var minSign = helpers.sign(me.min);
				var maxSign = helpers.sign(me.max);

				if (minSign < 0 && maxSign < 0) {
					// move the top up to 0
					me.max = 0;
				} else if (minSign > 0 && maxSign > 0) {
					// move the bottom down to 0
					me.min = 0;
				}
			}

			var setMin = tickOpts.min !== undefined || tickOpts.suggestedMin !== undefined;
			var setMax = tickOpts.max !== undefined || tickOpts.suggestedMax !== undefined;

			if (tickOpts.min !== undefined) {
				me.min = tickOpts.min;
			} else if (tickOpts.suggestedMin !== undefined) {
				if (me.min === null) {
					me.min = tickOpts.suggestedMin;
				} else {
					me.min = Math.min(me.min, tickOpts.suggestedMin);
				}
			}

			if (tickOpts.max !== undefined) {
				me.max = tickOpts.max;
			} else if (tickOpts.suggestedMax !== undefined) {
				if (me.max === null) {
					me.max = tickOpts.suggestedMax;
				} else {
					me.max = Math.max(me.max, tickOpts.suggestedMax);
				}
			}

			if (setMin !== setMax) {
				// We set the min or the max but not both.
				// So ensure that our range is good
				// Inverted or 0 length range can happen when
				// ticks.min is set, and no datasets are visible
				if (me.min >= me.max) {
					if (setMin) {
						me.max = me.min + 1;
					} else {
						me.min = me.max - 1;
					}
				}
			}

			if (me.min === me.max) {
				me.max++;

				if (!tickOpts.beginAtZero) {
					me.min--;
				}
			}
		},
		getTickLimit: noop,
		handleDirectionalChanges: noop,

		buildTicks: function() {
			var me = this;
			var opts = me.options;
			var tickOpts = opts.ticks;

			// Figure out what the max number of ticks we can support it is based on the size of
			// the axis area. For now, we say that the minimum tick spacing in pixels must be 50
			// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
			// the graph. Make sure we always have at least 2 ticks
			var maxTicks = me.getTickLimit();
			maxTicks = Math.max(2, maxTicks);

			var numericGeneratorOptions = {
				maxTicks: maxTicks,
				min: tickOpts.min,
				max: tickOpts.max,
				precision: tickOpts.precision,
				stepSize: helpers.valueOrDefault(tickOpts.fixedStepSize, tickOpts.stepSize)
			};
			var ticks = me.ticks = generateTicks(numericGeneratorOptions, me);

			me.handleDirectionalChanges();

			// At this point, we need to update our max and min given the tick values since we have expanded the
			// range of the scale
			me.max = helpers.max(ticks);
			me.min = helpers.min(ticks);

			if (tickOpts.reverse) {
				ticks.reverse();

				me.start = me.max;
				me.end = me.min;
			} else {
				me.start = me.min;
				me.end = me.max;
			}
		},
		convertTicksToLabels: function() {
			var me = this;
			me.ticksAsNumbers = me.ticks.slice();
			me.zeroLineIndex = me.ticks.indexOf(0);

			Scale.prototype.convertTicksToLabels.call(me);
		}
	});
};

},{"33":33,"46":46}],57:[function(require,module,exports){
'use strict';

var helpers = require(46);
var Scale = require(33);
var scaleService = require(34);
var Ticks = require(35);

/**
 * Generate a set of logarithmic ticks
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {Array<Number>} array of tick values
 */
function generateTicks(generationOptions, dataRange) {
	var ticks = [];
	var valueOrDefault = helpers.valueOrDefault;

	// Figure out what the max number of ticks we can support it is based on the size of
	// the axis area. For now, we say that the minimum tick spacing in pixels must be 50
	// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
	// the graph
	var tickVal = valueOrDefault(generationOptions.min, Math.pow(10, Math.floor(helpers.log10(dataRange.min))));

	var endExp = Math.floor(helpers.log10(dataRange.max));
	var endSignificand = Math.ceil(dataRange.max / Math.pow(10, endExp));
	var exp, significand;

	if (tickVal === 0) {
		exp = Math.floor(helpers.log10(dataRange.minNotZero));
		significand = Math.floor(dataRange.minNotZero / Math.pow(10, exp));

		ticks.push(tickVal);
		tickVal = significand * Math.pow(10, exp);
	} else {
		exp = Math.floor(helpers.log10(tickVal));
		significand = Math.floor(tickVal / Math.pow(10, exp));
	}
	var precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;

	do {
		ticks.push(tickVal);

		++significand;
		if (significand === 10) {
			significand = 1;
			++exp;
			precision = exp >= 0 ? 1 : precision;
		}

		tickVal = Math.round(significand * Math.pow(10, exp) * precision) / precision;
	} while (exp < endExp || (exp === endExp && significand < endSignificand));

	var lastTick = valueOrDefault(generationOptions.max, tickVal);
	ticks.push(lastTick);

	return ticks;
}


module.exports = function(Chart) {

	var defaultConfig = {
		position: 'left',

		// label settings
		ticks: {
			callback: Ticks.formatters.logarithmic
		}
	};

	var LogarithmicScale = Scale.extend({
		determineDataLimits: function() {
			var me = this;
			var opts = me.options;
			var chart = me.chart;
			var data = chart.data;
			var datasets = data.datasets;
			var isHorizontal = me.isHorizontal();
			function IDMatches(meta) {
				return isHorizontal ? meta.xAxisID === me.id : meta.yAxisID === me.id;
			}

			// Calculate Range
			me.min = null;
			me.max = null;
			me.minNotZero = null;

			var hasStacks = opts.stacked;
			if (hasStacks === undefined) {
				helpers.each(datasets, function(dataset, datasetIndex) {
					if (hasStacks) {
						return;
					}

					var meta = chart.getDatasetMeta(datasetIndex);
					if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta) &&
						meta.stack !== undefined) {
						hasStacks = true;
					}
				});
			}

			if (opts.stacked || hasStacks) {
				var valuesPerStack = {};

				helpers.each(datasets, function(dataset, datasetIndex) {
					var meta = chart.getDatasetMeta(datasetIndex);
					var key = [
						meta.type,
						// we have a separate stack for stack=undefined datasets when the opts.stacked is undefined
						((opts.stacked === undefined && meta.stack === undefined) ? datasetIndex : ''),
						meta.stack
					].join('.');

					if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
						if (valuesPerStack[key] === undefined) {
							valuesPerStack[key] = [];
						}

						helpers.each(dataset.data, function(rawValue, index) {
							var values = valuesPerStack[key];
							var value = +me.getRightValue(rawValue);
							// invalid, hidden and negative values are ignored
							if (isNaN(value) || meta.data[index].hidden || value < 0) {
								return;
							}
							values[index] = values[index] || 0;
							values[index] += value;
						});
					}
				});

				helpers.each(valuesPerStack, function(valuesForType) {
					if (valuesForType.length > 0) {
						var minVal = helpers.min(valuesForType);
						var maxVal = helpers.max(valuesForType);
						me.min = me.min === null ? minVal : Math.min(me.min, minVal);
						me.max = me.max === null ? maxVal : Math.max(me.max, maxVal);
					}
				});

			} else {
				helpers.each(datasets, function(dataset, datasetIndex) {
					var meta = chart.getDatasetMeta(datasetIndex);
					if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
						helpers.each(dataset.data, function(rawValue, index) {
							var value = +me.getRightValue(rawValue);
							// invalid, hidden and negative values are ignored
							if (isNaN(value) || meta.data[index].hidden || value < 0) {
								return;
							}

							if (me.min === null) {
								me.min = value;
							} else if (value < me.min) {
								me.min = value;
							}

							if (me.max === null) {
								me.max = value;
							} else if (value > me.max) {
								me.max = value;
							}

							if (value !== 0 && (me.minNotZero === null || value < me.minNotZero)) {
								me.minNotZero = value;
							}
						});
					}
				});
			}

			// Common base implementation to handle ticks.min, ticks.max
			this.handleTickRangeOptions();
		},
		handleTickRangeOptions: function() {
			var me = this;
			var opts = me.options;
			var tickOpts = opts.ticks;
			var valueOrDefault = helpers.valueOrDefault;
			var DEFAULT_MIN = 1;
			var DEFAULT_MAX = 10;

			me.min = valueOrDefault(tickOpts.min, me.min);
			me.max = valueOrDefault(tickOpts.max, me.max);

			if (me.min === me.max) {
				if (me.min !== 0 && me.min !== null) {
					me.min = Math.pow(10, Math.floor(helpers.log10(me.min)) - 1);
					me.max = Math.pow(10, Math.floor(helpers.log10(me.max)) + 1);
				} else {
					me.min = DEFAULT_MIN;
					me.max = DEFAULT_MAX;
				}
			}
			if (me.min === null) {
				me.min = Math.pow(10, Math.floor(helpers.log10(me.max)) - 1);
			}
			if (me.max === null) {
				me.max = me.min !== 0
					? Math.pow(10, Math.floor(helpers.log10(me.min)) + 1)
					: DEFAULT_MAX;
			}
			if (me.minNotZero === null) {
				if (me.min > 0) {
					me.minNotZero = me.min;
				} else if (me.max < 1) {
					me.minNotZero = Math.pow(10, Math.floor(helpers.log10(me.max)));
				} else {
					me.minNotZero = DEFAULT_MIN;
				}
			}
		},
		buildTicks: function() {
			var me = this;
			var opts = me.options;
			var tickOpts = opts.ticks;
			var reverse = !me.isHorizontal();

			var generationOptions = {
				min: tickOpts.min,
				max: tickOpts.max
			};
			var ticks = me.ticks = generateTicks(generationOptions, me);

			// At this point, we need to update our max and min given the tick values since we have expanded the
			// range of the scale
			me.max = helpers.max(ticks);
			me.min = helpers.min(ticks);

			if (tickOpts.reverse) {
				reverse = !reverse;
				me.start = me.max;
				me.end = me.min;
			} else {
				me.start = me.min;
				me.end = me.max;
			}
			if (reverse) {
				ticks.reverse();
			}
		},
		convertTicksToLabels: function() {
			this.tickValues = this.ticks.slice();

			Scale.prototype.convertTicksToLabels.call(this);
		},
		// Get the correct tooltip label
		getLabelForIndex: function(index, datasetIndex) {
			return +this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);
		},
		getPixelForTick: function(index) {
			return this.getPixelForValue(this.tickValues[index]);
		},
		/**
		 * Returns the value of the first tick.
		 * @param {Number} value - The minimum not zero value.
		 * @return {Number} The first tick value.
		 * @private
		 */
		_getFirstTickValue: function(value) {
			var exp = Math.floor(helpers.log10(value));
			var significand = Math.floor(value / Math.pow(10, exp));

			return significand * Math.pow(10, exp);
		},
		getPixelForValue: function(value) {
			var me = this;
			var reverse = me.options.ticks.reverse;
			var log10 = helpers.log10;
			var firstTickValue = me._getFirstTickValue(me.minNotZero);
			var offset = 0;
			var innerDimension, pixel, start, end, sign;

			value = +me.getRightValue(value);
			if (reverse) {
				start = me.end;
				end = me.start;
				sign = -1;
			} else {
				start = me.start;
				end = me.end;
				sign = 1;
			}
			if (me.isHorizontal()) {
				innerDimension = me.width;
				pixel = reverse ? me.right : me.left;
			} else {
				innerDimension = me.height;
				sign *= -1; // invert, since the upper-left corner of the canvas is at pixel (0, 0)
				pixel = reverse ? me.top : me.bottom;
			}
			if (value !== start) {
				if (start === 0) { // include zero tick
					offset = helpers.getValueOrDefault(
						me.options.ticks.fontSize,
						Chart.defaults.global.defaultFontSize
					);
					innerDimension -= offset;
					start = firstTickValue;
				}
				if (value !== 0) {
					offset += innerDimension / (log10(end) - log10(start)) * (log10(value) - log10(start));
				}
				pixel += sign * offset;
			}
			return pixel;
		},
		getValueForPixel: function(pixel) {
			var me = this;
			var reverse = me.options.ticks.reverse;
			var log10 = helpers.log10;
			var firstTickValue = me._getFirstTickValue(me.minNotZero);
			var innerDimension, start, end, value;

			if (reverse) {
				start = me.end;
				end = me.start;
			} else {
				start = me.start;
				end = me.end;
			}
			if (me.isHorizontal()) {
				innerDimension = me.width;
				value = reverse ? me.right - pixel : pixel - me.left;
			} else {
				innerDimension = me.height;
				value = reverse ? pixel - me.top : me.bottom - pixel;
			}
			if (value !== start) {
				if (start === 0) { // include zero tick
					var offset = helpers.getValueOrDefault(
						me.options.ticks.fontSize,
						Chart.defaults.global.defaultFontSize
					);
					value -= offset;
					innerDimension -= offset;
					start = firstTickValue;
				}
				value *= log10(end) - log10(start);
				value /= innerDimension;
				value = Math.pow(10, log10(start) + value);
			}
			return value;
		}
	});

	scaleService.registerScaleType('logarithmic', LogarithmicScale, defaultConfig);
};

},{"33":33,"34":34,"35":35,"46":46}],58:[function(require,module,exports){
'use strict';

var defaults = require(26);
var helpers = require(46);
var scaleService = require(34);
var Ticks = require(35);

module.exports = function(Chart) {

	var globalDefaults = defaults.global;

	var defaultConfig = {
		display: true,

		// Boolean - Whether to animate scaling the chart from the centre
		animate: true,
		position: 'chartArea',

		angleLines: {
			display: true,
			color: 'rgba(0, 0, 0, 0.1)',
			lineWidth: 1
		},

		gridLines: {
			circular: false
		},

		// label settings
		ticks: {
			// Boolean - Show a backdrop to the scale label
			showLabelBackdrop: true,

			// String - The colour of the label backdrop
			backdropColor: 'rgba(255,255,255,0.75)',

			// Number - The backdrop padding above & below the label in pixels
			backdropPaddingY: 2,

			// Number - The backdrop padding to the side of the label in pixels
			backdropPaddingX: 2,

			callback: Ticks.formatters.linear
		},

		pointLabels: {
			// Boolean - if true, show point labels
			display: true,

			// Number - Point label font size in pixels
			fontSize: 10,

			// Function - Used to convert point labels
			callback: function(label) {
				return label;
			}
		}
	};

	function getValueCount(scale) {
		var opts = scale.options;
		return opts.angleLines.display || opts.pointLabels.display ? scale.chart.data.labels.length : 0;
	}

	function getPointLabelFontOptions(scale) {
		var pointLabelOptions = scale.options.pointLabels;
		var fontSize = helpers.valueOrDefault(pointLabelOptions.fontSize, globalDefaults.defaultFontSize);
		var fontStyle = helpers.valueOrDefault(pointLabelOptions.fontStyle, globalDefaults.defaultFontStyle);
		var fontFamily = helpers.valueOrDefault(pointLabelOptions.fontFamily, globalDefaults.defaultFontFamily);
		var font = helpers.fontString(fontSize, fontStyle, fontFamily);

		return {
			size: fontSize,
			style: fontStyle,
			family: fontFamily,
			font: font
		};
	}

	function measureLabelSize(ctx, fontSize, label) {
		if (helpers.isArray(label)) {
			return {
				w: helpers.longestText(ctx, ctx.font, label),
				h: (label.length * fontSize) + ((label.length - 1) * 1.5 * fontSize)
			};
		}

		return {
			w: ctx.measureText(label).width,
			h: fontSize
		};
	}

	function determineLimits(angle, pos, size, min, max) {
		if (angle === min || angle === max) {
			return {
				start: pos - (size / 2),
				end: pos + (size / 2)
			};
		} else if (angle < min || angle > max) {
			return {
				start: pos - size - 5,
				end: pos
			};
		}

		return {
			start: pos,
			end: pos + size + 5
		};
	}

	/**
	 * Helper function to fit a radial linear scale with point labels
	 */
	function fitWithPointLabels(scale) {
		/*
		 * Right, this is really confusing and there is a lot of maths going on here
		 * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
		 *
		 * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
		 *
		 * Solution:
		 *
		 * We assume the radius of the polygon is half the size of the canvas at first
		 * at each index we check if the text overlaps.
		 *
		 * Where it does, we store that angle and that index.
		 *
		 * After finding the largest index and angle we calculate how much we need to remove
		 * from the shape radius to move the point inwards by that x.
		 *
		 * We average the left and right distances to get the maximum shape radius that can fit in the box
		 * along with labels.
		 *
		 * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
		 * on each side, removing that from the size, halving it and adding the left x protrusion width.
		 *
		 * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
		 * and position it in the most space efficient manner
		 *
		 * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
		 */

		var plFont = getPointLabelFontOptions(scale);

		// Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
		// Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
		var largestPossibleRadius = Math.min(scale.height / 2, scale.width / 2);
		var furthestLimits = {
			r: scale.width,
			l: 0,
			t: scale.height,
			b: 0
		};
		var furthestAngles = {};
		var i, textSize, pointPosition;

		scale.ctx.font = plFont.font;
		scale._pointLabelSizes = [];

		var valueCount = getValueCount(scale);
		for (i = 0; i < valueCount; i++) {
			pointPosition = scale.getPointPosition(i, largestPossibleRadius);
			textSize = measureLabelSize(scale.ctx, plFont.size, scale.pointLabels[i] || '');
			scale._pointLabelSizes[i] = textSize;

			// Add quarter circle to make degree 0 mean top of circle
			var angleRadians = scale.getIndexAngle(i);
			var angle = helpers.toDegrees(angleRadians) % 360;
			var hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
			var vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);

			if (hLimits.start < furthestLimits.l) {
				furthestLimits.l = hLimits.start;
				furthestAngles.l = angleRadians;
			}

			if (hLimits.end > furthestLimits.r) {
				furthestLimits.r = hLimits.end;
				furthestAngles.r = angleRadians;
			}

			if (vLimits.start < furthestLimits.t) {
				furthestLimits.t = vLimits.start;
				furthestAngles.t = angleRadians;
			}

			if (vLimits.end > furthestLimits.b) {
				furthestLimits.b = vLimits.end;
				furthestAngles.b = angleRadians;
			}
		}

		scale.setReductions(largestPossibleRadius, furthestLimits, furthestAngles);
	}

	/**
	 * Helper function to fit a radial linear scale with no point labels
	 */
	function fit(scale) {
		var largestPossibleRadius = Math.min(scale.height / 2, scale.width / 2);
		scale.drawingArea = Math.round(largestPossibleRadius);
		scale.setCenterPoint(0, 0, 0, 0);
	}

	function getTextAlignForAngle(angle) {
		if (angle === 0 || angle === 180) {
			return 'center';
		} else if (angle < 180) {
			return 'left';
		}

		return 'right';
	}

	function fillText(ctx, text, position, fontSize) {
		if (helpers.isArray(text)) {
			var y = position.y;
			var spacing = 1.5 * fontSize;

			for (var i = 0; i < text.length; ++i) {
				ctx.fillText(text[i], position.x, y);
				y += spacing;
			}
		} else {
			ctx.fillText(text, position.x, position.y);
		}
	}

	function adjustPointPositionForLabelHeight(angle, textSize, position) {
		if (angle === 90 || angle === 270) {
			position.y -= (textSize.h / 2);
		} else if (angle > 270 || angle < 90) {
			position.y -= textSize.h;
		}
	}

	function drawPointLabels(scale) {
		var ctx = scale.ctx;
		var opts = scale.options;
		var angleLineOpts = opts.angleLines;
		var pointLabelOpts = opts.pointLabels;

		ctx.lineWidth = angleLineOpts.lineWidth;
		ctx.strokeStyle = angleLineOpts.color;

		var outerDistance = scale.getDistanceFromCenterForValue(opts.ticks.reverse ? scale.min : scale.max);

		// Point Label Font
		var plFont = getPointLabelFontOptions(scale);

		ctx.textBaseline = 'top';

		for (var i = getValueCount(scale) - 1; i >= 0; i--) {
			if (angleLineOpts.display) {
				var outerPosition = scale.getPointPosition(i, outerDistance);
				ctx.beginPath();
				ctx.moveTo(scale.xCenter, scale.yCenter);
				ctx.lineTo(outerPosition.x, outerPosition.y);
				ctx.stroke();
				ctx.closePath();
			}

			if (pointLabelOpts.display) {
				// Extra 3px out for some label spacing
				var pointLabelPosition = scale.getPointPosition(i, outerDistance + 5);

				// Keep this in loop since we may support array properties here
				var pointLabelFontColor = helpers.valueAtIndexOrDefault(pointLabelOpts.fontColor, i, globalDefaults.defaultFontColor);
				ctx.font = plFont.font;
				ctx.fillStyle = pointLabelFontColor;

				var angleRadians = scale.getIndexAngle(i);
				var angle = helpers.toDegrees(angleRadians);
				ctx.textAlign = getTextAlignForAngle(angle);
				adjustPointPositionForLabelHeight(angle, scale._pointLabelSizes[i], pointLabelPosition);
				fillText(ctx, scale.pointLabels[i] || '', pointLabelPosition, plFont.size);
			}
		}
	}

	function drawRadiusLine(scale, gridLineOpts, radius, index) {
		var ctx = scale.ctx;
		ctx.strokeStyle = helpers.valueAtIndexOrDefault(gridLineOpts.color, index - 1);
		ctx.lineWidth = helpers.valueAtIndexOrDefault(gridLineOpts.lineWidth, index - 1);

		if (scale.options.gridLines.circular) {
			// Draw circular arcs between the points
			ctx.beginPath();
			ctx.arc(scale.xCenter, scale.yCenter, radius, 0, Math.PI * 2);
			ctx.closePath();
			ctx.stroke();
		} else {
			// Draw straight lines connecting each index
			var valueCount = getValueCount(scale);

			if (valueCount === 0) {
				return;
			}

			ctx.beginPath();
			var pointPosition = scale.getPointPosition(0, radius);
			ctx.moveTo(pointPosition.x, pointPosition.y);

			for (var i = 1; i < valueCount; i++) {
				pointPosition = scale.getPointPosition(i, radius);
				ctx.lineTo(pointPosition.x, pointPosition.y);
			}

			ctx.closePath();
			ctx.stroke();
		}
	}

	function numberOrZero(param) {
		return helpers.isNumber(param) ? param : 0;
	}

	var LinearRadialScale = Chart.LinearScaleBase.extend({
		setDimensions: function() {
			var me = this;
			var opts = me.options;
			var tickOpts = opts.ticks;
			// Set the unconstrained dimension before label rotation
			me.width = me.maxWidth;
			me.height = me.maxHeight;
			me.xCenter = Math.round(me.width / 2);
			me.yCenter = Math.round(me.height / 2);

			var minSize = helpers.min([me.height, me.width]);
			var tickFontSize = helpers.valueOrDefault(tickOpts.fontSize, globalDefaults.defaultFontSize);
			me.drawingArea = opts.display ? (minSize / 2) - (tickFontSize / 2 + tickOpts.backdropPaddingY) : (minSize / 2);
		},
		determineDataLimits: function() {
			var me = this;
			var chart = me.chart;
			var min = Number.POSITIVE_INFINITY;
			var max = Number.NEGATIVE_INFINITY;

			helpers.each(chart.data.datasets, function(dataset, datasetIndex) {
				if (chart.isDatasetVisible(datasetIndex)) {
					var meta = chart.getDatasetMeta(datasetIndex);

					helpers.each(dataset.data, function(rawValue, index) {
						var value = +me.getRightValue(rawValue);
						if (isNaN(value) || meta.data[index].hidden) {
							return;
						}

						min = Math.min(value, min);
						max = Math.max(value, max);
					});
				}
			});

			me.min = (min === Number.POSITIVE_INFINITY ? 0 : min);
			me.max = (max === Number.NEGATIVE_INFINITY ? 0 : max);

			// Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
			me.handleTickRangeOptions();
		},
		getTickLimit: function() {
			var tickOpts = this.options.ticks;
			var tickFontSize = helpers.valueOrDefault(tickOpts.fontSize, globalDefaults.defaultFontSize);
			return Math.min(tickOpts.maxTicksLimit ? tickOpts.maxTicksLimit : 11, Math.ceil(this.drawingArea / (1.5 * tickFontSize)));
		},
		convertTicksToLabels: function() {
			var me = this;

			Chart.LinearScaleBase.prototype.convertTicksToLabels.call(me);

			// Point labels
			me.pointLabels = me.chart.data.labels.map(me.options.pointLabels.callback, me);
		},
		getLabelForIndex: function(index, datasetIndex) {
			return +this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);
		},
		fit: function() {
			if (this.options.pointLabels.display) {
				fitWithPointLabels(this);
			} else {
				fit(this);
			}
		},
		/**
		 * Set radius reductions and determine new radius and center point
		 * @private
		 */
		setReductions: function(largestPossibleRadius, furthestLimits, furthestAngles) {
			var me = this;
			var radiusReductionLeft = furthestLimits.l / Math.sin(furthestAngles.l);
			var radiusReductionRight = Math.max(furthestLimits.r - me.width, 0) / Math.sin(furthestAngles.r);
			var radiusReductionTop = -furthestLimits.t / Math.cos(furthestAngles.t);
			var radiusReductionBottom = -Math.max(furthestLimits.b - me.height, 0) / Math.cos(furthestAngles.b);

			radiusReductionLeft = numberOrZero(radiusReductionLeft);
			radiusReductionRight = numberOrZero(radiusReductionRight);
			radiusReductionTop = numberOrZero(radiusReductionTop);
			radiusReductionBottom = numberOrZero(radiusReductionBottom);

			me.drawingArea = Math.min(
				Math.round(largestPossibleRadius - (radiusReductionLeft + radiusReductionRight) / 2),
				Math.round(largestPossibleRadius - (radiusReductionTop + radiusReductionBottom) / 2));
			me.setCenterPoint(radiusReductionLeft, radiusReductionRight, radiusReductionTop, radiusReductionBottom);
		},
		setCenterPoint: function(leftMovement, rightMovement, topMovement, bottomMovement) {
			var me = this;
			var maxRight = me.width - rightMovement - me.drawingArea;
			var maxLeft = leftMovement + me.drawingArea;
			var maxTop = topMovement + me.drawingArea;
			var maxBottom = me.height - bottomMovement - me.drawingArea;

			me.xCenter = Math.round(((maxLeft + maxRight) / 2) + me.left);
			me.yCenter = Math.round(((maxTop + maxBottom) / 2) + me.top);
		},

		getIndexAngle: function(index) {
			var angleMultiplier = (Math.PI * 2) / getValueCount(this);
			var startAngle = this.chart.options && this.chart.options.startAngle ?
				this.chart.options.startAngle :
				0;

			var startAngleRadians = startAngle * Math.PI * 2 / 360;

			// Start from the top instead of right, so remove a quarter of the circle
			return index * angleMultiplier + startAngleRadians;
		},
		getDistanceFromCenterForValue: function(value) {
			var me = this;

			if (value === null) {
				return 0; // null always in center
			}

			// Take into account half font size + the yPadding of the top value
			var scalingFactor = me.drawingArea / (me.max - me.min);
			if (me.options.ticks.reverse) {
				return (me.max - value) * scalingFactor;
			}
			return (value - me.min) * scalingFactor;
		},
		getPointPosition: function(index, distanceFromCenter) {
			var me = this;
			var thisAngle = me.getIndexAngle(index) - (Math.PI / 2);
			return {
				x: Math.round(Math.cos(thisAngle) * distanceFromCenter) + me.xCenter,
				y: Math.round(Math.sin(thisAngle) * distanceFromCenter) + me.yCenter
			};
		},
		getPointPositionForValue: function(index, value) {
			return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
		},

		getBasePosition: function() {
			var me = this;
			var min = me.min;
			var max = me.max;

			return me.getPointPositionForValue(0,
				me.beginAtZero ? 0 :
				min < 0 && max < 0 ? max :
				min > 0 && max > 0 ? min :
				0);
		},

		draw: function() {
			var me = this;
			var opts = me.options;
			var gridLineOpts = opts.gridLines;
			var tickOpts = opts.ticks;
			var valueOrDefault = helpers.valueOrDefault;

			if (opts.display) {
				var ctx = me.ctx;
				var startAngle = this.getIndexAngle(0);

				// Tick Font
				var tickFontSize = valueOrDefault(tickOpts.fontSize, globalDefaults.defaultFontSize);
				var tickFontStyle = valueOrDefault(tickOpts.fontStyle, globalDefaults.defaultFontStyle);
				var tickFontFamily = valueOrDefault(tickOpts.fontFamily, globalDefaults.defaultFontFamily);
				var tickLabelFont = helpers.fontString(tickFontSize, tickFontStyle, tickFontFamily);

				helpers.each(me.ticks, function(label, index) {
					// Don't draw a centre value (if it is minimum)
					if (index > 0 || tickOpts.reverse) {
						var yCenterOffset = me.getDistanceFromCenterForValue(me.ticksAsNumbers[index]);

						// Draw circular lines around the scale
						if (gridLineOpts.display && index !== 0) {
							drawRadiusLine(me, gridLineOpts, yCenterOffset, index);
						}

						if (tickOpts.display) {
							var tickFontColor = valueOrDefault(tickOpts.fontColor, globalDefaults.defaultFontColor);
							ctx.font = tickLabelFont;

							ctx.save();
							ctx.translate(me.xCenter, me.yCenter);
							ctx.rotate(startAngle);

							if (tickOpts.showLabelBackdrop) {
								var labelWidth = ctx.measureText(label).width;
								ctx.fillStyle = tickOpts.backdropColor;
								ctx.fillRect(
									-labelWidth / 2 - tickOpts.backdropPaddingX,
									-yCenterOffset - tickFontSize / 2 - tickOpts.backdropPaddingY,
									labelWidth + tickOpts.backdropPaddingX * 2,
									tickFontSize + tickOpts.backdropPaddingY * 2
								);
							}

							ctx.textAlign = 'center';
							ctx.textBaseline = 'middle';
							ctx.fillStyle = tickFontColor;
							ctx.fillText(label, 0, -yCenterOffset);
							ctx.restore();
						}
					}
				});

				if (opts.angleLines.display || opts.pointLabels.display) {
					drawPointLabels(me);
				}
			}
		}
	});

	scaleService.registerScaleType('radialLinear', LinearRadialScale, defaultConfig);
};

},{"26":26,"34":34,"35":35,"46":46}],59:[function(require,module,exports){
/* global window: false */
'use strict';

var moment = require(1);
moment = typeof moment === 'function' ? moment : window.moment;

var defaults = require(26);
var helpers = require(46);
var Scale = require(33);
var scaleService = require(34);

// Integer constants are from the ES6 spec.
var MIN_INTEGER = Number.MIN_SAFE_INTEGER || -9007199254740991;
var MAX_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

var INTERVALS = {
	millisecond: {
		common: true,
		size: 1,
		steps: [1, 2, 5, 10, 20, 50, 100, 250, 500]
	},
	second: {
		common: true,
		size: 1000,
		steps: [1, 2, 5, 10, 15, 30]
	},
	minute: {
		common: true,
		size: 60000,
		steps: [1, 2, 5, 10, 15, 30]
	},
	hour: {
		common: true,
		size: 3600000,
		steps: [1, 2, 3, 6, 12]
	},
	day: {
		common: true,
		size: 86400000,
		steps: [1, 2, 5]
	},
	week: {
		common: false,
		size: 604800000,
		steps: [1, 2, 3, 4]
	},
	month: {
		common: true,
		size: 2.628e9,
		steps: [1, 2, 3]
	},
	quarter: {
		common: false,
		size: 7.884e9,
		steps: [1, 2, 3, 4]
	},
	year: {
		common: true,
		size: 3.154e10
	}
};

var UNITS = Object.keys(INTERVALS);

function sorter(a, b) {
	return a - b;
}

function arrayUnique(items) {
	var hash = {};
	var out = [];
	var i, ilen, item;

	for (i = 0, ilen = items.length; i < ilen; ++i) {
		item = items[i];
		if (!hash[item]) {
			hash[item] = true;
			out.push(item);
		}
	}

	return out;
}

/**
 * Returns an array of {time, pos} objects used to interpolate a specific `time` or position
 * (`pos`) on the scale, by searching entries before and after the requested value. `pos` is
 * a decimal between 0 and 1: 0 being the start of the scale (left or top) and 1 the other
 * extremity (left + width or top + height). Note that it would be more optimized to directly
 * store pre-computed pixels, but the scale dimensions are not guaranteed at the time we need
 * to create the lookup table. The table ALWAYS contains at least two items: min and max.
 *
 * @param {Number[]} timestamps - timestamps sorted from lowest to highest.
 * @param {String} distribution - If 'linear', timestamps will be spread linearly along the min
 * and max range, so basically, the table will contains only two items: {min, 0} and {max, 1}.
 * If 'series', timestamps will be positioned at the same distance from each other. In this
 * case, only timestamps that break the time linearity are registered, meaning that in the
 * best case, all timestamps are linear, the table contains only min and max.
 */
function buildLookupTable(timestamps, min, max, distribution) {
	if (distribution === 'linear' || !timestamps.length) {
		return [
			{time: min, pos: 0},
			{time: max, pos: 1}
		];
	}

	var table = [];
	var items = [min];
	var i, ilen, prev, curr, next;

	for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
		curr = timestamps[i];
		if (curr > min && curr < max) {
			items.push(curr);
		}
	}

	items.push(max);

	for (i = 0, ilen = items.length; i < ilen; ++i) {
		next = items[i + 1];
		prev = items[i - 1];
		curr = items[i];

		// only add points that breaks the scale linearity
		if (prev === undefined || next === undefined || Math.round((next + prev) / 2) !== curr) {
			table.push({time: curr, pos: i / (ilen - 1)});
		}
	}

	return table;
}

// @see adapted from http://www.anujgakhar.com/2014/03/01/binary-search-in-javascript/
function lookup(table, key, value) {
	var lo = 0;
	var hi = table.length - 1;
	var mid, i0, i1;

	while (lo >= 0 && lo <= hi) {
		mid = (lo + hi) >> 1;
		i0 = table[mid - 1] || null;
		i1 = table[mid];

		if (!i0) {
			// given value is outside table (before first item)
			return {lo: null, hi: i1};
		} else if (i1[key] < value) {
			lo = mid + 1;
		} else if (i0[key] > value) {
			hi = mid - 1;
		} else {
			return {lo: i0, hi: i1};
		}
	}

	// given value is outside table (after last item)
	return {lo: i1, hi: null};
}

/**
 * Linearly interpolates the given source `value` using the table items `skey` values and
 * returns the associated `tkey` value. For example, interpolate(table, 'time', 42, 'pos')
 * returns the position for a timestamp equal to 42. If value is out of bounds, values at
 * index [0, 1] or [n - 1, n] are used for the interpolation.
 */
function interpolate(table, skey, sval, tkey) {
	var range = lookup(table, skey, sval);

	// Note: the lookup table ALWAYS contains at least 2 items (min and max)
	var prev = !range.lo ? table[0] : !range.hi ? table[table.length - 2] : range.lo;
	var next = !range.lo ? table[1] : !range.hi ? table[table.length - 1] : range.hi;

	var span = next[skey] - prev[skey];
	var ratio = span ? (sval - prev[skey]) / span : 0;
	var offset = (next[tkey] - prev[tkey]) * ratio;

	return prev[tkey] + offset;
}

/**
 * Convert the given value to a moment object using the given time options.
 * @see http://momentjs.com/docs/#/parsing/
 */
function momentify(value, options) {
	var parser = options.parser;
	var format = options.parser || options.format;

	if (typeof parser === 'function') {
		return parser(value);
	}

	if (typeof value === 'string' && typeof format === 'string') {
		return moment(value, format);
	}

	if (!(value instanceof moment)) {
		value = moment(value);
	}

	if (value.isValid()) {
		return value;
	}

	// Labels are in an incompatible moment format and no `parser` has been provided.
	// The user might still use the deprecated `format` option to convert his inputs.
	if (typeof format === 'function') {
		return format(value);
	}

	return value;
}

function parse(input, scale) {
	if (helpers.isNullOrUndef(input)) {
		return null;
	}

	var options = scale.options.time;
	var value = momentify(scale.getRightValue(input), options);
	if (!value.isValid()) {
		return null;
	}

	if (options.round) {
		value.startOf(options.round);
	}

	return value.valueOf();
}

/**
 * Returns the number of unit to skip to be able to display up to `capacity` number of ticks
 * in `unit` for the given `min` / `max` range and respecting the interval steps constraints.
 */
function determineStepSize(min, max, unit, capacity) {
	var range = max - min;
	var interval = INTERVALS[unit];
	var milliseconds = interval.size;
	var steps = interval.steps;
	var i, ilen, factor;

	if (!steps) {
		return Math.ceil(range / (capacity * milliseconds));
	}

	for (i = 0, ilen = steps.length; i < ilen; ++i) {
		factor = steps[i];
		if (Math.ceil(range / (milliseconds * factor)) <= capacity) {
			break;
		}
	}

	return factor;
}

/**
 * Figures out what unit results in an appropriate number of auto-generated ticks
 */
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
	var ilen = UNITS.length;
	var i, interval, factor;

	for (i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) {
		interval = INTERVALS[UNITS[i]];
		factor = interval.steps ? interval.steps[interval.steps.length - 1] : MAX_INTEGER;

		if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
			return UNITS[i];
		}
	}

	return UNITS[ilen - 1];
}

/**
 * Figures out what unit to format a set of ticks with
 */
function determineUnitForFormatting(ticks, minUnit, min, max) {
	var duration = moment.duration(moment(max).diff(moment(min)));
	var ilen = UNITS.length;
	var i, unit;

	for (i = ilen - 1; i >= UNITS.indexOf(minUnit); i--) {
		unit = UNITS[i];
		if (INTERVALS[unit].common && duration.as(unit) >= ticks.length) {
			return unit;
		}
	}

	return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}

function determineMajorUnit(unit) {
	for (var i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
		if (INTERVALS[UNITS[i]].common) {
			return UNITS[i];
		}
	}
}

/**
 * Generates a maximum of `capacity` timestamps between min and max, rounded to the
 * `minor` unit, aligned on the `major` unit and using the given scale time `options`.
 * Important: this method can return ticks outside the min and max range, it's the
 * responsibility of the calling code to clamp values if needed.
 */
function generate(min, max, capacity, options) {
	var timeOpts = options.time;
	var minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, capacity);
	var major = determineMajorUnit(minor);
	var stepSize = helpers.valueOrDefault(timeOpts.stepSize, timeOpts.unitStepSize);
	var weekday = minor === 'week' ? timeOpts.isoWeekday : false;
	var majorTicksEnabled = options.ticks.major.enabled;
	var interval = INTERVALS[minor];
	var first = moment(min);
	var last = moment(max);
	var ticks = [];
	var time;

	if (!stepSize) {
		stepSize = determineStepSize(min, max, minor, capacity);
	}

	// For 'week' unit, handle the first day of week option
	if (weekday) {
		first = first.isoWeekday(weekday);
		last = last.isoWeekday(weekday);
	}

	// Align first/last ticks on unit
	first = first.startOf(weekday ? 'day' : minor);
	last = last.startOf(weekday ? 'day' : minor);

	// Make sure that the last tick include max
	if (last < max) {
		last.add(1, minor);
	}

	time = moment(first);

	if (majorTicksEnabled && major && !weekday && !timeOpts.round) {
		// Align the first tick on the previous `minor` unit aligned on the `major` unit:
		// we first aligned time on the previous `major` unit then add the number of full
		// stepSize there is between first and the previous major time.
		time.startOf(major);
		time.add(~~((first - time) / (interval.size * stepSize)) * stepSize, minor);
	}

	for (; time < last; time.add(stepSize, minor)) {
		ticks.push(+time);
	}

	ticks.push(+time);

	return ticks;
}

/**
 * Returns the right and left offsets from edges in the form of {left, right}.
 * Offsets are added when the `offset` option is true.
 */
function computeOffsets(table, ticks, min, max, options) {
	var left = 0;
	var right = 0;
	var upper, lower;

	if (options.offset && ticks.length) {
		if (!options.time.min) {
			upper = ticks.length > 1 ? ticks[1] : max;
			lower = ticks[0];
			left = (
				interpolate(table, 'time', upper, 'pos') -
				interpolate(table, 'time', lower, 'pos')
			) / 2;
		}
		if (!options.time.max) {
			upper = ticks[ticks.length - 1];
			lower = ticks.length > 1 ? ticks[ticks.length - 2] : min;
			right = (
				interpolate(table, 'time', upper, 'pos') -
				interpolate(table, 'time', lower, 'pos')
			) / 2;
		}
	}

	return {left: left, right: right};
}

function ticksFromTimestamps(values, majorUnit) {
	var ticks = [];
	var i, ilen, value, major;

	for (i = 0, ilen = values.length; i < ilen; ++i) {
		value = values[i];
		major = majorUnit ? value === +moment(value).startOf(majorUnit) : false;

		ticks.push({
			value: value,
			major: major
		});
	}

	return ticks;
}

function determineLabelFormat(data, timeOpts) {
	var i, momentDate, hasTime;
	var ilen = data.length;

	// find the label with the most parts (milliseconds, minutes, etc.)
	// format all labels with the same level of detail as the most specific label
	for (i = 0; i < ilen; i++) {
		momentDate = momentify(data[i], timeOpts);
		if (momentDate.millisecond() !== 0) {
			return 'MMM D, YYYY h:mm:ss.SSS a';
		}
		if (momentDate.second() !== 0 || momentDate.minute() !== 0 || momentDate.hour() !== 0) {
			hasTime = true;
		}
	}
	if (hasTime) {
		return 'MMM D, YYYY h:mm:ss a';
	}
	return 'MMM D, YYYY';
}

module.exports = function() {

	var defaultConfig = {
		position: 'bottom',

		/**
		 * Data distribution along the scale:
		 * - 'linear': data are spread according to their time (distances can vary),
		 * - 'series': data are spread at the same distance from each other.
		 * @see https://github.com/chartjs/Chart.js/pull/4507
		 * @since 2.7.0
		 */
		distribution: 'linear',

		/**
		 * Scale boundary strategy (bypassed by min/max time options)
		 * - `data`: make sure data are fully visible, ticks outside are removed
		 * - `ticks`: make sure ticks are fully visible, data outside are truncated
		 * @see https://github.com/chartjs/Chart.js/pull/4556
		 * @since 2.7.0
		 */
		bounds: 'data',

		time: {
			parser: false, // false == a pattern string from http://momentjs.com/docs/#/parsing/string-format/ or a custom callback that converts its argument to a moment
			format: false, // DEPRECATED false == date objects, moment object, callback or a pattern string from http://momentjs.com/docs/#/parsing/string-format/
			unit: false, // false == automatic or override with week, month, year, etc.
			round: false, // none, or override with week, month, year, etc.
			displayFormat: false, // DEPRECATED
			isoWeekday: false, // override week start day - see http://momentjs.com/docs/#/get-set/iso-weekday/
			minUnit: 'millisecond',

			// defaults to unit's corresponding unitFormat below or override using pattern string from http://momentjs.com/docs/#/displaying/format/
			displayFormats: {
				millisecond: 'h:mm:ss.SSS a', // 11:20:01.123 AM,
				second: 'h:mm:ss a', // 11:20:01 AM
				minute: 'h:mm a', // 11:20 AM
				hour: 'hA', // 5PM
				day: 'MMM D', // Sep 4
				week: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
				month: 'MMM YYYY', // Sept 2015
				quarter: '[Q]Q - YYYY', // Q3
				year: 'YYYY' // 2015
			},
		},
		ticks: {
			autoSkip: false,

			/**
			 * Ticks generation input values:
			 * - 'auto': generates "optimal" ticks based on scale size and time options.
			 * - 'data': generates ticks from data (including labels from data {t|x|y} objects).
			 * - 'labels': generates ticks from user given `data.labels` values ONLY.
			 * @see https://github.com/chartjs/Chart.js/pull/4507
			 * @since 2.7.0
			 */
			source: 'auto',

			major: {
				enabled: false
			}
		}
	};

	var TimeScale = Scale.extend({
		initialize: function() {
			if (!moment) {
				throw new Error('Chart.js - Moment.js could not be found! You must include it before Chart.js to use the time scale. Download at https://momentjs.com');
			}

			this.mergeTicksOptions();

			Scale.prototype.initialize.call(this);
		},

		update: function() {
			var me = this;
			var options = me.options;

			// DEPRECATIONS: output a message only one time per update
			if (options.time && options.time.format) {
				console.warn('options.time.format is deprecated and replaced by options.time.parser.');
			}

			return Scale.prototype.update.apply(me, arguments);
		},

		/**
		 * Allows data to be referenced via 't' attribute
		 */
		getRightValue: function(rawValue) {
			if (rawValue && rawValue.t !== undefined) {
				rawValue = rawValue.t;
			}
			return Scale.prototype.getRightValue.call(this, rawValue);
		},

		determineDataLimits: function() {
			var me = this;
			var chart = me.chart;
			var timeOpts = me.options.time;
			var unit = timeOpts.unit || 'day';
			var min = MAX_INTEGER;
			var max = MIN_INTEGER;
			var timestamps = [];
			var datasets = [];
			var labels = [];
			var i, j, ilen, jlen, data, timestamp;

			// Convert labels to timestamps
			for (i = 0, ilen = chart.data.labels.length; i < ilen; ++i) {
				labels.push(parse(chart.data.labels[i], me));
			}

			// Convert data to timestamps
			for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
				if (chart.isDatasetVisible(i)) {
					data = chart.data.datasets[i].data;

					// Let's consider that all data have the same format.
					if (helpers.isObject(data[0])) {
						datasets[i] = [];

						for (j = 0, jlen = data.length; j < jlen; ++j) {
							timestamp = parse(data[j], me);
							timestamps.push(timestamp);
							datasets[i][j] = timestamp;
						}
					} else {
						timestamps.push.apply(timestamps, labels);
						datasets[i] = labels.slice(0);
					}
				} else {
					datasets[i] = [];
				}
			}

			if (labels.length) {
				// Sort labels **after** data have been converted
				labels = arrayUnique(labels).sort(sorter);
				min = Math.min(min, labels[0]);
				max = Math.max(max, labels[labels.length - 1]);
			}

			if (timestamps.length) {
				timestamps = arrayUnique(timestamps).sort(sorter);
				min = Math.min(min, timestamps[0]);
				max = Math.max(max, timestamps[timestamps.length - 1]);
			}

			min = parse(timeOpts.min, me) || min;
			max = parse(timeOpts.max, me) || max;

			// In case there is no valid min/max, set limits based on unit time option
			min = min === MAX_INTEGER ? +moment().startOf(unit) : min;
			max = max === MIN_INTEGER ? +moment().endOf(unit) + 1 : max;

			// Make sure that max is strictly higher than min (required by the lookup table)
			me.min = Math.min(min, max);
			me.max = Math.max(min + 1, max);

			// PRIVATE
			me._horizontal = me.isHorizontal();
			me._table = [];
			me._timestamps = {
				data: timestamps,
				datasets: datasets,
				labels: labels
			};
		},

		buildTicks: function() {
			var me = this;
			var min = me.min;
			var max = me.max;
			var options = me.options;
			var timeOpts = options.time;
			var timestamps = [];
			var ticks = [];
			var i, ilen, timestamp;

			switch (options.ticks.source) {
			case 'data':
				timestamps = me._timestamps.data;
				break;
			case 'labels':
				timestamps = me._timestamps.labels;
				break;
			case 'auto':
			default:
				timestamps = generate(min, max, me.getLabelCapacity(min), options);
			}

			if (options.bounds === 'ticks' && timestamps.length) {
				min = timestamps[0];
				max = timestamps[timestamps.length - 1];
			}

			// Enforce limits with user min/max options
			min = parse(timeOpts.min, me) || min;
			max = parse(timeOpts.max, me) || max;

			// Remove ticks outside the min/max range
			for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
				timestamp = timestamps[i];
				if (timestamp >= min && timestamp <= max) {
					ticks.push(timestamp);
				}
			}

			me.min = min;
			me.max = max;

			// PRIVATE
			me._unit = timeOpts.unit || determineUnitForFormatting(ticks, timeOpts.minUnit, me.min, me.max);
			me._majorUnit = determineMajorUnit(me._unit);
			me._table = buildLookupTable(me._timestamps.data, min, max, options.distribution);
			me._offsets = computeOffsets(me._table, ticks, min, max, options);
			me._labelFormat = determineLabelFormat(me._timestamps.data, timeOpts);

			return ticksFromTimestamps(ticks, me._majorUnit);
		},

		getLabelForIndex: function(index, datasetIndex) {
			var me = this;
			var data = me.chart.data;
			var timeOpts = me.options.time;
			var label = data.labels && index < data.labels.length ? data.labels[index] : '';
			var value = data.datasets[datasetIndex].data[index];

			if (helpers.isObject(value)) {
				label = me.getRightValue(value);
			}
			if (timeOpts.tooltipFormat) {
				return momentify(label, timeOpts).format(timeOpts.tooltipFormat);
			}
			if (typeof label === 'string') {
				return label;
			}

			return momentify(label, timeOpts).format(me._labelFormat);
		},

		/**
		 * Function to format an individual tick mark
		 * @private
		 */
		tickFormatFunction: function(tick, index, ticks, formatOverride) {
			var me = this;
			var options = me.options;
			var time = tick.valueOf();
			var formats = options.time.displayFormats;
			var minorFormat = formats[me._unit];
			var majorUnit = me._majorUnit;
			var majorFormat = formats[majorUnit];
			var majorTime = tick.clone().startOf(majorUnit).valueOf();
			var majorTickOpts = options.ticks.major;
			var major = majorTickOpts.enabled && majorUnit && majorFormat && time === majorTime;
			var label = tick.format(formatOverride ? formatOverride : major ? majorFormat : minorFormat);
			var tickOpts = major ? majorTickOpts : options.ticks.minor;
			var formatter = helpers.valueOrDefault(tickOpts.callback, tickOpts.userCallback);

			return formatter ? formatter(label, index, ticks) : label;
		},

		convertTicksToLabels: function(ticks) {
			var labels = [];
			var i, ilen;

			for (i = 0, ilen = ticks.length; i < ilen; ++i) {
				labels.push(this.tickFormatFunction(moment(ticks[i].value), i, ticks));
			}

			return labels;
		},

		/**
		 * @private
		 */
		getPixelForOffset: function(time) {
			var me = this;
			var size = me._horizontal ? me.width : me.height;
			var start = me._horizontal ? me.left : me.top;
			var pos = interpolate(me._table, 'time', time, 'pos');

			return start + size * (me._offsets.left + pos) / (me._offsets.left + 1 + me._offsets.right);
		},

		getPixelForValue: function(value, index, datasetIndex) {
			var me = this;
			var time = null;

			if (index !== undefined && datasetIndex !== undefined) {
				time = me._timestamps.datasets[datasetIndex][index];
			}

			if (time === null) {
				time = parse(value, me);
			}

			if (time !== null) {
				return me.getPixelForOffset(time);
			}
		},

		getPixelForTick: function(index) {
			var ticks = this.getTicks();
			return index >= 0 && index < ticks.length ?
				this.getPixelForOffset(ticks[index].value) :
				null;
		},

		getValueForPixel: function(pixel) {
			var me = this;
			var size = me._horizontal ? me.width : me.height;
			var start = me._horizontal ? me.left : me.top;
			var pos = (size ? (pixel - start) / size : 0) * (me._offsets.left + 1 + me._offsets.left) - me._offsets.right;
			var time = interpolate(me._table, 'pos', pos, 'time');

			return moment(time);
		},

		/**
		 * Crude approximation of what the label width might be
		 * @private
		 */
		getLabelWidth: function(label) {
			var me = this;
			var ticksOpts = me.options.ticks;
			var tickLabelWidth = me.ctx.measureText(label).width;
			var angle = helpers.toRadians(ticksOpts.maxRotation);
			var cosRotation = Math.cos(angle);
			var sinRotation = Math.sin(angle);
			var tickFontSize = helpers.valueOrDefault(ticksOpts.fontSize, defaults.global.defaultFontSize);

			return (tickLabelWidth * cosRotation) + (tickFontSize * sinRotation);
		},

		/**
		 * @private
		 */
		getLabelCapacity: function(exampleTime) {
			var me = this;

			var formatOverride = me.options.time.displayFormats.millisecond;	// Pick the longest format for guestimation

			var exampleLabel = me.tickFormatFunction(moment(exampleTime), 0, [], formatOverride);
			var tickLabelWidth = me.getLabelWidth(exampleLabel);
			var innerWidth = me.isHorizontal() ? me.width : me.height;

			var capacity = Math.floor(innerWidth / tickLabelWidth);
			return capacity > 0 ? capacity : 1;
		}
	});

	scaleService.registerScaleType('time', TimeScale, defaultConfig);
};

},{"1":1,"26":26,"33":33,"34":34,"46":46}]},{},[7])(7)
});

var ActionResult;
(function (ActionResult) {
    ActionResult["DISPLAY"] = "display";
    ActionResult["LOAD"] = "load";
    ActionResult["RELOAD"] = "reload";
    ActionResult["OVERLAY"] = "overlay";
    ActionResult["MODAL"] = "popup";
    ActionResult["CLOSE"] = "close";
    ActionResult["NONE"] = "none";
})(ActionResult || (ActionResult = {}));
//# sourceMappingURL=actionresult.js.map
var Method;
(function (Method) {
    Method["GET"] = "get";
    Method["POST"] = "post";
    Method["PUT"] = "put";
    Method["DELETE"] = "delete";
    Method["POPSTATE"] = "popstate";
})(Method || (Method = {}));
//# sourceMappingURL=method.js.map
var ServiceName;
(function (ServiceName) {
    ServiceName[ServiceName["Cystem"] = 0] = "Cystem";
    ServiceName[ServiceName["Navigate"] = 1] = "Navigate";
    ServiceName[ServiceName["OverlayHelper"] = 2] = "OverlayHelper";
    ServiceName[ServiceName["ModalHelper"] = 3] = "ModalHelper";
    ServiceName[ServiceName["Materialize"] = 4] = "Materialize";
    ServiceName[ServiceName["Graph"] = 5] = "Graph";
    ServiceName[ServiceName["Formtab"] = 6] = "Formtab";
    ServiceName[ServiceName["FloatingActionButton"] = 7] = "FloatingActionButton";
})(ServiceName || (ServiceName = {}));
//# sourceMappingURL=service.js.map
//# sourceMappingURL=iservice.js.map
//# sourceMappingURL=iservicemanager.js.map
var ServiceManager = (function () {
    function ServiceManager() {
        this._services = [];
    }
    ServiceManager.prototype.register = function (r) {
        var registerable = new r(this);
        this._services[registerable.Name] = registerable;
    };
    ServiceManager.prototype.get = function (r) {
        var registerable = new r();
        var o = this._services[registerable.Name];
        return o;
    };
    ServiceManager.prototype.getServices = function () {
        return this._services;
    };
    ServiceManager.prototype.init = function () {
        for (var _i = 0, _a = this._services; _i < _a.length; _i++) {
            var service = _a[_i];
            service.construct(this);
        }
    };
    return ServiceManager;
}());
//# sourceMappingURL=servicemanager.js.map
var Component = (function () {
    function Component($component) {
        this.$component = $component;
    }
    Component.prototype.replace = function ($replace) {
        this.$component.children().replaceWith($replace);
    };
    Component.prototype.getParent = function () {
        var $parent = this.$component.closest('.component-wrapper');
        return new Component($parent);
    };
    Component.prototype.getMain = function () {
        var $main = this.$component.closest('.main-component');
        return new Component($main);
    };
    return Component;
}());
//# sourceMappingURL=component.js.map
//# sourceMappingURL=modalcomponent.js.map
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var OverlayComponent = (function (_super) {
    __extends(OverlayComponent, _super);
    function OverlayComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OverlayComponent;
}(Component));
//# sourceMappingURL=overlaycomponent.js.map
var LoadAction = (function () {
    function LoadAction($el, method) {
        if (method === void 0) { method = Method.GET; }
        this.$el = $el;
        var actionResult = this.getActionResult($el);
        var url = this.getUrl($el);
        var data = this.getData($el, actionResult);
        var ajax = new AjaxAction(method, url, data, actionResult);
        ajax.send(this.onResult, this);
    }
    LoadAction.prototype.onResult = function (response) {
        var component = new Component(this.$el.closest('.component-wrapper'));
        component.replace($(response));
    };
    LoadAction.prototype.getActionResult = function ($el) {
        var actionResult = ActionResult.DISPLAY;
        if ($el.length) {
            var result = $el.data('on-result');
            if (result) {
                var resultKey = result.toUpperCase();
                actionResult = ActionResult[resultKey];
            }
        }
        return actionResult;
    };
    ;
    LoadAction.prototype.getUrl = function ($el, keepParams) {
        if (keepParams === void 0) { keepParams = false; }
        var url;
        if ($el[0].hasAttribute('href')) {
            url = $el.attr('href');
        }
        else {
            url = $el.data('url');
        }
        if (keepParams) {
            return url;
        }
        else {
            return url.split('?')[0];
        }
    };
    ;
    LoadAction.prototype.getData = function ($el, actionResult) {
        var url = this.getUrl($el, true).split('?');
        var data = $el ? $el.data('params') : {};
        data = data || {};
        if (url.length > 1) {
            var paramString = url[1];
            var params = paramString.split('&');
            $.each(params, function (_, param) {
                var keyValuePair = param.split('=');
                if (keyValuePair.length === 2) {
                    data[keyValuePair[0]] = keyValuePair[1];
                }
            });
        }
        data.CurrentLayout = $("#Layout").val();
        data.Layout = "AjaxLayout";
        return data;
    };
    ;
    return LoadAction;
}());
//# sourceMappingURL=loadaction.js.map
var AjaxAction = (function () {
    function AjaxAction(method, url, data, actionResult) {
        if (actionResult === void 0) { actionResult = ActionResult.DISPLAY; }
        this.method = method;
        this.url = url;
        this.data = data;
        this.actionResult = actionResult;
    }
    AjaxAction.prototype.send = function (fnSucces, self) {
        $.ajax({
            method: this.method,
            url: this.url,
            data: this.data,
            mimeType: 'text/html'
        }).done(function (response, status, xhr) {
            switch (xhr.status) {
                case 200:
                    fnSucces.call(self, response);
                    break;
                case 205:
                    this.data.Layout = "None";
                    window.location.href = this.url;
                    break;
                default:
                    console.log('unknown status: ', xhr.status);
                    break;
            }
        }).fail(function (error) {
            var $popup = $('<div class="popup error"></div>');
            var $wrapper = $('<div class="wrapper"></div>');
            var $closeButton = $('<div class="close">x</div>');
            var $iframe = $('<iframe>');
            $wrapper.append($closeButton);
            $wrapper.append($iframe);
            $popup.append($wrapper);
            $('body').append($popup);
            setTimeout(function () {
                var iframe = $iframe[0];
                var doc = iframe.contentWindow.document;
                var $iframeBody = $('body', doc);
                $iframeBody.html(error.responseText);
                $closeButton.click(function () { $popup.remove(); });
            }, 1);
        });
    };
    return AjaxAction;
}());
//# sourceMappingURL=ajaxaction.js.map
var Cystem = (function () {
    function Cystem() {
        this.parsers = [];
        this.bindActions($('body'));
    }
    Cystem.prototype.bindActions = function ($el) {
        $el.find('.load').each(function (_, el) {
            var action = new LoadAction($(el));
        });
    };
    Cystem.prototype.getComponent = function ($component) {
        return new Component($component);
    };
    return Cystem;
}());
//# sourceMappingURL=cystem.js.map
var cystem = new Cystem();
//# sourceMappingURL=init.js.map