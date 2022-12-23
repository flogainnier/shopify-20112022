(function CheckoutShipping() {
  'use strict';

  // Helpers
  if (!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  if (!Element.prototype.closest)
    Element.prototype.closest = function(s) {
      var el = this;
      if (!document.documentElement.contains(el)) return null;
      do {
        if (el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType == 1); 
      return null;
    };

  // Perform changes only on the shipping_method step
  if (Shopify.Checkout.step !== 'shipping_method') return;

  // Initialize after Shopify renders the checkout
  document.addEventListener('page:load', init);
  // Reinitialize on DOM refresh
  document.addEventListener('page:change', init);
  
  function init() {
    if (window.cartContent.hasCustomItem) {
      var warning = '<div role="alert" data-shipping-warning data-banner="true" class="notice notice--error default-background" tabindex="-1" aria-atomic="true" aria-live="polite"><svg focusable="false" width="30" height="30" class="" viewBox="0 4 22 22"><circle cx="9" cy="13" r="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"></circle><path d="M8.993 15.262a.972.972 0 00-.979.968c0 .539.44.99.98.99a.99.99 0 00.978-.99.972.972 0 00-.979-.968zm-.78-.649h1.561V8.706H8.212v5.907z" fill="currentColor"></path></svg><div class="notice__content"><p class="notice__text">'+ window.cartContent.alertDescription +'</p></div></div>'
      document.querySelector(".section--shipping-method").querySelector(".section__content").insertAdjacentHTML('afterbegin', warning)
    }
    if (window.cartContent.hasPreorderItem) {
      var pre_order = '<div role="alert" data-shipping-warning data-banner="true" class="notice notice--error default-background" tabindex="-1" aria-atomic="true" aria-live="polite"><svg focusable="false" width="30" height="30" class="" viewBox="0 4 22 22"><circle cx="9" cy="13" r="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"></circle><path d="M8.993 15.262a.972.972 0 00-.979.968c0 .539.44.99.98.99a.99.99 0 00.978-.99.972.972 0 00-.979-.968zm-.78-.649h1.561V8.706H8.212v5.907z" fill="currentColor"></path></svg><div class="notice__content"><p class="notice__text">'+ window.cartContent.preorderDescription +'</p></div></div>'
      document.querySelector(".section--shipping-method").querySelector(".section__content").insertAdjacentHTML('afterbegin', pre_order)
    }
    if (window.cartContent.hasDeliveryInfo) {
      var delivery_info = '<div role="alert" data-shipping-warning data-banner="true" class="notice notice--error default-background" tabindex="-1" aria-atomic="true" aria-live="polite"><svg focusable="false" width="30" height="30" class="" viewBox="0 4 22 22"><circle cx="9" cy="13" r="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"></circle><path d="M8.993 15.262a.972.972 0 00-.979.968c0 .539.44.99.98.99a.99.99 0 00.978-.99.972.972 0 00-.979-.968zm-.78-.649h1.561V8.706H8.212v5.907z" fill="currentColor"></path></svg><div class="notice__content"><p class="notice__text">'+ window.cartContent.deliveryInfo +'</p></div></div>'
      document.querySelector(".section--shipping-method").querySelector(".section__content").insertAdjacentHTML('afterbegin', delivery_info)
    }
    for (var shippingMethod in window.shippingMethods) {
      var label = document.querySelector("[data-shipping-method-label-title=\"".concat(window.shippingMethods[shippingMethod]['title'], "\"]"));
      if (label) {
        label.innerHTML = "\n <div class=\"shipping-method\">\n <img src=\"".concat(window.shippingMethods[shippingMethod]['image'],"\" class=\"shipping-method__image\" alt=\"Aglaïa & Co\"/>\n \n <div class=\"shipping-method__text\">\n <span class=\"shipping-method__title\">").concat(window.shippingMethods[shippingMethod]['titleDisplayed'], "</span>\n<div class=\"shipping-method__subtitle\"></div>\n</div>\n\n</div>\n");
        if (window.shippingMethods[shippingMethod]['subtitle'] !== null) {
          label.querySelector('.shipping-method__subtitle').innerHTML = window.shippingMethods[shippingMethod]['subtitle'];
        }
        if (window.shippingMethods[shippingMethod]['servicePoint']) {
          const servicePointElement = document.createElement('div')
          servicePointElement.classList.add('servicePointWrapper');
          if (label.closest('.radio-wrapper').querySelector('.input-radio').checked) {
            if (document.querySelector('[name="checkout[attributes][point_name]"]')) {
              servicePointElement.innerHTML += '<div id="servicePointResult"></div><button type="button" class="btn btn-primary" id="openServicePointPicker">' + modifyServicePoint + '</button><p class="field__message field__message--error" id="error-for-order-info">' + servicePointError + '</p>'
              servicePointElement.classList.add('active');
              label.querySelector('.shipping-method__text').append(servicePointElement)
              label.querySelector('#servicePointResult').innerHTML += checkout_attributes_printer()
            } else {
              const forms = document.querySelectorAll('.edit_checkout');
              for (let i = 0; i < forms.length; i++) {
                forms[i].insertAdjacentHTML('afterbegin', create_checkout_attributes(point_id, point_code, point_name, point_country, point_city, point_house_number, point_street, point_postal_code, point_carrier))
              }
              servicePointElement.innerHTML += '<div id="servicePointResult"></div><button type="button" class="btn btn-primary" id="openServicePointPicker">' + selectServicePoint + '</button><p class="field__message field__message--error" id="error-for-order-info">' + servicePointError + '</p>'
              servicePointElement.classList.add('active');
              label.querySelector('.shipping-method__text').append(servicePointElement)
            }
          } else {
            servicePointElement.innerHTML += '<div id="servicePointResult"></div><button type="button" class="btn btn-primary" id="openServicePointPicker">' + selectServicePoint + '</button><p class="field__message field__message--error" id="error-for-order-info">' + servicePointError + '</p>'
            label.querySelector('.shipping-method__text').append(servicePointElement)
          }
        }
      }
    }

    document.getElementById('openServicePointPicker').addEventListener('click', openServicePointPicker)

    if (document.querySelector('input[name="checkout[shipping_rate][id]"]')) {
      document.querySelectorAll('input[name="checkout[shipping_rate][id]"]').forEach((elem) => {
        elem.addEventListener("change", function(event) {
          if (event.target.closest(".radio-wrapper").querySelectorAll('.servicePointWrapper').length > 0) {
            if (event.target.checked) {
              const forms = document.querySelectorAll('.edit_checkout');
              for (let i = 0; i < forms.length; i++) {
                forms[i].insertAdjacentHTML('afterbegin', create_checkout_attributes(point_id, point_code, point_name, point_country, point_city, point_house_number, point_street, point_postal_code, point_carrier))
              }
              const servicePointResultElement = document.getElementById('servicePointResult')
              servicePointResultElement.innerHTML = checkout_attributes_printer()
              event.target.closest(".radio-wrapper").querySelector('.servicePointWrapper').classList.add('active')
            }
          } else {
            document.querySelector('.servicePointWrapper').classList.remove('active')
            document.querySelector('.servicePointWrapper').classList.remove("field--error")
            remove_checkout_attributes()
            document.querySelector('#servicePointResult').innerHTML = ""
            if (point_id.length == 0) {
              document.getElementById('openServicePointPicker').innerHTML = selectServicePoint
            }
          }
        });
      });
    }

    document.querySelector("#continue_button").addEventListener('click', event => {
      event.preventDefault();
      if (document.querySelector('[name="checkout[attributes][point_id]"]')) {
        if (document. querySelector('[name="checkout[attributes][point_id]"]').value.length > 0) {
          document.querySelector("#continue_button").classList.add('btn--loading');
          document.querySelector('[data-shipping-method-form="true"]').submit();
        } else {
          document.querySelector('.servicePointWrapper').classList.add("field--error")
        }
      } else {
        document.querySelector("#continue_button").classList.add('btn--loading');
        document.querySelector('[data-shipping-method-form="true"]').submit();
      }
    });

    document.querySelector('[data-shipping-method-form="true"]').addEventListener('keyup', event => {
      if (event.keycode === 13) {
        event.preventDefault();
        document.querySelector("#continue_button").click();
      }
    });
  }
  
  function openServicePointPicker() {
    if (!apiKeyField) {
      alert('Missing API key')
    }

    const options = {
      apiKey: apiKeyField,
      country: countryField,
      postalCode: postalCodeField,
      city: cityField,
      carriers: "colissimo",
      servicePointId: parseInt(servicePointIdField),
      postNumber: postNumberField,
      language: Shopify.Checkout.normalizedLocale,
      shopType: shopTypeField,
    }

    sendcloud.servicePoints.open(options, successCallback, failureCallback)
  }

  /**
  * Handles the selection of a service point.
  */
  function successCallback(servicePoint, postNumber) {
    const servicePointResultElement = document.getElementById('servicePointResult')
    servicePointResultElement.innerHTML = shippingSummaryPrinter(servicePoint)
    populate_checkout_attributes(servicePoint, postNumber)
    document.querySelector('.servicePointWrapper').classList.remove("field--error")
    document.getElementById('openServicePointPicker').innerHTML = modifyServicePoint
  }

  /**
  * Handles error events and closing the service point picker.
  */
  function failureCallback(errors) {
    console.error('[Failure callback]', errors.join(', '))
  }

  function shippingSummaryPrinter(point) {
    var html =  point.name;
        html += "<br>";
        html += point.house_number + " " + point.street;
        html += "<br>";
        html += point.postal_code + ", " + point.city;
    return html;
  }

  function populate_checkout_attributes(point, postNumber) {
    var keys = ["id","code","name","country","city","house_number","street","postal_code","carrier","formattedDistance"];
    for (var i=0; i<keys.length; i++) {
      var key = keys[i];
      var attributeKey = 'point_' + key;
      var value = point[key];
      const inputs = document.querySelectorAll('input[name="checkout[attributes][' + attributeKey + ']"]');
      for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = value
      }
    }
  }

  function create_checkout_attributes(point_id, point_code, point_name, point_country, point_city, point_house_number, point_street, point_postal_code, point_carrier) {
    var html = ""
    html += '<input type="hidden" name="checkout[attributes][point_id]" value="' + point_id + '">'
    html += '<input type="hidden" name="checkout[attributes][point_code]" value="' + point_code + '">'
    html += '<input type="hidden" name="checkout[attributes][point_name]" value="' + point_name + '">'
    html += '<input type="hidden" name="checkout[attributes][point_country]" value="' + point_country + '">'
    html += '<input type="hidden" name="checkout[attributes][point_city]" value="' + point_city + '">'
    html += '<input type="hidden" name="checkout[attributes][point_house_number]" value="' + point_house_number + '">'
    html += '<input type="hidden" name="checkout[attributes][point_street]" value="' + point_street + '">'
    html += '<input type="hidden" name="checkout[attributes][point_postal_code]" value="' + point_postal_code + '">'
    html += '<input type="hidden" name="checkout[attributes][point_carrier]" value="' + point_carrier + '">'
    return html;
  }

  function remove_checkout_attributes() {
    var keys = ["id","code","name","country","city","house_number","street","postal_code","carrier","formattedDistance","to_post_number"];
    var html = "";
    for (var i=0; i<keys.length; i++) {
      var key = keys[i];
      var attributeKey = 'point_' + key;
      const collection = document.querySelectorAll('input[name="checkout[attributes][' + attributeKey + ']"]');
      for (let i = 0; i < collection.length; i++) {
          collection[i].remove();
      }
    }
    return html;
  }

  function checkout_attributes_printer() {
    if (document.querySelector('[name="checkout[attributes][point_name]"]') && document.querySelector('[name="checkout[attributes][point_name]"]').value.length > 0) {
      var html =  document.querySelector('[name="checkout[attributes][point_name]"]').value;
          html += "<br>";
          html += document.querySelector('[name="checkout[attributes][point_street]"]').value;
          html += "<br>";
          html += document.querySelector('[name="checkout[attributes][point_postal_code]"]').value + ", " + document.querySelector('[name="checkout[attributes][point_city]"]').value;
      return html;
    } else {
      return "";
    }
  }

})();

(function ToggleCart() {
  'use strict';

  const toggleCart = document.querySelectorAll('[data-action="toggle-mini-cart"]');
  for (let i = 0; i < toggleCart.length; i++) {
    toggleCart[i].addEventListener('click', event => {
      var miniCart = document.querySelector('.sidebar');
      miniCart.setAttribute('aria-hidden', miniCart.getAttribute('aria-hidden') === 'true' ? 'false' : 'true');
      document.querySelector('.sidebar-overlay').classList.toggle('active');
    });
  }

})();

(function SendServicePoint() {
  'use strict';

  // Perform changes only on the shipping_method step
  if (Shopify.Checkout.isOrderStatusPage !== true && Shopify.Checkout.step !== "thank_you") return;

  if (!document.querySelector('[name="checkout[attributes][point_id]"]')) return;

  // Initialize after Shopify renders the checkout
  document.addEventListener('page:load', init);
  // Reinitialize on DOM refresh
  document.addEventListener('page:change', init);
  
  function init() {
    const params = {
      api_key: '2f49771b52e44bb09d77c92c30679eb5',
      order_id: Shopify.checkout.order_id,
      shop_identification: Shopify.shop,
      order_confirmation: orderConfirmation(),
      service_point: document.querySelector('[name="checkout[attributes][point_id]"]').value,
      checkout_shippingmethod_name: Shopify.checkout.shipping_rate.title,
      checkout_shippingmethod_id: Shopify.checkout.shipping_rate.handle,
    };

    for (var shippingMethod in window.shippingMethods) {
      document.querySelector('.content-box:last-child').innerHTML = document.querySelector('.content-box:last-child').innerHTML.replace(window.shippingMethods[shippingMethod]['title'], window.shippingMethods[shippingMethod]['titleDisplayed']);
    }

    const url = 'https://servicepoints.sendcloud.sc/service-points/shopify/store/?' + toQueryString(params);
    const saveSPPIframe = document.createElement('div');
    saveSPPIframe.classList.add("hidden")
    saveSPPIframe.innerHTML = '<iframe class="hidden" src="' + url + '" width="0" height="0">';
    document.body.appendChild(saveSPPIframe);

    addServicePointToTable();
  }

  function orderConfirmation() {
    if (!Shopify.checkout) {
      return '';
    }
    return (
      Shopify.checkout.shipping_address.first_name +
      ' ' +
      Shopify.checkout.shipping_address.last_name +
      '+' +
      Shopify.checkout.shipping_address.zip
    );
  }

  function addServicePointToTable() {
    const customerInfo = document.querySelector('.content-box:last-child');
    const firstColumn = customerInfo.querySelector('.section__content__column:first-child');
    var html = document.querySelector('[name="checkout[attributes][point_name]"]').value;
        html += "<br>";
        html += document.querySelector('[name="checkout[attributes][point_street]"]').value;
        html += "<br>";
        html += document.querySelector('[name="checkout[attributes][point_postal_code]"]').value + ", " + document.querySelector('[name="checkout[attributes][point_city]"]').value;
    firstColumn.querySelector(".text-container").innerHTML += "<p>" + html + "<p>";
  }

  function toQueryString(params) {
    const plist = [];
    for (const key in params) {
      plist.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
    return plist.join('&');
  }
})();

(function Carousel() {
  'use strict';
  var checkoutFeatures = document.querySelector('.feature-list');
  if (checkoutFeatures) {
    new Flickity(checkoutFeatures, {
        pageDots: true,
        prevNextButtons: false,
        watchCSS: true
    });
  } 
})();