var app = {};

app.Merger = function() {
    var App = {
        init: function() {
            this.getformdata();
            this.show_form();
        },
        findLargeObj: function(args) {
            var arg1 = args[0];var arg2 = args[1];
            var arr1 = Object.keys(arg1);var arr2 = Object.keys(arg2);
            var output = {};

            var findLargeArr = arr1.length > arr2.length ? true : false;
            if(findLargeArr) { output = {'large':arg1,'small':arg2,'first':true}; }
            else { output = {'large':arg2,'small':arg1,'first':false}; }
            return output;
        },
        merger: function(args) {
            var arr1 = Object.keys(args.large);
            var arr2 = Object.keys(args.small);
            var isAvailable = 0;
            var output = {};
            
            arr1.find(function(elem) {
                isAvailable = arr2.includes(elem);
                if(isAvailable) {
                    output[elem] = args.first ? [args.large[elem], args.small[elem]] : [args.small[elem], args.large[elem]];
                    delete args.large[elem];delete args.small[elem];
                } else {
                    output[elem] = args.first ? [args.large[elem], 'none'] : ['none', args.large[elem]];
                    delete args.large[elem];
                }
            });

            var small_arr = Object.keys(args.small);
            var loop_length = small_arr.length - 1;
            for(var i = loop_length; i >= 0; i--) {
                output[small_arr[i]] = args.first ? ['none', args.small[small_arr[i]]] : [args.small[small_arr[i]], 'none'];
                delete args.small[small_arr[i]];
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
            $('.js-loop-tbody').html('');
            Object.keys(args).forEach(function(elem) {
                let key = elem; let value = args[elem];
                let template = app.Merger().get_template(key, value);
                $('.js-loop-tbody').append(template);
            });
        },
        getformdata: function() {
            $('.js-form-submit').click(function(e) {
                let table1 = $($('.field1').val());
                let table2 = $($('.field2').val());
                if(!table1.length) { $('.field1').focus();return false; }
                if(!table2.length) { $('.field2').focus();return false; }
                let data = app.Merger().data_formatter(table1, table2);
                //let data = App.data_formatter(table1, table2);
                app.Merger().main(data, true); //if you don't like obj sorting, then change the 2nd param to false;

                $('.js-table').removeClass('hidden');
                $('.js-show-form').removeClass('hidden');
                $('.js-data-getting-form').addClass('hidden');
                return false;
            });
            
        },
        show_form: function() {
            $('.js-show-form').click(function() {
                $('.js-table').addClass('hidden');
                $(this).addClass('hidden');
                $('.js-data-getting-form').removeClass('hidden');
            });
        },
        data_formatter: function(arg1, arg2) {
            let tr1 = $('tr:has(td)', arg1);
            let tr2 = $('tr:has(td)', arg2);
            return [this.datafrom_tr(tr1),this.datafrom_tr(tr2)];
        },
        datafrom_tr: function(args) {
            let td1 = {};let td2 = {};let data = {};
            
            args.each(function(index, elem) {
                if (elem['children'].length !== 2) { return false; }
                td1 = $('td:first', elem).html();
                td2 = $('td:last', elem).html();
                data[td1] = td2;
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
app.Merger();

// Below lines are sample data && using developing purpose only
// var first = {
//     'raja1':'11','bala2':'22','bala3':'33','bala4':'44','bala6':'66','bala7':'77'
// };
// var second = {
//     'bala1':'11','bala2':'22','raja3':'33','bala4':'44','bala5':'5','bala8':'8'
// };
// var args = [first, second];
// var init = app.Merger();
// console.table(init.main(args));