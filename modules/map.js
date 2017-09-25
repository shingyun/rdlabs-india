function Map(){
  
  //set menu's height
  d3.select('.menu')
	.attr('height',outerHeight);

  var y = 100;

  var dsirScaleY = d3.scaleOrdinal()
      .range([y+50,y+100,y+150,y+200,y+250,y+300,y+350,y+400]);

  var dsirColor = d3.scaleOrdinal()
      .range(['#c24d62','#64328a','#293171','#236576','#395f2a','#684d1e','#e04d12','#565555'])

  var mapData = d3.map();

  //Map projection
  var projection = d3.geoMercator();

  var path = d3.geoPath()
      .projection(projection);

  var map;
  
  var labByYear, labCount = [];

  function exports(selection){

  	//data
    var datum = selection.datum() || [];
    
    //plot for map
    var plot = selection
        .select('.canvas')
	    .append('svg')
	    .attr('width',canvasW)
	    .attr('height',canvasH+20)
	    .append('g')
	    .attr('transform','translate(0,0)');

    //menu
	var dsir = selection
		.select('.menu')
	    .select('.dsir')
	    .append('svg')
	    .attr('width','100%')
	    .attr('height',outerHeight)
	    .append('g')
	    .attr('transform','translate(0,0)');

	//Control element
	control = selection
	    .select('.control')
	    .append('svg')
	    .attr('width','100%')
	    .attr('height','100px')
	    .append('g')
	    .attr('width','100%')
	    .attr('height','100px')
	    .attr('transform','translate(0,50)');

	 //Nest data by 8 industries
	var nestedByDsir = d3.nest().key(function(data){return data.dsir;})
	      .entries(datum);
	  
	//Data for map
	mapData = d3.map(_code, function(d){ return d.code; })

	map = d3.map(_geo.features, function(d){return d.properties.NAME_1});

	var dsirCode = nestedByDsir.map(function(d){
	    return d.key;}
	);

    //data structure for force layout 
    var nestedForFlatten = d3.nest().key(function(data){return data.dsir;})
      .key(function(data){return data.labCity;})
      .key(function(data){return data.year;})
      .entries(datum);
    
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

    //menu color scale domain 
    dsirColor.domain(dsirCode);
    //menu y scale domain
    dsirScaleY.domain(dsirCode);

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
        _drawCircle(filteredData,_geo);

      });//on

      //text for button for all
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
	        _drawCircle(filteredData);

	      });//RectG.on

    rectG
      .append('text')
      .attr('class','dsirText')
      .style('fill','#222222')
      .text(function(d){return mapData.get(d.key).des;})
      .attr('x',45)
      .attr('y',function(d){return dsirScaleY(d.key)+17});

	       //Draw circles on map
	  function _drawCircle(data){

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
	          .attr('class','lab');

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

	  }//draw circle

    _timeSlider(_year);
     
    function _timeSlider(years){
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
         _drawCircle(yearsDimension.top(Infinity));
        });

    var handle = axisX.append('circle')
        .attr('class','handle')
        .attr('r',axis_width/2)
        .style('fill','#A41E21');
    handle.call(drag);

   }//_timeslider



    //Draw map
    projection
      .center([87.5,25])   
      .scale(1125);

    var indiaMap = plot.append('g')
	    .attr('transform','translate(0,0)')
	    .selectAll('.india')
	    .data(_geo.features)
	    .enter()
	    .append('path').attr('class','india') 
	    .attr('d',path)
	    .style('fill','white')
	    .style('stroke-width','0.5px')
	    .style('stroke','#E3E3E3');

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

  }//exports

  exports.importData = function(_){
  	  if(!arguments.length) return _code;
	     _code  = _;
	  return this;
  }

  exports.importGeoData = function(_){
  	  if(!arguments.length) return _geo;
	     _geo  = _;
	  return this;
  }

  exports.yearData = function(_){
  	  if(!arguments.length) return _year;
	     _year  = _;
	  return this;
  }

  return exports;

}




