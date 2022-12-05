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

export default function turbineMap(counties, states) {
  
    /* initialize wind map SVG */
    const idealwidth = 975;  //975  //1.5983
    const idealheight = 610; //610
    const width = d3.select('.turbine-map').node().getBoundingClientRect().width
    // const height = d3.select('.turbine-map').node().getBoundingClientRect().width
    const height = width * 610/975
    // console.log("[height, width]",[height, width])
    const mapContainer = d3.select(".turbine-map").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0,0, width, height])
      .append("g")
      .attr("transform", "scale(" + width/idealwidth + ")");
      
    const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]); //1300
    const pathGenerator = d3.geoPath();  //.projection(projection);
    
    let size = d3.scaleLinear()
      .range([0, 50])
      .domain([0, d3.max(counties.features.map(d => d.properties.num_turbs))])
 
    
    // Add counties but HIDE THEM
    mapContainer.selectAll(".county")
      .data(counties.features, d=>d.fips)
      .join(
        enter => enter.append("path")
          .attr("class", "county")
          .attr("id", c => `id-${c.fips}`)
          .attr("d", pathGenerator)
          // .attr("fill", "none")
          // .style("stroke", "grey")
          .attr("opacity", 0)
          // .style("display", "none")
      );
  
    // Add State lines
    mapContainer.selectAll(".state")
      .data(states.features)
      .join(
        enter => enter.append("path")
          .attr("class", "state")
          .attr("d", pathGenerator)
          .attr("fill", "none")
          .style("stroke", "grey")
          .attr("opacity", 1)
      );
  
    function getCentroid(element) {
      const bbox = element.getBBox();
      return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
    }
  
    counties.features.forEach(c => {
      c.centroid = getCentroid(d3.select(`#id-${c.fips}.county`).node())
    })
  
    // console.log('counties with centroid', counties.features)
  
    // Add turbine circles 
    mapContainer.selectAll(".turbine")
      .data(counties.features, d=>d.fips)
      .join(
        enter => enter.append("circle")
          .attr("class", "turbine")
          .attr("cx", c => c.centroid[0])
          .attr("cy",c => c.centroid[1])
          .attr("r", c => size(c.properties.num_turbs))
          .attr("fill", "red")
          .style("stroke", "red")
          .attr("opacity", 0.5)
      );
  
//     //const label_node = mapContainer.nodes.find(d => d.properties.county === "Kern")
//     const label_node = d3.select(".turbine").nodes.find(d => d.properties.county === "Kern");
//     const annotations = [
//         {
//             note: {
//                 title: "Kern County, California - 3,466 turbines"
//             },
//             type: d3.annotationCallout,
//             // subject: {
//             //   radius: (label_node.y1 - label_node.y0)/2+5,         // circle radius
//             //   // radiusPadding: 20   // white space around circle before connector
//             // },
//             x: label_node.x1-(label_node.x1-label_node.x0)/2,
//             y: label_node.y0+(label_node.y1 - label_node.y0)/2,
//             dy: -30,
//             dx: 20
//         }
//       ]
      
//       // Add annotation to the chart
//       const makeAnnotations = d3.annotation()
//         .annotations(annotations)
//       mapContainer
//         .append("g")
//         .attr("class", "annotation")
//         .call(makeAnnotations)
    
}