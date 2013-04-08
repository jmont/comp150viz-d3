$(function(){
  var rows = [];
  var canvas, xscale, yscale, barWidth, button, graph, tooltip;

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

  var addBars = function () {
    graph.selectAll("rect.barGraph")
          .data(rows).enter().append("svg:rect")
          .attr("x", function(d) { return xscale(d.L1); })
          .attr("y", function(d) { return height - yscale(d.L2); })
          .attr("height", function(d) { return yscale(d.L2); })
          .attr("width", barWidth)
          .attr("fill", "#2d578b")
          .on("mouseover", function (d) {
                d3.select(this).transition().attr("fill", "#cc0812");
                tooltip.style("visibility", "visible")
                       .text("(" + d.L1 + ", " + d.L2 + ")");
          })
          .on("mousemove", function(){
                tooltip.style("top", (event.pageY-15)+"px")
                       .style("left",(event.pageX+13)+"px"); })
          .on("mouseout", function () {
                d3.select(this).transition().attr("fill", "#2d578b");
                tooltip.style("visibility", "hidden");
          });
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

    graph.selectAll("text.yAxis")
          .data(yscale.ticks(20)).enter().append("svg:text")
          .attr("x", 0)
          .attr("y", function(d) { return height - yscale(d);})
          .attr("dx", -4)
          .attr("text-anchor", "middle")
          .attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
          .text(function(d) { return d; })
          .attr("transform", "translate(18, 0)")
          .attr("class", "yAxis")

    graph.selectAll("line.yAxis")
         .data(yscale.ticks(20))
         .enter().append("line")
         .attr("x1", 30)
         .attr("x2", width)
         .attr("y1", function(d) { return height - yscale(d);})
         .attr("y2", function(d) { return height - yscale(d);})
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
          .on("mouseover", function (d) {
                d3.select(this).transition().attr("fill", "#cc0812")
                               .attr("r", "15");
                tooltip.style("visibility", "visible")
                       .text("(" + d.L1 + ", " + d.L2 + ")");
          })
          .on("mousemove", function(){
                tooltip.style("top", (event.pageY-15)+"px")
                       .style("left",(event.pageX+13)+"px"); })
          .on("mouseout", function () {
                d3.select(this).transition().attr("fill", "#2d578b")
                                            .attr("r", "10");
                tooltip.style("visibility", "hidden");
          });

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
    state = GraphState.LINE_GRAPH;
    canvas = d3.select("#canvas").append("svg:svg")
               .style("background-color", "white")
               //resize svg when widow is resized
               .attr("viewBox", "0 0 " + (width+100) + " " + (height+100))
               .attr("preserveAspectRatio", "xMidYMid meet");

    graph = newGraph();

    button = canvas.append("rect")
                   .attr("width", "150")
                   .attr("height", "50")
                   .attr("x", width-100)
                   .attr("y", "10")
                   .attr("fill", "#cecece")
                   .on("click", toggleGraph);

    button.append("text.onSwitch")
          .attr("x", "10")
          .attr("y", "10")
          .attr("text-anchor", "middle")
          .attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
          .text("Toggle")
          .attr("fill", "black");

    tooltip = d3.select("body").append("div")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .style("background-color", "white")
                .style("color", "#2d578b");

    drawGraph();
  }

  var parseData = function (path, success) {
    var dataStr = $.get(path, function(data) {
      var strLines = data.split('\n');
      var colNames = strLines.splice(0,1)[0].split(',');
      var result = []

      for (var i in strLines) {
        ds = strLines[i].split(',');
        var obj = {}
        /*
          for (var j in colNames) {
          obj[colNames[j]] = ds[j];
        }
        */
        obj.L1 = ds[0];
        obj.L2 = ds[1];
        result.push(obj);
        for (name in obj)
          console.log(name);
      }

      success(result);
    });

  }

  //d3.select("body").style("background-color", "black");
  parseData("viz.csv", init);
  //d3.csv("viz.csv", init);
});




