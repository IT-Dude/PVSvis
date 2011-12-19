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
		
		
		const chartHeight = 600;
		const chartWidth = 800;
		const PLACEHOLDER = 100;
		
		const dataSize = 200;
		const tickDistance = 10;
		
		var data = [];
		for(var i = 0; i < dataSize; i++){
			data.push(Math.random() * 100);
		}
		
		y = d3.scale.linear()
				.domain([0, d3.max(data)])
				.range([0 + PLACEHOLDER, chartHeight - PLACEHOLDER]);
		x = d3.scale.linear()
				.domain([0, data.length])
				.range([0 + PLACEHOLDER, chartWidth - PLACEHOLDER]);
		
		function setUpChart(){
			// set up some basics
			var chartRoot = visualizationRoot
								.append("svg:g")
								.attr("transform", "translate(" + (VISUALIZATION_WIDTH / 2) + ", 0)");
			
			// add a background
			chartRoot.append("svg:rect")
				.attr("fill", d3.rgb(100, 100, 100))
				.attr("width", VISUALIZATION_WIDTH / 2)
				.attr("height", VISUALIZATION_HEIGHT);
			
		
			// add a gropu to make translations easier
			var group = chartRoot.append("svg:g")
							.attr("class", "graph")
							.attr("transform", "translate(0, 500)"); //TODO replace 500 by chartHeigt
		
			// add a graph
			var graph = d3.svg.line()
							.x(function(d, i){return x(i)})
							.y(function(d, i){return y(d) * -1});
			
			//graph.interpolate("basis"); // step-before
			
			group.append("svg:path").attr("d", graph(data));
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
	const VISUALIZATION_HEIGHT = 800;
	
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