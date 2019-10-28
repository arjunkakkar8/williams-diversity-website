const collegeData = [
  { name: "Asian", value: 22 },
  { name: "Black", value: 10 },
  { name: "Hispanic", value: 12 },
  { name: "White", value: 56 }
];

const usData = [
  { name: "Asian", value: 6 },
  { name: "Black", value: 13 },
  { name: "Hispanic", value: 18 },
  { name: "White", value: 60 }
];

function createPropChart(in_data, tag, x, y, posFlag=true) {
  building_el = document.getElementById("b" + in_data.id);
  bx = building_el.getBBox().x + building_el.getBBox().width * 0.6;
  by = building_el.getBBox().y + building_el.getBBox().height / 2;
  if (posFlag) {
    switch (in_data.Room_2017) {
      case "Mission":
        px = 1100;
        py = by - 400;
        break;
      case "Williams":
        px = 1100;
        py = by - 300;
        break;
      case "Sage":
        px = 1100;
        py = by - 75;
        break;
      default:
        px = x;
        py = y;
    }
  } else {
    px = x;
    py = y;
  }

  var width = 600,
    height = 700;

  const data = [
    { name: "Asian", value: Math.round(in_data.p_asi * 100) },
    { name: "Black", value: Math.round(in_data.p_bla * 100) },
    { name: "Hispanic", value: Math.round(in_data.p_lat * 100) },
    { name: "White", value: Math.round(in_data.p_whi * 100) }
  ];

  var svg = d3
    .select("#map-group g.popups")
    .append("svg")
    .attr("id", "b" + in_data.id + "-prop-chart")
    .attr("class", "popup-prop-chart " + tag)
    .attr("width", "300")
    .attr("x", px)
    .attr("y", py)
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("filter", "url(#shadow)");

  color = d3
    .scaleOrdinal()
    .domain(data.map(d => d.name))
    .range([
      "rgba(74, 108, 111, 0.8)",
      "rgba(132, 96, 117, 1)",
      "rgba(196, 178, 188, 1)",
      "rgba(61, 111, 139, 1)"
    ]);

  function createCircData(width, num, x, y, index) {
    circData = [];
    radius = (0.8 * width) / 8;
    for (var i = 0; i < Math.max(num, collegeData[index].value); i++) {
      colNum = i % 4;
      rowNum = Math.floor(i / 4);
      circData.push({
        xval: x - (0.8 * width) / 2 + 2 * colNum * radius,
        yval: y - 2 * rowNum * radius,
        index: i,
        op: i < collegeData[index].value ? 0.6 : 1
      });
    }
    return circData;
  }

  function createCircles(num, x, y, width, color, value, index) {
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
      .attr("fill", d => (d.index < num ? color : "rgba(40, 40, 40, 0.8)"))
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
  }

  data.map(function(d, i) {
    createCircles(
      d.value,
      ((i + 1) * width) / 5,
      600,
      width / 5,
      color(d.name),
      d.name,
      i
    );
  });

  svg
    .append("text")
    .attr("font-family", "georgia")
    .attr("font-size", 30)
    .attr("text-anchor", "middle")
    .attr("x", 300)
    .attr("y", 700)
    .attr("fill", "white")
    .text(in_data.Room_2017)
    .style("opacity", 0);

  guide = d3.select("g.line-guide");
  guide
    .append("path")
    .attr("class", tag)
    .attr(
      "d",
      "M" +
        bx +
        " " +
        by +
        " L" +
        px +
        " " +
        eval(py + 330) +
        " L" +
        eval(px + 280) +
        " " +
        eval(py + 330)
    )
    .attr("opacity", 0);
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
    .range([
      "rgba(74, 108, 111, 0.8)",
      "rgba(132, 96, 117, 1)",
      "rgba(196, 178, 188, 1)",
      "rgba(61, 111, 139, 1)"
    ]);

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
  function createCircles(num, x, y, width, color, value) {
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
  }

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
    const data1 = collegeData,
      data2 = usData;

    function updater(name, newVal, i) {
      circData = createCircData(
        width / 5,
        Math.max(newVal, collegeData[i].value),
        ((i + 1) * width) / 5,
        350
      );

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
        .style("opacity", 0)
        .transition()
        .attr("fill", color(name))
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

      if (newVal < collegeData[i].value) {
        circles
          .transition()
          .duration(10)
          .delay(d => Math.sqrt(prevVal - d.index + 1) * 200)
          .attr("fill", d =>
            d.index < newVal ? color(name) : "rgba(40, 40, 40, 0.8)"
          );
      } else {
        circles
          .transition()
          .duration(10)
          .delay(d => Math.sqrt(d.index - usData[i].value) * 200)
          .attr("fill", color(name));
      }
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
