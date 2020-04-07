$( document ).ready(function() 
{

getUser();

let database = firebase.database();

function logoutUser()
{
    sessionStorage.clear();
    location.reload();
}

function getUser()
{
    var user = sessionStorage.getItem("user");
    if (user != null)
    {
        document.getElementById("user_login").innerHTML = user.toUpperCase();
        document.getElementById("user_menu").removeAttribute("style");
        document.getElementById("login_menu").remove();
    }
    else
    {

        window.location.replace(window.location.origin + "/e-bazar/index.html");
    }

    checkFood();
}

function loginSuccess(user)
{
    sessionStorage.setItem("user", user.username);
    sessionStorage.setItem("phone", user.phone);
    location.reload();
}

function userNotFound()
{
    let msg = "Please register your account...";
    document.getElementById("warning").innerHTML = `<div class="alert alert-dismissible fade show rounded-0 alert-warning mt-2 mb-n3">
         <button type="button" class="btn-sm close" data-dismiss="alert">&times;</button>
         <small><strong>User not found! </strong> ${ msg } </small>
         </div>`;
}


function checkLogin()
{
    let loginUser = firebase.database().ref('users/' + document.getElementById("username").value);
    loginUser.on('value', function(snapshot)
    {
        if (snapshot.val() == null)
        {
            userNotFound()

        }
        else
        {

            snapshot.val().password == document.getElementById("password").value ? loginSuccess(snapshot.val()) : userNotFound();
        }
    });
}

let exclude = ['brand', 'collectionTime', 'cuisine', 'deliveryFee',
    'desc', 'location', 'maxDeliveryTime', 'minDeliveryTime', 'minOrderForDelivery', 'orderType', 'password', 'phone', 'username'
];

function getUrlVars()
{
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value)
    {
        vars[key] = value;
    });
    return vars;
}

function checkFood()
{
    let userMenu = firebase.database().ref('restaurant/' + getUrlVars()["stall"]);
    userMenu.on('value', function(snapshot)
    {
        let obj = snapshot.val();
        let foodList = document.getElementById("food_list");
        let seller_phone = document.getElementById("seller_phone");
        seller_phone.value = obj.phone;

        foodList.innerHTML = "";

        for (var key in obj)
        {

            if (exclude.indexOf(key) == -1)
            {
                let o = obj[key].menu;

                foodList.insertAdjacentHTML('beforeend',
                    `
                                <div class="col-12 col-md-4 mb-3">
                                  <div class="card rounded-0 shadow">
                                    <div class="card-body">
                                      <div class="row">
                                        <div class="col-10">
                                          <h6 class="card-title shop-item-title">${ o.name.toUpperCase() }</h6>
                                        </div>
                                        <div class="col-2">
                                         <div class="d-flex justify-content-end mt-1"> 
                                         <button class="rounded-0 metarial-button ripple" onclick="addToCartClicked(this)"><i class="fas fa-plus"></i></button>                                             
                                          </div>
                                        </div>
                                      </div>
                                      <p class="card-text"><b><small>MYR <span class="shop-item-price">${o.price}</span></small></b></p>
                                    </div>
                                  </div>
                                </div>
                        `);
            }

        }
    });
}
    
});

let orderAddCount = 0;

function addToCartClicked(event)
{
    let shopItem = event.parentElement.parentElement.parentElement.parentElement;
    let title = shopItem.getElementsByClassName('shop-item-title')[0].innerText;
    let price = parseFloat(shopItem.getElementsByClassName('shop-item-price')[0].innerText);
    let cartQuantity = parseInt($('.cart-quantity-input').val() == "undefined" ? 1 : 0);

    orderAddCount = orderAddCount + 1;
    $('.cart-order-count').text(orderAddCount);

    addItemToCart(title, price);
}

function addItemToCart(title, price)
{
    let cartBodyContainer = document.getElementsByClassName('cart-body')[0];
    let cartItemName = cartBodyContainer.getElementsByClassName('cart-item-title');
    let cartItemQuantity = cartBodyContainer.getElementsByClassName('cart-quantity-input');
    $('.empty-order').remove();

    for (var i = 0; i < cartItemName.length; i++)
    {
        if (cartItemName[i].innerText == title)
        {
            let orderQuantity = parseInt(parseInt(cartItemQuantity[i].value) + parseInt(1));
            cartItemQuantity[i].value = orderQuantity;

            return;
        }
    }

    cartBodyContainer.insertAdjacentHTML('beforeend',
        `
				  <tr class="cart-items">
                      <td class="h6 cart-item-title">${title}</td>
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

    updateCartTotal();
}

function quantityChanged(event)
{
    if (isNaN(event.value) || event.value <= 0)
    {
        event.value = 1;
    }
    updateCartTotal();
}


function writeUserData(orderId, order) {
    firebase.database().ref('order/' + orderId).set({
        details: order
    });
 }


async function confirmClicked()
{
    let cartBodyContainer = document.getElementsByClassName('cart-body')[0];
    let cartFooterContainer = document.getElementsByClassName('cart-footer')[0];
    let titleList = cartBodyContainer.getElementsByClassName('cart-item-title');
    let priceList = cartBodyContainer.getElementsByClassName('cart-price');
    let quantityList = cartBodyContainer.getElementsByClassName('cart-quantity-input');

    $('.cart-order-count').text("0");
    orderAddCount = 0;

    var order = {};

    for (let i = 0; i < titleList.length; i++)
    {
        order[i] = 
        {
        	title: titleList[i].innerText,
        	price: priceList[i].innerText,
        	quantity: quantityList[i].value,
        	total: Math.round((parseFloat(parseFloat(priceList[i].innerText) * parseFloat(quantityList[i].value))) * 100 ) / 100
        };
    }

    order[titleList.length] = 
    {
        total: parseFloat($('.order-total-price').text()),
        deliveryFee: parseFloat($('.order-delivery-fee').text())
    };

    $('.cart-body').html("");
    // $('.cart-footer').html("");
    $('.cart-body').html(
    	`
    	<tr class="empty-order">
    		<td class='text-center p-3' colspan='3'>
    			<img class=" mb-4" src="./img/empty.svg" alt="Card image" width="100%" height="100px">
    			<p>NO ORDER PLACED</p>
    		</td>
    	</tr>
    	`
    );

    let genOrderId =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await writeUserData(genOrderId, order);

    phone = document.getElementById("seller_phone");
    phone = "+6011-51843369"; //dummy

    let orderIdUrl = `https://poxyx.github.io/e-bazar/order.html?orderid=${genOrderId}`;
    let text = `
		E-BAZAR : NEW ORDER,VIEW HERE ${ orderIdUrl }
	`;

	updateCartTotal();

	await $('#cartModal').modal('hide');

    window.location.replace(`https://api.whatsapp.com/send?phone=${ phone }&text=${text}`);
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
    let totalOrder = 0;

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

    if($('.cart-total-price').length != 0 ) 
    {
    	document.getElementsByClassName('cart-total-price')[0].innerText = total;
    	
    	total = total + parseFloat($('.order-delivery-fee').text());

    	document.getElementsByClassName('order-total-price')[0].innerText = total;
    }


}
