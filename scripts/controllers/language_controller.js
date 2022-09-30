const LanguageController = function () {
    const self = this;
    this.langLocation = 2; //1 = from server, 2 = from file
    this.lang = en;
    this.langID = 0;
    this.langISO = "";
    this.langName = "";
    this.imgArray = null;
    this.imgArrayCreated = false;
    this.localCopy = self.lang.pages;

    /*

    this.changeActiveLang = function (lang) {
        var currentLangISO = dataController.getData("languageISO");
        var currentLangName = dataController.getData("languageName");
        if (currentLangISO == null || currentLangISO == "null") {
            $("#langSelectorOverlay").fadeIn();
        } else {
            self.langName = currentLangName;
            self.langISO = currentLangISO;
            $(".language").removeClass("active");
            $("#languageButton").html(self.langName);
            $(".language." + self.langISO).addClass("active")
        }
    }

    */

    this.buildImageArray = function () {
        let arr = new Array(),
            p = self.lang.pages;

        for (var i = 0; i < p.length; i++) {
            let f = p[i].fields;

            for (var ii = 0; ii < f.length; ii++) {
                if (f[ii].Text === "" && f[ii].ImageURL !== "") {
                    let o = {
                        fileIndex: i,
                        file: p[i].File,
                        title: p[i].title,
                        key: f[ii].key,
                        src: f[ii].ImageURL,
                    },
                        exists = false;

                    for (var c = 0; c < arr.length; c++) {
                        if (JSON.stringify(arr[c]) === JSON.stringify(o)) {
                            exists = true;
                        }
                    }

                    if (exists === false) {
                        arr.push(o);
                    }
                }
            }
        }

        self.imgArrayCreated = true;

        return arr;
    };

    function initLang() {
        if (self.imgArrayCreated === false) {
            self.imgArray = self.buildImageArray();
        }

        if (self.langLocation == 1) {
            //get from server if we have remote lang enabled
            //GET NAV
            $.ajax({
                type: "GET",
                url: "" + self.langID + "&type=1&projectid=" + projectID,
                async: true,
                crossDomain: true,
            }).done(function (nav) {
                self.lang.nav = nav;
            });
            //GET SCORM
            $.ajax({
                type: "GET",
                url: "" + self.langID + "&type=2&projectid=" + projectID,
                async: true,
                crossDomain: true,
            }).done(function (scorm) {
                self.lang.scorm = scorm;
            });
            //GET KC
            $.ajax({
                type: "GET",
                url: "" + self.langID + "&type=3&projectid=" + projectID,
                async: true,
                crossDomain: true,
            }).done(function (kc) {
                self.lang.kc = kc;
            });
            //GET GENERAL
            $.ajax({
                type: "GET",
                url: "" + self.langID + "&type=4&projectid=" + projectID,
                async: true,
                crossDomain: true,
            }).done(function (general) {
                self.lang.general = general;
            });
            //GET PAGES
            $.ajax({
                type: "GET",
                url: "" + self.langID + "&projectid=" + projectID,
                async: true,
                crossDomain: true,
            }).done(function (pages) {
                self.lang.pages = pages;
            });
        }
    }

    this.updateCurrentPageText = function () {
        //first get the fields
        let pageItems = [];
        $.each(self.lang.pages, function (i, p) {
            if (p.File == navigationController.currentPageUrl) {
                pageItems = p.fields;
            }
        });
        //Now replace anything we need to
        $.each(pageItems, function (i, j) {
            if (j.ImageURL != "" && j.ImageURL != null) {
                $('[data-src="' + j.key + '"]').attr("src", j.ImageURL);
            }
            if (j.Text != "" && j.Text != null) {
                $('[data-text="' + j.key + '"]').html(j.Text);
            }
            if (j.VideoURL != "" && j.VideoURL != null) {
                $('[data-src="' + j.key + '"]').attr("src", j.VideoURL);
            }
        });
    };

    this.updateDebugPageText = function () {
        //if (self.langLocation === 2) return;

        $("#debugConsoleText table tbody tr").remove();

        let pageItems = [];
        let thisPage = null;
        $.each(self.lang.pages, function (i, p) {
            if (p.File == navigationController.currentPageUrl) {
                pageItems = p.fields;
                thisPage = p;
            }
        });

        //Now replace anything we need to
        $.each(pageItems, function (i, j) {
            if (j.ImageURL != "" && j.ImageURL != null) {
                $("#debugConsoleText table tbody").append(
                    "<tr><td class='imageIcon'>&there4;</td><td>" +
                    j.key +
                    "</td>\
                    <td><img class='debug-content--btn debugImageSelect' id='img_" +
                    j.ContentId +
                    "' data-class='" +
                    j.Class +
                    "' data-key='" +
                    j.key +
                    "' data-type='" +
                    j.Type +
                    "' data-Language='" +
                    j.Language +
                    "' data-pageid='" +
                    j.PageID +
                    "' data-ContentID='" +
                    j.ContentId +
                    "' data-ProjectID='" +
                    j.ProjectID +
                    "' onclick='languageController.updateImageItem(this)' src='" +
                    j.ImageURL +
                    "' data-src='" +
                    j.ImageURL +
                    "'/></td>\
                    <td><div class='debug-content--btn' data-class='" +
                    j.Class +
                    "' data-key='" +
                    j.key +
                    "' data-type='" +
                    j.Type +
                    "' data-Language='" +
                    j.Language +
                    "' data-pageid='" +
                    j.PageID +
                    "' data-ContentID='" +
                    j.ContentId +
                    "' data-src='" +
                    j.ImageURL +
                    "'data-ProjectID='" +
                    j.ProjectID +
                    "' onclick='languageController.seeEditHistory(this)'>Edit history</div></td></tr>"
                );
            }
            if (j.VideoURL != "" && j.VideoURL != null) {
                //$('#debugConsoleText table tbody').append("<tr><td class='videoIcon'>&#9655;</td><td>" + thisPage.File + "</td><td>" + j.key + "</td><td contenteditable id='vid_" + j.ContentId + "'>" + j.VideoURL + "</td><td><div class='debugrndbtn' data-class='" + j.Class + "' data-key='" + j.key + "' data-type='" + j.Type + "' data-Language='" + j.Language + "' data-pageid='" + j.PageID + "' data-ContentID='" + j.ContentId + "' data-ProjectID='" + j.ProjectID +"' onclick='languageController.updateVideoItem(this)'>></div></td></tr>");
            }
            if (j.Text != "" && j.Text != null) {
                $("#debugConsoleText table tbody").append(
                    "<tr><td class='textIcon'>T</td><td>" +
                    j.key +
                    "</td><td class='debug-content--btn' id='txt_" +
                    j.ContentId +
                    "' data-class='" +
                    j.Class +
                    "' data-key='" +
                    j.key +
                    "' data-type='" +
                    j.Type +
                    "' data-Language='" +
                    j.Language +
                    "' data-pageid='" +
                    j.PageID +
                    "' data-ContentID='" +
                    j.ContentId +
                    "' data-ProjectID='" +
                    j.ProjectID +
                    "' onclick='languageController.updateTextItem(this)'>" +
                    j.Text +
                    "</td>\
                    <td><div class='debug-content--btn' data-class='" +
                    j.Class +
                    "' data-key='" +
                    j.key +
                    "' data-type='" +
                    j.Type +
                    "' data-Language='" +
                    j.Language +
                    "' data-pageid='" +
                    j.PageID +
                    "' data-ContentID='" +
                    j.ContentId +
                    "' data-ProjectID='" +
                    j.ProjectID +
                    "' onclick='languageController.seeEditHistory(this)'>Edit history</div></td></tr>"
                );
            }
        });
    };

    this.updateImageItem = function (i) {
        //if (self.langLocation === 2) {
        //    testController.alert("Live image editing is disable during development. For any image updates, list these as 'Bugs' in DevOps Work Items.")
        //    return false;
        //}

        // Load text editor

        // Load text editor
        $.get("edit/ajax/_imageEditor.html", function (data) {

            $("body").append(data);
            $(".editor").fadeIn(250);

            let currentImageID = $("#img_" + $(i).data("contentid"));
            let currentImageURL = $(i).data("src")

            // Populate image pane
            let imgArr = self.imgArray;

            for (var s = 0; s < imgArr.length; s++) {
                let url = imgArr[s].src;
                $(".image-editor__pane").append("<div class='image-editor__img' data-url='" + url + "' style='background-image: url(" + url + ")'></div>");
            }

            $(".image-editor__img").on("click", function () {
                $(".image-editor__img").removeClass("active");
                $(this).addClass("active");
            });

            $("#editor-close").on("click", function () {
                $(".editor").fadeOut(250, function () {
                    $(".editor").remove();
                });
            });

            $(".image-editor__btn").on("click", function () {
                if (self.langLocation === 2) {
                    testController.alert("Live image editing is disable during development. For any text updates, list these as 'Bugs' in DevOps Work Items.");
                    return false;
                }

                if ($(".image-editor__img.active").length === 0) {
                    testController.alert("Please select an image.");
                    return false;
                }

                let $this = $(this),
                    d = new Date(),
                    curDate = d.toUTCString(),
                    data = {
                        Class: $(i).data("class"),
                        Type: $(i).data("type"),
                        Text: "",
                        VideoURL: "",
                        ImageURL: $(".image-editor__img.active").data("url"),
                        Language: $(i).data("language"),
                        ProjectID: $(i).data("projectid"),
                        PageID: $(i).data("pageid"),
                        ContentId: $(i).data("contentid"),
                        key: $(i).data("key"),
                        userID: window.testController.userID,
                        created: curDate
                    };

                $this.addClass("loading");
                $this.html("Authenticating");
                console.log(data);

                let success = function () {
                    initLang();
                    $(".image-editor").addClass("ok");
                    $this.html("Image updated!");
                    navigationController.goToPage(navigationController.activePage);
                    setTimeout(function () {
                        $(".editor").fadeOut(250, function () {
                            $(".editor").remove();
                        });
                    }, 1500);
                }

                let failure = function () {
                    $this.html("Failed to update image, please try again.");
                    setTimeout(function () {
                        $this.removeClass("loading");
                    }, 2500);
                }

                self.postImageUpdate(data, success, failure);
            });

        });
    };

    this.updateVideoItem = function (i) {
        let d = new Date(),
            curDate = d.toUTCString(),
            data = {
                Class: $(i).data("class"),
                Type: $(i).data("type"),
                Text: "",
                VideoURL: $("#vid_" + $(i).data("ContentID")).html(),
                ImageURL: "",
                Language: $(i).data("language"),
                ProjectID: $(i).data("projectid"),
                PageID: $(i).data("pageid"),
                ContentId: $(i).data("ContentID"),
                key: $(i).data("key"),
                userID: window.testController.userID,
                created: curDate
            };

        $.ajax({
            type: "POST",
            data: data,
            url: "",
            async: true,
            crossDomain: true,
        }).done(function (pages) {
            initLang();
        });

    };

    this.updateTextItem = function (i) {
        if (self.langLocation === 2) {
            testController.alert("Live text editing is disable during development. For any text updates, list these as 'Tasks' in DevOps Work Items.");
            return false;
        }
        // Load text editor
        $.get("edit/ajax/_textEditor.html", function (data) {
            $("body").append(data);

            $(".editor").fadeIn(250);

            let currentText = $("#txt_" + $(i).data("contentid")),
                html = false;

            $("#textedit").val(currentText.text());

            $(".text-editor__html").on("click", function () {
                if (html === false) {
                    $("#textedit").val(currentText.html());
                    $(this).html("<b>HTML</b>/Text");
                } else {
                    $("#textedit").val(currentText.text());
                    $(this).html("HTML/<b>Text</b>");
                }
                html = !html;
            });
            $("#editor-close").on("click", function () {
                $(".editor").fadeOut(250, function () {
                    $(".editor").remove();
                });
            });

            $(".text-editor__btn").on("click", function () {
                let $this = $(this),
                    d = new Date(),
                    curDate = d.toUTCString(),
                    data = {
                        Class: $(i).data("class"),
                        Type: $(i).data("type"),
                        Text: $("#textedit").val(),
                        VideoURL: "",
                        ImageURL: "",
                        Language: $(i).data("language"),
                        ProjectID: $(i).data("projectid"),
                        PageID: $(i).data("pageid"),
                        ContentId: $(i).data("contentid"),
                        key: $(i).data("key"),
                        userID: window.testController.userID,
                        created: curDate
                    };

                $this.addClass("loading");
                $this.html("Authenticating");
                console.log(data);

                let success = function () {
                    initLang();
                    self.getContentHistory(data.ContentId);
                    $(".text-editor").addClass("ok");
                    $this.html("Text updated!");
                    navigationController.goToPage(navigationController.activePage);
                    setTimeout(function () {
                        $(".editor").fadeOut(250, function () {
                            $(".editor").remove();
                        });
                    }, 1500);
                }

                let failure = function () {
                    $this.html("Failed to update text, please try again.");
                    setTimeout(function () {
                        $this.removeClass("loading");
                    }, 2500);
                }

                self.postTextUpdate(data, success, failure);


            });

        });

    };

    this.postImageUpdate = function (data, success, failure) {
        $.ajax({
            type: "POST",
            data: data,
            url: "https://pmprojectv3.purplemediahosting.co.uk/classroomAPI/LanguageAPI/updateContent",
            async: true,
            crossDomain: true,
        })
            .done(function (pages) {
                // Success callback
                success();
            })
            .fail(function (e) {
                // failed to update text
                console.log(e);
                // Failure callback
                failure();
            });
    }
    this.postTextUpdate = function (data, success, failure) {
        $.ajax({
            type: "POST",
            data: data,
            url: "https://pmprojectv3.purplemediahosting.co.uk/classroomAPI/LanguageAPI/updateContent",
            async: true,
            crossDomain: true
        })
            .done(function (pages) {
                success();
            })
            .fail(function (e) {
                // failed to update text
                console.log(e);
                // Failure callback
                failure();
            });
    }

    this.getContentHistory = function (contentID) {

        $.ajax({
            type: "GET",
            url: "https://pmprojectv3.purplemediahosting.co.uk/classroomAPI/LanguageAPI/getContentHistory?contentID=" + contentID,
            async: true,
            crossDomain: true
        }).done(function (res) {
            console.log(res)
        })
    }

    this.seeEditHistory = function (data) {
        let contentID = $(data).data("contentid"),
            contentKey = $(data).data("key"),
            curDate = new Date().toUTCString();

        $.get('edit/ajax/_editHistory.html', function (data) {
            $("body").append(data);
            $("#editor-close").on("click", function () {
                $(".editor").fadeOut(250, function () {
                    $(".editor").remove();
                });
            });

            let localPageFields = self.localCopy[navigationController.activePage].fields,
                localPageItem = null;

            for (var l = 0; l < localPageFields.length; l++) {
                if (localPageFields[l].key === contentKey) {
                    localPageItem = localPageFields[l];
                }
            }

            $.ajax({
                type: "GET",
                url: "https://pmprojectv3.purplemediahosting.co.uk/classroomAPI/LanguageAPI/getContentHistory?contentID=" + contentID,
                async: true,
                crossDomain: true
            }).done(function (res) {
                // Check that API has returned JSON array.
                if (Array.isArray(res) && res.length > 0) {

                    let success = function () {
                        initLang();
                        navigationController.goToPage(navigationController.activePage);
                        testController.alert("Content succesfully reverted from history.")
                        $(".editor").fadeOut(250, function () {
                            $(".editor").remove();
                        });
                    }
                    let failure = function () {
                        testController.alert("Failed to revert content update from history.")
                    }



                    res.push({
                        "Name": "Original Copy",
                        "Dated": "N/A",
                        "text": localPageItem.ImageURL === '' ? localPageItem.Text : "",
                        "imageURL": localPageItem.Text === '' ? localPageItem.ImageURL : "",
                        "ContentID": contentID
                    })

                    for (var i = 0; i < res.length; i++) {

                        let rng = Math.floor(100000 + Math.random() * 900000),
                            t = res[i].text,
                            img = res[i].imageURL;

                        if (res[i].text !== null) {

                            $(".editHistory tbody").append("<tr>\
                        <td>" + res[i].Name + "</td>\
                        <td>" + new Date(res[i].Dated).toLocaleString() + "</td>\
                        <td class='editHistory__content'>" + t + "</td>\
                        <td class='editHistory__revert' id='editHistory-"+ rng + "'\
                            data-ContentID='" + res[i].ContentID + "'\
                            >Revert</td>\
                        </tr>");

                            $("#editHistory-" + rng).on('click', function () {

                                languageController.postTextUpdate({
                                    Class: $(data).data("class"),
                                    Type: $(data).data("type"),
                                    Text: $(this).siblings(".editHistory__content").html(),
                                    VideoURL: "",
                                    ImageURL: "",
                                    Language: $(data).data("language"),
                                    ProjectID: $(data).data("projectid"),
                                    PageID: $(data).data("pageid"),
                                    ContentId: contentID,
                                    key: contentKey,
                                    userID: window.testController.userID,
                                    created: curDate
                                }, success, failure)
                            })

                        } else {

                            $(".editHistory tbody").append("<tr>\
                        <td>" + res[i].Name + "</td>\
                        <td>" + new Date(res[i].Dated).toLocaleString() + "</td>\
                        <td class='editHistory__content'><img src='" + img + "'/></td>\
                        <td class='editHistory__revert' id='editHistory-"+ rng + "'\
                            data-ContentID='" + res[i].ContentID + "'\
                            data-src='" + img + "'\
                            >Revert</td>\
                        </tr>")

                            $("#editHistory-" + rng).on('click', function () {

                                languageController.postImageUpdate({
                                    Class: $(data).data("class"),
                                    Type: $(data).data("type"),
                                    Text: "",
                                    VideoURL: "",
                                    ImageURL: $(this).siblings(".editHistory__content").find("img").attr("src"),
                                    Language: $(data).data("language"),
                                    ProjectID: $(data).data("projectid"),
                                    PageID: $(data).data("pageid"),
                                    ContentId: contentID,
                                    key: contentKey,
                                    userID: window.testController.userID,
                                    created: curDate
                                }, success, failure)
                            })

                        }
                    }

                    $(".editor").fadeIn(250);

                } else {

                    testController.alert("This item has not been edited previously.")
                    $(".editor").fadeOut(250, function () {
                        $(".editor").remove();
                    });

                }

            }).fail(function (e) {
                testController.alert("Failed to retrieve edit data, please contact administrators.")
            })
        })


    };

    initLang();
};
