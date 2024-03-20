let table;

function searchArticles(){
    var articles;

    let keyword = document.getElementById('search-input').value.toLowerCase();
    let url = '/search?keyword=' + keyword;

    $.getJSON('/search', {keyword:keyword}, function (data) {
        console.log("searchArticles: send request to " + url);
        articles = data;
    })
    .done(function() { 
        console.log("searchArticles: found " + articles.length + " articles!");
        displayArticles(articles);
    })
    .fail(function(jqXHR, textStatus, errorThrown) { console.log('searchArticles: getJSON request failed! ' + textStatus); })
    .always(function() { console.log('searchArticles: getJSON request ended!'); });
}

function displayArticles(articles){
    if (table != null){
        console.log("displayArticles: reinitialize DataTable");
        table.destroy();
        table.clear();

        let dtable = document.getElementById('articles');
        dtable.remove();
    }

    let records = document.createElement("table");

    records.innerHTML = '<table><thead><tr>' +
        '<th class="index">#</th><th>Title</th><th>Author</th><th>Publisher</th><th>Year</th><th>Citations</th>' +
        '</tr></thead><tbody></tbody></table>';

    records.id = 'articles';
    document.body.append(records);

    const contents = records.querySelector('tbody');

    for (var i = 0; i < articles.length; i++) {
        let article_info = document.createElement("tr");

        article_info.innerHTML = '<td class="index">' + (i+1) + 
            '</td><td title="' + articles[i].Title + '">' + articles[i].Title +
            '<a href="' + articles[i].Source + 
            '"><i class="fa-solid fa-paperclip"></i></a></td><td title="' + articles[i].Author + '">' + articles[i].Author +
            '</td><td title="' + articles[i].Publisher + '">' + articles[i].Publisher +
            '</td><td>' + articles[i].Year +
            '</td><td>' + articles[i].Citations + 
            '</td>';

        contents.append(article_info);
    }

    table = new DataTable('#articles', {
        searching: false,
        responsive: true,
        ordering: true,
        order: [[5, 'desc']],
        columns: [
            { width: '5%' },
            { width: '45%' },
            { width: '20%' },
            { width: '15%' },
            { width: '5%' },
            { width: '10%' }
        ]
    });
}