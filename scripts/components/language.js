// Scripts for handling language change

function setLanguage() {

    // Set language from previously selected in suspend data.

    if (dataController.getData("language") !== null) {
        let dataLang = dataController.getData("language");
        videoLang = dataLang + '/';
        $("#helpflag").attr("src", "assets/img/flags/" + dataLang + ".svg");
        switch (dataLang) {
            case 'en-GB': // English
                languageController.lang = en;
                break;
            case 'pt-BR': // Portuguese Brazil
                languageController.lang = pt_br;
                break;
            case 'fr-FR': // French
                languageController.lang = fr;
                break;
            case 'de-DE': // German
                languageController.lang = de;
                break;
            case 'es-ES': // Spanish
                languageController.lang = es;
                break;
            case 'ru-RU': // Russian
                languageController.lang = ru;
                break;
            case 'zh-CHS': // Simplified Chinese
                languageController.lang = zh_chs;
                break;
        };
    } else {
        dataController.setData("language", "en-GB"); // Default to english
    };
    initLang(); // Reset variables for i18n

    $(".hud--lang").addClass(dataController.getData("language")); // Set flag
    $(".pop__lang").removeClass("active");
    $('.pop__lang[rel="' + dataController.getData("language") + '"]').addClass("active");


}

function populateFlags() {
    let menuLang = [
        {
            "name": "English",
            "flag": "en-GB",
            "iso": "en-GB"
        },
        {
            "name": "Português",
            "flag": "pt-BR",
            "iso": "pt-BR"
        },
        {
            "name": "Français",
            "flag": "fr-FR",
            "iso": "fr-FR"
        },
        {
            "name": "Deutsch",
            "flag": "de-DE",
            "iso": "de-DE"
        },
        {
            "name": "Español",
            "flag": "es-ES",
            "iso": "es-ES"
        },
        {
            "name": "русский",
            "flag": "ru-RU",
            "iso": "ru-RU"
        },
        {
            "name": "Simplified Chinese",
            "flag": "zh-CHS",
            "iso": "zh-CHS"
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


const languages = {
    "en-GB": '48093AAE-878B-4AC9-9E0B-99091BF884FE',
    "de-DE": 'F826565E-75D5-4FD7-992C-02BE886946C1',
    "fr-FR": '743BF21A-31AD-4B1F-BF31-96C1FD6B4FD5',
    "es-ES": '0B5B9D49-C663-4A0C-9D3E-4F6D2E43D1DF',
    "pt-BR": '82BDFAA1-65FD-48CD-8426-BE6206FD149E',
    "zh-CHS": 'DD826845-777E-4D0C-B18F-8D1A314D0110',
    "ru-RU": '5DFA70F1-6803-4F43-A701-7E17B303C484',
}

function getLang() {
    return languages[dataController.getData("language")];
}