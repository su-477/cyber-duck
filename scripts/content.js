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
    if (projectSettings.ProjectID === '%ProjectID%') {
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





//results
function runResultsCircles() {
	let lows = 0;
	let meds = 0;
	let highs = 0;

	const isMobile = window.screen.availWidth <= 768;
	if (isMobile) $(".page__content").css("overflow-y", "hidden");

	// debug scoring
	// bbcPagesSections[1].pageScore = 90;
	// bbcPagesSections[2].pageScore = 80;
	// bbcPagesSections[3].pageScore = 65;
	// bbcPagesSections[4].pageScore = 50;

	for (let i = 1; i <= bbcPagesSections.length - 1; i++) {
		const pageScore = bbcPagesSections[i].pageScore;

		if (pageScore >= 80) {
			highs += 1;
			$(".results__circle[data-page='" + i + "']").addClass("high");
			$(".results__details-col[data-page='" + i + "'] .results__details-circle").addClass("high");
			$(".results__details-col[data-page='" + i + "'] .results__details-text").append("<div data-i18n_ap='r-" + i + "-high' ></div>");
			$(".results__details-col[data-page='" + i + "'] .results__details-word").attr("data-i18n_g", "enhance");
			$(".results__details-col[data-page='" + i + "'] .results__details-image").attr("src", "assets/img/results/enhance.svg");
		} else if (pageScore >= 60) {
			meds += 1;
			$(".results__circle[data-page='" + i + "']").addClass("med");
			$(".results__details-col[data-page='" + i + "'] .results__details-circle").addClass("med");
			$(".results__details-col[data-page='" + i + "'] .results__details-text").append("<div data-i18n_ap='r-" + i + "-med' ></div>");
			$(".results__details-col[data-page='" + i + "'] .results__details-word").attr("data-i18n_g", "inspire");
			$(".results__details-col[data-page='" + i + "'] .results__details-image").attr("src", "assets/img/results/inspire.svg");
		} else {
			lows += 1;
			$(".results__circle[data-page='" + i + "']").addClass("low");
			$(".results__details-col[data-page='" + i + "'] .results__details-circle").addClass("low");
			$(".results__details-col[data-page='" + i + "'] .results__details-text").append("<div data-i18n_ap='r-" + i + "-low' ></div>");
			$(".results__details-col[data-page='" + i + "'] .results__details-word").attr("data-i18n_g", "explore");
			$(".results__details-col[data-page='" + i + "'] .results__details-image").attr("src", "assets/img/results/magnify.svg");
		}

		translatePage();

		let timeout;
		i === 4 ? (timeout = 5200) : i === 3 ? (timeout = 4400) : i === 2 ? (timeout = 3600) : (timeout = 2800);
		console.log("timeout si " + timeout);
		setTimeout(function () {
			$(".results__details-top").addClass("initial-fixed");
			$(".results__details-circle[data-page='" + i + "']").css("display", "flex");
			$(".results__details-circle[data-page='" + i + "']").addClass("bounceInDown");
		}, timeout);
		setTimeout(function () {
			$(".results__details-top").css("transition", "all 2s ease");
			$(".results__details").css("transition", "all 2s ease");
			$(".results__details").css("margin-top", "0px");
			$(".results__details-top").removeClass("initial-fixed");

			if (highs === 0) {
				meds === 0 ? $(".results__details-top").addClass("low-height") : $(".results__details-top").addClass("med-height");
			}

			// $(".results__link").each(function(){
			//     const parentWidth = $(this).parent().width();
			//     const parentHeight = $(this).parent().height();

			//     $(this).css("width", parentWidth+"px");
			//     $(this).css("height", parentHeight+"px");

			//     console.log(parentWidth);
			//     console.log(parentHeight);
			// })
		}, 6500);

		setTimeout(function () {
			$(".results__details-heading").fadeIn();
			$(".results__details-text").fadeIn();
			$(".results__details-line").fadeIn();
			$(".results__details-bottom").fadeIn();
			$(".retry-buttons").fadeIn();
			$(".page--alt").addClass("page--alt--desktop");
			$(".results__details-circle").addClass("pulse");
		}, 8700);
	}
}

// transitions
function runCirclesTransition() {
	const pageContent = $(".page__content");
	const classArray = [];

	while (classArray.length < 17) {
		const r = Math.floor(Math.random() * 17) + 1;
		if (classArray.indexOf(r) === -1) classArray.push(r);
	}

	$(".circles-transition__loader").hide();

	$(".circles-transition__circle").each(function () {
		$(this).removeClass("rise");
		const dataCircle = Number($(this).attr("data-circle"));
		// const classToAdd = `transition${classArray[dataCircle - 1]}`;
		const classToAdd = "transition" + classArray[dataCircle - 1];

		$(this).addClass(classToAdd);
	});

	$(".circles-transition").show();

	// pageContent.fadeOut();
	setTimeout(function () {
		$(".circles-transition__circle").addClass("rise");
	}, 50);
	setTimeout(function () {
		$(".section").fadeOut();
	}, 250);

	setTimeout(function () {
		$(".circles-transition__circle").attr("class", "circles-transition__circle rise");
	}, 5000);
}

function loaderCountdown() {
	let time = 5;
	function _setCountdown() {
		$(".circles-transition__counter").html(time.toString());
		$(".circles-transition__counter").show();
		time--;
		if (time >= 0) {
			setTimeout(function () {
				_setCountdown();
			}, 1000);
		} else {
			$(".circles-transition__counter").hide();
		}
	}
	_setCountdown();
	// $(".circles-transition__counter").html("3");
	// $(".circles-transition__counter").show();
	// setTimeout(function(){
	//     $(".circles-transition__counter").html("2");
	// }, 900);
	// setTimeout(function(){
	//     $(".circles-transition__counter").html("1");
	// }, 1800);
	// setTimeout(function(){
	//     $(".circles-transition__counter").hide();
	// }, 2700);
}

function loadQuestionsHtml(questionsToLoad) {
	var type;
	var section;

	for (var k = 0; k < questions.length; k++) {
		if (questions[k].section === questionsToLoad) {
			type = questions[k].type;
			section = questions[k].section;
			rounds = questions[k].rounds;
			content = questions[k].content;

			switch (type) {
				case "bubble-select":
					var parent = $(".bubble-select__wrapper[data-questions='" + section + "']");
					for (var i = 1; i <= rounds; i++) {
						var round = parent.find(".bubble-select[data-bubble='" + i + "']");
						var object = content[i - 1];
						for (var property in object) {
							var key = object[property];
							if (!round.find(".bubble-select__bubble[data-key='" + key + "'] p.text-intro")[0]) {
								round.find(".bubble-select__bubble[data-key='" + key + "']").append('<p data-i18n_ap="' + key + '" class="bubble-select__text text-intro"></p>');
							}
						}
					}
					break;

				case "sized-bubbles":
					var parent = $(".sized-bubbles[data-questions='" + section + "']");
					for (var i = 1; i <= rounds; i++) {
						var round = parent.find(".sized-bubbles__round[data-round='" + i + "']");
						var object = content[i - 1];
						for (var property in object) {
							var key = object[property];
							if (!round.find(".sized-bubbles__bubble[data-key='" + key + "'] p.text-intro")[0]) {
								round.find(".sized-bubbles__bubble[data-key='" + key + "']").append('<p data-i18n_ap="' + key + '" class="text-intro"></p>');
							}
						}
					}
					break;

				case "drag-left-right":
					var parent = $(".drag-left-right[data-questions='" + section + "']");

					for (var i = 1; i <= rounds; i++) {
						var object = content[i - 1];
						for (var property in object) {
							var key = object[property];
							if (!parent.find(".drag-left-right__item[data-key='" + key + "'] p.text-intro")[0]) {
								parent.find(".drag-left-right__item[data-key='" + key + "']").append('<p data-i18n_ap="' + key + '" class="text-intro"></p>');
							}
						}
					}
					break;

				case "drag-left-rightb":
					var parent = $(".drag-left-rightb[data-questions='" + section + "']");

					for (var i = 1; i <= rounds; i++) {
						var object = content[i - 1];
						for (var property in object) {
							var key = object[property];
							if (!parent.find(".drag-left-rightb__item[data-key='" + key + "'] p.text-intro")[0]) {
								parent.find(".drag-left-rightb__item[data-key='" + key + "']").append('<p data-i18n_ap="' + key + '" class="text-intro"></p>');
							}
						}
					}
					break;

				case "drag-to-remove":
					var parent = $(".drag-to-remove[data-questions='" + section + "']");
					for (var i = 1; i <= rounds; i++) {
						var object = content[i - 1];
						for (var property in object) {
							var key = object[property];
							if (!parent.find(".drag-to-remove__item[data-key='" + key + "'] p.text-intro")[0]) {
								parent.find(".drag-to-remove__item[data-key='" + key + "']").append('<p data-i18n_ap="' + key + '" class="text-intro"></p>');
							}
						}
					}
					break;

				case "select-three":
					var parent = $(".select-three[data-questions='" + section + "']");
					for (var i = 1; i <= rounds; i++) {
						var object = content[i - 1];
						for (var property in object) {
							var key = object[property];
							if (!parent.find(".select-three__item[data-key='" + key + "'] p.text-intro")[0]) {
								parent.find(".select-three__item[data-key='" + key + "']").append('<p data-i18n_ap="' + key + '" class="text-intro"></p>');
							}
						}
					}
					break;

				case "drag-options":
					var parent = $(".drag-options[data-questions='" + section + "']");
					for (var i = 1; i <= rounds; i++) {
						var object = content[i - 1];
						for (var property in object) {
							var key = object[property];
							if (!parent.find(".drag-options__item[data-key='" + key + "'] p.text-intro")[0]) {
								console.log("need the things");
								parent.find(".drag-options__item[data-key='" + key + "']").append('<p data-i18n_ap="' + key + '" class="text-intro"></p>');
							}
						}
					}
					break;

				case "drag-order":
					var parent = $(".drag-order[data-questions='" + section + "']");
					for (var i = 1; i <= rounds; i++) {
						var object = content[i - 1];
						for (var property in object) {
							var key = object[property];
							if (!parent.find(".drag-order__drag-item[data-key='" + key + "'] p.text-intro")[0]) {
								parent.find(".drag-order__drag-item[data-key='" + key + "']").append('<p data-i18n_ap="' + key + '" class="text-intro"></p>');
							}
						}
					}
					break;

				case "use-arrows":
					var parent = $(".use-arrows[data-questions='" + section + "']");
					for (var i = 1; i <= rounds; i++) {
						var object = content[i - 1];
						for (var property in object) {
							var key = object[property];
							if (!parent.find(".use-arrows__item[data-key='" + key + "'] p")[0]) {
								parent.find(".use-arrows__item[data-key='" + key + "']").append('<p data-i18n_ap="' + key + '"></p>');
							}
						}
					}
					break;
			}
		}
	}

	translatePage();
}

$("body").on("click", ".circles-transition__inst", function () {
	if ($(this).hasClass("reminder")) {
		$(".nav__item--question").trigger("click");
	}
});

$("body").on("click", ".retryCourse", function () {
	for (let i = 0; i <= bbcPagesSections.length - 1; i++) {
		bbcPagesSections[i].isCompleted = false;

		if (i > 0) {
			bbcPagesSections[i].pageScore = 0;
		}

		for (let j = 0; j < bbcPagesSections[i].section.length; j++) {
			bbcPagesSections[i].section[j].isCompleted = false;
		}
	}
	navigationController.goToPageWithFilename("content/intro.html");
});

$("body").on("click", ".resultsSection", function () {
	// setTimeout(function(){
	runResultsCircles();
	// }, 2600);
});

$("body").on("click", ".continue", function () {
	if ($(this).hasClass("locked")) return;
	if ($(this).hasClass("retryCourse")) return;
	if ($(this).hasClass("openEmailModal")) return;
	if ($(this).hasClass("verifyEmail")) return;
	const pageContent = $(this).closest(".page__content");
	const currentSection = $(this).closest(".section");
	const currentSectionNumber = Number($(currentSection).attr("data-section"));
	const nextSection = $(".section[data-section='" + (currentSectionNumber + 1) + "']");
	const circlesTransition = $(".circles-transition");
	const loader = $(".circles-transition__loader");
	const questionsToLoad = $(this).attr("data-loadquestions");
	let that = this;
	const isMobile = window.screen.availWidth <= 768;
	const isDesktop = window.screen.availWidth >= 1024;
	const sectionBackgroundCircles = $(".section__background-circles");
	const dataQuestions = $(this).closest(".section").find("div[data-questions]").attr("data-questions");
	const questionCounter = Number($(this).attr("data-questioncounter"));

	if ($(this).closest(".section").hasClass("section--select-three")) {
		const modifiedAnswers = $(".select-three__item.selected[data-modifier='2']").length;
		console.log("modified answers total = " + modifiedAnswers);

		questions[5].correctAnswers = questions[5].correctAnswers + modifiedAnswers;
	}

	if (!$(this).hasClass("resultsSection")) {
		if (!$(this).hasClass("nextPage")) {
			window.modules_interactions.completeInteraction(navigationController.activePage, currentSectionNumber);
		} else {
			window.modules_interactions.completePage(navigationController.activePage);
		}
	}

	if ($(this).hasClass("nextPage") && !$(this).hasClass("introPage")) {
		const instruction = $(this).closest(".section").find(".section__inst");
		const preHeading = $(this).closest(".section").find(".section__pre-heading");
		const heading = $(this).closest(".section").find(".section__heading");
		const wellDone = $(this).closest(".section").find(".section__well-done");

		$(this).hide();
		instruction.hide();
		preHeading.hide();
		heading.hide();

		$(".drag-to-remove").hide();
		$(".drag-left-right").hide();
		$(".drag-left-rightb").hide();

		setTimeout(function () {
			wellDone.fadeIn();
		}, 900);
	}

	if ($(this).hasClass("is-scored")) {
		// identify the question answered in questions array in questions.js
		let questionId;

		for (let i = 0; i < questions.length; i++) {
			if (questions[i].section === dataQuestions) {
				questionId = i;
			}
		}

		const questionType = questions[questionId].type;
		const correctAnswers = questions[questionId].correctAnswers;
		const correctAnswerValue = questions[questionId].correctValue;
		let percentageScore = Math.round(correctAnswers * correctAnswerValue);

		if (percentageScore < 0) {
			percentageScore = 0;
		}

		window.modules_interactions.addSectionScore(navigationController.activePage, currentSectionNumber, percentageScore);
	}

	if ($(this).hasClass("is-final-score")) {
		window.modules_interactions.addPageScore(navigationController.activePage);
	}

	$(".circles-transition__inst").hide();

	if ($(this).hasClass("nextPage") && !$(this).hasClass("introPage")) {
		setTimeout(function () {
			runCirclesTransition();
		}, 1600);
	} else {
		runCirclesTransition();
	}
	if (questionsToLoad) {
		loadQuestionsHtml(questionsToLoad);
	}

	if (isMobile) {
		if ($(that).hasClass("nextPage") && !$(that).hasClass("introPage")) {
			setPageComplete();
			setTimeout(function () {
				navigationController.goToNextPage();
			}, 3500);
		} else if ($(that).hasClass("nextPage")) {
			setPageComplete();
			setTimeout(function () {
				navigationController.goToNextPage();
			}, 2500);
		} else if ($(that).hasClass("resultsSection")) {
			setTimeout(function () {
				currentSection.removeClass("section--active");
				nextSection.fadeIn(250);
				setTimeout(function () {
					nextSection.addClass("section--active");
					console.log("making overflow-y hidden");
					$(".page__content").css("overflow-y", "scroll");
					$(".circles-transition").hide();
				}, 250);
			}, 2500);
		} else {
			let timeout = 7600;
			if (nextSection.hasClass("section--end")) {
				timeout = 2500;
			} else {
				setTimeout(function () {
					$(".circles-transition__inst").each(function () {
						const section = $(this).attr("data-section");
						if (section == currentSectionNumber) {
							$(this).show();
						}
					});
					loader.show();
					loaderCountdown();
				}, 2800);
			}
			setTimeout(function () {
				currentSection.fadeOut();
				if (currentSection.parent().hasClass("page__hero-wrapper")) {
					currentSection.parent().hide();
				}
				if (nextSection.hasClass("section--end")) {
					$(".page__content").css("overflow-y", "auto");
				} else {
					$(".page__content").css("overflow-y", "hidden");
				}
				circlesTransition.hide();
				setTimeout(function () {
					nextSection.fadeIn();
					$(".nav__question-counter").html(questionCounter + "/18");
					$(".nav__question-counter").fadeIn();
					if (currentSectionNumber > 0) {
						$(".nav__item--back").addClass("active");
					}
					// pageContent.fadeIn();
					if (nextSection.hasClass("section--drag-left-right")) {
						loadDragLeftRight();
					}
					if (nextSection.hasClass("section--drag-left-rightb")) {
						loadDragLeftRightB();
					}
					if (nextSection.hasClass("section--drag-to-remove")) {
						loadDragToRemove();
					}
					if (nextSection.hasClass("section--drag-options")) {
						loadDragOptions();
					}
					if (nextSection.hasClass("section--drag-order")) {
						loadDragOrder();
					}
				}, 600);
				currentSection.removeClass("section--active");
				nextSection.fadeIn(250);
				$(".nav__question-counter").html(questionCounter + "/18");
				$(".nav__question-counter").fadeIn(250);
				if (currentSectionNumber > 0) {
					$(".nav__item--back").addClass("active");
				}
				setTimeout(function () {
					nextSection.addClass("section--active");
				}, 250);
			}, timeout);
		}
	} else {
		sectionBackgroundCircles.fadeOut();
		let desktopTimeout = 2500;
		if ($(that).hasClass("nextPage") && !$(that).hasClass("introPage")) desktopTimeout = 3500;
		setTimeout(function () {
			if ($(that).hasClass("nextPage")) {
				setPageComplete();
				navigationController.goToNextPage();
			} else if ($(that).hasClass("nextSection")) {
				// pageContent.fadeOut();
				currentSection.fadeOut();
				if (currentSection.parent().hasClass("page__hero-wrapper")) {
					currentSection.parent().hide();
				}
				circlesTransition.hide();
				setTimeout(function () {
					nextSection.fadeIn();
					$(".nav__question-counter").html(questionCounter + "/18");
					$(".nav__question-counter").fadeIn();
					if (currentSectionNumber > 0) {
						$(".nav__item--back").addClass("active");
					}
					// pageContent.fadeIn();
					if (nextSection.hasClass("section--drag-left-right")) {
						loadDragLeftRight();
					}
					if (nextSection.hasClass("section--drag-left-rightb")) {
						loadDragLeftRightB();
					}
					if (nextSection.hasClass("section--drag-to-remove")) {
						loadDragToRemove();
					}
					if (nextSection.hasClass("section--drag-options")) {
						loadDragOptions();
					}
					if (nextSection.hasClass("section--drag-order")) {
						loadDragOrder();
					}
				}, 1000);
				currentSection.removeClass("section--active");
				if (isDesktop) {
					if (!nextSection.hasClass("section--end")) {
						sectionBackgroundCircles.fadeIn(250);
					}
				}
				nextSection.fadeIn(250);
				$(".nav__question-counter").html(questionCounter + "/18");
				$(".nav__question-counter").fadeIn(250);
				if (currentSectionNumber > 0) {
					$(".nav__item--back").addClass("active");
				}

				setTimeout(function () {
					nextSection.addClass("section--active");
				}, 250);
			}
		}, desktopTimeout);
	}
	$(".nav__item--question").removeClass("d-none");
});

// back a question button
$("body").on("click", ".nav__item--back.active", function () {
	$(".nav__item--back").removeClass("active");
	const currentSectionElement = $(".section--active");
	const currentSectionNumber = Number($(".section--active").attr("data-section"));
	const previousSection = $(".section[data-section='" + (currentSectionNumber - 1) + "']");
	const previousSectionQuestions = previousSection.find("div[data-questions]").attr("data-questions");
	const previousSectionQuestionCounter = previousSection.attr("data-questioncounter");

	for (var k = 0; k < questions.length; k++) {
		if (questions[k].section === previousSectionQuestions) {
			type = questions[k].type;
			section = questions[k].section;

			switch (type) {
				case "bubble-select":
					$(".bubble-select__bubble").removeClass("active");
					$(".bubble-select[data-bubble='1']").css("display", "flex");
					break;

				case "sized-bubbles":
					break;

				case "drag-left-right":
					$(".drag-left-right__item").removeClass("dragged-left");
					$(".drag-left-right__item").removeClass("dragged-right");
					$(".drag-left-right__item").hide();
					$(".drag-left-right__item[data-item='1']").css("display", "block");

					break;

				case "drag-left-rightb":
					break;

				case "drag-to-remove":
					$(".continue--hidden").hide();

					if (section === "accountable3") {
						$.get("content/partials/drag-to-remove-accountable.html", function (data) {
							$(".drag-to-remove--accountable").html(data);
						});
					} else if (section === "develop2") {
						$.get("content/partials/drag-to-remove-develop.html", function (data) {
							$(".drag-to-remove--develop").html(data);
						});
					}

					break;

				case "select-three":
					$(".select-three__item").removeClass("selected");
					break;

				case "drag-options":
					if (section === "empower3") {
						$.get("content/partials/drag-options-empower.html", function (data) {
							$(".drag-options__item-wrapper").html(data);
						});
					} else if (section === "accountable2") {
						$.get("content/partials/drag-options-accountable-drop.html", function (data) {
							$(".drag-options__item-wrapper").html(data);
						});
					}

					break;

				case "drag-order":
					break;

				case "use-arrows":
					$(".continue--hidden").hide();
					$.get("content/partials/carousel-upper.html", function (data) {
						$(".carousel__upper").html(data);
					});
					setTimeout(function () {
						$.get("content/partials/coin.html", function (data) {
							$(".carousel__control").html(data);
						});
						createCarousels();
					}, 50);
					$(".use-arrows__item").removeClass("selected");
					$(".carousel__slide").removeClass("active");
					$(".carousel__slide[rel='0']").addClass("active");

					break;
			}
		}
	}

	$(".page__content").fadeOut();
	setTimeout(function () {
		$(".section").removeClass("section--active");
		$(".section").hide();
		previousSection.addClass("section--active");
		previousSection.show();
		$(".continue--hidden").hide();

		loadQuestionsHtml(previousSectionQuestions);
		$(".page__content").fadeIn();
		$(".nav__question-counter").html(previousSectionQuestionCounter + "/18");

		if (previousSection.hasClass("section--drag-left-right")) {
			loadDragLeftRight();
		}
		if (previousSection.hasClass("section--drag-left-rightb")) {
			loadDragLeftRightB();
		}
		if (previousSection.hasClass("section--drag-to-remove")) {
			loadDragToRemove();
		}
		if (previousSection.hasClass("section--drag-options")) {
			loadDragOptions();
		}
		if (previousSection.hasClass("section--drag-order")) {
			console.log("previous section has drag order so loading drag order");
			loadDragOrder();
		}
	}, 800);
});

// mobile toggle instructions
$("body").on("click", ".nav__item--question", function () {
	let that = this;

	if ($(this).hasClass("clicked")) {
		$(".page__content").fadeOut("slow");
		setTimeout(function () {
			$(".circles-transition__loader").show();
			$(".circles-transition").hide();
			$(".section--active").show();
			$(".page__content").fadeIn("slow");
			$(that).removeClass("clicked");
			$(".circles-transition__inst").removeClass("reminder");
		}, 600);
	} else {
		$(".page__content").fadeOut("slow");
		$(".circles-transition__inst").addClass("reminder");
		setTimeout(function () {
			$(".section--active").hide();
			$(".circles-transition__loader").hide();
			$(".circles-transition").show();
			$(".page__content").fadeIn("slow");
			$(that).addClass("clicked");
		}, 600);
	}
});

// bookmarking

function setPageComplete() {
	const url = navigationController.currentPageUrl,
		p = navigationController.activePage;

	dataController.setData(url, "true");
	dataController.save();
	pages[p].complete = true;
}

// mobile toggle instructions
$("body").on("click", ".debugScore", function () {
	setTimeout(function () {
		const leadScore = bbcPagesSections[1].pageScore;
		const empowerScore = bbcPagesSections[2].pageScore;
		const accountableScore = bbcPagesSections[3].pageScore;
		const developScore = bbcPagesSections[4].pageScore;
		alert("lead: " + leadScore + " empower " + empowerScore + " accountable " + accountableScore + " develop " + developScore);
	}, 300);
});