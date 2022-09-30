$("body").on('click', '[data-page]', function () {
    const pageTitle = $(this).attr('data-page');

    $(".header__burger, .menu").removeClass("active");

    console.log(pageTitle)

    navigationController.goToPageWithTitle(pageTitle);
})

$("body").on('click', '[data-scroll]', function () {
    const scrollTarget = $(this).attr('data-scroll');

    scrollTo($(scrollTarget));
})

const scrollTo = (targetScrollElement, offset, scrollingElement) => {
    if (targetScrollElement instanceof jQuery === false) {
        return false;
    };

    const scrollSpeed = 250;
    let scrollOffset = 120;
    let $scrollingElement = $("html, body");

    if (offset !== undefined && offset !== null) { scrollOffset = offset };
    if (scrollingElement !== undefined && scrollingElement !== null) { $scrollingElement = scrollingElement };

    try {
        var scrollTarget = targetScrollElement.offset().top;
        $scrollingElement.stop(true).animate({
            scrollTop: (scrollTarget - scrollOffset) + "px"
        }, scrollSpeed);
    } catch (e) { };
}


window.onscroll = function () {
    $("[data-anim-on-scroll]").each(function () {
        if ($(this)) {
            const scrollPos = $("html, body").scrollTop(),
                thisScrollPos = $(this).offset().top,
                trigger = .6;

            if (scrollPos > thisScrollPos - window.innerHeight * trigger) {
                $(this).addClass("animate")
            }
        }
    })

}

const interactionComplete = (key) => {
    $("[data-requires='" + key + "']").show();
}

const visited = (page) => {
    $('.menu-locked[data-page="' + page + '"]').removeClass("menu-locked");
}