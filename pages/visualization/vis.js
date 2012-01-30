var vis = (function(){
	const MEASUREMENTS = 20;
	const VALUE_MAX = 10;
	
	function visualize(){
		var visualization = new Visualization();
		var diagram = new Diagram();
		var selection = new Selection(visualization.data ,diagram);
	}
	
/*
 * Visualization object
 */
	function Visualization(){
		var self = this;
		
		const MONTHS = 1;
		const DAYS_ = 10; // TODO: rename this to DAYS
		
		
		
		const VALUE_RANGE = 2;
		
		this.data = setUpData();
		//console.log(this.data);
		
		function setUpData() {
			data = [];
			for(var i = 0; i < MONTHS; i++){
				var month = [];
				for(var j = 0; j < DAYS_; j++){
					var day = [];
					var pivot = Math.random();
					pivot = pivot * VALUE_MAX;
					
					if(pivot > (VALUE_MAX - VALUE_RANGE)){
						pivot = VALUE_MAX - VALUE_RANGE;
					}
					
					for(var k = 0; k < MEASUREMENTS; k++){
						day.push(pivot + Math.random() * VALUE_RANGE)
					}
					
					month.push(day)
				}
				data.push(month);
			}
			return data;
		}
	}
	
/*
 * Selection object
 */	
	function Selection(data, diagram){
		var self = this;
		
		const SELECTION_HEIGHT = 300;
		const SELECTION_WIDTH = 400;
		
		this.data = data;
		this.diagram = diagram;
		this.root = d3.select("#selection").append("svg:svg")
						.attr("height", SELECTION_HEIGHT)
						.attr("width", SELECTION_WIDTH)
							.append("svg:rect")
							.attr("class", "selectionBackground")
							.attr("height", SELECTION_HEIGHT)
							.attr("width", SELECTION_WIDTH);
							//.on("click", function(data){this.diagram.render(data);}.bind(this, this.data));		
		//onMouseover: diagram.render(WHOLE BUNCH OF ARGUMENTS);
		
		diagram.render(this.data[0]);
	}

/*
 * Diagram object
 */
	function Diagram(){
		var self = this;
		var chartRoot;
		
		const DIAGRAM_HEIGHT = 600;
		const DIAGRAM_WIDTH = 1000;
		const PADDING_TOP = 10;
		const PADDING_BOTTOM = 80;
		const PADDING_LEFT = 80;
		const PADDING_RIGHT = 100;
		
		setUpDiagram();
		
		function setUpDiagram(){
			this.root = d3.select("#diagram").append("svg:svg")
							.attr("height", DIAGRAM_HEIGHT)
							.attr("width", DIAGRAM_WIDTH);
					
			this.root.append("svg:rect")
						.attr("class", "diagramBackground")
						.attr("height", DIAGRAM_HEIGHT)
						.attr("width", DIAGRAM_WIDTH);
			
			chartRoot = this.root.append("svg:g")
			chartRoot.attr("transform", "translate("+ PADDING_LEFT +", " + (DIAGRAM_HEIGHT - PADDING_BOTTOM) +  ") scale(1, -1)");
			
			chartRoot.append("svg:rect")
					.attr("fill-opacity", 0.0)
					.attr("stroke", d3.rgb(0, 0, 200))
					.attr("width", DIAGRAM_WIDTH - PADDING_LEFT - PADDING_RIGHT)
					.attr("height", DIAGRAM_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
		}
		
		x = d3.scale.linear()
				.domain([0, MEASUREMENTS - 1]) // TODO investigate this!!! why -1???
				.range([0, DIAGRAM_WIDTH - PADDING_LEFT - PADDING_RIGHT]);
		y = d3.scale.linear()
				.domain([0, VALUE_MAX])
				.range([0, DIAGRAM_HEIGHT - PADDING_TOP - PADDING_BOTTOM]);
		
		this.render = function(data){
			chartRoot.selectAll(".dataGraph").remove();
			
			for(var i = 0; i < data.length; i++){
				//console.log(data[i]);
				chartRoot.selectAll(".dataGraph").data(data).enter()
					.append("svg:path")
					.attr("class", "dataGraph")
					.attr("d", d3.svg.line()
						.x(function(d, i){return x(i)})
						.y(function(d, i){return y(d)})
						.interpolate("basis")
					)
					.on("mouseover", function(){
							d3.select(this).attr("class", "dataGraph dataGraphHighlight");
						}
					)
					.on("mouseout", function(){
							d3.select(this).attr("class", "dataGraph");
						}
					);
			}
		}	
	}

	// public stuff of the "vis" namespace
	return{
		visualize: visualize,
	}
})();