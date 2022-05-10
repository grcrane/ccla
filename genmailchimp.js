/* ----------------------------------------------------------- */
/* Generate MailChimp html                                     */
/* ----------------------------------------------------------- */

var thestyles = '<style>' + 
'h2.sectionType{text-align: left;font-weight: normal;color: #0000CD;font-size: 32px;margin: 24px 0 24px 0}' + 
'img.theimg{width: 150px;height: auto;object-fit: cover;float: left;margin: 5px 10px 5px 5px}' +
'div.contentData:not(:first-child){margin-top: 24px}' + 
'div.contentData{content: "";clear: both;display: table;}' + 
'p.contentData{margin: 0;padding: 0}div.title{font-weight: bold;font-size: 16px;color: #4B0082}' + 
'.datetime{font-style: italic;font-size: .9em}' + 
'.startdate{color: black;font-weight: 700}' + 
'div.contentData p{white-space: normal !important}' + 
'div.contentData > p:first-of-type{margin-top: 0 !important}' +
'</style>';

function formatFactory(html) {
    function parse(html, tab = 0) {
        var tab;
        var html = $.parseHTML(html);
        var formatHtml = new String();   

        function setTabs () {
            var tabs = new String();

            for (i=0; i < tab; i++){
              tabs += '\t';
            }
            return tabs;    
        };
        $.each( html, function( i, el ) {
            if (el.nodeName == '#text') {
                if (($(el).text().trim()).length) {
                    formatHtml += setTabs() + $(el).text().trim() + '\n';
                }    
            } else {
                var innerHTML = $(el).html().trim();
                $(el).html(innerHTML.replace('\n', '').replace(/ +(?= )/g, ''));
                if ($(el).children().length) {
                    $(el).html('\n' + parse(innerHTML, (tab + 1)) + setTabs());
                    var outerHTML = $(el).prop('outerHTML').trim();
                    formatHtml += setTabs() + outerHTML + '\n'; 
                } else {
                    var outerHTML = $(el).prop('outerHTML').trim();
                    formatHtml += setTabs() + outerHTML + '\n';
                }      
            }
        });
        return formatHtml;
    };   
    return parse(html.replace(/(\r\n|\n|\r)/gm," ").replace(/ +(?= )/g,''));
}; 
function cleanup(beautify) {
    beautify = beautify.replace(/\<p\>\<\/p\>/gi,'');  
    beautify = beautify.replace(/white-space:pre-wrap;/gi,'white-space:normal;'); 
    beautify = beautify.replace(/\<strong\>(\s+)*\<\/strong>/gi,''); 
    beautify = beautify.replace(/\<em\>\<\/em\>/gi,'');  
    beautify = beautify.replace(/\<\/a\>[\s\r\n\t]*\./gi,'\<\/a\>.');  
    beautify = beautify.replace(/\<\/a\>[\s\r\n\t]*\,/gi,'\<\/a\>,'); 
    beautify = beautify.replace(/\t*/gi,'');  
    return beautify; 
}
  
function copyToClipboard(selector) {
  var beautify = formatFactory($(selector).html());
  beautify = cleanup(beautify); 
  $('textarea').addClass('active')
  $('textarea').val(beautify);
  $('textarea').select();
    document.execCommand("copy");
    alert('HTML copied to clipboard');
}
function getData(theurl) {
    var result = "";
    $.ajax({
        url: theurl,
        dataType: 'text',
        async: false,
        success: function(data) {
            result = data;
        }
    });
    return result;
}

function do_get_mailchimp() {
    var sections = [];
    var sectionData = [];
    var url = '/mailchimp-list';
    //var url = 'mailchimp_list.html';
    var res = getData(url);
    $('#MailChimp-wrapper').append(thestyles);
    if (res) {
        $('.statusMessage').text('Processing, might take a minute...');
        var data = $.parseHTML(res);
        var articles = $(res).find('div.sqs-block-summary-v2');
        var items = $(articles).children();
        var prevsection = ''; 
        $( items ).each(function( index ) {
            var theitems = $(this).find('.summary-item');
            $( theitems).each(function( index2) {
                var src = $(this).find('.summary-title a').attr('href').substr(1);
                var d = getData(src);
                var look = src.split('/');
                var thetype = look[0]; 
                var i = sections.indexOf(thetype);

                if(i == -1) {  
                   sections.push(thetype);
                   sectionData.push([]);
                }

                if (thetype != prevsection) {
                    var thename = 'Upcoming Events';
                    if (thetype == 'services') {thename = 'Services';}
                    if (thetype == 'announcement-items') {thename = 'Announcements';}
                    if (thetype == 'vestry-connections') {thename = 'Vestry Connections';}
                    if (thetype == 'vestry-connections') {thename = 'Vestry Connections';}
                    if (thetype == 'mailchimp-only-items') {thename = 'Mailchimp Only Items';}
                    if (thetype == 'sermon-information') {thename = 'Past Services';}
                    $('#MailChimp-wrapper').append('<h2 class="sectionType">' + thename + '</h2>');
                    prevsection = thetype;
                }
              
                if (d.length && d != 'undefined') {
                    if (thetype == 'events-list' || thetype == 'vestry-connections'
                        || thetype == 'services') {                           
                        var event = $.parseHTML(d);
                        var title = $(event).find('article.eventitem h1.eventitem-title').text();
                        var startdate = $(event).find('article.eventitem time.event-date').eq(0).text();
                        var starttime = $(event).find('article.eventitem .eventitem-meta-time time').eq(0).text();
                        starttime = starttime.replace('PM','p.m.');
                        var enddate = $(event).find('article.eventitem time.event-date').eq(1).text();
                        var endtime = $(event).find('article.eventitem span.eventitem-meta-time').eq(1).find('time.event-time-12hr').text();                           
                        var contentDataitems = $(event).find('article div.html-block div.sqs-block-content').eq(0).html();                           
                        contentData = '';                            
                        contentData = contentData + contentDataitems;
                        var imgsrc = $(event).find('article div.image-block figure div img').attr('data-src');
                        var out = '<div class="contentData">' + 
                        '<div class="title">' + title + '</div>';
                        if (startdate) {
                            out = out + '<div class="startdate">' + startdate;
                            if (starttime) {
                                out = out + ' ' + starttime;
                            }
                            out = out + "</div>";
                        }
                        if (imgsrc) {
                            out = out + '<img class="theimg" src="' + imgsrc + '">';
                        } 

                        contentData = cleanup(contentData);      
                        out = out + contentData + "</div>";
                        $('#MailChimp-wrapper').append(out);   
                        var i = sections.indexOf(thetype);
                        //console.log('i=' + i + ' thetype=' + thetype);
                        sectionData[i].push(out);

                    }                        
                    var i = src.indexOf('announcement-items/');                        
                    if (thetype == 'announcement-items' || thetype == 'twelve-days-of-christmas'
                        || thetype == 'mailchimp-only-items'
                        || thetype == 'sermon-information') {                           
                        var event = $.parseHTML(d);
                        var title = $(event).find('div.blog-item-wrapper h1.entry-title').text();
                        contentData = ''; 
                        var contentDataitems = $(event).find('article div.html-block div.sqs-block-content').eq(0).html();
                        var imgsrc = $(event).find('article div.image-block figure div img').attr('data-src');                          
                        contentData = contentData + contentDataitems;
                        var out = '<div class="contentData">' + 
                        '<div class="title">' + title + '</div>';
                        if (imgsrc) {
                            out = out + '<img class="theimg" src="' + imgsrc + '">';
                        }  
                        contentData = cleanup(contentData); 
                        out = out + contentData + "</div>";
                        $('#MailChimp-wrapper').append(out); 
                        var i = sections.indexOf(thetype);
                        //console.log('i=' + i + ' thetype=' + thetype);
                        sectionData[i].push(out);                         
                    }
                }
            })
        });   
    }
    $('.statusMessage').text('All done.');
    $('div#MailChimp-wrapper').css('display','block');
    $('button#copyToClip').css('display','block');
    //console.log(sections);
    //console.log(sectionData);
}

/* -------------- New version 4/27/0222 ------------------------ */

var thestyles2 = `<style>
h2.sectionType{
  text-align: left;
  font-weight: normal;
  color: #0000CD;
  font-size: 32px;
  margin: 24px 0 24px 0}
img.theimg{
  width: 150px;
  height: auto;
  object-fit: cover;
  float: left;
  margin: 5px 10px 5px 0;
  padding: 0;}
div.contentData:not(:first-child){margin-top: 24px}
div.contentData{content: "";clear: both;}
p.contentData{margin: 0;padding: 0}div.title{font-weight: bold;font-size: 16px;color: #4B0082}
.datetime{font-style: italic;font-size: .9em}
.startdate{color: black;font-weight: 700}
div.contentData p{white-space: normal !important}
div.contentData > p:first-of-type{margin-top: 0 !important}
</style>`;

function copyToClipboard2(selector) {
  var beautify = $(selector).html();
  beautify = cleanup(beautify);
  $('textarea').addClass('active')
  $('textarea').val(beautify);
  $('textarea').select();
    document.execCommand("copy");
    alert('HTML copied to clipboard');
}

function formatAMPM(thedate) {

    var myDate = new Date(thedate);
    var pstDate = myDate.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles"
    })
    var date = new Date(pstDate);

    const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
    const days = ["Monday","Tuesday","Wednesday","Thursday",
    "Friday","Saturday","Sunday"];

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = days[date.getDay()-1] + ", " + months[date.getMonth()+1]
        + " " + date.getDate() + ", " + date.getFullYear() + " " + hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function cleanup2(beautify) {
    beautify = beautify.replace(/\<p style=\"white-space:normal;\"\>\<\/p\>/gi,'');
    beautify = beautify.replace(/\<p\>\<\/p\>/gi,'');
    beautify = beautify.replace(/white-space:pre-wrap;/gi,'white-space:normal;');
    beautify = beautify.replace(/\<strong\>(\s+)*\<\/strong>/gi,'');
    beautify = beautify.replace(/\<em\>\<\/em\>/gi,'');
    beautify = beautify.replace(/\<\/a\>[\s\r\n\t]*\./gi,'\<\/a\>.');
    beautify = beautify.replace(/\<\/a\>[\s\r\n\t]*\,/gi,'\<\/a\>,');
    beautify = beautify.replace(/\t*/gi,'');
    return beautify;
}

function recursiveAjaxCall2(
  theCollections, offset = "",
  selectorID,
  callback,
  items=[],
  attr, theCount=0) {
  console.log('entry recursiveAjaxCall2=' + selectorID);
  var upcoming = true;
  var past = false;
  upcoming = ("upcoming" in attr) ? attr["upcoming"] : upcoming;
  past = ("past" in attr) ? attr["past"] : past;
  console.log('url=' + theCollections[theCount]);

    $.ajax({
      url: theCollections[theCount],
      data: {offset: offset,
      format: "json"},
      async:   true
    })
    .done(function (data) {
      var j = data;
      console.log(data);
        if ("upcoming" in data || "past" in data) {
          if ("upcoming" in data && upcoming === true) {
            items = items.concat(data['upcoming']);
          }
          if ("past" in data && past === true) {
            items = items.concat(data['past']);
          }
        }
        else {
          if ("item" in data) {
            items = items.concat(data["item"]);
          }
          else {
            items = items.concat(data["items"]);
          }
        }
        if ("pagination" in j && "nextPageOffset" in j["pagination"]) {
          var off = j["pagination"]["nextPageOffset"];
          recursiveAjaxCall2(theCollections, off, selectorID,
            callback, items, attr,theCount);
        }
        else {
            theCount = theCount + 1;
            if (theCollections.length > theCount) {
              recursiveAjaxCall2(theCollections, off, selectorID,
                callback, items, attr, theCount);
            }
            else {
              var dataArray = [];
              for (i = 0; i < theCollections.length; i++) {
                dataArray.push([]);
              }
              console.log('theCount=' + theCount);
              console.log(items);
              for (i = 0; i < items.length; i++) {
                if (typeof items[i] != "undefined") {
                  var temp = items[i]["fullUrl"].split("/");

                  var x = theCollections.indexOf(temp[1]);
                  if (x != -1) {
                    dataArray[x].push(items[i]);
                  }
                }
                else {
                  items.splice(i,1);
                  i = i - 1;
                }
              }
              callback(selectorID, {items: items, dataArray: dataArray}, attr);
            }
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      var status = jqXHR["status"];
      var msg = "Error encountered, status=\"" +
        status + "\" errorTrhown=\"" + errorThrown + "\"";
      if (status == "404") {
        msg = "Could not find collection \"" +
          theCollections[theCount] + "\"";
      }
      msg = "<div class=\"errorMsg\">Error: " + msg + "</div>";
      console.log("Error from recursiveAjaxCall2: " + msg);
    });
}

/* Main entry point called from code on page,
This calls recursiveAjax to collect all of the blog
data and then returns to the callback routine for
processing */

function theControl(selectorID) {
  var offset = "";
  var attr = {}
  var items = []
  recursiveAjaxCall2(
    ["events-list",
    "announcement-items",
    "sermon-information",
    "vestry-connections"],
    offset, selectorID, theMailchimpCallback, items, attr);
}

function theMailchimpCallback(selectorID,json, attr) {
  var prevsection = "";
  var allowedExtensions =  /(\.jpg|\.jpeg|\.png|\.gif)$/i;
  var i = 0;
  var theimg = "";
  var img = ""
  var href = "";
  var parts = [];
  var temp = "";
  var imgtmp = "";
  var title = "";
  var itemtitle = "";
  var tags = [];
  var excerpt = "";
  var bio = "";
  var sections = [
    ["events-list","Upcoming Events","events"],
    ["announcement-items","Announcements","blog"],
    ["sermon-information","Past Services","blog"],
    ["vestry-connections","Vestry Connections","blog"]
  ]

  var out = '';
  var body = '';
  var startdata = '';
  var starttime = '';
  var enddate = '';
  var endtime = '';
  var starting = '';
  var addit = `
    <div id=controls-wrapper>
      <button id="copyToClip" onclick="copyToClipboard2('${selectorID}')">Copy to clipboard</button>
      <textarea placeholder="insert html" ></textarea>
    </div>`;

  $(selectorID).append(thestyles2);
  $(selectorID).before(addit);
  $(selectorID).css('border','1px solid black').css('padding','10px');
  $.each(json["items"], function(index, value) {
      // get the data for this blog entry
      theimg = "";
      img = value["assetUrl"];
      href = value["fullUrl"];
      title = value["title"];
      body = $(value["body"]);
      content = $(body).find("div.sqs-block-html div.sqs-block-content")
        .html();
      startdate = ('startDate' in value) ? value['startDate'] : '';
      enddate = ('endDate' in value) ? value['endDate'] : '';
      content = cleanup2(content);
      parts = href.split("/");
      if (!allowedExtensions.exec(img)) {
        // doesn't look like an image url, look inside the body
        imgtmp = $(value["body"]).find("img").eq(0).data("src");
        if (imgtmp && allowedExtensions.exec(imgtmp)) {
          img =imgtmp;
        }
        else {img = '';}
      }
      img = (img) ? `<img class="theimg" src="${img}">` : '';

      console.log('parts');
      console.log(parts);
      console.log('prevsection=' + prevsection);
      // if this is a new section then put out section header
      if (prevsection != parts[1]) {
        prevsection = parts[1];
        sectionName = parts[1];
        $.each(sections, function(index, value) {
          if (parts[1] === value[0]) {
            sectionName = value[1];
          }
        })
        out += `<h2 class="sectionType">${sectionName}</h2>`;
      }

      starting = '';
      if (startdate) {
        var datestring = formatAMPM(startdate);
        starting = `<div class="startdate">${datestring}`;
        if (starttime) {
        starting += ` ${starttime}`;
        }
        starting += "</div>";
      }

      // Now add the blog info
      out += `<div class="contentData">
          <div class="title">${title}</div>
          ${starting}
          ${img}
          <p style="white-space:normal;">${content}</p>
        </div>
        <div style="clear:both;"></div>`;
    })
    $(selectorID).append(out);
    $('div.contentData').each(function(index, v) {
      var temp = $(v).find('p:first').text().trim();
      if (temp === '') {$(v).find('p:first').remove(); }
    })
    $(selectorID).find('p:empty').remove();
    $(selectorID).css('display','block');
    $('button#copyToClip').css('display','block');
}