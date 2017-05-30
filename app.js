const http = require('http');
const twit = require('twit');
const express = require('express');
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser');
const config = require('./config/config.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/v1/tweets', (req, res) => {

    var accessToken = req.body.accessToken;
    var secretAccessToken = req.body.secretAccessToken;
    var data = req.body.data;

    var T = new twit({
      consumer_key: config.keys.consumer_key,
      consumer_secret: config.keys.consumer_secret,
      access_token: accessToken,
      access_token_secret: secretAccessToken
    });
    
    function getTweets(keyword,callback){
       console.log("\n====== REQUEST START =========");
       console.log('Access Token: ' + accessToken);
       console.log('Keyword: ' + keyword.keyword);
       console.log('Language: ' + keyword.language);
       console.log('Count: ' + keyword.count);
       console.log("====== REQUEST END ===========\n");
      var keywordTweets = [];
      T.get('search/tweets', { q: keyword.keyword + " lang:" + keyword.language, count: keyword.count }, (err, tweets, response) => {
            if (err) { console.log(err); }
            for (var i in tweets.statuses){
                keywordTweets.push(tweets.statuses[i]);
            }
            callback(keywordTweets);
        });
    }

    var validKeywordData = [];
    var validKeywords = [];
    var validData = [];
    data.forEach((keyword, index, array) => {
        getTweets(keyword, (tweets) => {
            validKeywordData.push(tweets);
            validKeywords.push(keyword.keyword);
            if (validKeywordData.length === array.length){
                for (var key in validKeywordData){
                  validData[key] = validKeywordData[key];
                }
                var sortedKeywords = keys(validKeywords).sort();
                var sortedData = [];
                 for (var k in sortedKeywords){
                     if (validData[sortedKeywords[k]]){
                         sortedData[sortedKeywords[k]] = validData[sortedKeywords[k]];
                     }
                }
                res.status(200).json({status: true,tweets: sortedData, keywords: validKeywords});
            }
        });
    });

    function keys(obj){
        var keys = [];
        for(var key in obj)
        {
            if(obj.hasOwnProperty(key))
            {
                keys.push(key);
            }
        }
        return keys;
    }
  
    
    // T.get('search/tweets', {q: keyword + " lang:" + language, count: count }, (err, tweets, response) => {
    //     if (err) {
    //         res.json({error: err});
    //     }
        
    //     res.status(200).json({status: true,tweets: tweets.statuses});
    // });
});



server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', () => {
   var addr = server.address(); 
   console.log('Server is listening on ' + addr.address + ':' + addr.port );
});