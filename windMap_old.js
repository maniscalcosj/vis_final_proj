//import * as d3 from "https://cdn.skypack.dev/d3@7"

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

export default function windMap(turbines, fullData, usMap) {
  
    
    /* initialize wind map SVG */
    const idealwidth = 975;  //975  //1.5983
    const idealheight = 610; //610
    const width = d3.select('.windMap').node().getBoundingClientRect().width
    const height = d3.select('.windMap').node().getBoundingClientRect().width
    // console.log("[height, width]",[height, width])
    const mapContainer = d3.select(".windMap").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0,0, width, height])
      .append("g")
      .attr("transform", "scale(" + width/idealwidth + ")");
  
    //const usMapGeo = topojson.feature(usMap, usMap.objects.counties);
    const counties = topojson.feature(usMap, usMap.objects.counties)
    // const countyTurbines = counties.features.map(county => {
    //     // const fips = parseInt(county.id)
    //     return {
    //       fips : county.id,
    //       num_turb : turbines.filter(t => t.fips == county.id).length,
    //       //test: fullData.filter(d => d.fips == county.id)
    //       //avg_speed : windMetrics.find(s => s.fips == county.id)
    //       //avg_wind_speed : windSpeed.find(s => s.fips == county.id),
    //       //population : population.filter(p => p.fips == county.id)
    //     }
    //   })
    
    let data, xDomain, yDomain
    // const listeners = { brushed: null}
    
    const states = topojson.feature(usMap, usMap.objects.states);
    // const statemap = new Map(states.features.map(d => [d.id, d]));
    // const statemesh = topojson.mesh(usMap, usMap.objects.states, (a, b) => a !== b);
    
    // const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]); //1300
    
    const pathGenerator = d3.geoPath();  //.projection(projection);
    
    const color = d3.scaleSequential(d3.interpolateBlues)
        // .domain(d3.extent(countyTurbines.map(d => d.num_turb)))
        //.domain([0, d3.max(fullData.map(d => d.population))]) // A few counties return have absurd numbers of turbines
        .domain(d3.extent(fullData.map(d => d.avg_wind_speed))) //1000000 for pop // 1 for fraction area // max cap for cap factor // max wind speed
        .clamp(true)
    
    const countymap = mapContainer.selectAll(".county")
      //.data(usMapGeo.features)
      .data(counties.features, d=>d.fips)
      .join(
        enter => enter.append("path")
          .attr("class", "county")
          // .attr("id", d => `fips-${d.id}`)
          .attr("d", pathGenerator)
          // .style("fill", "white")
          // .attr("fill", "white")
          .attr("fill", c => color(fullData.find(x => x.fips === c.fips).avg_wind_speed))
          .style("stroke", "grey")
          .attr("opacity", 1)
      );
    
    //console.log(counties.features);
  
    const statemap = mapContainer.selectAll(".state")
      //.data(usMapGeo.features)
      .data(states.features)
      .join(
        enter => enter.append("path")
          .attr("class", "state")
          .attr("d", pathGenerator)
          .style("fill", "none")
          .style("stroke", "black")
          .attr("opacity", 1)
      );
    // console.log("projection test", projection([turbines[0].xlong, turbines[0].ylat]))
    // Add turbines
    const map = mapContainer.selectAll(".turbine")
      //.data(usMapGeo.features)
      .data(turbines)
      .join(
        enter => enter.append("circle")
          .attr("class", "turbine")
          .attr("cx", d => projection([d.xlong, d.ylat]) ? projection([d.xlong, d.ylat])[0] : 0)
          .attr("cy", d => projection([d.xlong, d.ylat]) ? projection([d.xlong, d.ylat])[1] : 0)
          .attr("r", 2)
          // .style("fill", "none")
          .style("stroke", "black")
          .attr("opacity", 0.8)
      );
    
    let selected = null, choiceBounds, minChoice, maxChoice, extentsChoice, turbineBounds, minTurbines, maxTurbines, choice;
    
    choice = "avg_wind_speed";
    
    const select = document.querySelector("#choiceSelector");
      select.addEventListener("change", function() {
      //filterData(event.target.value);             ////// code to call filter based on choice
      choice = event.target.value;
      //update(fullData);
      updateMap(fullData)
    });
    
    // Select tooltip
    let tooltipMap = d3.select(".windMap").append("div")
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
        tooltipMap.style("opacity",1)
        // d3.select(this).style("opacity",1)
    }
    
    function getNumTurbs(searchValue) {
      let array = fullData.find(d => d.fips == searchValue);
      return array.num_turbs;
    }
  
    function getChoiceVal(searchValue) {
      let array = fullData.find(d => d.fips == searchValue);
      return array[choice];
    }
      
    
    // Function to set relative tooltip positioning
    let move_tooltipMap = function(event, d) { /////////////////<br>State: ${d.State}
        let tooltip_val = `<b>County:</b> ${d.id}
        <br><b>Number of Turbines:</b> ${d3.format(",")(getNumTurbs(d.id))}
        <br><b>${choice}:</b> ${getChoiceVal(d.id)}`
        
        ////d3.format(",")(d.num_turbs)

        tooltipMap
            // .style("left", d3.pointer(event, window)[0]+3+"px")
            // .style("top", d3.pointer(event, window)[1]+3+"px")
            // .style("top", `${d.cy}px`)
            // .style("left", `${d.cx}px`) //d.source.cx
            .style("top", `${d.cy}px`)
            .style("left", `${d.cx}px`) //d.source.cx
            // NEED TO ADD INFO AND FORMAT NUMBERS
            .html(tooltip_val)
    }

    // Function to hide tooltip
    let hide_tooltipMap = function() {
        tooltipMap.style("opacity",0)
        // d3.select(this).style("opacity",1)
            
    }

    
    function filterByBrushed(new_domain, fullData) {
      // console.log("newD", new_domain)
      // console.log("choice", choice)
      let newData;
      let newCounties;
      if (new_domain == null) {
        maxTurbines = d3.max(fullData.map(d => d.num_turbs));
        minTurbines = 0;
        /* get min and max incomes */
        extentsChoice = d3.extent(fullData.map(d => d[choice]));
        minChoice = extentsChoice[0];
        maxChoice = extentsChoice[1];
        newData = fullData;
        //updateMap(fullData);
      } else {
        turbineBounds = new_domain[1];
        choiceBounds = new_domain[0];
        maxChoice = choiceBounds[1];
        minChoice = choiceBounds[0];
        maxTurbines = turbineBounds[0];
        minTurbines = turbineBounds[1];
        newData = fullData.filter(function (el) {
          return el.num_turbs <= maxTurbines &&
            el.num_turbs >= minTurbines &&
            el[choice] <= maxChoice &&
            el[choice] >= minChoice;
        });
        //newCounties = counties.features.filter(d => newData.map(c => c.fips).includes(d.id));
        
        
        //console.log(newCounties);
        // newData.map(obj => ({ ...obj, opacity: 1 }))
        // console.log(newData)
        //updateMap2(newData);
      }
      updateMap2(newData);
    }

    updateMap(fullData);
    
    function updateMap(data) {
      
      function getInfo() {
        let info = Array(3);
        if (choice == "avg_wind_speed") {
          info[0] = "interpolateBlues";
          info[1] = 3.96;
          info[2] = d3.max(fullData.map(d => d[choice]));
        } else if (choice == "avg_capacity_factor") {
          info[0] = "interpolateOranges";
          info[1] = 0.153;
          info[2] = d3.max(fullData.map(d => d[choice]));
        } else if (choice == "avg_fraction_of_usable_area") {
          info[0] = "interpolateGreens";
          info[1] = 0.004;
          info[2] = 1;
        } else {
          info[0] = "interpolateReds";
          info[1] = 0;
          info[2] = 1000000;
        }
        return info;
      }

      let info = getInfo();

        //console.log("info", info)
      // Using log10 color scale
      // const color = d3.scaleSequential(d3[info[0]])
      //   // .domain(d3.extent(countyTurbines.map(d => d.num_turb)))
      //   //.domain([0, d3.max(fullData.map(d => d.population))]) // A few counties return have absurd numbers of turbines
      //   .domain([info[1], info[2]]) //1000000 for pop // 1 for fraction area // max cap for cap factor // max wind speed
      //   .clamp(true)
      
       mapContainer.selectAll(".county")
        .data(counties.features, d=>d.fips)
        //.data(data)
        .join(
          enter => enter.append("path")
            .attr("class", "coloredCounty")
            //.attr("id", d => `fips-${d.id}`)
            .attr("d", pathGenerator)
            // .attr("fill", "white")
            .attr("fill", c => color(c[choice]))
            .style("stroke", "grey"),
            //.attr("opacity", 1),
          update => update
            // .attr("d", pathGenerator)
           .attr("fill", c => color(c[choice])),
          exit => exit.attr("fill", "white")
      );

      
      //console.log(counties.features)
      
      // d3.selectAll(".coloredCounty")
      //   .attr("fill","black")
      // Add color
      // data.forEach(c => { //fullData.
      //   d3.select(`#fips-${c.fips}`)
      //     .attr("class", "coloredCounty")
      //     // .attr("fill", color((c[choice])) ? color((c[choice])) : "black")
      //     .attr("fill", color(c[choice]))
      //     .attr("opacity", 1)
      // })
      
      d3.selectAll(".coloredCounty")
        .on("mouseover", show_tooltipMap)
        .on("mousemove", move_tooltipMap)
        .on("mouseleave", hide_tooltipMap)
        
      //getOpacity("02013")
      //console.log(data.find(d => d.fips == "02013") == null)

            // Create tooltip interactivity      
      
    }
  
    function updateMap2(data) {
      
      //console.log("full", fullData);
      
      function getOpacity(searchValue) {
        let opacity;
        if ((data.find(d => d.fips === searchValue)) == null) {
          //console.log("0")
          opacity = 0;
        } else {
          //console.log("1")
          opacity = 1;
        }
        return opacity;
      }
      
      // d3.selectAll(".coloredCounty")
      //   .attr("opacity", 0);
      
      // fullData.forEach(c => {
      //   d3.select(`#fips-${c.fips}`)
      //   .attr("opacity", getOpacity(c.fips))
      // })
      
      d3.selectAll(".coloredCounty")
        .attr("opacity", 0)
      
      data.forEach(c => {
        d3.select(`#fips-${c.fips}`)
        .attr("opacity", 1)
      })
      
      //const counties = 
      // mapContainer.selectAll(".coloredCounty")
      //   .data(data)
      //   .join(
      //     enter => enter.append("path")
      //       //.attr("class", "test")
      //       //.attr("id", d => `fips-${d.id}`)
      //       .attr("d", pathGenerator)
      //       .attr("fill", "red")
      //       //.attr("fill", c => color(c[choice]))
      //       .style("stroke", "grey"),
      //       //.attr("opacity", 1),
      //     update => update
      //       .attr("d", pathGenerator)
      //       //.attr("fill", d => (data.find(c => c.fips == d.id))),
      //       .attr("fill", "red"),
      //     //.attr("opacity", 1),
      //     exit => exit.remove()
      // );
   
      // Testing with opacity (append class to brushed data and set class opacity to 1??)
      
//       mapContainer.selectAll(".coloredCounty")
//         .attr("opacity", 0)
      
//       data.selectAll(".coloredCounty")
//         .attr("opacity", 1)
      
      // data.forEach( c => {
      //   d3.select(`#fips-${c.fips}`)
      //   .attr("opacity", 1)
      // })
      
      // d3.selectAll(".coloredCounty")
      //   .data(fullData)
      //   .attr("opacity", d => getOpacity(d.fips))
    }

    ////////////////////////////////////////////////////////
    
        // Create tooltip interactivity

    
    function on(event, listener) {
      listeners[event] = listener;
    }
  
    return {
      updateMap,
      on,
      filterByBrushed
      //filterByDate
    }

  //}
}