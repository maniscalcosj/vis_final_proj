// import * as d3 from "https://cdn.skypack.dev/d3@7"

// export default function potential() {  

  // const listeners = { brushed: null}
  
Promise.all([ // load multiple files
d3.csv('ustechnicalpotential.csv', d3.autoType),
d3.json('counties-albers-10m.json', d3.autoType)
]).then(([potential, usMap]) => {
    // console.log("potential", potential)
    
    //MAP
    const idealwidth = 975;  //975  //1.5983
    const idealheight = 610; //610
    const width = d3.select('.potential').node().getBoundingClientRect().width
    // const height = d3.select('.windMap').node().getBoundingClientRect().width
    const height = width * 610/975
    // console.log("[height, width]",[height, width])
    const mapContainer = d3.select(".potential").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0,0, width, height])
      .append("g")
      .attr("transform", "scale(" + width/idealwidth + ")");
    
    const states = topojson.feature(usMap, usMap.objects.states);
    const statemesh = topojson.mesh(usMap, usMap.objects.states, (a, b) => a !== b);
    const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]); //1300
    const pathGenerator = d3.geoPath();  //.projection(projection)
    
    const statemap = mapContainer.selectAll(".state")
      //.data(usMapGeo.features)
      .data(states.features)
      .join(
        enter => enter.append("path")
          .attr("class", "state")
          .attr("id", d => `State-${d.id}`)
          .attr("d", pathGenerator)
          .style("fill", "none")
          .style("stroke", "black")
          .attr("opacity", 1)
      );
    
    //ABOVE DONE 
    
//     //CHOICE
     let choice = "Solar" 
     
     const select = document.querySelector("#energySelector");
      select.addEventListener("change", function() {
      choice = event.target.value;
      updateMap(potential)
    });
    
    let tooltipMap = d3.select(".potential").append("div")
      .attr("class","tooltip")
      .style("position","absolute")
      .style("opacity",0)
      .style("background", "#EAEDED")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("box-shadow","0 0 4px rgba(#42424E, 0.2)")
      .style("padding", "1rem")
    
    let show_tooltipMap = function() {
        tooltipMap.style("opacity",1)
        // d3.select(this).style("opacity",1)
    }
    
    function getCap(searchValue) {
      let array = potential.find(d => d.Fips == searchValue);
      //console.log("hm", array[choice])
      return array[choice];
    }
    
  
  
    let move_tooltipMap = function(event, d) { /////////////////<br>State: ${d.State}
        let tooltip_val = `<b>State:</b> ${d.properties.name}
        <br><b>${choice} Technical Potential:</b> ${Math.trunc(getCap(d.id)).toLocaleString("en-US")} GWh`
        
                
        var x = event.clientX,
          y = event.clientY;
      
      console.log("x", x);
      console.log("y", y);
      tooltipMap.style.top = (y * 0.1) + 'px';
      tooltipMap.style.left = (x * 0.1) + 'px';
      
      //tooltipMap
      // .style("left", d3.pointer(event, window)[0]+3+"px")
      // .style("top", d3.pointer(event, window)[1]+3+"px")
      // .style("top", `${d.cy}px`)
      // .style("left", `${d.cx}px`) //d.source.cx
      // .style("top", `${d.cy}px`)
      // .style("left", `${d.cx}px`) //d.source.cx
        // .style('left', (d3.select('.potential').node().getBoundingClientRect().width * 0.6) + 'px')
        // .style('top', (d3.select('.potential').offsetHeight * 0.8) + 'px') 
        //tooltipMap.html(tooltip_val)
            //.html(tooltip_val)
      tooltipMap.html(tooltip_val)
      
      // tooltipMap
        //     // .style("left", d3.pointer(event, window)[0]+3+"px")
        //     // .style("top", d3.pointer(event, window)[1]+3+"px")
        //     // .style("top", `${d.cy}px`)
        //     // .style("left", `${d.cx}px`) //d.source.cx
        //     .style("top", `${d.cy}px`)
        //     .style("left", `${d.cx}px`) //d.source.cx
        //     .html(tooltip_val)
    }
        
    let hide_tooltipMap = function() {
        tooltipMap.style("opacity",0)
        // d3.select(this).style("opacity",1)
            
    }
    
    
     //COLOR
    function updateMap(data) {
          
    function getColor() {
      let info = Array(3);
      if (choice == "Solar") {
        info[0] = "interpolateOranges";
        info[1] = 17000;
        info[2] = d3.max(potential.map(d => d[choice]));
        //console.log(info[2])
        //console.log("max", potential[choice])
      } else if (choice == "Wind") {
        info[0] = "interpolateGreys";
        info[1] = 150;
        info[2] = d3.max(potential.map(d => d[choice]));
      } else if (choice == "Biopower") {
        info[0] = "interpolateGreens";
        info[1] = 550;
        info[2] = d3.max(potential.map(d => d[choice]));
      } else if (choice == "Geothermal") {
        info[0] = "interpolateReds";
        info[1] = 11000;
        info[2] = d3.max(potential.map(d => d[choice]));
      } else {
        info[0] = "interpolateBlues";
        info[1] = 25;
        info[2] = d3.max(potential.map(d => d[choice]));
      }
      return info;
    }
      
    let info = getColor();
      //console.log("info", info)
    // Using log10 color scale
    const color = d3.scaleSequential(d3[info[0]])
      //.domain(0, 5)
      .domain([info[1], info[2]])
      .clamp(true)

    //console.log("hey")
    //console.log(data[0].Solar)
      
    // Add color
      
      data.forEach(c => {
      //console.log(c.State, "solar:", c[choice]);
        //console.log(c.State, String(c.Fips), typeof(c.Fips))
        const code = c.Fips;
        //console.log(code, typeof(code))
        
        let s;
        if (code < 10) {
          s =  `State-0${code}`    
        } else {
          s = `State-${code}`
        }
      d3.select(`#${s}`)
        //console.log()
        .attr("class", "coloredState")
        .style("fill", color(c[choice]))
        //.attr("fill", color((c[choice])) ? color((c[choice])) : "red")
    })
      
      d3.selectAll(".coloredState")
        .on("mouseover", show_tooltipMap)
        .on("mousemove", move_tooltipMap)
        .on("mouseleave", hide_tooltipMap)

    }

    updateMap(potential);
    
    
      })
// }