var productCardMarkup = 
       `<div class="product-list__inner">
          {{#products}}
          <product-item class="product-item">
            <div class="product-item__image-wrapper">
              <a href="{{du}}" aria-label="{{dt}}" class="product-item__aspect-ratio aspect-ratio" style="padding-bottom: 125.0%; --aspect-ratio: 0.8">
            	  <img class="product-item__primary-image" loading="lazy" src="{{iu}}" sizes="(max-width: 740px) calc(50vw - 24px), calc((min(100vw - 80px, 1520px) - 0px) / 4 - 18px)"> 
              </a>
            </div>
            <div class="product-item__info">
              <div class="product-item-meta">
                <a href="{{du}}" class="product-item-meta__title">{{dt}}</a>
                <div class="product-item-meta__price-list-container">
                  <div class="price-list price-list--centered">
                    <span class="price price--highlight">
                      {{cu}}{{pr}}
                    </span>
                  </div>
                </div>
              </div>
              <div class="swym-variant-title swym-text swym-title-2 swym-variant-title-spacer">
                {{variantinfo}}
              </div>
            </div>
          </product-item>
         {{/products}}
        </div>`;

function getVariantInfo(variants) {
	try {
		let variantKeys = ((variants && variants != "[]") ? Object.keys(JSON.parse(variants)[0]) : []),
			variantinfo;
		if (variantKeys.length > 0) {
			variantinfo = variantKeys[0];
			if (variantinfo == "Default Title") {
				variantinfo = "";
			}
		} else {
			variantinfo = "";
		}
		return variantinfo;
	} catch (err) {
		return variants;
	}
}
if (!window.SwymCallbacks) {
	window.SwymCallbacks = [];
}
window.SwymCallbacks.push(swymRenderWishlist); /* Init Here */

function swymRenderWishlist(swat) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  var list = urlParams.get('hkey')
  swat.fetchListDetails({lid: list}, function(listContents){
    var wishlistContentsContainer = document.getElementById("wishlist-items-container");
		var formattedWishlistedProducts = listContents.items.map(function(p) {
			p = SwymUtils.formatProductPrice(p); // formats product price and adds currency to product Object
			p.isInCart = _swat.platform.isInDeviceCart(p.epi) || (p.et == _swat.EventTypes.addToCart);
			p.variantinfo = (p.vi ? getVariantInfo(p.vi) : "");
			return p;
		});
		var productCardsMarkup = SwymUtils.renderTemplateString(productCardMarkup, {
			products: formattedWishlistedProducts
		});
		if(wishlistContentsContainer){
      if (listContents.items.length > 0) {
        wishlistContentsContainer.innerHTML = productCardsMarkup;
        document.getElementById("header-wishlist").innerHTML = "<div class='wishlist__empty heading h3'>" + listContents.list.cby +"a partagé sa wishlist avec vous.</div>"
      } else {
        wishlistContentsContainer.innerHTML = "<div class='wishlist__empty heading h3'>La wishlist est vide.</div>";
      }
		} else{
		  console.log("Container not found, Wishlist Page element not found");
		}
  }, function(xhrObj) {
    var wishlistContentsContainer = document.getElementById("wishlist-items-container");
    wishlistContentsContainer.innerHTML = "<div class='wishlist__empty heading h3'>Cette wishlist n'existe pas.</div>";
  });
}

function onAddToCartClick(e) {
	e.preventDefault();
	var productId = e.currentTarget.getAttribute("data-product-id");
	var variantId = e.currentTarget.getAttribute("data-variant-id");
	var du = e.target.getAttribute("data-product-url");
	e.target.innerHTML = "Adding..";
	window._swat.replayAddToCart({
		empi: productId,
		du: du
	}, variantId, function(c) {
		e.target.innerHTML = "Added to Cart";
		e.target.setAttribute("data-state-cart", "swym-added");
		console.log("Successfully added product to cart.", c);
	}, function(e) {
		console.log(e);
	});
}





