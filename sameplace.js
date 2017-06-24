import invariant from 'invariant'

const PI = 3.14159265358979324;
const x_pi = 3.14159265358979324 * 3000.0 / 180.0;

function delta(coord) {
    let lon = coord.longitude;
    let lat = coord.latitude;
    // Krasovsky 1940
    // a = 6378245.0, 1/f = 298.3
    // b = a * (1 - f)
    // ee = (a^2 - b^2) / a^2;
    const a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
    const ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
    let dLat = transformLat(lon - 105.0, lat - 35.0);
    let dLon = transformLon(lon - 105.0, lat - 35.0);
    let radLat = lat / 180.0 * PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    let sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
    return makeCoord(dLat, dLon);
}
function transformLat(x, y) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
    return ret;
}
function transformLon(x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
}

function outOfChina(coord) {
    let lon = coord.longitude;
    let lat = coord.latitude;
    if (lon < 72.004 || lon > 137.8347)
        return true;
    if (lat < 0.8293 || lat > 55.8271)
        return true;
    return false;
}

function makeCoord(lat, lon) {
    return {'latitude': lat, 'longitude': lon};
}
function coordLat(coord) {
    return coord.latitude;
}
function coordLon(coord) {
    return coord.longitude;
}
function coordAdd(coordA, coordB) {
    return makeCoord(
        coordLat(coordA) + coordLat(coordB),
        coordLon(coordA) + coordLon(coordB)
    );
}
function coordSub(coordA, coordB) {
    return makeCoord(
        coordLat(coordA) - coordLat(coordB),
        coordLon(coordA) - coordLon(coordB)
    );
}

//WGS-84 to GCJ-02
function wgs2gcj(wgs) {
    if (outOfChina(wgs))
        return wgs;

    let d = delta(wgs);
    return coordAdd(wgs, d);
}
//GCJ-02 to WGS-84
function gcj2wgs(gcj) {
    if (outOfChina(gcj))
        return gcj;

    let d = delta(gcj);
    return coordSub(gcj, d);
}

//GCJ-02 to BD-09
function gcj2bd(gcj) {
    let x = gcj.longitude, y = gcj.latitude;
    let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    let bdLat = z * Math.sin(theta) + 0.006;
    let bdLon = z * Math.cos(theta) + 0.0065;
    return makeCoord(bdLat, bdLon);
}
//BD-09 to GCJ-02
function bd2gcj(bd) {
    let x = bd.longitude - 0.0065, y = bd.latitude - 0.006;
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    let gcjLat = z * Math.sin(theta);
    let gcjLon = z * Math.cos(theta);
    return makeCoord(gcjLat, gcjLon);
}

function isStandard(standard) {
    return standard == 'wgs' || standard == 'gcj' || standard == 'bd';
}
function isCoord(coord) {
    return ('latitude' in coord && 'longitude' in coord);
}

let transformer = {
    wgs: {
        gcj: wgs2gcj,
        bd: coord => gcj2bd(wgs2gcj(coord))
    },
    gcj: {
        wgs: gcj2wgs,
        bd: gcj2bd,
    },
    bd: {
        wgs: coord => gcj2wgs(bd2gcj(coord)),
        gcj: bd2gcj,
    }
};

function transformCoord(from, to, coord) {
    invariant(isStandard(from), "can't transform from an unknown standard");
    invariant(isStandard(to), "can't transform to an unknown standard");
    invariant(isCoord(coord), "bad coordinate");

    if (from == to)
        return coord;
    return transformer[from][to](coord);
}

export default transformCoord;

export { makeCoord, coordLat, coordLon };


