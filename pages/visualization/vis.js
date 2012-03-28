var vis = (function(){
	
	// TODO use this piece of code, current workaround is the inclusion of the data as .js file
	// use a server to deliver the data the standard way 
	/*
	var chartData;
	d3.json("chart-data.json", function(json) {
		chartData = json;
	});
	console.log(data);
	*/
	
	console.log(chartData);
	
	function setUp()
	{
		d3.selectAll("#textHeader").text(chartData.title);
		
		var chart = new Chart();
		chart.setUp();
		chart.renderData(chartData);
	}
/*
 * global constants for configuration
 */
	sizeRoot = {
		height: 500,
		width: 900}
	marginChart = {
		top: 10,
		bottom: 100,
		left: 110,
		right: 110
	}	
	sizeChart = {
		height: sizeRoot.height - marginChart.top - marginChart.bottom,
		width: sizeRoot.width - marginChart.left - marginChart.right}
	marginBrush = {
		top: sizeChart.height + marginChart.top + 25,
		bottom: 40,
		left: marginChart.left, 
		right: marginChart.right
	}
	sizeBrush = {
		height: sizeRoot.height - marginBrush.top - marginBrush.bottom,
		width: sizeChart.width
	}
	sizeLegend = {
		sizeSquare: 15,
		widthElement: 110
	}
	marginLegend = {
		top: marginBrush.top + sizeBrush.height + 9,
		topText: 18,
		leftText: sizeLegend.sizeSquare + 3,
		rightText: 12,
		topSquare: 5
	}
	marginAxes = {
		left: [-5, -50, sizeChart.width + 5, sizeChart.width + 50],
		topLabel: 20,
		leftLabel: [-30, -30, 5, 5]
	}
	orientationAxes = ["left", "left", "right", "right"];
	graphOffsets = {"Leistung" : 1.1, "Ertrag" : 1.2, "Wirkungsgrad" : 1.3, "Spannung" : 1.4};
/*
 * global functions
 */
	function p(s){
		console.log(s);
	}
	
/*
 * Chart object
 */
	function Chart(){
		var self = this;
		var chartRoot;
		var brushRoot;
		var legendRoot;
		var xScale;
		var xScale2;
		var timeValueScale;
		var yScales = {};
		var brush;
		var xAxis;
		var xGrid;
		var activeAxes = [false, false, false, false];
		var numLegendElements = 0;
		var legendWidth = 0;
		
		this.setUp = function(){
			this.root = d3.select("#chart").append("svg")
				.attr("height", sizeRoot.height)
				.attr("width", sizeRoot.width);
			
			this.root.append("rect")
				.attr("class", "rootBackground")
				.attr("height", sizeRoot.height)
				.attr("width", sizeRoot.width);
			
			chartRoot = this.root.append("g")
				.attr("transform", "translate(" + marginChart.left + ", " + marginChart.top + ")");
			
			brushRoot = this.root.append("g")
				.attr("transform", "translate(" + marginChart.left + ", " + marginBrush.top + ")");
			
			legendRoot = this.root.append("g")
				.attr("transform", "translate(" + marginChart.left + ", " + marginLegend.top + ")");
			
			chartRoot.append("rect")
				.attr("class", "chartBackground")
				.attr("height", sizeChart.height)
				.attr("width", sizeChart.width);
			
			brushRoot.append("rect")
				.attr("class", "chartBackground")
				.attr("height", sizeBrush.height)
				.attr("width", sizeBrush.width);
				
			chartRoot.append("defs").append("clipPath")
					.attr("id", "clip")
				.append("rect")
					.attr("width", sizeChart.width)
					.attr("height", sizeChart.height);
		}
		
		this.renderData = function(data){
			var numValues = 0;
			for(var i = 0; i < data.series.length; i++){
				if(data.series[i].data.length > numValues){
					numValues = data.series[i].data.length;
				}
			}

			// TODO make this more beautiful
			var startDate = new Date(2000, 0, 0, 0, 0, 0);
			var endDate = new Date(2000, 0, 0, 23, 59, 59);
			var format = d3.time.format("%H:%M");
			xScale = d3.time.scale()
				.domain([startDate, endDate])
				.range([0, sizeChart.width]);
			
			xScale2 = d3.time.scale()
				.domain([startDate, endDate])
				.range([0, sizeChart.width]);
						
			timeValueScale = d3.time.scale()
				.domain([startDate, endDate])
				.range([0, numValues]);
			//

			for(var i = 0; i < data.series.length; i++){
				self.renderSeries(data.series[i]);
			}

			brush = d3.svg.brush()
				.x(xScale2)
				.on("brush", doBrush);
			
			brushRoot.append("g")
				.attr("class", "x brush")
				.call(brush)
				.selectAll("rect")
				.attr("y", + 0)
				.attr("height", sizeBrush.height + 1);
			
			var xTicks = 8;
			xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(5, 3, 1).ticks(xTicks).tickFormat(format);
			chartRoot.append("g")
				.attr("class", "axis xAxis")
				.attr("transform", "translate(0," + sizeChart.height + ")")
				.call(xAxis);

			xGrid = d3.svg.axis().scale(xScale).orient("bottom").tickSize(sizeChart.height, 0, 0).ticks(xTicks).tickFormat("");
			chartRoot.append("g")
				.attr("class", "xGrid")
				.call(xGrid);
		}
		
		this.renderSeries = function(series){
			var maxValue = d3.max(series.data, function(d){return d[1];});

			var yScale = scaleY(maxValue * graphOffsets[series.label], sizeChart.height);
			var yScale2 = scaleY(maxValue * graphOffsets[series.label], sizeBrush.height);
			
			yScales[series.label] = yScale;

			chartRoot.append("path")
      			.data([series.data])
      			.attr("class", "graph" + series.label)
      			.classed("graph", true)
				.attr("clip-path", "url(#clip)")
				.attr("d", d3.svg.line()
					.x(function(d, i){
						d.type = series.label;
						d.date = timeValueScale.invert(i);
						return xScale(d.date);
					})
					.y(function(d, i){return yScales[d.type](d[1]);})
					.interpolate("basis")
				)
				.on("mouseover", function(){
						d3.select(this).classed("graphHighlight", true);
						d3.select(".yAxis" + series.label)
							.classed("axisHighlight", true);
				})
				.on("mouseout", function(){
						d3.select(this).classed("graphHighlight", false);
						d3.select(".yAxis" + series.label)
							.classed("axisHighlight", false);
				});
			
			brushRoot.append("path")
     			.data([series.data])
      			.attr("class", "graph" + series.label)
      			.classed("graph", true)
				.attr("clip-path", "url(#clip)")
				.attr("d", d3.svg.line()
					.x(function(d, i){return xScale2(d.date)})
					.y(function(d, i){return yScale2(d[1])})
					.interpolate("basis")
				);
			
			addAxis(yScale, series.label, series.unit);
			addLegendElement(series.label);
		}
		
		function scaleX(numValues){
			var scale = d3.scale.linear()
				.domain([0, numValues])
				.range([0, sizeChart.width]);
			return scale;
		}
		
		function scaleY(maxValue, height){
			var scale = d3.scale.linear()
				.domain([0, maxValue])
				.range([height, 0]);
			return scale;
		}
		
		function doBrush() {
			xScale.domain(brush.empty() ? xScale2.domain() : brush.extent());
			chartRoot.selectAll(".graph").attr("d", d3.svg.line()
				.x(function(d, i){return xScale(d.date);})
				.y(function(d, i){return yScales[d.type](d[1]);})
				.interpolate("basis")
			);
			chartRoot.selectAll(".xAxis").call(xAxis);
			chartRoot.selectAll(".xGrid").call(xGrid);
		}

		function convertSiUnit(value){
			var steps =	[[1e12, "T"],
						[1e9, "G"],
						[1e6, "M"],
						[1e3, "k"],
						[1, ""],
						[1e-3, "m"],
						[1e-6, "µ"],
						[1e-9, "n"]];

			for(var i = 0; i < steps.length; i++){
				if(value >= steps[i][0]){
					var number = value / steps[i][0];
					var postfix = steps[i][1];
					return number + postfix;
				}
			}
		}
		
		function addAxis(scale, name, unit){
			for(var i = 0; i < activeAxes.length; i++){
				if(i >= activeAxes.length){
					break;
				}
				if(activeAxes[i] == true){
					continue;
				}
				else{
					activeAxes[i] =true;
					
					var axis = d3.svg.axis()
						.scale(scale)
						.orient(orientationAxes[i])
						.tickSize(5, 3, 1)
						.ticks(10)
						.tickSubdivide(1)
						.tickFormat(convertSiUnit);

					var color = d3.select(".graph" + name).style("stroke");
					
					var axisGroup = chartRoot.append("g")
						.attr("class", "axis yAxis" + name)
						.attr("transform", "translate(" + marginAxes.left[i] + ", 0)")
						.style("fill", color)
						.style("stroke", color)
						.call(axis);
					
					axisGroup.append("text")
						.attr("transform", "translate(" + marginAxes.leftLabel[i] + ", " + (sizeChart.height + marginAxes.topLabel) + ")")
						.text(unit);
					
					break;
				}
			}
		}
		
		function addLegendElement(name){
			var text = legendRoot.append("text")
				.attr("class", "legendText" + name)
				.attr("x", legendWidth + marginLegend.leftText)
				.attr("y", marginLegend.topText)
				.text(name);
			
			legendRoot.append("rect")
				.attr("class", "legendSquare" + name)
				.attr("x", legendWidth)
				.attr("y", marginLegend.topSquare)
				.attr("height", sizeLegend.sizeSquare)
				.attr("width", sizeLegend.sizeSquare)
				.style("fill", d3.select(".graph" + name).style("stroke"));
			
			legendWidth += text.node().getBBox().width + marginLegend.leftText + marginLegend.rightText;
			numLegendElements++;
		}
	}

/*
 * public object of the "vis" namespace
 */
	return{
		setUp: setUp
	}
})();