"use client"

import styles from "./dashboard.module.css";
import { Pie, PieChart, Sector,PieSectorShapeProps, Label, ResponsiveContainer, Legend } from 'recharts';
import type { LabelProps } from 'recharts';

// #region Sample data -----------------------------
const data = [
    // IF DOING PERCENTS: 50, 90, 100
    // why? if worker has one of each then will = 80%
    { name: "Over Time",  value: 1 },     
    { name: "On Time",    value: 10 },     
    { name: "Under Time", value: 7 },
  ];

// from group C to group A  (left to right)
const COLORS = [ '#efd0ca', '#FFB133', '#5C7457'];
const LABELS = ['Tarde', 'A tiempo', 'Temprano'];

const MyCustomPie = (props: PieSectorShapeProps) => {
    return <Sector {...props} fill={COLORS[props.index]} />;
};
    
// fix later? i think gap can be changed into flex box attributes
const CustomLegend = () => (
    <div className={styles.legend} style={{ marginBottom: '15px' }}>
        {COLORS.map((color, index) => (
            <div key={index} className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: color }} />
                <span className={styles.legendtext}>{LABELS[index]}</span>
            </div>
        ))}
    </div>
);

export default function ProductivityDashboard() { 
    return(
        <div>
            <PieChart style={{ width: '100%', maxWidth: '500px', aspectRatio: 1.75, 
                    margin: '0 auto' 
                }}
                responsive={true}
            >  
                <Pie
                    data={data}                         // will need to change to schema (where it is sourcing data from)
                    dataKey="value"                     // what data is refrenced to make chart
                    cx="50%"
                    cy="85%"
                    innerRadius="70%"
                    outerRadius="130%"
                    startAngle={180}
                    endAngle={0}
                    shape={MyCustomPie}                 // the colors
                    // for the number per pie slice
                    label
                >
                    <Label
                        dy={40}
                        fontSize="200%"
                        fontWeight={300}
                        position="center"
                        //className={styles.insideLabel}        Not working grr
                    // sizing/centering problem b/c of responsive, to solve make piechart size constant
                    // but to what size should it be constant for?
                    >
                        100%
                    </Label>
                </Pie>
            </PieChart>
            <CustomLegend/>
        </div>
    );
}