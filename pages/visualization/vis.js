var vis = (function(){

/*
 * 
 * 
 * overview
 * 
 * 
 */

	var overview = (function(){		
		function setUpOverview(){
			
		}
		
		// public stuff of the "overview" namespace
		return{
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
		function setUpChart(){
			const PLACEHOLDER = 50;
			const GRAPH_WIDTH = VISUALIZATION_WIDTH / 2 - PLACEHOLDER;
			const GRAPH_HEIGHT = VISUALIZATION_HEIGHT - PLACEHOLDER;
			
			const DATA_SIZE = 100;
			
			var data = [];
			for(var i = 0; i < DATA_SIZE; i++){
				data.push(Math.random() * 100);
			}
			
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
	const DAYS = 30;
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
	const VISUALIZATION_HEIGHT = 500;
	
	function setUpVisualization(){
		d3.select("body")
			.style("background-color", d3.rgb(50, 50, 50));
	
		visualizationRoot = d3.select("#visualization")
								.append("svg:svg")
									.attr("class", "chart")
									.attr("width", VISUALIZATION_WIDTH)
									.attr("height", VISUALIZATION_HEIGHT);
	}
	
	function setUp(){
		setUpVisualization();
		chart.setUpChart();
	}

	// public stuff of the "vis" namespace
	return{
		setUp: setUp,
		VISUALIZATION_HEIGHT : VISUALIZATION_HEIGHT
	}
})();