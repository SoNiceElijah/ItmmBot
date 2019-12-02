
let currentId = -1;

function upAdder(id) {

    if(currentId != -1 && currentId != id)
    {
        $('#moreRules' + currentId).removeAttr('style');
        $('#ruleAdder' + currentId).removeAttr('style');
    }

    $('#moreRules' + id).css('display','none');
    $('#ruleAdder' + id).css('display', 'block');

    currentId = id;

    $('#ruleAdder' + currentId).keyup((e) => {

        if(e.originalEvent.code == 'Backspace' && $('#adderText' + currentId).val() == '')
        {
            $('#moreRules' + currentId).removeAttr('style');
            $('#ruleAdder' + currentId).removeAttr('style');
    
            return;
        }
    
        if(e.originalEvent.code == 'Enter' && $('#adderText' + + currentId).val() != '' )
        {
            let element = $('#card').clone();

            let cid = Date.now();

            $('#ruleList' + currentId).append(element);

            $('#card').attr('id', 'card' + currentId + '_' + cid);
            $('#ruleText').attr('id', 'ruleText' + currentId + '_' + cid);

            $('#mark').attr('id', 'mark' + currentId + '_' + cid);
            $('#zachet').attr('id', 'zachet' + currentId + '_' + cid);
            $('#exam').attr('id', 'exam' + currentId + '_' + cid);

            $('#deleteCard').attr('id', 'deleteCard' + currentId + '_' + cid);

            let lock = currentId + '';
            $('#deleteCard' + currentId + '_' + cid ).click(() => { console.log(lock + '_' + cid); removeCard(lock + '_' + cid) });

            $('#ruleText' + currentId + '_' + cid).html($('#adderText' + + currentId).val());


    
            $('#adderText' + currentId).val('');
    
            $('#moreRules' + currentId).removeAttr('style');
            $('#ruleAdder' + currentId).removeAttr('style');
    
            return;
        }
    });
}

$('#newBox').click(() => {

    let elem = $('#box').clone();


    $('#boxList').append(elem);

    let id = Date.now();

    $('#box').attr('id', 'box' + id);
    $('#ruleList').attr('id', 'ruleList' + id);
    $('#ruleAdder').attr('id', 'ruleAdder' + id);
    $('#adderText').attr('id', 'adderText' + id);
    $('#moreRules').attr('id', 'moreRules' + id);
    $('#deleteBox').attr('id', 'deleteBox' + id);


    $('#deleteBox' + id).click(() => { $('#box' + id).remove(); })
    $('#moreRules' + id).click(() => { upAdder(id) });
    
});

function removeCard(cid) {
    $('#card' + cid).remove();
}

function removeBox(cid) {
    $('#box' + cid).remove();
}

$('#saveAll').click((e) => {

    let json = [];

    for(let i = 0; i < $('#boxList').children().length; ++i)
    {
        let elem = $('#boxList').children().eq(i);
        let groups = elem.find('input')['0'].value;


        for(let j = 0; j < elem.find('.rule-list').children().length; ++j)
        {
            let card = elem.find('.rule-list').children().eq(j);

            let text = card.find('.rule-text')[0].innerHTML;

            let mark = card.find('input')[0].checked;
            let zachet = card.find('input')[1].checked;
            let exam = card.find('input')[2].checked;

            json.push({
                groups : groups,
                
                text: text,

                mark : mark,
                zachet : zachet,
                exam : exam
            });

        }        
    }

    console.log(json);

    $.post('/pushExams',{ js : JSON.stringify(json)}, (data) => { console.log(data);})

});


