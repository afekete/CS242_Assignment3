/**
 * Created by Alec on 10/27/2014.
 */
// interactions with mongodb based on http://cwbuecheler.com/web/tutorials/2014/restful-web-app-node-express-mongodb/
var commentList = [];

$(document).ready(function() {
    populateComments();
    var commentSection = $('#comments');
    //commentSection.find('.input-group .input-group-btn button').on('click', addComment);
    $('#add-comment').on('submit', addComment);
    //commentSection.on('click', '.reply-submit', addReply);
    commentSection.on('submit', '.add-reply', addReply);
    commentSection.on('click', '.comment-reply', function (e) {
        e.preventDefault();
        $(this).parent().siblings('.add-reply').toggle()
    });
});

function populateComments() {
    var comment = '';

    $.getJSON('/collections/commentlist', function(data) {
        $.each(data, function() {
            if(this.reply == 'false') {
                console.log(this.message);
                comment += '<li class="list-group-item" data-id=' + this._id + '>';
                comment += '<div>' + this.message + '</div>';
                comment += '<div class="subcomment"><a class="comment-reply" href="#">reply</a>  ' + this.time + '</div>';
                comment += '<form class="input-group add-reply">';
                comment += '<input class="form-control" type="text">';
                comment += '<span class="input-group-btn">';
                comment += '<button class="btn btn-default reply-submit" type="submit"> Submit </button>';
                comment += '</span>';
                comment += '</form>';
                comment += '</li>';
                if (typeof this.children != 'undefined') {
                    var parent_id = this._id;
                    this.children.forEach(function (childid) {
                        if (childid != 'test') {
                            htmlAddReplies(childid, parent_id)
                        }
                    })
                }
            }
        });

        $('#comments').find('.list-group').html(comment)
    });
}

function htmlAddReplies(childid, parent_id) {
    var new_comment = '';
    console.log('childid: ' + childid);
    $.getJSON('/collections/commentlist/' + childid, function (data) {
        console.log('message: ' + data.message);
        new_comment += '<li class="list-group-item" data-id=' + data._id + '>';
        new_comment += '<div>' + data.message + '</div>';
        new_comment += '<div class="subcomment"><a class="comment-reply" href="#">reply</a>  ' + data.time + '</div>';
        new_comment += '<form class="input-group add-reply">';
        new_comment += '<input class="form-control" type="text">';
        new_comment += '<span class="input-group-btn">';
        new_comment += '<button class="btn btn-default reply-submit" type="submit"> Submit </button>';
        new_comment += '</span>';
        new_comment += '</form>';
        new_comment += '</li>';

        //console.log('reply html: ' + new_comment);
        $('.list-group-item[data-id=' + parent_id + ']').append(new_comment);
        if (typeof data.children != 'undefined') {
            var current_id = data._id;
            data.children.forEach(function (childid) {
                if (childid != 'test') {
                    htmlAddReplies(childid, current_id)
                }
            })
        } else {
            console.log('bottom level: '+data.message)
        }
    });
}

function addComment(event) {
    event.preventDefault();

    var message = $('#add-comment').find('input').val();
    if( message !== '' && safeMessage(message)) {
        var d = new Date();

        var newComment = {
            'message': message,
            'time': d.toString(),
            'reply': false
            //'children': ['test']
        };

        $.ajax({
            type: 'POST',
            data: newComment,
            url: '/collections/commentlist',
            dataType: 'JSON'
        }).done(function (response) {
            console.log(response.msg);
            if (response.msg !== '') {
                $('#add-comment').find('input').val('');
                populateComments()
            } else {
                alert('Error: ' + response.msg);
            }
        });
    } else {
        toastr.error("Invalid input");
        return false;
    }
}

function addReply(event) {
    event.preventDefault();

    var message = $(this).children('.form-control').val();
    var parentid = $(this).closest('.list-group-item').data('id');
    if (message !== '' && safeMessage(message)) {
        var d = new Date();

        var newReply = {
            'message': message,
            'time': d.toString(),
            'reply': true
        };

        $.ajax({
            type: 'POST',
            data: newReply,
            url: '/collections/commentlist',
            dataType: 'JSON'
        }).done(function (response) {
            if (response.msg !== '') {
                $(this).parent().siblings('input').val('');
                $.ajax({
                    type: 'PUT',
                    data: {'children': response[0]._id},
                    url: '/collections/commentlist/'+parentid,
                    dataType: 'JSON'
                }).done(function (response) {
                    if (response.msg === 'error') {
                        alert('Error adding reply')
                    }
                    populateComments()
                });
            } else {
                alert('Error: ' + response.msg);
            }
        });
    } else {
        toastr.error("Invalid input");
        return false;
    }
}

function safeMessage(message) {
    return !message.match(/[<>{}]/)
}

toastr.options = {
    "closeButton": false,
    "debug": false,
    "positionClass": "toast-top-right",
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};