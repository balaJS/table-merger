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
        // V2 code start here.
        // Here we did level one filter, that means we filter same keys and value here.
        result: {
            'same_keys': [],
            'same_values': [],
            'keys1': [],
            'values1': [],
            'keys2': [],
            'values2': [],
        },
        filter_one: function(argKeys1, argKeys2, argsValues1, argsValues2) {
            const that = this;
            let isKeyExists, index2, sameKeys;
            let sameValues = [];

            sameKeys = argKeys1.filter(function(key, index1) {
                isKeyExists = argKeys2.includes(key);
                if (isKeyExists) {
                    index2 = argKeys2.indexOf(key);

                    let values = {
                        'first': argsValues1[index1],
                        'second': argsValues2[index2],
                    };
                    sameValues.push(values);

                    delete argKeys1[index1];
                    delete argKeys2[index2];
                    delete argsValues1[index1];
                    delete argsValues2[index2];
                    return key;
                }
            });

            that.result['same_keys'] = sameKeys;
            that.result['same_values'] = sameValues;
            that.result['keys1'] = argKeys1;
            that.result['values1'] = argsValues1;
            that.result['keys2'] = argKeys2;
            that.result['values2'] = argsValues2;
        },
        set_pair_value_for_keys: function(keys, values, isKeys1) {
            let value = isKeys1 ? 'values1' : 'values2';
            this.result[value] = keys.map(function(key, index1) {
                let tempObj = {
                    'first': isKeys1 ? values[index1] : '(empty)',
                    'second': isKeys1 ? '(empty)' : values[index1]
                };
                return tempObj;
            });
        },
        clean_result: function() {
            this.result.keys1 = this.delete_key(this.result.keys1);
            this.result.keys2 = this.delete_key(this.result.keys2);
            this.result.values1 = this.delete_key(this.result.values1);
            this.result.values2 = this.delete_key(this.result.values2);
        },
        delete_key: function(targetArray, index = -1, ) {
            if (index === -1) {
                return targetArray.filter(function(key) {
                    return key;
                });
            }
            targetArray.splice(index, 1);
        },

    };

$(document).ready(function() {
    //App.init();

    // Sample data for V2.
    var keys1 = [
        'name',
        'age',
        'name',
        'hobby'
    ];
    var keys2 = [
        'name',
        'age',
        'name',
        'intrest'
    ];
    var values1 = [
        'bala',
        '24',
        'haha',
        'programming'
    ];
    var values2 = [
        'bala',
        '24',
        'hehe',
        'coding'
    ];
// App logic modification going on.
App.filter_one(keys1, keys2, values1, values2);
App.set_pair_value_for_keys(App.result.keys1, App.result.values1, true);
App.set_pair_value_for_keys(App.result.keys2, App.result.values2, false);
App.clean_result();
console.log(App.result);

});
