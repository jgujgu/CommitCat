//mithril setup

var commitCat = {};

commitCat.repo = function(data) {
    this.user = m.prop(data.description);
};

commitCat.vm = (function() {
    var vm = {};
    vm.init = function() {
        //vm.user = m.prop("jgu2160");
        //vm.repo = m.prop("CommitCat");
        vm.user = m.prop("kpearson");
        vm.repo = m.prop("track_fund");
        //vm.user = m.prop("");
        //vm.repo = m.prop("");
    };
    return vm;
}());

commitCat.controller = function() {
    commitCat.vm.init();
};


commitCat.view = function() {
    return m("html", [
        m("head", [
            m("title", "CommitCat"),
            m("link[href='./public/css/materialize.css'][rel=stylesheet]"),
            m("link[href='./public/css/styles.css'][rel=stylesheet]")
        ]),
        m("body", [
            m("div", {class: "container"},[
                m("h1", "CommitCat"),
                m("p","Timegraphing repo commits by hour")
            ]),
            m("div", {class: "container z-depth-2"},[
                m("form", [
                    m("div", {class: "row"}, [
                        m("div", {class: "input-field"}, [
                            m("input", {onchange: m.withAttr("value", commitCat.vm.user), class: "validate", placeholder: commitCat.vm.user(), type: "text", id: "username"}),
                            m("label", {for: "username"}, "Username")
                        ]),
                    m("div", {class: "input-field"}, [
                        m("input", {onchange: m.withAttr("value", commitCat.vm.repo), placeholder: commitCat.vm.repo(), type: "text", id: "repo"}),
                        m("label", {for: "repo"}, "Repo")
                    ]),
                    ]),
                    m("a", {onclick: getDataAndBuild, class: "waves-effect waves-light btn"}, "MEOW")
                ]),
            ]),
            m("div", {class: "catHead"}),
        ])
    ]);
};

m.mount(document, {controller: commitCat.controller, view: commitCat.view});

//my functions

function filterNoCommits(arr) {
    return arr.filter(function(a){
        if (a[2] !== 0) {
            return a;
        }
    });
}

function getGitData() {
    return m.request(
        {   method: "GET",
            url: [
                "https://api.github.com/repos/",
                commitCat.vm.user(),
                "/",
                commitCat.vm.repo(),
                "/stats/punch_card",
                "?",
                "access_token=",
                "e41c274435d26c3a4d4f20efe51289f8471e18d1"
            ].join("")
        }
    );
}

function getDataAndBuild() {
    getGitData()
    .then(function(success) {
        success = filterNoCommits(success);
        var timeHash = makeTimehash(success);
        var timeObjects = makeTimeObjects(timeHash);
        var sortedTimeObjects = sortTimeObjects(timeObjects);
        data = timeObjects;
        makeGraph();
    });
}

function makeTimehash(timeArray) {
    var timeHash = {};
    timeArray.forEach(function (minArray) {
        var humanTime = humanTimes[minArray[1]];
        if (timeHash[humanTime]) {
            timeHash[humanTime] += minArray[2];
        } else {
            timeHash[humanTime] = minArray[2];
        }
    });
    return timeHash;
}

function makeTimeObjects(timeHash) {
    keys = Object.keys(timeHash);
    return keys.map(function(key) {
        return { name: key, value: timeHash[key] };
    });
}

function sortTimeObjects(timeObjects) {
    return timeObjects.sort(function(a, b) {
        var aPosition = humanTimes.indexOf(a.name);
        var bPosition = humanTimes.indexOf(b.name);

        if (aPosition > bPosition) {
            return 1;
        }
        if (aPosition < bPosition) {
            return -1;
        }
        return 0;
    });
}

//d3

var data = [];

var margin = {top: 20, right: 20, bottom: 20, left: 20};
width = 400 - margin.left - margin.right;
height = width - margin.top - margin.bottom;

var chart = d3.select("body")
.append('svg')
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + ((width/2)+margin.left) + "," + ((height/2)+margin.top) + ")");

var radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
.range(["#3399FF", "#5DAEF8", "#86C3FA", "#ADD6FB", "#D6EBFD"]);

var arc = d3.svg.arc()
.outerRadius(radius)
.innerRadius(radius - 50);

var pie = d3.layout.pie()
.sort(null)
.startAngle(1.1*Math.PI)
.endAngle(3.1*Math.PI)
.value(function(d) { return d.value; });

function makeGraph() {
    var g = chart.selectAll(".catHead")
    .data(pie(data))
    .enter().append("g")
    .attr("class", "arc");

    g.append("path")
    .style("fill", function(d) { return color(d.data.name); })
    .transition().delay(function(d, i) { return i * 500; }).duration(500)
    .attrTween('d', function(d) {
        var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
        return function(t) {
            d.endAngle = i(t);
            return arc(d);
        };
    });

    g.append("text")
    .transition().delay(function(d, i) { return i * 500; }).duration(500)
    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .attr("class", "donut-text")
    .style("text-anchor", "middle")
    .text(function(d) { return d.data.name; });
}

var humanTimes = [
    "1AM",
    "2AM",
    "3AM",
    "4AM",
    "5AM",
    "6AM",
    "7AM",
    "8AM",
    "9AM",
    "10AM",
    "11AM",
    "12PM",
    "1PM",
    "2PM",
    "3PM",
    "4PM",
    "5PM",
    "6PM",
    "7PM",
    "8PM",
    "9PM",
    "10PM",
    "11PM",
    "12AM"
];
