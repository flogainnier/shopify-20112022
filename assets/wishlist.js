var productCardMarkup = 
       `<div class="product-list__inner">
          {{#products}}
          <product-item class="product-item">
            <div class="product-item__image-wrapper">
              <a href="{{du}}" aria-label="{{dt}}" class="product-item__aspect-ratio aspect-ratio" style="padding-bottom: 125.0%; --aspect-ratio: 0.8">
                <button id="swym-remove-productBtn" aria-label="Delete" data-variant-id="{{epi}}" data-product-id="{{empi}}" class="swym-delete-btn swym-nav swym-nav-1 swym-is-button">
                   <svg focusable="false" width="14" height="14" viewBox="0 0 14 14">
                    <path d="M13 13L1 1M13 1L1 13" stroke="currentColor" stroke-width="1.5" fill="none"></path>
                   </svg>
                </button>
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
	// Get wishlist items
	swat.fetch(function(products) {
		var wishlistContentsContainer = document.getElementById("wishlist-items-container");
		var formattedWishlistedProducts = products.map(function(p) {
			p = SwymUtils.formatProductPrice(p); // formats product price and adds currency to product Object
			p.isInCart = _swat.platform.isInDeviceCart(p.epi) || (p.et == _swat.EventTypes.addToCart);
			p.variantinfo = (p.vi ? getVariantInfo(p.vi) : "");
			return p;
		});
		var productCardsMarkup = SwymUtils.renderTemplateString(productCardMarkup, {
			products: formattedWishlistedProducts
		});
		if(wishlistContentsContainer){
            if (products.length > 0) {
              wishlistContentsContainer.innerHTML = productCardsMarkup;
              document.getElementById("toggle-wishlist-button").classList.remove("hidden")
      		  attachClickListeners();
            } else {
              document.getElementById("toggle-wishlist-button").classList.add("hidden")
              wishlistContentsContainer.innerHTML = "<div class='wishlist__empty heading h3'>Votre wishlist est vide.</div>";
            }
		} else{
		  console.log("Container not found, Wishlist Page element not found");
		}
	});
  if (document.getElementById("copyLink")) {
    swat.generateSharedListURL(
      null,
      function(data, sharedListId) {
        document.getElementById("copyLink").value = data;
        document.getElementById("share-lid").value = sharedListId;
        document.getElementById("copyLink").classList.add("is-filled")
      }
    );
  }
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

function attachClickListeners() {
	var addToCartButtons = document.querySelectorAll("#swym-custom-add-toCartBtn");
	var removeBtns = document.querySelectorAll("#swym-remove-productBtn");
    var shareForm = document.querySelector("#share-wishlist-form");
	//   Add to cart Btns
	for (var i = 0; i < addToCartButtons.length; i++) {
		addToCartButtons[i].addEventListener('click', onAddToCartClick, false);
	}
	//   Remove Buttons
	for (var k = 0; k < removeBtns.length; k++) {
		removeBtns[k].addEventListener('click', onRemoveBtnClick, false);
	}
    //   Share by Email
    if (shareForm) {
    	shareForm.addEventListener('submit', onShareFormSubmit, false);
    }
}

function onRemoveBtnClick(e) {
	e.preventDefault();
	var epi = +e.currentTarget.getAttribute("data-variant-id");
	var empi = +e.currentTarget.getAttribute("data-product-id");
	window._swat.fetch(function(products) {
		products.forEach(function(product) {
			if (epi && empi && product.epi == epi && product.empi == empi) {
				window._swat.removeFromWishList(product, function() {
					if (!window.SwymCallbacks) {
						window.SwymCallbacks = [];
					}
					window.SwymCallbacks.push(swymRenderWishlist);
				});
			}
		});
	})
}

function onShareFormSubmit(e) {
	e.preventDefault();
  var data = new FormData(document.querySelector("#share-wishlist-form"))
  try {
    window._swat.sendListViaEmail(
    {
      toEmailId: document.getElementById("share-email").value,
      fromName: document.getElementById("share-sender").value,
      note: document.getElementById("share-message").value,
      lid: document.getElementById("share-lid").value,
    },
    function(r) {
      document.getElementById("share-wishlist-form").classList.add("hidden")
      document.getElementById("share-form").innerHTML = "Votre email a bien été envoyé.";
      document.getElementById("share-wishlist-form").reset();
      setTimeout(() => {
        document.getElementById("share-form").innerHTML = "";
        document.getElementById("share-wishlist-form").classList.remove("hidden")
      }, 5000);
    },
    function(r) {
      document.getElementById("share-wishlist-form").classList.add("hidden")
      document.getElementById("share-form").innerHTML = "Oups! Une erreur est survenue!";
      document.getElementById("share-wishlist-form").reset();
      setTimeout(() => {
        document.getElementById("share-form").innerHTML = "";
        document.getElementById("share-wishlist-form").classList.remove("hidden")
      }, 3000);
    });	
  } catch (error) {
    document.getElementById("share-wishlist-form").classList.add("hidden")
    document.getElementById("share-form").innerHTML = "Oups! Une erreur est survenue!";
    document.getElementById("share-wishlist-form").reset();
    setTimeout(() => {
      document.getElementById("share-form").innerHTML = "";
      document.getElementById("share-wishlist-form").classList.remove("hidden")
    }, 3000);
  }
}