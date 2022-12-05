// import * as d3 from "https://cdn.skypack.dev/d3@7";

import windScatter from './windScatter.js'
import windMap from './windMap.js'
import turbineMap from './turbineMap.js'
// import potential from './potential.js'


//d3.csv("./acs2017_county_data.csv", d3.autoType).then(data =>{
  
    // console.log('acs2017',data)
  /* load the 3 wind datasets */
Promise.all([ // load multiple files
	// d3.csv('turbine_dist_data.csv', d3.autoType),
	d3.csv('full_dataset.csv', d3.autoType),
  d3.json('counties-albers-10m.json',d3.autoType)
  ]).then(([fullData, usMap]) => {
    //console.log("turbines", turbines);
    //console.log("full", fullData);
    //console.log("population", population); 
    //console.log("usMap", usMap);
    
    // var zero = d3.format("05d");
    fullData.forEach(d => {
      d.fips = d3.format("05d")(d.fips);
    })
    // turbines.forEach(d => {
    //   d.fips = d3.format("05d")(d.fips);
    // })
    // console.log("fullData", fullData)
  
    // Pre-process Data
    const counties = topojson.feature(usMap, usMap.objects.counties)//.features.map(c => {
    //   // attach properties of fulldata to every county
      // let prop = c.properties
      // const fc = fullData.find(x => x.fips === c.id) || null
      // console.log(fc)
      // c.foo = 10
      // prop.avg_wind_speed = fc === null ? -5 : fc.avg_wind_speed;
      // c.properties.avg_capacity_factor = fc === null ? -5 : fc.avg_capacity_factor;
      // c.properties.avg_fraction_of_usable_area = fc === null ? -5 : fc.avg_fraction_of_usable_area;
      // c.properties.population = fc === null ? -5 : fc.population
    // })
    const states = topojson.feature(usMap, usMap.objects.states);
  
    // console.log("county data", counties)
  
    // merge fullData with counties
    counties.features.forEach(c => {
      c.fips = c.id;
      const fc = fullData.find(x => x.fips === c.id) || null
      c.properties.avg_wind_speed = fc === null ? null : fc.avg_wind_speed;
      c.properties.avg_capacity_factor = fc === null ? null : fc.avg_capacity_factor;
      c.properties.avg_fraction_of_usable_area = fc === null ? null : fc.avg_fraction_of_usable_area;
      c.properties.population = fc === null ? null : fc.population
      c.properties.num_turbs = fc === null ? null : fc.num_turbs
      c.filtered = 0
    })
  
    // console.log("merged data", counties)
//     const lots_of_turbs = counties.features.filter(c => c.properties.num_turbs > 20).map(d => d.fips)
//     console.log("counties with >20 turbines", lots_of_turbs)
  
//     turbines.filter(t => lots_of_turbs.includes(t.fips))
  
//     console.log("number of turbines", turbines)
  
    // STILL TOO MANY TURBINES --> 
    // Will go through and draw ONE circle per county but size it based on the number of turbines --> aka a HEAT MAP
    
    // merge counties and fullData by fips code
    
    
    // const potentialChart = potential();
    const turbMap = turbineMap(counties, states)
    const windMapPlot = windMap(counties)
    const windScatterPlot = windScatter(fullData)
    //const choice = windMapPlot.getChoice()
    
    windScatterPlot.on("brushed", (new_domain) => {
      windMapPlot.filterByBrushed(new_domain, counties);
    })
   
})