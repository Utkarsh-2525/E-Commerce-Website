import {Component, OnInit} from '@angular/core';
import {Product} from "../../common/product";
import {ProductService} from "../../services/product.service";
import {ActivatedRoute} from "@angular/router";
import {CartService} from "../../services/cart.service";
import {CartItem} from "../../common/cart-item";

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit
{
  // @ts-ignore
  // product:Product=new Product();
  product!:Product;
  constructor(private productService:ProductService,
              private cartService:CartService,
              private route: ActivatedRoute){}

  ngOnInit() {
    this.route.paramMap.subscribe(()=>{
      this.handleProductDetails();
    })
  }

  handleProductDetails() {
    // @ts-ignore
    const theProductId: number=+this.route.snapshot.paramMap.get('id');
    this.productService.getProduct(theProductId).subscribe(
      data=>{
        this.product=data;
      }
    )
  }

  addToCart()
  {
    console.log(`Adding to Cart: ${this.product.name}, ${this.product.unitPrice}`);
    const theCartItem=new CartItem(this.product);
    this.cartService.addToCart(theCartItem);

  }
}
