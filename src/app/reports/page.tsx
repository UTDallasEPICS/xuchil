import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import AnnualReportDownload from "@/components/AnnualReportDownload";
import styles from "./Reports.module.css";

export default async function ReportsPage() {
    const payload = await verifySession();

    //Not logged in
    if (!payload) {
        redirect("/login");
    }

    //Logged in, but not an administrator
    if (!payload.isAdmin) {
        redirect("/user");
    }

    return (
        <div className={`${styles.wrapper} page`}>
            <h1 className={styles.title}>
                Reportes
            </h1>

            <AnnualReportDownload />
        </div>
    );
}