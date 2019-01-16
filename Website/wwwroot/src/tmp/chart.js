(function (global, $) {
    var graph;
    var Graph = function () {
    };
    Graph.prototype.init = function (el) {
        var $graphs = $(el).find('.graph');
        var timeFormat = 'DD MMM YYYY';
        var shortTimeFormat = 'DD MMM';
        if ($graphs.length) {
            $graphs.each(function (_, graph) {
                var $graph = $(graph);
                var $data = $graph.next();
                var jsonData = $data.html().trim();
                jsonData = jsonData || "{}";
                var data = JSON.parse(jsonData);
                var myChart = new Chart(graph, {
                    type: 'line',
                    data: data,
                    options: {
                        maintainAspectRatio: false,
                        aspectRation: 2,
                        legend: {
                            labels: {
                                fontColor: '#eee'
                            }
                        },
                        scales: {
                            xAxes: [{
                                    type: "time",
                                    time: {
                                        parser: timeFormat,
                                        tooltipFormat: timeFormat,
                                        displayFormats: {
                                            year: shortTimeFormat,
                                            quarter: shortTimeFormat,
                                            month: shortTimeFormat,
                                            week: shortTimeFormat,
                                            day: shortTimeFormat,
                                            hour: shortTimeFormat
                                        }
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Datum',
                                        fontColor: '#eee'
                                    },
                                    ticks: {
                                        fontColor: '#eee',
                                        autoSkip: true,
                                        maxTicksLimit: 6,
                                        rotation: 30
                                    }
                                }],
                            yAxes: [{
                                    type: 'linear',
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Eieren',
                                        fontColor: '#eee'
                                    },
                                    ticks: {
                                        fontColor: '#eee'
                                    }
                                }]
                        }
                    }
                });
            });
        }
    };
    graph = new Graph();
    global.Cystem.register('Graph', graph, graph.init);
})(this, jQuery);
