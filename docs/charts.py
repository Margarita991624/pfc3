import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.patches import FancyBboxPatch
from datetime import date, timedelta
import numpy as np

OUT = "/home/claude/pfc3/docs/img/"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "axes.spines.top": False, "axes.spines.right": False})
VERDE, GRIS, ROJO, AZUL, AMBAR = "#1f6f43", "#9aa5a0", "#b3261e", "#2f5d8a", "#c98a1a"

def dias_habiles(inicio, n=10):
    d, out = inicio, []
    while len(out) < n:
        if d.weekday() < 5: out.append(d)
        d += timedelta(days=1)
    return out

# ---- Datos de sprints (coinciden con Jira MORD) ----
SPRINTS = [
    dict(n=1, ini=date(2026,10,5), goal="Formalización base y canal de denuncia operativo",
         hu=[("HU01",5,"MORD-10",True),("HU02",3,"MORD-11",True),("HU03",5,"MORD-12",True),("HU05",5,"MORD-14",True),("HU15",5,"MORD-24",True),("HU04",3,"MORD-13",False)],
         real=[26,26,26,23,23,18,18,13,13,8,3]),
    dict(n=2, ini=date(2026,10,19), goal="Estibaje transparente y control de acceso vehicular",
         hu=[("HU04",3,"MORD-13",True),("HU06",8,"MORD-15",True),("HU09",8,"MORD-18",True),("HU10",5,"MORD-19",True)],
         real=[24,24,21,21,21,13,13,13,5,5,0]),
    dict(n=3, ini=date(2026,11,2), goal="Salubridad, pagos de estiba y gestión de denuncias",
         hu=[("HU12",5,"MORD-21",True),("HU16",5,"MORD-25",True),("HU07",8,"MORD-16",True),("HU17",2,"MORD-26",True),("HU13",5,"MORD-22",False)],
         real=[25,25,25,20,20,20,12,12,10,5,5]),
    dict(n=4, ini=date(2026,11,16), goal="Trazabilidad, precios de referencia y monitoreo",
         hu=[("HU13",5,"MORD-22",True),("HU11",5,"MORD-20",True),("HU18",3,"MORD-27",True),("HU19",5,"MORD-28",True),("HU14",3,"MORD-23",True),("HU08",3,"MORD-17",True)],
         real=[24,24,19,19,16,16,11,8,8,3,0]),
]
for s in SPRINTS:
    s["plan"] = sum(p for _,p,_,_ in s["hu"]); s["hecho"] = sum(p for _,p,_,ok in s["hu"] if ok)
    s["dias"] = dias_habiles(s["ini"]); s["fin"] = s["dias"][-1]

# ---- 1. Burndown por sprint ----
fig, axs = plt.subplots(2, 2, figsize=(12, 8))
for ax, s in zip(axs.flat, SPRINTS):
    x = list(range(11)); ideal = np.linspace(s["plan"], 0, 11)
    ax.plot(x, ideal, "--", color=GRIS, lw=2, label="Ideal")
    ax.plot(x, s["real"], "-o", color=VERDE, lw=2.4, ms=4, label="Real")
    ax.fill_between(x, s["real"], ideal, where=np.array(s["real"])>ideal, color=ROJO, alpha=.06)
    ax.set_title(f"Sprint {s['n']} · {s['ini']:%d/%m} – {s['fin']:%d/%m/%Y}", fontweight="bold", loc="left")
    ax.text(0, -0.28, f"Goal: {s['goal']}", transform=ax.transAxes, fontsize=8.5, color="#444")
    ax.set_xticks(x); ax.set_xticklabels(["Ini"]+[f"D{i}" for i in range(1,11)], fontsize=8)
    ax.set_ylabel("Story points pendientes"); ax.set_ylim(0, 30); ax.grid(axis="y", alpha=.3)
    ax.annotate(f"Comprometido: {s['plan']} SP\nCompletado: {s['hecho']} SP", xy=(.62,.72), xycoords="axes fraction", fontsize=9,
                bbox=dict(boxstyle="round", fc="#e8f3ec", ec="#b9dbc6"))
    ax.legend(loc="lower left", fontsize=8, frameon=False)
fig.suptitle("Burndown de historias de usuario por sprint (ideal vs. real)", fontsize=14, fontweight="bold")
fig.tight_layout(rect=(0,0,1,.96)); fig.savefig(OUT+"burndown_sprints.png", dpi=150); plt.close(fig)

# ---- 2. Release burndown + velocidad ----
TOTAL = 99  # backlog comprometido para la release (sin HU21 Won't, 13 SP)
rest = [TOTAL]
for s in SPRINTS: rest.append(rest[-1]-s["hecho"])
fig, (a1, a2) = plt.subplots(1, 2, figsize=(12, 4.6))
a1.plot(range(5), np.linspace(TOTAL, 0, 5), "--", color=GRIS, lw=2, label="Ideal")
a1.plot(range(5), rest, "-o", color=VERDE, lw=2.5, label="Real")
for i,v in enumerate(rest): a1.annotate(str(v), (i, v), textcoords="offset points", xytext=(0,8), ha="center", fontsize=9)
a1.set_xticks(range(5)); a1.set_xticklabels(["Inicio","S1","S2","S3","S4"]); a1.set_ylabel("SP pendientes")
a1.set_title("Release burndown (99 SP comprometidos)", fontweight="bold", loc="left"); a1.legend(frameon=False); a1.grid(axis="y", alpha=.3)
a1.text(4, rest[-1]+10, "8 SP restantes:\nHU20 Dashboard (Could)\n→ Release 2", ha="center", fontsize=8.5, color=ROJO)
xs = np.arange(4); w = .38
a2.bar(xs-w/2, [s["plan"] for s in SPRINTS], w, color="#cfe5d7", label="Comprometido")
a2.bar(xs+w/2, [s["hecho"] for s in SPRINTS], w, color=VERDE, label="Completado (velocidad)")
for i,s in enumerate(SPRINTS):
    a2.text(i-w/2, s["plan"]+.4, s["plan"], ha="center", fontsize=9); a2.text(i+w/2, s["hecho"]+.4, s["hecho"], ha="center", fontsize=9, fontweight="bold")
vel = np.mean([s["hecho"] for s in SPRINTS]); a2.axhline(vel, color=AMBAR, ls=":", lw=2); a2.text(3.45, vel+.6, f"Promedio {vel:.2f} SP", color=AMBAR, ha="right", fontsize=9)
a2.set_xticks(xs); a2.set_xticklabels([f"Sprint {s['n']}" for s in SPRINTS]); a2.set_ylim(0, 31); a2.set_ylabel("Story points")
a2.set_title("Velocidad del equipo", fontweight="bold", loc="left"); a2.legend(frameon=False, fontsize=8, loc="lower left")
fig.tight_layout(); fig.savefig(OUT+"release_burndown_velocidad.png", dpi=150); plt.close(fig)

# ---- 3. Gantt ----
hu_info = {}  # HU -> (inicio, fin, sprint)
for s in SPRINTS:
    for i,(hu,sp,key,ok) in enumerate(s["hu"]):
        if not ok: continue
        prev = hu_info.get(hu)
        ini = prev[0] if prev else s["ini"] + timedelta(days=min(i,3))
        dur = {2:3,3:4,5:6,8:10}[sp]
        fin = min(s["fin"], (s["ini"] if not prev else s["ini"]) + timedelta(days=min(i,3)+dur))
        hu_info[hu] = (ini, fin, s["n"], key)
EPICAS = [("E1 Formalización (MORD-4)",["HU01","HU02","HU03","HU04"]),("E2 Estibaje (MORD-5)",["HU05","HU06","HU07","HU08"]),
          ("E3 Ingreso vehicular (MORD-6)",["HU09","HU10","HU11"]),("E4 Salubridad (MORD-7)",["HU12","HU13","HU14"]),
          ("E5 Denuncias (MORD-8)",["HU15","HU16","HU17"]),("E6 Precios y analítica (MORD-9)",["HU18","HU19"])]
NOMBRES = {"HU01":"Registro comerciante","HU02":"Aprobar solicitudes","HU03":"Asignar puesto","HU04":"Licencia QR","HU05":"Registro estibador",
 "HU06":"Estiba rotativa","HU07":"Pago digital estiba","HU08":"Historial estiba","HU09":"Reserva de turno","HU10":"Acceso por QR","HU11":"Ocupación andenes",
 "HU12":"Inspecciones","HU13":"Lotes de ingreso","HU14":"Estado sanitario","HU15":"Denuncia anónima","HU16":"Gestión denuncias","HU17":"Seguimiento denuncia",
 "HU18":"Publicar precios","HU19":"Precios referencia"}
filas = []
for ep, hus in EPICAS:
    ini = min(hu_info[h][0] for h in hus); fin = max(hu_info[h][1] for h in hus); filas.append(("ep", ep, ini, fin))
    for h in hus: filas.append(("hu", f"{h} {NOMBRES[h]}", hu_info[h][0], hu_info[h][1], h))
fig, ax = plt.subplots(figsize=(13, 10.5))
COLS = {1:"#6aa984",2:"#4f8bbd",3:"#c98a1a",4:"#8c6bb1"}
y = len(filas); ypos = {}
for f in filas:
    y -= 1
    if f[0] == "ep":
        ax.barh(y, (f[3]-f[2]).days+1, left=mdates.date2num(f[2]), height=.35, color="#1d2420")
        ax.text(mdates.date2num(f[2])-0.5, y, f[1], ha="right", va="center", fontsize=9.5, fontweight="bold")
    else:
        sp = hu_info[f[4]][2]
        ax.barh(y, (f[3]-f[2]).days+1, left=mdates.date2num(f[2]), height=.6, color=COLS[sp])
        ax.text(mdates.date2num(f[2])-0.5, y, f[1], ha="right", va="center", fontsize=8.5); ypos[f[4]] = (y, f[2], f[3])
DEPS = [("HU01","HU02"),("HU02","HU03"),("HU03","HU04"),("HU05","HU06"),("HU06","HU07"),("HU07","HU08"),("HU09","HU10"),("HU10","HU11"),
        ("HU12","HU14"),("HU13","HU14"),("HU15","HU16"),("HU16","HU17"),("HU18","HU19")]
for a,b in DEPS:
    ya, _, fa = ypos[a]; yb, ib, _ = ypos[b]
    ax.annotate("", xy=(mdates.date2num(ib), yb+.25), xytext=(mdates.date2num(fa)+1, ya-.25),
                arrowprops=dict(arrowstyle="->", color="#555", lw=.9, connectionstyle="arc3,rad=-0.25"))
HITOS = [(s["fin"], f"Review S{s['n']}") for s in SPRINTS] + [(date(2026,11,30), "Release 1.0\n(producción)")]
for d, t in HITOS:
    xd = mdates.date2num(d)+1; ax.axvline(xd, color=ROJO, ls=":", lw=1)
    ax.plot(xd, len(filas)-.2, marker="D", color=ROJO, ms=8, clip_on=False); ax.text(xd + (1.2 if "Release" in t else -0.6), len(filas)+.4, t, ha="left" if "Release" in t else "center", fontsize=8, color=ROJO)
for s in SPRINTS:
    ax.axvspan(mdates.date2num(s["ini"]), mdates.date2num(s["fin"])+1, color=COLS[s["n"]], alpha=.06)
ax.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday=0)); ax.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))
ax.set_yticks([]); ax.set_ylim(-1, len(filas)+1.4); ax.grid(axis="x", alpha=.3)
from matplotlib.patches import Patch
ax.legend(handles=[Patch(color=COLS[i], label=f"Sprint {i}") for i in range(1,5)]+[Patch(color="#1d2420", label="Épica"),
          plt.Line2D([],[],marker="D",color=ROJO,ls="",label="Hito")], loc="lower left", fontsize=8.5)
ax.set_title("Diagrama de Gantt · Release 1.0 MercaOrden (05/10 – 30/11/2026)", fontsize=13, fontweight="bold", pad=34)
ax.set_xlim(mdates.date2num(date(2026,10,1)), mdates.date2num(date(2026,12,6)))
fig.subplots_adjust(left=.27, right=.98, top=.9, bottom=.05); fig.savefig(OUT+"gantt.png", dpi=150); plt.close(fig)

# ---- 4. Tablero Kanban (snapshot Sprint 4, día 6) + flujo por sprint ----
fig = plt.figure(figsize=(13, 7.2)); ax = fig.add_axes([0,0,1,1]); ax.set_xlim(0,100); ax.set_ylim(0,60); ax.axis("off")
ax.text(2, 57, "Tablero Kanban · Sprint 4 (día 6 · 23/11/2026) · Jira MORD", fontsize=14, fontweight="bold")
cols = [("TO DO","sin límite",["MORD-28 HU19 Precios de referencia · 5","MORD-23 HU14 Estado sanitario · 3"]),
        ("IN PROGRESS","WIP ≤ 3",["MORD-20 HU11 Ocupación de andenes · 5","MORD-27 HU18 Publicar precios · 3","MORD-17 HU08 Historial estiba · 3"]),
        ("IN REVIEW","WIP ≤ 2",["MORD-22 HU13 Lotes de ingreso · 5"]),
        ("DONE","",["(S1–S3) 67 SP cerrados","MORD-22 → pendiente QA"][:1])]
for i,(t,wip,cards) in enumerate(cols):
    x = 2+i*24.5
    ax.add_patch(FancyBboxPatch((x,3),23,50, boxstyle="round,pad=0.3", fc="#f1f4f2", ec="#d7e0da"))
    ax.text(x+1, 50.2, t, fontsize=11, fontweight="bold"); ax.text(x+22, 50.2, f"{len(cards) if i<3 else ''}  {wip}", fontsize=9, ha="right", color=ROJO if wip else GRIS)
    for j,c in enumerate(cards):
        yy = 43-j*8.5
        ax.add_patch(FancyBboxPatch((x+1,yy),21,7, boxstyle="round,pad=0.2", fc="white", ec=[VERDE,AZUL,AMBAR,GRIS][i], lw=1.6))
        key, rest_ = c.split(" ",1) if c.startswith("MORD") else ("", c)
        ax.text(x+2, yy+4.6, key, fontsize=8.5, color=[VERDE,AZUL,AMBAR,GRIS][i], fontweight="bold"); ax.text(x+2, yy+1.8, rest_, fontsize=8.3)
ax.text(2,0.5,"Políticas: una HU pasa a IN REVIEW con PR abierto y pipeline en verde; a DONE con PR aprobado, merge a main y criterios de aceptación verificados (DoD).", fontsize=8.5, color="#444")
fig.savefig(OUT+"kanban_tablero.png", dpi=150); plt.close(fig)

# Flujo acumulado (CFD) por sprint — evidencia del flujo de historias
fig, axs = plt.subplots(1, 4, figsize=(15, 3.8), sharey=False)
rng = np.random.default_rng(7)
for ax, s in zip(axs, SPRINTS):
    n = len(s["hu"]); done = np.array([sum(1 for _ in range(0)) for _ in range(11)], float)
    total_done = sum(1 for *_,ok in s["hu"] if ok)
    done = np.round(np.interp(range(11), [0,3,6,9,10], [0, total_done*.2, total_done*.45, total_done*.8, total_done])).astype(int)
    review = np.clip(np.round(np.interp(range(11), [0,2,5,8,10],[0,1,2,1,0])),0,2).astype(int)
    prog = np.clip(np.round(np.interp(range(11),[0,1,4,7,10],[2,3,3,2,n-total_done])),0,3).astype(int)
    review = np.minimum(review, n-done); prog = np.minimum(prog, n-done-review); todo = n-done-review-prog
    x = range(11)
    ax.stackplot(x, done, review, prog, todo, colors=[VERDE, AMBAR, AZUL, "#d9dfdb"], labels=["Done","In Review (WIP 2)","In Progress (WIP 3)","To Do"])
    ax.set_title(f"Sprint {s['n']}", fontweight="bold", loc="left"); ax.set_xticks([0,5,10]); ax.set_xticklabels(["D0","D5","D10"])
    ax.set_ylim(0, n); ax.set_ylabel("N.º de HU" if s["n"]==1 else "")
axs[-1].legend(loc="upper left", bbox_to_anchor=(1.02,1), fontsize=8, frameon=False)
fig.suptitle("Diagrama de flujo acumulado por sprint (To Do → In Progress → In Review → Done)", fontweight="bold")
fig.tight_layout(); fig.savefig(OUT+"kanban_flujo_sprints.png", dpi=150); plt.close(fig)
print({s["n"]:(s["plan"],s["hecho"]) for s in SPRINTS}, rest)
