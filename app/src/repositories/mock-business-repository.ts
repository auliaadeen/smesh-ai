import type {
  Product, Sale, TodaySales, TodayProductSales, SalesComparison, BestSeller,
  InventoryAlert, ProductPerformance, Inventory, ProductStatus,
} from "@/types/business";
import type { BusinessRepository } from "@/repositories/business-repository";
import { PRODUCTS } from "@/data/products";
import { INVENTORY } from "@/data/inventory";
import { SALES, TODAY } from "@/data/sales";
import { sumRevenue, sumUnits, countOrders, calculateGrowth, calculateSalesVelocity, calculateReorderQuantity, classifyUrgency, isLowStock, rankBestSellers, buildProductPerformance } from "@/lib/analytics";
import { findProduct, buildProductStatus } from "@/lib/productLookup";

const TRAILING_WINDOW_DAYS = 7;
function pad(n:number){return String(n).padStart(2,"0");}
function shiftDate(dateStr:string,deltaDays:number){const [y,m,d]=dateStr.split("-").map(Number);const x=new Date(Date.UTC(y,m-1,d)+deltaDays*86400000);return `${x.getUTCFullYear()}-${pad(x.getUTCMonth()+1)}-${pad(x.getUTCDate())}`;}
function salesOn(date:string){return SALES.filter(s=>s.soldAt===date);}
function salesBetween(start:string,end:string){return SALES.filter(s=>s.soldAt>=start&&s.soldAt<=end);}
const productName=new Map(PRODUCTS.map(p=>[p.id,p.name]));

export class MockBusinessRepository implements BusinessRepository {
  async getTodaySales():Promise<TodaySales>{const rows=salesOn(TODAY);return{date:TODAY,revenue:sumRevenue(rows),orders:countOrders(rows),unitsSold:sumUnits(rows)};}
  async getTodayProductSales(limit=50):Promise<TodayProductSales[]>{const grouped=new Map<string,TodayProductSales>();for(const s of salesOn(TODAY)){const x=grouped.get(s.productId);if(x){x.unitsSold+=s.quantity;x.revenue+=s.revenue;}else grouped.set(s.productId,{productId:s.productId,productName:productName.get(s.productId)??s.productId,unitsSold:s.quantity,revenue:s.revenue});}return[...grouped.values()].sort((a,b)=>b.unitsSold-a.unitsSold||b.revenue-a.revenue).slice(0,Math.max(0,limit));}
  async getSalesComparison():Promise<SalesComparison>{const prev=shiftDate(TODAY,-7);const currentRevenue=sumRevenue(salesOn(TODAY));const previousRevenue=sumRevenue(salesOn(prev));return{currentRevenue,previousRevenue,growthPercentage:calculateGrowth(currentRevenue,previousRevenue),comparisonPeriod:`hari yang sama minggu lalu (${prev})`};}
  async getBestSellers(limit=5):Promise<BestSeller[]>{const start=shiftDate(TODAY,-(TRAILING_WINDOW_DAYS-1));return rankBestSellers(salesBetween(start,TODAY),PRODUCTS,limit);}
  async getInventorySnapshot():Promise<Inventory[]>{return INVENTORY;}
  async getInventoryAlerts():Promise<InventoryAlert[]>{const start=shiftDate(TODAY,-(TRAILING_WINDOW_DAYS-1));return INVENTORY.filter(isLowStock).map(inv=>{const recent=SALES.filter(s=>s.productId===inv.productId&&s.soldAt>=start&&s.soldAt<=TODAY);return{productId:inv.productId,productName:productName.get(inv.productId)??inv.productId,currentStock:inv.stock,minimumStock:inv.minimumStock,salesVelocity:calculateSalesVelocity(sumUnits(recent),TRAILING_WINDOW_DAYS),recommendedReorder:calculateReorderQuantity(inv),urgency:classifyUrgency(inv)};}).sort((a,b)=>({critical:0,warning:1,normal:2}[a.urgency]-({critical:0,warning:1,normal:2}[b.urgency])||a.currentStock-b.currentStock));}
  async getProducts():Promise<Product[]>{return PRODUCTS;}
  async getProductPerformance(productId?:string):Promise<ProductPerformance[]>{const currentStart=shiftDate(TODAY,-6);const previousEnd=shiftDate(TODAY,-7);const previousStart=shiftDate(TODAY,-13);const performance=buildProductPerformance(salesBetween(currentStart,TODAY),salesBetween(previousStart,previousEnd),PRODUCTS);return productId?performance.filter(p=>p.productId===productId):performance;}
  async getDailyRevenueSeries(days=14):Promise<{date:string;revenue:number}[]>{const series=[];for(let i=days-1;i>=0;i--){const date=shiftDate(TODAY,-i);series.push({date,revenue:sumRevenue(salesOn(date))});}return series;}
  async getProductStatus(query:string):Promise<ProductStatus|null>{const product=findProduct(query,PRODUCTS);return product?buildProductStatus(product,INVENTORY):null;}
}
export const mockBusinessRepository=new MockBusinessRepository();
