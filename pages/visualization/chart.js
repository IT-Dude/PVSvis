var application = (function(){
	var chart;	
	var config = {
		"title" : "Chart!",
		"root" : "#chart",
		"height" : 500,
		"width" : 900
	};
	
	function setUp(){
		chart = vis.createChart(config);
		d3.json("chart-data.json", function(json){
			chart.data(json);
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