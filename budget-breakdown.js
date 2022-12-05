Promise.all([d3.csv("energy-budgets.csv", d3.autoType)]).then(
  ([energyBudgets, perGDP]) => {
    const listeners = { brushed: null };

    const width = d3.select(".budgetBreakdownBar").node().getBoundingClientRect().width
    const height = d3.select(".budgetBreakdownBar").node().getBoundingClientRect().width*.3
    const margin = { top: 60, right: 20, bottom: 20, left: 20 };

    const barChart = d3
      .select(".budgetBreakdownBar")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width , height + 150])
      .append("g")
      .attr(
        "transform",
        "translate(" + margin.left + "," + margin.bottom + ")"
      );

    const usaData = energyBudgets.filter(function (x) {
      return (
        x.COUNTRY == "USA" &&
        x.PRODUCT == "RDDUSDPPP" &&
        x.FLOW != "UNALLOC" &&
        x.FLOW != "MEMOLC" &&
        x.FLOW != "MEMONLC" &&
        x.FLOW != "TOTAL"
      );
    });

    const defaultData = usaData.filter(function (x) {
      return x.TIME == "1974";
    });

    const sliderYearsData = energyBudgets.filter(function (x) {
      return (
        x.COUNTRY == "USA" && x.PRODUCT == "RDDUSDPPP" && x.FLOW == "TOTAL"
      );
    });

    // const types = ["EFFICENCY", "FOSSILFUEL", "RENEWABLE", "NUCLEAR", "HGENCELL", "OTHERPANDS", "OTHERTECH"]

    const types = defaultData.map((d) => d.FLOW);

    const userFriendlyTypes = [
      "Efficiency",
      "Fossil Fuels",
      "Renewables",
      "Nuclear",
      "Hydrogen & Fuel Cells",
      "Other Power & Storage Tech",
      "Other Cross-Cutting Tech & Research",
    ];

    const c = d3
      .scaleOrdinal(d3.schemeSet2) //d3.scaleOrdinal(d3.schemeSet2)
      .domain(types);

    const data = usaData;
    var newData;

    var xScale = d3.scaleBand().range([0, width]).padding(0.4),
      yScale = d3.scaleLinear().range([height, 0]);

    var g = barChart.append("g");

    // Create legend
    const barLegend = barChart
      .append("g")
      .attr("class", "barLegend")
      .attr("x", 10)
      .attr("y", 20)
      // To move all children elements
      .attr("transform", `translate(${10},${20})`)
      .attr("height", 200)
      .attr("width", 300);

    // Legend color boxes
    barLegend
      .selectAll("rect")
      .data(types)
      .enter()
      .append("rect")
      .attr("position", "relative")
      .attr("width", 20)
      .attr("height", 20)
      .attr("x", width - 175 - 25)
      .attr("y", (_, i) => 0 + (20 + 5) * i) // Use padding of 5
      .style("margin", "5px")
      .style("stroke", "black")
      .style("fill", (d) => c(d));

    // Legend Text
    barLegend
      .selectAll("label")
      .data(userFriendlyTypes)
      .enter()
      .append("text")
      .attr("x", width - 175)
      .attr("y", (_, i) => 0 + 15 + (20 + 5) * i)
      .text((d) => `${d}`);

    xScale.domain(
      data.map(function (d) {
        return d.FLOW;
      })
    );
    yScale.domain([
      0,
      d3.max(data, function (d) {
        return d.VALUE;
      }),
    ]);

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("y", height - 250)
      .attr("x", width - 100)
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text("Sector");

    g.append("g")
      .call(
        d3
          .axisLeft(yScale)
          .tickFormat(function (d) {
            return "$" + d;
          })
          .ticks(10)
      )
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-5.1em")
      .attr("text-anchor", "end")
      .attr("stroke", "black")
      .text("Amount Allocated (in millions USD)")
        .style("font-size", "15px");
    
    g.selectAll(".bar")
      .data(defaultData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .style("fill", (d) => c(d.FLOW))
      .on("mouseover", onMouseOver)
      .on("mouseout", onMouseOut)
      .attr("x", function (d) {
        return xScale(d.FLOW);
      })
      .attr("y", function (d) {
        return yScale(d.VALUE);
      })
      .attr("width", xScale.bandwidth())
      .attr("height", function (d) {
        return height - yScale(d.VALUE);
      });

    function onMouseOver(d, i) {
      d3.select(this).attr("class", "highlight");
      d3.select(this)
        .transition() // adds animation
        .duration(400)
        .attr("width", xScale.bandwidth() + 5)
        .attr("y", function (d) {
          return yScale(d.VALUE) - 10;
        })
        .attr("height", function (d) {
          return height - yScale(d.VALUE) + 10;
        });

      g.append("text")
        .attr("class", "val")
        .attr("x", function () {
          return xScale(d.target.__data__.FLOW);
        })
        .attr("y", function () {
          return yScale(d.target.__data__.VALUE) - 15;
        })
        .text(function () {
          return ["$" + Math.trunc(d.target.__data__.VALUE) + "M"]; // Value of the text
        });
    }

    function onMouseOut(d, i) {
      d3.select(this).attr("class", "bar");
      d3.select(this)
        .transition() // adds animation
        .duration(400)
        .attr("width", xScale.bandwidth())
        .attr("y", function (d) {
          return yScale(d.VALUE);
        })
        .attr("height", function (d) {
          return height - yScale(d.VALUE);
        });

      d3.selectAll(".val").remove();
    }

    /* ------------------------------ SLIDING TIMELINE ------------------------------ */

    var formatDateIntoYear = d3.timeFormat("%Y");

    function toDate(d) {
      d = new Date(d);
      return d;
    }

    var startYear = new Date("1974"),
      endYear = new Date("2015");

    var widthTL = width - margin.left - margin.right,
      heightTL = 200 - margin.top - margin.bottom;

    ////////// slider //////////

    var svgSlider = d3
      .select(".timeline")
      .append("svg")
      .attr("width", widthTL + margin.left + margin.right + 10)
      .attr("height", heightTL);

    var x = d3
      .scaleTime()
      .domain([startYear, endYear])
      .range([0, widthTL])
      .clamp(true);

    var slider = svgSlider
      .append("g")
      .attr("class", "timeline")
      .attr("transform", "translate(" + margin.left + "," + heightTL / 2 + ")");

    slider
      .append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
      .select(function () {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "track-inset")
      .select(function () {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "track-overlay")
      .call(
        d3
          .drag()
          .on("start.interrupt", function () {
            slider.interrupt();
          })
          .on("start drag", function (d) {
            update(x.invert(d.x), data);
          })
      );

    slider
      .insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
      .data(x.ticks(49))
      .enter()
      .append("text")
      .attr("x", x)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text(function (d) {
        return formatDateIntoYear(d);
      });
    var handle = slider
      .insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

    var label = slider
      .append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .text("1974")
      .attr("transform", "translate(0," + -25 + ")");

    function update(h) {
      if (h == undefined) {
        newData = usaData.filter(function (x) {
          return x.TIME == "1974";
        });
      } else if (formatDateIntoYear(toDate(h)) == "1973") {
        h = new Date(
          "Wed Feb 20 1974 14:18:18 GMT-0400 (Eastern Daylight Time"
        );
      }
      handle.attr("cx", x(h));
      label.attr("x", x(h)).text(formatDateIntoYear(h));

      newData = usaData.filter(function (x) {
        return x.TIME == formatDateIntoYear(toDate(h));
      });

      genBars(newData);
    }

    function genBars(dta) {
      if (dta == undefined) {
        dta = usaData.filter(function (x) {
          return x.TIME == "1974";
        });
      }
      g.selectAll(".bar")
        .data(dta)
        .join(
          (enter) =>
            enter
              .append("rect")
              .attr("class", "bar")
              .attr("x", function (d) {
                return xScale(d.FLOW);
              })
              .attr("width", xScale.bandwidth())
              .attr("height", function (d) {
                return height - yScale(d.VALUE);
              }),
          (update) =>
            update
              .attr("height", function (d) {
                return height - yScale(d.VALUE);
              })
              .attr("y", function (d) {
                return yScale(d.VALUE);
              }),
          (exit) => exit.remove()
        )
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut);
    }
  }
);
