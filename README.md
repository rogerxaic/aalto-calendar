# Aalto calendar translator
This is a node web server that fixes Aalto mycourses calendar events.
Event names are weird and include date and location. This translator removes the date, sets the correct location field for each event and fixes the name to something more human-readable.

The server listens on port: PORT (environment variable, otherwise defaults to 3000). Any route works as long as userid and authtoken parameters are in the url. For instance, you would only need to change "mycourses.aalto.fi" to "domain.ltd:port" and leave the rest as it is for this to work.
