let last = 0;

let offset = 0;
let limit = 10;

let query;

$('#list0').attr('selected','s');
let collection = $('#list0').html();

render();

function changeTable(i) {
    if(i == last)
        return;

    $('#list' + last).removeAttr('selected');
    $('#list' + i).attr('selected', 's');
    last = i;
    collection = $('#list' + i).html();

    offset = 0;
    render();
}

function render() {

    $('#viewRoot').html('');

    $('#loading').css('display','flex');

    $('#next1').css('display','none');

    $('#prev1').css('display','none');

    let url = '/mirrorData?';
    url += 'o=' + offset;
    url += '&s=' + limit; 

    $('#loadDataRoot').load(url,{c : collection , q : query}, function() {
        $('#viewRoot').html($('#viewRoot').html() + $('#loadDataRoot').html());

        $('#loading').removeAttr('style');

        if($('#loadDataRoot .db-content-list').children().length  ==  limit + 3) {
            $('#next1').removeAttr('style');
        }
        if(offset != 0) {
            $('#prev1').removeAttr('style');
        }

        $('#loadDataRoot').html('');
    });
}

$('#next1').click(e => {
    offset += limit;
    render();
});

$('#go').click(e => {
    query = $('#query').val() ;
    if(query == '')
        query = null;

    offset = 0;

    render();
});

$('#dump').click(e => {
    $.post('/dump',{},(msg) => {
        
        let a = document.createElement('a');
        a.setAttribute('href',msg);
        a.style.display = 'none';
        document.body.appendChild(a);
        
        a.click();

        document.removeChild(a);
    });
});

$('#prev1').click(e => {

    if(offset - limit < 0)
        return;
        

    offset -= limit;
    render();
});

let lastId;
function show(id) {
    if(lastId) {
        cancel(lastId);
    }

    console.log($('#tx' + id));
    $('#tx' + id).css('display',' none');
    $('#ta' + id).css('display','block');

    $('#dbset1' + id).css('display',' none');
    $('#dbset2' + id).css('display','block');

    lastId = id;
}

function cancel(id) {
    if(id == '0') {
        $('#add').css('display','block');

        $('#item0').css('display','none');
        $('#ta0').css('display','none');

        $('#ta0').val('');

        lastId = null;

        return;
    }

    $('#tx' + id).css('display',' block');
    $('#ta' + id).css('display','none');

    $('#dbset1' + id).css('display',' block');
    $('#dbset2' + id).css('display','none');

    $('#ta' + id).val($('#tx' + id).html());

    lastId = null;
}



function remove(id) {
    if(confirm('Удалить?')) {
        $.post('/mirrorDelete', {
            c : collection,
            i : id
        }, (data) => {
            console.log(data);
            render() ;
        });
    }
}

function save(id) {
    if(id == '0') {
        $.post('/mirrorAdd', {
            c : collection,
            q : $('#ta' + id).val()
        }, (data) => {
            console.log(data);
            render();

            $('#add').removeAttr('style');
        });

        return;
    }

    $.post('/mirrorUpdate', {
        c : collection,
        i : id,
        q : $('#ta' + id).val()
    }, (data) => {
        console.log(data);
        render();
    });
}

$('#add').click(e => {

    if(lastId)
        cancel(lastId);

    $('#add').css('display','none');

    $('#item0').css('display','block');
    $('#ta0').css('display','block');

    lastId = '0';
});


