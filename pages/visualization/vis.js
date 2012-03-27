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
		bottom: 135,
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
		
	}
	marginLegend = {
		top: marginBrush.top + sizeBrush.height + 5
	}
	marginAxes = [-5, -60, sizeChart.width + 5, sizeChart.width + 60];
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
				.attr("y", +1)
				.attr("height", sizeBrush.height - 1);
			
			var xTicks = 10;
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
						chartRoot.append("text")
							.attr("class", "textBox")
							.attr("y", -10)
							.text(series.label);
						d3.select(".yAxis" + series.label)
							.classed("axisHighlight", true);
					}
				)
				.on("mouseout", function(){
						d3.select(this).classed("graphHighlight", false);
						chartRoot.selectAll(".textBox").remove();
						d3.select(".yAxis" + series.label)
							.classed("axisHighlight", false);
					}
				);
			
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
			
			addAxis(yScale, series.label);
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
		
		function addAxis(scale, type) {
			for(var i = 0; i < activeAxes.length; i++)
			{
				if(i >= activeAxes.length)
				{
					break;
				}
				if(activeAxes[i] == true)
				{
					continue;
				}
				else
				{
					activeAxes[i] =true;

					var axis = d3.svg.axis().scale(scale).orient(orientationAxes[i]).tickSize(5, 3, 1).ticks(10).tickSubdivide(1);
					chartRoot.append("g")
						.attr("class", "axis yAxis" + type)
						.attr("transform", "translate(" + marginAxes[i] + ", 0)")
						.call(axis);
						
					break;
				}
			}
		}
	}

/*
 * public object of the "vis" namespace
 */
	return{
		setUp: setUp
	}
})();