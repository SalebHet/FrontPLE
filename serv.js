const port = 8888;

const BitConverter = require('bit-converter');
var express = require('express');
var app = express();
var path = require('path');
//var staticmap = require('./public/initMap.js');
//var map = staticmap.map;

app.set('jsonp callback', true);

const hbase = require("hbase-rpc-client");

const client = hbase({
    zookeeperHosts: ["localhost"], // required
    zookeeperRoot: "/hbase",

});

client.on("error", err => console.log("hbase client error:", err));


const scan = client.getScanner('antCleImg');

var data = {
  point:[]
};



/*
const filter= {
	singleColumnValueFilter: {
		columnFamily: 'zoom6',
		columnQualifier: 'value',
		compareOp: 'NOT_EQUAL',
		comparator:{
			substringComparator: {
			substr: "test"
		    }
	   },
  }
};
*/
//scan.setFilter({columnPrefixFilter: {prefix: 'zoom6'}});


//function getData(){
scan.toArray(function(err, res2) {
  console.log("start toArray");
	//console.log(res2);
	for(var row of res2){
    //console.log(row.columnFamily.toString('utf8'));
    /*for(var cols of row.columns){
      console.log(cols);
    }*/

    //console.log(row.columns);
    //console.log(row.cols);
    var rowX = BitConverter.toShort(row.cols['zoom0:x'].value);
    var rowY = BitConverter.toShort(row.cols['zoom0:y'].value);
		var tabVal = row.cols['zoom0:value'].value;
    var tabValC = [];
    //console.log(tabVal);
    for(var b in tabVal){
      //console.log(BitConverter.toShort(b));
      tabValC.push(BitConverter.toShort(b));
    }
    var point = {
      "x": rowX,
      "y": rowY,
      "value": tabValC
    };
    data.point.push(point);
    //var rowLng = row.cols['loc:lng'].value.toString('utf8');
		//var rowH = row.cols['zoom1:hauteur'].value.toString('utf8')
    /*var point = {
    "lat": rowLat,
    "lng": rowLng,
    "height": 75

    point.lat = rowLat;
		point.lng = rowLng;
		point.height = 75;
    */
  }
		//console.log("Lat : " + rowLat);
		//console.log("Lng : " + rowLng);
		//data.point.push(point);
    //console.log("H : " + rowH);
    console.log(data);
console.log("Fin scanToArray");
});
//}


/*
var data = {};
scan.next(function(err, row) {
	console.log("Start next");
	for(var val in arguments){
	   //console.log(row);
     var tabB  = row.cols['zoom0:value'].value;
     for (var b in tabB ){
       console.log(BitConverter.toShort(b));
     }
		  //console.log("row.columns = " + row.columns);
    /*
    var rowLat = parseFloat(row.cols['zoom1:lat'].value.toString('utf8'));
		var rowLng = parseFloat(row.cols['zoom1:lng'].value.toString('utf8'));
		var rowH = parseInt(row.cols['zoom1:hauteur'].value.toString('utf8'));
		console.log("lat: " + rowLat);
    data.lat = rowLat;
    data.lng = rowLng;
    data.height = rowH;
    console.log("lng :" + rowLng);
    console.log("H: " + rowH);

		console.log(val.toString());
	}
		console.log("Arguments" + arguments);
		console.log("Fin Next");
});

/*
//Mise en place heatmap
// don't forget to add gmaps-heatmap.js
var myLatlng = new google.maps.LatLng(25.6586, -80.3568);
// map options,
var myOptions = {
  zoom: 3,
  center: myLatlng
};
// standard map
map = new google.maps.Map(document.getElementById("map"), myOptions);
// heatmap layer
heatmap = new HeatmapOverlay(map,
  {
    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    "radius": 2,
    "maxOpacity": 1,
    // scales the radius based on map zoom
    "scaleRadius": true,
    // if set to false the heatmap uses the global maximum for colorization
    // if activated: uses the data maximum within the current map boundaries
    //   (there will always be a red spot with useLocalExtremas true)
    "useLocalExtrema": true,
    // which field name in your data represents the latitude - default "lat"
    latField: 'lat',
    // which field name in your data represents the longitude - default "lng"
    lngField: 'lng',
    // which field name in your data represents the data value - default "value"
    valueField: 'count'
  }
);

var testData = {
  max: 8,
  data: [{lat: 24.6408, lng:46.7728, count: 3},
    {lat: 50.75, lng:-1.55, count: 1},
    {lat: 45.75, lng: 1.55, count: 5},
    {lat: 44.808488, lng:-0.596694, count: 25},
    {lat: 75.120, lng:32.0123, count: 7},]
};

heatmap.setData(testData);



*/






// Rendre public l'acces aux donnes statique
app.use(express.static(path.join(__dirname, 'public')));

// Implementation des routes
app.get('/clenerestan',function(req,res){
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.get('/clenerestan/json',function(req,res){
  //getData();
  console.log("jsonP = " + data);
  res.jsonp(JSON.stringify(data));
});


//Lancement du serv
app.listen(port);
console.log("Listen on " + port);
