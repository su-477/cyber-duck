
/* NAVIGATION CONTROLLER */
const NavigationController = function (opts) {
    const self = this;
    this.activePage = (opts.activePage == 'null') ? 0 : parseInt(opts.activePage);
    this.currentPageUrl = '';
    this.useCDN = true;
    this.cachePages = false;
    this.firstLaunch = true;
    this.videoRes = 0;
    this.region = 1;
    this._options = opts;
    this._answers;
    this._kc1Score = 0;
    this._totalScore = 0;
    this._altprogress = 0;
    this._controls = this._options.controls;
    this._pages = opts.pages || [];
    this._stage = opts.stage;
    this._progressBar = $('#breadcrumb #breadcrumb_bar');
    this._personActive = false;
    this._title = $('#slidetitle');
    this._debugtext = $('#debug_text');
    this._slideHasControl = false;
    this._slideCanChange = function () { return true; };
    this.score;
    this.redoMods = [];
    this.attempt = 1;

    // Private functions

    function init() {
        //console.log('NavigationController::init', self._options);
        //self._controls.on('click', self.changePage);
        launchInitialPage();
    }

    function launchInitialPage() {
        changePage(self._pages[self.activePage]);
        self._title.html(self._pages[self.activePage].title);
        $('#preload').fadeIn();
    }

    function addPageToDebugHistory(title, url, type) {

        const d = new Date(),
            h = d.getHours(),
            m = d.getMinutes(),
            s = d.getSeconds(); // => 51

        // Ternary operators are in use to ensure time displays correctly if any value is less than 10. 
        // eg. 9:5:2 is converted to 09:05:02
        const dt = (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);

        $('#debugLocationHistory table tbody').prepend("<tr><td>" + dt + "</td><td>" + title + "</td><td>" + url + "</td><td><div class='debug-content--btn'  data-url='" + url + "' data-pagetype='" + type + "' onclick='testController.gotoPage(this)'>Go to page</div></td></tr>")

    }

    function changePage(nextPage) {
        // If the next page exists, go to it.
        if (nextPage) {
            $('.page-nav.next').removeClass('hidethis');
            // Notify listeners that the page is about to change
            $.publish('navigationController/pageWillChange');
            // Change the page
            self.currentPageUrl = nextPage.url;

            // Dispose videos after use
            for (var i = 0; i < pages.length; i++) {

                // Videos are created from the title of the page they sit on.
                // We can use this title reference to dispose from videojs memory.
                try {
                    if (videojs.getPlayers()[pages[i].title]) {
                        videojs(pages[i].title).dispose();
                    }
                } catch (err) {
                    //videojs is still initialising or not packaged.
                }
            }


            $(".page-nav").removeClass("tempflash3");
            $("#overlayglow").css("background", "").hide();
            $('#stage').animate({ opacity: 0 }, 500, "swing", function () {
                $("#stage").load(nextPage.url, function () {

                    moduleController.pageChange();

                    //Call the strt method for the page
                    try {
                        initLang();
                    } catch (err) {
                    }
                    $("html, body").scrollTop(0);
                    setTimeout(function () {

                        $.publish("/page/loaded", [nextPage]);

                        dataController.save();

                        languageController.updateCurrentPageText();
                        //todo UNDO - temporarily disable all bookmarking
                        scormController.instance.setLocation(self.activePage);
                        //Change the video still if needed
                        if (nextPage.videostillclass !== '') {
                            $('#videoStill').removeClass().addClass(nextPage.videostillclass);
                        }

                        //ONLY IF WERE DEBUGGING
                        if (DEBUG) {
                            if (testController.enabled) {
                                //set the page history
                                addPageToDebugHistory(nextPage.title, nextPage.url, "main");
                                //clear the log if it is set to clear on page change
                                if (testController.clearErrorsOnPageChange) {
                                    $('#debugConsoleLog table tbody tr').remove();
                                }
                                //update the text section with the text on this page
                                languageController.updateDebugPageText();
                            }
                            self._title.html(self._pages[self.activePage].title);
                        }
                    }, 250);

                    setTimeout(function () {
                        $('#stage').animate({ opacity: 1 }, 500);
                    }, 250)
                });

            });
            return true;
        } else {
            //console.warn('No page to navigate to');
            return false;
        }
    }

    // Public methods

    // Public methods
    let ContentPage = {
        "ProjectId": "",
        "Title": "",
        "Url": "",
        "Enabled": 1,
        "OrderID": 0,
        "Background": "",
        "Section": "",
        "SubSection": "",
        "PrevPage": "",
        "NextPage": "",
        "Custom": ""
    };

    this.getPageObjectByFile = function (fn) {
        let found = false,
            pgs = self._pages,
            cp = ContentPage;
        $.each(pgs, function (i, p) {
            if (p.url.toLowerCase() === fn.toLowerCase()) {
                found = true;
                cp.projectId = projectID;
                cp.Title = p.title;
                cp.Url = p.url;
                cp.Enabled = 1;
                cp.OrderID = p.pageid;
                cp.Background = p.background;
                cp.Section = p.section;
                cp.SubSection = p.subsection;
                cp.PrevPage = p.prevpage;
                cp.NextPage = p.nextpage;
                cp.Custom = p.custom;
            }
        });
        if (found === true) {
            return cp;
        } else {
            return null;
        }
    };

    this.updateScore = function (QID, SCORE, MULTIPLIER, CORRECT) {
        //Reset module scores
        $.each(self._moduleScore, function (i, q) {
            q = 0;
        });
        //Loop all scores, updating the one we just got as we pass
        $.each(self._interactions, function (i, q) {
            if (q[0] === QID) {
                q[1] = SCORE;
                q[2] = MULTIPLIER;
                q[3] = CORRECT;
            };
            if (q[2] === 0) { q[2] = 1 };
            self._moduleScore[Number(q[4])] = (Number(self._moduleScore[Number(q[4])]) + Number(Number(q[1]) * Number(q[2])));
        });
    };

    this.launchInitialPage = function () {
        launchInitialPage();
    };

    this.getCurrentPage = function () {
        return self._pages[self.activePage];
    }

    this.changePage = function (e) {
        const isForward = $(e.target).is('.next');

        if (self._slideHasControl && self._slideCanChange(isForward) && isForward) {
            return false;
        } else if (!isForward) {
            self._slideHasControl = false;
        }
        // Get a reference to the next page
        const nextPage = isForward ? self._pages[self.activePage + 1] : self._pages[self.activePage - 1];

        if (changePage(nextPage)) {
            $(e.target).is('.next') ? self.activePage++ : self.activePage--;
            // Hook for AFTER the page changes
            $.publish('navigationController/pageDidChange', self.activePage);
            //refreshProgressBar();
            // Tell SCORM
            //BOOKMARKING FUNCTION
            //scormController.instance.setLocation(self.activePage);
            if (scormController.canSave) {
                //TODO FIX SAVING
                //gameController.save();
            }
            self._title.html(self._pages[self.activePage].title);
            $('header').removeClass("slideupheader")

        };
    }

    this.goToPage = function (id, scroll) {

        if (typeof (self._pages[id]) !== 'undefined' && changePage(self._pages[id])) {
            self.activePage = id;

            // Hook for AFTER the page changes
            $.publish('navigationController/pageDidChange', self.activePage);

            if (scroll !== '') {

                setTimeout(function () {
                    scrollTo($(scroll));
                }, 250);

            }

            if (scormController.canSave) {
            }

        }

    }

    this.goToPageWithFilename = function (filename, scroll) {

        var $pageIndex;

        $.each(self._pages, function (i, l) {

            if (l.url === filename) {
                $pageIndex = i;
                return true;
            }

        });

        self.goToPage($pageIndex, scroll);
    };

    this.goToPageWithTitle = function (name, scroll) {

        var $pageIndex;

        $.each(self._pages, function (i, l) {

            if (l.title === name) {
                $pageIndex = i;
                return true;
            }

        });

        self.goToPage($pageIndex, scroll);
    };

    this.goToNextPage = function () {
        self.activePage < self._pages.length - 1 ? self.activePage++ : self.activePage;
        if (changePage(self._pages[self.activePage])) {
            // Hook for AFTER the page changes
            $.publish('navigationController/pageDidChange', self.activePage);

            if (scormController.canSave) {
                //todo fix saving
                //gameController.save();
            }
        }
    }

    this.activePageAsText = function () {
        if (DEBUG) {
            const txt = "";
            txt = "The current page is " + this._pages[self.activePage].url;
            return txt;
        }
    }

    this.activePageAsNo = function () {
        return self.activePage;
    }

    // Lastly, call init so we're ready to go as soon as the controller is created
    init();
};