var width = 960, height = 500;

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var g = svg.append("g");

console.log("Hello, world!");


d3.json("components/countries-110m.json").then(data => {
    console.log(data);
});

// // Load and display the World
// d3.json("./components/countries-110m.json").then(function(world) {
//     g.append("path")
//         .datum(topojson.feature(world, world.objects.land))
//         .attr("class", "land")
//         .attr("d", path);

//     // Load and display the graticule
//     g.append("path")
//         .datum(d3.geoGraticule())
//         .attr("class", "graticule")
//         .attr("d", path);

//     // Load and display power plants
//     d3.json("powerplants.json").then(function(powerPlants) {
//         svg.selectAll(".power-plant")
//             .data(powerPlants)
//             .enter().append("circle")
//             .attr("class", "power-plant")
//             .attr("r", 3)
//             .attr("transform", function(d) {
//                 return "translate(" + projection(d.coordinates) + ")";
//             })
//             .append("title")
//             .text(function(d) { return d.name; });
//     });
// });
