    /* ----------------------------------------------------------- */
    /* Get the requested data                                      */
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

        // SELECT * WHERE D = 'Pentecost' and E = 'The Rev. John Buenz'ORDER BY A DESC
        // ?tqx=out:html

        
        function processList(what = null) {

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
        var file_id = '1kOMXiEOqupEBZcjFdUiceYTIJzWXsscJkdr57qcEjkE';
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

        //https://docs.google.com/spreadsheets/u/0/d/1kOMXiEOqupEBZcjFdUiceYTIJzWXsscJkdr57qcEjkE/gviz/tq?tqx=out:html&tq=
        // SELECT year(A), count(B) group by year(A)

        var xlist = getServiceData(url);
        var datalist = xlist.table.rows;
        var collist = xlist.table.cols;


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

        $('#services').html('');
        datalist.forEach(function(item, key) {

            thetitle = 'Unknown title';
            var thedate = '';
            var thepreacher = '';
            var thetime = item.c[timeCol].v;
            var thetype = item.c[typeCol].v;
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
                str = str + '<li class="serviceItem"><a href=' + url + '>Read the Service Bulletin' + notes + '</a></li>';
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
                str = str + '<li class="serviceItem"><a href=' + url + '>Read the Lesson' + notes + '</a></li>';
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
                str = str + '<li class="serviceItem"><a href="' + url + '">' + notes + '</a></li>';
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
                str = str + '<li class="serviceItem"><a href=' + url + '>Read the Sermon' + notes + '</a></li>';
            }
            var notes = '';
            if (item.c[videoNoteCol] != null && item.c[videoNoteCol].v != null) {
                notes = ' (' + item.c[videoNoteCol].v + ')';
            }
            if (item.c[videoCol] != null) {
                var url = item.c[videoCol].v;
                str = str + '<li class="serviceItem"><a href=' + url + '>Watch the Sermon' + notes + '</a></li>';
            }
            str = str + '</ul>';
            $('#services').append(str);
        })

    } // end getServiceFromGoogle


    //});