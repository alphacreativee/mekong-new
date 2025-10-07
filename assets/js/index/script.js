import { preloadImages } from "../../libs/utils.js";
("use strict");
$ = jQuery;
// setup lenis
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
// end lenis
function donut() {
  // Get seedData from HTML elements
  var seedData = [];
  var dbcontents = document.querySelectorAll(".dbcontent");

  dbcontents.forEach(function (element, index) {
    var className = element.className.match(/dbcontent--(\d+)/)[1];
    var panelTitle = element.querySelector(".panel-title");
    var label = panelTitle
      ? panelTitle.textContent.trim()
      : "Label " + (index + 1);
    var value = parseInt(element.getAttribute("data-value")) || 10;

    seedData.push({
      label: label,
      value: value,
      link: "#",
      content: className,
    });
  });

  var width = 330,
    height = 330,
    radius = Math.min(width, height) / 2;

  var currentIndex = 0; // Track current active index

  var arc = d3.svg
    .arc()
    .innerRadius(radius - 60)
    .outerRadius(radius - 10);

  var pie = d3.layout
    .pie()
    .value(function (d) {
      return d.value;
    })
    .sort(null);

  var svg = d3
    .select("#donut-chart")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

  var g = svg
    .selectAll(".arc")
    .data(pie(seedData))
    .enter()
    .append("g")
    .attr("class", function (d, i) {
      return i === 0 ? "arc active" : "arc";
    })
    .each(function (d, i) {
      d.index = i; // Store the index in the data
    })
    .on("click", function (d, i) {
      currentIndex = d.index;
      activateArc(d.index);
    })
    .on("mouseover", function (d) {
      if (!d3.select(this).classed("active")) {
        d3.select(this).select("path").attr("fill", "#b71c1c");
        d3.select(this).select("textPath").attr("fill", "#fff");
      }
    })
    .on("mouseout", function (d) {
      if (!d3.select(this).classed("active")) {
        d3.select(this).select("path").attr("fill", "#fff");
        d3.select(this).select("textPath").attr("fill", "#000");
      }
    });

  // Function to activate a specific arc by index
  function activateArc(index) {
    currentIndex = index; // Update currentIndex
    var showContent = seedData[index].content;

    // Remove active class from all .dbcontent elements
    d3.selectAll(".dbcontent").classed("active", false);

    // Add active class to the corresponding .dbcontent
    d3.select(".dbcontent--" + showContent).classed("active", true);

    // Remove active class from all arcs
    g.classed("active", false);

    // Set active state for the selected arc
    g.each(function (d) {
      if (d.index === index) {
        d3.select(this).classed("active", true);
      }
    });

    // Update colors based on active state
    updateColors();
  }

  // Function to update colors based on active state
  function updateColors() {
    g.selectAll("path").attr("fill", function () {
      return d3.select(this.parentNode).classed("active") ? "#b71c1c" : "#fff";
    });
    g.selectAll("textPath").attr("fill", function () {
      return d3.select(this.parentNode.parentNode).classed("active")
        ? "#fff"
        : "#000";
    });
  }

  // Set initial colors
  updateColors();

  g.append("path")
    .attr("d", arc)
    .attr("fill", function (d, i) {
      return i === 0 ? "#b71c1c" : "#fff";
    });

  // Add text along the circular path
  g.each(function (d, i) {
    var group = d3.select(this);
    var textRadius = (radius - 80 + radius - 5) / 2;
    var midAngle = (d.startAngle + d.endAngle) / 2;
    var flipText = midAngle > Math.PI;

    var textArc = d3.svg
      .arc()
      .innerRadius(textRadius)
      .outerRadius(textRadius)
      .startAngle(d.startAngle)
      .endAngle(d.endAngle);

    group
      .append("path")
      .attr("id", "textPath-" + i)
      .attr("d", textArc)
      .style("fill", "none")
      .style("stroke", "none");

    var fontSize = "10px";

    group
      .append("text")
      .style("pointer-events", "none")
      .append("textPath")
      .attr("xlink:href", "#textPath-" + i)
      .style("text-anchor", "middle")
      .attr("startOffset", "25%")
      .attr("dy", "-0.5em")
      .attr("fill", function () {
        return d3.select(this.parentNode.parentNode).classed("active")
          ? "#fff"
          : "#000";
      })
      .attr("font-size", fontSize)
      .attr("font-weight", "700")

      .style("text-transform", "uppercase")
      .text(seedData[i].label);
  });

  // Draw the inner circle
  svg
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 85)
    .attr("fill", "#b71c1c");

  // Add "VISION" text in the center
  svg
    .append("text")
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .attr("class", "inner-circle-text")
    .attr("fill", "#fff")
    .attr("font-size", "40px")
    .attr("font-weight", "bold")
    .attr("letter-spacing", "2px")
    .text("VISION");

  // Setup navigation buttons
  document.getElementById("prevBtn").addEventListener("click", function () {
    currentIndex = (currentIndex - 1 + seedData.length) % seedData.length;
    activateArc(currentIndex);
  });

  document.getElementById("nextBtn").addEventListener("click", function () {
    currentIndex = (currentIndex + 1) % seedData.length;
    activateArc(currentIndex);
  });

  // Make activateArc accessible globally for the buttons
  window.activateDonutArc = activateArc;
}
const init = () => {
  gsap.registerPlugin(ScrollTrigger);
  donut();
};
preloadImages("img").then(() => {
  // Once images are preloaded, remove the 'loading' indicator/class from the body

  init();
});

// loadpage
let isLinkClicked = false;
$("a").on("click", function (e) {
  // Nếu liên kết dẫn đến trang khác (không phải hash link hoặc javascript void)
  if (this.href && !this.href.match(/^#/) && !this.href.match(/^javascript:/)) {
    isLinkClicked = true;
    console.log("1");
  }
});

$(window).on("beforeunload", function () {
  if (!isLinkClicked) {
    $(window).scrollTop(0);
  }
  isLinkClicked = false;
});
