Date.prototype.getUTCTime = function () {
    return this.getTime();
};

let offset = 0;
let limit = 10;

$('#from').val();
$('#to').val();

render();
function render(from,to,msg) {

    let url = '/logData?o=' + offset + '&s=' + limit;

    if(from)
        url += '&f=' + from;
    if(to)
        url += '&t=' + to;
    if(msg)
        url += '&m=' + msg;

    console.log('inside');
    $('#loading').css('display','flex');
    $('#more').css('display','none');

    $('#loadPlace').load(url,() => {
        console.log('DONE');
        $('#mainList').html($('#mainList').html() + $('#loadPlace').html());

        $('#loading').removeAttr('style');

        if($('#loadPlace ul').children().length  ==  limit)
            $('#more').removeAttr('style');
    });
}

$('#more').click((e) => {
    offset += limit;
    render();
});


$('#go').click((e) => {

    let from = new Date($('#from').val());
    let to = new Date($('#to').val());
    let msg = $('#msg').val();

    offset = 0;
    $('#mainList').html('');
    render(from.getUTCTime(),to.getUTCTime(), msg );

    console.log(from.getUTCTime());
    console.log(to.getUTCTime());
    console.log();

});

$('#clear').click((e) => {
    offset = 0;
    $('#mainList').html('');
    render();
});

