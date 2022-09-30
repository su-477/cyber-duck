const DevOpsController = function () {
    const self = this;
    this.endPoint = '';
    this.workItems = new Array();
    this.token = ''; // Visual Studio Personal Access Token, this will be used as a login.
    this.team = new Array();

    this.loggedIn = false;
    this.login = $("#devOpsLogin");
    this.loginButton = null;
    this.loginState = null;

    $.get("edit/ajax/_devOpsLogin.html", function (data) {
        self.login.html(data);

        self.loginButton = $("#devOpsLoginBtn");
        self.loginState = $("#devOpsLoginBtn .state");

        let loginProcessing = false;
        $("#devOpsLogin .debug-login__close").on('click', function () {
            self.login.fadeOut(250);
        });

        $("#devOpsLogin .debug-login__form").on('submit', function (e) {
            e.preventDefault();
            if (loginProcessing) {
                return;
            } else {
                loginProcessing = true;
            }
            self.loginButton.addClass('loading');
            self.loginState.html('Authenticating');
            self.doLogin($('#devOpsPAT').val());
        });
    });


    this.doLogin = function (pat) {

        $.ajax({
            type: "GET",
            url: '',
            async: true,
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + pat));
            },
        }).done(function (res) {

            self.loginButton.addClass('ok');
            self.loginState.html('Welcome back!');
            self.login.fadeOut(250);
            self.loggedIn = true;
            self.token = pat;

            // Save token for next session
            dataController.setData("DevOpsPAT", pat);
            dataController.save();

            // Initialise DevOps.
            self.init();

        }).fail(function (xhr, text, error) {
            console.log(xhr + ", " + text + ", " + error);

            self.loginButton.addClass('ok');
            self.loginState.html('Login failed, please check your DevOps Personal Access Token is still valid.');
            setTimeout(function () {
                self.loginState.html('Log in');
                self.loginButton.removeClass('ok loading');
                loginProcessing = false;
            }, 3000);

        });
    }

    // Get all users assigned to project.
    this.init = function () {

        $.ajax({
            type: "GET",
            url: '' + moduleController.projectURL + '/teams?api-version=5.1',
            async: true,
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + self.token));
            },
        }).done(function (data) {
            let teamId = data.value[0].id;

            $.ajax({
                type: "GET",
                url: '' + moduleController.projectURL + '/teams/' + teamId + '/members?api-version=5.1',
                async: true,
                crossDomain: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + self.token));
                },
            }).done(function (data) {
                self.team = [];
                // Store all team members in devOps.team
                $("#projectTeam").html("");
                if (moduleController.clientMode === true) {
                    $("#projectTeam").append('Project Team isn\'t available whilst viewing in Client Mode.');
                } else {
                    for (let i = 0; i < data.value.length; i++) {
                        let user = data.value[i].identity;
                        self.team.push(user);
                        let userStr = '<tr>';
                        userStr += '<td>' + user.displayName + '</td>';
                        userStr += '<td>' + user.uniqueName + '</td>';
                        userStr += '</tr>';
                        $("#projectTeam").append(userStr);
                    }
                    // Pull all Work Items
                    self.getAllItems($("#debugWorkItems tbody"));
                }
            });
        });


    };

    this.addTeam = function (id) {
        let $el = $("#" + id);
        $el.html("");

        if (moduleController.clientMode === true) {
            $el.append('<option data-userid="e1007c03-28b8-4025-86c4-8a993021ba83" value="Client Review <pmdevelopers@purplemedia.co.uk">Development</option>');
        } else {
            $el.append("<option selected disabled default>Select User</option")
            for (let i = 0; i < self.team.length; i++) {
                let user = self.team[i];
                $el.append("<option data-userid='" + user.id + "' value='" + user.displayName + " <" + user.uniqueName + ">'>" + user.displayName + "</option");
            }
        }
    };

    // Gets every revision of all work items.
    this.getAllItems = function (el) {
        self.workItems = [];
        $.ajax({
            type: "GET",
            url: self.endPoint + '/_apis/wit/reporting/workitemrevisions?api-version=5.1-preview.1',
            async: true,
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + self.token));
            },
        }).done(function (data) {
            $("#debugWorkItems tbody").html(""); // Empty table to stop duplication.
            if (data.values.length === 0) return "NoWorkItems";
            data = data.values;
            let temp = new Array();
            // We need to filter the revisions and make sure we have the latest.
            for (let i = data.length; i > 0; --i) {
                let WI = data[i - 1].fields;
                if (temp.indexOf(WI["System.Id"]) === -1) {
                    temp.push(WI["System.Id"]);
                    self.workItems.unshift(WI);
                }
            };

            // Loop through these work items and add them to the table.
            for (let i = 0; i < self.workItems.length; i++) {
                let d = self.workItems[i];
                let str = "<tr class='workItem' data-workitemtype='" + d['System.WorkItemType'] + "' data-workitemstate='" + d['System.State'] + "' data-workitemassignedto='" + d['System.AssignedTo'] + "'>";
                str += "<td>" + d['System.Id'] + "</td>";
                str += "<td class='workItem__Page' onclick='opn.navigationController.goToPageWithTitle(\"" + d['System.Tags'] + "\")'>" + d['System.Tags'] + "</td>";
                str += "<td data-workitemid='" + d['System.Id'] + "' class='workItem__Title workItem--" + d['System.WorkItemType'] + "'>" + d['System.Title'] + "</td>";
                str += "<td>" + d['System.AssignedTo'] + "</td>";
                str += "<td>" + d['System.State'] + "</td>";
                str += "<td>" + (d['System.BoardColumn'] !== undefined ? d['System.BoardColumn'] : 'Unassigned') + "</td>";
                str += "<td><a href='" + self.endPoint + "/_workitems/edit/" + d['System.Id'] + "' target='_blank'>Open in DevOps</a></td>";
                str += "</tr>";
                el.append(str);
            }


        }).fail(function (e) {
            console.error("Failed to get DevOps WorkItems: " + e);
        });
    };

    // Get more info on a specific work item.
    this.getWorkItemInfo = function (id) {
        let info = [];
        $.ajax({
            type: "GET",
            url: self.endPoint + '/_apis/wit/workitems?ids=' + id + '&$expand=all&api-version=5.1',
            async: true,
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + self.token));
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
            for (var i = 0; i < self.workItems.length; i++) {
                if (self.workItems[i]['System.Id'] === Number(id)) {
                    self.workItems[i].info = info;
                };
            }
            self.getWorkItemComments(id);
        }).fail(function (e) {
            console.error("Failed to get DevOps WorkItem: " + e);
        });;
    }
    // Get more info on a specific work item.
    this.getWorkItemComments = function (id) {
        let comments = [];

        $.ajax({
            type: "GET",
            url: self.endPoint + '/_apis/wit/workitems/' + id + '/comments?api-version=5.1-preview.3',
            async: true,
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + self.token));
            },
        }).done(function (data) {
            comments = data.comments;
            for (var i = 0; i < self.workItems.length; i++) {
                if (self.workItems[i]['System.Id'] === Number(id)) {
                    self.workItems[i].comments = comments;
                };
            }
            $.publish("/workitem/loaded", [id]);
        }).fail(function (e) {
            console.error("Failed to get DevOps WorkItem: " + e);
        });
    }

    // Create DevOps Work Item
    this.createWorkItem = function (image, type, title, assigned, description, system) {
        /*
         * Type         = 'task' | bug'
         * Title        = 'string'
         * Description  = 'string' *This is [Description] for Tasks but [ReproSteps] for Bugs
         * System       = 'string' *Note this is System Info, only used in Bugs.
         * */

        // Check for image
        if (image !== null) {
            description += '</div><img src="' + image + '"/>'
        } else {
            description += '</div>'
        }

        body = [
            {
                "op": "add",
                "path": "/fields/System.Title",
                "value": title
            },
            {
                "op": "add",
                "path": "/fields/System.AssignedTo",
                "value": assigned
            }
        ];
        if (type === 'task') {
            // Type is task.
            body.push({
                "op": "add",
                "path": "/fields/System.Description",
                "value": "<div>" + description
            });
        } else {
            // Type is bug
            body.push({
                "op": "add",
                "path": "/fields/Microsoft.VSTS.TCM.ReproSteps",
                "value": "<div>" + description
            });
            body.push({
                "op": "add",
                "path": "/fields/Microsoft.VSTS.TCM.SystemInfo",
                "value": system
            });
        }
        console.log(image)
        //return false;

        $.ajax({
            type: "POST",
            url: self.endPoint + '/_apis/wit/workitems/$' + type + '?api-version=5.1',
            beforeSend: function (xhr) { xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + self.token)) },
            headers: { 'Content-Type': 'application/json-patch+json' },
            crossDomain: true,
            async: true,
            dataType: 'json',
            data: JSON.stringify(body),
        }).done(function (data) {
            let response = data.id;
            testController.alert("WorkItem added.");

            // Reset fields
            $(".newItem__radio[name=type]").prop('checked', false);
            $("#issueTitle").val('');
            $("#issueDescription").val('');
            document.getElementById("issueAssignedTo").selectedIndex = 0;

            return response;
        }).fail(function (e) {
            testController.alert("Report failed, please try again.")
            console.error("Failed to post DevOps WorkItem: " + e);
        });
    }

    this.filter = function (f) {
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
    };


    this.addComment = function (id, comment) {
        $.ajax({
            type: "POST",
            url: self.endPoint + '/_apis/wit/workitems/' + id + '/comments?api-version=5.1-preview.3',
            beforeSend: function (xhr) { xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + self.token)) },
            headers: { 'Content-Type': 'application/json' },
            crossDomain: true,
            async: true,
            dataType: 'json',
            data: JSON.stringify({ "text": comment })
        }).done(function (data) {
            console.log("Comment added successfully");
        }).fail(function (e) {
            testController.alert("Failed to post comment, please try again.");
        });
    };

    this.updateWorkItem = function (rev, id, type, title, desc, assigned, callback) {
        let body = [
            {
                "op": "test",
                "path": "/rev",
                "value": rev
            },
            {
                "op": "add",
                "path": "/fields/System.Title",
                "value": title
            },
            {
                "op": "add",
                "path": "/fields/System.AssignedTo",
                "value": assigned
            }
        ]
        if (type === 'Task') {
            body.push({
                "op": "add",
                "path": "/fields/System.Description",
                "value": desc
            })
        } else {
            body.push({
                "op": "add",
                "path": "/fields/Microsoft.VSTS.TCM.ReproSteps",
                "value": desc
            })
        }

        console.log(JSON.stringify(body))

        $.ajax({
            type: "PATCH",
            url: self.endPoint + '/_apis/wit/workitems/' + id + '?api-version=5.1',
            beforeSend: function (xhr) { xhr.setRequestHeader("Authorization", "Basic " + btoa(":" + self.token)) },
            headers: { 'Content-Type': 'application/json-patch+json' },
            crossDomain: true,
            async: true,
            dataType: 'json',
            data: JSON.stringify(body)
        }).done(function (data) {
            testController.alert("Work Item updated.");
            $(".editWorkItem").remove();
            self.getAllItems($("#debugWorkItems tbody"));

        }).fail(function (e) {
            testController.alert("Failed to update work item, please try again.");
        });
    }

}