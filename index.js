const max_idx = 250

function main() {
     //load csv
     d3.csv('prices.csv', rowconverter).then(function(prices) {
        //load json
        d3.json('ticker_stats.json').then(function(stats) {
            plot1(prices, stats)
            plot2(prices, stats)
            plot3(prices, stats)
            plot4(prices, stats)
        })
    })
    d3.json('corr.json').then(function(data) {
        plot5(data)
    })
}

function rowconverter(d) {
    return {
        date_idx: parseInt(d.date_idx),
        Close: parseFloat(d.Close),
        Volume: parseInt(d.Volume),
        ticker: d.ticker,
        DateStr: d.DateStr,
        curMarketCap: parseFloat(d.curMarketCap)

    }
}

function plot1(prices, stats) {
    width = 1000
    height = 1000
    padding = 50
    svg5 =  d3.select('#plot1').append('svg').attr('width', width).attr('height', height)
    int = 1
    
    for (let i in stats) {
        stats[i]['ticker'] = i
    }

   stats1 = Object.values(stats)

    radScale1 = d3.scaleLinear().domain([d3.min(stats1, d=> d.marketCap), d3.max(stats1, d=> d.marketCap)]).range([10, 100])

    sectors = [...new Set(d3.map(stats1, d => d.sector))]
    sectorScale = d3.scaleBand().domain(sectors).range([padding, width-padding]).paddingOuter(0.5)
    

    force1 = d3.forceSimulation(stats1)
	.force('center', d3.forceCenter(width/2, height/2))
    .force('collision', d3.forceCollide().radius(d => radScale1(d.marketCap)))
    .force('x', d3.forceX().x(function(d) { return sectorScale(d.sector)}))

    change_d = {}
    for (let i in stats) {
        d = stats[i]
        first = d3.filter(prices, function(d1) { return (d1.ticker == i) && (d1.date_idx == 249)})[0].Close
        last = d3.filter(prices, function(d1) { return (d1.ticker == i) && (d1.date_idx == 250)})[0].Close

        change_d[i] = (last - first) / first

    }

    console.log([d3.min(Object.values(change_d)), d3.max(Object.values(change_d))])

    changeScale = d3.scaleLinear().domain([-0.05, 0.05]).range([d3.interpolateRgb("red", "green")(0), d3.interpolateRgb("red", "green")(1)])


    

    var nodes1 = svg5.selectAll("circle")
				.data(stats1)
				.enter()
				.append("circle")
				.attr('r', d => radScale1(d.marketCap))
                .attr('fill', d => changeScale(change_d[d.ticker]))

    force1.on("tick", function() {

                  
                
                    nodes1.attr("cx", function(d) { return d.x; })
                         .attr("cy", function(d) { return d.y; })
                         
        
                });

    idx_to_date = d3.map(prices, d => d.DateStr)

    slider = document.getElementById('dateIdx')

    slider.oninput = function(){
        v = parseInt(this.value)
        for (let i in stats) {
            d = stats[i]
            first = d3.filter(prices, function(d1) { return (d1.ticker == i) && (d1.date_idx == v)})[0].Close
            last = d3.filter(prices, function(d1) { return (d1.ticker == i) && (d1.date_idx == d3.min([v+int, max_idx]))})[0].Close
    
            change_d[i] = (last - first) / first

        
        }
        nodes1.transition(500).attr('fill', d => changeScale(change_d[d.ticker]))
        out = document.getElementById('curDate')
        out.innerHTML = idx_to_date[v]
        


    }


    var radio = d3.select('#radio')
                .attr('name', 'interval').on("change", function (d) { 
                    int = parseInt(d.target.value);
                    for (let i in stats) {
                        d = stats[i]
                        first = d3.filter(prices, function(d1) { return (d1.ticker == i) && (d1.date_idx == v)})[0].Close
                        last = d3.filter(prices, function(d1) { return (d1.ticker == i) && (d1.date_idx == d3.min([v+int, max_idx]))})[0].Close
                
                        change_d[i] = (last - first) / first
            
                    
                    }
                    nodes1.transition(500).attr('fill', d => changeScale(change_d[d.ticker]))



                })

    xAxis4 = d3.axisBottom().scale(sectorScale)
    svg5.append('g').call(xAxis4).attr('class', 'xAxis').attr('transform', 'translate(73,930)').selectAll('text')
    .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-25)");

    

    svg5.append('text').attr("text-anchor", "end")
        .attr("x", width / 2)
        .attr("y", height - 2)
        .text("Sector")
    
    svg5.append('text').attr("text-anchor", "end")
            .attr('x', "800")
            .attr("y", 20)
            .style('font-size', 25)
            .text("Area Chart of Change Over Select Interval by Market Cap, by Sector"); 

    defs2 = svg5.append('defs')

            svg5.append('text').attr("text-anchor", "end")
            .attr('x', "200")
            .attr("y", 50)
            .text('Legend:')
        
        
            var gradient = defs2.append('linearGradient')
            .attr('id', 'svgGradient2')
            .attr('x1', '0%')
            .attr('x2', '100%')
            .attr('y1', '100%')
            .attr('y2', '100%');
        
            gradient.append('stop')
            .attr('class', 'start')
            .attr('offset', '0%')
            .attr('stop-color', 'red')
            .attr('stop-opacity', 1);
        
            gradient.append('stop')
            .attr('class', 'end')
            .attr('offset', '100%')
            .attr('stop-color', 'green')
            .attr('stop-opacity', 1);
            
            svg5.append('text').attr("text-anchor", "end")
            .attr('x',280)
            .attr("y", 50)
            .text('% Change:')
        
            svg5.append('text').attr("text-anchor", "end")
            .attr('x',330)
            .attr("y", 50)
            .text('-5%')
        
        
            svg5.append('text').attr("text-anchor", "end")
            .attr('x',470)
            .attr("y", 50)
            .text('5%')
        
        
            line = svg5.append('line')
            .attr('x1', 340)
            .attr('x2', 440)
            .attr('y1', 45)
            .attr('y2', 45.01)
        
            .attr('stroke', 'url(#svgGradient2)')
            .attr('fill', 'none')
            .attr('stroke-width', '30')
        
            svg5.append('text').attr("text-anchor", "end")
            .attr('x',560)
            .attr("y", 50)
            .text('Market Cap:')
        
            svg5.append('circle')
            .attr('cx', 620)
            .attr('cy', 50)
            .attr('r', 10)
            .attr('fill', 'orange')
        
            svg5.append('text')
            .attr('x', 620)
            .attr('y', 50)
            .text(Math.round(d3.min(stats1, d => d.marketCap) / (10**9)) +'B')
            
        
            svg5.append('circle')
            .attr('cx', 700)
            .attr('cy', 80)
            .attr('r', 50)
            .attr('fill', 'orange')
        
            svg5.append('text')
            .attr('x', 700)
            .attr('y', 80)
            .text('1T')
   

    


}

function plot2(prices, stats) {

            width = 1000
            height = 1000
            padding = 70
            svg = d3.select('#plot2').append('svg').attr('width', width).attr('height', height)


            tickers = []
            for (let t in stats) {
                tickers.push(t)
            }
            data = d3.map(tickers, function(t) {
                first_close = d3.filter(prices, function(d) {return (d.ticker == t) && (d.date_idx == 0)})[0]['Close']
                last_close = d3.filter(prices, function(d) {return (d.ticker == t) && (d.date_idx == max_idx)})[0]['Close']
                return {
                    name: stats[t].name,
                    marketCap: stats[t].marketCap,
                    symbol: t,
                    change: ((last_close - first_close) / first_close) * 100
                }
            })

            //create scales
            //market Cap:
            xScale = d3.scaleLog().domain([d3.min(data, d => d.marketCap), d3.max(data, d => d.marketCap)]).range([padding, width - padding])
            //change 
            yScale = d3.scaleLinear().domain([d3.min(data, d => d.change), d3.max(data, d => d.change)]).range([height - padding, padding])

            //tooltip
            var tooltip = d3.select("#plot2").append("div").style("opacity", 0.9).attr("class", "tooltip");




            var mouseover = function(d) {
                tooltip.transition().duration(50).style("opacity", 0.9);
                tooltip.raise()
                //d3.select(this).transition(5).attr('r', 20)
    
            }
    
              var mousemove = function(e, d) {
                //d3.select(this).transition(5).attr('r', 20)
    
                tooltip
                  .html('Name: ' + d.name + '<br>' + 'Ticker: ' + d.symbol + '<br>' + 'Market Cap:  ' + d.marketCap + '<br>' + 'Yearly Change: ' +  Math.round(d.change, 4) + '%')
                  .style("left", (e.pageX + 10) + "px")
                    .style("top", (e.pageY - 10) + "px"); 
              }
              var mouseleave = function(d) {
                tooltip
                .transition().duration(50).style("opacity", 0);
                //d3.select(this).transition(50).attr('r', 4)
                
              }


            svg.selectAll('circle').data(data).enter().append('circle')
            .attr('cx', d => xScale(d.marketCap))
            .attr('cy', d => yScale(d.change))
            .attr('r', 4)
            .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

            xAxis = d3.axisBottom().scale(xScale)
            yAxis = d3.axisLeft().scale(yScale)

            svg.append('g').call(xAxis).attr('class', 'xAxis').attr('transform', 'translate(0,930)')
            svg.append('g').call(yAxis).attr("class", "yAxis").attr('transform', 'translate(70, 0)')


            svg.append('text').attr("text-anchor", "end")
            .attr("x", width / 2)
            .attr("y", height - 5)
            .text("Market Cap (log scale)");
    
            svg.append('text').attr("text-anchor", "end")
            .attr('x', "-500")
            .attr("y", 3)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Yearly Change (%)");
             

    

}


function plot3(prices, stats) {
    
  
    width = 1000
    height = 1000
    padding = 70



    grps = d3.rollup(prices,d => d3.sum(d, e => e.curMarketCap) / (10 ** 12), d => stats[d.ticker].sector, d => d.date_idx)


    xScale = d3.scaleBand().domain(grps.keys()).range([padding, width - padding]).padding(0.05);
    yScale = d3.scaleLinear().domain([d3.min(grps.values(), d => d.get(0))* 0.7, d3.max(grps.values(), d => d.get(0))]).range([height - padding, padding])


    svg2 = d3.select('#plot3').append('svg').attr('width', width).attr('height', height)

    svg2.selectAll('rect').data(grps).enter().append('rect')
    .attr('width', xScale.bandwidth())
    .attr('x', d => xScale(d[0]))
    .attr('y', d => yScale(d[1].get(0)))
    .attr('height', d =>  height - padding - yScale(d[1].get(0)))
    .attr('fill', 'green')

    xAxis = d3.axisBottom().scale(xScale)
    yAxis = d3.axisLeft().scale(yScale)

    svg2.append('g').call(xAxis).attr('class', 'xAxis').attr('transform', 'translate(0,930)').selectAll('text')
    .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-25)");
    svg2.append('g').call(yAxis).attr("class", "yAxis").attr('transform', 'translate(70, 0)')


    idx_to_date = d3.map(prices, d => d.DateStr)
    

    svg2.append('text').attr("text-anchor", "end")
            .attr("x", width / 2)
            .attr("y", height - 5)
            .text("Sector");
    
            svg2.append('text').attr("text-anchor", "end")
            .attr('x', "-500")
            .attr("y", 3)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Total Market Cap (Trillions)");
            svg2.append('text').attr("text-anchor", "end")
            .attr('x', "600")
            .attr("y", 20)
            .style('font-size', 25)
            .text("Total Market Cap by Sector... Day: " + idx_to_date[0]).attr('class', 'title')


    button = d3.select('#plot3animate').on('click', function(e, d) {
        for (let i=1; i <= max_idx; i++) {
            svg2.selectAll('rect').data(grps).transition(3000).delay(i * 40)
            .attr('y', d => yScale(d[1].get(i)))
            .attr('height', d =>  height - padding - yScale(d[1].get(i)))

            svg2.select('.title').transition(3000).delay(i * 40).text("Total Market Cap by Sector... Day: " + idx_to_date[i])
            


        }
    })



    

}

function plot4(prices, stats) {

    width = 1500
    height = 1000
    padding = 70

    grps2 = d3.rollup(prices, g => d3.sum(g, d => d.Volume) / (10 **9), d => d.DateStr, d => stats[d.ticker].sector)

    parseTime = d3.timeParse('%Y-%m-%d')
    vol = []
    d3.map(grps2, function(d) {
        d2 = {}
        d2['date'] = parseTime(d[0])
        d3.map(d[1], function(d1) {
            d2[d1[0]] = d1[1]
        
            
        })
        vol.push(d2)
    })
    keys = d3.map(grps2.get('2023-03-20').keys(), d => d)
    svg3 = d3.select('#plot4').append('svg').attr('width', width).attr('height', height)

    extent = d3.extent(d3.map(vol, d => d.date))

    xScale1 = d3.scaleTime().domain(extent).range([padding, width - padding])
    yScale1 = d3.scaleLinear().domain([0, d3.max(vol, function(d) { 
        return d3.sum(Object.values(d).slice(1))
    })]).range([height-padding, padding])

    colors = d3.scaleOrdinal().domain(keys).range(d3.schemeSet3)

    
    stackgenerator = d3.stack().keys(keys)

    stacked = stackgenerator(vol)
    areas = d3.area()
    .x(d => xScale1(d.data.date))
    .y0(d => yScale1(d[0]))
    .y1(d => yScale1(d[1]))


    svg3.selectAll('.layers')
    .data(stacked).enter().append('path')
    .attr('d', d => areas(d))
    .attr('fill', d => colors(d))



    xAxis1 = d3.axisBottom().scale(xScale1)
    yAxis1 = d3.axisLeft().scale(yScale1)

    svg3.append('g').call(xAxis1).attr('class', 'xAxis').attr('transform', 'translate(0,930)').selectAll('text')
    .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-25)");
    svg3.append('g').call(yAxis1).attr("class", "yAxis").attr('transform', 'translate(70, 0)')


    svg3.append('text').attr("text-anchor", "end")
            .attr("x", width / 2)
            .attr("y", height - 5)
            .text("Date");
    
            svg3.append('text').attr("text-anchor", "end")
            .attr('x', "-500")
            .attr("y", 3)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Total Trading Volume (Billions)");
            svg3.append('text').attr("text-anchor", "end")
            .attr('x', "800")
            .attr("y", 20)
            .style('font-size', 25)
            .text("Total Trading Volume by Industry Over Time")

    for (let i in keys) {
        svg3.append('text').attr("text-anchor", "end")
            .attr("x", 250)
            .attr("y", 120 + (i * 20))
            .text(keys[i]);
        svg3.append('circle').attr('cx', 270)
        .attr('cy', 114 + (i * 20))
        .attr('r', 4)
        .attr('fill', colors(keys[i]))

    }


}

function plot5(data) {
    width = 1500
    height = 1500
    //padding = 70
    svg4 = d3.select('#plot5').append('svg').attr('width', width).attr('height', height)


    radScale = d3.scaleLog().domain([d3.min(data.nodes, d=> d.marketCap), d3.max(data.nodes, d=> d.marketCap)]).range([10, 30])

    rScale = d3.scaleLinear().domain([d3.min(data.edges, d=> d.r), d3.max(data.edges, d=> d.r)]).range([d3.interpolateGreys(0.1), d3.interpolateGreys(1)])

    console.log([d3.min(data.edges, d=> d.r), d3.max(data.edges, d=> d.r)])

    force = d3.forceSimulation(data.nodes)
	.force('center', d3.forceCenter(width/2, height/2))
    .force('link', d3.forceLink(data.edges))
    .force('collision', d3.forceCollide().radius(d => radScale(d.marketCap) + 15))

			
			//create edges
	var edges = svg4.selectAll("line")
				.data(data.edges)
				.enter()
				.append("line")
				.attr("stroke", d=> rScale(d.r))
                .attr('stroke-width', 2)

    var nodes = svg4.selectAll("circle")
				.data(data.nodes)
				.enter()
				.append("circle")
				.attr('r', d => radScale(d.marketCap))
                .attr('fill', d=> 'url(#' + d.ticker + ')')

    force.on("tick", function() {

                    edges.attr("x1", function(d) { return d.source.x; })
                         .attr("y1", function(d) { return d.source.y; })
                         .attr("x2", function(d) { return d.target.x; })
                         .attr("y2", function(d) { return d.target.y; });
                
                    nodes.attr("cx", function(d) { return d.x; })
                         .attr("cy", function(d) { return d.y; })
                         
        
                });
    defs = svg4.append('defs')
    defs.selectAll('pattern').data(data.nodes).enter().append('pattern')
    .attr('id', d => d.ticker)
    .attr('x', '0%')
    .attr('y', '0%')
    .attr('height', '100%')
    .attr('width', '100%')
    .attr('viewBox', '0 0 80 80')
    .append('image')
    .attr('x', '0%')
    .attr('y', '0%')
    .attr('height', '80')
    .attr('width', '80')
    .attr('xlink:href', d => d.logo)
    

    svg4.append('text').attr("text-anchor", "end")
            .attr('x', "800")
            .attr("y", 20)
            .style('font-size', 25)
            .text("Network Graph of Stock Price Coorelations of Top S&P 500 Companies")

    svg4.append('text').attr("text-anchor", "end")
    .attr('x', "200")
    .attr("y", 100)
    .text('Legend:')


    var gradient = defs.append('linearGradient')
    .attr('id', 'svgGradient')
    .attr('x1', '0%')
    .attr('x2', '100%')
    .attr('y1', '100%')
    .attr('y2', '100%');

    gradient.append('stop')
    .attr('class', 'start')
    .attr('offset', '0%')
    .attr('stop-color', rScale(d3.min(data.edges, d=> d.r)))
    .attr('stop-opacity', 1);

    gradient.append('stop')
    .attr('class', 'end')
    .attr('offset', '100%')
    .attr('stop-color', rScale(d3.max(data.edges, d=> d.r)))
    .attr('stop-opacity', 1);
    
    svg4.append('text').attr("text-anchor", "end")
    .attr('x',310)
    .attr("y", 120)
    .text('Coorelation Coefficent:')

    svg4.append('text').attr("text-anchor", "end")
    .attr('x',200)
    .attr("y", 140)
    .text(Math.round(d3.min(data.edges, d=> d.r) * 100) / 100)


    svg4.append('text').attr("text-anchor", "end")
    .attr('x',280)
    .attr("y", 140)
    .text(Math.round(d3.max(data.edges, d=> d.r) * 100) / 100)


    line = svg4.append('line')
    .attr('x1', 200)
    .attr('x2', 280)
    .attr('y1', 160)
    .attr('y2', 160.01)

    .attr('stroke', 'url(#svgGradient)')
    .attr('fill', 'none')
    .attr('stroke-width', '30')

    svg4.append('text').attr("text-anchor", "end")
    .attr('x',280)
    .attr("y", 220)
    .text('Market Cap:')

    svg4.append('circle')
    .attr('cx', 200)
    .attr('cy', 250)
    .attr('r', 10)
    .attr('fill', 'orange')

    svg4.append('text')
    .attr('x', 190)
    .attr('y', 270)
    .text(Math.round(d3.min(data.nodes, d => d.marketCap) / (10**9)) +'B')
    

    svg4.append('circle')
    .attr('cx', 290)
    .attr('cy', 250)
    .attr('r', 30)
    .attr('fill', 'orange')

    svg4.append('text')
    .attr('x', 280)
    .attr('y', 290)
    .text(Math.round(d3.max(data.nodes, d => d.marketCap) / (10**12)) +'T')
    



	//.force('collision', d3.forceCollide().radius(d => 5*Math.log(d.value)))



}