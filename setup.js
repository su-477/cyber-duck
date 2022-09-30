const prompt = require("prompt");
const replace = require("replace-in-file");

const uuid = require("uuid");
const gulp = require("gulp");
require('./gulpfile.js')

// prompt the user for different config
prompt.start();

const properties = [
    // {
    //     name: 'ProjectID',
    //     description: 'Enter the Project ID (UUID/GUID)',
    //     validator: /^[a-fA-F0-9\s\-]+$/,
    //     warning: 'ProjectID must be a valid UUID'
    // },
    {
        name: 'ProjectNumber',
        description: 'Enter the project number',
        validator: /^[0-9\s\-]+$/,
        warning: 'Project Number must only contain numbers'
    },
    {
        name: 'Client',
        description: 'Enter the client name',
    },
    {
        name: 'Module',
        description: 'Enter the module name',
    }
];

function r(options) {
    try {
        let changedFiles = replace.sync(options);
    } catch (e) {}
}

prompt.start();

prompt.get(properties, function (err, result) {
    if (err) { return onErr(err); }

    let complete = false;

    for (let i = 0; i < properties.length; i++) {
        const options = {
            files: 'scripts/settings.js',
            from: '%' + properties[i].name + '%',
            to: result[properties[i].name]
        }

        r(options);        
    }

    const id = uuid.v4();

    const options = {
        files: 'scripts/settings.js',
        from: '%ProjectID%',
        to: id
    }
    r(options);

    gulp.task('dev')();
    console.log("Settings updated. Please update values in www/imsmanifest.xml.");

});

function onErr(err) {
    console.log(err);
    return 1;
}

const settings = {
    "ProjectID": "%ProjectID%",
    "ProjectNo": "%ProjectNumber%",
}
