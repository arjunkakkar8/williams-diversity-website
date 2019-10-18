function createPropChart() {
  const data = [
    { name: "Asian", value: 22 },
    { name: "Black", value: 10 },
    { name: "Hispanic", value: 12 },
    { name: "White", value: 56 }
  ];

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
    .domain(data.map(d => d.name))
    .range(
      d3
        .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
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

  data.map(function(d, i) {
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
