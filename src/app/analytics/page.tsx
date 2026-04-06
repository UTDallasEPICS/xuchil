"use client"
import React from 'react'
import { useState,useMemo,useEffect } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import "./Inventory.css";
//this page fetches analytics from orders table. gives trending items(most sold items in the past week, month, day), provides visuals on delivered orders
interface OrderPoint {
  date: string;
  orderCount: number;
}

interface TrendingItem {
  id: number;
  name: string;
//   date: string;
  orders: number;
  image: string;
}

interface RawOrder {
    addressText: string | null
    clientName: string
    consignmentPartner: string | null
    createdByUserId: string | null
    deliveredAt: string
    deliveryDate: string
    deliveryVariant: string
    id: number
    notes: string | null
    orderItems: unknown[]
    status: string
  }


    interface RawInventory_lot {
      id: number;
      inventoryItemId: number;
      lotCode: string;
      qtyOnHand: string; 
      receivedAt: string; 
      expiryAt: string | null; 
      unitId: number;
    }

  interface expiringItems { //going to be used for both expiring and inventory since it follows same format
    name: string,
    daysLeft: number, 
    quantity: number
  }

type FilterType = "monthly" | "weekly" | "today";

//these 4 methods used to transform raw data

  //turns rawOrder interface into usable data
const transformOrders = (orders: RawOrder[], filterType: FilterType): OrderPoint[] => {
    const grouped: Record<string, number> = {}
    const today = new Date()
  
    orders.forEach((order) => {
      if (order.status !== "DELIVERED") return
      if (!order.deliveredAt) return
  
      const deliveredDate = new Date(order.deliveredAt)
      const diffTime = today.getTime() - deliveredDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
      if (filterType === "today") {
        const sameDay =
          deliveredDate.getDate() === today.getDate() &&
          deliveredDate.getMonth() === today.getMonth() &&
          deliveredDate.getFullYear() === today.getFullYear()
  
        if (!sameDay) return
  
        const hour = deliveredDate.getHours().toString().padStart(2, "0") + ":00"
        grouped[hour] = (grouped[hour] || 0) + 1
      }
  
      if (filterType === "weekly") {
        if (diffDays > 7 || diffDays < 0) return
  
        const label = deliveredDate.toISOString().split("T")[0]
        grouped[label] = (grouped[label] || 0) + 1
      }
  
      if (filterType === "monthly") {
        if (diffDays > 30 || diffDays < 0) return
  
        const label = deliveredDate.toISOString().split("T")[0]
        grouped[label] = (grouped[label] || 0) + 1
      }
    })
  
    return Object.entries(grouped).map(([date, orderCount]) => ({
      date,
      orderCount,
    }))
  }
  
  //turns rawOrder interface into usable data for trends interface
  const transformTrendingItems = (orders: RawOrder[], filterType: FilterType): TrendingItem[] => {
    const grouped: Record<number, number> = {}
    const today = new Date()
  
    orders.forEach((order) => {
      if (order.status !== "DELIVERED") return
      if (!order.deliveredAt) return
  
      const deliveredDate = new Date(order.deliveredAt)
      const diffTime = today.getTime() - deliveredDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
      if (filterType === "today") {
        const sameDay =
          deliveredDate.getDate() === today.getDate() &&
          deliveredDate.getMonth() === today.getMonth() &&
          deliveredDate.getFullYear() === today.getFullYear()
  
        if (!sameDay) return
      }
  
      if (filterType === "weekly") {
        if (diffDays > 7 || diffDays < 0) return
      }
  
      if (filterType === "monthly") {
        if (diffDays > 30 || diffDays < 0) return
      }
  
      order.orderItems.forEach((item) => {    //for quantity adding
        grouped[item.productVariantId] =
          (Number(grouped[item.productVariantId]) || 0) + Number(item.quantity)
      })
    })
  
    return Object.entries(grouped)
      .map(([id, quantity]) => ({
        id: Number(id),
        name: `Product Variant ${id}`, //update to actual name once integrations are completed
        // date: today.toISOString().split("T")[0],
        orders: quantity,
        image: "/placeholder.png", //use actual image as well 
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4) 
  }

  //method to get items that are about to expire 5 days or already expired
  const transform_to_expiring = (
    inventory: RawInventory_lot[]
  ): expiringItems[] => {
    const today = new Date();
  
    return inventory
      .filter((item) => {
        if (!item.expiryAt) return false;
  
        const expiry = new Date(item.expiryAt);
        const diffTime = expiry.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
        return daysLeft <= 5; 
      })
      .map((item) => {
        const expiry = new Date(item.expiryAt!);
        const diffTime = expiry.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
        return {
          name: item.lotCode,
          daysLeft,
          quantity: Number(item.qtyOnHand),
        };
      });
  };
//method to get items that are low in quantity or already ran out
  const transformLowStock = (
    inventory: RawInventory_lot[]
  ): expiringItems[] => {
    const today = new Date();
  
    return inventory
      .filter((item) => {
        const qty = Number(item.qtyOnHand);
        return qty <= 50; // low stock condition
      })
      .map((item) => {
        let daysLeft = 0;
  
        if (item.expiryAt) {
          const expiry = new Date(item.expiryAt);
          const diffTime = expiry.getTime() - today.getTime();
          daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
  
        return {
          name: item.lotCode,
          daysLeft,
          quantity: Number(item.qtyOnHand),
        };
      });
  };


export default function Analytics() {
  const [chartFilter, setChartFilter] = useState<FilterType>("today");

  const [chartOrders, setChartOrders] = useState<OrderPoint[]>([])
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([])

  
//menu that clicks for expiring and stock buttons. going to show items that are expring soon or about to run out of quanttiy
  const [openModal, setOpenModal] = useState<'expiry' | 'stock' | null>(null)

  const [expiringItems,setExpiringItems] = useState<expiringItems[]>([])
  const[lowStockItems,setLowStockItems] = useState<expiringItems[]>([])

  

  //one single api call
  useEffect(() => { 

    const inventory_lot = async () => { 
    try { 

      const response = await fetch("api/inventory")

      const data = await response.json()

      const expiring = transform_to_expiring(data).sort(
        (a, b) => a.daysLeft - b.daysLeft);
      
      setExpiringItems(expiring)

      const low_qty = transformLowStock(data).sort((a,b) => a.quantity - b.quantity)

      setLowStockItems(low_qty)


    }
    catch(err) { 

      console.log("error",err)
    }

  }
  inventory_lot()


  },[])
  
//gonna be api call everytime user clicks today,weekly, monthly(update maybe if app grows large)
  useEffect(() => {

    const OrderInfo = async (): Promise<void> => {
  
      try {
  
        const response = await fetch("/api/orders")
  
        const rawOrders: RawOrder[] = await response.json()
  
        const transformed = transformOrders(rawOrders,chartFilter)

        const sorted = transformed.sort((a, b) => new Date(a.date) - new Date(b.date)) //sorts by date
        
        const trend = transformTrendingItems(rawOrders,chartFilter)
        setChartOrders(sorted)
        setTrendingItems(trend)
        
    
      } catch (err) {
        console.log("error", err)
      }
  
    }
  
    OrderInfo()
  
  }, [chartFilter])



  const totalOrders = useMemo(() => {
    return chartOrders.reduce((sum, item) => sum + item.orderCount, 0);
  }, [chartOrders]);

  
  const averageOrders = useMemo(() => {
    if (chartOrders.length === 0) return 0;
  
    if (chartFilter === "today") {
      return totalOrders; // already per day
    }
  
    if (chartFilter === "weekly") {
      return Math.ceil(totalOrders / 7);
    }
  
    if (chartFilter === "monthly") {
      return Math.ceil(totalOrders / 30);
    }
  
    return 0;
  }, [chartOrders, totalOrders, chartFilter]);

  
  const chartData = chartOrders.length > 0
  ? chartOrders.map((point) => ({ //points for the graph
      date: point.date,
      count: point.orderCount
    }))
  : [{ date: "", count: 0 }]

  const emptyChartMessage = 
  chartFilter === "today"
    ? "no orders this past day"
    : chartFilter === "weekly"
    ? "no orders this past week"
    : "no orders this past month"

  //css for the monthly,today, and weekly button
  const getPillStyle = (active: boolean): React.CSSProperties => ({
    border: "none",
    borderRadius: "999px",
    padding: "6px 14px",
    fontSize: "14px",
    cursor: "pointer",
    backgroundColor: active ? "#000" : "#e8dddd",
    color: active ? "#fff" : "#222",
    transition: "0.2s ease",
  });

  return (
    <div
     className='page'
    >
      <div
        style={{
          width: "100%",
          maxWidth: "390px",
          minHeight: "100vh",
          backgroundColor: "#f6eded",
          padding: "20px 16px 28px",
          boxSizing: "border-box",
        }}

      >
        <h2 className='title'>Analytics</h2>

        <div className = "card-row">
          <div className = "card">
            <img src = "/signal.png" width = {50} height = {50}/>
            <div className = "card-value">
              {totalOrders}
            </div>
            <div className = "card-label">total orders</div>
          </div>

          <div
           className = 'card'
          >
            <img src = "/small-zigzag-arrow-upward.png" width = {50} height = {50}/>
            <div className = "card-value">
              {averageOrders}
            </div>
            <div className = "card-label">avg {chartFilter} orders</div>
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <div className = "chart-header">
            <h3 className = "section-title">
              chart orders
            </h3>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={getPillStyle(chartFilter === "monthly")}
                onClick={() => setChartFilter("monthly")}
              >
                monthly
              </button>
              <button
                style={getPillStyle(chartFilter === "weekly")}
                onClick={() => setChartFilter("weekly")}
              >
                weekly
              </button>
              <button
                style={getPillStyle(chartFilter === "today")}
                onClick={() => setChartFilter("today")}
              >
                today
              </button>
            </div>
          </div>

          <div>
{/* import chart from recharts */}
    <LineChart style={{ width: '100%', aspectRatio: 1.618, maxWidth: 800, margin: 'auto' }} responsive data={chartData}>
           
      <CartesianGrid stroke="var(--color-border-3)" strokeDasharray="5 5" />
      <XAxis dataKey="date" stroke="var(--color-text-3)" />
      <YAxis width="auto" stroke="var(--color-text-3)" tickFormatter={(value) => value} />
      <Line
        type="monotone"
        dataKey="count" 
        stroke="var(--color-green-light)"
        dot={{
          fill: 'var(--color-surface-base)',
        }}
        activeDot={{
          stroke: 'var(--color-surface-base)',
        }}
      />
    </LineChart>

    {chartOrders.length === 0 && (
      <div className = "empty-message">
        {emptyChartMessage}
      </div>
    )}

          </div>   
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 500,
                color: "#222",
              }}
            >
              Trending Items
            </h3>

          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {trendingItems.length === 0 ? (
              <div style={{ fontSize: "14px", color: "#444" }}>
                no trending items
              </div>
            ) : (
              trendingItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#f6eded",
                    borderBottom: "2px solid #222",
                    paddingBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />

                    <div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 500,
                          color: "#222",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.name}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#222",
                      }}
                    >
                      {item.orders} units
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


        {/* this where more metrics such as expiring items will appear as well as other things like items on low quanttiy */}
        <div className="inventory-container">
  
  <h2 className="inventory-title">Inventory</h2>
  <div className="card-row">
    
    <div
      className="card"
      onClick={() => setOpenModal("expiry")}
    >
      
      <img src = "/expired.png" width = {30} height = {30} className="card-icon"/>
      <div className="card-count">{expiringItems.length}</div>
      <div className="card-label">expiring soon</div>
    </div>

    <div
      className="card"
      onClick={() => setOpenModal("stock")}
    >
      <img src = "/boxes.png" width = {30} height = {30} className="card-icon"/>
      <div className="card-count">{lowStockItems.length}</div>
      <div className="card-label">low stock</div>
    </div>

  </div>
  {openModal && (
    <div className="overlay">
      <div className="modal">
        
        <div className="modal-header">
          <h3>
            {openModal === "expiry"
              ? "Expiring Items"
              : "Low Stock Items"}
          </h3>
          <button
            className="close-btn"
            onClick={() => setOpenModal(null)}
          >
            X
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
    <th>Days Left</th>
              <th>Quantity</th>
            </tr>
          </thead>

          <tbody>
            {(openModal === "expiry"
              ? expiringItems
              : lowStockItems
            ).map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
    
                  <td>{item.daysLeft}</td>
             
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  )}
</div>



      </div>
    </div>
  );
};


