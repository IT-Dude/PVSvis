var data = [0, 0, 0, 0, 30, 50, 60, 60, 30, 80, 90, 90, 40, 100, 70, 70, 100, 80, 70, 50, 50, 20, 0, 0, 20, 50, 60, 70, 100, 80]

function setUp(){
	d3.select("body")
		.style("background-color", d3.rgb(20, 20, 20));

	var svg = d3.select("#chart")
		.append("svg:svg")
			.attr("class", "chart")
			.attr("width", 800)
			.attr("height", 800);
	
	svg.append("svg:rect")
		.attr("fill", d3.rgb(100, 100, 100))
		.attr("width", 400)
		.attr("height", 400);
	
	svg.append("svg:text")
		.attr("text-anchor", "middle")
		.attr("fill", d3.rgb(255, 255, 255))
		.attr("x", 100)
		.attr("y", 100)
		.text("test");
	

}
// colors: 103, 0, 31; 178, 24, 43; 214, 96, 77; 244, 165, 130; 253, 219, 199; 224, 224, 224; 186, 186, 186; 135, 135, 135; 77, 77, 77; 26, 26, 26; 