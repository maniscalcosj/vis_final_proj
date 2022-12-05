// import * as d3 from "https://cdn.skypack.dev/d3@7"

// TO DO
    // Save filtered data as json for fast execution

let duration = 5000
const move_rectangle1 = async () => {
    d3.select("#box-label1")
      .transition(duration)
      .attr("opacity", 0)
    Promise.all([
        d3.select("#paired-transition-emiss")
            .transition()
            .duration(duration)
            .ease(d3.easeQuadInOut)
            .attr("x", d3.select('.emiss-chart').node().getBoundingClientRect().width+100)
            .end()
    ])
    // d3.select("#paired-transition-emiss").attr("display","none")
    // .attr("display", "none")
}

const move_rectangle2 = async () => {
    d3.select("#box-label2")
      .transition(duration)
      .attr("opacity", 0)
    Promise.all([
        d3.select("#paired-transition-prod")
            .transition()
            .duration(duration)
            .ease(d3.easeQuadInOut)
            .attr("x", d3.select('.renew-annual-chart').node().getBoundingClientRect().width+100)
            .end()
    ])
    // d3.select("#paired-transition-prod").attr("display","none")
    // .attr("display", "none")
}
// let data 
d3.text("ilan-data/EMISS.txt").then(text => {
    // console.log("EMISSIONS DATA")
    let txt = text.split("\n");
    // console.log('txt', txt[1])
    // txt.shift()
    const data1 = txt.map(line => {
        try {
            return JSON.parse(line)
        } 
        catch(err){
            return null
        }
    })
    // Remove nulls
    const data2 = data1.filter(d => d !== null)
    const coal = data2.filter(obj => data2.filter(d => d.category_id == "2251617")[0].childseries.includes(obj.series_id)).map(d => d.data)
    const ng = data2.filter(obj => data2.filter(d => d.category_id == "2251629")[0].childseries.includes(obj.series_id)).map(d => d.data)
    const pe = data2.filter(obj => data2.filter(d => d.category_id == "2251662")[0].childseries.includes(obj.series_id)).map(d => d.data)
    const to = data2.filter(obj => data2.filter(d => d.category_id == "2251669")[0].childseries.includes(obj.series_id)).map(d => d.data)
    // console.log("coal", coal)
    // Reduces an array of arrays
    function getMeans(h_arr) {
        // Flatten array to get array of [year, val]
        const flat_arr = h_arr.flat()
        const keys = h_arr[0].map(d => d[0])
        const r_arr = []
        for (let i = 0, len = keys.length; i < len; i++) {
            r_arr.push([
                keys[i], d3.mean(flat_arr.filter(d => d[0]===keys[i]), arr => arr[1])
            ])
        }
        return r_arr
    }
    // console.log("getMeans(coal)", getMeans(coal))
    const data = [
        {
            name:"Coal",
            data : getMeans(coal)
        },
        {
            name:"Natural Gas",
            data : getMeans(ng)
        },
        {
            name: "Petroleum",
            data : getMeans(pe)
        },
        {
            name: "Total",
            data : getMeans(to)
        }
    ]

    // console.log("data", data)

    const margin = {top: 20, right: 20, bottom: 20, left: 50}
    const width = d3.select('.emiss-chart').node().getBoundingClientRect().width - margin.left - margin.right
    const height = d3.select('.emiss-chart').node().getBoundingClientRect().width*.6 - margin.top - margin.bottom

    const svg = d3.select('.emiss-chart').append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            // .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            // .attr("style", "outline: thin solid red;")
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // console.log("data values", data.map(d => d.data.map(d => d[1])))
    // Create axes
    const years = data[0].data.map(d => d[0]).reverse()
    const names = data.map(d => d.name)
    // console.log("years", years)

    const x = d3.scalePoint()
        .domain(years)
        .range([0, width])

    const y = d3.scaleLinear()
        .domain(d3.extent(data.map(d => d.data.map(d => d[1])).flat()))
        .range([height, 0])
        .nice()

    const c = d3.scaleOrdinal(d3.schemeSet2)
        .domain(names)


    // update axes and axis title
    const xAx = d3.axisBottom(x)
        // .tickFormat(d3.format(",.2r"))
        .tickValues(["1970", "1975", "1980","1985", "1990", "1995", "2000", "2005", "2010", "2015", "2020"])
    const yAx = d3.axisLeft(y)
        .tickFormat(d3.format(".3r"))

    // Create axis containers
    const yGroup = svg.append("g")
            .attr("class","y-axis")
            .call(yAx)

    const xGroup = svg.append("g")
            .attr("class","x-axis")
            .attr("transform",`translate(0, ${height})`)
            .call(xAx)

    // Edit axes appearance
    yGroup
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1)
            )
    xGroup
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", - height)
            .attr("stroke-opacity", 0.1)
            )

    // X-axis title
    svg.append("text")
		  .attr('x', width)
		  .attr('y', height-margin.bottom/2)
		  .text("Year")
          .attr("text-anchor","end")
          .style("font-weight","bold")

    // Y-axis title
    svg.append("a")
            .attr("xlink:href", "https://climate.mit.edu/ask-mit/how-much-ton-carbon-dioxide")
            .attr("target","blank")
        .append("text")
		  .attr('x', 10)
		  .attr('y', 5)
		  .text("Million Metric Tons CO2")
          .style("font-weight","bold")
          .style("fill", "blue")
          .style("text-decoration", "underline")

    // Line path generator
    const line = d3.line()
        .curve(d3.curveNatural)
        .x(d => x(d[0]))
        .y(d => y(d[1]))

    // Create legend
    const legend = svg.append("g")
      .attr("class","legend")
      .attr("x", 10)
      .attr("y", 20)
      // To move all children elements
      .attr("transform", `translate(${10},${20})`)
      .attr("height", 200)
      .attr("width", 200)
    
    // Legend color boxes
    legend.selectAll("rect")
      .data(names)
      .enter()
      .append("rect")
        .attr("position","relative")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 0)
        .attr("y", (_, i) => 0+(20+5) * i) // Use padding of 5
        .style("margin", "5px")
        .style("stroke","black")
        .style("fill", d => c(d))
  
    // Legend Text
    legend.selectAll("label")
        .data(names)
        .enter()
        .append("text")
            .attr("x", 20+5)
            .attr("y", (_, i) => 0+15+(20+5) * i)
            .text(d => `${d}`)
    // Legend title
    // legend.selectAll("title")
    //   .data([0])
    //   .enter()
    //   .append("text")
    //     .attr("x",0)
    //     .attr("y",0)
    //     .text("Emissions")
    

    data.forEach(d => {
        // Reverse data so oldest years get drawn first
        const name = d.name
        const id = d.series_id

        // Create path
        const path = svg.append("path")
            .attr("class", `${id}-line`) 
            .datum(d.data.reverse())
            .style("stroke", c(name))
            .style("fill", "none")
            .attr("d", line)
            .style("stroke-width", "2") 
            
        const l = length(line(d.data.reverse()))

        // console.log("l", l)
        // console.log("animate-selection", d3.select(`.${d.series_id}-line`))

        path
            .interrupt()
            .attr("stroke-dasharray", `0,${l}`)
        .transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .attr("stroke-dasharray", `${l},${l}`)

        // Create Points
        // svg.selectAll(`.${name}-point`)
        // .data(d.data.reverse())
        // .join(
        //     enter => enter.append("circle")
        //         .attr("class", `${name}-point`)
        //         .attr("cx", d => x(d[0]))
        //         .attr("cy", d => y(d[1]))
        //         .attr("r", 5)
        //         .attr("fill", c(name))
        //         // .attr("stroke", "black")
        //         .attr("opacity", d => d[1] == 'NA' ? 0 : 1)
        //     )
        // Add to legend
    })
    // console.log('2005',x("2005"))
    // Add line denoting 2005
    svg.append("line")
        .attr("x1", x("2005"))
        .attr("y1", 0)
        .attr("x2", x("2005"))
        .attr("y2", height)
        .style("stroke-dasharray", 5)
        .style("stroke", "black")

    // Create rectangle to cover the decrease (2005-end)
    const highlight = svg.append("g")
        .append("rect")
          .attr("id", "paired-transition-emiss")
          .attr("x", x("2005"))
          .attr("y", 0)
          .attr("width", width-x("2005")+margin.right)
          .attr("height", height)
          .attr("fill", "white")
          .attr("stroke", "black")
        
        
    svg.append("g")
      .append("text")
          .attr("id", "box-label1")
          .attr("x", x("2005") + (width-x("2005")+margin.right)/2)
          .attr("y", height/2)
          .attr("opacity",1)
          .attr("text-anchor", "middle")
          .text("Click to see")
      

    highlight.on("click", move_rectangle1)
  
    const annotations = [
        {
            note: {
                label: "1973-1974",
                title: "US Oil Crisis"
            },
            type: d3.annotationCalloutCircle,
            subject: {
            radius: 30,         // circle radius
            // radiusPadding: 20   // white space around circle before connector
            },
            x: x("1974"),
            y: y(90),
            dy: -60,
            dx: 80
        }
      ]
      
      // Add annotation to the chart
      const makeAnnotations = d3.annotation()
        .annotations(annotations)
      svg
        .append("g")
        .call(makeAnnotations)


    // Measure the length of the given SVG path string.
    function length(path) {
        return d3.create("svg:path").attr("d", path).node().getTotalLength();
    }
})

d3.text("ilan-data/TOTAL.txt").then(text => {
    // console.log("TOTAL ENERGY DATA")
    // if (error) throw error;
    // split on new line
    let txt = text.split("\n");
    // console.log('txt', txt[1])
    // txt.shift()
    const data1 = txt.map(line => {
        try {
            return JSON.parse(line)
        } 
        catch(err){
            return null
        }
    })
    // Remove nulls
    data1.filter(d => d !== null)
    

    // Renewable energy
    const renewables = data1.filter(d => d.name === "Renewable Energy Production and Consumption by Source")[0]

    const data = data1.filter(d => renewables.childseries.includes(d.series_id))
        .filter(d => d.series_id.endsWith("A")) // Take only annual data
        .filter(d => d.name.includes("Production")) // Take only production data
        // Get rid of items with [year, 'NA']
        .map(obj => {
            const filtered = {
                name : obj.name,
                data : obj.data.filter(d => d[1] !== 'NA')
            }
            return filtered
        })

    const margin = {top: 20, right: 20, bottom: 20, left: 50}
    const width = d3.select('.emiss-chart').node().getBoundingClientRect().width - margin.left - margin.right
    const height = d3.select('.emiss-chart').node().getBoundingClientRect().width*.6 - margin.top - margin.bottom

    const svg = d3.select('.renew-annual-chart').append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            // .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            // .attr("style", "outline: thin solid red;")
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // console.log("data values", data.map(d => d.data.map(d => d[1])))
    // Create axes
    const years = data[0].data.map(d => d[0]).reverse()
    const names = data.map(d => d.name)
    // console.log("years", years)

    const x = d3.scalePoint()
        .domain(years)
        .range([0, width])

    const y = d3.scaleLinear()
        .domain(d3.extent(data.map(d => d.data.map(d => d[1])).flat()))
        .range([height, 0])
        .nice()
        .clamp(true)

    const c = d3.scaleOrdinal(["#f542dd", "#267022", "#31de28", "#8B4513", "#ffff00", "#ba2a0d", "#0db4ba","#0000ff"]) //d3.scaleOrdinal(d3.schemeSet2)
        .domain(names)

    // update axes and axis title
    const xAx = d3.axisBottom(x)
        // .tickFormat(d3.format(",.2r"))
        .tickValues(["1950", "1955", "1960", "1965", "1970", "1975", "1980","1985", "1990", "1995", "2000", "2005", "2010", "2015", "2020"])
    const yAx = d3.axisLeft(y)
        .tickFormat(d3.format(".3r"))

    // Create axis containers
    const yGroup = svg.append("g")
            .attr("class","y-axis")
            .call(yAx)

    const xGroup = svg.append("g")
            .attr("class","x-axis")
            .attr("transform",`translate(0, ${height})`)
            .call(xAx)

    // Edit axes appearance
    yGroup
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1)
            )
    xGroup
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", - height)
            .attr("stroke-opacity", 0.1)
            )

    // X-axis title
    svg.append("text")
		  .attr('x', width)
		  .attr('y', height-margin.bottom/2)
		  .text("Year")
          .attr("text-anchor","end")
          .style("font-weight","bold")

    // Y-axis title
    svg.append("a")
            .attr("xlink:href", "https://www.wikiwand.com/en/British_thermal_unit")
            .attr("target","blank")
        .append("text")
		  .attr('x', 10)
		  .attr('y', 5)
		  .text("Trillion BTU")
          .style("font-weight","bold")
          .style("fill", "blue")
          .style("text-decoration", "underline")

    // Line path generator
    const line = d3.line()
        .curve(d3.curveNatural)
        .x(d => x(d[0]))
        .y(d => y(d[1]))

    // Create legend
    const legend = svg.append("g")
      .attr("class","legend")
      .attr("x", 10)
      .attr("y", 20)
      // To move all children elements
      .attr("transform", `translate(${10},${20})`)
      .attr("height", 200)
      .attr("width", 200)
    
    // Legend color boxes
    legend.selectAll("rect")
      .data(names)
      .enter()
      .append("rect")
        .attr("position","relative")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", 0)
        .attr("y", (_, i) => 0+(20+5) * i) // Use padding of 5
        .style("margin", "5px")
        .style("stroke","black")
        .style("fill", d => c(d))
  
    // Legend Text
    legend.selectAll("label")
        .data(names)
        .enter()
        .append("text")
            .attr("x", 20+5)
            .attr("y", (_, i) => 0+15+(20+5) * i)
            .text(d => `${d}`)
    // Legend title
    // legend.selectAll("title")
    //   .data([0])
    //   .enter()
    //   .append("text")
    //     .attr("x",0)
    //     .attr("y",0)
    //     .text("Emissions")
    
    data.forEach(d => {
        // Reverse data so oldest years get drawn first
        const name = d.name
        const id = d.series_id

        // Create path
        const path = svg.append("path")
            .attr("class", `${id}-line`) 
            .datum(d.data.reverse())
            .style("stroke", c(name))
            .style("fill", "none")
            .attr("d", line)
            .style("stroke-width", "2") 
            
        const l = length(line(d.data.reverse()))

        // console.log("l", l)
        // console.log("animate-selection", d3.select(`.${d.series_id}-line`))

        path
            .interrupt()
            .attr("stroke-dasharray", `0,${l}`)
        .transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .attr("stroke-dasharray", `${l},${l}`)

        // Create Points
        // svg.selectAll(`.${name}-point`)
        // .data(d.data.reverse())
        // .join(
        //     enter => enter.append("circle")
        //         .attr("class", `${name}-point`)
        //         .attr("cx", d => x(d[0]))
        //         .attr("cy", d => y(d[1]))
        //         .attr("r", 5)
        //         .attr("fill", c(name))
        //         // .attr("stroke", "black")
        //         .attr("opacity", d => d[1] == 'NA' ? 0 : 1)
        //     )
    })
    // Line for 2005
    svg.append("line")
        .attr("x1", x("2005"))
        .attr("y1", 0)
        .attr("x2", x("2005"))
        .attr("y2", height)
        .style("stroke-dasharray", 5)
        .style("stroke", "black")

    // Create rectangle to cover the decrease (2005-end)
    const highlight = svg.append("g")
        .append("rect")
        .attr("id","paired-transition-prod")
        .attr("x", x("2005"))
        .attr("y", 0)
        .attr("width", width-x("2005")+margin.right)
        .attr("height", height)
        .attr("fill", "white")
        .attr("stroke", "black")
    
    highlight.on("click", move_rectangle2)
  
    svg.append("g")
      .append("text")
          .attr("id", "box-label2")
          .attr("x", x("2005") + (width-x("2005")+margin.right)/2)
          .attr("y", height/2)
          .attr("opacity",1)
          .attr("text-anchor", "middle")
          .text("Click to see")
    
    const annotations = [
        {
            note: {
                title: "Energy Policy Act of 2005"
            },
            // type: d3.annotationCalloutCircle,
            // subject: {
            // radius: 30,         // circle radius
            // // radiusPadding: 20   // white space around circle before connector
            // },
            x: x("2005"),
            y: y(11000),
            dy: 10,
            dx: -20
        }
      ]
      
      // Add annotation to the chart
      const makeAnnotations = d3.annotation()
        .annotations(annotations)
      svg
        .append("g")
        .call(makeAnnotations)
    // // Measure the length of the given SVG path string.
    function length(path) {
        return d3.create("svg:path").attr("d", path).node().getTotalLength();
    }
})
