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
		document.getElementById("textHeader").innerHTML = chartData.title;
		
		var chart = new Chart();
		chart.setUp();
		chart.renderData(chartData);
	}
/*
 * global constants for configuration
 */
	marginChart = {
		top: 50,
		bottom: 50,
		left: 50,
		right: 50
	}
	
	sizeRoot = {
		height: 400,
		width: 700}
	sizeChart = {
		height: sizeRoot.height - marginChart.top - marginChart.bottom,
		width: sizeRoot.width - marginChart.left - marginChart.right}

/*
 * Chart object
 */
	function Chart(){
		var self = this;
		var chartRoot;
		
		// TODO generate these dynamically
		var x = d3.scale.linear()
			.domain([0, 400])
			.range([0, sizeChart.width]);
    	var y = d3.scale.linear()
			.domain([0, 600])
			.range([sizeChart.height, 0]);
		
		this.setUp = function(){
			this.root = d3.select("#chart").append("svg:svg")
				.attr("height", sizeRoot.height)
				.attr("width", sizeRoot.width);
			
			this.root.append("svg:rect")
				.attr("class", "rootBackground")
				.attr("height", sizeRoot.height)
				.attr("width", sizeRoot.width);
			
			chartRoot = this.root.append("svg:g")
				.attr("transform", "translate(" + marginChart.left + ", " + marginChart.top + ")");
			
			chartRoot.append("svg:rect")
				.attr("class", "chartBackground")
				.attr("height", sizeChart.height)
				.attr("width", sizeChart.width);
		}
		
		this.renderData = function(data){
			//self.renderSeries(data.series[0]);
			
			for(var i = 0; i < data.series.length; i++){
				self.renderSeries(data.series[i]);
			}
		}
		
		this.renderSeries = function(series){
			var numValues = series.data.length;
			var maxValue = 0;
			for(var i = 0; i < numValues; i++)
			{
				if(series.data[i][1] > maxValue)
				{
					maxValue = series.data[i][1];
				}
			}
			
			
			chartRoot.selectAll("graph").data([series.data]).enter()
				.append("svg:path")
				.attr("class", "graph")
				.attr("d", d3.svg.line()
					.x(function(d, i){return self.scaleX(numValues)(i)})
					.y(function(d, i){return self.scaleY(maxValue)(d[1])})
					.interpolate("basis")
				)
				.on("mouseover", function(){
						d3.select(this).classed("graphHighlight", true);
					}
				)
				.on("mouseout", function(){
						d3.select(this).classed("graphHighlight", false);
					}
				);
		}
		
		this.scaleX = function(numValues){
			var scale = d3.scale.linear()
				.domain([0, numValues])
				.range([0, sizeChart.width]);
			return scale;
		}
		
		this.scaleY = function(maxValue){
			var scale = d3.scale.linear()
				.domain([0, maxValue])
				.range([0, sizeChart.height]);
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