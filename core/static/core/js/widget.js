if(typeof tl_widget == "undefined"){
    tl_widget = (function(){
        var get_parent_url = function() {
            var isInIframe = (parent !== window);
            parentUrl = window.location;
            if (isInIframe) {
                parentUrl = document.referrer;
            }
            return parentUrl;
        };

        var serialize = function(form) {
            if (!form || form.nodeName !== "FORM") {
                return;
            }
            var i, j, q = [];

            for (i = form.elements.length - 1; i >= 0; i = i - 1) {
                if (form.elements[i].name === "") {
                    continue;
                }
                switch (form.elements[i].nodeName) {
                case 'INPUT':
                    switch (form.elements[i].type) {
                    case 'text':
                    case 'number':
                    case 'hidden':
                    case 'password':
                    case 'button':
                    case 'reset':
                    case 'submit':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                    case 'checkbox':
                    case 'radio':
                        if (form.elements[i].checked) {
                            q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        }
                        break;
                    case 'file':
                        break;
                    }
                    break;
                case 'TEXTAREA':
                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                    break;
                case 'SELECT':
                    switch (form.elements[i].type) {
                    case 'select-one':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                    case 'select-multiple':
                        for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                            if (form.elements[i].options[j].selected) {
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
                            }
                        }
                        break;
                    }
                    break;
                case 'BUTTON':
                    switch (form.elements[i].type) {
                    case 'reset':
                    case 'submit':
                    case 'button':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                    }
                    break;
                }
            }
            return q.join("&");
        };

        var updateValueInArray = function(str, strArray, replacement) {
            var idx = -1;
            for (var j=0; j<strArray.length; j++) {
                if (strArray[j].match(str)) {
                    idx = j;
                }
            }
            if(idx != -1){
                strArray[idx] = replacement;
            } else {
                strArray.push(replacement);
            }

            return strArray;
        };

        var update_widget = function(url, widget_id, data) {
            var custom_data = document.getElementById('tl-custom-data-'+widget_id);
            var callback = 'json'+(Math.random()*100).toString().replace(/\./g,'');

            if(data){
                data = data.replace(/,/g, '&events=');
                data = data.replace(/ /g, '');
                data = data.replace(/event=/g, 'events=');
                data = data.replace(/#/g, '%23');
            }

            if (custom_data) {
                if(data){
                    data += "&"+custom_data.innerHTML;
                } else {
                    data = custom_data.innerHTML;
                }
                data = data.replace(/&amp;/g, '&');
            }

            dataParts = data.split("&");

            dataParts = updateValueInArray("callback", dataParts, "callback=" + callback);
            dataParts = updateValueInArray("widget_id", dataParts, "widget_id=" + widget_id);
            dataParts = updateValueInArray("request_url", dataParts, "request_url=" + get_parent_url());
            dataParts = updateValueInArray("error_on_no_org", dataParts, "error_on_no_org=true");

            data = dataParts.join('&');

            url += "?" + data;

            window[callback]= function(o){
                var rootNode = document.getElementById('tl-widget-wrapper-'+widget_id);
                rootNode.innerHTML = o.html;

                update_affiliate_links(widget_id);
                update_hidden_data(widget_id);

                if(window.attachEvent) {
                    window.attachEvent('onresize', function() {
                        ticket_table_on_resize(widget_id);
                    });
                } else if(window.addEventListener) {
                    window.addEventListener('resize', function() {
                        ticket_table_on_resize(widget_id);
                    }, true);
                }
                ticket_table_on_resize(widget_id);
            };

            var s = document.createElement('script');
            s.setAttribute('data-name', 'tl-widget-script');
            s.type = 'text/javascript';
            s.src = url;
            s.async = true;
            s.onerror = function(event){
                var rootNode = document.getElementById('tl-widget-wrapper-'+widget_id);
                rootNode.remove();
            };

            var scripts = document.getElementsByTagName('script');
            scriptExists = false;

            for(var i = 0, l = scripts.length; i < l; i++){
                if(scripts[i].getAttribute('data-name') === 'tl-widget-script'){
                    scripts[i].parentNode.removeChild(scripts[i]);
                    break;
                }
            }

            document.getElementsByTagName('head')[0].appendChild(s);

            return false;
        };

        var htmlDecode = function(input){
            return input.replace("&amp;", "&","g")
                .replace("&lt;", "<","g")
                .replace( "&gt;", ">","g")
                .replace("&quot;", "\"","g")
                .replace("&#039;", "'","g");
        };

        var proceed_to_checkout = function(widget_id) {
            var form = document.getElementById('tl-tickets-form-'+widget_id);
            var xmlHttp = new XMLHttpRequest();

            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 ) {
                    if(xmlHttp.status == 200){
                        var jsonResponse = JSON.parse(xmlHttp.responseText);
                        if(jsonResponse.redirect_url){
                            var redirectFormNode = document.getElementById('tl-widget-redirect-form-'+widget_id);
                            redirectUrlNode = document.getElementById('tl-widget-redirect-url-'+widget_id);
                            redirectHoldIdNode = document.getElementById('tl-widget-redirect-hold-id-'+widget_id);
                            redirectHoldCountNode = document.getElementById('tl-widget-redirect-ticket-count-'+widget_id);
                            redirectHoldIsRegisterNode = document.getElementById('tl-widget-redirect-is-register-'+widget_id);
                            redirectUrlNode.value = jsonResponse.redirect_url;
                            redirectHoldIdNode.value = jsonResponse.hold_id;
                            redirectHoldCountNode.value = jsonResponse.hold_ticket_count;
                            redirectHoldIsRegisterNode.value = jsonResponse.hold_is_register;
                            redirectFormNode.submit();
                        } else if(jsonResponse.html){
                            document.getElementById("js-tl-ticket-list-container-"+widget_id).innerHTML = htmlDecode(jsonResponse.html);
                            ticket_table_on_resize(widget_id);
                        }

                    } else if(xmlHttp.status == 400) {
                        //TODO -- switch to console.log?
                        alert('There was an error 400');
                    } else {
                        alert('something else other than 200 was returned: ' + xmlHttp.status);
                    }
                }
            }
            xmlHttp.open("POST", form.action+"?request_url="+get_parent_url(), true);
            xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlHttp.send(serialize(form));

            return false;
        };

        var more_info_click = function(x) {
            var e, nodes = x.parentNode.childNodes;
            for( e in x.parentNode.childNodes ) {
                if ( nodes[e].className == 'tl-more-info' ) {
                    if ( !(nodes[e].style.display) || nodes[e].style.display == 'none' ) {
                        nodes[e].style.display = 'block';
                    } else {
                        nodes[e].style.display = 'none';
                    }
                }
            }
        };

        var hasClass = function(element, cls) {
            return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
        };

        var update_affiliate_links = function(widget_id){
            // Update the affiliate links if the url is set.
            var rootNode = document.getElementById('tl-widget-wrapper-'+widget_id);
            var affiliate_url_node=document.getElementById('tl-affiliate-url-'+widget_id);
            if(affiliate_url_node){
                var affiliate_url = affiliate_url_node.value;
                var links = rootNode.querySelectorAll('.tl-affiliate-link');
                i = links.length;

                while(i--){
                    links[i].setAttribute("href", affiliate_url);
                }
            }
        };

        var update_hidden_data = function(widget_id){
            var rootNode = document.getElementById('tl-widget-wrapper-'+widget_id);
            var show_event_name=document.getElementById('tl-show-event-name-'+widget_id).value == "true" ? true : false;
            show_location=document.getElementById('tl-show-event-location-'+widget_id).value == "true" ? true : false;
            // how do i make this conditional on events with multiple performances?
            show_dates=document.getElementById('tl-show-event-dates-'+widget_id).value == "true" ? true : false;

            if(!show_event_name) {
                var event_name_nodes = rootNode.querySelectorAll('.tl-header-event-name');
                e = event_name_nodes.length;
                while(e--){ event_name_nodes[e].style.display = "none"; }
            }
            if(!show_location) {
                var location_nodes = rootNode.querySelectorAll('.tl-header-venue');
                l = location_nodes.length;
                while(l--){ location_nodes[l].style.display = "none"; }
            }
            if(!show_dates) {
                var dates_nodes = rootNode.querySelectorAll('.tl-header-event-date');
                d = dates_nodes.length;
                while(d--){ dates_nodes[d].style.display = "none"; }
            }

            //
            //Epic hack
            //Remove powered by

            var powered_nodes = rootNode.querySelectorAll('.tl-powered-by-info');
                p = powered_nodes.length;
                while(p--){ powered_nodes[p].style.display = "none"; }

            rootNode.getElementsByClassName('tl-button')[0].classList.add('btn');
            //
            //
            //

        };

        var ticket_table_on_resize = function(widget_id){
            var rootNode = document.getElementById('tl-widget-wrapper-'+widget_id);
            var ticket_form_node=document.getElementById('tl-tickets-form-'+widget_id);
            ticket_table_node=document.getElementById('tl-ticket-table-'+widget_id);

            if(ticket_table_node) {

                var name_cells = rootNode.querySelectorAll('.tl-ticket-type-name-label');
                fee_cells = rootNode.querySelectorAll('.tl-ticket-type-fee-column');
                price_header = rootNode.querySelectorAll('.tl-ticket-type-price-header');
                price_cells = rootNode.querySelectorAll('.tl-ticket-type-price-column');
                price_fee_cells = rootNode.querySelectorAll('.tl-ticket-type-fees-narrow');
                n = name_cells.length, h = price_header.length, j = price_cells.length, f = fee_cells.length;
                pf = price_fee_cells.length;

                if(ticket_form_node.offsetWidth < 450) {
                    while(n--){ name_cells[n].style.width = "100%"; }
                    while(j--){
                        if(hasClass(price_cells[j], 'tl-ticket-type-variable-price')){
                            price_cells[j].style.paddingBottom="18px";
                        }
                        price_cells[j].style.textAlign="left";
                        price_cells[j].style.styleFloat = "left";
                        price_cells[j].style.cssFloat = "left";
                    }
                    while(h--){ price_header[h].style.display = "none"; }

                    if(ticket_form_node.offsetWidth < 350) {
                        while(f--){ fee_cells[f].style.display = "none"; }
                        while(pf--){ price_fee_cells[pf].removeAttribute("style"); }
                    }
                } else {
                    while(pf--){ price_fee_cells[pf].style.display = "none"; }
                    while(f--){ fee_cells[f].removeAttribute("style"); }
                    while(n--){ name_cells[n].removeAttribute("style"); }
                    while(j--){
                        if(hasClass(price_cells[j], 'tl-ticket-type-variable-price')){
                            price_cells[j].style.paddingBottom="0px";
                        }
                        price_cells[j].style.textAlign="center";
                        price_cells[j].style.styleFloat = "right";
                        price_cells[j].style.cssFloat = "right";
                    }
                    while(h--){ price_header[h].removeAttribute("style"); }
                }

            }

        };


        return {
            update_widget: update_widget,
            proceed_to_checkout: proceed_to_checkout,
            more_info_click: more_info_click
        };

    }());
}