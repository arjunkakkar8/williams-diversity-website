var map, figure;
var width = 2000,
  height = 1400;
var fyids = [214110776, 214110967, 214111011];

var pvalColor = d3
  .scaleLinear()
  .domain([0, 0.05, 1])
  .range(["rgb(139,0,0,0.8)", "rgb(255,215,0,0.8)", "rgb(107,142,35,0.8)"]);

function setup() {
  map = d3
    .select("#main-chart")
    .append("svg")
    .attr("id", "background")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("svg")
    .attr("id", "map-container")
    .append("g")
    .attr("id", "map-group");

  map.append("g").attr("class", "buildings");
  map.append("g").attr("class", "roads");
  map
    .append("g")
    .attr("class", "popups")
    .append("g")
    .attr("class", "line-guide")
    .style("opacity", 0);
  d3.select("#map-group g.buildings")
    .append("g")
    .attr("id", "housing-container");

  colorScale();
}

function createMoveArrows() {
  lineContainer = d3
    .select("#map-group")
    .append("g")
    .attr("class", "line-container");
  d3.csv("R/movement_data.csv", function(row) {
    start_el = document.getElementById("b" + row.id_2017);
    end_el = document.getElementById("b" + row.id_2018);
    x1 = start_el.getBBox().x + start_el.getBBox().width / 2;
    y1 = start_el.getBBox().y + start_el.getBBox().height / 2;
    x2 = end_el.getBBox().x + end_el.getBBox().width / 2;
    y2 = end_el.getBBox().y + end_el.getBBox().height / 2;
    //return "M" + x1 + " " + y1 + " L" + x2 + " " + y2;
    return { index: row.index, num: row.num, x1: x1, x2: x2, y1: y1, y2: y2 };
  }).then(function(data) {
    lineContainer
      .selectAll("path")
      .data(data)
      .enter()
      .append("path")
      .attr("d", d => "M" + d.x1 + " " + d.y1 + " L" + d.x1 + " " + d.y1)
      .style("fill-opacity", 0)
      .style("stroke-width", d => Number(d.num) * 20)
      .style("stroke", "rgb(66, 58, 87)")
      .style("opacity", 0);
  });
}

function popupPropCharts() {
  d3.csv("R/prop_data.csv", function(data) {
    if (fyids.includes(Number(data.id))) {
      createPropChart(data);
    }
  });
}

function colorScale() {
  scale = d3
    .select("#color-scale")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", [0, 0, 200, 35])
    .attr("preserveAspectRatio", "xMinYMin meet");

  scaledef = scale.append("linearGradient").attr("id", "linscale");

  scaledef
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "rgb(107,142,35,0.8)");
  scaledef
    .append("stop")
    .attr("offset", "95%")
    .attr("stop-color", "rgb(255,215,0,0.8)");
  scaledef
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "rgb(139,0,0,0.8)");

  scale
    .append("rect")
    .attr("x", 36)
    .attr("width", 125)
    .attr("height", 20)
    .attr("fill", "url('#linscale')");

  scale
    .append("path")
    .attr("d", "M 155 20 L 159 24 L 151 24 L 155 20")
    .attr("fill", "white");

  scale
    .append("text")
    .attr("font-family", "georgia")
    .attr("font-size", 8)
    .attr("x", 135)
    .attr("y", 32)
    .attr("fill", "white")
    .html("5% chance");

  scale
    .append("text")
    .attr("font-family", "georgia")
    .attr("font-size", 8)
    .attr("x", 10)
    .attr("y", 12)
    .attr("fill", "white")
    .html("Likely");
  /*.append("tspan")
    .attr("dy", 10)
    .attr("dx", -22)
    .html("Similar");*/

  scale
    .append("text")
    .attr("font-family", "georgia")
    .attr("font-size", 8)
    .attr("x", 165)
    .attr("y", 12)
    .attr("fill", "white")
    .html("Unlikely");
  /*.append("tspan")
    .attr("dy", 10)
    .attr("dx", -22)
    .html("Similar");*/
}

function basemap() {
  d3.select("#map-container")
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMidYMid meet");

  projection = d3
    .geoMercator()
    .fitExtent([[0, 0], [width, height]], buildingData);

  geoGenerator = d3.geoPath().projection(projection);

  // Make buildings
  buildingselection = d3.select("#map-group g.buildings").append("path");
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
        d3.select("#map-group g.buildings g#housing-container")
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
    createMainPropChart();
    popupPropCharts();
    createMoveArrows();
  });

  // Make roads
  d3.select("#map-group g.roads")
    .append("path")
    .attr("opacity", 0.3)
    .attr("d", geoGenerator(roadData));
}

function createFigure() {
  var steps = [
    function step0() {
      var t = d3
        .transition()
        .duration(400)
        .ease(d3.easeQuadInOut);

      d3.select(".intro")
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

      d3.select(".intro")
        .transition(t)
        .style("opacity", "1");

      d3.select("#college-proportion-figure")
        .selectAll("circle")
        .transition()
        .duration(10)
        .style("opacity", 0.6)
        .delay(d => 50 + Math.sqrt(d.index) * 250);

      selector = document.getElementById("proportion-figure-selector");
      if (selector.value == "The US") {
        d3.select("#proportion-figure-selector")
          .transition()
          .duration(300)
          .style("background-color", "rgb(237, 228, 54, 1)")
          .transition()
          .delay(300)
          .duration(500)
          .style("background-color", "rgb(40,45,83,0.67)");

        selector.value = "The class";
        selector.dispatchEvent(new Event("change"));
      }
    },
    function step2() {
      var t = d3
        .transition()
        .duration(400)
        .ease(d3.easeQuadInOut);

      d3.select("#college-proportion-figure")
        .selectAll("circle")
        .transition()
        .duration(10)
        .style("opacity", 0.6)
        .delay(d => 50 + Math.sqrt(d.index) * 250);

      selector = document.getElementById("proportion-figure-selector");
      if (selector.value == "The class") {
        d3.select("#proportion-figure-selector")
          .transition()
          .duration(300)
          .style("background-color", "rgb(237, 228, 54, 1)")
          .transition()
          .delay(300)
          .duration(500)
          .style("background-color", "rgb(40,45,83,0.67)");

        selector.value = "The US";
        selector.dispatchEvent(new Event("change"));
      }

      d3.select("#overlay")
        .transition(t)
        .style(
          "background",
          "linear-gradient(to right, rgba(0, 0, 0, 0.5) 65%, rgba(0, 0, 0, 0.5) 80%"
        );

      d3.select("#body-container")
        .transition(t)
        .style("opacity", "0");

      d3.selectAll(".housing-building")
        .transition(t)
        .style("opacity", 0);

      var t = d3
        .transition()
        .duration(2000)
        .ease(d3.easeQuadInOut);

      d3.select("#map-group")
        .transition(t)
        .attr("transform", "scale(1) translate(0, 0)");
    },
    function step3() {
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

      d3.select("#college-proportion-figure")
        .selectAll("circle")
        .transition(t)
        .style("opacity", "0");

      d3.select("#body-container")
        .transition(t)
        .style("opacity", "1");

      d3.selectAll(".housing-building")
        .transition(t)
        .style("opacity", 1);

      d3.select("g.popups")
        .selectAll("text")
        .transition(t)
        .style("opacity", 0);

      d3.select("g.line-guide")
        .transition(t)
        .style("opacity", 0);

      d3.select("g.popups")
        .selectAll("circle")
        .transition(t)
        .style("opacity", 0);

      var t = d3
        .transition()
        .duration(2000)
        .ease(d3.easeQuadInOut);

      d3.select("#map-group")
        .transition(t)
        .attr(
          "transform",
          "scale(1.3) translate(-300, " + eval(height * 0.1 - 210) + ")"
        );
    },
    function step4() {
      var t = d3
        .transition()
        .duration(2000)
        .ease(d3.easeQuadInOut);

      d3.select("#map-group")
        .transition(t)
        .attr(
          "transform",
          "scale(1.5) translate(" +
            eval(-500 - width * 0.1) +
            ", " +
            eval(height * 0.25 - 350) +
            ")"
        );

      t = d3
        .transition()
        .delay(2050)
        .duration(1000)
        .ease(d3.easeQuadInOut);

      d3.select("g.popups")
        .selectAll("text")
        .transition(t)
        .style("opacity", 1);

      d3.select("g.line-guide")
        .transition(t)
        .style("opacity", 1);

      d3.select("g.popups")
        .selectAll("circle")
        .transition()
        .duration(10)
        .style("opacity", d => d.op)
        .delay(d => 2050 + Math.sqrt(d.index) * 250);

      t = d3
        .transition()
        .duration(400)
        .ease(d3.easeQuadInOut);

      d3.selectAll(".first-year")
        .transition(t)
        .style("opacity", 1);

      d3.selectAll(".upper-class")
        .transition(t)
        .style("opacity", 0);

      d3.selectAll(".first-year")
        .transition(t)
        .style("fill", "rgb(59, 41, 109)")
        .style("stroke", "rgb(73, 87, 131)");
    },
    function step5() {
      d3.csv("R/prop_data.csv", function(data) {
        if (fyids.includes(Number(data.id))) {
          d3.select("#b" + data.id)
            .transition()
            .duration(400)
            .ease(d3.easeQuadInOut)
            .style("fill", pvalColor(Number(data.pval)))
            .style("stroke", pvalColor(Number(data.pval) + 0.02));
        }
      });

      t = d3
        .transition()
        .duration(400)
        .ease(d3.easeQuadInOut);

      d3.select(".line-container")
        .selectAll("path")
        .transition(t)
        .attr("d", d => "M" + d.x1 + " " + d.y1 + " L" + d.x1 + " " + d.y1)
        .style("opacity", 0);

      d3.selectAll(".upper-class")
        .transition(t)
        .style("opacity", 0);

      var t = d3
        .transition()
        .duration(2000)
        .ease(d3.easeQuadInOut);

      d3.select("#map-group")
        .transition(t)
        .attr(
          "transform",
          "scale(1.5) translate(" +
            eval(-500 - width * 0.1) +
            ", " +
            eval(height * 0.25 - 350) +
            ")"
        );

      t = d3
        .transition()
        .delay(2050)
        .duration(1000)
        .ease(d3.easeQuadInOut);

      d3.select("g.popups")
        .selectAll("text")
        .transition(t)
        .style("opacity", 1);

      d3.select("g.line-guide")
        .transition(t)
        .style("opacity", 1);

      d3.select("g.popups")
        .selectAll("circle")
        .transition()
        .duration(10)
        .style("opacity", d => d.op)
        .delay(d => 2050 + Math.sqrt(d.index) * 250);
    },
    function step6() {
      var t = d3
        .transition()
        .duration(2000)
        .ease(d3.easeQuadInOut);

      d3.select("#map-group")
        .transition(t)
        .attr(
          "transform",
          "scale(1.3) translate(-300, " + eval(height * 0.1 - 210) + ")"
        );

      var t = d3
        .transition()
        .duration(400)
        .ease(d3.easeQuadInOut);

      d3.select("g.popups")
        .selectAll("text")
        .transition(t)
        .style("opacity", 0);

      d3.select("g.line-guide")
        .transition(t)
        .style("opacity", 0);

      d3.select("g.popups")
        .selectAll("circle")
        .transition(t)
        .style("opacity", 0);

      d3.selectAll(".housing-building")
        .transition(t)
        .style("opacity", 1);

      d3.select(".line-container")
        .selectAll("path")
        .transition()
        .duration(1000)
        .delay(function(d) {
          value = 1000;
          switch (d.Room_2017) {
            case "Mission":
              break;
            case "Williams":
              value += 1000;
              break;
            case "Sage":
              value += 2000;
              break;
          }
          return value + d.index * 50;
        })
        .attr("d", d => "M" + d.x1 + " " + d.y1 + " L" + d.x2 + " " + d.y2)
        .style("opacity", d => d.num * 10);
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

  triggers.map(function(el) {
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
waypoints();
