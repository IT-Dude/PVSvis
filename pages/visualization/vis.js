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
		
		var xScale;
		var xScale2;
		var yScales = {};
		var brush;
		
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
			var numValues = 0;
			for(var i = 0; i < data.series.length; i++){
				if(data.series[i].data.length > numValues){
					numValues = data.series[i].data.length;
				}
			}
			xScale = scaleX(numValues);
			xScale2 = scaleX(numValues);
			
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
		}
		
		this.renderSeries = function(series){
			var maxValue = d3.max(series.data, function(d){return d[1];});

			var yScale = scaleY(maxValue, sizeChart.height);
			var yScale2 = scaleY(maxValue, sizeBrush.height);
			
			yScales[series.label] = yScale;

			chartRoot.append("path")
      			.data([series.data])
      			.attr("class", "graph" + series.label)
      			.classed("graph", true)
				.attr("clip-path", "url(#clip)")
				.attr("d", d3.svg.line()
					.x(function(d, i){
						d.type = series.label;
						return xScale(i);
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
				.range([0, height]);
			return scale;
		}
		
		function doBrush() {
			xScale.domain(brush.empty() ? xScale2.domain() : brush.extent());
			chartRoot.selectAll(".graph").attr("d", d3.svg.line()
				.x(function(d, i){return xScale(i);})
				.y(function(d, i){return yScales[d.type](d[1]);})
				.interpolate("basis")
			);
		}
	}

/*
 * public object of the "vis" namespace
 */
	return{
		setUp: setUp
	}
})();