$(function(){
  var rows = [];
  var canvas, xscale, yscale, barWidth, button, graph;

  GraphState = {
    BAR_GRAPH : 0,
    LINE_GRAPH : 1
  }

  var state;

  var width = 1000;
  var height = 400;

  var printRows = function () {
    for (var i in rows) {
      console.log(rows[i].L2);
    }
  }

  var setupScales = function () {
    barWidth = (width/rows.length) - 10;
    xscale = d3.scale.linear().domain([0, rows.length]).range([0, width-barWidth-10])
    yscale = d3.scale.linear().domain([0, d3.max(rows, function(d) { return d.L2; })]).rangeRound([0, height-20]);
  }

  var addText = function () {
    graph.selectAll("text")
          .data(rows).enter().append("svg:text")
          .attr("x", function(d) { return xscale(d.L1) + barWidth; })
          .attr("y", function(d) { return height - yscale(d.L2); })
          .attr("dx", -barWidth/2)
          .attr("dy", "1.2em")
          .attr("text-anchor", "middle")
          .attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
          .text(function (d) { return Number(d.L2).toFixed(2); })
          .attr("fill", "white");
  }

  var addBars = function () {
    graph.selectAll("rect.barGraph")
          .data(rows).enter().append("svg:rect")
          .attr("x", function(d) { return xscale(d.L1); })
          .attr("y", function(d) { return height - yscale(d.L2); })
          .attr("height", function(d) { return yscale(d.L2); })
          .attr("width", barWidth)
          .attr("fill", "#2d578b")
          .on("mouseover", function () { d3.select(this).transition().attr("fill", "#cc0812"); })
          .on("mouseout", function () { d3.select(this).transition().attr("fill", "#2d578b"); });;

    addText();
  }

  var addAxes = function () {
    graph.selectAll("text.xAxis")
          .data(rows).enter().append("svg:text")
          .attr("x", function(d) { return xscale(d.L1) + barWidth; })
          .attr("y", height)
          .attr("dx", -barWidth/2)
          .attr("text-anchor", "middle")
          .attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
          .text(function(d) { return d.L1; })
          .attr("transform", "translate(0, 18)")
          .attr("class", "xAxis")

    graph.selectAll("line")
         .data(yscale.ticks(20))
         .enter().append("line")
         .attr("x1", 0)
         .attr("x2", width)
         .attr("y1", yscale)
         .attr("y2", yscale)
         .style("stroke", "#ccc");
  }

  var addCircles = function () {
    var line = d3.svg.line()
                 .x(function(d) { return xscale(d.L1) + barWidth/2; })
                 .y(function(d) { return height - yscale(d.L2); })

    graph.append("svg:path")
         .attr("d", line(rows))
         .attr("fill", "none")
         .attr("stroke", "#2d578b");

    graph.selectAll("circle")
          .data(rows).enter().append("circle")
          .attr("cx", function(d) { return xscale(d.L1) + barWidth/2; })
          .attr("cy", function(d) { return height - yscale(d.L2); })
          .attr("r", "10")
          .attr("fill", "#2d578b")
          .on("mouseover", function () { d3.select(this).transition().attr("r", "20").attr("fill", "#cc0812"); })
          .on("mouseout", function () { d3.select(this).transition().attr("r", "10").attr("fill", "#2d578b"); });
  }

  var drawGraph = function () {
      addAxes();
    if (state == GraphState.BAR_GRAPH) {
      addBars();
    } else {
      addCircles();
    }
  }

  var newGraph = function () {
    return canvas.append("svg")
                 .attr("width", width)
                 .attr("height", height+20)
                 .attr("x", "20")
                 .attr("y", "70")
  }

  var cleanGraph = function () {
    graph.remove();
    graph = newGraph();
  }

  var toggleGraph = function () {
    state = (state == GraphState.BAR_GRAPH) ? GraphState.LINE_GRAPH : GraphState.BAR_GRAPH;
    cleanGraph();
    drawGraph();
  }

  var init = function (data) {
    rows = data;
    setupScales();
    state = GraphState.BAR_GRAPH;
    canvas = d3.select("#canvas").append("svg:svg")
               .attr("width", width+100)
               .attr("height", height+100)
               .style("background-color", "white");

    graph = newGraph();

    button = canvas.append("rect")
                   .attr("width", "150")
                   .attr("height", "50")
                   .attr("x", "10")
                   .attr("y", "10")
                   .attr("fill", "#cecece")
                   .on("click", toggleGraph)

    button.append("text")
          .attr("x", "10")
          .attr("y", "10")
          .attr("width", "150")
          .attr("height", "50")
          .attr("text-anchor", "middle")
          .attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
          .text("Toggle")
          .attr("fill", "black");

    drawGraph();
  }

  d3.select("body").style("background-color", "black");
  d3.csv("viz.csv", init);
});




