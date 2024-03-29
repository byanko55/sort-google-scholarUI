let table;

function searchArticles(){
    var articles;

    let keyword = document.getElementById('search-input').value.toLowerCase();
    let start_year = document.getElementById('start-yearpicker').value;
    let end_year = document.getElementById('end-yearpicker').value;
    let url = '/search?keyword=' + keyword + "&start=" + start_year + "&end=" + end_year;

    if (table != null){
        console.log("searchArticles: reinitialize DataTable");
        table.destroy();
        table.clear();

        let dtable = document.getElementById('articles');
        dtable.remove();
    }

    const recaptcha_box = document.querySelector(".recaptcha-box");
    const loading_box = document.querySelector(".loading-box");

    loading_box.style.display = "block";
    recaptcha_box.style.display = "none";

    window.setInterval(check_progress, 500);

    $.getJSON('/search', {keyword:keyword, start:start_year, end:end_year}, function (data) {
        console.log("searchArticles: send request to " + url);
        articles = data;
    })
    .done(function() {
        loading_box.style.display = "none";

        if (Object.hasOwn(articles, 'error')) {
            recaptcha_box.style.display = "block";
        }
        else {
            console.log("searchArticles: found " + articles.length + " articles!");
            displayArticles(articles);
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) { console.log('searchArticles: getJSON request failed! ' + textStatus); })
    .always(function() { console.log('searchArticles: getJSON request ended!'); });
}

function displayArticles(articles){
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
        order: [[5, 'desc']]
    });

    const colgroup = document.getElementById('articles').querySelectorAll('col');

    colgroup[0].style.width = "5%";
    colgroup[1].style.width = "40%";
    colgroup[2].style.width = "20%";
    colgroup[3].style.width = "17.5%";
    colgroup[4].style.width = "7.5%";
    colgroup[5].style.width = "10%";
}

function check_progress(){
    const loading_box = document.querySelector(".loading-box");

    if (loading_box.style.display == 'none') return;
    
    var progress;

    $.getJSON('/captcha', function (data) {
        progress = data;
    })
    .done(function() {
        const progress_meter = document.querySelector('.loading-progress');
        progress_meter.innerHTML = progress.val + "%";
    })
    .fail(function(jqXHR, textStatus, errorThrown) { console.log('check_progress: getJSON request failed! ' + textStatus); });
}

const version = "1.1.0";
const namespace = "yearpicker";

let defaults = {
    // The Initial Date
    year: null,
    // Start Date
    startYear: null,
    // End Date
    endYear: null,
    // A element tag items
    itemTag: "li",
    //css class selected date item
    selectedClass: "selected",
    // css class disabled
    disabledClass: "disabled",
    hideClass: "hide",
    template: `<div class="yearpicker-container">
                      <div class="yearpicker-header">
                          <div class="yearpicker-prev" data-view="yearpicker-prev">&lsaquo;</div>
                          <div class="yearpicker-current" data-view="yearpicker-current">SelectedYear</div>
                          <div class="yearpicker-next" data-view="yearpicker-next">&rsaquo;</div>
                      </div>
                      <div class="yearpicker-body">
                          <ul class="yearpicker-year" data-view="years">
                          </ul>
                      </div>
                  </div>
  `,
  
    // Event shortcuts
    onShow: null,
    onHide: null,
    onChange: null,
};
  
const event_click = "click.";
const event_focus = "focus.";
const event_keyup = "keyup.";
const event_selected = "selected.";
const event_show = "show.";
const event_hide = "hide.";
  
const methods = {
    // Show datepicker
    showView: function showView() {
        const $this = this;
    
        if (!$this.build) {
            $this.init();
        }
    
        if ($this.show) {
            return;
        }
    
        $this.show = true;
        const $template = $this.$template,
            options = $this.options;
    
        $template
            .removeClass(options.hideClass)
            .on(event_click, $.proxy($this.click, $this));
        $(document).on(
            event_click,
            (this.onGlobalClick = $.proxy($this.globalClick, $this))
        );
    
        if (options.onShow && $.isFunction(options.onShow)) {
            options.onShow($this.year);
        }
    },
  
    // Hide the datepicker
    hideView: function hideView() {
        const $this = this;
    
        if (!$this.show) {
            return;
        }
    
        // if ($this.trigger(event_hide).isDefaultPrevented()) {
        //   return;
        // }
    
        const $template = $this.$template,
            options = $this.options;
    
        $template.addClass(options.hideClass).off(event_click, $this.click);
        $(document).off(event_click, $this.onGlobalClick);
        $this.show = false;
    
        if (options.onHide && $.isFunction(options.onHide)) {
            options.onHide($this.year);
        }
    },
    // toggle show and hide
    toggle: function toggle() {
        if (this.show) {
            this.hideView();
        } else {
            this.show();
        }
    },
};
  
const handlers = {
    click: function click(e) {
        const $target = $(e.target),
            viewYear = this.viewYear;
    
        if ($target.hasClass("disabled")) {
            return;
        }
    
        const view = $target.data("view");
        switch (view) {
            case "yearpicker-prev":
            var year = viewYear - 12;
            this.viewYear = year;
            this.renderYear();
            break;
            case "yearpicker-next":
            var year = viewYear + 12;
            this.viewYear = year;
            this.renderYear();
            break;
            case "yearpicker-items":
            this.year = parseInt($target.html());
            this.renderYear();
            this.hideView();
            break;
            default:
            break;
        }
    },
    globalClick: function globalClick(_ref) {
        let target = _ref.target;
        let element = this.element;
        let hidden = true;
    
        if (target !== document) {
            while (
            target === element ||
            $(target).closest(".yearpicker-header").length === 1
            ) {
            hidden = false;
            break;
            }
    
            target = target.parentNode;
        }
    
        if (hidden) {
            this.hideView();
        }
    },
  };
  
const render = {
    renderYear: function renderYear() {
        const $this = this,
            options = this.options,
            startYear = options.startYear,
            endYear = options.endYear;
    
        const disabledClass = options.disabledClass,
            viewYear = $this.viewYear,
            selectedYear = $this.year,
            now = new Date(),
            thisYear = now.getFullYear(),
            start = -5,
            end = 6,
            items = [];
    
        let prevDisabled = false;
        let nextDisabled = false;
        let i = void 0;
  
        for (i = start; i <= end; i++) {
            let year = viewYear + i;
            let disabled = false;
    
            if (startYear) {
                disabled = year < startYear;

                if (i === start) {
                    prevDisabled = disabled;
                }
            }
    
            if (!disabled && endYear) {
                disabled = year > endYear;

                if (i === end) {
                    nextDisabled = disabled;
                }
            }
  
            // check for this is a selected year
            const isSelectedYear = year === selectedYear;
            const view = isSelectedYear ? "yearpicker-items" : "yearpicker-items";
            items.push(
                $this.createItem({
                    selected: isSelectedYear,
                    disabled: disabled,
                    text: viewYear + i,
                    //view: disabled ? "yearpicker disabled" : view,
                    view: disabled ? "yearpicker-items disabled" : view,
                    highlighted: year === thisYear,
                })
            );
        }
  
        $this.yearsPrev.toggleClass(disabledClass, prevDisabled);
        $this.yearsNext.toggleClass(disabledClass, nextDisabled);
        $this.yearsCurrent.html(selectedYear);
        $this.yearsBody.html(items.join(" "));
        $this.setValue();
    },
};
  
const Yearpicker = (function () {
    function YearPicker(element, options) {
        const $this = this;
    
        $this.options = $.extend({}, defaults, options);
        $this.$element = $(element);
        $this.element = element;
        $this.build = false;
        $this.show = false;
        $this.startYear = null;
        $this.endYear = null;
        $this.$template = $($this.options.template);
    
        $this.init();
    }
  
    YearPicker.prototype = {
        /**
         * constructor
         * configure the yearpicker before initialize
         * @returns {null}
         */
        init: function () {
            const $this = this,
                $element = this.$element,
                options = this.options;
    
            if (this.build) {
                return;
            }
            $this.build = true;
  
            const startYear = options.startYear,
                endYear = options.endYear,
                defaultYear = $this.getValue(),
                $template = $this.$template;
  
            let year = options.year;
            $template.attr('id', $element.attr('id') + '-container');
    
            $this.isInput = $element.is("input") || $element.is("textarea");
            $this.initialValue = defaultYear;
            $this.oldValue = defaultYear;
    
            const currentYear = new Date().getFullYear();
            // set the defaultyear
            year = year || defaultYear || null;
  
            // set the startyear
            if (startYear) {
                if (year && year < startYear) {
                    year = startYear;
                }
                $this.startYear = startYear;
            }
  
            // set the endyear
            if (endYear) {
                if (year && year > endYear) {
                    year = endYear;
                }
                $this.endYear = endYear;
            }
  
            $this.year = year;
            $this.viewYear = year || currentYear;
            $this.initialYear = year || currentYear;
    
            $this.bind();
    
            $this.yearsPrev = $template.find(".yearpicker-prev");
            $this.yearsCurrent = $template.find(".yearpicker-current");
            $this.yearsNext = $template.find(".yearpicker-next");
            $this.yearsBody = $template.find(".yearpicker-year");
    
            $template.addClass(options.hideClass);
            $element.after($template.addClass(namespace + "-dropdown"));
            $this.renderYear();
        },
        // assign a events
        bind: function () {
            const $this = this,
            $element = this.$element,
            options = this.options;
    
            if ($.isFunction(options.show)) {
                $element.on(event_show, options.show);
            }
            if ($.isFunction(options.hide)) {
                $element.on(event_hide, options.hide);
            }
            if ($.isFunction(options.click)) {
                $element.on(event_click, options.click);
            }
            if ($this.isInput) {
                $element.on(event_focus, $.proxy($this.showView, $this));
            } else {
                $element.on(event_click, $.proxy($this.showView, $this));
            }
        },
        getValue: function () {
            const $this = this,
                $element = this.$element;
    
            const value = $this.isInput ? $element.val() : $element.text();
            return parseInt(value);
        },
        setValue: function () {
            const $this = this,
                $element = this.$element,
                options = this.options,
                value = this.year;
            const previousValue = $this.isInput ? $element.val() : $element.text();
    
            if ($this.isInput) {
                $element.val(value);
            } else {
                $element.html(value);
            }
  
            if (previousValue != value) {
                if (options.onChange && $.isFunction(options.onChange)) {
                    options.onChange($this.year);
                }
            }
  
            $element.trigger("change");
        },
        trigger: function (type, data) {
            data = data || this.year;
            const e = $.Event(type, data);
            this.$element.trigger(e);
            return e;
        },
        createItem: function (data) {
            const options = this.options,
                itemTag = options.itemTag,
                classes = [];
    
            const items = {
                text: "",
                view: "",
                selected: false,
                disabled: false,
                highlighted: false,
            };
  
            $.extend(items, data);
            if (items.selected) {
                classes.push(options.selectedClass);
            }
    
            if (items.disabled) {
                classes.push(options.disabledClass);
            }
    
            return `<${itemTag} class="${items.view} ${classes.join(
            " "
            )}" data-view="${items.view}">${items.text}</${itemTag}>`;
        },
    };
  
    return YearPicker;
})();
  
if ($.extend) {
    $.extend(Yearpicker.prototype, methods, render, handlers);
}
  
if ($.fn) {
    $.fn.yearpicker = function jQueryYearpicker(options) {
        var result = void 0;
  
        this.each(function (index, element) {
            var $element = $(element);
            var isDestory = options === "destroy";
            var yearpicker = $element.data(namespace);
  
            if (!yearpicker) {
                if (isDestory) {
                    return;
                }
                yearpicker = new Yearpicker(element, options);
                $element.data(namespace, yearpicker);
            }
            if (typeof options === "string") {
                var fn = yearpicker[options];
    
                if ($.isFunction(fn)) {
                    result = fn.apply(yearpicker, args);
        
                    if (isDestory) {
                        $element.removeData(namespace);
                    }
                }
            }
        });
    
        return !result ? result : this;
    };
    $.fn.yearpicker.constractor = Yearpicker;
}

document.addEventListener('DOMContentLoaded', function(){
    $('#start-yearpicker').yearpicker({itemTag:'start-container'});
    $('#end-yearpicker').yearpicker({itemTag:'end-container'});
});