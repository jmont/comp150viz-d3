$(function () {
  d3.select("body").style("background-color", "black");

  var canvas = d3.select("#canvas")
                 .append("svg:svg")
                 .attr("width", 400)
                 .attr("height", 400)
                 .style("background-color", "white");

  var textLabel = canvas.append("text")
        .attr("id", "textLabel")
        .attr("class", "cts")
        .attr("x", 125)
        .attr("y", 175)
        .text("This button is red!");

  d3.selectAll(".cts").attr("fill", "green");

  var toggle = (function() {
      var c1 = "red";
      var c2 = "blue";
      var t1 = "This button is red!"
      var t2 = "This button is blue!"
      var color = c1;

      return function () {
          color = color == c1 ? c2 : c1;

          if (color == c1) { //  Large button state
              textLabel.text(t1)
                .attr("x", 125)
                .attr("y", 175);

              d3.select(this)
                .attr("width", 150)
                .attr("height", 50)
                .attr("x", 125)
                .attr("y", 175)
                .style("fill", color)

          } else { // Small button state
              textLabel.text(t2)
                .attr("x", 162)
                .attr("y", 187);

              d3.select(this)
                .attr("width", 75)
                .attr("height", 25)
                .attr("x", 162)
                .attr("y", 187)
                .style("fill", color)
          }
      }
  })

  canvas.append("svg:rect")
        .attr("width", 150)
        .attr("height", 50)
        .attr("x", 125)
        .attr("y", 175)
        .attr("fill", "red")
        .data("t1", "this is red")
        .data("c1", "red")
        .on("click", toggle())
        .on("mouseover", function() {
          d3.select(this).d3Click();
        });

})
