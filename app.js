    var App = {
        table_all: null,
        table_matched: null,
        table_unmatched: null,
        all: {},
        matched: {},
        unmatched: {},
        init: function() {
            this.getformdata();
            this.show_form();
            this.tab_switcher();
        },
        findLargeObj: function(args) {
            var arr1 = args[0];
            var arr2 = args[1];
            var output = {};

            var findLargeArr = arr1.length > arr2.length ? true : false;
            if (findLargeArr) {
                output = {'large': arr1,'small': arr2,'first': true}; 
            } else {
                output = {'large': arr2,'small': arr1,'first': false}; 
            }
            return output;
        },
        merger: function(args) {
            var arr1 = args.large;
            var arr2 = args.small;
            var values_of_arr2 = {};
            var keys_of_arr2 = arr2.map(function(elemObj) { 
                key = Object.keys(elemObj)[0];
                values_of_arr2[key] = elemObj[key];
                return key;
            });
            var isAvailable = 0;
            var output = {};
            
            arr1.find(function(elemObj, index) {
                key  = Object.keys(elemObj)[0];
                isAvailable = keys_of_arr2.includes(key);
                if(isAvailable) {
                    output[key] = args.first ? [elemObj[key], values_of_arr2[key]] : [values_of_arr2[key], elemObj[key]];
                    delete args.large[index];
                    delete values_of_arr2[key];
                } else {
                    output[key] = args.first ? [elemObj[key], '(empty)'] : ['(empty)', elemObj[key]];
                    delete args.large[index];
                }
            });

            var small_arr = Object.keys(values_of_arr2);
            var loop_length = small_arr.length - 1;
            for(var i = loop_length; i >= 0; i--) {
                output[small_arr[i]] = args.first ? ['(empty)', values_of_arr2[small_arr[i]]] : [values_of_arr2[small_arr[i]], '(empty)'];
                delete values_of_arr2[small_arr[i]];
            }
            return output;
        },
        data_seperator: function(args, isSort = false) {
            if (isSort) {
                Object.keys(args).sort().forEach(function(elem) {
                    App.all[elem] = args[elem];
                    if (args[elem][0] === args[elem][1]) {
                        App.matched[elem] = args[elem];
                    } else {
                        App.unmatched[elem] = args[elem];
                    }
                });
            } else {
                Object.keys(args).forEach(function(elem) {
                    App.all[elem] = args[elem];
                    if (args[elem][0] === args[elem][1]) {
                        App.matched[elem] = args[elem];
                    } else {
                        App.unmatched[elem] = args[elem];
                    }
                });
            }
            return App.all;
        },
        get_template: function(key, value) {
            let htmlClass = (value[0] === value[1]) ? 'green' : 'red';
            let template = `
            <tr class="js-loop-tr ${htmlClass}">
                <td class="js-loop-key-td">${key}</td>
                <td class="js-loop-value-td">
                <p>${value[0]}</p>
                <p>${value[1]}</p>
                </td>
            </tr>
            `;
            return template;
        },
        html_generator: function($table, args) {
            const that = this;
            let key, value, template;
            var $tbody = $('tbody', $table);
            $tbody.html('');

            Object.keys(args).forEach(function(elem) {
                key = elem;
                value = args[elem];
                template = that.get_template(key, value);
                $tbody.append(template);
            });
        },
        getformdata: function() {
            const that = this;
            $('.js-form-submit').click(function(e) {
                let table1 = $($('.field1').val());
                let table2 = $($('.field2').val());
                if(!table1.length) { $('.field1').focus();return false; }
                if(!table2.length) { $('.field2').focus();return false; }

                if (that.table_all) {
                    that.table_all.destroy();
                }
                that.all = {};
                that.matched = {};
                that.unmatched = {};

                that.data_from_html(table1, table2);
                if ($('.js-nav-item a.active').length) {
                  $('.js-nav-item a.active').trigger('click');
                }
                const $table_context = $('.tab-content');
                that.table_all = $('#js-table', $table_context).DataTable();

                $('.js-result-div').removeClass('hidden');
                $('.js-data-getting-form').addClass('hidden');
                return false;
            });
            
        },
        data_from_html: function(table1, table2) {
            const that = this;
            let data;
            let mutliTable1 = table1.map(function(index, element) {
                if (element.tagName === 'TABLE') {
                    return element;
                }
            });
            let mutliTable2 = table2.map(function(index, element) {
                if (element.tagName === 'TABLE') {
                    return element;
                }
            });
            data = that.data_formatter(mutliTable1, mutliTable2);
            that.main(data);
        },
        show_form: function() {
            $('.js-show-form').click(function() {
                $('.js-result-div').addClass('hidden');
                $('.js-data-getting-form').removeClass('hidden');
            });
        },
        tab_switcher: function() {
            const that = this;
            $('.js-nav-item a').on('click', function (e) {
                e.preventDefault();
                const $navitem = $(this);
                $navitem.tab('show');
                const $table_context = $('.tab-content');
                let tablename = $navitem.data('table');
                const $table = $('#' + tablename, $table_context);
                let sourcename = $navitem.data('source');
                const data = that[sourcename];
                if (that['table_' + sourcename]) {
                    that['table_' + sourcename].destroy();
                }
                that.html_generator($table, data);
                that['table_' + sourcename] = $table.DataTable();
                console.log(sourcename);console.log(tablename);
                console.log(data);
            });
        },
        data_formatter: function(arg1, arg2) {
            let tr1 = $('tr:has(td)', arg1);
            let tr2 = $('tr:has(td)', arg2);
            return [this.datafrom_tr(tr1),this.datafrom_tr(tr2)];
        },
        datafrom_tr: function(args) {
            let td1 = {};let td2 = {};let data = [];
            
            args.each(function(index, tr) {
                if (tr['children'].length !== 2) { return false; }
                td1 = $('td:first', tr).html();
                td2 = $('td:last', tr).html();
                let tempObj = {};
                tempObj[td1] = td2;
                data.push(tempObj);
            });
            return data;
        },
        main: function(args) {
            var findLargeObj = this.findLargeObj(args);
            var merged_data = this.merger(findLargeObj);
            let isSort = $('#js-is_sort:checked').length ? true : false;
            var overall_result = this.data_seperator(merged_data, isSort);
            this.html_generator($('#js-table'), overall_result);
        },
    };

$(document).ready(function() {
    App.init();
});

// Below lines are sample data && used for developing purpose only
// var first = {
//     'raja1':'11','bala2':'22','bala3':'33','bala4':'44','bala6':'66','bala7':'77'
// };
// var second = {
//     'bala1':'11','bala2':'22','raja3':'33','bala4':'44','bala5':'5','bala8':'8'
// };
// var args = [first, second];
// console.table(App.main(args));
