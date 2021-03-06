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