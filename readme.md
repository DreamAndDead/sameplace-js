# sameplace-js
GPS坐标系统有多种标准，遵循不同的标准，相同的GPS经纬度坐标对应不同的绝对地址（地球上实际的一点）。sameplace-js在不同的标准间转换GPS坐标值。

## 介绍

谷歌地球、腾讯地图、高德地图、百度地图针对不同的大地地理坐标系标准制作经纬度，由于参照物不一样，得出的经纬度值不同。

+ WGS84坐标系：地球坐标系，国际上通用的坐标系
+ GCJ02坐标系：火星坐标系，WGS84坐标系经加密后的坐标系
+ BD09坐标系：百度坐标系，GCJ02坐标系经加密后的坐标系

硬件/谷歌地球卫星采用WGS84地理坐标系（中国范围除外），腾讯地图/高德地图采用GCJ02地理坐标系，百度地图采用BD09坐标系。

## 安装

    npm install --save sameplace-js

## example

```javascript
// ES6
import transformer, { makeCoord, coordLat } from 'sameplace-js'

let wgs = makeCoord(22.34, 44.233511);
let bd = transformer('wgs', 'bd', wgs);

console.log('bd latitude', coordLat(bd));
```

## usage
```javascript
// ES6
import transformer, { makeCoord, coordLat, coordLon } from 'sameplace-js'

// CommonJS
var sameplace = require("sameplace-js");
var transformer = sameplace.default;
var makeCoord = sameplace.makeCoord;
var coordLat = sameplace.coordLat;
var coordLon = sameplace.coordLon;

// AMD
define([ "sameplace-js", function(sameplace) {
    // sameplace is available
    var sameplace = require("sameplace-js");
    var transformer = sameplace.default;
    var makeCoord = sameplace.makeCoord;
    var coordLat = sameplace.coordLat;
    var coordLon = sameplace.coordLon;
});
```

## API
type:
- number: latitude, longitude
- object: coord
- string (one of 'wgs', 'gcj' and 'bd'): from, to

    // create a coord
    makeCoord(latitude, longitude) ==> coord

    // get latitude
    coordLat(coord) ==> latitude

    // get longitude
    coordLon(coord) ==> longitude

    // coordinate transformer
    transformer(from, to, fromCoord) ==> toCoord

## 参考链接

[gps坐标标准的区别](http://www.jianshu.com/p/0fe30fcd4ae7)

[gps坐标查询（支持多标准）](http://www.gpsspg.com/maps.htm)


