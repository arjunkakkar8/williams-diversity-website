const collegeData = [
  { name: "Asian", value: 22 },
  { name: "Black", value: 10 },
  { name: "Hispanic", value: 12 },
  { name: "White", value: 56 }
];

function createPropChart(in_data) {
  
  building_el = document.getElementById('b'+in_data.id);

  var width = 600,
    height = 500;

  const data = [
    { name: "Asian", value: Math.round(in_data.p_asi*100) },
    { name: "Black", value: Math.round(in_data.p_bla*100) },
    { name: "Hispanic", value: Math.round(in_data.p_lat*100) },
    { name: "White", value: Math.round(in_data.p_whi*100) }
  ];

  var svg = d3
    .select("#map-container g.popups")
    .append("svg")
    .attr("id", "b"+in_data.id+"-prop-chart")
    .attr("class", "popup-prop-chart")
    .attr("width", "400")
    .attr("x", building_el.getBBox().x)
    .attr("y", building_el.getBBox().y - 200)
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMinYMin meet");
    
  gradient = svg
  .append('defs')
  .append("radialGradient")
  .attr("id", "RadialGradient")
  
  gradient
  .append("stop")
  .attr("offset", "0%")
  .attr("stop-color", "rgba(0, 0, 0, .5)")

  gradient
  .append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "rgba(0, 0, 0, 0)")
  
  /*svg
  .append('rect')
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "url(#RadialGradient)")*/

  color = d3
    .scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(
      d3
        .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
        .reverse()
    );

    function createCircData(width, num, x, y, index) {
      circData = [];
      radius = (0.8 * width) / 8;
      for (var i = 0; i < num; i++) {
        colNum = i % 4;
        rowNum = Math.floor(i / 4);
        circData.push({
          xval: x - (0.8 * width) / 2 + 2 * colNum * radius,
          yval: y - 2 * rowNum * radius,
          index: i,
          op: ((i <= collegeData[index].value) ? 0.6 : 1)
        });
      }
      return circData;
    }

    createCircles = function(num, x, y, width, color, value, index) {
      radius = (0.8 * width) / 8;
      circData = createCircData(width, num, x, y, index);
      currentg = svg.append("g").attr("id", value + "PopupPropPlotDots");
  
      currentg
        .selectAll("circle")
        .data(circData)
        .enter()
        .append("circle")
        .attr("cx", d => d.xval)
        .attr("cy", d => d.yval)
        .attr("r", radius)
        .attr("fill", color)
        .style("opacity", 0);
  
      currentg
        .append("text")
        .attr("font-family", "georgia")
        .attr("font-size", 24)
        .attr("text-anchor", "middle")
        .text(value)
        .attr("x", x - radius)
        .attr("y", y + 3.3 * radius)
        .attr("fill", color)
        .style("opacity", 0);
    };
  
    data.map(function(d, i) {
      createCircles(
        d.value,
        ((i + 1) * width) / 5,
        400,
        width / 5,
        color(d.name),
        d.name,
        i
      );
    });
}

function createMainPropChart() {
  

  var width = 600,
    height = 400;

  var svg = d3
    .select("#college-proportion-figure")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMinYMin meet");

  color = d3
    .scaleOrdinal()
    .domain(collegeData.map(d => d.name))
    .range(
      d3
        .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), collegeData.length)
        .reverse()
    );

  function createCircData(width, num, x, y) {
    circData = [];
    radius = (0.8 * width) / 8;
    for (var i = 0; i < num; i++) {
      colNum = i % 4;
      rowNum = Math.floor(i / 4);
      circData.push({
        xval: x - (0.8 * width) / 2 + 2 * colNum * radius,
        yval: y - 2 * rowNum * radius,
        index: i
      });
    }
    return circData;
  }
  createCircles = function(num, x, y, width, color, value) {
    radius = (0.8 * width) / 8;
    circData = createCircData(width, num, x, y);
    currentg = svg.append("g").attr("id", value + "PropPlotDots");

    currentg
      .selectAll("circle")
      .data(circData)
      .enter()
      .append("circle")
      .attr("cx", d => d.xval)
      .attr("cy", d => d.yval)
      .attr("r", radius)
      .attr("fill", color)
      .style("opacity", 0);

    currentg
      .append("text")
      .attr("font-family", "georgia")
      .attr("font-size", 24)
      .attr("text-anchor", "middle")
      .text(value)
      .attr("x", x - radius)
      .attr("y", y + 3.3 * radius)
      .attr("fill", color);
  };

  collegeData.map(function(d, i) {
    createCircles(
      d.value,
      ((i + 1) * width) / 5,
      350,
      width / 5,
      color(d.name),
      d.name
    );
  });

  function updatePropChart(toggle) {
    const data1 = [
      { name: "Asian", value: 22 },
      { name: "Black", value: 10 },
      { name: "Hispanic", value: 12 },
      { name: "White", value: 56 }
    ];

    const data2 = [
      { name: "Asian", value: 6 },
      { name: "Black", value: 13 },
      { name: "Hispanic", value: 18 },
      { name: "White", value: 60 }
    ];

    function updater(name, newVal, i) {
      circData = createCircData(width / 5, newVal, ((i + 1) * width) / 5, 350);

      prevVal = d3
        .select("#" + name + "PropPlotDots")
        .selectAll("circle")
        .size();

      circles = d3
        .select("#" + name + "PropPlotDots")
        .selectAll("circle")
        .data(circData);

      circles
        .enter()
        .append("circle")
        .attr("cx", d => d.xval)
        .attr("cy", d => d.yval)
        .attr("r", radius)
        .attr("fill", color(name))
        .style("opacity", 0)
        .transition()
        .style("opacity", 1)
        .duration(10)
        .delay(d => Math.sqrt(d.index - prevVal) * 200);

      circles
        .exit()
        .transition()
        .style("opacity", 0)
        .duration(10)
        .delay(d => Math.sqrt(prevVal - d.index + 1) * 200)
        .remove();
    }
    eval("data" + toggle).map((d, i) => updater(d.name, d.value, i));
  }

  selector = document.getElementById("proportion-figure-selector");

  selector.addEventListener("change", function() {
    if (selector.value == "The class") {
      updatePropChart(1);
    } else if (selector.value == "The US") {
      updatePropChart(2);
    }
  });
}
