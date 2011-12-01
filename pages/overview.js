const months = 5;
const days = 15;
const randomRange = 0.1;

var dataSet = [];
generateSampleData();

function generateSampleData(){
	for(var i = 0; i < months; i++){
		var randomPivot = Math.random();
		var monthDataSet = [];
		
		for(var j = 0; j < days; j++){
			var min = randomPivot - randomRange;
			var max = randomPivot + randomRange;
			
			var value = min + (Math.random() * (max - min));
			value *= 100;
			
			monthDataSet.push(value);			
		}
		
		dataSet.push(monthDataSet);
	}
	
	console.log(dataSet);
}

function setUpOverview(){
	
}