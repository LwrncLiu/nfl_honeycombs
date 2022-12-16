import games from './games_2021.json' assert {type: 'json'};

// sort games by team then division
games.sort((x, y) => {
    return d3.ascending(x.team, y.team)
}).sort((x, y) => {
    return d3.ascending(x.division_index, y.division_index)
});

var hexagonRadius = 20; // half the vertical height of the hexagon
var hexagonHalfWidth = hexagonRadius * Math.sqrt(3) / 2;
var hiveMaxWidth = 10 * hexagonHalfWidth; // 5 full hexagons widths
var hiveMaxHeight = 8 * hexagonRadius; // 3 full hexagons and two half hexagons tall
var hiveXCenter = 100;
var hiveYCenter = 80;


// list divisions along side
var divisions = d3.select('.divisions');

var allDivisions = _.chain(games)
    .map('division').uniq().value();

divisions.selectAll('.divisions')
    .data(allDivisions).enter().append('h1')
    .classed('divisions', true)
    .style('margin', 0)
    .style('position', 'absolute')
    .style('width', 150 + 'px')
    .text(d => d)
    .style('top', function(d, i) {
        return hiveYCenter + i * hiveMaxHeight * 1.5 - hexagonRadius/2 + 10 + 'px';
    });


// HONEYCOMBS, ONE FOR EACH WIN A TEAM HAS IN A SEASON //
const hexagonPoints = (radius) => {
    const halfWidth = radius * Math.sqrt(3) / 2;
    return `
        0,${-radius}
        ${halfWidth},${-radius / 2}
        ${halfWidth},${radius / 2}
        0,${radius}
        ${-halfWidth},${radius / 2}
        ${-halfWidth},${-radius / 2}`;
};

const hexagonLocX = (gameNum, hiveX) => {
    const halfWidth = hexagonRadius * Math.sqrt(3) / 2;
    if ([0,11].includes(gameNum)) {
        return hiveX
    } else if ([1,10].includes(gameNum)) {
        return hiveX + (halfWidth * 2)
    } else if ([2,6].includes(gameNum)) {
        return hiveX + halfWidth
    } else if ([3,5].includes(gameNum)) {
        return hiveX - halfWidth
    } else if ([4,12,16].includes(gameNum)) {
        return hiveX - (halfWidth * 2)
    } else if ([7,9].includes(gameNum)) {
        return hiveX + (halfWidth * 3)
    } else if ([8].includes(gameNum)) {
        return hiveX + (halfWidth * 4)
    } else if ([13,15].includes(gameNum)) {
        return hiveX - (halfWidth * 3)
    } else if ([14].includes(gameNum)) {
        return hiveX - (halfWidth * 4)
    }
};

const hexagonLocY = (gameNum, hiveY) => {
    const halfHeight = hexagonRadius / 2;
    if ([0,1,4,8,14].includes(gameNum) ) {
        return hiveY
    } else if ([2,3,9,13].includes(gameNum)) {
        return hiveY - hexagonRadius - halfHeight
    } else if ([5,6,7,15].includes(gameNum)) {
        return hiveY + hexagonRadius + halfHeight
    } else if ([10,11,12].includes(gameNum)) {
        return hiveY - hexagonRadius * 3
    } else if ([16].includes(gameNum)) {
        return hiveY + hexagonRadius * 3
    }
};

// header index values
var headingXSpacing = 120;
var headingXPadding = 60;

var heading = d3.select('.svg_header')
    .append('g');

var heading_values = [
    {'value': 'Home Win'},
    {'value': 'Away Win'},
    {'value': 'Neutral Win'},
    {'value': 'Playoff Win'},
    {'value': 'Superbowl Win'}
]

var home_win = heading.append('polygon')
    .attr('points', hexagonPoints(hexagonRadius))
    .style('stroke', '#b45000')
    .style('stroke-width', '2px')
    .attr('fill', '#faf8d2')
    .attr('transform', `translate(${headingXSpacing * 0 + headingXPadding}, 30)`);

var away_win = heading.append('polygon')
    .attr('points', hexagonPoints(hexagonRadius))
    .style('stroke', '#b45000')
    .style('stroke-width', '2px')
    .attr('fill', '#f09f11')
    .attr('transform', `translate(${headingXSpacing * 1 + headingXPadding}, 30)`);

var neutral_win = heading.append('polygon')
    .attr('points', hexagonPoints(hexagonRadius))
    .style('stroke', '#b45000')
    .style('stroke-width', '2px')
    .attr('fill', '#d4af37')
    .attr('transform', `translate(${headingXSpacing * 2 + headingXPadding}, 30)`);

var playoff_win = heading.append("svg:image")
    .attr("xlink:href", "assets/bee-svgrepo-com.svg")
    .attr("transform", `translate(${headingXSpacing * 3 + headingXPadding}, 30)`)
    .attr("width", 30)
    .attr("height", 45)
    .attr("x", -30/2)
    .attr("y", -45/2)
    .raise();

var superbowl_win = heading.append("svg:image")
    .attr("xlink:href", "assets/crown-svgrepo-com.svg")
    .attr("transform", `translate(${headingXSpacing * 4 + headingXPadding}, 30)`)
    .attr("width", 40)
    .attr("height", 45)
    .attr("x", -40/2)
    .attr("y", -45/2)
    .raise();

var heading_text = heading.selectAll('heading_text')
    .data(heading_values)
    .enter()
    .append('text')
    .text(d => d.value)
    .attr('transform', (d, i) => {
        return `translate(${(i % 5) * headingXSpacing + headingXPadding}, 80)`
    })
    .attr('text-anchor', 'middle')
    .classed('heading_text', true);


// group each hive in a group
var teams = d3.select('.svg_body')
    .attr('width', () => {
        return hiveMaxWidth * 4 * 1.25
    })
    .attr('height', hiveMaxHeight * 8 * 1.5)
    .selectAll('g')
    .data(games)
    .enter()
    .append('g')
    .attr('transform', (d,i) => {
        return `translate(${(i % 4) * hiveMaxWidth * 1.25}, ${(Math.floor(i / 4) * hiveMaxHeight * 1.5) + 10})`
    });

// on mouseover show stats from that game
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var hives = teams.selectAll('games')
    .data(d => d.games)
    .enter()
    .filter(d => ['W','D'].includes(d.result)) // only draw hexagons for wins
    .append('polygon')
    .attr('points', hexagonPoints(hexagonRadius))
    .attr('transform', (d, i) => {
        let hexLocX = hexagonLocX(i, hiveXCenter);
        let hexLocY = hexagonLocY(i, hiveYCenter);
        return `translate(${hexLocX}, ${hexLocY})`
    })
    .style('stroke', '#b45000')
    .style('stroke-width', '2px')
    .attr('fill', d => {
        if (d.loc == 'A') {
            return '#f09f11'
        } else if (d.loc == 'H'){
            return '#faf8d2'
        } else if (d.loc == 'N') {
            return '#d4af37'
        };
    })
    .on('mouseover', (event, d) => {
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div.html("Week " + d['week'] + "<br/>" + d['score'] + " win <br/> vs the " + d['opp'])
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px");
        d3.select(event.currentTarget).style('stroke-width', '5px');
        d3.select(event.currentTarget).attr('points', hexagonPoints(hexagonRadius + 5))
            .raise();
    })
    .on("mouseout", function(d) {
        div.transition()
            .duration(500)
            .style("opacity", 0);
        d3.select(event.currentTarget).style('stroke-width', '2px');
        d3.select(event.currentTarget).attr('points', hexagonPoints(hexagonRadius))
            .lower();
    });

// add team name under each hive
var text = teams.append('text')
    .classed('team_text', true)
    .attr('text-anchor', 'middle')
    .attr('dy', '.35em')
    .attr("x", hiveXCenter)
    .attr("y", hexagonRadius * 8)
    .style('font-size', '1em')
    // .attr("font-family", "sans-serif")
    .attr("font-style", "italic")
    .text(d => d.team);


// BUMBLE BEE RENDERING AND MOVEMENT //

// generate a "bee" for each playoff win
var bees = teams.selectAll('bees')
    .data(d => d.games)
    .enter()
    .filter(d => 'P' == d.type && ['W'].includes(d.result))
    .append("svg:image")
    .attr("xlink:href", "assets/bee-svgrepo-com.svg")
    .attr("transform", "translate(" + [0] + ")")
    .attr("width", 30)
    .attr("height", 45)
    .attr("x", -30/2)
    .attr("y", -45/2)
    .raise();


// generate paths for bees
var generatePathData = (vertices) => {
    var pathDataSet = [];
                     
    for (var i = 0; i < 3 + vertices; i++) {            
        var x = Math.floor((Math.random()*hiveMaxWidth)+1); 
        var y = Math.floor((Math.random()*hiveMaxHeight)+1);  
        pathDataSet.push({"x":x, "y":y});
    }
    return pathDataSet;
};

var beePathLine = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveCardinalClosed);

var bee_paths = teams.selectAll('bee_paths')
    .data(d => d.games)
    .enter()
    .filter(d => 'P' == d.type && ['W'].includes(d.result))
    .append('path')
    .attr("d", (d, i) => beePathLine(generatePathData(i)))
    .attr("stroke-width", 1)
    //.attr("stroke", "black")
    .attr("fill", "none");
    

// animation to move bees along a path
transition();

function transition() {
  bees.transition()
    .duration(20000)
    .ease(d3.easeLinear)
    .attrTween("transform", translateAlongandRotate)
    .on("end", transition);
};

function getBeePath(week, opp) {
    const bee_path = bee_paths.nodes().find(element => (element.__data__.week == week) && (element.__data__.opp == opp))
    return bee_path;
};

function translateAlongandRotate(d, i, a) {
    var path = getBeePath(d.week, d.opp);
    var l = path.getTotalLength();
    var previous_point = {};
    return function(t) {
      // we're calculating the angle we need to translate between 
      var p = path.getPointAtLength(t * l);

      if (!previous_point.hasOwnProperty("x")) {
        var prev_p = path.getPointAtLength(l) // assuming this is first point, get the last point of the path
        previous_point.x = prev_p.x;
        previous_point.y = prev_p.y;
      } 
        
      if (previous_point.x == p.x) {
        var atan_degrees = Math.PI / 2
      } else {
        var atan_input = (p.y - previous_point.y)/(p.x - previous_point.x)
        var atan_rad = Math.atan(atan_input)
        var atan_degrees = atan_rad * 180 / Math.PI
      }

      if (previous_point.x > p.x) {
        var atan_degrees_adj = atan_degrees - 90
      } else {
        var atan_degrees_adj = atan_degrees + 90
      }

      previous_point.x = p.x;
      previous_point.y = p.y;
      return "translate(" + p.x + "," + p.y + ") rotate(" + atan_degrees_adj + ")";
    };
};

// ADD CROWN FOR SUPERBOWL WINNER //
var crown = teams.selectAll('crown')
    .data(d => d.games)
    .enter()
    .filter(d => d.week == 'Superbowl' && d.result == 'W')
    .append("svg:image")
    .attr("xlink:href", "assets/crown-svgrepo-com.svg")
    .attr("transform", `translate(${hiveXCenter}, -30)`)
    .attr("width", 40)
    .attr("height", 45)
    .attr("x", -40/2)
    .attr("y", -45/2)
    .raise();
    