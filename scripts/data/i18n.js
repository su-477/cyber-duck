var isInit = false;
var pgTranslated = false;
var pgNo, epgNo, l, lang, langID, curLang, lLangPage, lFields, lNav, lScorm, lKc, lGen

function initLang() {
    pgNo = navigationController.activePageAsNo();
    //console.log(epgNo);

    l = scormController.lang();
    lang = languageController.lang;
    langID = 0;
    $.each(lang, function (i, v) {
        if (l === lang[i].isocode) { langID = i }
    });
    curLang = lang;
    lLangPage = lang.pages[0];
    lFields = lang.pages[0].fields;
    //console.log(lFields)
    try {
        lLangPage = lang.pages[pgNo];
        lFields = lang.pages[pgNo].fields;
    } catch (ex) {
        //
    }

    lNav = lang.nav.fields;
    lScorm = lang.scorm.fields;
    lKc = lang.kc.fields;
    lGen = lang.general;
    isInit = true;
}

try {
    initLang();
} catch (err) {
    isInit = false;
}

function translatePage() {
    lang = languageController.lang;
    //There should be the same amount of fields as controls so we can do these more effeciently by going list first
    var count = 0;
    $.each(lFields, function (i, j) {
        if (j.imageurl !== '') {
            $('[data-i18n_ap="' + j.key + '"]').attr('src', j.imageurl);
        } else {
            
            $('[data-i18n_ap="' + j.key + '"]').html(j.Text);
        }
        //console.log('a: ' + $('[data-i18n_ap="' + j.key + '"]').length);
        //console.log(j.key + ' ' + j.Text);
        count++;
        //Check for notes enabled text
        if (j.n === 1) {
            //this is a note
            //console.log("FID:" + j.fID);
            $('[data-i18n_ap="' + j.key + '"]').attr("data-nid", j.fID);
            $('[data-i18n_ap="' + j.key + '"]').addClass("nicon");

        }
    });
    pgTranslated = true;
    translateAdditionals();

}


function translateAdditionals() {
    $('[data-i18n_n]').each(function () {
        var key = $(this).attr("data-i18n_n");
        $.each(lNav, function (i, j) {
            if (key == j.key) {
                $('[data-i18n_n="' + j.key + '"]').html(j.Text);
            }
        });
    });

    //same with general items
    $('[data-i18n_g]').each(function () {
        var key = $(this).attr("data-i18n_g");
        $.each(lGen, function (i, j) {
            if (key === j.key) {
                if (j.n === 1) {
                    $('[data-i18n_g="' + j.key + '"]').html("<span class='nicon' data-nid='" + j.fID + "'>" + j.Text + "</span>");
                } else {
                    $('[data-i18n_g="' + j.key + '"]').html(j.Text);
                }
            }
        });
    });
}

function translateNav() {
    $.each(lNav, function (i, j) {
        $('[data-i18n_n="' + j.key + '"]').html(j.Text);
    });
}


function getGeneralTText(k) {
    var tg = ""; $.each(lGen, function (i, j) {
        if (j.key === k) {
            if (j.n === 1) {
                tg = "<span class='nicon' data-nid='" + j.fID + "'>" + j.text + "</span>";
            } else {
                tg = j.Text;
            }
        }
    }); return tg;
}

function getGeneralTImage(key) { var tg = ""; $.each(lGen, function (i, j) { if (j.key == key) { tg = j.imageurl; } }); return tg; }
