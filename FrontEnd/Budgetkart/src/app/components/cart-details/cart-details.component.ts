import {Component, OnInit} from '@angular/core';
import {CartItem} from "../../common/cart-item";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.css'
})
export class CartDetailsComponent implements OnInit
{
  cartItems:CartItem[]=[];
  totalPrice:number=0;
  totalQuantity:number=0;

  constructor(private cartService:CartService) {
  }
  ngOnInit() {
    this.listCartDetails();
  }

  private listCartDetails() {
    // get handle to cart items
    this.cartItems=this.cartService.cartItems;

    // subscribe to totalPrice
    this.cartService.totalPrice.subscribe(
      data=>this.totalPrice=data
    );
    // subscribe to totalQuantity
    this.cartService.totalQuantity.subscribe(
      data=>this.totalQuantity=data
    );

    // compute total price and quantity of Cart
    this.cartService.computeCartTotal();
  }

  incrementQuantity(tempCartItem: CartItem)
  {
    this.cartService.addToCart(tempCartItem);
  }

  decrementQuantity(tempCartItem: CartItem)
  {
    this.cartService.decrementQuantity(tempCartItem);
  }

  remove(tempCartItem: CartItem)
  {
    this.cartService.remove(tempCartItem);
  }
}
