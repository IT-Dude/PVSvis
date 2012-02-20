var vis = (function(){
	const I_MONTHS = 4;
	const I_DAYS = 15;
	const I_MEASUREMENTS = 10;
	const VALUE_MAX = 10;
	const VALUE_RANGE = 2;
	
	updateConstants();
	function updateConstants(){
		MONTHS = getTangleValue("MONTHS");
		DAYS = getTangleValue("DAYS");
		MEASUREMENTS = getTangleValue("MEASUREMENTS");
	}
	
	function getTangleValue(variable){
		if(typeof inputTangle === "undefined"){
			return eval("I_" + variable);
		}
		else{
			return inputTangle.getValue("tangle" + variable);
		}
	}
	
	var inputTangle;
	function setUpTangle(){
		inputTangle = new Tangle(document.getElementById("inputTangle"), {
			initialize: function(){
				this.tangleMONTHS = I_MONTHS;
				this.tangleDAYS = I_DAYS;
				this.tangleMEASUREMENTS = I_MEASUREMENTS;
			},
			update: function(){
				// TODO remove elements via DOM, removeChildren()
				document.getElementById("selection").innerHTML = "";
				document.getElementById("diagram").innerHTML = "";
				updateConstants();
				visualize();
			}
		});
	}

	function visualize(){
		var visualization = new Visualization();
		var diagram = new Diagram();
		var selection = new Selection(visualization.data ,diagram);
	}
	
/*
 * Visualization object
 */
	function Visualization(){
		var self = this;
		
		this.data = setUpData();
		//console.log(this.data);
		
		function setUpData() {
			data = [];
			for(var i = 0; i < MONTHS; i++){
				var month = [];
				for(var j = 0; j < DAYS; j++){
					var day = [];
					var pivot = Math.random();
					pivot = pivot * VALUE_MAX;
					
					if(pivot > (VALUE_MAX - VALUE_RANGE)){
						pivot = VALUE_MAX - VALUE_RANGE;
					}
					
					for(var k = 0; k < MEASUREMENTS; k++){
						day.push(pivot + Math.random() * VALUE_RANGE)
					}
					
					month.push(day)
				}
				data.push(month);
			}
			return data;
		}
	}
	
/*
 * Selection object
 */	
	function Selection(data, diagram){
		var self = this;
		var selectionRoot;
		
		const SELECTION_HEIGHT = 300;
		const SELECTION_WIDTH = 400;
		const MONTH_SELECTOR_HEIGHT = 50;
		const DAY_SELECTOR_SIZE = 40;
		const DAY_SELECTOR_PADDING = 10;
		const PREVIEW_HEIGHT = 100;
		const PREVIEW_WIDTH = 100;
		
		this.data = data;
		this.diagram = diagram;
		
		//var fill = d3.scale.category20();
		
		var monthFill = d3.scale.linear()
			.domain([0, MONTHS - 1])
			.range(["green", "blue"]);
		
		var dayFill = d3.scale.linear()
			.domain([0, DAYS - 1])
			.range(["yellow", "red"]);
		
		var dayFillNew = d3.scale.linear()
			.domain([0, VALUE_MAX])
			.range(["white", "red"]);
		
		this.calculateDayColor = function(d){
			var sum = 0;
			for(var i = 0; i< d.length; i++){
				sum = sum + d[i];
			}
			
			var average = sum / d.length;
			return dayFillNew(average);
		}
		
		this.showMonthSelection = function(selectedMonth){
			selectionRoot.selectAll("#dayContainer").remove();
			selectionRoot.append("svg:rect")
							.attr("class", "dayContainer")
							.attr("fill", function(d, i){return monthFill(selectedMonth)})
							.attr("width", SELECTION_WIDTH)
							.attr("height", SELECTION_HEIGHT - MONTH_SELECTOR_HEIGHT)
							.attr("transform", "translate(0, " + MONTH_SELECTOR_HEIGHT + ")");
			
			var daySelectors = selectionRoot.selectAll("#daySelector").data(self.data[selectedMonth]).enter()
									.append("svg:rect")
									.attr("class", "daySelector")
									.attr("fill", function(d, i){return self.calculateDayColor(d)})
									.attr("width", DAY_SELECTOR_SIZE)
									.attr("height", DAY_SELECTOR_SIZE)
									.attr("transform", function(d, i){
											// TODO do some math here! simplify things?
											var itemsPerRow = Math.floor(SELECTION_WIDTH / (DAY_SELECTOR_SIZE + DAY_SELECTOR_PADDING));
											var paddingLeft = (SELECTION_WIDTH + DAY_SELECTOR_PADDING - itemsPerRow * (DAY_SELECTOR_SIZE + DAY_SELECTOR_PADDING)) / 2;
											var row = 0;
											
											for(var j = 0; j < i; j++){
												if((i * (DAY_SELECTOR_SIZE + DAY_SELECTOR_PADDING) - (row * SELECTION_WIDTH)) >= SELECTION_WIDTH){
													row = row + 1;
												}
											}
											
											var transX = paddingLeft + (i % itemsPerRow) * (DAY_SELECTOR_SIZE + DAY_SELECTOR_PADDING);
											var transY = MONTH_SELECTOR_HEIGHT + DAY_SELECTOR_PADDING + row * (DAY_SELECTOR_SIZE + DAY_SELECTOR_PADDING);
											return "translate(" + transX + ", "+ transY + ")";
										}
									)
									.on("mouseover", function(d, i){showPreview(self.data, selectedMonth, i);})
									.on("mouseout", function(){
											// TODO destroy the preview
										}
									);
		}
		
		function showPreview(data, selectedMonth, day){
			
		}

		function setUpSelection(){
			this.root = d3.select("#selection").append("svg:svg")
						.attr("height", SELECTION_HEIGHT)
						.attr("width", SELECTION_WIDTH);
						
			this.root.append("svg:rect")
							.attr("class", "selectionBackground")
							.attr("height", SELECTION_HEIGHT)
							.attr("width", SELECTION_WIDTH);
							//.on("click", function(data){this.diagram.render(data);}.bind(this, this.data));		
							//onMouseover: diagram.render(WHOLE BUNCH OF ARGUMENTS); // small PREVIEW
			
			selectionRoot = this.root.append("svg:g");
			
			
			var monthSelectors = selectionRoot.selectAll("#monthSelector").data(self.data).enter()
									.append("svg:rect")
									.attr("class", "monthSelector")
									.attr("fill", function(d, i){return monthFill(i)})
									.attr("width", SELECTION_WIDTH / self.data.length)
									.attr("height", MONTH_SELECTOR_HEIGHT)
									.attr("transform", function(d, i){
											return "translate(" + (i * (SELECTION_WIDTH / self.data.length))+ ", 0)";
										}
									)
									.on("click", function(d, i){self.showMonthSelection(i)});
		}
		
		setUpSelection();
		this.showMonthSelection(0);
		diagram.render(this.data[0]);
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
		
		var x = d3.scale.linear()
				.domain([0, MEASUREMENTS - 1])
				.range([0, DIAGRAM_WIDTH - PADDING_LEFT - PADDING_RIGHT]);
		var y = d3.scale.linear()
				.domain([0, VALUE_MAX])
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
			var yAxis = d3.svg.axis()
							.scale(y)
							.tickSize(6, 4, 2)
							.ticks(VALUE_MAX)
							.orient("left");

			axisRoot.append("svg:g")
				.attr("id", "yAxis")
				.attr("class", "axis")
				.call(yAxis);
			
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
				.attr("transform", "translate(0," + (DIAGRAM_HEIGHT - PADDING_TOP - PADDING_BOTTOM)+ ")")
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
						d3.select(this).style("stroke", d3.rgb(0, 0, 0));
					}
				)
				.on("mouseout", function(){
						d3.select(this).style("stroke", function(d, i){return stroke(d);});
					}
				);
		}
	}





/*
 * public stuff of the "vis" namespace
 */
	return{
		setUpTangle: setUpTangle,
		visualize: visualize
	}
})();