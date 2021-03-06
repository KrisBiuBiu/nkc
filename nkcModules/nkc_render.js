var in_browser = (typeof document !== 'undefined');

//render source to HTML.
function nkc_render(options){
  var render = {};
  var commonmark;
  var plain_escape;
  var XBBCODE;
  var xss;
  var twemoji;
  if(in_browser){
    //browser mode
    //inclusion here done by <script>
    commonmark = window.commonmark;
    plain_escape = window.plain_escape;
    XBBCODE = window.XBBCODE;
    xss = window.filterXSS;
    twemoji = window.twemoji;
  }else{
    commonmark = require('commonmark');
    plain_escape = require('../pages/plain_escaper');
    XBBCODE = require('xbbcode-parser');
    xss = require('xss');
    twemoji = require('twemoji');
  }

  //xss-----------------
  //xss白名单 .标签 = ["属性"]
  var default_whitelist = xss.whiteList;
  default_whitelist.font = ['color']
  default_whitelist.code = ['class']
  default_whitelist.span = ['class', 'style', 'contenteditable', 'dataType'];
  default_whitelist.a = ['target', 'href', 'title', 'class', 'style', 'datatype'];
  default_whitelist.p = ['align','style'];
  default_whitelist.div = ['style','class','contenteditable'];
  default_whitelist.table = ['border','width','cellpadding','cellspacing'];
  default_whitelist.tbody = [];
  default_whitelist.tr = [];
  default_whitelist.th = ['width'];
  default_whitelist.td = ['width','valign','colspan','top','rowspan'];
  default_whitelist.video = ['src','controls','preload','style','poster'];
  default_whitelist.math = [];
  default_whitelist.semantics = [];
  default_whitelist.mrow = [];
  default_whitelist.msup = [];
  default_whitelist.mn = [];
  default_whitelist.annotation = ['encoding'];
  default_whitelist.iframe = ['width','height','src','frameborder','allowfullscreen'];
  default_whitelist.embed = [];
	default_whitelist.img = ['src','class'];
	default_whitelist.pre = ['class'];
	for(var i = 1; i <= 6; i++) {
		default_whitelist['h'+i] = ['style'];
	}
  if(!in_browser){
    //default_whitelist.iframe = ['height','width','src','frameborder','allowfullscreen']
  }

  //style白名单
  var xssoptions = {
    whiteList:default_whitelist,
    css: {
      whiteList: {
        position: /^fixed|relative$/,
        top: true,
        left: true,
        fontSize: true,
        display: true,
        "background-image": true,
        "font-weight":true,
        "font-size":true,
        "font-style":true,
        "text-decoration-line":true,
        "text-decoration": true,
        "background-color":true,
        "color":true,
        "font-family":true,
        "text-align":true,
        "text-indent":true,
        "padding-bottom":true,
        "padding-top":true,
        "padding-left":true,
        "padding-right":true,
        "height":true,
        "width":true,
        "vertical-align":true,
        "margin-top":true,
        "bottom":true,
        "word-spacing":true,
        "border-bottom":true,
        "max-width": true
      }
    },
    onTagAttr: function(tag, name, value, isWhiteAttr) {
      if(isWhiteAttr) {
        if(tag === 'a' && name === 'href') {
          var valueHandled = value.replace('javascript:', '');
          return "href=" + valueHandled;
        }
      }
    }
  }

  //according to liuhu's blame for inconvenience
  function linkAlienate(html){
    if(in_browser){
      return html
    }else{
      var cheerio = require('cheerio')
      var $ = cheerio.load(html)
      //for all <a> s
      $('a').each(function(i,elem){
        var href = $(elem).attr('href')
        if(href) {
          //check its href
          var isExternalLink =
            !(href.match(/kechuang\.org/i)||href.match(/^\/[^\/]/))
          //open in new window
          if(isExternalLink){
            $(elem).attr('target','_blank')
          }
        }
      })
      return $.html()
    }
  }
  var custom_xss = new xss.FilterXSS(xssoptions)
  var custom_xss_process = function(str){
    return custom_xss.process(str)
  }

  //markdown--------------------

  var commonreader = new commonmark.Parser();
  var commonwriter = new commonmark.HtmlRenderer({
    sourcepos:true,
    //safe:true, //ignore <tags>
  });

  render.commonmark_render = function(md){
    var parsed = commonreader.parse(md)
    var rendered = commonwriter.render(parsed)

    return rendered;
    //return custom_xss_process(rendered);
  }

  render.commonmark_safe = function(md){
    return custom_xss_process(render.commonmark_render(md))
  }

  //xbbcode------------------------

  XBBCODE.addTags({
    url: {
      openTag: function(params,content) {

        var myUrl;

        if (!params) {
            myUrl = content.replace(/<.*?>/g,"");
        } else {
            myUrl = params.substr(1);
        }
        if(myUrl.indexOf("http") == -1) {
          myUrl = "http://"+myUrl
        }

        return '<a href="' + myUrl + '">';
      },
      closeTag: function(params,content) {
          return '</a>';
      }
    },
    align:{
      openTag:function(params,content){
        var alignment = params.slice(1)
        return '<div style="display:block;text-align:'+alignment+';">'
      },
      closeTag:function(params,content){
        return '</div>'
      },
    },

    strike:{
      openTag:function(params,content){
        return '<s>'
      },
      closeTag:function(params,content){
        return '</s>'
      },
    },

    quote:{
      openTag: function(params,content) {
        var username = params?(params.length?'引用 ' + params.slice(1).split(',')[0]+':<br>':''):''

        return '<blockquote class="xbbcode-blockquote">'+username;
      },
      closeTag: function(params,content) {
        return '</blockquote>';
      },
    },
	  //恢复旧版引用
    /*quote:{
      openTag: function(params,content) {
        params = params? params.slice(1).split(','): '';
        var username = '';
        if(!params || params.length !== 4) {
          username = params?(params.length?'引用 ' + params[2]+':<br>':''):''
        } else {
          username = '';
          if(params[1] !== '-1') {
            username = params?(params? '回复 '+params[2]+' 在 <a href="'+ params[0] + '&' + 'highlight=' + params[3] + '#' + params[3] +'">'+params[1]+'楼</a> 的发言\n':''):'';
          } else {
            username = params?(params? '回复 '+params[2]+' 的发言\n':''):'';
          }
        }
        return '<blockquote class="xbbcode-blockquote">' + username;
      },
      closeTag: function(params,content) {
        return '</blockquote>';
      },
    },*/

    "code": {
      openTag: function(params,content) {
        //for phpwind compatibility
        //consider following input: [code brush:cpp;toolbar:false;]

        var class_string = params?params.match(/brush\:([a-zA-Z0-9]{1,19})/):null
        class_string = class_string?class_string[1]:''

        return '<pre><code class="lang-'+class_string+'">' + content.replace(/\n/g,'{#newline#}');
      },
      closeTag: function(params,content) {
        return '</code></pre>';
      },
      noParse: true,
      displayContent:false,
    },

    b:{
      openTag:function(){
        return '<b>'
      },
      closeTag:function(){
        return '</b>'
      }
    },

    size:{
      openTag:function(params,content){
        var color = params.slice(1)

        return '<font size='+ color +'>'
      },
      closeTag:function(){
        return '</font>'
      }
    },

    font:{
      openTag:function(params,content){
        var fontstr = params.slice(1)

        return '<font face='+ fontstr +'>'
      },
      closeTag:function(){
        return '</font>'
      }
    }

  })

  render.plain_render = plain_escape;


  // 论坛化学式转换器模块，由www.kechuang.org上的acmilan制作，复制时请保留本行和下一行。
  // Forum's Chemical Formula Converter. Made by acmilan in www.kechuang.org. Copy with this line and the previous line.
  // 1.1版，解决了上标内存泄露问题
  // 1.2版，解决了字符串尾内存泄露问题
  // 1.3版，解决了尾下标不正确问题
  // now modified by novakon for nkc project
  function chemFormulaConverter(inputString)
  {
    // 初始化临时字符串
    newString=inputString
    // 检验是否转换过
    // 替换点号
    newString=newString.replace(/\&/g,'·')
    .replace(/\~/g,'↑')
    .replace(/\!/g,'↓')

    // 插入下标代码
    oldString=newString;
    newString="";
    index=0;
    while(oldString!="")
    {
      index1=oldString.search(/[a-z\)]\d+/i)+1;
      if(index1<=0)
      {
        break;
      }
      index2=index1+oldString.substring(index1).search(/\D/);
      if(index2-index1<=0)
      {
        index2=oldString.length
      }
      newString+=oldString.substring(0,index1);
      newString+="[sub]"
      newString+=oldString.substring(index1,index2);
      newString+="[/sub]"
      oldString=oldString.substring(index2);
    }
    newString+=oldString;
    // 插入上标代码
    oldString=newString;
    newString="";
    while(oldString!="")
    {
      index1=oldString.search(/\^/);
      if(index1<0)
      {
        break;
      }
      index2=index1+oldString.substring(index1).search(/[\+\-]/);
      if(index2-index1<=0)
      {
        index2=oldString.length
      }
      newString+=oldString.substring(0,index1);
      newString+="[sup]";
      newString+=oldString.substring(index1+1,index2+1);
      newString+="[/sup]"
      oldString=oldString.substring(index2+1);
    }
    newString+=oldString
    return newString;
  }

  function chemFormulaReplacer(html){
    return html.replace(/\[cf]([^]+?)\[\/cf]/g,function(match,p1) {
      return chemFormulaConverter(p1)
    })
  }

  render.hiddenReplaceHTML = function(text){
    return text.replace(/\[hide=([0-9]{1,3}).*?]([^]*?)\[\/hide]/gm, //multiline match
    function(match,p1,p2,offset,string){
      var specified_xsf = parseInt(p1)
      var hidden_content = p2
      
      //return '[hide='+specified_xsf+']'+hidden_content+'[/hide]'

      return '<div class="nkcHiddenBox">'
      +'<div class="nkcHiddenNotes">'+'浏览这段内容需要'+specified_xsf.toString()+'学术分'+'</div>'
      +'<div class="nkcHiddenContent">'+hidden_content+'</div>'
      +'</div>'
    })
  }

  var getHTMLForResource = function(r,allthumbnail){
    var rid = r.rid
    var oname_safe = plain_escape(r.oname)
    var filesize = r.size

    var k = function(number){

      return (number || 0).toPrecision(3)
    }

    var hits = r.hits?r.hits.toString()+'次':'';

    var fileSizeString = (filesize>1024)?((filesize>1048576)?k(filesize/1048576)+'M':k(filesize/1024)+'k'):k(filesize)+'b'

    var extension = r.ext.toLowerCase();

    var replaced = ''

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'png':
      case 'svg':

      case 'bmp': //for S.D.P's post
      // if(!allthumbnail)replaced =
      // '<a href="/r/'+rid+'" target="_blank" title="'+oname_safe+'"><img class="PostContentImage" alt="'+rid+'" src="/r/'+rid+'" /></a><br/>';
      if(!allthumbnail)replaced =
      '<a data-magnify="gallery" data-group="g1" data-src="/r/'+rid+'" data-caption="'+rid+'"><img class="img-responsive" alt="'+rid+'" src="/r/'+rid+'" /></a><br/>';

      if(allthumbnail){
        replaced =
        '<div class="PostResourceDownload" style="width:100%;display:block;word-break:break-all;word-wrap:break-word;">'
        +'<a class="PostResourceDownloadLink" href="/r/'+rid+'" >'
        +'<img class="PostResourceDownloadThumbnail" src="/rt/'+rid+'"/>'+oname_safe+'</a>'
        +'<span class="PostResourceFileSize">'+fileSizeString+'</span>'
        +'</div>'
      }

      break;
      //audio section
      case 'mp3':
      case 'mid':
      case 'wma':
      case 'ogg':
      replaced =
      '<a href="/r/'+rid+'" >'+oname_safe+'</a><br><audio src="/r/'+rid+'" controls preload="none">你的浏览器可能不支持audio标签播放音乐。升级吧。</audio>'

      break;

      case 'mp4'://these are standards
      case 'webm':
      case 'ogg':
      replaced =
      '<a href="/r/'+rid+'" >'+oname_safe+'</a><br><video src="/r/'+rid+'" controls preload="none">你的浏览器可能不支持video标签播放视频。升级吧。</video>'

      break;

      default: replaced =
      '<div class="PostResourceDownload" style="width:100%;display:block;word-break:break-all;word-wrap:break-word;">'
      +'<a class="PostResourceDownloadLink" href="/r/'+rid+'" >'
      +'<img class="PostResourceDownloadThumbnail" src="/default/default_thumbnail.png"/>'+oname_safe+'</a>'
      +'<span class="PostResourceFileSize">'+fileSizeString+'</span>' + '<span class="PostResourceCounter">'+hits+'</span>'
      +'</div>';
    }
    return replaced
  }

  render.resource_extractor = /\#\{r=([0-9a-z]{1,16})\}/g

  //replace attachment tags in text to their appropriate HTML representation
  var attachment_filter = function(stringToFilter,post){
    //console.log(stringToFilter);
    return stringToFilter.replace(render.resource_extractor,function(match,p1,offset,string){
      var rid = p1;
      for(var i in post.resources){
        var r = post.resources[i]
        if(r.rid===rid){
          r._used = true;
          return getHTMLForResource(r)
        }
      }
      return plain_escape('(附件:' + rid + ')')
    })
  }

  var pwbb_experimental = function(post,isHTML){
    var content = post.c||''

    var html = ''

    if(!isHTML){  //bbcode
      html = chemFormulaReplacer(content)
      html =
      XBBCODE.process({
        text:html,
        escapeHtml:true,
      })
      .html
      .replace(/&#91;/g,'[')
      .replace(/&#93;/g,']')
      .replace(/\[[/]{0,1}backcolor[=#a-zA-Z0-9]{0,16}]/g,'')

      // for history reasons..
      .replace(/\n/g,'<br>')
      .replace(/\{#newline#}/g,'\n')
      .replace(/\[attachment=([0-9]{1,16})\]/g,'#{r=$1}')
      .replace(/\[flash.*?](.+.*?)\[\/flash]/gi, '<a href="$1" target="_blank" style="font-size:20px;">点击此处查看视频</a>')
      .replace(/\[(\/?)strike]/g,'<$1s>')
      .replace(/  /g,'&nbsp&nbsp')
      .replace(/\[url.*?](.+.*?)\[\/url]/gi, '<a href="$1">$1</a>')
      html = attachment_filter(html,post)
      // now post.r are marked with _used:true
    }
    else{
      //在这里做了style的过滤
      html = custom_xss_process(content)
    }
    html = render.hiddenReplaceHTML(html)
    // fix for older posts where they forgot to inject attachments.
    var count = 0
    // 注释掉下面代码，用来防止附件的生成
    // for(var i in post.resources){
    //   var r = post.resources[i]
    //   if(!r._used){
    //     var allthumbnail = true
    //     if(count==0){
    //       html+='<hr class="HrPostContentUnusedAttachment"/>'
    //       count++;
    //     }

    //     if(count>=50)throw '[nkc_render]too much attachment included! refuse to process.'
    //     html+=getHTMLForResource(r,allthumbnail)
    //   }
    // }

    // 添加查看大图
    // <a href="/r/'+rid+'" target="_blank" title="'+oname_safe+'"><img class="PostContentImage" alt="'+rid+'" src="/r/'+rid+'" /></a>
    
    // 添加附件下载次数
    if(post.l === "html"){
      var extArray = ['jpg','jpeg','gif','png','svg','bmp','mp3','mp4','wma','mid','ogg','webm']
      for(var i in post.resources){
        var r = post.resources[i];
        var filesize = r.size;
        var k = function(number){
          return (number || 0).toPrecision(3)
        }
        var fileSizeString = (filesize>1024)?((filesize>1048576)?k(filesize/1048576)+'M':k(filesize/1024)+'k'):k(filesize)+'b';
        if(extArray.indexOf(r.ext) > -1){
          continue;
        }
        var reg = new RegExp(r.oname, 'gm');
        html = html.replace(reg,r.oname+'<span class="PostResourceFileSize">'+fileSizeString+'</span><span class="PostResourceCounter">'+r.hits+'次下载</span>')
      }
    }
    // html = html.replace(/<img src="\/r(.+?)">/img,'<a href="/r$1" target="_blank" title="pic"><img class="PostContentImage" alt="pic" src="/r$1" /></a>');
    // 如果是外站图片，在渲染时需要将图片替换成本站默认图
    var imgsArray = html.match(/\<img.*?\>/igm);
    if(imgsArray) {
      for(var im = 0;im < imgsArray.length; im++) {
        if(/http/igm.test(imgsArray[im])) {
          if(!/kechuang/igm.test(imgsArray[im])) {
            var newStr = '<img src="/default/picdefault.png" />';
            html = html.replace(imgsArray[im], newStr)
          }
        }
      }
    }
    html = html.replace(/\<img src="https\:\/\/www\.kechuang\.org\/r\/(.+?)".*?\/\>/img,'<img src="/r/$1" />');
    // 如果是默认图片则跳过
    // html = html.replace(/\<img.*?src="\/default\/picdefault.png".+?\>/img, '');
    // html = html.replace(/\<img.*?src="\/r\/(.+?)".+?\>/img,'<img src="/r/$1" dataimg="content"/>');
    html = html.replace(/\<img(.*?)\>/img,'<img $1 dataimg="content"/>');
    // html = html.replace(/\<img class=".*?" src="\/r\/(.+?)".+?\>/img,'<a class="wrap" data-magnify="gallery" data-group="g1" data-src="/r/$1"><img class="img-responsive" alt="pic" src="/r/$1" /></a>');
    return html
  };

  var markdown_experimental = function(post){
    var content = post.c;
    var parsed = commonreader.parse(content);
    var rendered = commonwriter.render(parsed)
    rendered = attachment_filter(rendered,post)

    rendered= custom_xss_process(rendered);

    rendered = render.hiddenReplaceHTML(rendered);
    return rendered;
  }

  render.experimental_render = function(post){
    var content = post.c||''
    var lang = post.l||''
    var renderedHTML = ''
    switch (lang) {
      case 'html':
      renderedHTML = pwbb_experimental(post,true) //straight thru html

      break;

      case 'pwbb':
        renderedHTML = pwbb_experimental(post,false)
        break;

      case 'bbcode':
      renderedHTML = pwbb_experimental(post,false)
      break;

      case 'markdown':
      renderedHTML = markdown_experimental(post)
      break;0

      default:
      renderedHTML = plain_escape(content)
    }
    renderedHTML = twemoji.parse(renderedHTML, {
      folder: '/2/svg',
      base: '/twemoji',
      ext: '.svg'
    });
    // console.log(renderedHTML)
    // 渲染at
    // 取出帖子引用部分，帖子引用部分的at不被渲染
    var blockDomArray = renderedHTML.match(/<blockquote cite.*?blockquote>/im);
    var blockDomHtml = "";
    if(blockDomArray){
      blockDomHtml = blockDomArray[0];   
      renderedHTML = renderedHTML.replace(/<blockquote cite.*?blockquote>/im,'');
    }
    var atUsers = post.atUsers;
    if(atUsers && atUsers.length > 0) {
      for(var i = 0; i < atUsers.length; i++) {
        var user = "@"+atUsers[i].username;
        var reg = new RegExp(user, 'gm');
        renderedHTML = renderedHTML.replace(reg,'<a href="/u/' + atUsers[i].uid + '">' + user + '</a>')
      }
    }
    renderedHTML = blockDomHtml + renderedHTML;
    // console.log(renderedHTML)
    renderedHTML = linkAlienate(renderedHTML) //please check linkAlienate()
    // 将视频替换成视频封面图
    // renderedHTML = renderedHTML.replace(/<video(.*?)src=".*?\/r(.*?)".*?>(.*?)<\/video>/igm,'<div style="position:relative"><div class="mediaImage" style="background:url(/frameImg$2) center center no-repeat; background-color:black;background-size: contain"></div><span class="play-btn" onclick="openVideo(this,\'/r$2\')"></span></div>');
    renderedHTML = renderedHTML.replace(/<video(.*?)src=".*?\/r\/(.*?)".*?>(.*?)<\/video>/igm,'<div style="display:inline-block;position:relative"><span class="play-btn" onclick="openVideo(this,\'$2\')"></span><video class="mediaVideo" id="$2" src="/r/$2" poster="/frameImg/$2" preload="none" >您的浏览器不支持video标签，请升级</video></div>');
    // renderedHTML = renderedHTML.replace(/<video(.*?)src=".*?\/r\/(.*?)".*?>(.*?)<\/video>/igm,'<div><span class="play-btn" onclick="openVideo(this,\'$2\')"></span><video class="mediaVideo" id="$2" src="/r/$2" poster="/frameImg/$2" preload="none">您的浏览器不支持video标签，请升级</video></div>');
    // 下面是旧版的渲染，暂时先不用
    // var atUsers = post.atUsers;
    // if(atUsers && atUsers.length > 0) {
    //   for(var i = 0; i < atUsers.length; i++) {
    //     var user = atUsers[i];
    //     var matchSpace = '@' + user.username.replace(/[^\u0000-\u00FF]/g,function(a){return escape(a).replace(/(%u)(\w{4})/gi,"&#x$2;")}) + ' ';
    //     //双空格会产生奇怪转义
    //     var matchSpecial = '@' + user.username.replace(/[^\u0000-\u00FF]/g,function(a){return escape(a).replace(/(%u)(\w{4})/gi,"&#x$2;")}) + '&#xA0;';
    //     var matchEnter = '@' + user.username.replace(/[^\u0000-\u00FF]/g,function(a){return escape(a).replace(/(%u)(\w{4})/gi,"&#x$2;")}) + '<br>';
    //     renderedHTML = renderedHTML.replace(matchSpace, '<a href="/m/' + user.uid + '">' + matchSpace + '</a>');
    //     renderedHTML = renderedHTML.replace(matchSpecial, '<a href="/m/' + user.uid + '">' + matchSpecial + '</a>')
    //     renderedHTML = renderedHTML.replace(matchEnter, '<a href="/m/' + user.uid + '">' + matchEnter + '</a>')
    //   }
    // }
    return renderedHTML
  }

  return render;
}

var render = nkc_render();

if(in_browser){
}else{
  module.exports = render;
}