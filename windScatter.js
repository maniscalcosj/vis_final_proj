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

export default function windScatter(counties) {
  
    
    let data, xDomain, yDomain
    const listeners = { brushed: null}
     
    const margin = {top: 20, right: 10, bottom: 20, left: 50}
    // const widthS = 600 - margin.left - margin.right //960
    // const heightS = 300 - margin.left - margin.right //500
    const widthS = d3.select('.windScatter').node().getBoundingClientRect().width- margin.left - margin.right
    const heightS = widthS * 0.8 - margin.left - margin.right

    const svg = d3.select(".windScatter").append("svg")
            .attr("width", widthS + margin.left + margin.right)
            .attr("height", heightS + margin.top + margin.bottom)
            // .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            // .attr("style", "outline: thin solid red;")
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
    
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
    
    const xHighlight = svg.append('g')
       .attr('class', 'x-axis-extra')
       .attr("transform", `translate(0,${heightS})`)
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
        [selection_m[0][0], selection_m[1][0]], // choice
        [selection_m[0][1], selection_m[1][1]] // num turbs 
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
      choice = event.target.value;
      update(counties);
    });
    
        // Select tooltip
    let tooltip = d3.select("#windContent").append("div") //".windScatter"
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
        tooltip.style("opacity",0.9)
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
    let move_tooltip = function(event, d) { /////////////////<br>State: ${d.State}
        let tooltip_val = `<b>State:</b> ${d.state}
        <br><b>County:</b> ${d.county}
        <br><b>Number of Turbines:</b> ${d3.format(",")(d.num_turbs)}
        <br><b>${choice}:</b> ${d3.format(formatTooltipVal())(d[choice])}`
        
        let left = d3.select('#windContent').node().getBoundingClientRect().width * 0.6;

        tooltip
            // .style("left", d3.pointer(event, window)[0]+3+"px")
            // .style("top", d3.pointer(event, window)[1]+3+"px")
            // .style("top", `${d.cy}px`)
            // .style("left", `${d.cx}px`) //d.source.cx
            .style('left', left + 'px')
            .style('top', (d3.select('#windContent').offsetHeight * 0.2) + 'px') 
            //.style('top', left * 0.1 + 'px')
            .html(tooltip_val)
    }

    // Function to hide tooltip
    let hide_tooltip = function() {
        tooltip.style("opacity",0)
        // d3.select(this).style("opacity",1)
            
    }
    
    update(counties);

  function on(event, listener) {
      listeners[event] = listener;
    }
  
    return {
      update,
      on
    }
  
  function update(_data){    
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
            //.attr("class", "xLabel")
            .attr('x', widthS)
            .attr('y', heightS*0.05), //heightS-margin.bottom/2  //-margin.top/4
          update => update
            //.attr("class", "xLabel")
            .attr('x', widthS)
            .attr('y', heightS*0.07)
            .text(info[0])
              .attr("text-anchor", "end"),
          exit => exit.remove()
        )
    
      counties
        .on("mouseover", show_tooltip)
        .on("mousemove", move_tooltip)
        .on("mouseleave", hide_tooltip)
    
  }
}