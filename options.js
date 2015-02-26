/*
 ** file: options.js
 ** description: javascript code for "options.html" page
 */
function init_options() {
    //  console.log("function: init_options");

    //load currently stored options configuration
    var $inputs = $('#options-area :input');
    $inputs.each(function() {
        if (typeof localStorage[this.name] != 'undefined') {
            $(this).val(localStorage[this.name]);
        }
    });

    var $checkboxes = $('#options-area :input[type=checkbox]');
    $checkboxes.each(function() {
        if (localStorage[this.name] == 'false') {
            //alert(localStorage[this.name])
            $(this).attr('checked', false);
        } else if (localStorage[this.name] == 'true') {
            $(this).attr('checked', true);
        }
    });

}

function save_options() {
    // console.log("function: save_options");

    $("input[type=text],select,textarea").each(function() {
        localStorage[$(this).attr("name")] = $(this).val();
    });

    $("input[type=checkbox]").each(function() {
        localStorage[$(this).attr("name")] = $(this).prop("checked");
    });

    $('#saved').show().delay(1000);
    setTimeout(function() {
        $('#saved').hide();
    }, 1000);

    // console.log("favorite_movie = " + favorite_movie);

    get_sales_data();

    get_comment_data();

    chrome.extension.getBackgroundPage().updatedSettings();

}




// Sales Notifications
function get_sales_data() {

    var username = localStorage.username;
    var apikey = localStorage.apikey;
    var earnings = localStorage.earnings;

    if (typeof username == 'undefined' || typeof apikey == 'undefined') {
        return false;
    }

    // Use Envato API to check sales
    $.get('http://marketplace.envato.com/api/edge/' + username + '/' + apikey + '/account.json', function(data) {

        //get current sales
        var new_earnings = data.account.available_earnings;
        localStorage.earnings = new_earnings;

    });

}


function get_comment_data() {

    var username = localStorage.username;

    $.get('http://themeforest.net/feeds/user_item_comments/' + username + '.atom', function(data) {
        var comment_feed = $.xml2json(data);
        //console.log(comment_feed);
        var comment_id = comment_feed.entry[0].id;
        localStorage.new_comment_id = comment_id;
    });

}

//bind events to dom elements
document.addEventListener('DOMContentLoaded', init_options);
document.querySelector('#save-options-button').addEventListener('click', save_options);