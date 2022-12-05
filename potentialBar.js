// import * as d3 from "https://cdn.skypack.dev/d3@7"


Promise.all([ // load multiple files
d3.csv('ustechnicalpotential.csv', d3.autoType),
]).then(([potential]) => {
  
  const margin = {top: 20, right: 10, bottom: 20, left: 50}
    // const widthS = 600 - margin.left - margin.right //960
    // const heightS = 300 - margin.left - margin.right //500
    const widthS = d3.select('.windScatter').node().getBoundingClientRect().width- margin.left - margin.right
    const heightS = widthS * 0.8 - margin.left - margin.right

    const small = d3.select(".barSmall").append("svg")
            .attr("width", widthS + margin.left + margin.right)
            .attr("height", heightS + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
    const medium = d3.select(".barMed").append("svg")
            .attr("width", widthS + margin.left + margin.right)
            .attr("height", heightS + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
    // X axis
  var x = d3.scaleBand()
    .range([ 0, widthS ])
    .domain(potential.map(function(d) {console.log(d[0]); return d[0]; }))
    .padding(0.2);
  
  
  
  
  
  
})