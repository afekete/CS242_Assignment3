/**
 * Created by Alec on 10/21/2014.
 */
$(document).ready(function() {
    $('.expandable').click(function(e) {
        // prevent reloading the page
        e.preventDefault();

        // Add color when selected by toggling a class
        if($(this).hasClass('project')) {
            $(this).toggleClass('active');
        }else if($(this).hasClass('file')) {
            $(this).toggleClass('list-group-item-success');
        }else if($(this).hasClass('name')) {
            $(this).toggleClass('list-group-item-info');
            // The first time a specific file is expanded, swap in the file source if it is an image or text doc
            // adapted from http://stackoverflow.com/questions/19482601/have-iframe-load-when-visible
            var $embedded = $(this).siblings('.list-group').children('img, iframe');
            if($embedded.data('src')) {
                $embedded.prop('src', $embedded.data('src')).data('src', false);
            }
        }else if($(this).hasClass('version')) {
            $(this).toggleClass('list-group-item-warning');
        }

        // Toggle showing list-group siblings
        $(this).siblings('.list-group').slideToggle("medium");
    })
});