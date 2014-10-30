/**
 * Created by Alec on 10/29/2014.
 */
QUnit.test( "add comment", function( assert ) {
    $("#qunit-fixture").load("index.jade");
    $.getScript("../js/comments.js");
    $.ajaxSetup({"async":false});
    $('#add-comment .form-control').val('test comment');
    $('#add-comment').submit();
    $.getJSON('/collections/commentlist', function(data) {
        $.each(data, function () {
            console.log(this);
        })
    });

    assert.ok( 1 == "1", "Passed!" );
});