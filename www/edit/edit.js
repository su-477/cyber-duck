//var $ = jQuery.noConflict();

var opn = window.opener

// Pull work items
opn.devOps.getAllItems($("#workitems"))


function filter(f) {
    // This is called from the checkboxes on the WorkItems Filter panel.
    let toggle = $(f).attr("data-toggleView");
    let filter = $(f).attr("value");
    $(".workItem").each(function () {
        if ($(this).attr("data-" + toggle) === filter) {
            if ($(f).is(":checked")) {
                $(this).show();
            } else {
                $(this).hide();
            };
        };
    });
}

$('body').on('click', '.workItem__Title', function () {

    //$.subscribe("/workitem/loaded", populateInfo);

    var id = $(this).attr('data-workitemid');

    //opn.devOps.getWorkItemInfo(id);

    let info = [];
    $.ajax({
        type: "GET",
        url: opn.devOps.endPoint + '/_apis/wit/workitems?ids=' + id + '&$expand=all&api-version=5.1',
        async: true,
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + opn.devOps.token));
        },
    }).done(function (data) {
        let item = data.value[0].fields;
        switch (item["System.WorkItemType"]) {
            case 'Task':
                info.push(item["System.Description"]);
                break;
            case 'Bug':
                info.push(item["Microsoft.VSTS.TCM.ReproSteps"]);
                info.push(item["Microsoft.VSTS.TCM.SystemInfo"]);
                break;
        }
        info.push(item['System.Tags']);
        for (var i = 0; i < opn.devOps.workItems.length; i++) {
            if (opn.devOps.workItems[i]['System.Id'] === Number(id)) {
                opn.devOps.workItems[i].info = info;
            };
        }
        let comments = [];

        $.ajax({
            type: "GET",
            url: opn.devOps.endPoint + '/_apis/wit/workitems/' + id + '/comments?api-version=5.1-preview.3',
            async: true,
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + opn.devOps.token));
            },
        }).done(function (data) {
            comments = data.comments;
            for (var i = 0; i < opn.devOps.workItems.length; i++) {
                if (opn.devOps.workItems[i]['System.Id'] === Number(id)) {
                    opn.devOps.workItems[i].comments = comments;
                };
            }
            populateOpenInfo()
        }).fail(function (e) {
            console.error("Failed to get DevOps WorkItem: " + e);
        });
    }).fail(function (e) {
        console.error("Failed to get DevOps WorkItem: " + e);
    });

    // This will run after the API calls have completed.
    function populateOpenInfo() {

        console.log("populate info")

        //$.unsubscribe("/workitem/loaded", populateInfo);

        // Get WorkItem from local Array.
        let openWi = null;
        for (var i = 0; i < opn.devOps.workItems.length; i++) {
            if (opn.devOps.workItems[i]['System.Id'] === Number(id)) {
                openWi = opn.devOps.workItems[i];

            };
        }

        if (openWi !== null) {
            console.log(openWi)
            // Populate edit fields with this work item.
            $(".editWorkItem").remove();
            $(".debugPane").prepend(opn.editWorkItem);
            if (openWi["System.Tags"] !== undefined) {
                $("#editWI_GoTo").off('click').on('click', function () {
                    opn.navigationController.goToPageWithTitle(openWi["System.Tags"]);
                });
            } else {
                $("#editWI_GoTo").hide();
            };
            $(".editWorkItem").css("opacity", "1");
            $("#editWI_ID").html(openWi["System.Id"]);
            $("#editWI_Title").val(openWi["System.Title"]);
            $("#editWI_Desc").html(openWi.info[0]);
            var created = new Date(openWi["System.CreatedDate"]);
            created = created.toLocaleString();
            $("#editWI_Created").html("Created by " + openWi["System.CreatedBy"] + " at " + created);
            var modified = new Date(openWi["System.ChangedDate"]);
            modified = modified.toLocaleString();
            $("#editWI_Changed").html("Modified by " + openWi["System.ChangedBy"] + " at " + modified);

            let $el = $("#open #editAssignedTo")
            $el.html("");
            $el.append("<option selected disabled default>Select User</option")
            for (let i = 0; i < opn.devOps.team.length; i++) {
                let user = opn.devOps.team[i];
                $el.append("<option data-userid='" + user.id + "' value='" + user.displayName + " <" + user.uniqueName + ">'>" + user.displayName + "</option");
            }

            $("#editLeftPanel").append("<a href='" + opn.devOps.endPoint + "/_workitems/edit/" + openWi['System.Id'] + "' target='_blank'><button>Open in DevOps</button></a>")

            // Populate comments
            for (var c = openWi.comments.length; c > 0; --c) {
                var com = openWi.comments[c - 1];
                console.log(com)
                var d = new Date(com.modifiedDate);
                d = d.toLocaleString();
                $("#workItemComments").append("<div class='editWorkItem__comment'><h6>" + com.createdBy.displayName + "</h6><div>" + com.text + "</div><div class='editWorkItem__date'>" + d + "</div></div>");
            }

            $(".editWorkItem__comments").append("<div contenteditable class='editWorkItem__description' id='newComment'></div>");
            $(".editWorkItem__comments").append("<button class='editWorkItem__button' id='commentScreenshot'>Add screenshot to comment</button>");
            $(".editWorkItem__comments").append("<button class='editWorkItem__button' id='addComment'>Add comment</button>");

            // Get screenshot and add it to comment
            $("#commentScreenshot").off('click').on('click', function () {

                window.opener.$("#main").css("background", window.opener.$("body").css("background"));
                if (opn.pages[opn.navigationController.activePage].theme === 'video') {
                    window.opener.$("#main").css("background", window.opener.$(".vjs-poster").css("background-image"));
                }

                var node = opn.document.querySelector('#main');
                var scrollTop = window.opener.$("#main").scrollTop();
                window.opener.$("#stage").css("margin-top", "-" + scrollTop + "px");
                var options = {
                    quality: opn.testController.screenshotQuality,
                    width: opn.innerWidth,
                    height: opn.innerHeight
                }
                let img = null
                opn.domtoimage.toJpeg(node, options)
                    .then(function (dataUrl) {
                        window.opener.$("#main").css("background", "none")
                        window.opener.$("#stage").css("margin-top", "0px");
                        window.opener.$("#main").scrollTop(scrollTop);
                        image = dataUrl;
                        $("#newComment").append('<img src="' + image + '"/>');
                    })
                    .catch(function (error) {
                        window.opener.$("#main").css("background", "none")
                        console.log(error)
                        window.opener.$("#stage").css("margin-top", "0px");
                        window.opener.$("#main").scrollTop(scrollTop);
                        image = null;
                    });
            })

            // Upload comment.
            $("#addComment").off('click').on('click', function () {
                // Check if comment box is not empty.
                if ($('#newComment').html() !== '') {
                    var comment = $('#newComment').html()
                    opn.devOps.addComment(id, comment);
                    $("#workItemComments").append("<div class='editWorkItem__comment'><h6>You</h6><div>" + comment + "</div><div class='editWorkItem__date'>Just now</div></div>");
                    $('#newComment').html("")
                }
            });
            // Update workItem.
            $("#editWI_Submit").off('click').on('click', function () {

                var id = $("#open #editWI_ID").html();
                var title = $("#open #editWI_Title").val();
                var desc = $("#open #editWI_Desc").html();
                var assigned = $("#open #editAssignedTo").val();
                var type = openWi["System.WorkItemType"]
                var rev = openWi["System.Rev"]

                if (title === '') {
                    alert("Please enter a Work Item title.");
                    return false;
                }
                if (desc === '') {
                    alert("Please enter a Work Item description.");
                    return false;
                }
                if (assigned === null) {
                    alert("Please assign a user to this Work Item.");
                    return false;
                }
                console.log(rev, id, type, title, desc, assigned)
                opn.devOps.updateWorkItem(rev, id, type, title, desc, assigned, populateOpenInfo);


            });

            // Close work item.
            $(".editWorkItem__close").off('click').on('click', function () {
                $(".editWorkItem").remove();
            })
        }
    }

});