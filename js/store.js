

function addToCartClicked(event)
{
	let shopItem = event.parentElement.parentElement.parentElement.parentElement;
	let title = shopItem.getElementsByClassName('shop-item-title')[0].innerText;
	let price = parseFloat(shopItem.getElementsByClassName('shop-item-price')[0].innerText);

	addItemToCart(title,price);
}

function addItemToCart(title,price)
{
	let cartBodyContainer = document.getElementsByClassName('cart-body')[0];
	cartBodyContainer.insertAdjacentHTML('beforeend', 
			`
				  <tr class="cart-items">
                      <td class="h6">${title}</td>
                      <td><span class="cart-price">${price}</span></td>
                      <td>
                        <div class="row">
                          <div class="col-8">
                             <input type="number" onchange="quantityChanged(this)" value="1" class="cart-quantity-input form-control">
                          </div>
                          <div class="col-4">
                           <a href="javascript:void(0)" onclick="removeCartItem(this)"><i class="text-danger fas fa-trash-alt fa-xs"></i></a>
                          </div>
                        </div>
                      </td>
                    </tr>

			`
		);
}

function quantityChanged(event)
{
    if (isNaN(event.value) || event.value <= 0)
    {
        event.value = 1;
    }
    updateCartTotal();
}

function log(data)
{
    console.log(data)
};


function removeCartItem(event)
{
    event.parentElement.parentElement.parentElement.parentElement.remove();
    updateCartTotal();
}

function updateCartTotal()
{
    let cartItemContainer = document.getElementsByClassName('cart-items');

    let total = 0;

    for (let i = 0; i < cartItemContainer.length; i++)
    {
        let cartRow = cartItemContainer[i];
        let priceElement = cartRow.getElementsByClassName('cart-price')[0];
        let quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0];
        let price = parseFloat(priceElement.innerText.replace('RM', ''));
        let quantity = quantityElement.value;

        total = total + (price * quantity);
    }

    total = Math.round(total * 100) / 100;
    document.getElementsByClassName('cart-total-price')[0].innerText = total;
}