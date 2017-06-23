var gps = require('./gps')

// wgs 坐标转化为 gcj, bd坐标
var wgs_x = 22.550184;
var wgs_y = 113.952354;

var gcj_res = gps.wgs2gcj(wgs_x, wgs_y);
var gcj_x = gcj_res.lat;
var gcj_y = gcj_res.lon;

var bd_res = gps.gcj2bd(gcj_x, gcj_y);
var bd_x = bd_res.lat;
var bd_y = bd_res.lon;

function betterLog(type, x, y) {
  console.log(type, x, ',', y);
}

betterLog('wgs', wgs_x, wgs_y);
betterLog('gcj', gcj_x, gcj_y);
betterLog('bd', bd_x, bd_y);
