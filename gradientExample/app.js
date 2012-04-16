var namespace = (function(){
	function setUp(){
		// generate some test data
		var data = [];
		var numDataPoints = 10;
		var dataMax = 10;
		var PI = 3.14;
		for(var i = 0; i < numDataPoints; i++){
			data.push(Math.sin(PI/numDataPoints) * dataMax);
		}
		
		
	}
	
	function p(s){
		console.log(s);
	}
	
	return{
		setUp: setUp
	}
})();