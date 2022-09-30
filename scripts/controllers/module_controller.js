const ModuleController = function () {
    const self = this;
    this.lowPerformanceMode = false;
    this.unlockAll = false;
    this.notesPage = $("#debugNoteList");
    this.projectURL = '000%20Project%20Templates';
    this.clientMode = false;
    this.objectives = [ // Define any SCORM objectives here.
    ];
    //These are basic patch notes that are visible within the Edit Suite.
    this.notes = [
        {
            version: "v0.0.1",
            objects: [
                "Init"
            ]
        }
    ];
    // This is appended to the settings tab of the Edit Suite. It contains advanced functions and methods for testing the module. Some things here are module specific but most are useful for testing any SCORM package.
    this.consoleFunctions = '\
        <tr><td colspan="2">&nbsp;</td></tr>\
        <tr class="tableSubHeader"><td colspan="2">Module Functions:</td></tr>\
        <tr><td colspan="2"><div onclick="navigationController.goToPage(0)" class="dButton" style="text-align: left;">Go to first page</div></td></tr>\
        <tr><td colspan="2"><div onclick="navigationController.goToPage(navigationController.activePage)" class="dButton" style="text-align: left;">Reload current page</div></td></tr>\
        <tr><td colspan="2"><div onclick="scormController.instance.setComplete(true)" class="dButton" style="text-align: left;">Set SCORM complete</div></td></tr>\
        <tr><td colspan="2">&nbsp;</td></tr>\
        <tr class="tableSubHeader"><td colspan="2">Advanced Functions:</td></tr>\
        <tr><td colspan="2"><div onclick="testController.clearData()" class="dButton" style="text-align: left;"><span class="text-danger">WARNING: IRREVERSABLE</span> - Clear course data (Please note this will reload the module and also log you out of the PurpleMedia Edit Suite)</div></td></tr>\
        <tr><td colspan="2"><div onclick="testController.CreatePagesInDB()" class="dButton" style="text-align: left;"><span class="text-danger">WARNING: IRREVERSABLE</span> - Upload text to database (Please note this will override all current text on database and should only be used for imports.)</div></td></tr>\
    ';

    // Populate to notes tab of EditSuite from the notes array.
    this.populateNotes = function () {
        self.notesPage = $("#debugNoteList");
        self.notesPage.append('<h4>Patch Notes</h4>');
        for (var v = 0; v < self.notes.length; v++) {
            self.notesPage.append('<h5 class="debugVersion">' + self.notes[v].version + '</h5><ul>');
            for (var o = 0; o < self.notes[v].objects.length; o++) {
                self.notesPage.append('<li class="debugNote">' + self.notes[v].objects[o] + '</li>');
            };
            self.notesPage.append('</ul>');
        };
    };
       

    // Called from navigationController on changePage.
    this.pageChange = function () {

        $("html, body").scrollTop(0);
        
    };

};