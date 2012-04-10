var application = (function(){
	var chart;	
	var config = {
		"root" : "#chart",
		"height" : 300,
		"width" : 500
	};
	
	function setUp(){
		chart = vis.createChart(config);
		doSomething();
	}

	function doSomething(){
	}

	return{
		setUp: setUp
	}
})();