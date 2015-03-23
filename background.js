// Show the config file on installation
chrome.runtime.onInstalled.addListener(function(object) {

    get_option('firsttime', function(value){
        if(value != 'false' || !value) {
            var optionsurl = chrome.extension.getURL("options.html");
            chrome.tabs.create({
                url: optionsurl
            }, function(tab) {});

            save_option('firsttime', 'false');
        }
    });

    var currentversion = chrome.app.getDetails().version;

    get_option('version', function(value){
        if(!value || value != currentversion) {
            chrome.browserAction.setBadgeText({text:"NEW"});

            save_option('version', currentversion);
        }
    });

//chrome.browserAction.setBadgeBackgroundColor({color:[255, 64, 64, 230]});

    // Check if localStorage is in usage
    if(!isEmpty(localStorage)) {
        // localStorage is in use, so move all options from there to chrome.storage
        //delete localStorage.apikey;

        for(var i = 0; i < localStorage.length; i++) {
            var name    = localStorage.key(i);
            var value   = localStorage.getItem(localStorage.key(i));

            save_option(name, value);

            delete localStorage[name];
        }
    }

});

// Get Local Storage value in Content Script

/*chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
 if (request.method == "getLocalStorage")
 sendResponse({data: localStorage[request.key]});
 else
 sendResponse({}); // snub them.
 });
 */

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.method) {
        // ...
        case "getLocalStorage":
            if (message.key) { // Single key provided
                sendResponse({
                    data: localStorage[message.key]
                });
            } else if (message.keys) { // An array of keys requested
                var data = {};
                message.keys.forEach(function(key) {
                    data[key] = localStorage[key];
                })
                sendResponse({
                    data: data
                });
            }
            break;
        // ...
    }
});

// Open Options Page if clicked on icons
chrome.browserAction.onClicked.addListener(function(tab) { //Fired when User Clicks ICON
    chrome.tabs.create({
        url: "options.html"
    });
    chrome.browserAction.setBadgeText({text:""});
});

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

function updatedSettings() {
    //chrome.runtime.reload();
    location.reload(true);
}


// Test for notification support.
if (window.Notification) {

    get_option('sales_notification', function(value){
        if(value != 'false') {
            sales_notification();
            setInterval(function() {
                sales_notification();
            }, 60000);
        }
    });
    get_option('comment_notification', function(value){
        if(value != 'false') {
            comment_notification();
            setInterval(function() {
                comment_notification();
            }, 60000);
        }
    });

}



// Sales Notifications
function sales_notification() {
    get_option('username', function(value){
        var username = value;
        if(typeof  username == 'undefined') {
            return false;
        }
        get_option('apikey', function(value){
            var apikey = value;
            if(typeof apikey == 'undefined') {
                return false;
            }
            get_option('earnings', function(value){
                var earnings = value;

                // Use Envato API to check sales
                $.get('http://marketplace.envato.com/api/edge/' + username + '/' + apikey + '/account.json', function(data) {

                    //get current sales
                    var new_earnings = data.account.available_earnings;
                    var first_name = data.account.firstname;

                    if (earnings < new_earnings) {

                        $.get('http://marketplace.envato.com/api/v3/' + username + '/' + apikey + '/recent-sales.json', function(salesdata) {

                            //get current sales
                            var sold_item = salesdata["recent-sales"][0].item;
                            var item_price = salesdata["recent-sales"][0].amount;
                            show_notification(new_earnings, item_price, first_name, sold_item, 'item');
                            play_sound();

                        });
                    }

                    save_option('earnings', new_earnings);

                });
            });
        });
    });
}

// Play a sound on new sale
function play_sound() {
    get_option('play_sound', function(value){
        if(value != 'false') {
            if ($('#cha-ching').length) $('#cha-ching').remove();
            $('<audio id="cha-ching" autoplay><source src="sound/cha-ching.ogg" type="audio/ogg"></source><source src="sound/cha-ching.mp3" type="audio/mpeg"></source></audio>').appendTo('body');
        }
        return false;
    });
}

function show_notification(new_earnings, item_price, first_name, sold_item, item) {
    var praiseArray = ['Woohoo', 'Bravo', 'Wow', 'Ahoy', 'Yay', 'Yikes', 'Hooray', 'Whoa', 'Woot', 'Oh joy', first_name];
    var randomPraise = praiseArray[Math.floor(Math.random() * praiseArray.length)];

    var notification = new Notification(randomPraise + '! New Sale.', {
        icon: 'img/48.png',
        body: 'You just sold ' + sold_item + ' for $' + item_price
    });

    notification.onclick = function() {
        window.open("http://themeforest.net/statement");
    }

    get_option('auto_hide_sales_notification', function(value){
        if(value != 'false') {
            setTimeout(function() {
                notification.close()
            }, 15000);
        }
    });
}


function comment_notification() {
    get_option('username', function(value){
        var username = value;
        get_option('new_comment_id', function(value){
            var last_comment_id = value;

            $.get('http://themeforest.net/feeds/user_item_comments/' + username + '.atom', function(data) {
                //console.log(data);
                var comment_feed = $.xml2json(data);
                //console.log(comment_feed);
                var comment_id = comment_feed.entry[0].id;
                var comment_id_hash = comment_id.substr(comment_id.lastIndexOf('/') + 1);
                var comment_author = comment_feed.entry[0].author.name;
                var new_comment = /* $(comment_feed.entry[0].content.text).text(); */ comment_feed.entry[0].content.text.replace(/(<([^>]+)>)/ig, "");
                new_comment = new_comment.replace(/\s{2,}/g, ' ');
                var new_comment_item = $.trim(comment_feed.entry[0].title).substring(0, 20).split(" ").slice(0, -1).join(" ") + "...";
                var new_comment_url = comment_feed.entry[0].link.href;
                //console.log(new_comment);

                if (last_comment_id != comment_id && comment_author != username) {
                    show_comments(new_comment, new_comment_item, new_comment_url, comment_id_hash);
                    save_option('new_comment_id', comment_id);
                    play_notification();
                }

            });

            // Play a sound on new comment
            function play_notification() {
                get_option('comment_sound', function(value){
                    if(value != 'false') {
                        if ($('#comment_sound').length) $('#comment_sound').remove();
                        $('<audio id="comment_sound" autoplay><source src="sound/notification.ogg" type="audio/ogg"></source><source src="sound/notification.mp3" type="audio/mpeg"></source></audio>').appendTo('body');
                    }
                    return false;
                });
            }

            function show_comments(new_comment, new_comment_item, new_comment_url, comment_id_hash) {

                var c_notification = new Notification('New Comment for ' + new_comment_item, {
                    icon: 'img/48.png',
                    body: new_comment
                });

                c_notification.onclick = function() {
                    window.open(new_comment_url + '/' + comment_id_hash);
                }

                get_option('auto_hide_comment_notification', function(value){
                    if(value != 'false') {
                        setTimeout(function() {
                            c_notification.close()
                        }, 15000);
                    }
                });

            }

        });
    });
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
            alert('An error occured: ' + chrome.extension.lastError.message);
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