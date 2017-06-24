(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'invariant'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('invariant'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.invariant);
        global.sameplace = mod.exports;
    }
})(this, function (exports, _invariant) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.coordLon = exports.coordLat = exports.makeCoord = undefined;

    var _invariant2 = _interopRequireDefault(_invariant);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var PI = 3.14159265358979324;
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;

    function delta(coord) {
        var lon = coord.longitude;
        var lat = coord.latitude;
        // Krasovsky 1940
        // a = 6378245.0, 1/f = 298.3
        // b = a * (1 - f)
        // ee = (a^2 - b^2) / a^2;
        var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
        var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
        var dLat = transformLat(lon - 105.0, lat - 35.0);
        var dLon = transformLon(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * PI;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * PI);
        dLon = dLon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * PI);
        return makeCoord(dLat, dLon);
    }
    function transformLat(x, y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
        return ret;
    }
    function transformLon(x, y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
        return ret;
    }

    function outOfChina(coord) {
        var lon = coord.longitude;
        var lat = coord.latitude;
        if (lon < 72.004 || lon > 137.8347) return true;
        if (lat < 0.8293 || lat > 55.8271) return true;
        return false;
    }

    function makeCoord(lat, lon) {
        return { 'latitude': lat, 'longitude': lon };
    }
    function coordLat(coord) {
        return coord.latitude;
    }
    function coordLon(coord) {
        return coord.longitude;
    }
    function coordAdd(coordA, coordB) {
        return makeCoord(coordLat(coordA) + coordLat(coordB), coordLon(coordA) + coordLon(coordB));
    }
    function coordSub(coordA, coordB) {
        return makeCoord(coordLat(coordA) - coordLat(coordB), coordLon(coordA) - coordLon(coordB));
    }

    //WGS-84 to GCJ-02
    function wgs2gcj(wgs) {
        if (outOfChina(wgs)) return wgs;

        var d = delta(wgs);
        return coordAdd(wgs, d);
    }
    //GCJ-02 to WGS-84
    function gcj2wgs(gcj) {
        if (outOfChina(gcj)) return gcj;

        var d = delta(gcj);
        return coordSub(gcj, d);
    }

    //GCJ-02 to BD-09
    function gcj2bd(gcj) {
        var x = gcj.longitude,
            y = gcj.latitude;
        var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
        var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
        var bdLat = z * Math.sin(theta) + 0.006;
        var bdLon = z * Math.cos(theta) + 0.0065;
        return makeCoord(bdLat, bdLon);
    }
    //BD-09 to GCJ-02
    function bd2gcj(bd) {
        var x = bd.longitude - 0.0065,
            y = bd.latitude - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
        var gcjLat = z * Math.sin(theta);
        var gcjLon = z * Math.cos(theta);
        return makeCoord(gcjLat, gcjLon);
    }

    function isStandard(standard) {
        return standard == 'wgs' || standard == 'gcj' || standard == 'bd';
    }
    function isCoord(coord) {
        return 'latitude' in coord && 'longitude' in coord;
    }

    var transformer = {
        wgs: {
            gcj: wgs2gcj,
            bd: function bd(coord) {
                return gcj2bd(wgs2gcj(coord));
            }
        },
        gcj: {
            wgs: gcj2wgs,
            bd: gcj2bd
        },
        bd: {
            wgs: function wgs(coord) {
                return gcj2wgs(bd2gcj(coord));
            },
            gcj: bd2gcj
        }
    };

    function transformCoord(from, to, coord) {
        (0, _invariant2.default)(isStandard(from), "can't transform from an unknown standard");
        (0, _invariant2.default)(isStandard(to), "can't transform to an unknown standard");
        (0, _invariant2.default)(isCoord(coord), "bad coordinate");

        if (from == to) return coord;
        return transformer[from][to](coord);
    }

    exports.default = transformCoord;
    exports.makeCoord = makeCoord;
    exports.coordLat = coordLat;
    exports.coordLon = coordLon;
});
