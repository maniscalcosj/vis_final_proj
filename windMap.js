// import * as d3 from "https://cdn.skypack.dev/d3@7"

// Look at this --> https://bl.ocks.org/cmgiven/abca90f6ba5f0a14c54d1eb952f8949c

// Switch the code to be two files --> one for chlorpleth and one for the scatter plot
// This will allow you to write better update functions:
/*
  Rather than:
  d3.selectAll(do it by id)
  
  You can do 
  map.selectAll(select by class)
  
  Then you can use the update pattern to change the colors dynamically
  i.e. you only map over the data once.
  
*/

export default function windMap(counties, states) {
  
    /* initialize wind map SVG */
    const idealwidth = 975;  //975  //1.5983
    const idealheight = 610; //610
    const width = d3.select('.windMap').node().getBoundingClientRect().width
    // const height = d3.select('.windMap').node().getBoundingClientRect().width
    const height = width * 610/975
    // console.log("[height, width]",[height, width])
    const mapContainer = d3.select(".windMap").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0,0, width, height])
      .append("g")
      .attr("transform", "scale(" + width/idealwidth + ")");
      
    const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]); //1300
    const pathGenerator = d3.geoPath();  //.projection(projection);
    
    let color = d3.scaleSequential(d3.interpolateBlues)
        //.domain(d3.extent(counties.features.map(d => d.properties.avg_wind_speed)))
        .domain([3.96, d3.max(counties.features.map(d => d.properties.avg_wind_speed))])
        .clamp(true)
    
    const color_vars = {
      "avg_wind_speed" : d3.interpolateBlues,
      "avg_capacity_factor" : d3.interpolateOranges, 
      "avg_fraction_of_usable_area" : d3.interpolateGreens,
      "population" : d3.interpolateReds,
      "num_turbs" : d3.interpolateReds
    }
    
    var choice = "avg_wind_speed";
  
    let size = d3.scaleLinear()
    .range([0, 50])
    .domain([0, d3.max(counties.features.map(d => d.properties.num_turbs))])
    
    // mapContainer.selectAll(".county-outlines")
    //   .data(counties.features, d=>d.fips)
    //   .join(
    //     enter => enter.append("path")
    //       .attr("class", "county-outlines")
    //       .attr("d", pathGenerator)
    //       .attr("fill", "none")
    //       .style("stroke", "black")
    //       .attr("opacity", 1)
    //   );
  
    const countymap = mapContainer.selectAll(".county")
      .data(counties.features, d=>d.fips)
      .join(
        enter => enter.append("path")
          .attr("class", "county")
          .attr("d", pathGenerator)
          .attr("fill", c => color(c.properties.avg_wind_speed))
          .style("stroke", "#636060")
          .attr("opacity", 1)
      );
  
    // Add State lines
    mapContainer.selectAll(".state")
      .data(states.features)
      .join(
        enter => enter.append("path")
          .attr("class", "state")
          .attr("d", pathGenerator)
          .attr("fill", "none")
          .style("stroke", "black")
          .attr("opacity", 1)
    );
    
    //console.log(counties.features);
  
    // const statemap = mapContainer.selectAll(".state")
    //   //.data(usMapGeo.features)
    //   .data(states.features)
    //   .join(
    //     enter => enter.append("path")
    //       .attr("class", "state")
    //       .attr("d", pathGenerator)
    //       .style("fill", "none")
    //       .style("stroke", "black")
    //       .attr("opacity", 1)
    //   );
    // console.log("projection test", projection([turbines[0].xlong, turbines[0].ylat]))
    // Add turbines
    // get fips codes of counties with more than 10 turbines
    // mapContainer.selectAll(".turbine")
    //   .data(turbines)
    //   .join(
    //     enter => enter.append("circle")
    //       .attr("class", "turbine")
    //       .attr("cx", d => projection([d.xlong, d.ylat]) ? projection([d.xlong, d.ylat])[0] : 0)
    //       .attr("cy", d => projection([d.xlong, d.ylat]) ? projection([d.xlong, d.ylat])[1] : 0)
    //       .attr("r", 2)
    //       // .style("fill", "none")
    //       .style("stroke", "black")
    //       .attr("opacity", 0.8)
    //   );
    
    
    const select = document.querySelector("#choiceSelector");
      select.addEventListener("change", function() {
      choice = event.target.value;
      // console.log("new choice", choice)
      // Update color scale
        
      function getChoice() {
        return choice;
      }
      
      function getInfo() {
        let info = Array(3);
        if (choice == "avg_wind_speed") {
          info[0] = "interpolateBlues";
          info[1] = 3.96;
          //info[2] = d3.max(counties.properties.map(d => d[choice]));
          info[2] = d3.max(counties.features.map(d => d.properties.avg_wind_speed));
        } else if (choice == "avg_capacity_factor") {
          info[0] = "interpolateOranges";
          info[1] = 0.153;
          info[2] = d3.max(counties.features.map(d => d.properties.avg_capacity_factor));
        } else if (choice == "avg_fraction_of_usable_area") {
          info[0] = "interpolateGreens";
          info[1] = 0.004;
          info[2] = 1;
        } else {
          info[0] = "interpolateReds";
          info[1] = 0;
          info[2] = 2000000;
        }
        return info;
      }
        
      let info = getInfo();
        
      color = d3.scaleSequential(color_vars[choice])
        //.domain(d3.extent(counties.features.map(d => d.properties[choice])))
        .domain([info[1], info[2]])
        .clamp(true)
      updateMap(counties)
    });
    
    // Select tooltip
    let tooltipMap = d3.select("#windContent").append("div")
      .attr("class","tooltip")
      .style("position","absolute")
      .style("opacity",0)
      .style("background", "#EAEDED")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("box-shadow","0 0 4px rgba(#42424E, 0.2)")
      .style("padding", "1rem")
    
    // Function to show tooltip
    let show_tooltipMap = function() {
        tooltipMap.style("opacity",0.9)
        // d3.select(this).style("opacity",1)
    }
    
    function formatTooltipVal() {
      let format;
      if (choice == "population") {
        format = ",";
      } else {
        format = ".2f";
      }
      return format;
    }
      
    // Function to set relative tooltip positioning
    let move_tooltipMap = function(event, d) {
        let tooltip_val = `<b>State:</b> ${d.properties.state}
        <br><b>County:</b> ${d.properties.name}
        <br><b>Number of Turbines:</b> ${d3.format(",")(d.properties.num_turbs)}
        <br><b>${choice}:</b> ${d3.format(formatTooltipVal())(d.properties[choice])}`

        tooltipMap
            // .style("left", d3.pointer(event, window)[0]+3+"px")
            // .style("top", d3.pointer(event, window)[1]+3+"px")
            // .style("top", `${d.cy}px`)
            // .style("left", `${d.cx}px`) //d.source.cx
            // .style("top", `${d.cy}px`)
            // .style("left", `${d.cx}px`) //d.source.cx
            .style('left', (d3.select('#windContent').node().getBoundingClientRect().width * 0.6) + 'px')
            .style('top', (d3.select('#windContent').offsetHeight * 0.2) + 'px') 
            // NEED TO ADD INFO AND FORMAT NUMBERS
            .html(tooltip_val)
    }

    // Function to hide tooltip
    let hide_tooltipMap = function() {
        tooltipMap.style("opacity",0)
    }
  
  function filterCounties(counties, new_domain){
      for (let i = 0; i < counties.features.length; i++) {
        if (new_domain == null) {
          let c = counties.features[i];
          c.filtered = 0;
        } else {
          let c = counties.features[i]
          // This filtering is not working --> currently all counties are being filtered
          // new_domain[1] = choice and new_domain[0] = turbines??
          const is_included = 
            c.properties[choice] <= new_domain[0][1] &&
            c.properties[choice] >= new_domain[0][0] &&
            c.properties.num_turbs <= new_domain[1][0] && 
            c.properties.num_turbs >= new_domain[1][1] 
          if (is_included) {
          // if (c.properties[choice] <= new_domain[0][1] &&
          //   c.properties[choice] >= new_domain[0][0] &&
          //   c.properties.num_turbs <= new_domain[1][0] && 
          //   c.properties.num_turbs >= new_domain[1][1] ) {
              c.filtered = 0
          } else {
            c.filtered = 1
          }
        }
    }
    return counties
  }
  
  function filterByBrushed(new_domain, counties) {
    
    console.log(counties)
    
    //const filtered = new_domain ? filterCounties(counties, new_domain) : counties
    const filtered = filterCounties(counties, new_domain);
    
    //console.log("masked counties", filtered.features.filter(c => c.filtered === 1)) // Currently all counties are being filtered
    
    updateMap(filtered)
  }
  
  function updateMap(counties) {    
    mapContainer.selectAll(".county")
      .data(counties.features, d=>d.fips)
      .join(
        enter => enter.append("path")
          .attr("class", "county")
          .attr("d", pathGenerator)
          .attr("fill", c => color(c.properties.avg_wind_speed))
          .style("stroke", "black")
          .attr("opacity",c => c.filtered ? 0 : 1),
        update => update
          .attr("fill", c => color(c.properties[choice]))
          .attr("opacity", c => c.filtered === 1 ? 0 : 1) // when brushing, set c.filtered to 1 when it should hide
      );
  }
  
    function getCentroid(element) {
      const bbox = element.getBBox();
      return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
    }
  
    counties.features.forEach(c => {
      c.centroid = getCentroid(d3.select(`#id-${c.fips}.county`).node())
    })
  
    var turbOpacity = 0.5;
    var turbSize = "num_turbs";
    
    d3.selectAll("input[name=toggleTurbines]").on("change", event=>{
      let radioSelection = event.target.value; // selected button
      if (radioSelection === "choice2") {
        turbOpacity = 0.5;
        turbSize = "turb_size";
      } else {
        turbOpacity = 0;
        turbSize = "num_turbs";
      }
      updateTurb(turbOpacity, turbSize);
    });
  
  function updateTurb(turbOpacity, turbSize) {
    // Add turbine circles 
    mapContainer.selectAll(".turbine")
      .data(counties.features, d=>d.fips)
      .join(
        enter => enter.append("circle")
          .attr("class", "turbine")
          .attr("cx", c => c.centroid[0])
          .attr("cy",c => c.centroid[1])
          .attr("r", c => size(c.properties.num_turbs))
          .attr("fill", "black")
          .style("stroke", "black")
          .attr("opacity", 0.5),
        update => update
          .attr("r", c => size(c.properties[turbSize]))
          .attr("opacity", 0.5)
      );
  }

  updateTurb(turbOpacity, turbSize);
  
  d3.selectAll(".county")
    .on("mouseover", show_tooltipMap)
    .on("mousemove", move_tooltipMap)
    .on("mouseleave", hide_tooltipMap)
  
  return {
    filterByBrushed
  }
}