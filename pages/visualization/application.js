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
			vis.p(json);
			for(var i = 0; i < json.series.length - 1; i++){
				chart.addSeries(json.series[i]);
				chart.visualize();
			}
			
			setTimeout(function(){
				chart.addSeries(json.series[json.series.length - 1]);
				chart.visualize();
			}, 1000);
		});
		doSomething();
	}

	function doSomething(){
	}

	return{
		setUp: setUp
	}
})();