const port = 8887;

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

function bytearrayToInt(bytearray) {
	return Uint16Array.from(bytearray)[0];
}


const filter= {
	singleColumnValueFilter: {
		columnFamily: 'zoom6',
		columnQualifier: 'x',
		compareOp: 'NOT_EQUAL',
		comparator:{
			substringComparator: {
			substr: "test"
		    }
	   },
  }
};

scan.setFilter(filter);

/*
function getData(){
scan.toArray(function(err, res2) {
  console.log("start toArray");
	//console.log(res2);
  var i = 0;
	for(var row of res2){
    //console.log(row.columnFamily.toString('utf8'));
    /*for(var cols of row.columns){
      console.log(cols);
    }

    //console.log(row.columns);
    //console.log(row.cols);
    console.log(i);
    i++;
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

  }
		//console.log("Lat : " + rowLat);
		//console.log("Lng : " + rowLng);
		//data.point.push(point);
    //console.log("H : " + rowH);
    console.log(data);
console.log("Fin scanToArray");
});
}
*/
var data = {
  point:[]
};

//var data = {};

  scan.next(function(err, row) {
    /*for (var i ; i< row.columns.length;i++){
      console.log(row.columns[i].family);
    console.log(row.columns[i].family.toString('utf8'));
  }
  	/*for(var val in arguments){*/
    console.log(row.cols);
      var rowX = bytearrayToInt(row.cols['zoom0:x'].value);
      var rowY = bytearrayToInt(row.cols['zoom0:y'].value);
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
      console.log(rowX);
      console.log(rowY);
      data.point.push(point);
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
      */
  	//}
  });

function cleanPoint(d){
    //console.log(d.point);
    var data = [];
    var lat = (((d.point[0].x)*256)*(1/1201));
    var lng = (((d.point[0].y)*256)*(1/1201));
    //console.log(d.point[0].value);
    var c = 0;
    for(var i = 0 ; i < d.point[0].value.length;i++){
      c++;
    var h = d.point[0].value[i];
    lat+=0.00001;
    if(c > 256){
      lng+=0.00001;
      c = 0
    }
    var point = {
      "lat": lat,
      "lng": lng,
      "height": h
    };
    data.push(point);
  }
    //console.log(point);
    return data;
  }





// Rendre public l'acces aux donnes statique
app.use(express.static(path.join(__dirname, 'public')));

// Implementation des routes
app.get('/clenerestan',function(req,res){
    res.sendFile(path.join(__dirname+'/public/index.html'));
});

app.get('/clenerestan/json', function(req,res){
 res.jsonp(JSON.stringify(cleanPoint(data)));
});


//Lancement du serv
app.listen(port);
console.log("Listen on " + port);
