const courseData = function () {
    const self = this;

    let tempData = new Array();
    let suspendData = new Array();
    let dataItem = function () { this.key = "", this.value = "" }

    function init() {
        self.restore();
    }
    this.getData = function (key) {
        let returnVal = null;
        $.each(tempData, function (i, o) {
            if (o.key == key) { returnVal = o.value };
        });

        //check if we need to convert back to an array
        if (returnVal !== null && returnVal !== '') {
            if (returnVal.toString().indexOf(":") !== -1) {
                try {
                    returnVal = returnVal.split(":");
                } catch (err) {
                    console.log("returned data not valid for split");
                }
            }
        }
        return returnVal;
    }
    this.setData = function (key, value) {
        //first convert an array if we have one
        if (Array.isArray(value)) {
            value = value.join(':');
        }
        //then save it
        found = false;
        $.each(tempData, function (i, o) {
            if (o.key == key) { o.value = value; found = true; };
        });
        if (!found) {
            var d = new dataItem;
            d.key = key;
            d.value = value;
            tempData.push(d);
        }
    }
    this.clear = function () {
        //clear down
        tempData = [];
        suspendData = [];
    }
    this.save = function () {
        //check if we need to save to LMS if available, or to localStorage if not.
        let d = JSON.stringify(tempData);
        d = d.replace(/[']/g, "¬");
        d = d.replace(/["]/g, "~");
        d = d.replace(/[\[\]]+/g, "");
        d = d.replace(/[,]/g, "|");
        if (scormController._scormConnected) {
            //todo UNDO - temporarily disable saving suspend data
            scormController.instance.setSuspendData(d)
        } else {
            if (DEBUG == true) {
                localStorage.setItem(projectID, d);
            } else {
            }
        }
    }
    this.restore = function () {
        //check if we need to save to LMS if available, or to localStorage if not.
        if (scormController._scormConnected) {
            //RESTORING DATA FROM LMS
            let p = scormController.instance.getSuspendData();

            if (p != null && p != '') {
                p = p.replace(/[~]/g, "\""); p = p.replace(/[|]/g, ","); p = p.replace(/[¬]/g, "'"); p = '[' + p + ']';
                tempData = JSON.parse(p);
            }
        } else {
            //RESTORING DATA FROM LOCAL STORAGE
            let p = localStorage.getItem(projectID);

            if (p != null && p != '') {
                p = p.replace(/[~]/g, "\""); p = p.replace(/[|]/g, ","); p = p.replace(/[¬]/g, "'"); p = '[' + p + ']';

                tempData = JSON.parse(p);
            }
        }
    }

    init();
}