var express = require('express');
var app = express();
var parser = require('rssparser');
var extractor = require('unfluff');
var request = require('request');


var HEAD = [
          '<!DOCTYPE html>',
          '<head>',
          '<meta name="viewport" content="width=device-width, initial-scale=1">',
          '</head>',
          '<body style="line-height: 120%;">'
           ].join('');

var FOOT = [
          '</body>',
          '</html>'
          ].join('');

var buffer = '',
    bufferDate = new Date(); //buffer hourly


app.get('/', function(req, res){
  res.header("Content-Type", "text/html; charset=utf-8");

  if (!buffer || (new Date() - bufferDate) > 30 * 60 * 1000){
    var html = '<h1>Hacker News</h1>',
        item;


    var options = {};
    //rss feeds
    parser.parseURL('https://news.ycombinator.com/rss', options, function(err, out){
      //res.send(JSON.stringify(out));
      for (var i=0, ii=out.items.length;i<ii;i+=1){
        item = out.items[i];
        html += '<p>'+ (i+1) + ':' + item.title + 
                '<br><a href="/unfluff?uri=' + item.url + '">' + item.url.split('//')[1]+ '</a></p>';
      }
      buffer = HEAD + html + FOOT;
      bufferDate = new Date();
      res.send(HEAD + html + FOOT);
    });
  } else {
    res.send(buffer + '<hr>BUFFERED: ' + bufferDate);
  }
});


app.get('/unfluff', function(req, res){
  res.header("Content-Type", "text/html; charset=utf-8");
  
  var html = '',
      data;
  request(req.query.uri, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      data = extractor(body);
      html += '<p><a href="/">Back</a></p><hr>';
      html += '<h3>' + data.title + '</h3>';
      html += '<p><a href="'+ req.query.uri +'" target="_blank">' + req.query.uri+ '</a></p>';
      if (data.image != null) {html += '<img style="max-width: 100%;" src="' + data.image  +'"/>';}
      html += '<p>' + data.text + '</p>';
      html += '<hr><a href="/"><p>Back</p></a>';
      res.send(HEAD + html + FOOT); // Print the google web page.
    }
  })  
});

app.listen(3000);
