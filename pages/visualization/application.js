var application = (function(){
	var chart;	
	var config = {
		"title" : "Chart!",
		"root" : "#chart",
		"height" : 500,
		"width" : 900
	};
	
	function setUp(){
		d3.json("chart-data.json", function(json){
			chart = vis.createChart(config);
			//chart.addData(json); // deprecated!
			for(var i = 0; i < 2; i++){
				chart.addSeries(json.series[i]);
			}
			chart.visualize();
			
			chart.addSeries(json.series[2]);
			chart.addSeries(json.series[3]);
			chart.visualize();
		});
		doSomething();
	}

	function doSomething(){
	}

	return{
		setUp: setUp
	}
})();