var vis = (function(){
	var chartIdCounter = 0;
	function createChart(obj){
		var settings = getDefaultSettings();

		if(obj instanceof Chart){
			chartIdCounter++;
			d3.selectAll("#masterRoot" + obj.id).remove();
			settings = obj.getSettings();
		}
		else{
			$.extend(true, settings, obj);
			d3.selectAll("#textHeader").text(settings["title"]);
		}

		var config = new Configuration(settings);
		var chart = new Chart(chartIdCounter, config);
		chart.setUp();
		return chart;
	}	
	
	function getDefaultSettings(){
		return {
			"title" : "",
			"root" : "#chart",
			"height" : 500,
			"width" : 900
		}
	}
	
	function Configuration(settings){
		var self = this;
		this.settings = settings;
		this.sizeRoot = {
			height: settings["height"],
			width: settings["width"]
		}
		this.marginChart = {
			top: 10,
			bottom: 100,
			left: 10,
			right: 10
		}	
		this.sizeChart = {
			height: self.sizeRoot.height - self.marginChart.top - self.marginChart.bottom,
			width: self.sizeRoot.width - self.marginChart.left - self.marginChart.right
		}
		this.marginBrush = {
			top: self.sizeChart.height + self.marginChart.top + 25,
			bottom: 40,
			left: self.marginChart.left, 
			right: self.marginChart.right
		}
		this.sizeBrush = {
			height: self.sizeRoot.height - self.marginBrush.top - self.marginBrush.bottom,
			width: self.sizeChart.width
		}
		this.sizeLegend = {
			sizeSquare: 15,
			widthElement: 110
		}
		this.marginLegend = {
			top: self.marginBrush.top + self.sizeBrush.height + 9,
			topText: 18,
			leftText: self.sizeLegend.sizeSquare + 3,
			rightText: 12,
			topSquare: 5
		}
		this.marginAxes = {
			left: [-5, -50, self.sizeChart.width + 5, self.sizeChart.width + 50],
			topLabel: 20,
			leftLabel: [-30, -30, 5, 5]
		}
		this.axis ={
			margin : {
				labelTop: 20
			}
		}
		this.marginTooltip = {
			offsetTop: -5,
			offsetLeft: 5,
			offsetTextTop: -1,
			offsetTextLeft: 4,
			rectTop: 6,
			rectLeft: 7
		}
		this.orientationAxes = ["left", "left", "right", "right"];
	}
	
	function p(s){
		console.log(s);
	}
	
/*
 * Chart object
 */
	function Chart(ID, configuration){
		var self = this;
		var config = configuration;
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
		var axisGenerator = new AxisGenerator(config);
		var legendGenerator;
		
		this.setUp = function(){			
			root = d3.select(config.settings["root"]).append("svg")
				.attr("id", "masterRoot" + self.id)
				.attr("height", config.sizeRoot.height)
				.attr("width", config.sizeRoot.width);
			
			root.append("rect")
				.attr("class", "rootBackground")
				.attr("height", config.sizeRoot.height)
				.attr("width", config.sizeRoot.width);
		}
		
		// TODO test if new series is already in array
		this.addSeries = function(series){
			chartData.push(series);
		}
		
		this.visualize = function(){
			if(chartData.length > 0){
				self.setUpGeometry();
				self.renderData();
			}
		}
		
		this.setUpGeometry = function(){			
			chartRoot = root.append("g");
			brushRoot = root.append("g");
			legendRoot = root.append("g");
			legendGenerator = new LegendGenerator(legendRoot, config);
			
			graphOffsets = axisGenerator.getGraphOffsets(chartData);
			axisGenerator.generateAxes(chartData, graphOffsets);
			yScales = axisGenerator.getYScales();
			axisGenerator.addAxes(chartRoot);
			
			chartRoot.attr("transform", "translate(" + config.marginChart.left + ", " + config.marginChart.top + ")");
			brushRoot.attr("transform", "translate(" + config.marginChart.left + ", " + config.marginBrush.top + ")");
			legendRoot.attr("transform", "translate(" + config.marginChart.left + ", " + config.marginLegend.top + ")");
			
			var chartBackground = chartRoot.append("rect")
				.attr("class", "chartBackground")
				.attr("height", config.sizeChart.height)
				.attr("width", config.sizeChart.width);
			ruler = new Ruler(chartRoot, chartBackground, config);
			
			axisGenerator.addGrid(chartRoot);
			
			brushRoot.append("rect")
				.attr("class", "chartBackground")
				.attr("height", config.sizeBrush.height)
				.attr("width", config.sizeBrush.width);
				
			chartRoot.append("defs").append("clipPath")
					.attr("id", "clip")
				.append("rect")
					.attr("width", config.sizeChart.width)
					.attr("height", config.sizeChart.height);
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
				
			//var format = d3.time.format("%H:%M");
			xScale = d3.time.scale()
				.domain([startDate, endDate])
				.range([0, config.sizeChart.width]);
			
			xScaleBrush = d3.time.scale()
				.domain([startDate, endDate])
				.range([0, config.sizeChart.width]);
						
			timeValueScale = d3.time.scale()
				.domain([startDate, endDate])
				.range([0, numValues]);

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
				.attr("height", config.sizeBrush.height + 1);
			
			var xTicks = 8;
			xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(5, 3, 1).ticks(xTicks)//.tickFormat(format);
			chartRoot.append("g")
				.attr("class", "axis xAxis")
				.attr("transform", "translate(0," + config.sizeChart.height + ")")
				.call(xAxis);

			xGrid = d3.svg.axis().scale(xScale).orient("bottom").tickSize(config.sizeChart.height, 0, 0).ticks(xTicks).tickFormat("");
			chartRoot.append("g")
				.attr("class", "xGrid")
				.call(xGrid);
		}
		
		this.renderSeries = function(series){
			var maxValue = d3.max(series.data, function(d){return d[1];});

			var yScaleBrush = d3.scale.linear()
				.domain([0, maxValue * graphOffsets[series.type]])
				.range([config.sizeBrush.height, 0]);			
			
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
				
			legendGenerator.addElement(series.type, series.label, color);
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
		
		this.getSettings = function(){
			return config.settings;
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
	function LegendGenerator(legendRoot, configuration){
		var config = configuration;
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
					.attr("x", width + config.marginLegend.leftText)
					.attr("y", config.marginLegend.topText)
					.text(label);
				
				root.append("rect")
					.attr("class", "legendSquare legendSquare" + type)
					.attr("x", width)
					.attr("y", config.marginLegend.topSquare)
					.attr("height", config.sizeLegend.sizeSquare)
					.attr("width", config.sizeLegend.sizeSquare)
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
				
				width += text.node().getBBox().width + config.marginLegend.leftText + config.marginLegend.rightText;
				numElements++;
			}
		}
	}
/*
 * end ColorGenerator object
 */

	function Ruler(chartRoot, chartBackground, configuration){
		var config = configuration;
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
					.attr("y2", config.sizeChart.height);
			});
		
		this.showTooltip = function(yScale){
			if(position == undefined){
				return;
			}
			
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
				.attr("x", position[0] + config.marginTooltip.offsetLeft)
				.attr("y", position[1] + config.marginTooltip.offsetTop - dimensions.height)
				.attr("rx", 8)
				.attr("ry", 8)
				.attr("height", dimensions.height + config.marginTooltip.rectTop)
				.attr("width", dimensions.width + config.marginTooltip.rectLeft);
			
			root.append("text")
				.attr("class", "tooltipText")
				.attr("x", position[0] + config.marginTooltip.offsetLeft + config.marginTooltip.offsetTextLeft)
				.attr("y", position[1] + config.marginTooltip.offsetTop + config.marginTooltip.offsetTextTop)
				.text(Math.floor(value));
		}
		
		this.removeTooltip = function(){
			root.selectAll(".tooltipText").remove();
			root.selectAll(".tooltipRect").remove();
		}
	}
	
	function AxisGenerator(configuration){
		var config = configuration;
		var axisWidth = 40; // TODO put this in the config
		var yTicks = 10; // TODO move this to the config
		var axes = {};
		
		this.getGraphOffsets = function(chartData){
			var offsets = {};
			var counter = 1.05;
			
			for(var i = 0; i < chartData.length; i++){
				var series = chartData[i];
				if((series.type in offsets) == false){
					offsets[series.type] = counter;
					counter += 0.1;
				}
			}
			
			return offsets;
		}
		
		this.generateAxes = function(chartData, offsets){
			var maxValues = {};
			
			for(var i = 0; i < chartData.length; i++){
				var series = chartData[i];
				var axis = new Axis();

				axis.type = series.type;
				axis.label = series.label;
				axis.unit = series.unit;
				if((series.type in axes) == false){
					axes[series.type] = axis;
				}
				
				var maxValue = d3.max(series.data, function(d){return d[1];});
				if((series.type in maxValues) == false){
					maxValues[series.type] = maxValue;
				}
				if(maxValues[series.type] < maxValue){
					maxValues[series.type] = maxValue;
				}
			}
			
			for(type in maxValues){
				axes[type].scale = d3.scale.linear()
					.domain([0, maxValues[type] * offsets[type]])
					.range([config.sizeChart.height, 0]);
			}
			
			var oldWidth = config.sizeChart.width;
			var newWidth = config.sizeChart.width;
			var count = 0;
			for(type in axes){
				newWidth -= axisWidth;
				count ++;	
			}
			config.sizeChart.width = newWidth;
			config.sizeBrush.width = newWidth;
			
			var margin;
			if((count % 2) == 0){
				margin = ((oldWidth - newWidth) / 2);
			}
			else{
				margin = ((oldWidth - newWidth) / count) * ((count + 1) / 2);
			}
			config.marginChart.left += margin;
			config.marginBrush.left += margin;
		}
		
		this.getYScales = function(){
			var scales = {};
			for(type in axes){
				scales[type] = axes[type].scale;
			}
			return scales;
		}
		
		this.addAxes = function(root){			
			var previousAxisAddedLeft = false;
			var marginLeft = -5;
			var marginRight = config.sizeChart.width + 5;
			
			for(type in axes){
				var axisData = axes[type];
				var orientation;
				
				var margin;
				if(previousAxisAddedLeft == false){
					orientation = "left";
					margin = marginLeft;
					marginLeft -= axisWidth;
				}
				else{
					orientation = "right";
					margin = marginRight;
					marginRight += axisWidth;	
				}
				axisData.orientation = orientation;
				axisData.margin = margin;

				var axis = d3.svg.axis()
					.scale(axisData.scale)
					.orient(orientation)
					.tickSize(5, 3, 1)
					.ticks(yTicks)
					.tickSubdivide(1)
					.tickFormat(convertSiUnit);
				
				// TODO somehow get the graph's color
				var color = "black";
				//var color = d3.select(".graph" + axisData.type).style("stroke");				
				
				var axisGroup = root.append("g")
					.attr("class", "axis yAxis yAxis" + type)
					.attr("transform", "translate(" + margin + ", 0)")
					.style("stroke", color)
					.style("fill", color)
					.call(axis);
				
				// TODO better text positioning
				axisGroup.append("text")
					.attr("transform", "translate(" + 0 + ", " + (config.sizeChart.height + config.axis.margin.labelTop) + ")")
					.text(axisData.unit);
				
				previousAxisAddedLeft = !previousAxisAddedLeft;
			}
		}
		
		this.addGrid = function(root){
			for(type in axes){
				var axisData = axes[type];
				var color = "black"; // TODO change color
				
				var size = 0;
				var position = 0;
				if(axisData.orientation == "left"){
					size = config.sizeChart.width + Math.abs(axisData.margin);
					position = -Math.abs(axisData.margin);
				}
				else{
					size = Math.abs(axisData.margin);
					position = config.sizeChart.width - Math.abs(axisData.margin) + Math.abs(axisData.margin) - config.sizeChart.width; // TODO improve this ridiculous calculation
				}
	
				var yGrid = d3.svg.axis()
					.scale(axisData.scale)
					.orient("left")
					.tickSize(size, 0, 0)
					.ticks(yTicks)
					.tickFormat("");
	
				root.append("g")
					.attr("class", "yGrid yGrid" + axisData.type)
					.attr("transform", "translate(" + (size + position) + ", 0)")
					.style("fill", color)
					.style("stroke", color)
					.style("visibility", "hidden")
					.call(yGrid);
			}
		}

		function Axis(){
			this.type;
			this.label;
			this.unit;
			this.scale;
			this.orientation;
			this.margin;
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
	}

/*
 * public objects of the "vis" namespace
 */
	return{
		createChart: createChart,
		p: p
	}
})();