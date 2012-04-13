var application = (function(){
	function setUp(){
		
////////////////////////
// example for API usage
////////////////////////
		var chart;	
		var config = {
			"title" : "Awesome chart",
			"root" : "#chart",
			"height" : 500,
			"width" : 900
		};
		
		// create initial chart, fill with data
		d3.json("chart-data.json", function(json){
			vis.p(json);
			chart = vis.createChart(config);
			for(var i = 0; i < json.series.length; i++){
				chart.addSeries(json.series[i]); // addSeries will become deprecated after DataManager implementation
			}
			chart.visualize();
			loadingFinished();
		});
		
		function loadingFinished(){
			// clear chart
			// chart = vis.createChart(chart);
			
			var manager = chart.getDataManager();
			manager.setMaximumDataPoints();			
		}
		
/////////////////
// end of example
/////////////////
		
	}

	return{
		setUp: setUp
	}
})();