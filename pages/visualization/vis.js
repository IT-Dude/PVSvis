var vis = (function(){
	const MEASUREMENTS = 20;
	const MONTHS = 3;
	const DAYS = 10;
	const VALUE_MAX = 10;
	const VALUE_RANGE = 2;
	
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
		
		this.data = data;
		this.diagram = diagram;
		
		setUpSelection();
		diagram.render(this.data[0]);
		
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
			
			var fill = d3.scale.category20();
			var monthSelectors = selectionRoot.selectAll("#monthSelectors").data(self.data).enter()
									.append("svg:rect")
									.attr("fill", function(d, i){return fill(i)})
									.attr("width", SELECTION_WIDTH / self.data.length)
									.attr("height", MONTH_SELECTOR_HEIGHT)
									.attr("transform", function(d, i){
											return "translate(" + (i * (SELECTION_WIDTH / self.data.length))+ ", 0)";
										}
									)
									.on("click", function(d, i){alert(i)});
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
		
		var x = d3.scale.linear()
				.domain([0, MEASUREMENTS - 1])
				.range([0, DIAGRAM_WIDTH - PADDING_LEFT - PADDING_RIGHT]);
		var y = d3.scale.linear()
				.domain([0, VALUE_MAX])
				.range([0, DIAGRAM_HEIGHT - PADDING_TOP - PADDING_BOTTOM]);
		
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
			chartRoot.attr("transform", "translate("+ PADDING_LEFT +", " + (DIAGRAM_HEIGHT - PADDING_BOTTOM) +  ") scale(1, -1)");
			
			chartRoot.append("svg:rect")
					.attr("fill-opacity", 0.0)
					.attr("stroke", d3.rgb(0, 0, 200))
					.attr("width", DIAGRAM_WIDTH - PADDING_LEFT - PADDING_RIGHT)
					.attr("height", DIAGRAM_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
			
			
			// axes
			var axisRoot = this.root.append("svg:g");
			axisRoot.attr("transform", "translate(" + PADDING_LEFT + ", " + (PADDING_BOTTOM) + ")");
			
			// y-axis
			var yAxis = d3.svg.axis()
							.scale(y)
							.tickSize(5)
							.ticks(10)
							.orient("left");

			axisRoot.append("svg:g")
				.attr("id", "yAxis")
				.attr("class", "axis")
				.call(yAxis);
			
			// x-axis
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
		visualize: visualize,
	}
})();