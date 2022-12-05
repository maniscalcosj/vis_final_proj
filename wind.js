import * as d3 from "https://cdn.skypack.dev/d3@7"

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

export default function wind(turbines, fullData, usMap) {
  
  //const listeners = { brushed: null}
  //let turbines, fullData, usMap;

//   /* load the 3 wind datasets */
//   Promise.all([ // load multiple files
// 	d3.csv('turbine_dist_data.csv', d3.autoType),
// 	d3.csv('full_dataset.csv', d3.autoType),
//   //d3.csv('population_data.csv', d3.autoType),
//   d3.json('counties-albers-10m.json',d3.autoType)
//   ]).then(([turbines, fullData, usMap]) => {
//     //console.log("turbines", turbines);
//     //console.log("full", fullData);
//     //console.log("population", population); 
//     //console.log("usMap", usMap);
    
//     var zero = d3.format("05d");
//     fullData.forEach(d => {
//       d.fips = zero(d.fips);
//     })
    
//     test(turbines, fullData, usMap);
//   })
  
  //function test(turbines, fullData, usMap) {
    
    /* initialize wind map SVG */
    const width = 975;  //975  //1.5983
    const height = 610; //610
    const mapContainer = d3.select(".windMap").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0,0, width, height]);
  
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
    const listeners = { brushed: null}
     
    const margin = {top: 20, right: 10, bottom: 20, left: 50}
    const widthS = 600 - margin.left - margin.right //960
    const heightS = 300 - margin.top - margin.bottom //500

    const svg = d3.select(".windScatter").append("svg")
            .attr("width", widthS + margin.left + margin.right)
            .attr("height", heightS + margin.top + margin.bottom)
            // .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            // .attr("style", "outline: thin solid red;")
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
    
    // NEED TO DUMP ALL THIS IN THE UPDATE FUNCTION
    // Create x-axis scale
    const xScale = d3.scaleLinear()
        .rangeRound([0, widthS])

    // Create y-axis scale
    const yScale = d3.scaleLinear()
        .rangeRound([heightS, 0])
    
    // const cScale = d3.scaleSequential()
    //     .domain([100, 0])
    //     .interpolator(d3.interpolateGreys)
    
    // const sizeScale = d3.scaleSqrt()
    //   .range([4,10])

    // update axes and axis title
    const xAxis = d3.axisTop(xScale)
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(",.2r"))

    // Create axis containers
    const yGroup = svg.append("g")
            .attr("class","y-axis")

    const xGroup = svg.append("g")
            .attr("class","x-axis")
            .attr("transform",`translate(0, ${0})`) //heightS

    
    // const titleLabel = svg.append("text")
    //         .attr("class", "y-axis-label")
    //         // .attr("x", width/2-margin.left)
    //         .attr("x", margin.left)
    //         .attr("y", 0 - margin.top)
    //         .attr("dy", "1em")
    //         .style("text-anchor", "center")
    //         .text("How does the selected variable impact the number of wind turbines in a county?")
    
    // X-axis title
    svg.append("text")
      .attr("class", "xLabel")
		  .attr('x', widthS)
		  .attr('y', -margin.top/2) //.attr('y', heightS-margin.bottom/2)
		  .text("Wind Speed (m/s)")
          .attr("text-anchor","end")

    // Y-axis title
    svg.append("text")
		  .attr('x', -margin.left/4)
		  .attr('y', -margin.top/2)
		  .text("Number of Turbines")
            .attr("transform","rotate(180)")
            .attr("writing-mode", "vertical-rl")
            .attr("alignment-baseline","right")
            .attr("text-anchor","end")
  
//     // Color scale
//     let legend = svg.append("g")
//       .attr("class","legend")
//       .attr("x", width-200)
//       .attr("y", 50)
//       // To move all children elements
//       .attr("transform", `translate(${width-200},${50})`)
//       .attr("height", 200)
//       .attr("width", 200)
    
//     // Legend color boxes
//     legend.selectAll("rect")
//       .data([100,0])
//       .enter()
//       .append("rect")
//         .attr("position","relative")
//         .attr("width", 20)
//         .attr("height", 20)
//         .attr("x", 0)
//         .attr("y", (_, i) => 20+(20+5) * i) // Use padding of 5
//         .style("margin", "5px")
//         .style("stroke","black")
//         .style("fill", d => cScale(d))
  
//     // Legend Text
//     legend.selectAll("label")
//         .data([100,0])
//         .enter()
//         .append("text")
//             .attr("x", 20+5)
//             .attr("y", (_, i) => 20+15+(20+5) * i)
//             .text(d => `${d}%`)
//     // Legend title
//     legend.selectAll("title")
//       .data([0])
//       .enter()
//       .append("text")
//         .attr("x",0)
//         .attr("y",0)
//         .text("Percent Caucasian")
    
    const states = topojson.feature(usMap, usMap.objects.states);
    // const statemap = new Map(states.features.map(d => [d.id, d]));
    const statemesh = topojson.mesh(usMap, usMap.objects.states, (a, b) => a !== b);
    
    const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]); //1300
    
    const pathGenerator = d3.geoPath();  //.projection(projection);
    
    const countymap = mapContainer.selectAll(".county")
      //.data(usMapGeo.features)
      .data(counties.features)
      .join(
        enter => enter.append("path")
          .attr("class", "county")
          .attr("id", d => `fips-${d.id}`)
          .attr("d", pathGenerator)
          // .style("fill", "white")
          .attr("fill", "white")
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
          .attr("cx", d => projection([d.xlong, d.ylat]) ? projection([d.xlong, d.ylat])[0] : 0) // SOME DONT PLOT IDK WHY --> SET THEM TO 0,0
          .attr("cy", d => projection([d.xlong, d.ylat]) ? projection([d.xlong, d.ylat])[1] : 0)
          .attr("r", 2)
          // .style("fill", "none")
          .style("stroke", "black")
          .attr("opacity", 0.8)
      );
    
    const xHighlight = svg.append('g')
       .attr('class', 'x-axis-extra')
       .attr("transform", `translate(0,${height})`)
        .style("font-weight","bold")
        .style("font-size","12px")
    
    const yHighlight = svg.append('g')
       .attr('class', 'y-axis-extra')
       .style("font-weight","bold")
        .style("font-size","12px")
       // .attr("transform", `translate(0,${height})`)

    // Brush has selection
    function brushed({selection}) {
      // console.log('selection',selection[0])
      let selection_m = selection.map(d=> [xScale.invert(d[0]), yScale.invert(d[1])])
      // console.log('selection map',selection_m[0])
      let selection_r = [
        [selection_m[0][0], selection_m[1][0]], // child poverty %
        [selection_m[0][1], selection_m[1][1]] // income 
      ]
      // console.log('selection reorder', selection_r[0])
      // console.log('selection mapped',(selection.map(xScale.invert), selection.map(yScale.invert)))
      if (selection) {
        // listeners["brushed"] = ([x0,y0], [x0,y1])
        listeners["brushed"](selection_r)
      }
      xHighlight.style("display","block")
        .call(d3.axisBottom(xScale).tickValues(selection_r[0]));
      yHighlight.style("display","block")
        .call(d3.axisLeft(yScale).tickValues(selection_r[1]));
    }
    
    // Empty brush selection
    function brushend({selection}) {
        if (!selection) {
          listeners["brushed"](null)
        }
      xHighlight.style("display",'none')
      yHighlight.style("display",'none')
    }

    // Create brush
    const brush = d3.brush()
      .extent([[0, 0],[widthS, heightS]])
      .on("brush",brushed)
      .on("end", brushend)
      // .on("brush", dispatch.call("brushed", this))
      // .on("end", dispatch.call("brushend", this))

    // Add brush to svg
    svg.append("g").attr('class', 'brush').call(brush)
    
    let selected = null, choiceBounds, minChoice, maxChoice, extentsChoice, turbineBounds, minTurbines, maxTurbines, choice;
    
    choice = "avg_wind_speed";
    
    const select = document.querySelector("#choiceSelector");
      select.addEventListener("change", function() {
      //filterData(event.target.value);             ////// code to call filter based on choice
      choice = event.target.value;
      update(fullData);
      updateMap(fullData)
    });
    
        // Select tooltip
    let tooltip = d3.select(".windScatter").append("div")
      .attr("class","tooltip")
      .style("position","absolute")
      .style("opacity",0)
      .style("background", "#EAEDED")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("box-shadow","0 0 4px rgba(#42424E, 0.2)")
      .style("padding", "1rem")
    
    // let tooltip = svg.select(".tooltip")
  
    // Function to show tooltip
    let show_tooltip = function() {
        tooltip.style("opacity",1)
        // d3.select(this).style("opacity",1)
    }

    // Function to set relative tooltip positioning
    let move_tooltip = function(event, d) { /////////////////<br>State: ${d.State}
        let tooltip_val = `<b>County:</b> ${d.fips}
        <br><b>Number of Turbines:</b> ${d3.format(",")(d.num_turbs)}
        <br><b>${choice}:</b> ${d[choice]}`

        tooltip
            // .style("left", d3.pointer(event, window)[0]+3+"px")
            // .style("top", d3.pointer(event, window)[1]+3+"px")
            .style("top", `${d.cy}px`)
            .style("left", `${d.cx}px`) //d.source.cx
            // NEED TO ADD INFO AND FORMAT NUMBERS
            .html(tooltip_val)
    }

    // Function to hide tooltip
    let hide_tooltip = function() {
        tooltip.style("opacity",0)
        // d3.select(this).style("opacity",1)
            
    }
    
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
        tooltip.style("opacity",1)
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

        tooltip
            // .style("left", d3.pointer(event, window)[0]+3+"px")
            // .style("top", d3.pointer(event, window)[1]+3+"px")
            .style("top", `${d.cy}px`)
            .style("left", `${d.cx}px`) //d.source.cx
            // NEED TO ADD INFO AND FORMAT NUMBERS
            .html(tooltip_val)
    }

    // Function to hide tooltip
    let hide_tooltipMap = function() {
        tooltip.style("opacity",0)
        // d3.select(this).style("opacity",1)
            
    }
    
    
    ///////////////////////////////////////////////////////////////////////////////////  
  
//     //Create zoom
//       function zoomed({ transform }) {
//           const copyX = xScale.copy().domain(d3.extent(data, d => d[choice]))
//           const rescaledX = transform.rescaleX(copyX)
//           xDomain = rescaledX.domain()
//           const copyY = yScale.copy().domain(d3.extent(data, d => d.num_turbs))
//           const rescaledY = transform.rescaleX(copyY)
//           yDomain = rescaledY.domain()
//           // Remove brushing parameters 
//           listeners["brushed"](null)
//           svg.select('.brush').call(brushend)
//           update(data)
//           // listeners["zoomed"]([xDomain, yDomain])
//         }

//       const zoom = d3.zoom()
//           .extent([[0, 0], [widthS, heightS]])
//           .translateExtent([[0, 0], [widthS, heightS]])
//           .scaleExtent([1, 4])
//           .on("zoom", zoomed)

//       svg.call(zoom)
//       svg.on("dblclick.zoom", null)
    
    function filterByBrushed(new_domain, fullData) {
      // console.log("newD", new_domain)
      // console.log("choice", choice)
      let newData;
      if (new_domain == null) {
        maxTurbines = d3.max(fullData.map(d => d.num_turbs));
        minTurbines = 0;
        /* get min and max incomes */
        extentsChoice = d3.extent(fullData.map(d => d[choice]));
        minChoice = extentsChoice[0];
        maxChoice = extentsChoice[1];
        updateMap(fullData);
      } else {
        turbineBounds = new_domain[1];
        choiceBounds = new_domain[0];
        maxChoice = choiceBounds[1];
        minChoice = choiceBounds[0];
        maxTurbines = turbineBounds[0];
        minTurbines = turbineBounds[1];
        // console.log("maxTurb", maxTurbines);
        // console.log("minTurb", minTurbines);
        // console.log("maxChoice", maxChoice);
        // console.log("minChoice", minChoice);
        // console.log("oldFull", fullData)
        newData = fullData.filter(function (el) {
          return el.num_turbs <= maxTurbines &&
            el.num_turbs >= minTurbines &&
            el[choice] <= maxChoice &&
            el[choice] >= minChoice;
        });
        // newData.map(obj => ({ ...obj, opacity: 1 }))
        // console.log(newData)
        updateMap(newData);
      }
      // console.log("newFull", fullData);
      //console.log("new", newData);
      updateMap2(newData);
    }
    
    update(fullData);
    updateMap(fullData);

    function update(_data){
      // USE ABSTRACTION FOR SCALE CALLBACKS
      
      data = _data
      data = data.filter(d => d[choice] !== 0);
      // update domains
      xScale.domain(d3.extent(data.map(d => d[choice])))
      //xScale.domain([0, d3.max(data.map(d => d.avg_wind_speed))])
      
      yScale.domain([0, d3.max(data.map(d => d.num_turbs))])
      //yScale.domain([1, 600]);  
      
      // .clamp(true)
      //sizeScale.domain(d3.extent(data.map(d => d.TotalPop)))
      
      let labels = ["Wind Speed (m/s)", "Fraction of Usable Area", "Capacity Factor", "Population"];
      let colors = ["blue", "green", "orange", "red"];
      
      function getInfo(choice) {
        let info = new Array(2);
        if (choice == "avg_wind_speed") {
          info[0] = labels[0];
          info[1] = colors[0];
        } else if (choice == "avg_fraction_of_usable_area") {
          info[0] = labels[1];
          info[1] = colors[1];
        } else if (choice == "avg_capacity_factor") {
          info[0] = labels[2];
          info[1] = colors[2];
        } else {
          info[0] = labels[3];
          info[1] = colors[3];
        }
        return info;
      }

      let info = getInfo(choice);
      
        // Change axes and labels
        xGroup//.transition(t)
            .call(xAxis)
      
        yGroup
            // .transition(t)
            .call(yAxis)
      
      const counties = svg.selectAll(".county")
        //.data(data, d => d.CountyID)
        .data(data) // use an accessor
        .join(
          enter => enter.append("circle")
            .attr("class","county")
            .attr("cx", d => xScale(d[choice]))
            .attr("cy", d => yScale(d.num_turbs))
            //.attr("r", d => sizeScale(d.TotalPop)) 
            .attr("r", 4)
            //.attr("fill", d => cScale(d.White))
            .attr("fill", info[1])
            .attr("stroke", "black")
            .attr("opacity", 1),
          update => update
            .attr("cx", d => xScale(d[choice]))
            .attr("cy", d => yScale(d.num_turbs))
            .attr("fill", info[1])
            //.attr("r", d => sizeScale(d.TotalPop)),
            .attr("r", 4),
          exit => exit.remove()
        )
      
      // X-axis title
      svg.select(".xLabel")
        .data(labels)
        .join(
          enter => enter.append("text")
            .attr("class", "xLabel")
            .attr('x', widthS)
            .attr('y', heightS*0.07) //heightS-margin.bottom/2  //-margin.top/4
            .text(info[0])
              .attr("text-anchor", "end"),
          update => update
            .attr("class", "xLabel")
            .attr('x', widthS)
            .attr('y', heightS*0.07)
            .text(info[0])
              .attr("text-anchor", "end"),
          exit => exit.remove()
        )
      
      // Create tooltip interactivity
      counties
        .on("mouseover", show_tooltip)
        .on("mousemove", move_tooltip)
        .on("mouseleave", hide_tooltip)
      
    }
    
    function updateMap(data) {
      
      function getColor() {
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

      let info = getColor();

        //console.log("info", info)
      // Using log10 color scale
      const color = d3.scaleSequential(d3[info[0]])
        // .domain(d3.extent(countyTurbines.map(d => d.num_turb)))
        //.domain([0, d3.max(fullData.map(d => d.population))]) // A few counties return have absurd numbers of turbines
        .domain([info[1], info[2]]) //1000000 for pop // 1 for fraction area // max cap for cap factor // max wind speed
        .clamp(true)
        // .range(["white", "green"])
      
      // mapContainer.selectAll(".coloredCounty")
      //   .data(data)
      //   .join(
      //     update => update.attr("fill", c => color(c[choice]))
      //   )
    
      //d3.select('.windMap').selectAll('.coloredCounty').remove();
      
      // d3.selectAll(".coloredCounty")
      //   .attr("fill","black")
      // Add color
      data.forEach(c => { //fullData.
        d3.select(`#fips-${c.fips}`)
          .attr("class", "coloredCounty")
          // .attr("fill", color((c[choice])) ? color((c[choice])) : "black")
          .attr("fill", color(c[choice]))
          .attr("opacity", 1)
      })
      
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
      
      fullData.forEach(c => {
        d3.select(`#fips-${c.fips}`)
        .attr("opacity", getOpacity(c.fips))
      })
      
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
      update,
      on,
      filterByBrushed
      //filterByDate
    }

  //}
}