$("body").on('click', '.header__burger', function () {
    $(this).toggleClass("active");
    $(".menu").toggleClass("active");
});