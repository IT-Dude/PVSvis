var vis = (function(){
	var config = {
		"title" : "",
		"root" : "#chart",
		"height" : 500,
		"width" : 900,
	}

	var chartIdCounter = 0;
	function createChart(obj){
		if(obj instanceof Chart){
			chartIdCounter++;
			d3.selectAll("#masterRoot" + obj.id).remove();
		}
		else{
			$.extend(true, config, obj);
			setConstants();
			d3.selectAll("#textHeader").text(config["title"]);
		}

		var chart;
		chart = new Chart(chartIdCounter);
		chart.setUp();
		return chart;
	}

	function setConstants(){
		sizeRoot = {
			height: config["height"],
			width: config["width"]
		}
		marginChart = {
			top: 10,
			bottom: 100,
			left: 110,
			right: 110
		}	
		sizeChart = {
			height: sizeRoot.height - marginChart.top - marginChart.bottom,
			width: sizeRoot.width - marginChart.left - marginChart.right
		}
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
		marginTooltip = {
			offsetTop: -5,
			offsetLeft: 5,
			offsetTextTop: -1,
			offsetTextLeft: 4,
			rectTop: 6,
			rectLeft: 7
		}
		orientationAxes = ["left", "left", "right", "right"];
	}
	
	function p(s){
		console.log(s);
	}
	
/*
 * Chart object
 */
	function Chart(ID){
		var self = this;
		var root;
		var chartRoot;
		var brushRoot;
		var legendRoot;
		var ruler;
		var chartData = [];
		var graphOffsets = {};
		var offsetCounter = 1.05;
		var xScale;
		var xScaleBrush;
		var timeValueScale;
		var yScales = {};
		var brush;
		var xAxis;
		var xGrid;
		var activeAxes = [false, false, false, false];
		this.id = ID;
		var colorGenerator = new ColorGenerator();
		var legendGenerator;
		
		this.setUp = function(){			
			root = d3.select(config["root"]).append("svg")
				.attr("id", "masterRoot" + self.id)
				.attr("height", sizeRoot.height)
				.attr("width", sizeRoot.width);
			
			root.append("rect")
				.attr("class", "rootBackground")
				.attr("height", sizeRoot.height)
				.attr("width", sizeRoot.width);
			
			chartRoot = root.append("g")
				.attr("transform", "translate(" + marginChart.left + ", " + marginChart.top + ")");
			
			brushRoot = root.append("g")
				.attr("transform", "translate(" + marginChart.left + ", " + marginBrush.top + ")");
			
			legendRoot = root.append("g")
				.attr("transform", "translate(" + marginChart.left + ", " + marginLegend.top + ")");
			legendGenerator = new LegendGenerator(legendRoot);
			
			var chartBackground = chartRoot.append("rect")
				.attr("class", "chartBackground")
				.attr("height", sizeChart.height)
				.attr("width", sizeChart.width);
			ruler = new Ruler(chartRoot, chartBackground);
			
			brushRoot.append("rect")
				.attr("class", "chartBackground")
				.attr("height", sizeBrush.height)
				.attr("width", sizeBrush.width);
				
			chartRoot.append("defs").append("clipPath")
					.attr("id", "clip")
				.append("rect")
					.attr("width", sizeChart.width)
					.attr("height", sizeChart.height);
			
			this.setUpGradients();			
		}
		
		// TODO define gradients somewhere else
		this.setUpGradients = function(){
			var defs = root.append("svg:defs");
			
			var gradient1 = defs.append("svg:linearGradient")
				.attr("id", "gradient1")
				.attr("x1", "0")
				.attr("x2", "0")
				.attr("y1", "25%")
				.attr("y2", "10%")
				.attr("gradientUnits", "userSpaceOnUse")
				.attr("spreadMethod", "pad");

			gradient1.append("svg:stop")
				.attr("offset", "0%")
				.attr("stop-color", "red")
				.attr("stop-opacity", 1);
			
			gradient1.append("svg:stop")
				.attr("offset", "90%")
				.attr("stop-color", "orange")
				.attr("stop-opacity", 1);
			
			gradient1.append("svg:stop")
				.attr("offset", "95%")
				.attr("stop-color", "yellow")
				.attr("stop-opacity", 1);

			gradient1.append("svg:stop")
				.attr("offset", "100%")
				.attr("stop-color", "green")
				.attr("stop-opacity", 1);
		}
		
		// TODO test if new series is already in array
		this.addSeries = function(series){
			chartData.push(series);
		}
		
		this.visualize = function(){
			if(chartData.length > 0){
				self.renderData();
			}
		}
		
		this.renderData = function(){
			var numValues = 0;
			for(var i = 0; i < chartData.length; i++){
				if(chartData[i].data.length > numValues){
					numValues = chartData[i].data.length;
				}
			}

			var firstPointInTime = chartData[0].data[0][0];
			var lastPointInTime = chartData[0].data[chartData[0].data.length - 1][0];
			var startDate = new Date(firstPointInTime);
			var endDate = new Date(lastPointInTime);
				
			var format = d3.time.format("%H:%M");
			xScale = d3.time.scale()
				.domain([startDate, endDate])
				.range([0, sizeChart.width]);
			
			xScaleBrush = d3.time.scale()
				.domain([startDate, endDate])
				.range([0, sizeChart.width]);
						
			timeValueScale = d3.time.scale()
				.domain([startDate, endDate])
				.range([0, numValues]);
			
			// TODO optimize this!!!
			d3.selectAll(".graph").remove();
			d3.selectAll(".axis").remove();
			d3.selectAll(".yGrid").remove();
			d3.selectAll(".legendText").remove();
			d3.selectAll(".legendSquare").remove();
			d3.selectAll(".brush").remove(); // ???
			numLegendElements = 0;
			legendWidth = 0;
			activeAxes = [false, false, false, false];
			
			for(var i = 0; i < chartData.length; i++){
				self.renderSeries(chartData[i]);
			}

			brush = d3.svg.brush()
				.x(xScaleBrush)
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

			if((series.type in graphOffsets) == false){
				graphOffsets[series.type] = offsetCounter;
				offsetCounter += 0.1;
			}
			
			if((series.type in yScales) == false){
				var yScale = scaleY(maxValue * graphOffsets[series.type], sizeChart.height);
				yScales[series.type] = yScale;
			}
			var yScaleBrush = scaleY(maxValue * graphOffsets[series.type], sizeBrush.height);
			
			var color = colorGenerator.generateColor(series.type);
			
			chartRoot.append("path")
      			.data([series.data])
      			.attr("class", "graph" + series.type)
      			.classed("graph", true)
				.attr("clip-path", "url(#clip)")
				.attr("d", d3.svg.line()
					.x(function(d, i){
						d.type = series.type;
						d.date = timeValueScale.invert(i);
						return xScale(d.date);
					})
					.y(function(d, i){return yScales[d.type](d[1]);})
					.interpolate("basis")
				)
				.style("stroke", color)
				.on("mouseover", function(){
						opacity = 0.08;
						d3.select(this).style("stroke", d3.rgb(0, 0, 0));
						d3.select(".yGrid" + series.type)
							.style("visibility", "visible");
						d3.selectAll(".yAxis")
							.filter(function(d, i){
								if(d3.select(this).classed("yAxis" + series.type) != true){
									return this;
								}
							})
							.style("visibility", "hidden");
						d3.selectAll(".graph")
							.filter(function(d, i){
								if(d3.select(this).classed("graph" + series.type) != true){
									return this;
								}
							})
							.style("opacity", opacity);
						d3.selectAll(".legendText")
							.filter(function(d, i){
								if(d3.select(this).classed("legendText" + series.type) != true){
									return this;
								}
							})
							.style("opacity", opacity);
						d3.selectAll(".legendSquare")
							.filter(function(d, i){
								if(d3.select(this).classed("legendSquare" + series.type) != true){
									return this;
								}
							})
							.style("opacity", opacity);		
						ruler.showTooltip(yScales[series.type]);					
				})
				.on("mouseout", function(){
						d3.select(this).style("stroke", color);
						d3.select(".yAxis" + series.type)
							.classed("axisHighlight", false);
						d3.select(".yGrid" + series.type)
							.style("visibility", "hidden");
						d3.selectAll(".yAxis")
							.style("visibility", "visible");
						d3.selectAll(".graph")
							.style("opacity", 1.0);
						d3.selectAll(".legendText")
							.style("opacity", 1.0);
						d3.selectAll(".legendSquare")
							.style("opacity", 1.0);
						ruler.removeTooltip();
				});
			
			brushRoot.append("path")
     			.data([series.data])
      			.attr("class", "graph" + series.type)
      			.classed("graph", true)
				.attr("clip-path", "url(#clip)")
				.style("stroke", color)
				.attr("d", d3.svg.line()
					.x(function(d, i){return xScaleBrush(d.date)})
					.y(function(d, i){return yScaleBrush(d[1])})
					.interpolate("basis")
				);
			
			addAxis(yScales[series.type], series.label, series.unit, series.type);			
			legendGenerator.addElement(series.type, series.label, color);
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
			xScale.domain(brush.empty() ? xScaleBrush.domain() : brush.extent());
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
		
		// TODO remove name???
		function addAxis(scale, name, unit, type){
			for(var i = 0; i < activeAxes.length; i++){
				if(i >= activeAxes.length){
					break;
				}
				if(activeAxes[i] == true){
					continue;
				}
				else{
					activeAxes[i] =true;
					var yTicks = 10;
					
					var axis = d3.svg.axis()
						.scale(scale)
						.orient(orientationAxes[i])
						.tickSize(5, 3, 1)
						.ticks(yTicks)
						.tickSubdivide(1)
						.tickFormat(convertSiUnit);

					var color = d3.select(".graph" + type).style("stroke");
					
					var axisGroup = chartRoot.append("g")
						.attr("class", "axis yAxis yAxis" + type)
						.attr("transform", "translate(" + marginAxes.left[i] + ", 0)")
						.style("stroke", color)
						.style("fill", color)
						.call(axis);
					
					axisGroup.append("text")
						.attr("transform", "translate(" + marginAxes.leftLabel[i] + ", " + (sizeChart.height + marginAxes.topLabel) + ")")
						.text(unit);
					
					var size = 0;
					if(orientationAxes[i] == "left"){
						size = -(sizeChart.width - marginAxes.left[i]);
					}
					if(orientationAxes[i] == "right"){
						size = marginAxes.left[i];
					}
					
					var yGrid = d3.svg.axis()
						.scale(yScales[type])
						.orient("left")
						.tickSize(size, 0, 0)
						.ticks(yTicks)
						.tickFormat("");

					chartRoot.append("g")
						.attr("class", "yGrid yGrid" + type)
						.attr("transform", "translate(" + marginAxes.left[i] + ", 0)")
						.style("fill", color)
						.style("stroke", color)
						.style("visibility", "hidden")
						.call(yGrid);
					
					break;
				}
			}
		}
	}
/*
 * end Chart object
 */

/*
 * ColorGenerator object
 */	
	function ColorGenerator(){
		var colorStepping = 0.5;
		var palette = [
			d3.rgb(0, 255, 200),
			d3.rgb(235, 5, 63),
			d3.rgb(127, 255, 36),
			d3.rgb(255, 255, 0),
			d3.rgb(255, 255, 0),
			d3.rgb(255, 255, 0),
			d3.rgb(255, 255, 0),
			d3.rgb(255, 255, 0),
			d3.rgb(255, 255, 0),
			d3.rgb(255, 255, 0),
			d3.rgb(255, 255, 0),
			d3.rgb(255, 255, 0),
			d3.rgb(255, 255, 0),
			d3.rgb(255, 255, 0)] // TODO add more colors to support unknown types
		var paletteColorsTaken = 0;
		var definitions = {
			"udc" : d3.rgb(104, 255, 0),
			"pdc" : d3.rgb(86, 0, 255),
			"pac" : d3.rgb(255, 242, 0),
			"gain" : d3.rgb(188, 47, 227),
			"daily-gain" : d3.rgb(157, 211, 223),
			"efficiency" : d3.rgb(255, 78, 0) // TODO use the gradient!
		}
		var colorCount = {};

		this.generateColor = function(type, id){ // TODO do something with the id
			if((type in definitions) == false){
				definitions[type] = palette[paletteColorsTaken];
				paletteColorsTaken ++;
			}
			
			if(type in colorCount){
				colorCount[type]++;
			}
			else{
				colorCount[type] = 1;
			}
			
			var color = definitions[type];	
			for(var i = 0; i < colorCount[type] - 1; i++){
				color = color.darker(colorStepping);
			}
			
			return color;
		}
		
		this.generateColorScale = function(start, end){
			return d3.scale.linear()
				.domain([0, numColors - 1])
    			.range([start, end]);
		}
	}
/*
 * end ColorGenerator object
 */

/*
 * LegendGenerator object
 */
	function LegendGenerator(legendRoot){
		var root = legendRoot;
		var width = 0;
		var numElements = 0;
		var typeColors = {};
		
		this.addElement = function(type, label, color){
			if((type in typeColors) == false){
				typeColors[type] = color;
				
				// put text and square into a group?
				var text = root.append("text")
					.attr("class", "legendText legendText" + type)
					.attr("x", width + marginLegend.leftText)
					.attr("y", marginLegend.topText)
					.text(label);
				
				root.append("rect")
					.attr("class", "legendSquare legendSquare" + type)
					.attr("x", width)
					.attr("y", marginLegend.topSquare)
					.attr("height", sizeLegend.sizeSquare)
					.attr("width", sizeLegend.sizeSquare)
					.style("fill", typeColors[type])
					.style("stroke", d3.rgb(0, 0, 0))
					.style("stroke-width", 2)
					.on("click", function(){
						var graphs = d3.selectAll(".graph" + type);
						if(graphs.style("visibility") == "visible"){
							graphs.style("visibility", "hidden");
							d3.select(this).style("stroke", "none");
						}
						else{
							graphs.style("visibility", "visible");
							d3.select(this).style("stroke", d3.rgb(0, 0, 0));
						}
					});
				
				width += text.node().getBBox().width + marginLegend.leftText + marginLegend.rightText;
				numElements++;
			}
		}
	}
/*
 * end ColorGenerator object
 */

	function Ruler(chartRoot, chartBackground){
		var root = chartRoot;
		var rect = chartBackground;
		var position;
		
		rect.on("mousemove", function(){
				root.selectAll(".ruler").remove();
				
				position = d3.svg.mouse(this);
				
				root.append("line")
					.attr("class", "ruler")
					.attr("x1", position[0])
					.attr("y1", 0)
					.attr("x2", position[0])
					.attr("y2", sizeChart.height);
			});
		
		this.showTooltip = function(yScale){
			var value = yScale.invert(position[1]);

			root.selectAll(".tooltipText").remove();
			var tooltip = root.append("text")
				.attr("class", "tooltipText")
				.attr("x", -100000)
				.attr("y", -100000)
				.text(Math.floor(value));
			var dimensions = tooltip.node().getBBox();
			root.selectAll(".tooltipText").remove();
			
			root.append("rect")
				.attr("class", "tooltipRect")
				.attr("x", position[0] + marginTooltip.offsetLeft)
				.attr("y", position[1] + marginTooltip.offsetTop - dimensions.height)
				.attr("rx", 8)
				.attr("ry", 8)
				.attr("height", dimensions.height + marginTooltip.rectTop)
				.attr("width", dimensions.width + marginTooltip.rectLeft);
			
			root.append("text")
				.attr("class", "tooltipText")
				.attr("x", position[0] + marginTooltip.offsetLeft + marginTooltip.offsetTextLeft)
				.attr("y", position[1] + marginTooltip.offsetTop + marginTooltip.offsetTextTop)
				.text(Math.floor(value));
		}
		
		this.removeTooltip = function(){
			root.selectAll(".tooltipText").remove();
			root.selectAll(".tooltipRect").remove();
		}
	}

/*
 * public objects of the "vis" namespace
 */
	return{
		createChart: createChart,
		p: p
	}
})();