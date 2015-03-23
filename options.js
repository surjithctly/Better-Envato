/*
 ** file: options.js
 ** description: javascript code for "options.html" page
 */
function init_options() {
    //  console.log("function: init_options");

    var current_object = [];

    //load currently stored options configuration
    var $inputs = $('#options-area :input');
    $inputs.each(function() {
        current_object[$(this).attr('name')] = $(this);

        get_option($(this).attr('name'), function(value, name) {
            current_object[name].val(value);
        });
    });

    var $checkboxes = $('#options-area :input[type=checkbox]');
    $checkboxes.each(function() {
        current_object[$(this).attr('name')] = $(this);

        get_option($(this).attr('name'), function(value, name){
            if(value == 'false') {
                current_object[name].attr('checked', false);
            } else if (value == 'true') {
                current_object[name].attr('checked', true);
            }
        });
    });

    get_option('currency', function(value, name){
        $('select[name='+name+']').select(value);
    });
}

function save_options() {
    // console.log("function: save_options");
    chrome.storage.sync.clear();

    $("input[type=text],select,textarea").each(function() {
        var name    = $(this).attr('name');
        var value   = $(this).val();

        save_option(name, value);
    });

    $("input[type=checkbox]").each(function() {
        var name    = $(this).attr('name');
        var value   = $(this).prop('checked').toString();

        save_option(name, value);

        if(name == 'cache_currency_rate') {
            // Fetch latest currency rate
            get_option('openexchange', function(apikey){
                var conversionurl       = 'http://openexchangerates.org/api/latest.json?app_id=' + apikey;
                var current_timestamp   = Math.floor(Date.now() / 1000);
                $.getJSON(conversionurl, function(data) {
                    get_option('currency', function(currency){
                        save_option('currency_rate', current_timestamp+'||'+data.rates[currency]);
                    });
                });
            });
        }
    });

    $(this).text('Saving...').removeClass("btn-success");

    setTimeout(function() {
        $('#save-options-button').text('Options Saved');
    }, 700);

    get_option('reviewed', function(value){
        if(value != 'true') {
            $('#rate-it').html('<div class="highlight">Enjoying <strong>Better Envato</strong>? Head over to the <a class="fivestars" href="https://chrome.google.com/webstore/detail/better-envato/mlbkjbladkceacbifjpgimbkibhgbadf/reviews" target="_bank">Chrome Web Store</a> and give it 5 stars. We will love you <em>forever</em>.</div>');
        }
    });

    get_sales_data();
    get_comment_data();
    chrome.extension.getBackgroundPage().updatedSettings();
}

/**
 * Saves option to Chrome.storage
 */
function save_option(name, value){
    var object      = {};
    object[name]    = value;

    chrome.storage.sync.set(object, function() {
        if(chrome.extension.lastError) {
            console.log('An error occured: ' + chrome.extension.lastError.message);
            return false;
        } else {
            return true;
        }
    });
}

/**
 * Gets option from Chrome.storage
 */
function get_option(name, callback) {
    chrome.storage.sync.get(name, function(response) {
        callback(response[name], name);
    })
}

/**
 * Reset the save button
 */
$('input, select').on('keyup click', function () {
    $('#save-options-button').text('Save Options').addClass("btn-success");
});


/**
 * Store that the user has already been to the Web Store (:. we <3 them)
 */

$('body').on('click', '.fivestars', function () {
    save_option('reviewed', 'true');
    $('#rate-it').html('<div class="highlight love">You\'re <strong>awesome</strong> &hearts;');
});

// Sales Notifications
function get_sales_data() {

    get_option('username', function(value) {
        if(typeof  value == 'undefined') {
            return false;
        }
        var username = value;
        get_option('apikey', function(value) {
            if(typeof value == 'undefined') {
                return false;
            }
            var apikey = value;
            get_option('earnings', function(value) {
                var earnings = value;

                // Use Envato API to check sales
                $.get('http://marketplace.envato.com/api/edge/' + username + '/' + apikey + '/account.json', function(data) {

                    //get current sales
                    var new_earnings = data.account.available_earnings;
                    save_option('earnings', new_earnings);

                });
            });
        });
    });
}

function get_comment_data() {

    get_option('username', function(value) {
        var username = value;

        $.get('http://themeforest.net/feeds/user_item_comments/' + username + '.atom', function(data) {
            var comment_feed = $.xml2json(data);
            //console.log(comment_feed);
            var comment_id = comment_feed.entry[0].id;
            save_option('new_comment_id', comment_id);
        });
    });

}

//bind events to dom elements
document.addEventListener('DOMContentLoaded', init_options);
document.querySelector('#save-options-button').addEventListener('click', save_options);