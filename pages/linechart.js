// colors: 103, 0, 31; 178, 24, 43; 214, 96, 77; 244, 165, 130; 253, 219, 199; 224, 224, 224; 186, 186, 186; 135, 135, 135; 77, 77, 77; 26, 26, 26; 

const chartHeight= 600;
const chartWidth = 800;
const placeholder = 100;

const dataSize = 100;
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
	// set up some basics
	d3.select("body")
		.style("background-color", d3.rgb(50, 50, 50));

	var svg = d3.select("#chart")
		.append("svg:svg")
			.attr("class", "chart")
			.attr("width", chartWidth)
			.attr("height", chartHeight);
	
	// add a background
	svg.append("svg:rect")
		.attr("fill", d3.rgb(100, 100, 100))
		.attr("width", svg.attr("width"))
		.attr("height", svg.attr("height"));
	
	// add a graph
	var graph = d3.svg.line()
					.x(function(d, i){return x(i)})
					.y(function(d, i){return y(d) * -1});

	var group = svg.append("svg:g")
					.attr("class", "graph")
					.attr("transform", "translate(0, 500)"); //TODO replace 500 by chartHeigt
	
	group.append("svg:path").attr("d", graph(data));
	
	// add the axes
	group.append("svg:line")
		.attr("class", "axis")
		.attr("x1", x(0))
		.attr("y1", -1 * y(0))
		.attr("x2", x(chartWidth))
		.attr("y2", -1 * y(0));
	
	group.append("svg:line")
		.attr("class", "axis")
		.attr("x1", x(0))
		.attr("y1", -1 * y(0))
		.attr("x2", x(0))
		.attr("y2", -1 * y(chartHeight)); //TODO use the data maximum
	
	// add axis ticks
	group.selectAll("ticksX")
		.data(x.ticks(10))
		.enter().append("svg:line")
			.attr("class", "tick")
			.attr("x1", function(d) { return x(d); })
			.attr("y1", -1 * y(0))
			.attr("x2", function(d) { return x(d); })
			.attr("y2", -1 * y(-1));
}