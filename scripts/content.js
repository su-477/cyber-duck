var $ = jQuery.noConflict();

function setCourseComplete() {
    console.log("Setting Complete")
    scormController.instance.setComplete();
    alert("Course has been set complete.")
}

function setCourseScore(scoreAsNumber) {
    scormController.instance.setScore(scoreAsNumber);
}

function quitCourse() {
    try {
        scormController.instance.quit();
        window.close();
    } catch (e) {
        window.close();
    }
}

window.onbeforeunload = function () {
    scormController.instance.quit();
}

function initialise() {

    // Test config
    if (settings.ProjectID === '%ProjectID%') {
        console.warn("ProjectID not found. Please run `node setup.js` from CLI.")
    }

    // Add all flags to the language selector pop up
    populateFlags(); 

    // Set initial language 
    setLanguage(); 

	return false;
};

jQuery(function(){


    window.utils = Utils;

    window.languageController = new LanguageController;

    // Controller for this project ONLY
    window.moduleController = new ModuleController();

    // Controller for Azure DevOps API
    window.devOps = new DevOpsController();

    // Controller for SCORM API
    window.scormController = new ScormController;

    lessonLocation = (window.scormController.instance.location() == 'null') ? Utils.getURLParameter('page') : parseInt(window.scormController.instance.location());


    // Instantiate the nav controller
    window.navigationController = new NavigationController({
        controls: $('.page-nav'),
        courseNav: $('#course-nav'),
        pages: pages,
        stage: $('#stage'),
        activePage: lessonLocation
    });


    window.dataController = new courseData();

    //Debug
    window.testController = new TestController();  

	initialise();
    
})
