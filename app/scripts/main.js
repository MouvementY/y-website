$(document).ready(function() {
    'use strict';

    var quotes = $('.fancy-quote');
    quotes.revealing();

    // delay the animation otherwise it won't show up
    setTimeout(function() {
        quotes.revealing('show');
    }, 200);

    // fill up with some users
    var users = window.users || [],
        userIndexStart = 0,
        userIndexStop = 100,
        userWrapper = $('.people'),
        loadUsers = function(start, stop) {
            users.slice(start, stop).forEach(function(u) {
                userWrapper.append($('<div class="person"><img src="images/thumbs/'+u.username+'.jpg"></div>'));
            });
        };

    loadUsers(userIndexStart, userIndexStop);
    userWrapper.revealing({
        tokenizer: function(node) {
            if ($(node).children('.person').length) {
                $(node).children('.person').wrap('<span></span>');
                return [node];
            }

            return null;
        }
    });

    // only reveal people when the images are loaded
    $('.person img').imagesLoaded(function() {
        userWrapper.revealing('show');
    });

    // fill up with more people when it reaches the bottom
    var bottomReachedPadding = 100,
        loadingMore = false,
        endReached = false;
    $(document).bind('scroll', function() {
        if($(this).scrollTop() + window.innerHeight + bottomReachedPadding >= $(this).innerHeight()) {
            if (endReached) {
                return;
            }

            if (!loadingMore) {
                loadingMore = true;

                userIndexStart = userIndexStop;
                if (userIndexStart >= users.length) {
                    endReached = true;
                    return;
                }

                userIndexStop += 100;
                if (userIndexStop > users.length) {
                    userIndexStop = users.length-1;
                }

                loadUsers(userIndexStart, userIndexStop);
                userWrapper.data('plugin_revealing').tokenize();

                userWrapper.find('span').css('opacity', 0);
                $('.person img').imagesLoaded(function() {
                    userWrapper.find('span').removeAttr('style');
                });
                setTimeout(function() {
                    loadingMore = false;
                }, 500);
            }
        }
    });
});