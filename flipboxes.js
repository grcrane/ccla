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

function formatflexBoxesDisplay(selectorID,json, attr) {

  var a = json['items'];
  var testout = '';
  var findCats = ('findcats' in attr) ? attr['findcats'] : '';
  var categories = [];
  var myflag = false;

  // Set up an array with requested categories
  var findCatsArray = [];
  if (findCats.trim() != '') {
    findCatsArray = findCats.toLowerCase().split(',');
  }

  $(selectorID).append('<div class="flipBoxContainer"><div class="flex-container"></div></div>');

  for (i=0; i < a.length; i++) {
    var index = i;
    var img = a[i]['assetUrl'];
    var href = a[i]['fullUrl'];
    var title = a[i]['title'];
    var tags = ('tags' in a[i]) ? a[i]['tags'] : [];
    categories = ('categories' in a[i]) ? a[i]['categories'].sort() : [];
    //categories = a[i]['categories'].sort();
    $.each(categories,function(index, value) {
      categories[index] = categories[index].toLowerCase().trim();
    })

    // If we have a list of required categories, then
    // look through the categories and verify
    myflag = true;
    if (findCatsArray.length) {
      myflag = false;
      $.each(findCatsArray,function(index, value) {
        if (categories.indexOf(value.trim()) != -1) { myflag = true;}
      })
    }

    if (myflag == true) {
      var itemtitle = (tags.length > 0) ? tags[0] : '';
      var source = (a[i]['sourceUrl']) ? a[i]['sourceUrl'] : href;
      var images = [];
      var tempimg = $(a[i]['body']).find('div.sqs-gallery div.slide');
      for (x=0; x < tempimg.length; x++) {
        var src = $(tempimg[x]).find('img').data('image');
        images.push(src);

      }
      if (tempimg.length == 0) {
        images.push(img);
      }
      var temp = $(a[i]['body']).find('div.sqs-block-html div.sqs-block-content');
      var bio = $(temp).html();
      var excerpt = a[i]['excerpt'];
      excerpt = excerpt.replace(/(<([^>]+)>)/gi, "");
      process_card_info(selectorID, source, images, title, title, excerpt);
    }
  }

  $('div.front.face img:first-child')
      .addClass("active");
      $('')
  //setTimeout(flip_carousel, 5000);
  setTimeout(function() {flip_carousel(selectorID)}, 5000);

  flipCardResize(selectorID);

  $( window ).resize(function() {
    flipCardResize(selectorID);
  });
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