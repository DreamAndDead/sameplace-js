import converter, {makeCoord, coordLat, coordLon} from './sameplace'

// wgs 坐标转化为 gcj, bd坐标
let wgs = makeCoord(22.5475670666,113.9410678988);

let gcj = converter('wgs', 'gcj', wgs);

let bd = converter('wgs', 'bd', wgs);

function betterLog(type, coord) {
  console.log(type, coordLat(coord), ',', coordLon(coord));
}

betterLog('wgs', wgs);
betterLog('gcj', gcj);
betterLog('bd', bd);


let b = makeCoord(22.5504037212,113.9523378693);

let g = converter('bd', 'gcj', b);

let w = converter('bd', 'wgs', b);

betterLog('bd', b);
betterLog('g', g);
betterLog('w', w);
