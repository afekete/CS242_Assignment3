/**
 * Created by Alec on 10/27/2014.
 */
// interactions with mongodb based on http://cwbuecheler.com/web/tutorials/2014/restful-web-app-node-express-mongodb/
var commentList = [];

/*
When the document is ready, add the comments from the database,
then listen for comment form submissions and clicks on the reply button.
 */
$(document).ready(function() {
    populateComments();
    var commentSection = $('#comments');
    $('#add-comment').on('submit', commentRouter);
    commentSection.on('submit', '.add-reply', replyRouter);
    commentSection.on('click', '.comment-reply', function (e) {
        e.preventDefault();
        $(this).parent().siblings('.add-reply').toggle()
    });
});

/**
 * Routes comment submissions through the word filter to avoid synchronization issues
 * @param event The event that called this function
 */
function commentRouter(event) {
    event.preventDefault();
    var message = $('#add-comment').find('input').val();
    var tag = $(this);
    filterMessage(message, 'comment', tag)
}

/**
 * Routes reply submissions through the word filter to avoid synchronization issues
 * @param event The event that called this function
 */
function replyRouter(event) {
    event.preventDefault();
    var message = $(this).children('.form-control').val();
    var tag = $(this);
    filterMessage(message, 'reply', tag)
}

/*
 Add top level comments from the database and call the function to add their children
 */
function populateComments() {
    var comment = '';
    // Remove comments previously added
    $('#comments').find('.list-group').html('');

    // Get comments from database
    $.getJSON('/collections/commentlist', function(data) {
        // Generate and append each top level comment to the html
        $.each(data, function() {
            if(this.reply == 'false') {
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

                $('#comments').find('.list-group').append(comment);
                comment = '';

                // Recursively and asynchronously add replies
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
    });
}

/**
 * Recursively add replies to their parent comments
 * @param childid The id of the reply to get from the database
 * @param parent_id The id of the parent comment
 */
function htmlAddReplies(childid, parent_id) {
    var new_comment = '';

    // Get the specified reply from the database
    $.getJSON('/collections/commentlist/' + childid, function (data) {
        // generate the html and append it to the parent
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

        $('.list-group-item[data-id=' + parent_id + ']').append(new_comment);

        // If it has children, add each child with the same function
        if (typeof data.children != 'undefined') {
            var current_id = data._id;
            data.children.forEach(function (childid) {
                if (childid != 'test') {
                    htmlAddReplies(childid, current_id)
                }
            })
        }
    });
}

/**
 * Add a top level comment to the database
 * @param message The text of the comment
 * @returns {boolean} False if the input isnt valid
 */
function addComment(message) {
    if( message !== '' && safeMessage(message)) {
        var d = new Date();

        // Create comment json
        var newComment = {
            'message': message,
            'time': d.toString(),
            'reply': false
        };

        // Post comment to database
        $.ajax({
            type: 'POST',
            data: newComment,
            url: '/collections/commentlist',
            dataType: 'JSON'
        }).done(function (response) {
            // Set input box to empty and repopulate comments
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

/**
 * Add reply to comment to the database
 * @param message The text of the reply
 * @param tag The tag the reply comes from (for removing the text on submission
 * @returns {boolean} False if the message is invalid
 */
function addReply(message, tag) {

    // save id of parent comment
    var parentid = tag.closest('.list-group-item').data('id');
    if (message !== '' && safeMessage(message)) {
        var d = new Date();

        // Create json comment
        var newReply = {
            'message': message,
            'time': d.toString(),
            'reply': true
        };

        // Post comment to database
        $.ajax({
            type: 'POST',
            data: newReply,
            url: '/collections/commentlist',
            dataType: 'JSON'
        }).done(function (response) {
            if (response.msg !== '') {
                // Set the input to empty and add the new child to the list of child ids
                tag.parent().siblings('input').val('');
                $.ajax({
                    type: 'PUT',
                    data: {'children': response[0]._id},
                    url: '/collections/commentlist/'+parentid,
                    dataType: 'JSON'
                }).done(function (response) {
                    // Then repopulate comments
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

/**
 * Checks if the message has any illegal characters
 * @param message The message being submitted
 * @returns {boolean} True if the message is safe, false otherwise
 */
function safeMessage(message) {
    return !message.match(/[<>{}]/)
}

/**
 * Replace words on the database bad word list with their replacements
 * Probably shouldn't query database each submission
 * @param message The message being submitted
 * @param type Whether it's a reply or a comment (passed as a string)
 * @param tag The tag the reply was submitted from. Doesn't apply for top level comments
 */
function filterMessage(message, type, tag) {
    var fixedMessage = message;

    // Get list of bad words
    $.getJSON('/collections/bad_words', function (data) {
        var word_list = data[0];
        for (bad_word in word_list) {
            if(word_list.hasOwnProperty(bad_word) && bad_word != '_id') {
                // For each bad word in the list, use a regex to replace that word with the replacement word
                var regex = new RegExp(bad_word, "gi");
                fixedMessage = fixedMessage.replace(regex, word_list[bad_word]);
            }
        }
        // Add the comment or reply
        if(type == 'comment') {
            addComment(fixedMessage)
        } else {
            addReply(fixedMessage, tag)
        }
    });
}

// Set options for my error notifier
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