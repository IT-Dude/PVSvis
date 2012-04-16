var namespace = (function(){
	function setUp(){
		// generate some test data
		var chartData = [];
		var numDataPoints = 100;
		var dataMax = 10;
		var PI = 3.14;
		for(var i = 0; i < numDataPoints; i++){
			chartData.push(Math.sin(i * (PI/numDataPoints)) * dataMax);
		}
		
		// some settings
		var height = 450;
		var width = 900;
		var margin = {
			top: 40,
			bottom: 40,
			left: 50,
			right: 40
		};
		
		// set up the chart
		var root = d3.select("#chart").append("svg")
			.attr("class", "chart")
			.attr("height", height)
			.attr("width", width);
		
		var chartRoot = root.append("g")
			.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
		
		var xScale = d3.scale.linear()
			.domain([0, numDataPoints])
			.range([0, width - margin.left - margin.right]);
		
		var yScale = d3.scale.linear()
			.domain([0, dataMax])
			.range([height - margin.top - margin.bottom ,0]);
		
		// define a gradient
		defs = root.append("svg:defs");
		
		var gradient = defs.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "0")
			.attr("x2", "0")
			.attr("y1", "50%")
			.attr("y2", "10%")
			.attr("gradientUnits", "userSpaceOnUse")
			.attr("spreadMethod", "pad");

		gradient.append("svg:stop")
			.attr("offset", "0%")
			.attr("stop-color", "red")
			.attr("stop-opacity", 1);
		
		gradient.append("svg:stop")
			.attr("offset", "50%")
			.attr("stop-color", "orange")
			.attr("stop-opacity", 1);
		
		gradient.append("svg:stop")
			.attr("offset", "75%")
			.attr("stop-color", "yellow")
			.attr("stop-opacity", 1);

		gradient.append("svg:stop")
			.attr("offset", "100%")
			.attr("stop-color", "green")
			.attr("stop-opacity", 1);
		
		// add a graph
		chartRoot.append("path")
			.data([chartData])
			.attr("d", d3.svg.line()
				.x(function(d, i){
					return xScale(i);
				})
				.y(function(d, i){
					return yScale(d);
				})
				.interpolate("basis")
			)
			.attr("class", "graph")
			.style("stroke", "url(#gradient)");
		
		// add the axes
		xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(5, 3, 1).ticks(5);
		chartRoot.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
			.call(xAxis);
		
		yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(20, 3, 1).ticks(5);
		chartRoot.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(" + "0" + ", 0)")
			.style("stroke", "url(#gradient)")
			.style("fill", "url(#gradient)")
			.call(yAxis);
		
		// add information
		chartRoot.append("text")
			.attr("x", 10)
			.attr("y", 152)
			.text("ticks have wrong color!");
	}
	
	return{
		setUp: setUp
	}
})();