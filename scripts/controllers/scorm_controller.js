const ScormController = function () {
    const self = this;
    this.instance = null;
    this.version = 1.2;
    this._scormConnected = false;
    this.canSave = true;
    this.objectives = module_objectives;
    this.studentID = '';
    this.useObjectives = true;

    function FormatChoiceResponse(value) {
        const newValue = new String(value);

        //replace all whitespace
        newValue = newValue.replace(/\W/g, "_");
        return newValue;
    }

    // Private Functions
    function init() {
        if (typeof (pipwerks) !== 'undefined' && !self._scormConnected) {
            var scorm = pipwerks.SCORM;
            self._scormConnected = scorm.init();
            // Check we're actually connected
            if (self._scormConnected) {
                console.info('SCORM::Connected');
                //Let's check if we're 'really' connected by trying to get the student ID
                if (self.version == 1.2) {
                    self.studentID = scorm.get('cmi.core.student_id');
                    if (self.studentID == '' || self.studentID == null) { self.canSave = false; console.log("Reloading at no student ID"); } else { self.canSave = true; }
                    // If the lesson is complete then disconnect, otherwise set incomplete
                    //scorm.get("cmi.core.lesson_status") === 'completed' ? scorm.quit : scorm.set('cmi.core.lesson_status', 'incomplete');
                    //this.version = scorm.get("cmi.core.lesson_status");
                } else {
                    self.studentID = scorm.get('cmi.learner_id');
                    if (self.studentID == '' || self.studentID == null) { self.canSave = false; console.log("Reloading at no student ID"); } else { self.canSave = true; }
                    // If the lesson is complete then disconnect, otherwise set incomplete
                    // scorm.get("cmi.completion_status") === 'completed' ? scorm.quit : scorm.set('cmi.completion_status', 'incomplete');
                    //this.version = scorm.get("cmi.completion_status");
                }


                var scormInstance = {

                    location: function () {
                        let location = 0;
                        if (self.version === 1.2) {
                            location = scorm.get('cmi.core.lesson_location');
                        } else { location = scorm.get('cmi.location'); }
                        console.log(location);
                        return location === "" ? 0 : location;
                    },
                    getItem: function (item) {
                        return scorm.get(item);
                    },
                    getScore: function () {
                        let score = 0;
                        if (self.version == 1.2) { score = scorm.get('cmi.core.score.raw') } else { score = scorm.get('cmi.score.raw') }
                        return (score === "") ? 0 : score;
                    },
                    getStudentName: function () {
                        let sname = "";
                        if (self.version == 1.2) { sname = scorm.get('cmi.core.student_name') } else { sname = scorm.get('cmi.learner_name') }
                        return sname
                    },
                    getStudentID: function () {

                        let sname = "";
                        if (self.version == 1.2) { sname = scorm.get('cmi.core.student_id') } else { sname = scorm.get('cmi.learner_id') }
                        return sname
                    },
                    getSuspendData: function () {
                        let sdata = "";
                        if (self.version == 1.2) { sdata = scorm.get('cmi.suspend_data') } else { sdata = scorm.get('cmi.suspend_data') }
                        return sdata;
                    },
                    getLanguage: function () {
                        let lang = "en";
                        if (self.version == 1.2) { lang = scorm.get('cmi.student_preference.language') } else { lang = scorm.get('cmi.learner_preference.language') }
                        return lang
                    },
                    setItem: function (item, value) {
                        return scorm.set(item, value);
                    },
                    setLocation: function (intLocation) {
                        let bookmark = intLocation + "";
                        let locat;
                        if (self.version == 1.2) { locat = scorm.set('cmi.core.lesson_location', bookmark) } else { locat = scorm.set('cmi.location', bookmark) }

                    },
                    setScore: function (intScore) {
                        let score = intScore + "";
                        if (self.version == 1.2) {
                            scorm.set('cmi.core.score.min', '0');
                            scorm.set('cmi.core.score.max', '100');
                            scorm.set('cmi.core.score.raw', score);
                        } else {
                            scorm.set('cmi.score.min', '0');
                            scorm.set('cmi.score.max', '100');
                            scorm.set('cmi.score.raw', score);
                        }
                        if (scormController.canSave) { scorm.save(); }
                    },
                    setSuspendData: function (data) {
                        if (self.version == 1.2) {
                            scorm.set('cmi.suspend_data', data);
                        } else {
                            scorm.set('cmi.suspend_data', data);
                        }
                        if (scormController.canSave) { scorm.save(); }
                    },
                    setComplete: function () {
                        var status;
                        if (self.version == 1.2) {
                            status = scorm.set('cmi.core.lesson_status', 'completed');
                        } else {
                            status = scorm.set('cmi.completion_status', 'completed');
                        }
                        if (scormController.canSave) {
                            scorm.save();
                        }
                    },
                    setSuccess: function (state) {
                        var status;
                        if (self.version == 1.2) {
                            //not in scorm 1.2
                        } else {
                            status = scorm.set('cmi.success_status', 'passed');
                        }
                        if (scormController.canSave) { scorm.save(); }
                    },
                    setLanguage: function (isolang) {
                        //return scorm.set('cmi.student_preference.language', isolang)
                    },
                    ScormProcessGetValue: function (cmi) {
                        let val = scorm.get(cmi)
                        return val;
                    },
                    ScormProcessSetValue: function (cmi, value) {
                        var status;
                        status = scorm.set(cmi, value);
                        scorm.save();
                    },
                    quit: function () {
                        var status = scorm.quit();
                        return status;
                    },
                    save: function () {
                        scorm.save();
                    },
                    recordQuestion: function (questionRef, questionText, questionType, learnerResponse, correctAnswer, wasCorrect, objectiveId, interactionID) {
                        if (self.version == 1.2) {
                            //question id must be the first item set
                            scorm.set("cmi.interactions." + interactionID + ".id", questionRef);

                            //Associate this question with one of our four defined learning ojectives to enable
                            //the LMS to provide detailed reporting
                            scorm.set("cmi.interactions." + interactionID + ".objectives.0.id", objectiveId);

                            //The question type should be set before detailed response information
                            scorm.set("cmi.interactions." + interactionID + ".type", questionType);

                            //All interaction responses have a very specific format they must ahere to based
                            //on the interaction type. In this example, only multiple choice reponses need to 
                            //be massaged to adhere to that typing.
                            if (questionType == "choice") {
                                learnerResponse = FormatChoiceResponse(learnerResponse);
                                correctAnswer = FormatChoiceResponse(correctAnswer);
                            }

                            if (learnerResponse != "") {
                                //Record the response the learner gave (if one was provided)
                                scorm.set("cmi.interactions." + interactionID + ".student_response", learnerResponse);
                            }

                            //Record the correct answer, even if it is the same as the learner response
                            scorm.set("cmi.interactions." + interactionID + ".correct_responses.0.pattern", correctAnswer);

                            //Finally record whether or not the learner's response was correct
                            if (wasCorrect == true) {
                                scorm.set("cmi.interactions." + interactionID + ".result", "correct");
                            }
                            else {
                                scorm.set("cmi.interactions." + interactionID + ".result", "wrong");
                            }

                        } else {
                            //question id must be the first item set
                            scorm.set("cmi.interactions." + interactionID + ".id", questionRef);

                            //Use the question text as the interaction's description
                            scorm.set("cmi.interactions." + interactionID + ".description", questionText);

                            //Associate this question with one of our four defined learning ojectives to enable
                            //the LMS to provide detailed reporting
                            scorm.set("cmi.interactions." + interactionID + ".objectives.0.id", objectiveId);

                            //The question type should be set before detailed response information
                            scorm.set("cmi.interactions." + interactionID + ".type", questionType);

                            //All interaction responses have a very specific format they must ahere to based
                            //on the interaction type. In this example, only multiple choice reponses need to 
                            //be massaged to adhere to that typing.
                            if (questionType == "choice") {
                                learnerResponse = FormatChoiceResponse(learnerResponse);
                                correctAnswer = FormatChoiceResponse(correctAnswer);
                            }

                            if (learnerResponse != "") {
                                //Record the response the learner gave (if one was provided)
                                scorm.set("cmi.interactions." + interactionID + ".learner_response", learnerResponse);
                            }

                            //Record the correct answer, even if it is the same as the learner response
                            scorm.set("cmi.interactions." + interactionID + ".correct_responses.0.pattern", correctAnswer);

                            //Finally record whether or not the learner's response was correct
                            if (wasCorrect == true) {
                                scorm.set("cmi.interactions." + interactionID + ".result", "correct");
                            }
                            else {
                                scorm.set("cmi.interactions." + interactionID + ".result", "incorrect");
                            }

                        }
                    },
                    setObjectiveScore: function (i, score) {
                        if (self.useObjectives) {
                            if (self.version == 1.2) {
                                var status = scorm.set("cmi.objectives." + i + ".score.raw", score);
                            }
                            else {
                                var status = scorm.set("cmi.objectives." + i + ".score.min", 0);
                                var status = scorm.set("cmi.objectives." + i + ".score.max", 100);
                                var status = scorm.set("cmi.objectives." + i + ".score.raw", score);
                            }
                        }
                    },
                    setObjectiveCompletion: function (i, completion_status) {
                        if (self.useObjectives) {
                            if (self.version == 1.2) {
                                var status = scorm.set("cmi.objectives." + i + ".status", completion_status);
                            }
                            else {
                                var status = scorm.set("cmi.objectives." + i + ".completion_status", completion_status);
                            }
                        }
                    },
                    setObjectiveProgress: function (i, progress) {
                        if (self.useObjectives) {
                            if (self.version == 1.2) {
                                //1.2 has no progress for objectives
                            }
                            else {
                                var status = scorm.set("cmi.objectives." + i + ".progress_measure", progress);
                            }
                        }
                    },
                    initObjectives: function () {
                        if (self.useObjectives) {
                            //Checks if the objectives were registeerd by the LMS and if not creates them
                            let noOfObjectivesRegistered = scorm.get("cmi.objectives._count");
                            let noOfObjectives = self.objectives.length;
                            if (parseInt(noOfObjectivesRegistered) != parseInt(noOfObjectives)) {
                                if (self.version == 1.2) {
                                    $.each(self.objectives, function (i, o) {
                                        scorm.set("cmi.objectives." + i + ".id", o.objectiveID);
                                        scorm.set("cmi.objectives." + i + ".score.raw", 0);
                                        scorm.set("cmi.objectives." + i + ".status", "incomplete");
                                    })
                                } else {
                                    //SCORM 2004
                                    $.each(self.objectives, function (i, o) {
                                        scorm.set("cmi.objectives." + i + ".id", o.objectiveID);
                                        scorm.set("cmi.objectives." + i + ".score.raw", 0);
                                        scorm.set("cmi.objectives." + i + ".completion_status", "incomplete");
                                        scorm.set("cmi.objectives." + i + ".progress_measure", 0);
                                        scorm.set("cmi.objectives." + i + ".description", o.description);
                                    })
                                }
                                scorm.save();

                            }
                        }
                    }
                };
            }
            else {

                if (PRODUCTION && !DEBUG) {
                    this.canSave = false;
                    uiController.showConErr();
                } else {
                    this.canSave = true;
                }

                // SCORM won't connect, so make everything a no-op
                var scormInstance = {
                    location: function () {
                        let loc = 'null';
                        if (utils.storageAvailable('sessionStorage')) {
                            let store = window['sessionStorage'];
                            loc = store.getItem("bookmark");
                            if (loc == 'undefined' || loc == null) {
                                loc = 0;
                            }
                        }
                        else {
                            loc = 0;
                        }
                        return loc;
                        //return 0;
                    },
                    getScore: function () {
                        return 0;
                    },
                    getStudentName: function () {
                        return 'null';
                    },
                    getStudentID: function () {
                        //return '';
                        return '';
                    },
                    getSuspendData: function () {
                        return 'null';
                    },
                    getLanguage: function () {
                        return 'null'
                    },
                    setLocation: function (intLocation) {
                        let bookmark = intLocation + "";
                        if (utils.storageAvailable('sessionStorage')) {
                            let store = window['sessionStorage'];
                            store.setItem("bookmark", bookmark);
                        }
                        return intLocation;
                    },
                    setScore: function (intScore) {
                        let score = intScore + "";
                        return 'null';
                    },
                    setSuspendData: function (data) {
                        utils.cantSave();
                        return 'null';
                    },
                    setComplete: function () {
                        return 'null';
                    },
                    setLanguage: function (isolang) {
                        return 'null';
                    },
                    ScormProcessGetValue: function (cmi, value) {
                        //let val = scorm.get(cmi)
                        return value;
                    },
                    ScormProcessSetValue: function (cmi, value) {
                        //let status;
                        //status = scorm.set(cmi, value);
                        return value
                    },
                    quit: function () {
                        return null;
                    },
                    save: function () {
                        return null;
                    },
                    recordQuestion: function (questionRef, questionText, questionType, learnerResponse, correctAnswer, wasCorrect, objectiveId, interactionID) {
                        return null;
                    },
                    setObjectiveScore: function (i, score) {
                        return null;
                    },
                    setObjectiveCompletion: function (i, completion_status) {
                        return null;
                    },
                    setObjectiveProgress: function (i, progress) {
                        return null;
                    },
                    initObjectives: function () {
                        //Checks if the objectives were registeerd by the LMS and if not creates them
                        return null;
                    }
                }
            };

            // Set the instance
            self.instance = scormInstance;

            return self.scorm;

        } else if (typeof (self.scorm) !== 'undefined') {
            // There's already an instance, return it.
            return self.scorm;

        } else {
            // Pipwerks isn't loaded
            let e = new Error;
            e.message = "SCORM not loaded";
            throw e;
        };
    }

    this.lang = function () {
        return (self.instance.getLanguage() == 'null') ? 'en-GB' : self.instance.getLanguage()
    }

    init();
};