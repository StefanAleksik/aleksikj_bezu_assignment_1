/**
 * Created by asoadmin on 18/02/17.
 */
//init jQuery
$(document).ready(function() {

    $('#music-preferences').multiselect({
        //buttonWidth: '300px',

        buttonText: function(options, select) {
            if (options.length === 0) {
                return 'Music Preference';
            }
            else if (options.length > 4) {
                return 'More than 4 options selected!';
            }
            else {
                var labels = [];
                options.each(function() {
                    if ($(this).attr('label') !== undefined) {
                        labels.push($(this).attr('label'));
                    }

                    else {
                        labels.push($(this).html());
                    }
                });
                return labels.join(', ') + '';
            }

        }

    });
});