Date.prototype.getUTCTime = function () {
    return this.getTime();
};

let offset = 0;
let limit = 10;

let from;
let to;
let msg;

$('#from').val();
$('#to').val();

render();
function render() {

    let url = '/logData?o=' + offset + '&s=' + limit;

    let pd = {}
    if(from)
        url += '&f=' + from;
    if(to)
        url += '&t=' + to;
    if(msg)
        pd.m = msg;

    console.log('inside');
    $('#loading').css('display','flex');
    $('#more').css('display','none');

    $('#loadPlace').load(url,pd,() => {
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

    from = new Date($('#from').val()).getUTCTime();
    to = new Date($('#to').val()).getUTCTime();
    msg = $('#msg').val();

    offset = 0;
    $('#mainList').html('');
    render();

    console.log(from.getUTCTime());
    console.log(to.getUTCTime());
    console.log();

});

$('#clear').click((e) => {
    offset = 0;
    $('#mainList').html('');

    from = null;
    to = null;
    msg = null;

    $('#from').val('');
    $('#to').val('');
    $('#msg').val('');

    render();
});

