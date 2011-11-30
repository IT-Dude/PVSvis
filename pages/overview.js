const months = 5;
const days = 15;
const randomRange = 0.1;

var dataSet = new Array(months);
generateSampleData();

function generateSampleData(){
	for(var i = 0; i < months; i++){
		var randomPivot = Math.random();
		var monthDataSet = new Array(days);
		
		for(var j = 0; j < days; j++){
			var min = randomPivot - randomRange;
			var max = randomPivot + randomRange;
			
			var value = min + (Math.random() * (max - min));
			value *= 100;
			
			monthDataSet.push(value);			
		}
		
		dataSet[i] = monthDataSet;
	}
	
	console.log(dataSet);
}

function setUpOverview(){
	
}