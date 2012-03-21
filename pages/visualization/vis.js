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
		height: 400,
		width: 700}
	marginChart = {
		top: 50,
		bottom: 120,
		left: 50,
		right: 50
	}	
	sizeChart = {
		height: sizeRoot.height - marginChart.top - marginChart.bottom,
		width: sizeRoot.width - marginChart.left - marginChart.right}
	marginBrush = {
		top: sizeChart.height + marginChart.top + 10,
		bottom: 10,
		left: marginChart.left, 
		right: marginChart.right
	}
	sizeBrush = {
		height: 100,
		width: sizeChart.width
	}
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
		
		// TODO generate these dynamically
		var x = d3.scale.linear()
			.domain([0, 400])
			.range([0, sizeChart.width]);
    	var y = d3.scale.linear()
			.domain([0, 600])
			.range([sizeChart.height, 0]);
		
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
			self.renderSeries(data.series[0]);
			
			/*
			for(var i = 0; i < data.series.length; i++){
				self.renderSeries(data.series[i]);
			}
			*/
			
			for(var i = 0; i < data.series.length; i++){
				//self.renderSeries(data.series[i]);
				var maxValue = d3.max(data.series[i].data, function(d){return d[1];});
				console.log("maxValue " + maxValue);
				console.log("length " + data.series[i].data.length);
			}
		}
		
		this.renderSeries = function(series){
			var numValues = series.data.length;
			var maxValue = d3.max(series.data, function(d){return d[1];});
			
			xScale = self.scaleX(numValues);
			xScale2 = self.scaleX(numValues);
			yScale = self.scaleY(maxValue, sizeChart.height);
			yScale2 = self.scaleY(maxValue, sizeBrush.height);
			
			var brush = d3.svg.brush()
			    .x(xScale2)
			    .on("brush", brush);
			
			function brush() {
				xScale.domain(brush.empty() ? xScale2.domain() : brush.extent());
  				chartRoot.select("path").attr("d", d3.svg.line()
					.x(function(d, i){return xScale(i)})
					.y(function(d, i){return yScale(d[1])})
					.interpolate("basis")
				);
			}

			chartRoot.append("path")
      			.data([series.data])
      			.attr("class", "graph" + series.label)
      			.classed("graph", true)
				.attr("clip-path", "url(#clip)")
				.attr("d", d3.svg.line()
					.x(function(d, i){return xScale(i)})
					.y(function(d, i){return yScale(d[1])})
					.interpolate("basis")
				)
				.on("mouseover", function(){
						d3.select(this).classed("graphHighlight", true);
						chartRoot.append("text")
							.attr("class", "textBox")
							.attr("y", -10)
							.text(series.label);
					}
				)
				.on("mouseout", function(){
						d3.select(this).classed("graphHighlight", false);
						chartRoot.selectAll(".textBox").remove();
					}
				);
			
			brushRoot.append("path")
     			.data([series.data])
      			.attr("class", "graph" + series.label)
      			.classed("graph", true)
				.attr("clip-path", "url(#clip)")
				.attr("d", d3.svg.line()
					.x(function(d, i){return xScale2(i)})
					.y(function(d, i){return yScale2(d[1])})
					.interpolate("basis")
				);
			
			brushRoot.append("g")
				.attr("class", "x brush")
				.call(brush)
				.selectAll("rect")
				.attr("y", +1)
				.attr("height", sizeBrush.height - 1);
		}
		
		this.scaleX = function(numValues){
			var scale = d3.scale.linear()
				.domain([0, numValues])
				.range([0, sizeChart.width]);
			return scale;
		}
		
		this.scaleY = function(maxValue, height){
			var scale = d3.scale.linear()
				.domain([0, maxValue])
				.range([0, height]);
			return scale;
		}
	}

/*
 * Diagram object
 */
	function Diagram(){
		var self = this;
		var chartRoot;
		
		const DIAGRAM_HEIGHT = 600;
		const DIAGRAM_WIDTH = 1000;
		const PADDING_TOP = 10;
		const PADDING_BOTTOM = 80;
		const PADDING_LEFT = 80;
		const PADDING_RIGHT = 100;
		const AXIS_SPACING = 30;
		
		var x = d3.scale.linear()
				.domain([0, MEASUREMENTS - 1])
				.range([0, DIAGRAM_WIDTH - PADDING_LEFT - PADDING_RIGHT]);
		var y = d3.scale.linear()
				
				.range([DIAGRAM_HEIGHT - PADDING_TOP - PADDING_BOTTOM, 0]);
		
		var y2 = d3.scale.linear()
				.domain([0, 1000])
				.range([DIAGRAM_HEIGHT - PADDING_TOP - PADDING_BOTTOM, 0]);
		
		setUpDiagram();
		
		function setUpDiagram(){
			this.root = d3.select("#diagram").append("svg:svg")
							.attr("height", DIAGRAM_HEIGHT)
							.attr("width", DIAGRAM_WIDTH);
			
			// background
			this.root.append("svg:rect")
						.attr("class", "diagramBackground")
						.attr("height", DIAGRAM_HEIGHT)
						.attr("width", DIAGRAM_WIDTH);
			
			chartRoot = this.root.append("svg:g")
			chartRoot.attr("transform", "translate("+ PADDING_LEFT +", " + PADDING_TOP + ")");
			
			chartRoot.append("svg:rect")
					.attr("fill-opacity", 0.0)
					.attr("stroke", d3.rgb(0, 0, 200))
					.attr("width", DIAGRAM_WIDTH - PADDING_LEFT - PADDING_RIGHT)
					.attr("height", DIAGRAM_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
			
			
			// axes
			var axisRoot = this.root.append("svg:g");
			axisRoot.attr("transform", "translate(" + PADDING_LEFT + ", " + PADDING_TOP + ")");
			
			// y-axis
			var yAxisLeftA = d3.svg.axis()
							.scale(y)
							.tickSize(6, 4, 2)
							.ticks(VALUE_MAX)
							.orient("left");

			axisRoot.append("svg:g")
				.attr("id", "yAxis")
				.attr("class", "axis")
				.call(yAxisLeftA);
			
			var yAxisLeftB = d3.svg.axis()
							.scale(y2)
							.tickSize(6, 4, 2)
							.ticks(VALUE_MAX)
							.orient("left");

			axisRoot.append("svg:g")
				.attr("id", "yAxis")
				.attr("class", "axis")
				.attr("transform", "translate(" + -AXIS_SPACING + " , 0)")
				.call(yAxisLeftB);
			
			// x-axis
			// TODO improve the x-axis
			startDate = new Date(2000, 0, 0, 0, 0, 0);
			endDate = new Date(2000, 0, 0, 23, 59, 59);
			format = d3.time.format("%H:%M");
			var xTime = d3.time.scale()
							.range([0, DIAGRAM_WIDTH - PADDING_LEFT - PADDING_RIGHT])
							.domain([startDate, endDate]);
			
			var  xAxis = d3.svg.axis().scale(xTime)
							.tickSize(6, 4, 2)
							.tickFormat(format)
							.ticks(d3.time.hours, 3)
							.tickSubdivide(true);
			
			axisRoot.append("svg:g")
		    	.attr("id", "xAxis")
				.attr("class", "axis")
				.attr("transform", "translate(0, " + (DIAGRAM_HEIGHT - PADDING_TOP - PADDING_BOTTOM)+ ")")
				.call(xAxis);
		}
		
		// TODO calculate the color based on the data's mean value
		var color = d3.scale.linear()
			.domain([0, VALUE_MAX])
			.range(["red", "green"]);
			
		var stroke = d3.scale.category20();
		
		this.render = function(data){
			chartRoot.selectAll(".dataGraph").remove();
			chartRoot.selectAll(".dataGraph").data(data).map(function(d){return d.data;}).enter()
				.append("svg:path")
				.attr("class", "dataGraph")
				.style("stroke", function(d, i){return stroke(d);}) // TODO use alternative: return color(d[0]) // TODO use i instead of d?
				.attr("d", d3.svg.line()
					.x(function(d, i){return x(i)})
					.y(function(d, i){return y(d)})
					.interpolate("basis")
				)
				.on("mouseover", function(){
						d3.select(this)
							.style("stroke", d3.rgb(0, 0, 0));
					}
				)
				.on("mouseout", function(){
						d3.select(this)
							.style("stroke", function(d, i){return stroke(d);});
					}
				);
		}
		
		this.showPreviewGraph = function(d){
			var data = [d];
			chartRoot.selectAll(".previewGraph").remove();
			chartRoot.selectAll(".previewGraph").data(data).enter()
				.append("svg:path")
				.attr("class", "previewGraph")
				.attr("d", d3.svg.line()
					.x(function(d, i){return x(i)})
					.y(function(d, i){return y(d)})
					.interpolate("basis")
				);
		}
		
		this.removePreviewGraph = function(){
			chartRoot.selectAll(".previewGraph").remove();
		}
	}

/*
 * public functions of the "vis" namespace
 */
	return{
		setUp: setUp
	}
})();