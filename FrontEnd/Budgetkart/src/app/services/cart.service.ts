import { Injectable } from '@angular/core';
import {CartItem} from "../common/cart-item";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService
{
  cartItems:CartItem[]=[];

  // @ts-ignore
    totalPrice:Subject<number> = new BehaviorSubject<number>(0);
  // @ts-ignore
    totalQuantity:Subject<number> = new BehaviorSubject<number>(0);

    storage:Storage=sessionStorage;
  constructor() {
      // @ts-ignore
      let data=JSON.parse(this.storage.getItem('cartItems'));
      if(data!=null)
      {
          this.cartItems=data;
          this.computeCartTotal();
      }
  }

  addToCart(theCartItem:CartItem)
  {
    // check if item is already present in cart
    let alreadyExists:boolean=false;

    // @ts-ignore
    let existingCartItem:CartItem=undefined;

    if(this.cartItems.length>0)
    {
      // @ts-ignore
      existingCartItem=this.cartItems.find(tempCartItems => tempCartItems.id === theCartItem.id)
      alreadyExists=(existingCartItem!=undefined);
    }
    if (alreadyExists) // if item already exists, increase the quantity
      existingCartItem.quantity++;
    else // add item to cart
      this.cartItems.push(theCartItem);

    // compute total price and quantity
    this.computeCartTotal();
  }

  computeCartTotal()
  {
    let totalPriceValue:number=0;
    let totalQuantityValue:number=0;
    for (let currentCartItem of this.cartItems)
    {
      totalPriceValue+=currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue+=currentCartItem.quantity;
    }
    // publish new values
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
    this.logCartData(totalPriceValue,totalQuantityValue);

    this.persistCartItems();
  }
  persistCartItems()
  {
      this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number)
  {
    console.log(`Contents of Cart:`);
    for (let argument of this.cartItems)
    {
      const subTotalPrice = argument.quantity*argument.unitPrice;
      console.log(`Name: ${argument.name}, quantity= ${argument.quantity}, Unit Price= ${argument.unitPrice}`);
    }
    console.log(`Total Price:${totalPriceValue.toFixed(2)}, Total Quantity: ${totalQuantityValue}`);
    console.log('-----');
  }

  decrementQuantity(tempCartItem: CartItem)
  {
    tempCartItem.quantity--;
    if (tempCartItem.quantity===0)
      this.remove(tempCartItem);
    else
      this.computeCartTotal();
  }

  remove(tempCartItem: CartItem)
  {
    const itemIndex=this.cartItems.findIndex(
      theCartItem => theCartItem.id == tempCartItem.id);
    if(itemIndex > -1)
    {
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotal();
    }
  }
}
