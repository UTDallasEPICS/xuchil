"use client"

import styles from "./dashboard.module.css";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import type { LabelProps } from 'recharts';

/* Review and modify !!!!!!!!!!!!!!!!
*/


// Single row of data — each key is one section of the bar
const data = [
    { notStarted: 1, pending: 8, completed: 12 }
];

// can change into total of "totalSteps" from PendingTask
const total = data[0].notStarted + data[0].pending + data[0].completed;

const COLORS = {
    notStarted: '#c1bcac',   // --color-gray-light
    pending:    '#979b8d',   // --color-gray-dark
    completed:  '#5c7457',   // --color-green-light
};

const LABELS = {
    notStarted: 'Not Started',
    pending:    'Pending',
    completed:  'Completed',
};

type CenteredLabelProp = LabelProps & { dataKey?: string; };

function CenteredLabel(props: CenteredLabelProp) {
    const { x, y, width, height, value, index, dataKey } = props;

    if ((width as number) < 10) return null;

    const actualValue = data[index as number]?.[dataKey as keyof typeof data[0]];

    return (
        <text
            x={(x as number) + (width as number) / 2}
            y={(y as number) + (height as number) / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-text-light)"
            fontWeight="600"
            fontSize={14}
        >
            {actualValue}
        </text>
    );
}

const CustomLegend = () => (
    <div className={styles.legend} style={{ margin: '20px auto' }} >
        {Object.entries(COLORS).map(([key, color]) => (
            <div key={key} className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: color }} />
                <span className={styles.legendtext}>{LABELS[key as keyof typeof LABELS]}</span>
            </div>
        ))}
    </div>
);

export default function TasksDashboard() {
    return(
        <div>
            <BarChart data={data} layout="vertical"
                style={{ margin: '10px auto 0', height: '80px', width: '100%', maxWidth: '300px', }}
                responsive  
            >
                <XAxis type="number" hide domain={[0, total]} /> 
                <YAxis type="category" hide />

                {/* Each Bar is one section — same stackId stacks them together */}
                <Bar dataKey="notStarted" stackId="tasks" fill={COLORS.notStarted} radius={[6, 0, 0, 6]}>
                    <LabelList content={<CenteredLabel />} />
                </Bar>

                <Bar dataKey="pending" stackId="tasks" fill={COLORS.pending}>
                    <LabelList content={<CenteredLabel />} />
                </Bar>

                {/* Last bar gets rounded right corners to match the image */}
                <Bar dataKey="completed" stackId="tasks" fill={COLORS.completed} radius={[0, 6, 6, 0]}>
                    <LabelList content={<CenteredLabel />} />
                </Bar>
            </BarChart>

            <CustomLegend />
        </div>
    );
}