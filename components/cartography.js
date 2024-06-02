// cartography.js



function show_world_map() {
    // Width and height of the SVG
    var width = 960;
    var height = 600;

    // Create SVG element
    var svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height);

    // Define map projection
    var projection = d3.geoMercator()
                    .scale(150)
                    .translate([width / 2, height / 1.5]);

    // Define path generator
    var path = d3.geoPath().projection(projection);

    // Load world map and power plant data
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(
        function(world)
        {
            d3.csv("data/global_power_plant_database.csv").then(
                function(data) 
                {
                    // Draw the map
                    svg.append("path")
                        .datum(topojson.feature(world, world.objects.countries))
                        .attr("d", path)
                        .attr("class", "countries");

                    // Plot power plants
                    svg.selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", function(d) {
                            return projection([d.longitude, d.latitude])[0];
                        }
                        )
                        .attr("cy", function(d) {
                            return projection([d.longitude, d.latitude])[1];
                        })
                        .attr("r", 2)
                        .attr("fill", "red")
                        .attr("opacity", 0.6)
                        .append("title")
                        .text(function(d) {
                            return d.name + "\nCapacity: " + d.capacity + " MW";
                        }
                    );
                }
            );
        }
    );
}   



document.addEventListener("DOMContentLoaded", show_world_map());

