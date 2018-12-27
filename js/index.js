const projectName = 'choropleth';
localStorage.setItem('example_project', 'D3: Choropleth');

const CountyDataURL = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';
const EducationDataURL = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

Promise.all([CountyDataURL, EducationDataURL].map(url => d3.json(url))).then(function(data) {
	const CountyData = data[0];
	const EducationData = {};
	data[1].forEach(e => { EducationData[e['fips']] = e; delete EducationData[e['fips']]['fips']; })

	const States = {
		'AL': 'Alabama',
		'AK': 'Alaska',
		'AS': 'American Samoa',
		'AZ': 'Arizona',
		'AR': 'Arkansas',
		'CA': 'California',
		'CO': 'Colorado',
		'CT': 'Connecticut',
		'DE': 'Delaware',
		'DC': 'District Of Columbia',
		'FM': 'Federated States Of Micronesia',
		'FL': 'Florida',
		'GA': 'Georgia',
		'GU': 'Guam',
		'HI': 'Hawaii',
		'ID': 'Idaho',
		'IL': 'Illinois',
		'IN': 'Indiana',
		'IA': 'Iowa',
		'KS': 'Kansas',
		'KY': 'Kentucky',
		'LA': 'Louisiana',
		'ME': 'Maine',
		'MH': 'Marshall Islands',
		'MD': 'Maryland',
		'MA': 'Massachusetts',
		'MI': 'Michigan',
		'MN': 'Minnesota',
		'MS': 'Mississippi',
		'MO': 'Missouri',
		'MT': 'Montana',
		'NE': 'Nebraska',
		'NV': 'Nevada',
		'NH': 'New Hampshire',
		'NJ': 'New Jersey',
		'NM': 'New Mexico',
		'NY': 'New York',
		'NC': 'North Carolina',
		'ND': 'North Dakota',
		'MP': 'Northern Mariana Islands',
		'OH': 'Ohio',
		'OK': 'Oklahoma',
		'OR': 'Oregon',
		'PW': 'Palau',
		'PA': 'Pennsylvania',
		'PR': 'Puerto Rico',
		'RI': 'Rhode Island',
		'SC': 'South Carolina',
		'SD': 'South Dakota',
		'TN': 'Tennessee',
		'TX': 'Texas',
		'UT': 'Utah',
		'VT': 'Vermont',
		'VI': 'Virgin Islands',
		'VA': 'Virginia',
		'WA': 'Washington',
		'WV': 'West Virginia',
		'WI': 'Wisconsin',
		'WY': 'Wyoming'
	};

	const w = 1032;
	const h = 600;

	const path = d3.geoPath();
	
	const tooltip = d3.select('body')
									.append('div')
									.attr('id', 'tooltip');
	
	const svg = d3.select('#canvas')
								.append('svg')
								.attr('width', w)
								.attr('height', h);
	
	const colorScale = d3.scaleThreshold()
												.domain((function(min, max, count) {
													let array = [];
													let step = (max-min) / count;
													let base = min;
													for (let i = 1; i < count; i++) {
														array.push(base + (i * step));
													}
													return array;
												})(d3.min(Object.keys(EducationData).map(d => EducationData[d]['bachelorsOrHigher'])), d3.max(Object.keys(EducationData).map(d => EducationData[d]['bachelorsOrHigher'])), d3.schemeGreens[9].length))
												.range(d3.schemeGreens[9]);
	
	const legendScale = d3.scaleLinear()
												.domain(d3.extent(Object.keys(EducationData).map(d => EducationData[d]['bachelorsOrHigher'])))
												.range([0, (w / 2.5)]);
	
	const legendScaleAxis = d3.axisBottom(legendScale)
														.tickValues(colorScale.domain());
	
	const legend = svg.append('g')
		.attr('id', 'legend')
		.attr('transform', 'translate(' + (w / 2.3) + ', 0)');
	
	legend.append('g')
				.selectAll('rect')
				.data(colorScale.range().map(function(color) {
					let d = colorScale.invertExtent(color);
					if (d[0] == null) { d[0] = legendScale.domain()[0]; };
					if (d[1] == null) { d[1] = legendScale.domain()[1]; };
					return d;
				}))
				.enter()
				.append('rect')
				.attr('fill', (d, i) => colorScale(d[0]))
				.attr('x', (d, i) => legendScale(d[0]))
				.attr('y', 16)
				.attr('width', (d, i) => legendScale(d[1]) - legendScale(d[0]))
				.attr('height', (d, i) => 20);
	
	legend.append('g')
				.attr('transform', 'translate(0, 36)')
				.call(legendScaleAxis);
	
	legend.append('text')             
			.attr('transform', 'translate(' + (w / 5) + ', 11)')
			.style('text-anchor', 'middle')
			.text('Attainment (%)');
	
	svg.append('path')
		.datum(topojson.mesh(CountyData, CountyData['objects']['states'], (a, b) => a !== b))
		.attr('class', 'states')
		.attr('d', path);
	
	svg.append('g')
			.attr('class', 'counties')
			.selectAll('path')
			.data(topojson.feature(CountyData, CountyData['objects']['counties']).features)
			.enter()
			.append('path')
			.attr('class', 'county')
			.attr('d', path)
			// .attr('fill', (d) => colorScale(EducationData.find(e => e['fips'] == d['id'])['bachelorsOrHigher']))
			.attr('fill', (d) => colorScale(EducationData[d['id']]['bachelorsOrHigher']))
			.attr('data-fips', (d) => d['id'])
			// .attr('data-education', (d) => EducationData.find(e => e['fips'] == d['id'])['bachelorsOrHigher'])
			.attr('data-education', (d) => EducationData[d['id']]['bachelorsOrHigher'])
			// .append('title')
			// .text((d) => States[EducationData[d['id']]['state']] + ': ' + EducationData[d['id']]['area_name'] + ': ' + EducationData[d['id']]['bachelorsOrHigher'] + '%')
			.on('mouseover', (d) => tooltip.style('display', 'block').attr('data-education', EducationData[d['id']]['bachelorsOrHigher']).text(States[EducationData[d['id']]['state']] + ': ' + EducationData[d['id']]['area_name'] + ': ' + EducationData[d['id']]['bachelorsOrHigher'] + '%'))
			.on('mousemove', () => tooltip.style('top', (d3.event.pageY - 35) + 'px').style('left', (d3.event.pageX + 5) + 'px'))
			.on('mouseout', () => tooltip.style('display', 'none'));
});