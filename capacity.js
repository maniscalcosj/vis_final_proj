import * as d3 from "https://cdn.skypack.dev/d3@7"
import * as topojson from "https://cdn.skypack.dev/topojson@3.0.2";

export default function potential() {
  
  const listeners = { brushed: null}

  /* load the 3 wind datasets */
  Promise.all([ // load multiple files
	d3.csv('ustechnicalpotenital.csv', d3.autoType),
  d3.json('states-albers-10m.json',d3.autoType)
  ]).then(([potential, usMap]) => {
    console.log("potential", potential);
    //console.log("usMap", usMap);
  
    //const usMapGeo = topojson.feature(usMap, usMap.objects.counties);
    const states = topojson.feature(usMap, usMap.objects.states)
    const energyPotentials = states.features.map(state => {
        // const fips = parseInt(county.id)
        return {
          name : state.properties.name,
          cap : potential.filter(p => p.State == state.properties.name)
          
          /*
          solar : potential.filter(p => p.State == state.properties.name),
          wind : potential.filter(p => p.State == state.properties.name),
          biopower : potential.filter(p => p.State == state.properties.name),
          geothermal : potential.filter(p => p.State == state.properties.name),
          hydropower : potential.filter(p => p.State == state.properties.name)
          */
        }
      })
    console.log("energyPotentials", energyPotentials);
  
    
    // console.log(counties);
    //const states = topojson.feature(usMap, usMap.objects.states);
    // const statemap = new Map(states.features.map(d => [d.id, d]));
    const statemesh = topojson.mesh(usMap, usMap.objects.states, (a, b) => a !== b);
    // console.log("statemesh", statemesh)
    // console.log("states", states)
    // console.log("counties", counties)
    // console.log("county features",counties.features)
    // console.log("countyTurbines", countyTurbines)
    // https://github.com/topojson/us-atlas

    /* initialize wind map SVG */
    const width = 975;
    const height = 610;
    const mapContainer = d3.select(".windMap").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0,0, width, height]);
      
     /* initialize wind scatter plot SVG
     const scatter = d3.select(".windScatter").append("svg")
       .attr("width", width)
       .attr("height", height)
       .attr("viewBox", [0,0, width, height]);
    */
    /* create a projection */
    // const projection = null;
    const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305])
    // const projection = d3.geoAlbersUsa()
      // .fitSize([width, height], states)
    
    //= d3.geoMercator()
      //.fitExtent([[0,0], [width,height]], usMapGeo);
      //.fitExtent([[0,0], [width,height]], counties);
    // console.log("Projection test", projection([445.20357651020197, 274.35580559701384]))


    /* create path generator */
    const pathGenerator = d3.geoPath()//.projection(projection);
    // Color scale (originally using number of turbines)
    
    // Using log10 color scale
    const color = d3.scaleSequential(d3.interpolateBlues)
      // .domain(d3.extent(countyTurbines.map(d => d.num_turb)))
      .domain([0, 50]) // A few counties return have absurd numbers of turbines
      .clamp(true)
      // .range(["white", "green"])
    
    // console.log("color domain", d3.extent(countyTurbines.map(d => d.num_turb)))
    // console.log("color example", color(132))
    
    /* create map 
    // Add counties
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
    
    // Add color
    countyTurbines.forEach(c => {
      d3.select(`#fips-${c.fips}`)
        .attr("fill", color(c.num_turb) ? color(c.num_turb) : "black")
    })
    */
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
    
    /*
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
          .attr("opacity", 1)
      );
    */
    
    /* define scale for x-axis */
    /*const xScale = d3.scaleLinear()
      .range([0, width]); */
    const xScale = d3.scaleLinear()
      .rangeRound([0, width - 10])
      //.paddingInner(0.1)
    
    const xScalePoint = d3.scalePoint()
      .rangeRound([0, width - 10])
      //.paddingInner(0.1)

    /* define y axis linear scale (no domain) */
    const yScale = d3.scaleLinear()
      //.domain([0, 100])
      .range([height, 0]);

    /* ordinal scale to color code stacked categories */
    const ordinalScale = d3.scaleOrdinal()
      //.domain(regions)
      .range(d3.schemeTableau10); 

    /* add x axis at bottom of chart */
    const xAxis = d3.axisBottom()
      .scale(xScale);

    /* add y axis at left of chart */
    const yAxis = d3.axisLeft()
      .scale(yScale);

    /* format x axis */
    const xGroup = scatter.append("g")
      .attr("class","axis xAxis")
      .attr("transform",`translate(0, ${height})`);

    /* format y axis */
    const yGroup = scatter.append("g")
      .attr("class"," axis yAxis");

    /* add y axis header */
    const yLabel = scatter.append("text")
      .attr("class", "yHeader")
      .attr("x", - 45)
      //.attr("y", 0 - margin.top)
      .attr("y", 0)
      .attr("dy", "1em")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      //.text("How do Work Sector Portions Change with Income and Child Poverty?");  
      .text("Brushed-Area Averages");

    /* add white border lines */
    // mapContainer.append("path")
    //   // .datum(topojson.mesh(usMap, usMap.objects.counties))
    //   .datum(statemesh)
    //   .attr("d", pathGenerator)
    //   .attr('fill', 'none')
    //     .attr('stroke', 'black')
    //   .attr("class", "subunit-boundary");
    
    /* map turbine locations? */
    // turbines.map(d => {
    //   d.xlong = pathGenerator([d.longitude, d.latitude]); //projection
    //   d.ylat = pathGenerator([d.longitude, d.latitude]);
    // });
    
    // pathGenerator.selectAll(".pin")
    //   .data(turbines)
    //   .enter()
    //   .append("circle", ".pin")
    //   .attr("r", 3)
    //   .attr("fill", "red")
    //   .attr("transform", function(d) {
    //     return "translate(" + projection([
    //       d.location.xlong,
    //       d.location.ylat
    //     ]) + ")";
    //   });
    
    /* title y axis */
    scatter.append("text")
      //.attr('x', -margin.left/2)
      .attr('x', + 35)
      //.attr('y', -margin.top/2)
      .attr('y', 0)
      .text("Portion of Work Sector (%)")
        .attr("transform","rotate(180)")
        .attr("writing-mode", "vertical-rl")
        .attr("alignment-baseline","right")
        .attr("text-anchor","end")
  
    // Select tooltip
    let tooltip = d3.select(".windScatter").append("div")
      .attr("class","tooltip")
      .style("position","fixed")
      .style("opacity",0)
    
    // let tooltip = svg.select(".tooltip")
  
    // Function to show tooltip
    let show_tooltip = function() {
        tooltip.style("opacity",1)
        // d3.select(this).style("opacity",1)
    }

    // Function to set relative tooltip positioning
    let move_tooltip = function(event, d) {
        let tooltip_val = `Sector: ${d.sector}`;

        tooltip
            .style("left", d3.pointer(event, window)[0]+3+"px")
            .style("top", d3.pointer(event, window)[1]-200+"px")
            .html(tooltip_val)
    }

    // Function to hide tooltip
    let hide_tooltip = function() {
        tooltip.style("opacity",0)
        // d3.select(this).style("opacity",1)  
    }
    
    const xHighlight = scatter.append('g')
       .attr('class', 'x-axis-extra')
       .attr("transform", `translate(0,${height})`)
        .style("font-weight","bold")
        .style("font-size","12px")
    
    const yHighlight = scatter.append('g')
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
        [selection_m[0][0], selection_m[1][0]], // x-axis range
        [selection_m[0][1], selection_m[1][1]] // y-axis range
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
        .extent([[0, 0],[width, height]])
        .on("brush",brushed)
        .on("end", brushend)
        // .on("brush", dispatch.call("brushed", this))
        // .on("end", dispatch.call("brushend", this))

    // Add brush to svg
    scatter.append("g").attr('class', 'brush').call(brush);
    
    update(windMetrics);
    
    let selected = null, choiceBounds, minChoice, maxChoice, extentsChoice, turbineBounds, minTurbines, maxTurbines, choice;
    
    const select = document.querySelector("#attraction-category");
      select.addEventListener("change", function() {
      //filterData(event.target.value);             ////// code to call filter based on choice
      choice = event.target.value;
    });
    
    //let turbs
    //console.log("counties",counties);
    //console.log("countyTurbines", countyTurbines);
    
    let data, mergeData;
    
    function getData(choice) {
      if (choice == "2021") {data = population}
      else {data = windMetrics}
      return data;
    };
    
    data = getData("wind_speed"); //////////////////////////// (choice)
    
    let newData = countyTurbines.map(t1 => ({...t1, ...data.find(t2 => t2.fips === t1.fips)}));
    console.log(newData);
    
    // mergeData = (countyTurbines, data) => {
    //   let res = [];
    //   res = countyTurbines.map(obj => {
    //     let index = data.findIndex(el => el["fips"] == obj["fips"]);
    //     let {avg_wind_speed} = index !== -1 ? data[index] : {};
    //     return {
    //       ...obj,
    //       avg_wind_speed
    //     };
    //   });
    //   return res;
    // };
    // console.log(mergeData(countyTurbines, data));
    
//   const mergeArrays = (arr1 = [], arr2 = []) => {
//    let res = [];
//    res = arr1.map(obj => {
//       const index = arr2.findIndex(el => el["id"] == obj["id"]);
//       const { address } = index !== -1 ? arr2[index] : {};
//       return {
//          ...obj,
//          address
//       };
//    });
//    return res;
// };
// console.log(mergeArrays(arr1, arr2)); 
      
      //var same = a.find(v => v.serial == c.serial);
    
    function filterByBrushed(new_domain, choice, data) {
      if (new_domain == null) {
        maxTurbines = 500;
        minTurbines = 0;
        /* get min and max incomes */
        extentsChoice = d3.extent(data.map(d => d[choice]));
        minChoice = extentsChoice[0];
        maxChoice = extentsChoice[1];
      } else {
        turbineBounds = new_domain[1];
        choiceBounds = new_domain[0];
        maxChoice = choiceBounds[1];
        minChoice = choiceBounds[0];
        maxTurbines = turbineBounds[0];
        minTurbines = turbineBounds[1];
        data = data.filter(function (el) {
          return el.p_tnum <= maxTurbines &&
            el.p_tnum >= minTurbines &&
            el[choice] <= maxChoice&&
            el[choice] >= minChoice;
        });
      }
      //update(data, minCP, maxCP, minIncome, maxIncome);
    }

    function update(windMetrics) {
      
      //let extents = d3.extent(windMetrics.map(d => d.wind_speed));
      //let min = extents[0];
      //let max = extents[1];
      
      xScale.domain(windMetrics.map(d => d.avg_wind_speed));
      //xScale.domain(min + 10, max + 10);
      
      yScale.domain(windMetrics.map(d => d.avg_capacity_factor));
      
      //yScale.domain([0, Math.max.apply(Math, portions)]);
      //yScale.domain([0, 100]);

      /* Update bar chart */
      const circles = scatter.selectAll(".circles")
        //.data(data, d => d.company);
        .data(windMetrics)
        //.enter()
        //.append("g")

      circles.join(
        enter => enter.append("circle")
          .attr("class","circles")
          .attr("cx", d => xScale(d.avg_wind_speed))
          .attr("cy", d => yScale(d.avg_capacity_factor))
          .attr("r", 4)
          //.style("fill", function (d) {return ordinalScale(d.sector)})
          .style("fill", "blue")
          .style("stroke", "black"),
        update => update.call(update => 
          //update.transition(t).delay(slowT)
            update.attr("cx", d => xScale(d.avg_wind_speed))
              .attr("cy", d => yScale(d.avg_capacity_factor))
              .attr("r", 4)
              //.attr("fill", color), //***** change colors?
              //.style("fill", function (d) {return ordinalScale(d.sector)})
              //.style("opacity", barOpacity),
                  ),
        exit => exit.remove()
      );
      
      // Create tooltip interactivity
      circles
        .on("mouseover", show_tooltip)
        .on("mousemove", move_tooltip)
        .on("mouseleave", hide_tooltip)
      
    }
    
    function on(event, listener) {
      listeners[event] = listener;
    }
  
    return {
      update,
      on,
      filterByBrushed
      //filterByDate
    }

  })
}