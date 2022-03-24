var express = require("express");
var utility = require("utility");
// 页面解析
var cheerio = require("cheerio");
// 抓取网页
var superagent = require("superagent");
// 并发控制
var eventproxy = require("eventproxy");
// node.js标准库
var url = require("url");
// 创建app
var app = express();

app.get("/", function (req, res) {
    var q = req.query.q;
    var md5Value = utility.md5(q);
    res.send(md5Value);
});

var cnodeUrl = "https://cnodejs.org/";

app.get("/spider1", function (req, res, next) {
    // 适用superagent抓取指定网页内容
    superagent
        .get(cnodeUrl)
        // .end获取请求后返回的结果
        .end(function (err, sres) {
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(sres.text);
            var items = [];
            $("#topic_list .topic_title")
                .each(function (idx, element) {
                    var $element = $(element);
                    items.push({ title: $element.attr("title"), href: $element.attr("href") });
                });
            res.send(items);
        });
});

app.get("/spider2", function (req, res, next) {
    superagent
        .get(cnodeUrl)
        .end(function (err, res) {
            if (err) {
                return console.error(err);
            }
            var topicUrls = [];
            var $ = cheerio.load(res.text);
            $("#topic_list .topic_title")
                .each(function (idx, element) {
                    var $element = $(element);
                    var href = url.resolve(cnodeUrl, $element.attr("href"));
                    topicUrls.push(href);
                });

            // 得到一个eventproxy
            var ep = new eventproxy();

            // aftet 在所有异步操作结束之后，就调用尾部回调
            ep.after("topic_html", topicUrls.length, function (topics) {
                topics = topics.map(function (topicPair) {
                    var topicUrl = topicPair[0];
                    var topicHtml = topicPair[1];
                    var $ = cheerio.load(topicHtml);
                    return ({
                        title: $(".topic_full_title").text().trim(),
                        href: topicUrl,
                        comment1: $(".reply_content").eq(0).text().trim()
                    });
                });
                console.log("topics:", topics);
            });
            // 同时发起大量的异步请求
            topicUrls.forEach(function (topicUrl) {
                superagent.get(topicUrl)
                .end(function (err, res) {
                        // 监听每一个异步请求
                        ep.emit("topic_html", [topicUrl, res.text])
                    })
            });
        })
})

app.listen(3000, function () {
    console.log("express server is runing in port 3000");
});