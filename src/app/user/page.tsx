"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import HeaderXuchil from "@/components/HeaderXuchil";
import Modal from "@/components/Modal";
import styles from "./User.module.css";

import Excel from "scripts/excel";

const UserProfile = () => {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/users/me", { credentials: "include" });
        if (!response.ok) {
          router.push("/login");
          return;
        }
  
        const authUser = await response.json();
        if (!mounted) return;

        setRole(authUser.isAdmin ? "admin" : "user");
        setUserData({
          name: authUser.worker?.fullName ?? "",
          email: authUser.email,
          phone: authUser.worker?.phone ?? "No especificado",
          avatar: authUser.worker?.profilePhotoUrl ?? "",
          position: authUser.worker?.role?.name ?? "Operador",
          hours: "",
        });
      } catch {
        router.push("/login");
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const confirmLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/login");
  };

//when clicked downloaded excel file of the workers pay based of how much they worked
interface work_info { //transform what the api/process-step-execution returns into this format. this will be passed into another method which
  name: string;       //is the Excel method that creates the excel file
  date: Date;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_pay: number;
  task_name: string;
}
//because process-step-executions is how tasks are recorded which is most likely how there gonna be payed. going to use it to create
// excel sheet for their hours.
const workerHours = async (): Promise<work_info[]> => {
  try {
    const response = await fetch("/api/process-step-executions");


    if (!response.ok) {
      throw new Error("Failed to fetch process step executions");
    }

    const data = await response.json();

    const formatTime = (date: Date) =>
      date.toLocaleString("en-US", {
        month: "short",   
        day: "numeric",   
        year: "numeric", 
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    const transformedData = data.map((item: any) => {
      const worker = item.processStepWorkers?.[0]?.worker;

      const start = new Date(item.startedAt);
      const end = new Date();

      const totalHours = Math.ceil(item.actualDurationMin / 60) 
        

      return {
        name: worker?.name || "",   //this will be going inside of excel method to have downloadable excel file
        date: start,
        start_time: formatTime(start), 
        end_time: formatTime(end),     
        total_hours: Number(totalHours.toFixed(2)),
        total_pay: Number((totalHours * 20).toFixed(2)),
        task_name: `Step ${item.stepId}`,
      };
    });

    

  Excel(transformedData,30)

  
    
  } catch (err) {
    console.log("err", err);
    return [];
  }
};


  
  if (!role || !userData) return null;

  return (
    <div className={`page ${styles.pageWrapper}`}>
      <HeaderXuchil />

      <div className={styles.actionButtonRight}>
        <Button
          size="small"
          action="secondary"
          onClick={() => router.push("/edit_user")}
        >
          Editar
        </Button>
      </div>

      {role === "admin" && (
        <div className={styles.actionButtonLeft}>
          <Button
            size="small"
            action="primary"
            onClick={() => router.push("/create_user")}
          >
            Crear usuario
          </Button>
          <Button
            size="small"
            action="secondary"
            onClick={workerHours}
            style = {{marginLeft: "3px"}}
          >
            worker hours
          
          </Button>
<div style = {{marginTop: "3px"}}>
          <Button
          size = "small"
          action = "secondary"
          onClick = {() => router.push("/analytics")}>
            Analytics
          </Button>
          </div>
        </div>
      )}

      <div className={styles.headerContainer}>
        <h1>Perfil de usuario</h1>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.profileCard}>
          <img
            className={styles.avatar}
            src={userData.avatar || "/globe.svg"}
            alt="Avatar del usuario"
          />

          <h2 className={styles.profileName}>{userData.name}</h2>
          <p className={styles.profilePosition}>{userData.position}</p>
          <p className={styles.profileHours}>{userData.hours}</p>

          <div className={styles.infoGroup}>
            <p className={styles.infoLabel}>Correo electrónico:</p>
            <p className={styles.infoValue}>{userData.email}</p>

            <p className={styles.infoLabel}>Teléfono:</p>
            <p className={styles.infoValue}>{userData.phone}</p>
          </div>
        </div>

        <div className={styles.logoutWrapper}>
          <Button
            size="regular"
            action="negative"
            onClick={() => setShowLogoutModal(true)}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>

      <Modal
        open={showLogoutModal}
        title="¿Cerrar sesión?"
        message="Esto cerrará tu sesión actual. ¿Deseas continuar?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        danger
      />
    </div>
  );
};

export default UserProfile;