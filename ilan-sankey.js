// Sankey diagram sources
    // http://energyliteracy.com/
    // https://www.otherlab.com/blog-posts/us-energy-flow-super-sankey
    // https://flowcharts.llnl.gov/
Promise.all([
    d3.csv("ilan-data/sankey_nodes.csv", d3.autoType),
    d3.csv("ilan-data/sankey_links.csv", d3.autoType)
]).then(data => {
    const nodes = data[0]
    const links = data[1]
    // Print data
    // console.log("nodes", nodes)
    // console.log("links", links)

    // const width = 10000
    // const height = 8000
    const margin = {top: 30, right: 50, bottom: 0, left: 50}
    const width = d3.select('.energy-sankey').node().getBoundingClientRect().width - margin.left - margin.right
    const height = d3.select('.energy-sankey').node().getBoundingClientRect().width*.6 - margin.top - margin.bottom
    // const width = 5000 - margin.left - margin.right
    // const height = 4000 - margin.top - margin.bottom
    const fontsize = 12

    const svg = d3.select('.energy-sankey').append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;")

    // const tooltip = svg
    //   .append('div')
    //   .attr('id', 'tooltip');
    // Create SVG
    // const margin = {top: 30, right: 50, bottom: 30, left: 50}
    // const width = 8000 - margin.left - margin.right
    // const height = 6000 - margin.top - margin.bottom

    // const svg = d3.select(".energy-sankey").append("svg")
    //         .attr("width", width + margin.left + margin.right)
    //         .attr("height", height + margin.top + margin.bottom)
    //     .append("g")
    //         .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        
    // Set the sankey diagram properties
    const sankey = d3.sankey()
        .nodeWidth(10)
        .nodePadding(5)
        .nodeAlign(d3.sankeyCenter)
        .nodeId(d => d.name)
        .size([width, height])
        // .links(d => d.link)

    // const path = sankey.links();

    // sankey
    //   .nodes(graph.nodes)
    //   .links(graph.links)
    //   .layout(32)
    const sankeydata = {
        nodes : nodes.map(d => {
            return {
                name : d.name,
                id : d.id
            }
        }),
        links : links.map(d => {
            return {
                source : d.source_name, // must match with node field
                target : d.target_name,
                value : d.value,
                reference : d.reference
            }
        })
    }
    // console.log("source node", sankeydata.nodes.filter(d => d.name == "energy services"))
    // console.log("links to source node", sankeydata.links.filter(d => d.name === "5-19 miles"))
    // console.log("sankeydata", sankeydata)
    // For d3 v7
    //https://bl.ocks.org/d3noob/31665aced416f27abca4fa46f5f4b568
    const graph = sankey(sankeydata)
    // console.log("graph", graph)
    // console.log("investigating graph", sankeydata.nodes.filter(d => d.name === "automobiles (passthrough1)"))

    // const G = graph.nodes.map(d => d.name)
    const color = d3.scaleOrdinal(["#000000","#1a1530","#163d4e","#1f6642","#54792f","#a07949","#d07e93","#cf9cda","#c1caf3","#d2eeef","#ffffff"])
        .domain([...new Set(graph.nodes.map(d => d.depth))])
    // console.log("G",G)

    // Create zoom
    // https://codepen.io/borntofrappe/pen/KrBypK

    // ZOOM feature
    // include a rectangle spanning the entire container, as to allow a translation on the wrapping group
    // svg
    //   .append('rect')
    //   .attr('x', 0)
    //   .attr('y', 0)
    //   .attr('width', width)
    //   .attr('height', height)
    //   .attr('fill', 'transparent');

    // // detail the zoom function and attach it to the group container
    // function zoomFunction({ transform }) {
    //   const { x, y, k } = transform;
    //   svg.attr('transform', `translate(${x} ${y}) scale(${k})`);
    // }
    // const zoom = d3
    //   .zoom()
    //   .scaleExtent([.2, 5])
    //   .on('zoom', zoomFunction);

    // svg
    //   .call(zoom);

    
    
    const link = svg.append("g")
      .attr("fill", "none")
      //   .attr("stroke-opacity", 1)
      .selectAll("g")
      .data(graph.links)
      .join("g")
        .style("mix-blend-mode", "multiply")

    link
      .append("a")
        .attr("xlink:href", d => d.reference)
        .attr("target","blank")
      .append("path")
        .attr("class", "link")
        .attr("id", d => `link-${d.index}`)
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", "gray")
        .attr("stroke-width", d => Math.max(1, d.width))
        // .attr("opacity", d => d.reference ? 1 : 0.5)
        .attr("opacity", 0.5)

    let tooltip = d3.select(".energy-sankey").append("div")
      .attr("class","tooltip")
      .style("position","fixed")
      .style("opacity", 0)
      .style("background", "white")
      .style("box-shadow","0 0 4px rgba(#42424E, 0.2)")
      .style("padding", "1rem")
      .style("border", "1px solid #000000")
      // .style("transition", "all 0.1s ease-out")

    let show_tooltip = function() {
      tooltip.style("opacity", 1)
      // d3.select(this).style("opacity",1)
    }

    // Function to set relative tooltip positioning
    let move_tooltip = function(event, d) {
      // console.log(d)
        let tooltip_val = `<strong class="s-black">${d.source.name}</strong> → <strong class="s-black">${d.target.name}</strong>
        <br>Value: <strong class="s-black">${d3.format(".4")(d.value)}</strong> quads`

        tooltip
            // .style("left", d3.pointer(event, window)[0]+5+"px")
            // .style("top", d3.pointer(event, window)[1]+5+"px")
            // .style("top", `${d.y0}px`)
            // .style("left", `${d.source.x0}px`)
            // Fix tooltip position
            .style("top", 30+"px")
            .style("left", 30+"px")
            // NEED TO ADD INFO AND FORMAT NUMBERS
            .html(tooltip_val)
    }

    // Function to hide tooltip
    let hide_tooltip = function() {
        tooltip.style("opacity", 0)
        // d3.select(this).style("opacity",0.75)
            
    }

    // Create tooltip interactivity
    link
        .on("mouseover", show_tooltip)
        .on("mousemove", move_tooltip)
        .on("mouseleave", hide_tooltip)

    // add in the nodes
    const node = svg.append("g")

    node.selectAll(".node")
        .data(graph.nodes)
        // add the rectangles for the nodes
        .enter()
        .append("g")
            .attr("class", "node")
            .attr("transform", function(d) { 
                return "translate(" + d.x0 + "," + d.y0 + ")"; })
        .append("rect")
        // .attr("height", d => d.height)
            .attr("id", d => `rect-${d.index}`)
            .attr("height", d => d.y1-d.y0)
            .attr("width", d =>  d.x1-d.x0)
            .attr("data-clicked","0")
            .style("fill", d => color(d.depth))
            .style("stroke", "black")
        .on("click", highlight_node_links)
    
    let nodeLabelPadding = 5
    // node labels
    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", fontsize)
        .attr("class", "label")
        .selectAll("text")
        .data(graph.nodes.filter(d => d.value > 1))
        .join("text")
          .attr("id",d => `text-${d.index}`)
          .attr("x", d => d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding)
          .attr("y", d => (d.y1 + d.y0) / 2)
          .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
          .attr("dy", "0.35em")
          .text(d => d.name)
    
          // .style("font-weight", "bold")
    // label.selectAll(".text1")
    //     .data(graph.nodes.filter(d => d.value > 1))
    //     .join("text")
    //       .attr("class", "text1")
    //       .attr("id",d => `text-${d.index}1`)
    //       .attr("x", d => d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding)
    //       .attr("y", d => (d.y1 + d.y0) / 2)
    //       .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    //       .attr("dy", "0.35em")
    //       .text(d => d.name.substring(0,15))
    //       .style("font-weight", "bold")
    // label.selectAll(".text2")
    //     .data(graph.nodes.filter(d => d.value > 1))
    //     .join("text")
    //       .attr("class", "text2")
    //       .attr("id",d => `text-${d.index}2`)
    //       .attr("x", d => d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding)
    //       .attr("y", d => (d.y1 + d.y0) / 2)
    //       .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
    //       .attr("dy", "1.35em")
    //       .text(d => d.name.substring(15))
    //       .style("font-weight", "bold")
  
    
    // svg.select(".small-label")
    // .on("mouseover",(event, d) => d3.select(d).attr("display","block"))
    // .on("mouseleave",(event, d) => d3.select(d).attr("display","none"))
  
    // svg.append("g")
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", fontsize*2)
    //   .selectAll("text")
    //   .data([0])
    //   .join("text")
    //     .attr("x", width-10)
    //     .attr("y", 50)
    //     // .attr("dy", "0.35em")
    //     .attr("text-anchor", "end")
    //     // .attr("display", d => d.value > 1 ? "block" : "none")
    //     // .attr("class", d => d.value > 1 ? "big-label" : "small-label")
    //     .text("→ Energy Flow →")
  
    const label_node = graph.nodes.find(d => d.name === "energy materials in products")
    const annotations = [
        {
            note: {
                title: "Click a node to see where the energy came from"
            },
            type: d3.annotationCallout,
            // subject: {
            //   radius: (label_node.y1 - label_node.y0)/2+5,         // circle radius
            //   // radiusPadding: 20   // white space around circle before connector
            // },
            x: label_node.x1-(label_node.x1-label_node.x0)/2,
            y: label_node.y0+(label_node.y1 - label_node.y0)/2,
            dy: -30,
            dx: 20
        }
      ]
      
      // Add annotation to the chart
      const makeAnnotations = d3.annotation()
        .annotations(annotations)
      svg
        .append("g")
        .attr("class", "annotation")
        .call(makeAnnotations)

      function highlight_node_links(_, node) {
        svg.select(".annotation").remove()
        let remainingNodes = [],
            nextNodes = [];
        if (d3.select(this).attr("data-clicked") == "1") {
            d3.select(this).attr("data-clicked", "0");
            // svg.selectAll("path").style("opacity",d => d.reference ? 1 : 0.5); // back to default
            svg.selectAll("path").style("opacity", 0.5)
            svg.selectAll("rect").style("opacity", 1);
            svg.selectAll("text")
                .style("opacity", 1)
                .style("font-size", fontsize)
                .style("font-weight", "normal");
            return;
        } else {
            d3.select(this).attr("data-clicked", "1");
            svg.selectAll("path").style("opacity", 0.1);
            svg.selectAll("rect").style("opacity", 0.1);
            svg.selectAll("text").style("opacity", 0.1);
            d3.select(this)
                // .select("rect")
                .style("opacity", 1);
            const index = d3.select(this).attr("id").replace("rect", "text")
            d3.select(`#${index}`)
                .style("opacity",1)
                .style("font-size", fontsize*1.2)
                .style("font-weight", "bold")
          // d3.select(this)
          //   .select("text")
          //   .style("opacity", 1)
          //   .style("font-size", 16)
          //   .style("font-weight", "bold");
        }
      
        let traverse = [
          {
            linkType: "sourceLinks",
            nodeType: "target"
          },
          {
            linkType: "targetLinks",
            nodeType: "source"
          }
        ];
      
        traverse.forEach(function(step) {
          node[step.linkType].forEach(function(link) {
            remainingNodes.push(link[step.nodeType]);
            d3.select("#link-" + link.index).style("opacity", 1);
          });
      
          while (remainingNodes.length) {
            nextNodes = [];
            remainingNodes.forEach(function(node) {
              node[step.linkType].forEach(function(link) {
                nextNodes.push(link[step.nodeType]);
                d3.select("#link-" + link.index).style("opacity", 1);
              });
              d3.select("#rect-" + node.index).style("opacity", 1);
              d3.select("#text-" + node.index).style("opacity", 1);
            });
            remainingNodes = nextNodes;
          }
        });
      }
})