// Scripts for handling language change

function setLanguage() {

    // Set language from previously selected in suspend data.

    if (dataController.getData("language") !== null) {

        let dataLang = dataController.getData("language");

        videoLang = dataLang + '/';

        switch (dataLang) {
            case 'en': // English
                languageController.lang = en;
                break;
            case 'fr': // French
                languageController.lang = fr;
                break;
        };
    } else {
        dataController.setData("language", "en"); // Default to english
    };
    initLang(); // Reset variables for i18n
    

}

function populateFlags() {
    let menuLang = [
        {
            "name": "English",
            "flag": "en",
            "iso": "en"
        },
        {
            "name": "Français",
            "flag": "fr",
            "iso": "fr"
        }
    ];

    for (var i = 0; i < menuLang.length; i++) {
        // Add row to language selector
        $("#lang").append("<div class='pop__lang' rel='" + menuLang[i].iso + "'><img alt='" + menuLang[i].name + "' class='pop__lang__flag' src='assets/img/flags/" + menuLang[i].flag + ".svg'/><p class='pop__lang__name'>" + menuLang[i].name + "</p></div>");
    };

    $("body").on('click', '.pop__lang', function () {

        var rel = $(this).attr("rel"); // get lang ISO

        $(".hud--lang").removeClass(dataController.getData("language")); // Clear flag
        $(".hud--lang").addClass(rel); // Set flag

        dataController.setData("language", rel); // set lang ISO to suspend data
        setLanguage(); // Tell the language controller

        $(".pop").removeClass("open"); // Close popup

        navigationController.goToPage(navigationController.activePage); //Reload page
    });

}