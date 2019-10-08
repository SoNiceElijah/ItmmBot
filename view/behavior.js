let lastUTC = $('#procLine').attr('proc');
const maxTime = 20 * 60 * 1000;

let time = setInterval(() => {


    let d = new Date();
    let utc = d.getTime() + d.getTimezoneOffset() * 60000;

    let time = (utc - lastUTC);

    if(time >= maxTime) {
        lastUTC = utc;
        return;
    }

    let size = Math.floor(800 * ((utc - lastUTC) / maxTime));
    $('#procLine').css('width', size + 'px');
    console.log(size);

    $('#procTime').html(timeToString(time) + " / " + timeToString(maxTime));
}, 200);


function timeToString(time) {
    time = time / 1000;
    return Math.floor(Math.floor(time / 60) / 10) + "" + Math.floor(time / 60) % 10 
        + ":" + Math.floor(Math.floor(time % 60) / 10) + "" + Math.floor(time % 60) % 10 
}
