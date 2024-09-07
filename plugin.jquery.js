(function($) {
    // Define your custom plugin
    $.api = function(options) {
        // Default settings
        var settings = $.extend({
            url: '', // API endpoint URL
            method: 'GET', // HTTP method (GET by default)
            data: null, // Data to send (optional)
            endpoint:'',
            success: function(response) {
                // Default success callback
                console.log('API response:', response);
            },
            error: function(xhr, status, error) {
                // Default error callback
                console.error('Error:', status, error);
            }
        }, options);

        // Make the API request using $.ajax
        $.ajax({
            url: settings.url + settings.endpoint, // Modify URL
            method: settings.method,
            data: settings.data,
            success: settings.success,
            error: settings.error
        });
    };
})(jQuery);
