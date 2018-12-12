/**
 * Created by cici.
 */

var commonUtil = require('mp-common-util');
const uuid = require('uuid');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var responseUtil = commonUtil.responseUtil;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('CreateHtml.js');
var request = require('request');
var sysConfig = require('../config/SystemConfig.js');
var Seq = require('seq');
var httpreq = require('httpreq');
var moment = require('moment')
var tempUrl = '../public/temp';
var tmpUrlBase = '/temp/';

//create jjc html
function contentListHtml(req, res, next) {
    try {
        var params = req.params, secondCategory = [], contentList = [], start = 0, size = 20, total = 0, page = 1,
            typeId = req.params.typeId,
            pageId = req.params.pageId;
        var keyword = '咖布集,coffee,咖啡百科,kbjbuy';
        var title = '_咖布集';
        var ejsData = {
            productApi: sysConfig.cmsApi,
            page: 1,
            typeId: typeId,
            pageId: pageId,
            indexTypeData: {
                title: "",
                description: "",
                keyword: ""
            },
            secondCategory: [],
            contentList: []
        }
        start = size * (pageId - 1);
        Seq().seq(function () {
            var that = this;
            //获取二级分类
            var url = sysConfig.cmsApi + '/type?type=1&active=1';
            var options = {
                url: url,
                method: 'GET',
                json: true
            };

            function callback(error, response, data) {
                ejsData.secondCategory = data.result;
                ejsData.secondCategory.map(function (index) {
                    if (index._id == typeId) {
                        if(pageId == 1){
                            ejsData.indexTypeData.title = index.name + title;
                        }else {
                            ejsData.indexTypeData.title = '第' + pageId + '页_' + index.name + title;
                        }
                    }
                })
                that();
            }

            request(options, callback);
        }).seq(function () {
            var that = this;
            //获取内容列表
            var url = sysConfig.cmsApi + '/content?t2=' + typeId + '&t1=1&status=1&start=' + start + '&size=' + size
            var listOptions = {
                url: url,
                method: 'GET',
                json: true
            };

            function callback(error, response, data) {
                ejsData.contentList = data.result;
                ejsData.contentList.map(function (index) {
                    var content = index;
                    content.updated_on = index.updated_on ? moment(index.updated_on).format("YYYY-MM-DD") : null
                    return content;
                })
                that();
            }

            request(listOptions, callback);
        }).seq(function () {
            var that = this;
            //获取内容列表count
            var url = sysConfig.cmsApi + '/contentCount?t2=' + typeId + '&t1=1&status=1'
            var listOptionsCount = {
                url: url,
                method: 'GET',
                json: true
            };

            function callback(error, response, data) {
                total = data.result;
                if (total > size) {
                    ejsData.page = Math.ceil(total / size);
                } else {
                    ejsData.page = 1;
                }

                that();
            }

            request(listOptionsCount, callback);
        }).seq(function () {
            var that = this;
            var htmlText = {
                ejsData: ejsData
            };
            var fileUrl = ejs2File('contentList.ejs', htmlText, {}, 'html', res, next)
        })


    } catch (error) {
        logger.error('contentListHtml:' + error);
        return res.send("contentListHtml:" + error);
    }
}

function contentDetailHtml(req, res, next) {
    try {
        var params = req.params, contentDetail = {}, ejsData = {},
            contentId = req.params.contentId;
        if (contentId) {
            Seq().seq(function () {
                var that = this;
                //查询内容
                var url = sysConfig.cmsApi + '/content?shortId=' + contentId;
                var options = {
                    url: url,
                    method: 'GET',
                    json: true
                };
                function callback(error, response, data) {
                    if (data.result.length > 0) {
                        var detail = data.result[0];
                        ejsData = {
                            productApi: sysConfig.cmsApi,
                            contentId: contentId,
                            title: detail.title,
                            description: detail.abstract,
                            keywords: detail.type[0].keyword,
                            content: detail.content,
                            type: detail.type[0].n2,
                            updated_on: detail.updated_on ? moment(detail.updated_on).format("YYYY-MM-DD") : null
                        }
                        that();
                    } else {
                        return res.send("contentDetailHtml:no data");
                    }
                }

                request(options, callback);
            }).seq(function () {
                var that = this;
                var htmlText = {
                    ejsData: ejsData
                };
                var fileUrl = ejs2File('contentDetail.ejs', htmlText, {}, 'html', res, next)
            })
        } else {
            logger.error('no contentId');
            return res.send("contentDetailHtml:no contentId");
        }
    } catch (error) {
        logger.error('contentDetailHtml:' + error);
        return res.send("contentDetailHtml:" + error);
    }
}

function ejs2File(templateFile, renderData, options, outputType, res, next) {
    try {
        var data = JSON.parse(JSON.stringify(renderData))
        if (!data) {
            data = {}
        }

        var tempName = uuid.v4().replace(/-/g, '')
        /*var tempName='123456';*/

        data.basedir = '';
        var ejsFile = fs.readFileSync(path.join(__dirname, '../htmlTemplate/' + templateFile), 'utf8')
        var html = ejs.render(ejsFile, data)

        if (outputType === 'htmlurl') {
            var htmlData = data
            fs.writeFileSync(path.join(__dirname, '../', tempUrl, tempName + '.html'), html)
        }

        if (outputType === 'htmlurl') {
            resolve(tmpUrlBase + tempName + '.html')
        } else if (outputType === 'html') {
            res.charSet('utf-8');
            res.header('Content-Type', 'text/html');
            res.end(html);
            return next()
        } else {
            logger.error(' createHtml:outputType error ');
            return responseUtil.resetFailedRes(res, "outputType error");
        }
    } catch (error) {
        logger.error(' createHtml: ' + error);
        return res.send("createHtml error:" + error);
        /*return responseUtil.resInternalError(error,res,next);*/
    }
}


module.exports = {
    contentListHtml: contentListHtml,
    contentDetailHtml:contentDetailHtml
};