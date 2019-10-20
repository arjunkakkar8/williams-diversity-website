var map, figure;

function setup() {
  map = d3
    .select("#main-chart")
    .append("svg")
    .attr("id", "map-container");

  map.append("g").attr("class", "buildings");
  map.append("g").attr("class", "roads");
}

function basemap() {
  viewportWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  viewportHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );

  map
    .attr("viewBox", [0, 0, viewportWidth, viewportHeight])
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", "100%")
    .attr("height", "100%");

  projection = d3
    .geoMercator()
    .fitExtent([[0, 0], [viewportWidth, viewportHeight]], buildingData);

  geoGenerator = d3.geoPath().projection(projection);

  d3.selectAll("#map-container path")
    .data({})
    .exit()
    .remove();

  // Make buildings
  /*d3.select("#map-container g.buildings")
    .selectAll("path")
    .data(buildingData.features)
    .enter()
    .append("path")
    .attr("d", geoGenerator)
    .attr("id", function(d) {
      return "b" + d.properties.osm_id;
    })
    .style("opacity", 0.3);*/

  buildingselection = d3.select("#map-container g.buildings").append("path");
  buildingselection.attr("d", "").attr("opacity", 0.3);
  buildingData.features.map( function(feature){
    buildingselection.attr("d", buildingselection.attr("d")+" "+geoGenerator(feature));
  })

  // Add class to housing buildings
  d3.csv("R/prop_data.csv", function(data) {
    return Number(data.id);
  })
  .then(function(ids){
    buildingData.features.map( function(feature){
      if(ids.includes(feature.properties.osm_id)) {
        d3.select("#map-container g.buildings")
        .append("path")
        .attr("d", geoGenerator(feature))
        .attr("id", "b"+feature.properties.osm_id)
        .attr("class", "housing-building")
        .style("opacity", 0.3)
      }
    })
  })

  

  // Make roads
  roadselection = d3.select("#map-container g.roads").append("path");
  roadselection.attr("d", "").attr("opacity", 0.3);
  roadData.features.map(function(elem) {
    roadselection.attr("d", roadselection.attr("d") + " " + geoGenerator(elem));
  });
}

function createFigure() {
  var steps = [
    function step0() {
      var t = d3
        .transition()
        .duration(400)
        .ease(d3.easeQuadInOut);
      d3.select("#overlay")
        .transition(t)
        .style(
          "background",
          "linear-gradient(to right, rgba(0, 0, 0, 0.5) 65%, rgba(0, 0, 0, 0.5) 80%"
        );

      d3.select("#body-container")
        .transition(t)
        .style("opacity", "0");

      d3.select("#college-proportion-figure")
        .selectAll("circle")
        .transition(t)
        .style("opacity", "0");
    },
    function step1() {
      var t = d3
        .transition()
        .duration(400)
        .ease(d3.easeQuadInOut);

      d3.select("#overlay")
        .transition(t)
        .style(
          "background",
          "linear-gradient(to right, rgba(0, 0, 0, 0) 65%, rgba(0, 0, 0, 0.5) 80%"
        );

      d3.select("#body-container")
        .transition(t)
        .style("opacity", "1");

      d3.select("#college-proportion-figure")
        .selectAll("circle")
        .transition()
        .duration(10)
        .style("opacity", 0.6)
        .delay(d => 50 + Math.sqrt(d.index) * 250);

      d3.select("div.housing")
        .transition(t)
        .style("opacity", 0);
    },
    function step2() {
      var t = d3
        .transition()
        .duration(2000)
        .ease(d3.easeQuadInOut);

      d3.select("div.housing")
        .transition(t)
        .style("opacity", 1);

      d3.selectAll(".housing-building")
        .transition(t)
        .style("opacity", 0.3);

      d3.select("#map-container")
      .transition(t)
      .attr("transform", "scale(1)");
    },
    function step3() {
      var t = d3
        .transition()
        .duration(2000)
        .ease(d3.easeQuadInOut);

      d3.selectAll(".housing-building")
        .transition(t)
        .style("opacity", 1);

      d3.select("#map-container")
        .transition(t)
        .attr("transform", "scale(1.3)");
    }
  ];

  function update(step) {
    steps[step].call();
  }

  return {
    update: update
  };
}

function selectionToArray(selection) {
  var len = selection.length;
  var result = [];
  for (var i = 0; i < len; i++) {
    result.push(selection[i]);
  }
  return result;
}

function waypoints() {
  var container = document.querySelector("#map-container");
  var triggers = selectionToArray(
    document.querySelectorAll("#overlay .trigger")
  );

  var figure = createFigure();

  var waypoints = triggers.map(function(el) {
    var step = +el.getAttribute("data-step");

    return new Waypoint({
      element: el,
      handler: function(direction) {
        var nextStep = direction === "down" ? step : Math.max(0, step - 1);
        figure.update(nextStep);
      }
    });
  });
}

setup();
basemap();
createPropChart();
waypoints();
window.addEventListener("resize", function() {
  basemap();
  waypoints();
});
