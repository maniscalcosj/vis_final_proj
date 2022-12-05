/* load the 3 wind datasets */
Promise.all([ // load multiple files
	d3.csv('energy-budgets.csv', d3.autoType)
  ]).then(([energyBudgets]) => {
  // console.log("energy budgets", energyBudgets);
  
  /* initialize wind map SVG */
  const width = 600;
  const height = 400;
  const map = d3.select(".renewableSpendingLine").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0,0, width, height]);
  
  /* initialize wind scatter plot SVG */
  const scatter = d3.select(".energySpendingNode").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0,0, width, height]);
  
})