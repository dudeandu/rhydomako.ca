
var neighborhoods;
var properties;
var defaultFeatures;

var settings = {
    mapCentreLat: 43.708,
    mapCentreLong: -79.3703,
    mapZoom: 11.2,
};

var fields = [
{name: "(none)", id: "none" },
{name: "Total Population", id: "totalPopulation" },
{name: "Total Area", id: "totalArea"},
{name: 'Pop - Males', id: "popMales"},
{name: 'Pop - Females', id: "popFemales"},
{name: 'Pop 0 - 4 years', id: "pop0_4"},
{name: 'Pop 5 - 9 years', id: "pop5_9"},
{name: 'Pop 10 - 14 years', id: "pop10_14"},
{name: 'Pop 15 -19 years', id: "pop15_19"},
{name: 'Pop 20 - 24 years', id: "pop20_24"},
{name: 'Pop  25 - 29 years', id: "pop25_29"},
{name: 'Pop 30 - 34 years', id: "pop30_34"},
{name: 'Pop 35 - 39 years',  id: "pop35_39"},
{name: 'Pop 40 - 44 years', id: "pop40_44"},
{name: 'Pop 45 - 49 years', id: "pop45_49"},
{name: 'Pop 50 - 54 years', id: "pop50_54"},
{name: 'Pop 55 - 59 years', id: "pop55_59"},
{name: 'Pop 60 - 64 years', id: "pop60_64"},
{name: 'Pop 65 - 69 years', id: "pop65_69"},
{name: 'Pop 70 - 74 years', id: "pop70_74"},
{name: 'Pop 75 - 79 years', id: "pop75_79"},
{name: 'Pop 80 - 84 years', id: "pop80_84"},
{name: 'Pop 85 years and over', id: "pop85"},
{name: 'Language - Chinese', id: "chinese"},
{name: 'Language - Tamil', id: "tamil"},
{name: 'Language - Italian',  id: "italian"},
{name: 'Language - Spanish',  id: "spanish"},
{name: 'Language - Portuguese', id: "portuguese"},
{name: 'Language - Tagalog',  id: "tagalog"},
{name: 'Language - Urdu',  id: "urdu"},
{name: 'Language - Russian', id: "russian"},
{name: 'Language - Persian (Farsi)',  id: "persian"},
{name: 'Language - Korean',  id: "korean"},
{name: 'Child 0-14', id: "child0_14"},
{name: 'Youth 15-24',  id: "child15_24"},
{name: 'Seniors 55 and over',  id: "seniors55"},
{name: 'Seniors 65 and over', id: "seniors64"},
{name: 'City Grants Funding $',  id: "cityGrants"},
{name: 'Walk Score',  id: "walkScore"},
{name: 'Salvation Army Donors', id: "salvationArmyDonors"},
{name: 'Watermain Breaks',  id: "watermains"},
{name: 'Neighbourhood Equity Score', id: "equityScore"},
{name: 'Social Assistance Recipients',  id: "socialAssistance"},
{name: 'Local Employment',  id: "localEmployment"},
{name: 'Businesses', id: "businesses"},
{name: 'Debt Risk Score',  id: "debtRisk"},
{name: 'Home Prices',  id: "homePrices"},
{name: 'Child Care Spaces', id: "childCare"},
{name: 'Drug Arrests',  id: "drugArrests"},
{name: 'Assaults',  id: "assaults"},
{name: 'Sexual Assaults',  id: "sexualAssaults"},
{name: 'Break & Enters', id: "bandes"},
{name: 'Robberies',  id: "robberies"},
{name: 'Vehicle Thefts',  id: "vehicleThefts"},
{name: 'Thefts',  id: "thefts"},
{name: 'Murders',  id: "murders"},
{name: 'Arsons', id: "arsons"},
{name: 'Fires & Fire Alarms',  id: "fires"},
{name: 'Fire Vehicle Incidents', id: "fireVehicle"},
{name: 'Hazardous Incidents',  id: "hazardous"},
{name: 'Total Major Crime Incidents', id: "totalCrime"},
{name: 'Fire Medical Calls',  id: "fireMedical"},
{name: 'Traffic Collisions',  id: "collisions"},
{name: 'Road Kilometres', id: "kilometers"},
{name: 'Road Volume',  id: "roadVolume"},
{name: 'TTC Stops', id: "ttc"},
{name: 'Pedestrian/Other Collisions', id: "pedestrian"},
    ];

var scales = [
{name: "Raw Value", id: "none"},
{name: "Total Population", id: "totalPopulation" },
{name: "Total Area", ia: "area"}
];

function changeDropDowns() {
    field = fields[d3.select("#field").property('selectedIndex')]
        scale = scales[d3.select("#scale").property('selectedIndex')]
        update(field, scale);
}

var fieldSelect = d3.select("#field")
.on("change", changeDropDowns);

var scaleSelect = d3.select("#scale")
.on("change", changeDropDowns);


//
// Map defintion
//
var map = L.map('map', {zoomControl: false}).setView([settings.mapCentreLat, settings.mapCentreLong], settings.mapZoom);

// Disable drag and zoom handlers.
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();

//
// SVG
//
var svg = d3.select(map.getPanes().overlayPane).append("svg");
var   g = svg.append("g").attr("class", "leaflet-zoom-hide");
var neighbourhoods = g.selectAll('path');

var transform = d3.geo.transform({point: function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}})
var path = d3.geo.path().projection(transform);

function pointTransform(n) {
    var proj = map.latLngToLayerPoint(new L.LatLng(n[1], n[0]));
    return [proj.x, proj.y]
}

var carto = d3.cartogram().projection(pointTransform);


function init(error, _neighborhoods, _properties) {
    neighborhoods = _neighborhoods;
    properties = d3.nest()
        .key(function(d) { return +d['Neighbourhood Id']; } )
        .map(_properties);

    var bounds = path.bounds(topojson.feature(neighborhoods, neighborhoods.objects.neighborhoods)),
        topLeft = bounds[0],
        bottomRight = bounds[1];

    svg .attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");
    g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");


    defaultFeatures = carto.features(neighborhoods, neighborhoods.objects.neighborhoods.geometries);

    //
    // Neighborhood outlines
    //
    g.selectAll("path")
        .data(defaultFeatures)
        .enter()
        .append("path")
        .attr("d", path)
        .append("svg:title")
        .text(function(d) { 
            var vn = normValue(field.name, scale.name, +d.id);
            return vn.neighbourhood;
        });

    fieldSelect.selectAll("option")
        .data(fields)
        .enter()
        .append("option")
        .attr("value", function(d) { return d.id; })
        .text(function(d) { return d.name; });

    scaleSelect.selectAll("option")
        .data(scales)
        .enter()
        .append("option")
        .attr("value", function(d) { return d.id; })
        .text(function(d) { return d.name; });
}


function update(field, scale) {

    var values = defaultFeatures.map(function(d) { return normValue(field.name, scale.name, +d.id); }).sort(d3.ascending);
    var extent = d3.extent(values);

    var normScale = d3.scale.linear()
        .domain(extent)
        .range([1, 1000]);
    var color = d3.scale.linear()
        .domain(extent)
        .range(['#e5f5e0','#31a354']);

    carto.value(function(d) {
        return normScale(normValue(field.name, scale.name, +d.id));
    });

    var features = carto(neighborhoods, neighborhoods.objects.neighborhoods.geometries).features;

    g.selectAll("path").data(features)
        .transition()
        .duration(750)
        .ease("linear")
        .attr("d", carto.path)
        .attr("fill", function(d) {
            return color(normValue(field.name, scale.name, +d.id));
        });

    g.selectAll("path").select("title")
        .text(function(d) {
            return properties[+d.id][0]['Neighbourhood'] + ": " + normValue(field.name, scale.name, +d.id);
        });
}

function normValue(fieldName, scaleName, id) {
    var value = +properties[+id][0][fieldName];
    var normalization = 1.;

    if(scaleName == 'Total Population') { normalization = +properties[+id][0]['Total Population']; }
    else if(scaleName == 'Total Area') { normalization = +properties[+id][0]['Total Area']; }

    return value/normalization;
}


queue()
    .defer(d3.json, "/posts/wellbeingCartogram/data/neighborhoods.topojson")
    .defer(d3.csv,  "/posts/wellbeingCartogram/data/properties.csv")
    .await(init);
