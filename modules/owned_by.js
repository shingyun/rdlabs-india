function OwnedBy(){

  var _code, _yearData;

  var start_x = 350,
      circle_start_x = 60;

  var scaleX = d3.scaleBand()
      .range([start_x,w]);

  function exports(selection){

     //data
     var datum = selection.datum() || [];

     var labByCity = d3.nest().key(function(datum){return datum.labCity})
      .entries(datum);

     var labByState = d3.nest().key(function(datum){return datum.labState})
      .entries(datum);

     codeMap = d3.map(_code, function(d){ return d.code; })

     var labByYear = d3.nest().key(function(datum){return datum.year;})
      .key(function(datum){return datum.dsir;})
      .entries(datum);

     var axisYear = labByYear.map(function(d){
            return d.key;
        });

     //create 8 DSIR
	 var labByDsir = d3.nest().key(function(datum){return datum.dsir;})
	      .entries(datum);

	 var axisDsir = labByDsir.map(function(d){
	    return codeMap.get(d.key).des;});

	 axisDsir.reverse();

	 function filterForeign(data) {
	    return data.foreignOwned == 1;
	 }

	 function filterLocal(data){
	    return data.foreignOwned == 0;
	 }

	 var foreign = datum.filter(filterForeign);
	 var local = datum.filter(filterLocal);

	 scaleX.domain(_yearData);

   var scaleY = d3.scaleBand()
         .domain(axisDsir)
         .range([h,0]);

   var labs = labByYear.map(function(d) {
            return d.values.map(function(e){return e.values.length})
         }).reduce(function(p, c){ return p.concat(c); }, []);

   //set scale for circles
   var scaleR = d3.scaleLinear()
         .domain([0, d3.max(labs)])
         .range([1.5,50]);

   var axisX = d3.axisBottom()
         .tickSize(h)
         .scale(scaleX);   

   var axisY = d3.axisLeft()
         .scale(scaleY)
         .tickSize(-(w*0.7));

   //append svg
   plotOwned = selection
       .append('svg')
       .attr('width',outerWidth)
       .attr('height',outerHeight)
       .attr('transform','translate(0,80)')
       .append('g')
       .attr('class','owned_wrap')
       .attr('transform','translate(0,0)');
    
    //draw axis
    plotOwned.append('g')
         .attr('class','axis-y axis')
         .attr('transform','translate('+start_x+',0)')
         .call(axisY);

    plotOwned.append('g')
         .attr('class','axis-x axis')
         .attr('transform','translate(0,30)')
         .call(axisX);

     //draw local circle
     localByYear = d3.nest().key(function(d){return d.year;})
         .key(function(d){return d.dsir;})
         .entries(local);

     plotOwned.selectAll('.localByYear')
         .data(localByYear,function(d){return d.values;})
         .enter()
         .append('g')
         .attr('class','localByYear')
         .attr('transform',function(d){
            return 'translate('+(circle_start_x+scaleX(d.key))+',32)';
         })
         .selectAll('.localLab')
         .data(function(d){return d.values})
         .enter()
         .append('circle')
         .attr('class','localLab')
         .style('fill','black')
         .style('opacity',0.8)
         .attr('cy',function(d){
            return scaleY(codeMap.get(d.key).des)})
         .attr('r',function(d){
            return scaleR(d.values.length);})
         .on('mouseenter',function(d){
          d3.select(this)
            .style('opacity',.3);

          var tooltip = d3.select('.custom-tooltip')
              .style('opacity',1);
          tooltip.select('.owned')
                 .html('Domestic-owned');
          tooltip.select('.number')
                 .html(+d.values.length + ' labs');
         })
         .on('click',function(d){
               
            d3.select(this)
              .style('opacity',.3);
            
            var tooltip = d3.select('.custom-tooltip')
                .style('opacity',1);
            tooltip.select('.owned')
                   .html('Domestic-owned');
            tooltip.select('.number')
                   .html(+d.values.length + ' labs');
         })
         .on('mousemove',function(d){
           var tooltip = d3.select('.custom-tooltip');
           var xy = d3.mouse(d3.select('.screen').node());
            tooltip
                .style('left',xy[0]-20+'px')
                .style('top',xy[1]+20+'px');
         })
         .on('mouseleave',function(d){
            d3.select(this)
              .style('opacity',.8);

          var tooltip = d3.select('.custom-tooltip');
              tooltip.transition().style('opacity',0);

       });


     //draw foreign circle
     foreignByYear = d3.nest().key(function(d){return d.year;})
        .key(function(d){return d.dsir;})
        .entries(foreign);

     plotOwned.selectAll('.foreignByYear')
        .data(foreignByYear,function(d){return d.values;})
        .enter()
        .append('g')
        .attr('class','foreignByYear')
        .attr('transform',function(d){
            return 'translate('+(circle_start_x+scaleX(d.key))+',32)';
        })
        .selectAll('.foreignLab')
        .data(function(d){return d.values})
        .enter()
        .append('circle')
        .attr('class','foreignLab')
        .style('opacity',0.8)
        .style('fill','#FFFFFF')
        .attr('cy',function(d){
           return scaleY(codeMap.get(d.key).des);})
        .attr('r',function(d){
           return scaleR(d.values.length);})
        .on('mouseenter',function(d){

           d3.select(this)
             .style('opacity',1);

           var tooltip = d3.select('.custom-tooltip')
               .style('opacity',1);
           tooltip.select('.owned')
                  .html('Foreign-owned');
           tooltip.select('.number')
                  .html(+d.values.length + ' labs');
        })
        .on('click',function(d){
                   console.log(d);
           d3.select(this)
             .style('opacity',1);
           var tooltip = d3.select('.custom-tooltip')
               .style('opacity',1);
           tooltip.select('.owned')
                  .html('Foreign-owned');
           tooltip.select('.number')
                  .html(+d.values.length + ' labs');
        })
        .on('mousemove',function(d){
           var tooltip = d3.select('.custom-tooltip');
           var xy = d3.mouse(d3.select('.screen').node());
            tooltip
                .style('left',xy[0]-20+'px')
                .style('top',xy[1]+20+'px');
        })
        .on('mouseleave',function(d){
           d3.select(this)
             .style('opacity',.8);
          
          var tooltip = d3.select('.custom-tooltip');
              tooltip.transition().style('opacity',0);

        });;


  }//exports

  exports.importData = function(_){
  	  if(!arguments.length) return _code;
	     _code  = _;
	  return this;
  }
  
  exports.yearData = function(_){
  	  if(!arguments.length) return _yearData;
	     _yearData  = _;
	  return this;
  }

  return exports;

}