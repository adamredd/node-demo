var http = require("http"),
    fs = require("fs");

function servePage(file, response)
{
    fs.readFile(file, function(err, html) {
        if (err)
        {
            throw err;
        }
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    });
}

exports.servePage = servePage;
