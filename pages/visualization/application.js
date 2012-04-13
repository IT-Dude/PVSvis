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
				chart.addSeries(json.series[i]);
			}
			chart.visualize();
		});
		
		
		// clear chart
		setTimeout(function(){
			chart = vis.createChart(chart);
		}, 3000);
		
		// fill chart again
		setTimeout(function(){
			d3.json("chart-data.json", function(json){
				for(var i = 0; i < json.series.length; i++){
					chart.addSeries(json.series[i]);
				}
				chart.visualize();
			});
		}, 6000);
		
		
/////////////////
// end of example
/////////////////
		
	}

	return{
		setUp: setUp
	}
})();