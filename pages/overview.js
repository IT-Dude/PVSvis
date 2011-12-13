const days = 30;
const hours = 24;
const randomRange = 0.1;

var dataSet = [];
generateSampleData();

function generateSampleData(){
	for(var i = 0; i < days; i++){
		var randomPivot = Math.random();
		var daysDataSet = [];
		
		for(var j = 0; j < hours; j++){
			var min = randomPivot - randomRange;
			var max = randomPivot + randomRange;
			
			var value = min + (Math.random() * (max - min));
			value *= 100;
			
			daysDataSet.push(value);			
		}
		
		dataSet.push(daysDataSet);
	}
	
	console.log(dataSet);
}

function setUpOverview(){
	
}