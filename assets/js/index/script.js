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
var swiperInstance = null;

function initSwiper() {
  var panelBox = document.getElementById("panelBox");
  var dbcontents = panelBox.querySelectorAll(".dbcontent");

  if (window.innerWidth <= 991) {
    // Mobile: Initialize Swiper
    if (!swiperInstance) {
      // Wrap content in swiper structure
      var swiperWrapper = document.createElement("div");
      swiperWrapper.className = "swiper-wrapper";

      dbcontents.forEach(function (content) {
        var slide = document.createElement("div");
        slide.className = "swiper-slide";
        slide.appendChild(content.cloneNode(true));
        swiperWrapper.appendChild(slide);
      });

      // Clear panelBox and add swiper structure
      panelBox.innerHTML = "";
      panelBox.className = "panelBox swiper";
      panelBox.appendChild(swiperWrapper);

      // Add pagination
      var pagination = document.createElement("div");
      pagination.className = "swiper-pagination";
      panelBox.appendChild(pagination);

      // Initialize Swiper
      swiperInstance = new Swiper(".swiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: false,
        on: {
          slideChange: function () {
            // Sync with donut chart
            if (window.activateDonutArc) {
              window.activateDonutArc(this.activeIndex);
            }
          },
        },
      });
    }
  } else {
    // Desktop: Remove Swiper if exists
    if (swiperInstance) {
      swiperInstance.destroy(true, true);
      swiperInstance = null;

      // Restore original structure
      panelBox.className = "panelBox";
      panelBox.innerHTML = "";
      dbcontents.forEach(function (content) {
        panelBox.appendChild(content);
      });
    }
  }
}

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

  var currentIndex = 0;

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
      d.index = i;
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

  function activateArc(index) {
    currentIndex = index;
    var showContent = seedData[index].content;

    if (window.innerWidth <= 991 && swiperInstance) {
      // Mobile: Slide to the correct slide
      swiperInstance.slideTo(index);

      // Update active class in swiper slides
      var slides = document.querySelectorAll(".swiper-slide .dbcontent");
      slides.forEach(function (slide) {
        slide.classList.remove("active");
      });
      if (slides[index]) {
        slides[index].classList.add("active");
      }
    } else {
      // Desktop: Use original logic
      d3.selectAll(".dbcontent").classed("active", false);
      d3.select(".dbcontent--" + showContent).classed("active", true);
    }

    g.classed("active", false);
    g.each(function (d) {
      if (d.index === index) {
        d3.select(this).classed("active", true);
      }
    });

    updateColors();
  }

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

  updateColors();

  g.append("path")
    .attr("d", arc)
    .attr("fill", function (d, i) {
      return i === 0 ? "#b71c1c" : "#fff";
    });

  g.each(function (d, i) {
    var group = d3.select(this);
    var textRadius = (radius - 80 + radius - 5) / 2;

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

    group
      .append("text")
      .style("pointer-events", "none")
      .style("font-size", "12px")
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
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .attr("letter-spacing", "0.5px")
      .style("text-transform", "uppercase")
      .text(seedData[i].label);
  });

  svg
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 90)
    .attr("fill", "#b71c1c");

  svg
    .append("text")
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .attr("class", "inner-circle-text")
    .attr("fill", "#fff")
    .style("font-size", "24px")
    .attr("font-weight", "bold")
    .attr("letter-spacing", "2px")
    .text("VISION");

  document.getElementById("prevBtn").addEventListener("click", function () {
    currentIndex = (currentIndex - 1 + seedData.length) % seedData.length;
    activateArc(currentIndex);
  });

  document.getElementById("nextBtn").addEventListener("click", function () {
    currentIndex = (currentIndex + 1) % seedData.length;
    activateArc(currentIndex);
  });

  window.activateDonutArc = activateArc;
}

// Initialize

const init = () => {
  gsap.registerPlugin(ScrollTrigger);
  donut();
  initSwiper();
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
