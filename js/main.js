var map, figure, viewportHeight, viewportWidth;
var fyids = [214110776, 214110967, 214111011];

function setup() {
  map = d3
    .select("#main-chart")
    .append("svg")
    .attr("id", "background")
    .attr("width", "100vw")
    .attr("height", "100vh")
    .append("svg")
    .attr("id", "map-container");

  map.append("g").attr("class", "buildings");
  map.append("g").attr("class", "roads");
  map.append("g").attr("class", "popups");
  d3.select("#map-container g.buildings")
    .append("g")
    .attr("id", "housing-container");
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
    .attr("preserveAspectRatio", "xMidYMid meet")
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
  buildingselection = d3.select("#map-container g.buildings").append("path");
  buildingselection.attr("d", "").attr("opacity", 0.3);
  buildingData.features.map(function(feature) {
    buildingselection.attr(
      "d",
      buildingselection.attr("d") + " " + geoGenerator(feature)
    );
  });

  // Add another copy of housing buildings
  d3.csv("R/prop_data.csv", function(data) {
    return Number(data.id);
  }).then(function(ids) {
    buildingData.features.map(function(feature) {
      if (ids.includes(feature.properties.osm_id)) {
        d3.select("#map-container g.buildings g#housing-container")
          .append("path")
          .attr("d", geoGenerator(feature))
          .attr("id", "b" + feature.properties.osm_id)
          .attr("class", function(d) {
            if (fyids.includes(feature.properties.osm_id)) {
              type = "first-year";
            } else {
              type = "upper-class";
            }
            return "housing-building " + type;
          })
          .style("opacity", 0);
      }
    });
  });

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
        .style("opacity", 0);

      d3.select("#background")
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

      d3.select("#background")
        .transition(t)
        .attr(
          "transform",
          "scale(1.3) translate(0, " + viewportHeight * 0.06 + ")"
        );

      var t = d3
        .transition()
        .duration(400)
        .ease(d3.easeQuadInOut);

      d3.select("g.popups")
        .selectAll("text")
        .transition(t)
        .style("opacity", 0);

      d3.select("g.popups")
        .selectAll("circle")
        .transition(t)
        .style("opacity", 0);
    },
    function step4() {
      var t = d3
        .transition()
        .duration(2000)
        .ease(d3.easeQuadInOut);

      d3.selectAll(".upper-class")
        .transition(t)
        .style("opacity", 0);

      d3.select("#background")
        .transition(t)
        .attr(
          "transform",
          "scale(1.5) translate(" +
            -viewportWidth * 0.1 +
            ", " +
            viewportHeight * 0.1 +
            ")"
        );

      t = d3
        .transition()
        .delay(2050)
        .duration(1000)
        .ease(d3.easeQuadInOut);

      if (document.getElementsByClassName("popup-prop-chart").length == 0) {
        d3.csv("R/prop_data.csv", function(data) {
          if (fyids.includes(Number(data.id))) {
            createPropChart(data);
          }
        }).then(function() {
          d3.select("g.popups")
            .selectAll("text")
            .transition(t)
            .style("opacity", 1);

          d3.select("g.popups")
            .selectAll("circle")
            .transition()
            .duration(10)
            .style("opacity", 0.6)
            .delay(d => 2050 + Math.sqrt(d.index) * 250);
        });
      } else {
        d3.select("g.popups")
          .selectAll("text")
          .transition(t)
          .style("opacity", 1);

        d3.select("g.popups")
          .selectAll("circle")
          .transition()
          .duration(10)
          .style("opacity", 0.6)
          .delay(d => 2050 + Math.sqrt(d.index) * 250);
      }
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
createMainPropChart();
waypoints();
