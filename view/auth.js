$('#what').click(e => {
    document.cookie = ('token' + "=" + $('#what').html());
    location.href = '/';
});