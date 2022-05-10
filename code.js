/* ------------------------------------------------------------------- */
/* Definitions                                                         */
/* ------------------------------------------------------------------- */

//var file_id = '1kOMXiEOqupEBZcjFdUiceYTIJzWXsscJkdr57qcEjkE';  // george
var file_id = '1xaErMbiqSFl9D9LK3En6DsTjJ6K5jHNwS_zkHOHuK30'; // ccla
var dateCol = 0;
var timeCol = 1;
var typeCol = 2;
var seasonCol = 3;
var titleCol = 4;
var preacherCol = 5;
var bulletinCol = 6;
var lessonCol = 7;
var lessonNoteCol = 8;
var sermonCol = 9;
var sermonNotecol = 10;
var videoCol = 11;
var videoNoteCol = 12;
var ref1Col = 13;
var ref1NoteCol = 14;

/* ------------------------------------------------------------------- */
/* Slideshow gallery                                                   */
/* ------------------------------------------------------------------- */


function doGalleryShow() {

    /* Don't do the fancy gallery if we are in IE 11 or earlier */
    /*
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE '); // IE 10 and older
    var trident = ua.indexOf('Trident/'); // IE 11
    if (msie > 0 || trident > 0) {
        var gallery = $('#page  article:first-child section.gallery-section').first().find('figure');
        gallery.closest('section').css('display', 'none'); 
        return;
    }
    */
    // get some selectors and data 
    var background = $('#page article:first-child section:first-child div.section-background');
    var gallery = $('#page  article:first-child section.gallery-section').first().find('figure');

    // If no gallery found so abort
    if (gallery.length == 0) {
        return false;
    } 

    // Hide the initial template, not needed.
    background.find('img').css('display','none');

    // https://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t
    // See if we are editing the SquareSpace page, if so hide the gallery section
    var isEditor = window.frameElement ? true : false;
    if (isEditor == false) {
       gallery.closest('section').css('display', 'none'); 
    }

    // Loop through each figure and add to the list of slides 
    gallery.each(function() {

        var imgtemp = $(this).find('img');
        var imgcap = $(this).find('figcaption p.gallery-caption-content').text();
        var caplink = $(this).find('a').first().attr('href');
        if (caplink) {
            imgcap = '<a href="' + caplink + '">' + imgcap + '</a>';
        }
        if (imgcap) { imgcap = '<div class="slideCaption">' + imgcap + '</div>';}
        var imgpos = imgtemp.attr('data-image-focal-point');

        imgpos = imgpos.split(",");
        var temp = "";
        for (var i = 0; i < imgpos.length; i++) {
            imgpos[i] = imgpos[i] * 100;
            temp = temp + " " + imgpos[i] + "%";
        }
        imgpos = temp.trim();
        var style = ' style="object-position:' + imgpos + ';';
        temp = '<div class="mySlides"><img src="' + imgtemp.attr('data-src') + '"' + style + '">' +
        imgcap + '</div>';
        background.append(temp);
    });

    // start the slideshow
    
    carousel();
}
  
  var myIndex = 0;
  function carousel() {
    var i;
    var background = $('#page article:first-child section:first-child div.section-background');
    var x = background.find('.mySlides');
    if (myIndex >= x.length) {
      myIndex = 0
    }
    x.removeClass("opaque");
    background.find('div.mySlides').eq(myIndex).addClass("opaque");
    myIndex++;
    setTimeout(carousel, 8000);
  }
  
  /* ------------------------------------------------------------------- */
/* Filter checklist values                                             */
/* ------------------------------------------------------------------- */ 

function filter_values () {

    // initialize based on current checkboxes
    filter_showvals();

    // Process a checkbox selection 
    $('#filterContainer input[type=checkbox]').on('change', function(e) {
        console.log('change=' + this.value);
        var name = $(this).attr('name');
        if (name) {
        $('#filterContainer input[type=checkbox][name=' + name + ']')
         .not(this).attr('checked',false);
        }
        filter_showvals();
    })

}

function filter_showvals () {

    // get an array of checked items
    var ids = [];
    var xidsx = [];
    $('#filterContainer input[type=checkbox]:checked')
      .each(function() {
        if(this.value) {ids.push(this.value); }
    });

    $('div.summary-content div.summary-metadata-container div.summary-metadata span.summary-metadata-item--cats a').removeClass('active');

    // if we have anything checked then start with everything hidden
    if (ids.length) {
        $('div.summary-item').css('display','none');
    }

    // make sure ids only has unique values
    var t = [];
    for(var x = 0; x < ids.length; x++){
        if(t.indexOf(ids[x]) == -1) {t.push(ids[x]);}
    }
    ids = t;

    $('div.summary-item').each(function(index, value) {
        xidsx = ids; // copy the array of checked items
        $(this).find('div.summary-content div.summary-metadata-container div.summary-metadata span.summary-metadata-item--cats a').filter(function (index2) {
            var t = this.href.indexOf('?category=');
            var i = xidsx.indexOf(this.href.substr(t+10));
            if ( i >= 0) {
                xidsx.splice(i, 1);  
            }
            var i = ids.indexOf(this.href.substr(t+10));
            if ( i >= 0) {
                $(this).addClass('active');   
            }
        })
        // if we have found all of the selected items the show
        if (xidsx.length == 0) {
            $(this).css('display','block');
        }
    });
}  

/* ------------------------------------------------------------------- */
/* Accordian                                                           */
/* ------------------------------------------------------------------- */

$( document ).ready(function() {
    $('p span.accordian').closest('.markdown-block').addClass('markdown-accordian');
    $('.markdown-accordian .sqs-block-content h4').addClass('ui-closed').css('cursor','pointer');
    $('.markdown-accordian .sqs-block-content h4').css('cursor','pointer');
    $(".markdown-accordian .sqs-block-content h4").nextUntil("h4").slideToggle();
    $(".markdown-accordian .sqs-block-content h4").click(function() {
        var status = $(this).hasClass("ui-open");
        $(".markdown-accordian .sqs-block-content h4").nextUntil("h4").slideUp();
        $(".markdown-accordian .sqs-block-content h4").removeClass('ui-open');
        $(".markdown-accordian .sqs-block-content h4").addClass('ui-closed');
        if (status == false) {
           $(this).nextUntil("h4").slideDown();
           $(this).toggleClass('ui-closed ui-open');
        }
    });
});

/* ----------------------------------------------------------- */
/* Process the service list and search form                    */
/* ----------------------------------------------------------- */

function getServiceData(theurl) {
var result = "";
$.ajax({
    url: theurl,
    dataType: 'text',
    async: false,
    success: function(data) {
        i = data.indexOf('(');
        j = data.lastIndexOf(')');
        data = data.substr(i + 1, j - 1 - i);

        var data = JSON.parse(data);
        result = data;
    }
});
return result;
}

/* ----------------------------------------------------------- */
/* Get a list of available audio recordings                    */
/* and construct list with links                               */
/* ----------------------------------------------------------- */

//function processList(what = null) {
function processList(what) {

    if (what == 'clear') {
        $('#year').html('');
        $('#sermonby').html('');
    }
    getServiceFromGoogle();
}

function getServiceFromGoogle() {

    var selectYear = $('#year').val();
    var sermonby = $('#sermonby').val();
    if (sermonby) {
        sermonby = sermonby.replace(/\+/g, ' ');
        sermonby = unescape(sermonby);
    }

    var where = [];
    var whereitem = 0;
    
    var query = "SELECT *";
    if (selectYear && selectYear != 'ALL') {
        //  query = query + " WHERE year(A) = " + selectYear; 
        where[whereitem] = "year(A) = " + selectYear;
        whereitem++;
    }
    if (sermonby) {
        where[whereitem] = "F = '" + sermonby + "'";
        whereitem++;
    }
    //alert(whereitem); 
    if (whereitem > 0) {
        query = query + " WHERE " + where.join(' AND ');
    }

    if (typeof xyears == 'undefined') {
        var url = 'https://docs.google.com/spreadsheets/u/0/d/'
        + file_id + '/gviz/tq?tqx=&tq=' + escape('SELECT year(A), count(B) group by year(A) order by year(A) desc');
        var yearlist = getServiceData(url);
        xyears = yearlist.table.rows;
    }
    $('#selectOptions select#year').html('');
    console.log(xyears);
    if (!selectYear && xyears != null) {selectYear = xyears[0].c[0].v;}
    var selected = '';
    if (selectYear == 'ALL') {selected = ' selected ';}
    var options = "<option value='ALL' " + selected + ">All</option>";
    xyears.forEach(function(item, key) {
        var selected = '';
        if (item.c[0].v == selectYear) {
            selected = ' selected ';
        }
        options += "<option value = '" + item.c[0].v + "'" + selected + ">" + item.c[0].v + "</option>";
    })
    $('#selectOptions select#year').append(options);

    if (typeof xby == 'undefined') {
        var url = 'https://docs.google.com/spreadsheets/u/0/d/'
        + file_id + '/gviz/tq?tqx=&tq=' + escape('SELECT F, count(A) group by F ORDER BY count(A) DESC');
        var bylist = getServiceData(url);
        xby = bylist.table.rows;
    }
    var options = "<option value=''>All</option>";
    //console.log(xyears);
    xby.forEach(function(item, key) {
        var selected = '';
        if (item.c[0] != null) {
            if (item.c[0].v == sermonby) {
                selected = ' selected ';
            }
            options += "<option value = '" + item.c[0].v + "'" + selected + ">" + item.c[0].v + "</option>";
        }
    })
    $('#selectOptions select#sermonby').append(options);

    var url = 'https://docs.google.com/spreadsheets/u/0/d/'
    + file_id + '/gviz/tq?tqx=&tq=' + escape(query);

    var xlist = getServiceData(url);
    var datalist = xlist.table.rows;
    var collist = xlist.table.cols;

    $('#services').html('');
    datalist.forEach(function(item, key) {

        thetitle = 'Unknown title';
        var thedate = '';
        var thepreacher = '';
        var thetime = ''; 
        if (item.c[timeCol] != null) {
            thetime = item.c[timeCol].v;
        }
        var thetype = '';
        if (thetype = item.c[typeCol] != null) {
            thetype = item.c[typeCol].v;
        }
        if (item.c[titleCol] != null) {
            thetitle = '<div class=theTitle>' + item.c[titleCol].v + '</div>';
        }
        if (item.c[dateCol] != null) {
            thedate = '<div class=theDate>' + item.c[dateCol].f + '</div>';
        }
        if (item.c[preacherCol] != null) {
            thepreacher = '<div class=thePreacher>' + item.c[preacherCol].v + '</div>';
        }
        var str = '<div class="serviceList">' + thetitle + thedate + thepreacher + '<ul>';
        if (item.c[bulletinCol] != null) {
            var url = item.c[bulletinCol].v;
            var filetype = url.split('.').pop();
            var notes = '';
            if (filetype == 'pdf') {
                notes = ' (pdf)';
            }
            str = str + '<li class="serviceItem"><a target="blank" href=' + url + '>Read the service bulletin' + notes + '</a></li>';
        }
        if (item.c[lessonCol] != null) {
            var url = item.c[lessonCol].v;
            var filetype = url.split('.').pop();
            var notes = '';
            if (item.c[lessonNoteCol] != null && item.c[lessonNoteCol].v != null) {
                notes = ' (' + item.c[lessonNoteCol].v + ')';
            }
            if (filetype == 'pdf') {
                notes = notes + ' (pdf)';
            }
            str = str + '<li class="serviceItem"><a target="blank" href=' + url + '>Read the lesson' + notes + '</a></li>';
        }
        if (item.c[ref1Col] != null) {
            var url = item.c[ref1Col].v;
            var filetype = url.split('.').pop();
            var notes = 'Reference Document';
            if (item.c[ref1NoteCol] != null && item.c[ref1NoteCol].v != null) {
                notes = item.c[ref1NoteCol].v;
            }
            if (filetype == 'pdf') {
                notes = notes + ' (pdf)';
            }
            str = str + '<li class="serviceItem"><a target="blank" href="' + url + '">' + notes + '</a></li>';
        }
        if (item.c[sermonCol] != null && item.c[sermonCol].v != null) {
            var url = item.c[sermonCol].v;
            var filetype = url.split('.').pop();
            var notes = '';
            if (item.c[sermonNotecol] != null && item.c[sermonNotecol].v != null) {
                notes = ' (' + item.c[sermonNotecol].v + ')';
            }
            if (filetype == 'pdf') {
                notes = notes + ' (pdf)';
            }
            str = str + '<li class="serviceItem"><a target="blank" href=' + url + '>Read the sermon' + notes + '</a></li>';
        }
        var notes = '';
        if (item.c[videoNoteCol] != null && item.c[videoNoteCol].v != null) {
            notes = ' (Sermon begins at ' + item.c[videoNoteCol].v + ')';
        }
        if (item.c[videoCol] != null) {
            var url = item.c[videoCol].v;
            str = str + '<li class="serviceItem"><a target="blank" href=' + url + '>Watch the service' + notes + '</a></li>';
        }
        str = str + '</ul>';
        $('#services').append(str);
    })

} // end getServiceFromGoogle

/* ----------------------------------------------------------- */
/* Get the last video url and info for home page               */
/* ----------------------------------------------------------- */

function getLastVideo() {

    // Get the most recent sermon from the spreadsheet
    var query = "SELECT * WHERE L IS NOT NULL ORDER BY A DESC LIMIT 1";
    var url = 'https://docs.google.com/spreadsheets/u/0/d/'
    + file_id + '/gviz/tq?tqx=&tq=' + escape(query);
    var temp = getServiceData(url);
    lastvideo = temp.table.rows;
    var thedate = lastvideo[0].c[0].f;
    var videourl = lastvideo[0].c[videoCol].v;
    var preacher = '';
    if (lastvideo[0].c[preacherCol] != null) {
        preacher = lastvideo[0].c[preacherCol].v;
    }
    var title = '';
    if (lastvideo[0].c[titleCol] != null) {
        title = lastvideo[0].c[titleCol].v; 
    }
    var beginsat = '';
    if (lastvideo[0].c[videoNoteCol] != null) {
        beginsat = lastvideo[0].c[videoNoteCol].v;
    }
    if (beginsat) { 
        var patt = new RegExp("^[0-9]*[:]?[0-9]*$");
        var res = patt.test(beginsat);
        var start = beginsat.split(':');  
        var startsec = 0; 
        var min = 0;
        var hrs = 0;
        if (start.length) {startsec = start.pop();}
        if (start.length) {min = start.pop();}
        if (start.length) {hrs = start.pop();}
        startsec = +startsec + +(min * 60) + +(hrs * 60 * 60);
        if (!startsec) {startsec = 1;}
        $('.serviceInfo div.theBegins').html('Sermon begins at ' + beginsat + ' ' + '<a id="serviceGo" href="#">(Start play)</a>');
        $('#serviceVideo h4').html('<a href="#">Watch a recent sermon</a>');
    }
    $('.serviceInfo div.theTitle').html(title);
    $('.serviceInfo div.theDate').html(thedate);
    
    $('.serviceInfo div.thePreacher').html(preacher);

    var id = '';
    url = videourl.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if(url[2] !== undefined) {
        id = url[2].split(/[^0-9a-z_\-]/i);
        id = id[0];
    } 
    var base = "https://www.youtube.com/embed/" + id;
    var src = base + "?start=1";
    if (id) {
        $('#serviceVideo iframe').attr('src',src)
            .attr('data-sermon',startsec)
            .attr('data-src',src);
        var w = $('#serviceVideo iframe').width();
        var h = (315/560) * w;
        $('#serviceVideo iframe').height(h + 'px');
        $(window).resize(function(){
          var w = $('#serviceVideo iframe').width();
        var h = (315/560) * w;
          $('#serviceVideo iframe').height(h + 'px');
        });
    }

    $('#serviceGo, #serviceVideo h4').click(function(event) {
        event.preventDefault();
        startsec = $('#serviceVideo iframe').data('sermon');
        src = $('#serviceVideo iframe').data('src');
        $('#serviceVideo iframe').prop('src',base + '?autoplay=1&start=' + startsec);
        $('#serviceVideo iframe').prop('data-play',1);
    })

    return id;

}