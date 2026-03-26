"use client"

import styles from "./dashboard.module.css";
import { Pie, PieChart, Sector,PieSectorShapeProps } from 'recharts';
import type { LabelProps } from 'recharts';

// #region Sample data -----------------------------
const data = [
    { value: 1 },
    { value: 2 },
    { value: 1 },
  ];
  
// from group C to group A  (left to right)
const COLORS = [ '#efd0ca', '#FFB133', '#5C7457'];
const LABELS = ['Over Time', 'On Time', 'Under Time'];

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
            <PieChart style={{ width: '100%', maxHeight: '200px', aspectRatio: 1.75, 
                    margin: '0 auto' }}
                responsive>  
                <Pie
                    data={data}                         // will need to change to schema (where it is sourcing data from)
                    dataKey="value"                     // what data is refrenced to make chart
                    cx="50%"
                    cy="90%"
                    innerRadius="90%"
                    outerRadius="150%"
                    startAngle={180}
                    endAngle={0}
                    shape={MyCustomPie}                 // the colors
                />
            </PieChart>
            <CustomLegend/>
        </div>
    );
}