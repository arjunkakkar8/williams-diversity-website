var map, figure, viewportHeight, viewportWidth;
var margin = 5;

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
    .attr("width", viewportWidth - 2 * margin + "px")
    .attr("height", viewportHeight - 2 * margin + "px");

  projection = d3
    .geoMercator()
    .fitExtent(
      [[margin, margin], [viewportWidth - margin, viewportHeight - margin]],
      buildingData
    );

  geoGenerator = d3.geoPath().projection(projection);

  d3.selectAll("#map-container path")
    .data({})
    .exit()
    .remove();

  // Make buildings
  d3.select("#map-container g.buildings")
    .selectAll("path")
    .data(buildingData.features)
    .enter()
    .append("path")
    .attr("d", geoGenerator)
    .attr("id", function(d) {
      return "b" + d.properties.osm_id;
    })
    .style("opacity", 0.3);

  // Make roads
  d3.select("#map-container g.roads")
    .selectAll("path")
    .data(roadData.features)
    .enter()
    .append("path")
    .attr("d", geoGenerator)
    .style("opacity", 0.4);
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
        .duration(400)
        .ease(d3.easeQuadInOut);
      d3.select("div.housing")
        .transition(t)
        .style("opacity", 1);

      d3.csv("R/prop_data.csv", function(data) {
        d3.selectAll("path#b" + data.id)
          .transition(t)
          .style("opacity", 0.3);
      });
    },
    function step3() {
      var t = d3
        .transition()
        .duration(800)
        .ease(d3.easeQuadInOut);
      d3.csv("R/prop_data.csv", function(data) {
        d3.selectAll("path#b" + data.id)
          .transition(t)
          .style("opacity", 1);
      });
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
