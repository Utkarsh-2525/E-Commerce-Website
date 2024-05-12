import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";
import {ActivatedRoute} from "@angular/router";
import {log} from "node:util";
import {CartItem} from "../../common/cart-item";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit
{
  products:Product[]=[];
  currentCategoryId:number=1;
  previousCategoryId: number=1;
  searchMode:boolean=false;

  // properties for pagination
  thePageNumber:number=1;
  thePageSize:number=5;
  theTotalElements:number=0;

  previousKeyword:string="";
  constructor(private productService:ProductService,
              private cartService:CartService,
              private route:ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }
  listProducts(){
    this.searchMode=this.route.snapshot.paramMap.has('keyword');
    if (this.searchMode)
      this.handleSearchProducts();
    else
      this.handleListProducts();
  }
  handleListProducts()
  {
    // check if id parameter is available
    const hasCategoryId:boolean = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) // convert the parameter to string
      this.currentCategoryId=+this.route.snapshot.paramMap.get('id')!;
    else
      this.currentCategoryId=1;

    if (this.previousCategoryId!=this.currentCategoryId)
      this.thePageNumber=1;

    this.previousCategoryId=this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

    this.productService.getProductListPaginate(this.thePageNumber-1,
                                                this.thePageSize,this.currentCategoryId).subscribe(this.processResults());
  }

  private handleSearchProducts() {
    const theKeyword:string = this.route.snapshot.paramMap.get('keyword')!;

    if (this.previousKeyword!=theKeyword)
      this.thePageNumber=1;

    this.previousKeyword=theKeyword;

    console.log(`Keyword=${theKeyword}, PageNumber=${this.thePageNumber}`);

    this.productService.searchProductsPaginate(this.thePageNumber-1,
                                               this.thePageSize,
                                               theKeyword).subscribe(this.processResults());
  }
  // protected readonly Math = Math;
  updatePageSize(pageSize: string)
  {
    this.thePageSize=+pageSize;
    this.thePageNumber=1;
    this.listProducts();
  }

  processResults() {
    return (data:any)=>{
      this.products=data._embedded.products;
      this.thePageNumber=data.page.number+1;
      this.thePageSize=data.page.size;
      this.theTotalElements=data.page.totalElements;
    };
  }

  addToCart(tempProducts: Product)
  {
    console.log(`Adding to Cart: ${tempProducts.name}, ${tempProducts.unitPrice}`);
    const theCartItem=new CartItem(tempProducts);
    this.cartService.addToCart(theCartItem);
  }
}
