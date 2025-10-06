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
  var seedData = [
    { label: "Measurable", value: 10, link: "#", content: "1" },
    { label: "Differentiation", value: 10, link: "#", content: "2" },
    { label: "Clear ", value: 10, link: "#", content: "3" },
    { label: "Result", value: 10, link: "#", content: "4" },
    { label: "Question ", value: 10, link: "#", content: "5" },
    { label: "LeaderShip", value: 10, link: "#", content: "6" },
  ];

  var width = 400,
    height = 400,
    radius = Math.min(width, height) / 2;

  var colour = d3.scale.category20();

  var arc = d3.svg
    .arc()
    .innerRadius(radius - 80)
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
      return i === 0 ? "arc active" : "arc"; // Set initial active state for first arc
    })
    .on("click", function (d, i) {
      var showContent = seedData[i].content;

      // Remove active class from all .dbcontent elements
      d3.selectAll(".dbcontent").classed("active", false);

      // Add active class to the corresponding .dbcontent
      d3.select(".dbcontent--" + showContent).classed("active", true);

      // Remove active class from all arcs
      g.classed("active", false);

      // Set active state for the clicked arc
      d3.select(this).classed("active", true);

      // Update colors based on active state
      updateColors();
    })
    .on("mouseover", function () {
      // Set hover state (red background, white text) if not active
      if (!d3.select(this).classed("active")) {
        d3.select(this).select("path").attr("fill", "#b71c1c");
        d3.select(this).select("textPath").attr("fill", "#fff");
      }
    })
    .on("mouseout", function (d, i) {
      // Reset to default state when mouse leaves if not active
      if (!d3.select(this).classed("active")) {
        d3.select(this).select("path").attr("fill", "#fff");
        d3.select(this).select("textPath").attr("fill", "#000");
      }
    });

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
      return i === 0 ? "#b71c1c" : "#fff"; // Initial fill
    });

  // Add text along the circular path
  g.each(function (d, i) {
    var group = d3.select(this);

    // Radius for text path (middle of the donut ring)
    var textRadius = (radius - 80 + radius - 25) / 2;

    // Calculate the mid-angle for accurate centering
    var midAngle = (d.startAngle + d.endAngle) / 2;
    var flipText = midAngle > Math.PI; // Flip text if in the bottom half

    // Create FULL arc for the text path
    var textArc = d3.svg
      .arc()
      .innerRadius(textRadius)
      .outerRadius(textRadius)
      .startAngle(d.startAngle)
      .endAngle(d.endAngle);

    // Append an invisible path for the text to follow
    group
      .append("path")
      .attr("id", "textPath-" + i)
      .attr("d", textArc)
      .style("fill", "none")
      .style("stroke", "none");

    // Dynamic font size based on label length
    var textLength = seedData[i].label.length;
    var fontSize = "12px"; // Consistent font size

    // Append text and textPath with dynamic centering
    group
      .append("text")
      .style("pointer-events", "none")
      .append("textPath")
      .attr("xlink:href", "#textPath-" + i)
      .style("text-anchor", "middle")
      .attr("startOffset", "25%") // Center horizontally on path
      .attr("dy", "-0.5em")
      .attr("fill", function () {
        return d3.select(this.parentNode.parentNode).classed("active")
          ? "#fff"
          : "#000";
      })
      .attr("font-size", fontSize)
      .attr("font-weight", "700")
      .attr("letter-spacing", "0.5px")
      .style("text-transform", "uppercase")
      .text(seedData[i].label);
  });

  // Draw the inner circle
  svg
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 100)
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
