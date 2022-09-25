function generateGuid() {
    let result, i, j;
    result = '';
    for (j = 0; j < 32; j++) {
        if (j == 8 || j == 12 || j == 16 || j == 20)
            result = result + '-';
        i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
        result = result + i;
    }
    return result;
}

const TestController = function () {
    const self = this;
    this.enabled = false;
    this.published = false;
    this.disableLogging = false;
    this.logToDefault = true;
    this.logToRemote = false;
    this.logToInfoWindow = false;
    this.sessionid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    this.userID = 'ef863ae9-4870-47dd-977f-e45eb2d97ce8'
    this.stageID = 6;
    this.logWarnings = true;
    this.logErrors = true;
    this.logInfo = true;
    this.logLogs = true;
    this.debugOpen = false;


    this.openBtn = $('.open-debug');
    this.closeBtn = $('.close-debug');
    this.closePaneBtn = $('.close-debugwindow');
    this.clearErrorsOnPageChange = true;
    this.requiresLogin = true;
    this.userDetail = null;
    this.loginButton = $("#debugLoginBtn");
    this.loginState = $("#debugLoginBtn .state");
    this.loginButton = $("#debugLoginBtn");
    this.loginState = $("#debugLoginBtn .state");
    this.loginToken = null;
    this.loginFeedback = $('#txtLoginFeedback');
    //What should be sent as part of the bug reports
    this.sendconsolelog = true;
    this.sendhtml = false;
    this.senddeviceinfo = true;
    this.sendscreenshot = true;
    this.screenshotQuality = 0.2
    this.sendsource = true;
    this.debugDetailWindow = null;
    this.severityfilter = 0;
    this.statusfilter = 0;
    this.updateText = true;
    this.username = null;

    if (self.enabled) {
        self.openBtn.show();
    }


    // Get console from partial and add to index
    this.console = $('#debugConsole');
    $.get("edit/ajax/_debugConsole.html", function (data) {
        self.console.html(data);

        let loginID = dataController.getData("loginUserID");
        let loginName = dataController.getData("loginUsername");
        if (loginID == null || loginID == '') { } else {
            self.logRocketUser(loginID, loginName);

        }

        $('.open-debug').on('click', function () {
            $('.open-debug').fadeOut();
            if (loginID == null || loginID == '') {
                self.showLogin();
            } else {
                //open debug
                self.console.fadeIn(250);
                let restoredPAT = dataController.getData("DevOpsPAT")
                if (restoredPAT !== null) {
                    devOps.doLogin(restoredPAT);
                }
                if (moduleController.clientMode === true) {
                    devOps.doLogin('r3dsqlpucoibmz2nq5rozvouhtrnyjlckphireeoqjnzrutudxzq');
                }

            }

        });

        $('.close-debug').on('click', function () {
            $('.open-debug').fadeIn();

            self.console.fadeOut(250)
            self.console.css("top", "auto")
        })
        $('.close-debugwindow').on('click', function () {
            $("#debugConsoleLogWindow").fadeOut(250);
        })

        $('.debugBtn').on('click', function () {
            let target = $(this).attr("alt");
            if ($(this).is("#btnConsoleSubmitProblem") || $(this).is("#btnWorkItems")) {
                //Check DevOps login
                if (devOps.loggedIn !== true) {
                    devOps.login.fadeIn(250);
                    return;
                }
            }
            $(".editWorkItem").remove();
            if (target === 'debugWorkItems') {
                window.open("edit/workitems.html", "Work Items", "width=1000,height=600,top=50, left=50");
                return;
            }
            if (target === 'debugConsoleSubmitProblem') {
                window.open("edit/newitem.html", "Work Items", "width=1000,height=600,top=50, left=50");
                return;
            }
            if ($(this).hasClass("selected")) {
                $("#debugConsoleLogWindow").fadeOut(250);
                $(this).removeClass("selected");
            } else {
                $('.debugBtn.selected').removeClass("selected");
                $(this).addClass("selected");
                $('.debugPane').fadeOut(250);
                $('#' + target).delay(250).fadeIn();
                $("#debugConsoleLogWindow").delay(250).fadeIn(250);
                if (devOps.loggedIn !== true) {
                    return false;
                }
                switch (target) {
                    case 'debugConsoleSubmitProblem':
                        devOps.addTeam("issueAssignedTo");
                        break;
                }
            }
        });


        $("#moduleFunctions").append(moduleController.consoleFunctions);
        moduleController.populateNotes();


        if (self.updateText == false) {
            $('#btnConsoleText').hide();
        }
        if (self.enabled == true) {
            $('.open-debug').show();
        }
        for (var i = 0; i < pages.length; i++) {
            $('#debugPageList table tbody').append("<tr><td>" + pages[i].pageid + "</td><td>" + pages[i].title + "</td><td>" + pages[i].url + "</td><td><div class='debugrndbtn pageJumpBtn'  data-url='" + pages[i].url + "' data-pagetype='main' onclick='testController.gotoPage(this)'>></div></td></tr>")
        }

        if (moduleController.clientMode === true) {
            $("#btnWorkItems").hide();
        }

    });
    //self.console.html(debugConsole);


    // Get consolelogin from partial and add to index
    this.consoleLogin = $('#pmLogin');

    let loginProcessing = false;
    $.get("edit/ajax/_debugLogin.html", function (data) {
        self.consoleLogin.html(data);


        $("#pmLogin .debug-login__close").on('click', function () {
            $('.open-debug').fadeIn();
            $(".debug-login").fadeOut(250);
            loginProcessing = false;
        })
        $("#pmLogin .debug-login__form").on('submit', function (e) {
            e.preventDefault();
            if (loginProcessing) {
                return;
            } else {
                loginProcessing = true;
            }
            self.loginButton.addClass('loading');
            self.loginState.html('Authenticating');
            self.doLogin($('#txtUsername').val(), $('#txtPassword').val());

        })

    });
    //self.consoleLogin.html(debugLogin);




    this.hideAlert = function () {
        let pop = $(".pm-pop");
        pop.remove();
    }

    this.alert = function (txt) {
        self.hideAlert();

        $.get("edit/ajax/_alert.html", function (data) {
            $("body").append(data);
            let pop = $(".pm-pop");
            $("#alert-text").html(txt);
            pop.fadeIn(250);
            $("#alertclose").on('click', function () {
                pop.fadeOut(250, function () {
                    pop.remove();
                });
            });

        });
    };
    this.confirm = function (txt, success, fail) {
        self.hideAlert();

        $.get("edit/ajax/_confirm.html", function (data) {
            $("body").append(data);
            let pop = $(".pm-pop");
            $("#confirm-text").html(txt);
            pop.fadeIn(250);
            $("#confirm").on('click', function () {
                pop.fadeOut(250, function () {
                    pop.remove();
                    if (typeof success !== 'undefined') {
                        success();
                    }
                });
            });
            $("#confirmclose").on('click', function () {
                pop.fadeOut(250, function () {
                    pop.remove();
                    if (typeof fail !== 'undefined') {
                        fail();
                    }
                });
            });

        });

    };


    self.updateSeverityFilter = function (node) {
        self.severityfilter = node.value;
        self.getCurrentIssues();
    };

    self.updateStatusFilter = function (node) {
        self.statusfilter = node.value;
        self.getCurrentIssues();
    };

    this.toggleConsoleLog = function (el) {
        if (self.sendconsolelog === true) {
            self.sendconsolelog = false;
            //el.innerHTML = "CONSOLE LOG OFF";
            $(el).addClass("doff").removeClass("don");
        } else {
            self.sendconsolelog = true;
            //el.innerHTML = "CONSOLE LOG ON";
            $(el).addClass("don").removeClass("doff");
        }
    };

    this.toggleHTML = function (el) {
        if (self.sendhtml === true) {
            self.sendhtml = false;
            //el.innerHTML = "HTML OFF";
            $(el).addClass("doff").removeClass("don");
        } else {
            self.sendhtml = true;
            //el.innerHTML = "HTML ON";
            $(el).addClass("don").removeClass("doff");
        }
    };

    this.toggleDeviceInfo = function (el) {
        if (self.senddeviceinfo === true) {
            self.senddeviceinfo = false;
            //el.innerHTML = "DEVICE INFO OFF";
            $(el).addClass("doff").removeClass("don");
        } else {
            self.senddeviceinfo = true;
            //el.innerHTML = "DEVICE INFO ON";
            $(el).addClass("don").removeClass("doff");
        }
    };

    this.toggleSource = function (el) {
        if (self.sendsource === true) {
            self.sendsource = false;
            //el.innerHTML = "SOURCE OFF";
            $(el).addClass("doff").removeClass("don");
        } else {
            self.sendsource = true;
            //el.innerHTML = "SOURCE ON";
            $(el).addClass("don").removeClass("doff");
        }
    };

    this.toggleScreenshotting = function (el) {
        if (self.sendscreenshots === true) {
            self.sendscreenshots = false;
            //el.innerHTML = "SCREENSHOTS OFF";
            $(el).addClass("doff").removeClass("don");
        } else {
            self.sendscreenshots = true;
            //el.innerHTML = "SCREENSHOTS ON";
            $(el).addClass("don").removeClass("doff");
        }
    };

    this.clearData = function () {
        dataController.clear();
        dataController.save();
        try {
            sessionStorage.clear();
        }
        catch (err) {
            console.log("Cannot clear session storage");
        }
        location.reload();
    }

    $('#debugConsoleRunJS').on('keydown', function (e) {
        if (e.which === 13) { eval($('#debugConsoleRunJS').text()) }
    });

    //$('#debugConsoleLogWindow').niceScroll();

    this.gotoPage = function (pagebtn) {
        let pt = $(pagebtn).attr("data-pagetype");
        let pg = $(pagebtn).attr("data-url");
        if (pt === "main") {
            navigationController.goToPageWithFilename(pg);
        } else {
            //navigationController.o
        }
    };

    function generateGuid() {
        let result, i, j;
        result = '';
        for (j = 0; j < 32; j++) {
            if (j === 8 || j === 12 || j === 16 || j === 20)
                result = result + '-';
            i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
            result = result + i;
        }
        return result;
    }


    $('#btnSubmitReport').on('click', function () {
        let name = $('#txtIRName').text();
        let description = $('#txtIRDescription').text();
        self.postTask(name, description);
    });


    this.postTask = function (name, description) {
        self.alert("Sending your issue<br/>This may take some time whilst we capture your current screen and gather some details. Please wait...");
        let fdate = new Date();
        fdate.setDate(fdate.getDate() + 1);
        let d = new Date();
        let clog = "";
        let html = "<!-- NO HTML -->";
        let deviceinfo = " ";
        let screenshot = "";
        let source = " ";

        //Debug Parameters

        //Console log, all the possible errors that may have been logged
        if (self.sendconsolelog) {
            clog = $('#debugConsoleLog').html();
        }

        //Should we send the HTML of the page
        if (self.sendhtml) {
            html = $('#stage').html();
        }

        //Should we send the Device Info
        if (self.senddeviceinfo) {
            let detector = new MobileDetect(window.navigator.userAgent);
            deviceinfo += "Mobile: " + detector.mobile();
            deviceinfo += ",Phone: " + detector.phone();
            deviceinfo += ",Tablet: " + detector.tablet();
            deviceinfo += ",OS: " + detector.os();
            deviceinfo += ",userAgent: " + detector.userAgent();
        }

        //Source
        if (self.sendsource) {
            $('#debugLocationHistory tbody tr td:nth-child(2)').each(function (i, o) {
                source = source + $(this).html() + ",";
            });
        }

        let task = {
            "Stage_FK": 6,
            "ProjectID_FK": projectID,
            "AllocatedTo_FK": self.userID,
            "PercentComplete": 0,
            "IsMilestone": false,
            "ScrumType": 1,
            "State": 1,
            "Priority": 5,
            "RiskLevel": 5,
            "ScheduleMode": 1,
            "DurationScheduledMins": 30,
            "DurationActualMins": 30,
            "ScheduledStart": null,
            "ActualStart": null,
            "ScheduledEnd": null,
            "ActualEnd": null,
            "DeadlineDate": null,
            "Description": description,
            "ID": generateGuid(),
            "Name": name
        };

        let bug = {
            "ID": generateGuid(),
            "ProjectID": projectID,
            "TaskID": task.ID,
            "LineNumber": 4,
            "Location": navigationController.currentPageUrl,
            "ShortDesc": "Reported by the debug tool",
            "Description": description,
            "Source": source,
            "ConsoleLog": clog,
            "Browser": navigator.appName,
            "BrowserVersion": navigator.appVersion,
            "Agent": "",
            "Device": screensize + " - Scroll distance: " + $("#main").scrollTop(),
            "ReportedBy": dataController.getData("loginUserID"),
            "ReportedByName": name,
            "ReportedDate": d.toJSON(),
            "CurrentHTML": html,
            "ScreenShot": "",
            "Severity": 1,
            "Status": 1,
            "Type": 1
        };

        //Decide if we should take a screenshot, if we do, it's async so we need to do this with a promise

        if (self.sendscreenshot) {
            let node = document.querySelector('#main');
            let scrollTop = $("#main").scrollTop();
            $("#stage").css("margin-top", "-" + scrollTop + "px");
            let options = {
                quality: 0.5,
                width: window.innerWidth,
                height: window.innerHeight
            }
            domtoimage.toJpeg(node, options)
                .then(function (dataUrl) {
                    bug.ScreenShot = dataUrl;
                    $("#stage").css("margin-top", "0px");
                    sendTask(bug, task);
                    $("#main").scrollTop(scrollTop)
                })
                .catch(function (error) {
                    console.log(error)
                    $("#stage").css("margin-top", "0px");
                    bug.ScreenShot = 'oops, something went wrong! : ' + error;
                    sendTask(bug, task);
                    $("#main").scrollTop(scrollTop)
                });

        } else {
            sendTask(bug, task);
        }

    };

    this.showLogin = function () {
        $('.open-debug').fadeOut();
        $("#pmLogin").fadeIn(250);
        $("#pmLogin .debug-login__form").delay(250).fadeIn(250);
    };

    this.hideLogin = function () {
        $("#pmLogin.debug-login").fadeOut(250);
        loginProcessing = false;
    };

    this.doLogin = function (username, password) {
        //login to the debug system
        // self.ui_lang_components.login.loginerror = "";
        let userLogin = {
            grant_type: 'password',
            username: username,
            password: password
        };

        //Now call token generation
        $.ajax({
            url: "https://pmproject.purplemediahosting.co.uk/TOKEN",
            method: "POST",
            data: $.param({ grant_type: 'password', username: userLogin.username, password: userLogin.password }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            async: false
        }).done(function (data) {
            //Set the login details
            self.loginButton.addClass('ok');
            self.loginState.html('Welcome back!');

            self.console.fadeIn(250);
            setTimeout(function () {
                self.hideLogin();

            }, 2000);
            self.loginToken = data;
            self.hideLogin();
            dataController.setData("loginToken", data.access_token);
            dataController.setData("loginExpiry", new Date(data[".expires"]));
            dataController.setData("loginUsername", data.userName);
            dataController.save();

            if (moduleController.clientMode === true) {
                devOps.doLogin('r3dsqlpucoibmz2nq5rozvouhtrnyjlckphireeoqjnzrutudxzq');
            }

            //Get the user ID
            $.ajax({
                type: "GET",
                url: 'https://pmprojectv2.purplemediahosting.co.uk/api/Account/GetUserID?userName=' + data.userName,
                async: true,
                crossDomain: true
            }).done(function (userID) {
                //save the userID
                dataController.setData("loginUserID", userID);
                dataController.save();
                self.logRocketUser(userID, data.userName);
            });

        }).fail(function (data) {
            self.loginButton.addClass('ok');
            self.loginState.html('Login failed, please try again!');
            setTimeout(function () {
                self.loginState.html('Log in');
                self.loginButton.removeClass('ok loading');
                loginProcessing = false;
            }, 1500);
            dataController.setData("loginToken", "");
            dataController.setData("loginExpiry", new Date() - 1);
            dataController.setData("loginUsername", "");
            // self.ui_lang_components.login.loginerror = data.responseJSON.error_description;
        });
    };

    this.logRocketUser = function (ID, emailAddress) {
        try {
            LogRocket.identify(ID, {
                name: emailAddress,
                email: emailAddress,

                // Add your own custom user variables here, ie:
                clientMode: moduleController.clientMode
            });
        } catch (e) {
            // Failed to send user information to LogRocket as LogRocket is not initialised
        }
    }


    // DATABASE UTILITIES
    this.CreatePagesInDB = function () {
        let r = confirm("Are you sure you want to upload text to the database? This will overwrite any changes previously made from the Edit Suite.");
        if (r === true) {

        } else {
            return false;
        }

        //real import of the Language JSON
        let lGen = window.languageController.lang.general;
        let noPages = lGen.length;
        let pageid;
        let pt = 0;
        let noi = 0;
        let bar = 0;

        $.each(window.languageController.lang.pages, function (i, p) {
            let pageItems = p.fields;
            $.each(pageItems, function (n, l) {
                //count the items
                noi += 1;
            });
        });
        pt = 100 / noi;


        let pageX = 0;
        //loop the lang files

        $.each(window.languageController.lang.pages, function (i, p) {
            let pageItems = p.fields;
            let pageID = null;


            let pg = window.navigationController.getPageObjectByFile(p.File);
            pg.ProjectId = projectID;

            $.ajax({
                type: "POST",
                data: pg,
                url: 'https://pmprojectv3.purplemediahosting.co.uk/classroomAPI/LanguageAPI/addContentPage',
                async: false,
                crossDomain: true
            }).done(function (page) {
                pageID = page.pageID;
                //Add Page Items
                $.each(pageItems, function (n, l) {
                    //Add the content item
                    let ci = {
                        "published": 1,
                        "userID": window.testController.userID,
                        "created": '2018-04-25T10:39:03.7392+01:00',
                        "Class": '',
                        "Type": 5,
                        "Text": l.Text,
                        "VideoURL": l.VideoURL,
                        "ImageURL": l.ImageURL,
                        "Language": window.languageController.langID,
                        "ProjectID": projectID,
                        "PageID": pageID,
                        "ContentId": null,
                        "key": l.key
                    };
                    $.ajax({
                        type: "POST",
                        data: ci,
                        url: 'https://pmprojectv3.purplemediahosting.co.uk/classroomAPI/LanguageAPI/addContentItem',
                        async: false,
                        crossDomain: true
                    });
                });
                // self.alert("Text has finished uploading. Please set languageController.langLocation to 1 to start editing text.")
            });
        });
    };
};