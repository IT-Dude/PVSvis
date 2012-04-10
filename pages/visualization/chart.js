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
		doSomething();
	}

	function doSomething(){
	}

	return{
		setUp: setUp
	}
})();