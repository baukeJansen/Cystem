declare var Chart: any;

class Graph{
    constructor($graph: JQuery) {
        var timeFormat: string = 'DD MMM YYYY';
        var shortTimeFormat: string = 'DD MMM';

        var $data = $graph.next();
        var jsonData = $data.html().trim();
        jsonData = jsonData || "{}";
        var data = JSON.parse(jsonData);

        /*var normal = [];
        var secondKind = [];
        var sale = [];
        var other = [];
    
        $.each(data, function (_, item) {
            item.date = moment(item.date).format(timeFormat);
    
            switch (item.type.toLowerCase()) {
                default:
                case 'normaal':
                    normal.push({ x: item.date, y: item.eggs });
                    break;
                case '2e soort':
                    secondKind.push({ x: item.date, y: item.eggs });
                    break;
                case 'verkoop':
                    sale.push({ x: item.date, y: item.eggs });
                    break;
                case 'anders':
                    other.push({ x: item.date, y: item.date });
                    break;
            }
        });*/

        var myChart = new Chart($graph[0], {
            type: 'line',
            data: data,

            /*{
            //label: [moment().format('dd-MM-yyyy'), moment().format('dd-MM-yyyy'), moment().format('dd-MM-yyyy'), moment().format('dd-MM-yyyy')],
            /*datasets: [
                {
                    label: ['Normaal'],
                    data: normal,
                    backgroundColor: '#3f933e',
                    borderColor: '#3f933e',
                    fill: false,
                    pointBackgroundColor: '#616161',
                    borderWidth: 1
                },
                {
                    label: ['2e soort'],
                    data: secondKind,
                    backgroundColor: '#f44336',
                    borderColor: '#f44336',
                    fill: false,
                    pointBackgroundColor: '#616161',
                    borderWidth: 1
                },
                {
                    label: ['Verkoop'],
                    data: sale,
                    backgroundColor: '#ffe419',
                    borderColor: '#ffe419',
                    fill: false,
                    pointBackgroundColor: '#616161',
                    borderWidth: 1
                },
                {
                    label: ['Anders'],
                    data: other,
                    backgroundColor: '#fff',
                    borderColor: '#fff',
                    fill: false,
                    pointBackgroundColor: '#616161',
                    borderWidth: 1
                }
            ]
        },*/
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
    }
}