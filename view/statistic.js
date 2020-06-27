



let d1 = [{
    ...stat[0],
    type : 'pie',
    name : 'Популярные запросы'
}];

let d2 = [{
    ...stat[1],
    type : 'bar',
    name : 'Популярные запросы'
}];


let layout = {
    autosize: false,
    height : 500,
    width : 500,
    paper_bgcolor: '#ebebeb',
    plot_bgcolor: '#ebebeb',
    margin: {
        l: 0,
        r: 30,
        b: 50,
        t: 50,
        pad: 4
    },
};

Plotly.newPlot('pie',d1,layout);
Plotly.newPlot('line',d2,layout);