//Append <svg> element and implement the margin convention
var m = {t:50,r:50,b:50,l:50};
var outerWidth = document.getElementById('container').clientWidth,
    outerHeight = document.getElementById('container').clientHeight;
var w = outerWidth - m.l - m.r,
    h = outerHeight - m.t - m.b;    

var canvasW = document.getElementById('canvas').clientWidth,
    canvasH = document.getElementById('canvas').clientHeight;

//set scenes to screen height
var screenH = $(window).height();
$('.screen').css('height',screenH);
$('.first_scene').css('height',screenH);;
$('.owned_by').css('min-height',screenH);
$('.container').css('min-height',screenH);


//scroll to change page
$(function () { // wait for document ready
  // init
  var controller = new ScrollMagic.Controller({
    globalSceneOptions: {
      triggerHook: 'onLeave'
    }
  });

  // get all slides
  // var slides = document.querySelectorAll('.slide');

  $('.slide').each(function(){
     new ScrollMagic.Scene({
        triggerElement: this
     })
     .setPin(this)
     .addTo(controller)
  });

  // // create scene for every slide
  // for (var i=0; i<slides.length; i++) {
  //   new ScrollMagic.Scene({
  //       triggerElement: slides[i]
  //     })
  //     .setPin(slides[i])
  //     .addTo(controller);
  // }
});


// //Click and change views
// d3.selectAll('.viewpoint')
//   .on('mouseenter',function(){
//      d3.select(this).style('opacity',0.6);
//   })
//   .on('mouseleave',function(){
//     d3.select(this).style('opacity',1);
//   })

// d3.select('.point1')
//   .on('click',function(){
//     d3.select(this).style('opacity',1);
//     $('html,body').animate({
//         scrollTop: $(".first_scene").offset().top},
//         'slow');
//   })

// d3.select('.point2')
//   .on('click',function(){
//     d3.select(this).style('opacity',1);
//     $('html,body').animate({
//         scrollTop: $(".owned_by").offset().top},
//         'slow');
//   })

// d3.select('.point3')
//   .on('click',function(){
//     d3.select(this).style('opacity',1);
//     $('html,body').animate({
//         scrollTop: $(".container").offset().top},
//         'slow');
//   })

//var for module
var owned_by, drawMap;

//Call module for first scene (no data)
d3.select('.first_scene').call(First_scene());


//Import data and parse
d3.queue()
  .defer(d3.csv,'./data/R&Dlabs.csv',parse)
  .defer(d3.csv,'./data/DSIRcode.csv',parseCode)
  .defer(d3.json, './data/india_states.geojson')
  // .defer(d3.json, './data/states_india.geojson')
  .await(dataLoaded);


function dataLoaded(err, data, code, india) {

  //Nest data for slider
  var labByYear = d3.nest().key(function(data){return data.year})
      .map(data,d3.map);

  var years = labByYear.keys();

    //Data for owned_by
  owned_by = OwnedBy()
      .importData(code)
      .yearData(years);

  d3.select('.owned_by').datum(data).call(owned_by);

  drawMap = Map()
      .importData(code)
      .importGeoData(india)
      .yearData(years);

  d3.select('.container').datum(data).call(drawMap);

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