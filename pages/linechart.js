const chartHeight= 600;
const chartWidth = 800;
const placeholder = 100;

const dataSize = 10;
var data = [];
for(var i = 0; i < dataSize; i++){
	data.push(Math.random() * 100);
}

y = d3.scale.linear()
		.domain([0, d3.max(data)])
		.range([0 + placeholder, chartHeight - placeholder]);
x = d3.scale.linear()
		.domain([0, data.length])
		.range([0 + placeholder, chartWidth - placeholder]);

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
	
	var graph = d3.svg.line()
					.x(function(d, i){return x(i)})
					.y(function(d, i){return y(d) * -1});

	var group = svg.append("svg:g")
					.attr("class", "graph")
					.attr("transform", "translate(0, 500)"); //TODO replace 500 by chartHeigt
	
	group.append("svg:path").attr("d", graph(data));
}

// colors: 103, 0, 31; 178, 24, 43; 214, 96, 77; 244, 165, 130; 253, 219, 199; 224, 224, 224; 186, 186, 186; 135, 135, 135; 77, 77, 77; 26, 26, 26; 