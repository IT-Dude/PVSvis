var data = [0, 0, 0, 0, 30, 50, 60, 60, 30, 80, 90, 90, 40, 100, 70, 70, 100, 80, 70, 50, 50, 20, 0, 0, 20, 50, 60, 70, 100, 80]

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
			.attr("cx", function(d) {return 3 * d;})
			.attr("cy", 100)
			.attr("r", 20);
}
// colors: 103, 0, 31; 178, 24, 43; 214, 96, 77; 244, 165, 130; 253, 219, 199; 224, 224, 224; 186, 186, 186; 135, 135, 135; 77, 77, 77; 26, 26, 26; 