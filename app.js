var app = {};

app.Merger = function() {
    var App = {
        init: function() {
            this.table;
            this.multipleTables;
            this.getformdata();
            this.show_form();
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
                    delete args.large[index][key];
                    delete values_of_arr2[key];
                } else {
                    output[key] = args.first ? [elemObj[key], '(empty)'] : ['(empty)', elemObj[key]];
                    delete args.large[index][key];
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
        sorting: function(args, isSort) {
            if (!isSort) return args;
            var sorted = {};
            Object.keys(args).sort().forEach(function(elem) {
                sorted[elem] = args[elem];
            });
            return sorted;
        },
        get_template: function(key, value) {
            let template = `
            <tr class="js-loop-tr">
                <td class="js-loop-key-td">${key}</td>
                <td class="js-loop-value-td">
                <p>${value[0]}</p>
                <p>${value[1]}</p>
                </td>
            </tr>
            `;
            return template;
        },
        html_generator: function(args) {
            const that = this;
            $('.js-loop-tbody').html('');
            Object.keys(args).forEach(function(elem) {
                let key = elem; let value = args[elem];
                let template = that.get_template(key, value);
                $('.js-loop-tbody').append(template);
            });
        },
        getformdata: function() {
            const that = this;
            $('.js-form-submit').click(function(e) {
                let table1 = $($('.field1').val());
                let table2 = $($('.field2').val());
                if(!table1.length) { $('.field1').focus();return false; }
                if(!table2.length) { $('.field2').focus();return false; }

                that.data_to_html(table1, table2);

                $('.js-result-div').removeClass('hidden');
                $('.js-data-getting-form').addClass('hidden');

                if (that.table) {
                    that.table.destroy();
                }
                that.table = $('.js-table').DataTable({
                });
                return false;
            });
            
        },
        data_to_html: function(table1, table2) {
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
            //let data = App.data_formatter(table1, table2);
            //if you don't like obj sorting, then change the 2nd param to false;
            that.main(data, false);
        },
        show_form: function() {
            $('.js-show-form').click(function() {
                $('.js-result-div').addClass('hidden');
                $('.js-data-getting-form').removeClass('hidden');
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
        main: function(args, isSort = true) {
            var findLargeObj = this.findLargeObj(args);
            var merged_data = this.merger(findLargeObj);
            var sorted_data = this.sorting(merged_data, isSort);
            this.html_generator(sorted_data);
            return sorted_data;
        },
    };
    App.init();
    return App;
};

$(document).ready(function() {
    app.Merger();
});

// Below lines are sample data && used for developing purpose only
// var first = {
//     'raja1':'11','bala2':'22','bala3':'33','bala4':'44','bala6':'66','bala7':'77'
// };
// var second = {
//     'bala1':'11','bala2':'22','raja3':'33','bala4':'44','bala5':'5','bala8':'8'
// };
// var args = [first, second];
// var init = app.Merger();
// console.table(init.main(args));
