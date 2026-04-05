"use client"
import React from 'react'
import { useState,useMemo,useEffect } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

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

type FilterType = "monthly" | "weekly" | "today";


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

export default function Analytics() {
  const [chartFilter, setChartFilter] = useState<FilterType>("today");

  const [chartOrders, setChartOrders] = useState<OrderPoint[]>([])
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([])
  
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
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "20px 0",
        fontFamily: "Arial, sans-serif",
      }}
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
        <h2
          style={{
            margin: "0 0 20px",
            fontSize: "22px",
            fontWeight: 500,
            color: "#222",
          }}
        >
          Analytics
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              flex: 1,
              backgroundColor: "#e8dddd",
              borderRadius: "24px",
              padding: "18px 16px",
              minHeight: "110px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img src = "/signal.png" width = {50} height = {50}/>
            <div style={{ fontSize: "17px", fontWeight: 500, color: "#222" }}>
              {totalOrders}
            </div>
            <div style={{ fontSize: "15px", color: "#333" }}>total orders</div>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: "#e8dddd",
              borderRadius: "24px",
              padding: "18px 16px",
              minHeight: "110px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img src = "/small-zigzag-arrow-upward.png" width = {50} height = {50}/>
            <div style={{ fontSize: "17px", fontWeight: 500, color: "#222" }}>
              {averageOrders}
            </div>
            <div style={{ fontSize: "15px", color: "#333" }}>avg daily orders</div>
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
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
      <div
        style={{
          textAlign: "center",
          marginTop: "12px",
          fontSize: "14px",
          color: "#444",
        }}
      >
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
      </div>
    </div>
  );
};


