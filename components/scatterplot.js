// scatterplot.js


function show_scatterplot(width = 500, height = 300) {
    // Set up the SVG canvas dimensions
    // Create SVG element
    var svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("border", "1px solid black");

    // Sample data
    var dataset = [
        [5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
        [410, 12], [475, 44], [25, 67], [85, 21], [220, 88]
    ];

    // Create scales
    var xScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, function(d) { return d[0]; })])
                    .range([0, width]);

    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, function(d) { return d[1]; })])
                    .range([height, 0]);

    // Create circles for scatter plot
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d[0]); })
        .attr("cy", function(d) { return yScale(d[1]); })
        .attr("r", 5);

    // Create labels for points
    svg.selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .text(function(d) { return d[0] + "," + d[1]; })
        .attr("x", function(d) { return xScale(d[0]); })
        .attr("y", function(d) { return yScale(d[1]); })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "red");
}



var width = 500;
var height = 300;




document.addEventListener("DOMContentLoaded", show_scatterplot(width=width, height=height));

