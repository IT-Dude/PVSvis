var application = (function(){
	function setUp(){
		var chart;	
		var config = {
			"title" : "Awesome chart",
			"root" : "#chart",
			"height" : 500,
			"width" : 900
		};
		
		d3.json("chart-data_4.json", function(json){
			vis.p(json);
			chart = vis.createChart(config);
			for(var i = 0; i < json.series.length; i++){
				chart.addSeries(json.series[i]);
			}
			chart.visualize();
			loadingFinished();
		});
		
		function loadingFinished(){
			// clear chart
			// chart = vis.createChart(chart);		
		}		
	}

	return{
		setUp: setUp
	}
})();