var dataSize = 10;
var data = [];
for(var i = 0; i < dataSize; i++){
	data.push(Math.random() * 100);
}

const chartWidth = 800;
const chartHeight= 600;

function setUp(){
	d3.select("body")
		.style("background-color", d3.rgb(50, 50, 50));

	var svg = d3.select("#chart")
		.append("svg:svg")
			.attr("class", "chart")
			.attr("width", chartWidth)
			.attr("height", chartHeight);
	
	svg.append("svg:rect")
		.attr("fill", d3.rgb(100, 100, 100))
		.attr("width", svg.attr("width"))
		.attr("height", svg.attr("height"));
	
	svg.selectAll("circle")
		.data(data)
		.enter().append("svg:circle")
			.attr("class", "little")
			.attr("cx", function(d){return 3 * d;})
			.attr("cy", function(){return Math.random() * 200;})
			.attr("r", 20);
}
// colors: 103, 0, 31; 178, 24, 43; 214, 96, 77; 244, 165, 130; 253, 219, 199; 224, 224, 224; 186, 186, 186; 135, 135, 135; 77, 77, 77; 26, 26, 26; 