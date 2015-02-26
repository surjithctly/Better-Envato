// Show the config file on installation
chrome.runtime.onInstalled.addListener(function(object) {
    var optionsurl = chrome.extension.getURL("options.html");
    chrome.tabs.create({
        url: optionsurl
    }, function(tab) {});
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

// Open Opeions Page if clicked on icons
chrome.browserAction.onClicked.addListener(function(tab) { //Fired when User Clicks ICON
    chrome.tabs.create({
        url: "options.html"
    });
});



function updatedSettings() {
    //chrome.runtime.reload();
    location.reload(true);
}


// Test for notification support.
if (window.Notification) {

    if (localStorage.sales_notification != 'false') {
        // While activated, show notifications at the display frequency.
        sales_notification();
        setInterval(function() {
            sales_notification();
        }, 60000);
    }

    if (localStorage.comment_notification != 'false') {
        // While activated, show notifications at the display frequency.
        comment_notification();
        setInterval(function() {
            comment_notification();
        }, 60000);
    }


}



// Sales Notifications
function sales_notification() {

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
        var first_name = data.account.firstname;

        //earnings < new_earnings
        // testing: new_earnings > 1

        if (earnings < new_earnings) {

            $.get('http://marketplace.envato.com/api/v3/' + username + '/' + apikey + '/recent-sales.json', function(salesdata) {

                //get current sales
                var sold_item = salesdata["recent-sales"][0].item;
                var item_price = salesdata["recent-sales"][0].amount;
                show_notification(new_earnings, item_price, first_name, sold_item, 'item');
                play_sound();

            });
        }


        localStorage.earnings = new_earnings;

    });

}

// Play a sound on new sale
function play_sound() {
    if (localStorage.play_sound != 'false') {
        if ($('#cha-ching').length) $('#cha-ching').remove();
        $('<audio id="cha-ching" autoplay><source src="cha-ching.ogg" type="audio/ogg"></source><source src="cha-ching.mp3" type="audio/mpeg"></source></audio>').appendTo('body');
    }
    return false;
}

function show_notification(new_earnings, item_price, first_name, sold_item, item) {

    var praiseArray = ['Woohoo', 'Bravo', 'Wow', 'Ahoy', 'Yay', 'Yikes', 'Hooray', 'Whoa'];
    var randomPraise = praiseArray[Math.floor(Math.random() * praiseArray.length)];

    var notification = new Notification(randomPraise + '! New Sale.', {
        icon: '48.png',
        body: 'You just sold ' + sold_item + ' for $' + item_price
    });

    notification.onclick = function() {
        window.open("http://themeforest.net/statement");
    }

    setTimeout(function() {
        notification.close()
    }, 60000);


}


function comment_notification() {

    var username = localStorage.username;
    var last_comment_id = localStorage.new_comment_id;

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
            localStorage.new_comment_id = comment_id;
            play_notification();
        }

    });

    // Play a sound on new comment
    function play_notification() {
        if (localStorage.comment_sound != 'false') {
            if ($('#comment_sound').length) $('#comment_sound').remove();
            $('<audio id="comment_sound" autoplay><source src="notification.ogg" type="audio/ogg"></source><source src="notification.mp3" type="audio/mpeg"></source></audio>').appendTo('body');
        }
        return false;
    }



    function show_comments(new_comment, new_comment_item, new_comment_url, comment_id_hash) {

        var c_notification = new Notification('New Comment for ' + new_comment_item, {
            icon: '48.png',
            body: new_comment
        });

        c_notification.onclick = function() {
            window.open(new_comment_url + '/' + comment_id_hash);
        }

        setTimeout(function() {
            c_notification.close()
        }, 15000);

    }

}