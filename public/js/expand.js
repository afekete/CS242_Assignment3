/**
 * Created by Alec on 10/21/2014.
 */
$(document).ready(function() {
    $('.expandable').siblings('.list-group').hide();
    $('.expandable').click(function(e) {
        e.preventDefault();

        $(this).siblings('.list-group').toggle();

        if($(this).hasClass('project')) {
            $(this).toggleClass('active');
        }else if($(this).hasClass('file')) {
            $(this).toggleClass('list-group-item-success');
        }else if($(this).hasClass('name')) {
            $(this).toggleClass('list-group-item-info');
            var $embedded = $(this).siblings('.list-group').children('embed, img, iframe');
            if($embedded.data('src')) {
                $embedded.prop('src', $embedded.data('src')).data('src', false);
            }
            // adapted from http://stackoverflow.com/questions/19482601/have-iframe-load-when-visible
        }else if($(this).hasClass('version')) {
            $(this).toggleClass('list-group-item-warning');
        }
    })
});