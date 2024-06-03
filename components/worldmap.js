function show_interactive_world_map(width = 960, height = 500) {
    console.log("show_interactive_world_map called");

    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geoMercator()
        .scale(150)
        .translate([width / 2, height / 1.5]);

    var path = d3.geoPath().projection(projection);

    // Create a tooltip element
    var tooltip = d3.select("#map").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid black")
        .style("padding", "5px")
        .style("pointer-events", "none");


    // Load and display the World
    d3.json("https://raw.githubusercontent.com/sandman627/info_vis_project/main/data/countries-110m.json").then(function(world) {
        svg.append("path")
            .datum(topojson.feature(world, world.objects.land))
            .attr("class", "land")
            .attr("d", path);

        svg.append("path")
            .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
            .attr("class", "boundary")
            .attr("d", path);

        // Load power plant data
        d3.csv("https://raw.githubusercontent.com/sandman627/info_vis_project/main/data/global_power_plant_database.csv").then(function(data) {

            var nestedData = d3.nest()
                .key(function(d) { return d.country_long; })
                .entries(data);

            // Log the nested data to debug
            console.log("Nested Data:", nestedData);

            // Extract country properties from GeoJSON
            var countries = topojson.feature(world, world.objects.countries).features;
            console.log("Countries:", countries);

            // Interaction Part
            svg.selectAll(".country")
                .data(countries)
                .enter().append("path")
                .attr("class", "country")
                .attr("d", path)
                .style("fill", 'lightgrey')
                .on("click", function(d) {
                    // console.log("Clicked on country (Pro):", d.properties);
                    // console.log("Clicked on country (Con):", d.properties.name);

                    var countryName = d.properties.name; 
                    console.log("Clicked on country:", countryName);
                    d3.select("#selected_country_name").text(countryName);

                    // Find data for the clicked country
                    var countryData = nestedData.find(function(country) {
                        // console.log("Country : ", country);
                        return country.key === countryName;
                    });
                    console.log("Country Data:", countryData);

                    if (countryData) {
                        console.log("Data found for country:", countryName);
                        updatePieChart(countryData.values);
                        updateLineChart(countryData.values);
                    } else {
                        console.log("No data found for country:", countryName);
                        alert("No data found for " + countryName);
                    }
                });

            // Plot power plants
            // svg.selectAll("circle")
            //     .data(data)
            //     .enter()
            //     .append("circle")
            //     .attr("cx", function(d) {
            //         return projection([d.longitude, d.latitude])[0];
            //     })
            //     .attr("cy", function(d) {
            //         return projection([d.longitude, d.latitude])[1];
            //     })
            //     .attr("r", 2)
            //     .attr("fill", "red")
            //     .attr("opacity", 0.6)
            //     .append("title")
            //     .text(function(d) {
            //         return d.name + "\nCapacity: " + d.capacity + " MW";
            //     });

            // Plot power plants with tooltip
            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    console.log("CX Dot Longitude:", d.longitude);
                    console.log("CY Dot Latitude:", d.latitude);
                    return projection([d.longitude, d.latitude])[0];
                })
                .attr("cy", function(d) {
                    console.log("CY Dot Longitude:", d.longitude);
                    console.log("CY Dot Latitude:", d.latitude);
                    return projection([d.longitude, d.latitude])[1];
                })
                .attr("r", 2)
                .attr("fill", "red")
                .attr("opacity", 0.6)
                .on("mouseover", function(event, d) {
                    console.log("Mouseover:", d);
                    console.log("Dot Longitude:", d.longitude);
                    console.log("Dot Latitude:", d.latitude);
                    console.log("Dot Name:", d.name);
                    console.log("Dot Country:", d.country_long);
                    console.log("Dot Capacity:", d.capacity_mw);

                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html("Name: " + d.name + "<br/>Country: " + d.country_long + "<br/>Capacity: " + d.capacity_mw + " MW")
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mousemove", function(event, d) {
                    var svgPosition = d3.select("#map svg").node().getBoundingClientRect();
                    tooltip
                        .style("left", (event.clientX - svgPosition.left + 5) + "px")
                        .style("top", (event.clientY - svgPosition.top - 28) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });



        }).catch(function(error) {
            console.log("Error loading CSV data:", error);
        });
    }).catch(function(error) {
        console.log("Error loading GeoJSON data:", error);
    });
}


function updatePieChart(data) {
    console.log("updatePieChart called");
    console.log("Data:", data);

    // Aggregate data for pie chart based on primary_fuel
    var pieData = d3.nest()
        .key(function(d) { return d.primary_fuel; })
        .rollup(function(v) { return v.length; }) // Count the number of occurrences for each primary_fuel
        .entries(data);

    console.log("Pie Data:", pieData);

    // Set up pie chart dimensions and arc generator
    var pieWidth = 300, pieHeight = 300, radius = Math.min(pieWidth, pieHeight) / 2;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var pieSvg = d3.select("#pie-chart").html("").append("svg")
        .attr("width", pieWidth)
        .attr("height", pieHeight)
        .append("g")
        .attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");

    var arc = d3.arc().outerRadius(radius - 10).innerRadius(0);
    var pie = d3.pie().value(function(d) { return d.value; });

    var g = pieSvg.selectAll(".arc")
        .data(pie(pieData))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.key); });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function(d) { return d.data.key; });
}


function updateLineChart(data) {
    console.log("updateLineChart called");

    // Aggregate data for line chart based on estimated generation
    var years = ["2013", "2014", "2015", "2016", "2017"];
    var generationData = years.map(function(year) {
        return {
            year: year,
            generation: d3.sum(data, function(d) {
                return +d["estimated_generation_gwh_" + year] || 0;
            })
        };
    });

    console.log("Generation Data:", generationData);

    // Set up line chart dimensions and scales
    var lineWidth = 600, lineHeight = 400;
    var margin = { top: 20, right: 50, bottom: 50, left: 60 };
    var width = lineWidth - margin.left - margin.right;
    var height = lineHeight - margin.top - margin.bottom;

    var x = d3.scalePoint().domain(years).range([0, width]).padding(0.5);
    var y = d3.scaleLinear()
        .domain([0, d3.max(generationData, function(d) { return d.generation; }) * 1.1]) // Add 10% padding above the max value
        .range([height, 0]);

    var line = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.generation); })
        .curve(d3.curveMonotoneX); // Add curve for smoother lines

    var svg = d3.select("#line-chart").html("").append("svg")
        .attr("width", lineWidth)
        .attr("height", lineHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("stroke", "black");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    svg.append("path")
        .datum(generationData)
        .attr("class", "line")
        .attr("fill", "none") // Ensure no area is filled
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.selectAll(".dot")
        .data(generationData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", function(d) { return x(d.year); })
        .attr("cy", function(d) { return y(d.generation); })
        .attr("r", 5)
        .style("fill", "blue");

    svg.selectAll(".text")
        .data(generationData)
        .enter().append("text")
        .attr("x", function(d) { return x(d.year); })
        .attr("y", function(d) { return y(d.generation) - 10; })
        .attr("text-anchor", "middle")
        .text(function(d) { return d.generation.toFixed(2); });
}



document.addEventListener("DOMContentLoaded", show_interactive_world_map());
