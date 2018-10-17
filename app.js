const express = require('express');
const ical = require('node-ical');
const gen = require('ical-generator');
let logger = require('morgan');
let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const eventsFromUrl = url => new Promise((resolve, reject) => {
    ical.fromURL(url, {}, (err, data) => {
        if (err) reject(err);
        resolve(data);
    });
});

const parseSummary = (summary) => {
    if (summary.includes(' is due')) return {summary};
    let parts = summary.split('/');
    let courseName = parts[parts.length - 1].split(',')[0];
    return {
        summary: courseName.split("-")[2].trim() + " - " + parts[1],
        location: parts[parts.length - 2]
    };
};

app.get("*", (req, res) => {
    let userid = req.query.userid;
    let token = req.query.authtoken;

    let cal = gen();
    cal.domain("mycourses.aalto.fi");

    let url = `https://mycourses.aalto.fi/calendar/export_execute.php?userid=${userid}&authtoken=${token}&preset_what=all&preset_time=custom`

    eventsFromUrl(url)
        .then((data) => {
            let events = [];
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    let ev = data[k];
                    let better = parseSummary(ev.summary);
                    let event = {
                        start: ev.start || "",
                        end: ev.end || "",
                        timestamp: ev.dtstamp || "",
                        summary: ev.summary || "",
                        uid: ev.uid.split('@')[0] || "",
                        description: ev.description || "",
                        lastModified: ev.lastmodified || "",
                    };
                    event = {...event, ...better};
                    events = [...events, event];
                }
            }

            cal.events(events);
            res.send(cal.toString())
        })
        .catch((err) => {
            console.error(err);
            res.send({error: true});
        });
});

module.exports = app;
