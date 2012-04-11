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
			chart.addData(json);
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