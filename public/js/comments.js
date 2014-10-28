/**
 * Created by Alec on 10/27/2014.
 */
// interactions with mongodb based on http://cwbuecheler.com/web/tutorials/2014/restful-web-app-node-express-mongodb/
var commentList = [];

$(document).ready(function() {
    populateComments();
    $('#comments .input-group .input-group-btn button').on('click', addComment)
});

function populateComments() {
    var comment = '';

    $.getJSON('/collections/commentlist', function(data) {
        $.each(data, function() {
            comment += '<li class="list-group-item">';
            comment += this.message + ' <span class="timestamp">at ' + this.time + '</span>';
            comment += '</li>'
        });

        $('#comments .list-group').html(comment)
    })
}

function addComment(event) {
    event.preventDefault();

    if( $('#add-comment input').val() !== '') {
        var d = new Date();

        var newComment = {
            'message': $('#add-comment input').val(),
            'time': d.toString()
        };

        $.ajax({
            type: 'POST',
            data: newComment,
            url: '/collections/commentlist',
            dataType: 'JSON'
        }).done(function (response) {
            console.log(response);
            if (response.msg !== '') {
                $('#add-comment input').val('');
                populateComments()
            } else {
                alert('Error: ' + response.msg);
            }
        });
    } else {
        alert('Please fill in a comment');
        return false;
    }


}