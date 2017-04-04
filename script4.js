
//First, append <svg> element and implement the margin convention
var m = {t:50,r:50,b:50,l:50};
var outerWidth = document.getElementById('container').clientWidth,
    outerHeight = document.getElementById('container').clientHeight;
var w = outerWidth - m.l - m.r,
    h = outerHeight - m.t - m.b;    

var canvasW = document.getElementById('canvas').clientWidth,
    canvasH = document.getElementById('canvas').clientHeight;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width',canvasW)
    .attr('height',canvasH+20)
    .append('g')
    .attr('transform','translate(0,0)');

//set menu's height
d3.select('.menu')
  .attr('height',outerHeight);

var dsir = d3.select('.menu')
    .select('.dsir')
    .append('svg')
    .attr('width','100%')
    .attr('height',outerHeight)
    .append('g')
    .attr('transform','translate(0,0)');

//Control element
var control = d3.select('.control')
    .append('svg')
    .attr('width','100%')
    .attr('height','100px')
    .append('g')
    .attr('width','100%')
    .attr('height','100px')
    .attr('transform','translate(0,50)');


var mapData = d3.map();

//Map projection
var projection = d3.geoMercator();

var path = d3.geoPath()
      .projection(projection);

var map;

//Import data and parse
d3.queue()
  .defer(d3.csv,'./data/R&Dlabs.csv',parse)
  .defer(d3.csv,'./data/DSIRcode.csv',parseCode)
  // .defer(d3.)
  .defer(d3.json, './data/india_states.geojson')
  .await(dataLoaded);

var labByYear;
var labCount = [];

function dataLoaded(err, data, code, india) {
  
  // console.log(india);
  mapData = d3.map(code, function(d){ return d.code; })

  map = d3.map(india.features, function(d){return d.properties.NAME_1});

  //create 8 buttons for DSIR
  var nestedByDsir = d3.nest().key(function(data){return data.dsir;})
      .entries(data);

  var dsirCode = nestedByDsir.map(function(d){
    return d.key;}
  );

  var nestByCity = d3.nest().key(function(d){return d.labCity})
      .rollup(function(d){return d.length})
      .entries(data);

  var cc = nestByCity.filter(function(d){return d.value>150;})

  console.log(cc);



  var nestedForFlatten = d3.nest().key(function(data){return data.dsir;})
      .key(function(data){return data.labCity;})
      .key(function(data){return data.year;})
      // .rollup(function(data){ return data.length; })
      .entries(data);

  nestedForFlatten.forEach(function(d) {
    var dsir = d.key;
    d.values.forEach(function(e) {
      var labCity = e.key;
      e.values.forEach(function(f) {
        var year = f.key;
        labCount.push({
          labCount: f.values.length,
          year: year,
          labCity: labCity,
          dsir: dsir,
          lat: f.values[0].lat,
          long: f.values[0].long
        });
      });
    });
  });
  // console.log(JSON.stringify(labCount));

  var dsirColor = d3.scaleOrdinal()
      .domain(dsirCode)
      .range(['#c24d62','#64328a','#293171','#236576','#395f2a','#684d1e','#e04d12','#565555'])
  
  var y = 100;

  var dsirScaleY = d3.scaleOrdinal()
      .domain(dsirCode)
      .range([y+50,y+100,y+150,y+200,y+250,y+300,y+350,y+400]);

  // CROSSFILTER
  var cf = crossfilter(labCount);
  var yearsDimension = cf.dimension(function(d) { return d.year; });
  var dsirDimension = cf.dimension(function(d) { return d.dsir; });
  yearsDimension.filter(2003);

  //Button for all industry
  var rectAll = dsir.selectAll('.dsirAll')
      .data([nestedByDsir])
      .enter()
      .append('rect')
      .attr('class','dsirAll')
      .attr('id','allCode')
      .style('fill','black')
      .attr('width','25px')
      .attr('height','25px')
      .attr('y','97px')
      .attr('x','10px')
      .on('mouseenter',function(d){
        return d3.select(this).style('opacity',0.4);
      })
      .on('mouseleave',function(d){
        return d3.select(this).style('opacity',1);
      })
      .on('click',function(d) {
        d3.selectAll(".dsirCode").classed("selected", false);

        if (d3.select(this).classed("selected")) {
          d3.select(this).classed("selected", false);
          dsirDimension.filterArray = [];
          dsirDimension.filter(function(e){ return dsirDimension.filterArray.includes(e+"");});
          drawCircle([], india);
          return;
        } else {
          dsirDimension.filterArray = [];
          d3.select(this).classed("selected", true);
        }

        var dsir = d3.select(this).attr("id");
        if (!dsirDimension.filterArray) {
          dsirDimension.filterArray = [];
        }
        if (dsirDimension.filterArray.includes(dsir)) {
          // IF DSIR IS IN filterArray THEN REMOVE IT
          dsirDimension.filterArray = dsirDimension.filterArray.filter(e => e != dsir);
        } else {
          // IF DSIR IS NOT IN filterArray THEN ADD IT
          dsirDimension.filterArray.push(dsir);
        }
        // console.log(dsir, dsirDimension.filterArray);
        dsirDimension.filter(null);
        var filteredData = dsirDimension.top(Infinity);
        // console.log(filteredData);
        drawCircle(filteredData,india);

      });

  var textAll = dsir.append('text')
      .attr('class','textAll')
      .style('fill','#222222')
      .attr('x','55')
      .attr('y','115px')
      .text('All Industry');


  //Button for each industry
  var rectG = dsir.selectAll('.dsirCode')
      .data(nestedByDsir)
      .enter()
      .append("g")
      .attr('transform','translate(10,0)');

  rectG.append('rect')
      .attr('class','dsirCode')
      .attr('id',function(d){ return d.key})
      .attr('width','25px')      
      .attr('height','25px')
      .attr('y',function(d){ return dsirScaleY(d.key)})
      .style('fill',function(d){ return dsirColor(d.key)})
      .on('mouseenter',function(d){
        return d3.select(this).style('opacity',0.4);
      })
      .on('mouseleave',function(d){
        return d3.select(this).style('opacity',1);
      })
      .on('click',function(d) {
        rectAll.classed("selected", false);

        if (d3.select(this).classed("selected")) {
          d3.select(this).classed("selected", false);
        } else {
          d3.select(this).classed("selected", true);
        }
        var dsir = d3.select(this).attr("id");
        if (!dsirDimension.filterArray) {
          dsirDimension.filterArray = [];
        }
        if (dsirDimension.filterArray.includes(dsir)) {
          // IF DSIR IS IN filterArray THEN REMOVE IT
          dsirDimension.filterArray = dsirDimension.filterArray.filter(e => e != dsir);
        } else {
          // IF DSIR IS NOT IN filterArray THEN ADD IT
          dsirDimension.filterArray.push(dsir);
        }
        // console.log(dsir, dsirDimension.filterArray);

        dsirDimension.filter(function(e){ return dsirDimension.filterArray.includes(e+"");});
        var filteredData = dsirDimension.top(Infinity);
        // console.log(filteredData);
        drawCircle(filteredData);

      })

  rectG
      .append('text')
      .attr('class','dsirText')
      .style('fill','#222222')
      .text(function(d){return mapData.get(d.key).des;})
      .attr('x',45)
      .attr('y',function(d){return dsirScaleY(d.key)+17});



 //Draw circles on map
  function drawCircle(data){

      data.forEach((d) => {
        var xy = projection([d.long, d.lat]);
        d.x = xy[0];
        d.y = xy[1];
      })

      var scaleR = d3.scaleLinear()
          .domain([0,300])
          .range([5,50]);
   
      var update = plot.selectAll('.lab')
          .data(data,function(d){return d.labCity});

      var enter = update
          .enter()
          .append('circle')
          .attr('class','lab')
          .on('click',function(d){console.log(d.labCity)});

      update.merge(enter)
           .attr('r',function(d){return scaleR(d.labCount)})
           .style('opacity',.5)
           .style('fill',function(d){return dsirColor(d.dsir)});

      update.exit().remove();

       var collide = d3.forceCollide()
           .radius(5);     

       var forceX = d3.forceX()
           .x(function(d){
            var xy = projection([d.long, d.lat]);
             return xy[0];
           });

      var forceY = d3.forceY()
          .y(function(d){
            var xy = projection([d.long, d.lat]);
             return xy[1];
          });
      var chargeForce = d3.forceManyBody()
       .strength(0);// -30 is by defult(for forceManyBody)

   //Force simulation
      var simulation = d3.forceSimulation(data)
          .force('positionX',forceX)
          .force('positionY',forceY)
          .force('collide',collide)
          .force('charge',chargeForce)
          .alpha(0.5)
          .on('tick',function(d){
          
            plot.selectAll('circle')
                .attr('cx',function(d){
                  return d.x})
                .attr('cy',function(d){
                  return d.y});
          });

  //Zoom in
   //  var zoom = d3.zoom()
   //  .on('start',function(){
   //    console.log('start')
   //  })
   //  .on('zoom',function(){
   //    console.log(d3.event.transform);
   //      //apply the transform to plot1, reset the original value of transform
   //    var t = d3.event.transform
   //    plot.attr('transform','translate('+(t.x+m.l)+','+(t.y+m.t)+')scale('+t.k+')');
   //    // plot.selectAll('circle')
   //    //      .attr('r',function(d){
   //    //       console.log(d); return d.labCount/t.k});
   //  })
   //  .on('end',function(){
   //    // console.log(d3.event);
   //    // console.log(this);
   //    // console.log(d3.event.transform);
   //  });

   // plot.append('rect')
   //     .attr('class','zoom')
   //     .attr('x',0)
   //     .attr('y',0)
   //     .attr('width',canvasW)
   //     .attr('height',canvasH)
   //     .style('fill','none')
   //     .style('pointer-events','all')
   //     .call(zoom);

  }

//Nest data for slider
 labByYear = d3.nest().key(function(data){return data.year})
      .map(data,d3.map);

  var years = labByYear.keys();

  timeSlider(years);

//Create time slider
  function timeSlider(years){
    //set scale
    scaleX = d3.scaleLinear()
        .domain([+years[0],+years[years.length-1]])
        .range([0,650])
        .clamp(true);

    //set axis
    axisX = d3.axisBottom()
        .scale(scaleX)
        .tickFormat(d3.format(''))
        .tickSizeOuter(0)
        .tickSizeInner(0)
        .tickPadding(15)
        .tickValues(years.map(function(y){return +y}));

    axisX = control.append('g')
        .attr('class','axis')
        .attr('width','100%')
        .attr('height','50px')
        .attr('transform','translate(20,0)')
        .call(axisX);
    
    //customize x axis appearance
    var axis_width = 20;

    axisX.selectAll('.tick').selectAll('text')
         .attr('text-anchor','middle')
         .attr('transform','translate(5)');

    axisX.append('line')
         .attr('class','domain-offset')
         .attr('x1',scaleX.range()[0])
         .attr('x2',scaleX.range()[1])
         .style('stroke-linecap','round')
         .style('stroke-width',axis_width)
         .select(function(){return this.parentNode.appendChild(this.cloneNode(true))})
         .attr('class','domain-overlay')
         .style('stroke-width',axis_width);
    
    //add drag behavior
    var drag = d3.drag()
        .on('start drag end', function(){
            handle.attr('cx',scaleX(scaleX.invert(d3.event.x)));
        })
        .on('end', function(){
          var v     = scaleX.invert(d3.event.x),
              index = d3.bisect(years,v);

          if(years[index-1]){
              index = (years[index]-v)>=(v-years[index-1])?(index-1):index;
          }
          //position the handle
          handle.attr('cx', scaleX(years[index]));

          //highlight the appropriate tick mark
          axisX.selectAll('.tick')
               .classed('selected',false)
               .filter(function(d,i){return i == index})
               .classed('selected',true);

          yearsDimension.filter(years[index]);
         // draw(labByYear.get(years[index]),map);
         drawCircle(yearsDimension.top(Infinity));
        });

    var handle = axisX.append('circle')
        .attr('class','handle')
        .attr('r',axis_width/2)
        .style('fill','#A41E21');
    handle.call(drag);

   }

//Draw map
projection
    .center([87.5,25])   
    .scale(1125);

var indiaMap = plot.append('g')
    .attr('transform','translate(0,0)')
    .selectAll('.india')
    .data(india.features)
    .enter()
    .append('path').attr('class','india') 
    .attr('d',path)
    // .style('fill','#DDDDDF')
    .style('fill','white')
    .style('stroke-width','1px')
    .style('stroke','#DDDDDF');

//Position the City
var points = [
        {city:'Mumbai',location:[72.856164,19.017615]},
        {city:'Hyderabad',location:[78.486671,17.385044]},
        {city:'Bangalore',location:[77.594563,12.971599]},
        {city:'Pune',location:[73.856744,18.52043]},
        {city:'Chennai',location:[80.249583,13.060422]},
        {city:'Delhi',location:[77.22496,28.635308]},
        {city:'Kolkata',location:[88.363895,22.572646]},
        {city:'Ahmedabad',location:[72.566005,23.039568]},
        {city:'Vadodara',location:[73.1908,22.3059]},
        {city:'Coimbatore',location:[76.9681,11.0116]}
    ];

var cityName = plot.selectAll('.city')
        .data(points,function(d){return d.city})
        .enter()
        .append('text')
        .attr('class','city')
        .attr('transform',function(d){
           var xy = projection(d.location);
           return 'translate('+xy[0]+','+xy[1]+')';
        })
        .style('fill','#222222')
        .text(function(d){return d.city});

};


function parse(d){

   return {
     comID:d['Company_ID'],
     comName:d['NEW_CONAME'],
     year:d['Year'],
     labID:d['LabID_new'],
     labCity:d['Lab_Location'],
     labState:d['Lab_State'],
     stateOwned:d['StateOwned'],
     foreignOwned:d['ForeignOwned'],
     dsir:+d['DSIR_Code'],
     lat:+d['LabLat'],
     long:+d['LabLong']
   };

}

function parseCode(d){
   return {
    des:d['des'],
    code:d['code']
   }
}