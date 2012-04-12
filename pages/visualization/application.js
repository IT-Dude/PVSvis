var application = (function(){
	function setUp(){
		
		// example for API usage
		var chart;	
		var config = {
			"title" : "Awesome chart",
			"root" : "#chart",
			"height" : 500,
			"width" : 900
		};
	
		d3.json("chart-data.json", function(json){
			chart = vis.createChart(config);
			for(var i = 0; i < json.series.length; i++){
				chart.addSeries(json.series[i]);
			}
			chart.visualize();
		});
		// end of example
		
	}

	return{
		setUp: setUp
	}
})();