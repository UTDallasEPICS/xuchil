"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Calendar, Clock, User, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import FilterButton from "@/components/FilterButton";
import {
  monthFilterOptions,
  productFilterOptions,
  userFilterOptions,
} from "@/constants/filterOptions";
import { fetchMyTasks, fetchProcessRuns } from "@/app/api/logbook";
import styles from "./LogbookPage.module.css";

interface Registro {
  id: string | number;
  titulo: string;
  lote: string;
  fecha: Date | null;
  duracionMin: number | null;
  usuario: string;
  href: string;
}

interface LogbookTask {
  id: string | number;
  templateStep?: { name?: string | null } | null;
  processRun?: {
    batchCode?: string | null;
    productVariant?: { name?: string | null } | null;
  } | null;
  startedAt?: string | null;
  actualDurationMin?: number | null;
}

interface LogbookProcessRun {
  id: string | number;
  batchCode?: string | null;
  productVariant?: { name?: string | null } | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  creator?: { fullName?: string | null } | null;
}

interface AdminUser {
  email?: string | null;
  worker?: { id?: string | number; fullName?: string | null } | null;
}

function formatoFecha(d: Date | null) {
  return d ? d.toLocaleDateString("es-MX") : "Sin fecha";
}

function formatoDuracion(min: number | null) {
  if (min === null || Number.isNaN(min)) return null;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m.toString().padStart(2, "0")} min`;
}

const Logbook = () => {
  const router = useRouter();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(productFilterOptions[0]);
  const [selectedUser, setSelectedUser] = useState(userFilterOptions[0]);
  const [selectedMonth, setSelectedMonth] = useState(monthFilterOptions[0]);
  const [adminUserOptions, setAdminUserOptions] = useState(userFilterOptions);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registros, setRegistros] = useState<Registro[]>([]);

  function monthLabelToRange(label: string) {
    if (!label || label.toLowerCase() === "cualquiera") return {};
    const date = new Date();
    const monthIndex = new Date(
      Date.parse(`${label} 1, ${date.getFullYear()}`)
    ).getMonth();
    const from = new Date(date.getFullYear(), monthIndex, 1);
    const to = new Date(date.getFullYear(), monthIndex + 1, 0);
    const toISO = (d: Date) => d.toISOString().slice(0, 10);
    return { dateFrom: toISO(from), dateTo: toISO(to) };
  }

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/users/me", { credentials: "include" });
        if (!response.ok) return;
        const data = await response.json();
        if (!mounted) return;
        setIsAdminMode(!!data.isAdmin);
        setCurrentUser(data.worker?.fullName ?? data.email ?? "");
        if (data.isAdmin) {
          const usersResponse = await fetch("/api/users", { credentials: "include" });
          if (!usersResponse.ok) return;
          const users = await usersResponse.json();
          if (!mounted) return;
          setAdminUserOptions([
            userFilterOptions[0],
            ...users
              .filter((user: AdminUser) => user.worker?.id)
              .map((user: AdminUser) => ({
                label: user.worker?.fullName ?? user.email,
                value: String(user.worker?.id),
              })),
          ]);
        }
      } catch {
        return;
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { dateFrom, dateTo } = monthLabelToRange(selectedMonth.label);
        const coincideProducto = (nombre: string) =>
          selectedProduct.label === "Todos" ||
          nombre.toLowerCase().includes(selectedProduct.label.toLowerCase());

        if (!isAdminMode) {
          const data = await fetchMyTasks({ dateFrom, dateTo });
          setRegistros(
            data
              .filter((t: LogbookTask) =>
                coincideProducto(t.processRun?.productVariant?.name || "")
              )
              .map((t: LogbookTask) => ({
                id: t.id,
                titulo: t.templateStep?.name ?? "Tarea",
                lote: t.processRun?.batchCode ?? "—",
                fecha: t.startedAt ? new Date(t.startedAt) : null,
                duracionMin: t.actualDurationMin ?? null,
                usuario: currentUser,
                href: `/logbook/detail-process?id=${t.id}&actividad=${encodeURIComponent(
                  t.templateStep?.name ?? ""
                )}`,
              }))
          );
        } else {
          const params: { dateFrom?: string; dateTo?: string; workerId?: string } = {
            dateFrom,
            dateTo,
          };
          if (selectedUser.value) params.workerId = selectedUser.value;
          const data = await fetchProcessRuns(params);
          setRegistros(
            data
              .filter((r: LogbookProcessRun) => coincideProducto(r.productVariant?.name || ""))
              .map((r: LogbookProcessRun) => {
                const inicio = r.startedAt ? new Date(r.startedAt) : null;
                const fin = r.finishedAt ? new Date(r.finishedAt) : null;
                return {
                  id: r.id,
                  titulo: r.productVariant?.name ?? "—",
                  lote: r.batchCode ?? "—",
                  fecha: inicio,
                  duracionMin:
                    inicio && fin
                      ? Math.round((fin.getTime() - inicio.getTime()) / 60000)
                      : null,
                  usuario: r.creator?.fullName ?? "—",
                  href: `/logbook/detail-process?id=${r.id}`,
                };
              })
          );
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminMode, selectedProduct, selectedUser, selectedMonth]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, Registro[]>();
    for (const r of registros) {
      const anio = r.fecha ? String(r.fecha.getFullYear()) : "Sin fecha";
      if (!mapa.has(anio)) mapa.set(anio, []);
      mapa.get(anio)!.push(r);
    }
    return [...mapa.entries()];
  }, [registros]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <h1 className={styles.title}>Bitácora</h1>
        {!loading && !error && (
          <span className={styles.count}>
            {registros.length} {registros.length === 1 ? "registro" : "registros"}
          </span>
        )}
      </div>

      {!isAdminMode && <p className={styles.username}>{currentUser}</p>}

      <div className={styles.filters}>
        <FilterButton
          title="Filtrar por producto"
          options={productFilterOptions}
          onChange={setSelectedProduct}
          variant="outline"
        />
        {isAdminMode && (
          <FilterButton
            title="Filtrar por usuario"
            options={adminUserOptions}
            onChange={setSelectedUser}
            variant="outline"
          />
        )}
        <FilterButton
          title="Filtrar por mes"
          options={monthFilterOptions}
          onChange={setSelectedMonth}
          variant="outline"
        />
      </div>

      {loading && <p className={styles.state}>Cargando…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && registros.length === 0 && (
        <p className={styles.state}>
          No hay registros que coincidan con los filtros.
        </p>
      )}

      {!loading &&
        !error &&
        grupos.map(([anio, items], idx) => (
          <section key={anio} className={styles.group}>
            {idx > 0 && <p className={styles.groupLabel}>{anio}</p>}

            <ul className={styles.list}>
              {items.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className={styles.row}
                    onClick={() => router.push(r.href)}
                  >
                    <span className={styles.rowBody}>
                      <span className={styles.rowTitle}>
                        {r.titulo}
                        <span className={styles.rowLote}> · {r.lote}</span>
                      </span>

                      <span className={styles.meta}>
                        <span className={styles.metaItem}>
                          <Calendar size={14} className={styles.metaIcon} />
                          {formatoFecha(r.fecha)}
                        </span>

                        {formatoDuracion(r.duracionMin) && (
                          <span className={styles.metaItem}>
                            <Clock size={14} className={styles.metaIcon} />
                            {formatoDuracion(r.duracionMin)}
                          </span>
                        )}

                        <span className={styles.metaItem}>
                          <User size={14} className={styles.metaIcon} />
                          {r.usuario}
                        </span>
                      </span>
                    </span>

                    <ChevronRight size={18} className={styles.rowChevron} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
};

export default Logbook;
