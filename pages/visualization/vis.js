var vis = (function(){
	
	
	function visualize(){
		var visualization = new Visualization();
		var diagram = new Diagram();
		var selection = new Selection(visualization.data ,diagram);
	}
	
/*
 * Visualization object
 */
	function Visualization(){
		const MONTHS = 1;
		const DAYS_ = 10; // TODO: rename this to DAYS
		const MEASUREMENTS = 20;
		
		const VALUE_MAX = 10;
		const VALUE_RANGE = 2;
		
		this.data = [];
		setUpData();		
		
		function setUpData() {
			for(var i = 0; i < MONTHS; i++){
				var month = [];
				for(var j = 0; j < DAYS_; j++){
					var day = [];
					for(var k = 0; k < MEASUREMENTS; k++){
					}
				}
			}
		}
	}
	
/*
 * Selection object
 */	
	function Selection(data, diagram){
		const SELECTION_HEIGHT = 300;
		const SELECTION_WIDTH = 400;
		
		this.data = data;
		this.diagram = diagram;
		this.root = d3.select("#selection").append("svg:svg")
						.attr("height", SELECTION_HEIGHT)
						.attr("width", SELECTION_WIDTH)
							.append("svg:rect")
							.attr("class", "selectionBackground")
							.attr("height", SELECTION_HEIGHT)
							.attr("width", SELECTION_WIDTH);
							//.on("click", function(data){this.diagram.render(data);}.bind(this, this.data));		
		//onMouseover: diagram.render(WHOLE BUNCH OF ARGUMENTS);
	}

/*
 * Diagram object
 */
	function Diagram(){
		const DIAGRAM_HEIGHT = 300;
		const DIAGRAM_WIDTH = 400;
		
		this.root = d3.select("#diagram").append("svg:svg")
						.attr("height", DIAGRAM_HEIGHT)
						.attr("width", DIAGRAM_WIDTH)
							.append("svg:rect")
							.attr("class", "diagramBackground")
							.attr("height", DIAGRAM_HEIGHT)
							.attr("width", DIAGRAM_WIDTH);
		
		
		//this.render = function(data){
		//	alert("I am rendering: " + data);
		//}	
	}









/*
 * 
 * 
 * overview
 * 
 * 
 */

	var overview = (function(){		
		function setUpOverview(){
			const MONTH_RECT_PADDING = 5;
			const MONTH_RECT_HEIGHT = 20;
			// add a root element
			var overviewRoot = visualizationRoot.append("svg:g");
			
			// add a background
			overviewRoot.append("svg:rect")
				.attr("fill", d3.rgb(200, 200, 200))
				.attr("width", VISUALIZATION_WIDTH / 2)
				.attr("height", VISUALIZATION_HEIGHT);
			
			overviewRoot.selectAll("monthRects")
				.data(dataSet)
				.enter().append("svg:rect")
					.attr("class", "monthRect")
					.attr("width", (VISUALIZATION_WIDTH / 2) - (2* MONTH_RECT_PADDING))
					.attr("height", MONTH_RECT_HEIGHT)
					.attr("x", MONTH_RECT_PADDING)
					.attr("y", function(d, i){
						return i * (MONTH_RECT_HEIGHT + MONTH_RECT_PADDING) + MONTH_RECT_PADDING;
					})
					.on("mouseover", function(d, i){
						chart.setUpChart(dataSet[i]);
					});
		}
		
		// public stuff of the "overview" namespace
		return{
			setUpOverview: setUpOverview
		}
	})();

/*
 * 
 * 
 * chart
 * 
 * 
 */	
	var chart = (function(){		
		function setUpChart(inputData){
			const PLACEHOLDER = 50;
			const GRAPH_WIDTH = VISUALIZATION_WIDTH / 2 - PLACEHOLDER;
			const GRAPH_HEIGHT = VISUALIZATION_HEIGHT - PLACEHOLDER;
			
			const DATA_SIZE = 100;
			
			// var data = [];
			// for(var i = 0; i < DATA_SIZE; i++){
			// 	data.push(Math.random() * 100);
			// }
			
			var data = inputData;
			
			y = d3.scale.linear()
					.domain([0, d3.max(data)])
					.range([0, GRAPH_HEIGHT]);
			x = d3.scale.linear()
					.domain([0, data.length])
					.range([0, GRAPH_WIDTH]);
					
			// add a root element
			var chartRoot = visualizationRoot
								.append("svg:g")
								.attr("transform", "translate(" + (VISUALIZATION_WIDTH / 2) + ", 0)");
			
			// add a background
			chartRoot.append("svg:rect")
				.attr("fill", d3.rgb(100, 100, 100))
				.attr("width", VISUALIZATION_WIDTH / 2)
				.attr("height", VISUALIZATION_HEIGHT);
			
			// add a root element for the visualization itself
			graphRoot = chartRoot.append("svg:g")
								.attr("transform", "translate(" + PLACEHOLDER + ", " + (-PLACEHOLDER) + ")");
			
			// add a group for the graph itself, change the coordinate system origin to the lower left corner
			var graphGroup = graphRoot.append("svg:g")
							.attr("class", "graph")
							.attr("transform", "translate( 0, " + GRAPH_HEIGHT +  ") scale(1, -1)");
		
			// add the graph
			var graph = d3.svg.line()
							.x(function(d, i){return x(i)})
							.y(function(d, i){return y(d)});			
			graphGroup.append("svg:path").attr("d", graph(data));
			
			// add an overlay
			var overlayGroup = graphGroup.append("svg:g");
			
			var overlay = overlayGroup.append("svg:rect")
				.attr("width", GRAPH_WIDTH)
				.attr("height", GRAPH_HEIGHT)
				.attr("fill", d3.rgb(0, 255, 0))
				.attr("fill-opacity", 0.2)
				.on("click", function(){
					overlayGroup.selectAll(".ruler").remove();
					var position = d3.svg.mouse(this);
					overlayGroup.append("svg:line")
									.attr("class", "ruler")
									.attr("stroke", d3.rgb(0, 0, 255))
									.attr("x1", position[0])
									.attr("y1", 0)
									.attr("x2", position[0])
									.attr("y2", 200);
				});
		}
		
		// public stuff of the "chart" namespace
		return{
			setUpChart: setUpChart
		}
	})();

/*
 * 
 * 
 * vis
 * 
 * 
 */	
	const DAYS = 10;
	const HOURS = 24;
	const RANDOM_RANGE = 0.1;
	
	var dataSet = [];
	generateSampleData();
	
	var visualizationRoot;
	
	function generateSampleData(){
		for(var i = 0; i < DAYS; i++){
			var randomPivot = Math.random();
			var daysDataSet = [];
			
			for(var j = 0; j < HOURS; j++){
				var min = randomPivot - RANDOM_RANGE;
				var max = randomPivot + RANDOM_RANGE;
				
				var value = min + (Math.random() * (max - min));
				value *= 100;
				
				daysDataSet.push(value);			
			}
			
			dataSet.push(daysDataSet);
		}
		
		console.log(dataSet);
	}
	
	const VISUALIZATION_WIDTH = 1000;
	const VISUALIZATION_HEIGHT = 50;
	
	function setUpVisualization(){
		d3.select("body")
			.style("background-color", d3.rgb(50, 50, 50));
	
		visualizationRoot = d3.select("#OLD")
								.append("svg:svg")
									.attr("class", "chart")
									.attr("width", VISUALIZATION_WIDTH)
									.attr("height", VISUALIZATION_HEIGHT);
	}
	
	function setUp(){
		setUpVisualization();
		overview.setUpOverview();
		visualize();
	}

	// public stuff of the "vis" namespace
	return{
		setUp: setUp,
		VISUALIZATION_HEIGHT : VISUALIZATION_HEIGHT
	}
})();