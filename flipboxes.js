function flipCardResize(selectorID) {
  var fontsize = parseInt($(selectorID + ' .backContent div').css('font-size'));
  var height = parseInt($(selectorID + ' .backContent').css('height'));
  var lineheight = fontsize * 1.8;
  var lines = parseInt(height / lineheight);
  //alert(fontsize + ' ' + height + ' ' + lineheight + ' ' + lines);
  $(selectorID + ' .backContent div').css("-webkit-line-clamp", lines.toString());
  $(selectorID + ' .backContent div').css("line-height", lineheight + 'px');
}


/*This function will insure that all of the keys of the
passed in object array are lowercase.  This is so we can
confidently compare case insensitive keys
see - https://bobbyhadz.com/blog/javascript-lowercase-object-keys */

function toLowerKeys(obj) {
  return Object.keys(obj).reduce((accumulator, key) => {
    accumulator[key.toLowerCase()] = obj[key];
    return accumulator;
  }, {});
}

/*Recursively fetch SquareSpace collections and build data array
to be passed back.  Multiple collection names can be passed in
and processed.  Return is an array of collection data arrays. */

function recursiveAjaxCall2(
  theCollections,
  offset = "",
  selectorID,
  callback,
  items=[],
  attr,
  nocache = false,
  theCount=0 ) {

  var upcoming = true;
  var past     = false;
  upcoming     = ("upcoming" in attr) ? attr["upcoming"] : upcoming;
  past         = ("past" in attr) ? attr["past"] : past;

  var marktime = '';
  console.log('nocache=' + nocache);
  if (nocache === true) {marktime = new Date().getTime().toString();}
  console.log('marktime=' + marktime);

  $.ajax({
    url: theCollections[theCount],
    data: {offset: offset,
    format: "json",
    t: marktime},
    async:   true
  })
  .done(function (data) {
    var j = data;
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
          callback, items, attr, nocache,theCount);
      }
      else {
          theCount = theCount + 1;
          if (theCollections.length > theCount) {
            recursiveAjaxCall2(theCollections, off, selectorID,
              callback, items, attr, nocache, theCount);
          }
          else {
            var dataArray = [];
            for (i = 0; i < theCollections.length; i++) {
              dataArray.push([]);
            }
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
    $(selectorID).html(msg);
  });
}

/* ----------------------------------------------------------- */
/* Redirect control function for collection display            */
/*                                                             */
/* ----------------------------------------------------------- */

function collectionControl(
  selectorID,
  collection,
  type = 'carousel',
  attr = {}) {

  toLowerKeys(attr); // make sure the keys re lowercase
  var msg = '';

  /* Validate the selector id, make sure it exists
  and it is the only one found on the page */
  var sel = $(selectorID);
  if (sel.length == 0) {
    msg = 'Error: Selector "' + selectorID + '" not found.';
    msg = '<div class="errorMsg">Error: ' + msg + '</div>';
    $('#page').find('article').eq(0).find('div.content').eq(0).prepend(msg);
    return;
  }
  else if (sel.length > 1) {
    msg = 'Error: Found more than one selector "' + selectorID + '"';
    msg = '<div class="errorMsg">Error: ' + msg + '</div>';
    $(selectorID).eq(0).html(msg);
    return;
  }

  /* process the requested type, call Ajax to read the
  requested collection data and possibly reference data as well,
  then call the specified callback function to process. */
  type = type.toLowerCase();
  if (type == 'flexboxes') {
    recursiveAjaxCall2([collection],'',selectorID,theflexBoxesCallback, [], attr);
  }
  else {
    msg = 'Error: Unknown type="' + type + '"'
    msg = '<div class="errorMsg">Error: ' + msg + '</div>';
    $(selectorID).eq(0).html(msg);
  }
}

// Callback for Flex Boxes
function theflexBoxesCallback(selectorID, json, attr) {
  var data = {items: json['dataArray'][0]};
  formatflexBoxesDisplay(selectorID,data, attr);
}

function formatTeamDisplay(selectorID, json, attr) {

    var a = json['items'];
    var testout = '';
    var allowedExtensions =  /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    var regexp = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/;

    var groups = ('groups' in attr) ? attr['groups'] : '';
    var findCats = ('findcats' in attr) ? attr['findcats'] : '';
    var filter = ('filter' in attr) ? attr['filter'] : false;
    var showCats = ('showcats' in attr) ? attr['showcats'] : false;
    var showDots = ('dots' in attr) ? attr['dots'] : false;
    var showCount = ('showcount' in attr) ? attr['showcount'] : false;

    var theclass = (showCount==true) ? ' active' : '';
    var counter = `<div class="filterItemCount${theclass}"></div>`;
    $('<div id="filterContainer"></div>' + counter).prependTo(selectorID);

    // Set up an array with requested categories
    var findCatsArray = [];
    if (findCats.trim() != '') {
      findCatsArray = findCats.split(',');
    }
    for (n=0; n < findCatsArray.length; n++) {
         findCatsArray[n] = findCatsArray[n].trim()
         .toLowerCase().replaceAll(' ', '+').replaceAll('%20', '+');
    }

    // Set up active class if we are showing categories
    showcats = '';
    if (showCats) {
      showcats = ' active';
    }

    var showing = 0;
    var testout = '';
    for (i=0; i < a.length; i++) {
      var index = i;
      var img = a[i]['assetUrl'];
      var href = a[i]['fullUrl'];
      var title = a[i]['title'];
      var tags = a[i]['tags'];
      var itemtitle = (tags.length > 0) ? tags[0] : '';

      var temp = $(a[i]['body']).find('div.sqs-block-html div.sqs-block-content');
      var bio = $(temp).html();

      // Process categories and filter if requested
      var categories = a[i]['categories'].sort();
      var x = mycats.findIndex((element) => {  // compare lower case
              return element.toLowerCase().replaceAll(' ', '+').replaceAll('%20', '+') === lookup.toLowerCase();
            })
      var cats = '';
      var sep = '';
      var found = false;

      for (n=0; n < categories.length; n++) {
        var classNames = 'newCats';
        var temp = categories[n].toLowerCase().replaceAll(' ', '+').replaceAll('%20', '+');
        var x = findCatsArray.indexOf(temp);
        if (x != -1) {
          found = true;
          classNames += ' active';
        }
        cats += `${sep}<span class="${classNames}" data-itemid="${i}" data-catname="${temp}">${categories[n]}</span>`;
        sep = ', ';
      }
      if (findCatsArray.length == 0 ) { found = true;}

      // Get the excerpt and remove html tags
      var excerpt = a[i]['excerpt'];
      excerpt = excerpt.replace(/(<([^>]+)>)/gi, "");

      // If the image URL looks good then use it,
      // otherwise look for first image in body
      if (!allowedExtensions.exec(img)) {
        // doesn't look like an image url, look inside the body
        var temp = $(a[i]['body']).find('img').eq(0);
        var imgtmp = $(temp).data('src');
        if (imgtmp) {img = imgtmp;}
      }

      // output this item unless it is not included in filter

      if (found == true) {
        testout = testout +
            `<div class="item_box">
            <div class="item_front">
                <img class="item_img" src="${img}">
                <div class="item_name">
                    <div class="item_title">
                        <div class="memberName">${title}</div>
                        <div class="memberTitle">${itemtitle}</div>
                    </div>
                </div>
            </div>
            <div class="item_back">
                <div class="item_bio">${bio}
                </div><button class="readMoreDetails">
                    <i class="arrow"></i></button>
            </div>
        </div>`;
        showing++;
      }

    }
    testout += '</div>';
    $('<div id="teamDetail"></div>').insertBefore(selectorID);
    $('#teamDetail').hide();
    $(selectorID).append('<div class="team_container">' + testout + '</div>');
    $(selectorID + ' div.filterItemCount').html('Showing: ' + showing);

    /* Now, build the filter boxes and set up events, if requested */
    if (filter) {
      collectFilterInfo(selectorID, groups, 'team');
    }

    teamCardResize();

    $('div.item_back').on('click', function() {
        var content = $(this).find('.item_bio').html();
        content = (content) ? content : '<p>No bio</p>'
        var front = $(this).parent();
        var img = front.find('img').attr('src');
        //var name = front.find('.item_name').clone().children().remove().end().text();
        var name = front.find('.item_title .memberName').text();
        var title = front.find('.item_title .memberTitle').text();
        var modalContent = `<!-- Modal content -->
        <div id="teamDetail" class="modal-content" style="display: block;">
        <div class="teamName">${name}</div>
        <div class="teamTitle">${title}</div>
        <div class="teamContent">
            <img class="item_img" src="${img}">${content}
        </div>
        <div style="clear:both;"></div>
        <div class="topClose close"><a href="#">X</a></div>
        <div class="bottomClose close"><a href="#">Close</div></a>
        </div>`;

        $('#myModal').html(modalContent);

        // When the user clicks on close buttons
        $('#myModal div.topClose, #myModal div.bottomClose')
            .on('click', function(e) {
            e.preventDefault();
            $('#myModal').css('display', 'none');
        })
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target.id == 'myModal') {
                $('#myModal').css('display', 'none');
            }
        }
        $('#myModal').show();
        $('#myModal').scrollTop(0);
    });

    addMyModal();

}

var columnIndex = 1;

function flip_carousel(selectorID) {
  var i;
  var numColumns = $(selectorID + ' .newColumn').length;
  if (columnIndex > numColumns) { columnIndex = 1;}
  var background = $(selectorID + ' .newColumn:nth-child(' + +columnIndex + ') .flip-card-front');
  columnIndex++;
  var t = background.find('img.active').index();
  myIndex =  t + 1;
  var x = background.find('img');
  if (myIndex >= x.length) {
    myIndex = 0
  }
  x.removeClass("active");
  background.find('img').eq(myIndex).addClass("active");
  myIndex++;
  setTimeout(function() {flip_carousel(selectorID)}, 5000);
}

function process_card_info(selectorID, link,images, caption, label, message) {
    var str = `<div class=newColumn>
       <div class="f1_container flip-card">
        <div class="f1_card flip-card-inner" class="shadow">
         <div class="front face flip-card-front">`;
    var target = '';
    images.forEach(function(img, key) {
      str = str + `<img src="${img}"/>`;
    })

    link = (typeof link != 'undefined') ? link : "#";
    target = (link.startsWith("http")) ? ' target="_blank"' : target;
    str = str + `<div class="labelText">${caption}</div>
         </div>
         <div class="back face center flip-card-back">
          <a href="${link}"${target}>
            <div class=centerBack>
              <div class="topBox">
                 <div class="labelText">${caption}</div>
              </div>
              <div class="backContent">\n<div>${message}
              </div></div>
              <div class="backLink"><span>Learn More</span></div>
            </div>
         </a>
         </div>
       </div>
      </div>`;

  $(selectorID + ' .flex-container').append(str);
}