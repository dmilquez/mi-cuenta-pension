"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  calculateCountdown,
  getRetirementDate,
  type Countdown,
  type PensionProfile,
  type Sex,
} from "./pension";

const COOKIE_NAME = "mi_cuenta_pension";
const EMPTY_COUNTDOWN: Countdown = {
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  reached: false,
};

function readProfileCookie(): PensionProfile | null {
  const match = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;

  try {
    const value = JSON.parse(
      decodeURIComponent(match.slice(COOKIE_NAME.length + 1)),
    ) as PensionProfile;
    if (
      typeof value.name === "string" &&
      (value.sex === "mujer" || value.sex === "hombre") &&
      /^\d{4}-\d{2}-\d{2}$/.test(value.birthDate)
    ) {
      return value;
    }
  } catch {
    return null;
  }
  return null;
}

function saveProfileCookie(profile: PensionProfile) {
  const value = encodeURIComponent(JSON.stringify(profile));
  document.cookie = `${COOKIE_NAME}=${value}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

function clearProfileCookie() {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}

const labels: Array<[keyof Countdown, string]> = [
  ["years", "años"],
  ["months", "meses"],
  ["days", "días"],
  ["hours", "horas"],
  ["minutes", "minutos"],
  ["seconds", "segundos"],
];

export default function Home() {
  const [profile, setProfile] = useState<PensionProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("mujer");
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    setProfile(readProfileCookie());
    setReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const target = useMemo(
    () => (profile ? getRetirementDate(profile.birthDate, profile.sex) : null),
    [profile],
  );
  const countdown = target
    ? calculateCountdown(now, target)
    : EMPTY_COUNTDOWN;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProfile = { name: name.trim(), sex, birthDate };
    saveProfileCookie(nextProfile);
    setProfile(nextProfile);
  }

  function editProfile() {
    if (!profile) return;
    setName(profile.name);
    setSex(profile.sex);
    setBirthDate(profile.birthDate);
    setProfile(null);
  }

  function forgetProfile() {
    clearProfileCookie();
    setProfile(null);
    setName("");
    setBirthDate("");
    setSex("mujer");
  }

  return (
    <main>
      <nav aria-label="Navegación principal">
        <a className="brand" href="#inicio" aria-label="Mi Cuenta Pensión, inicio">
          <span aria-hidden="true">57 / 62</span>
          Mi Cuenta Pensión
        </a>
        <a href="#como-funciona">Cómo funciona</a>
      </nav>

      <section className="hero" id="inicio">
        <div className="eyebrow">Calculadora pensional · Colombia</div>
        <h1>El tiempo para tu pensión, <em>segundo a segundo.</em></h1>
        <p className="intro">
          Guarda tus datos en este dispositivo y vuelve cuando quieras para ver
          cuánto falta para alcanzar la edad de pensión.
        </p>

        {!ready ? (
          <div className="panel loading" role="status">
            Recuperando tus datos…
          </div>
        ) : profile ? (
          <section className="panel countdown-panel" aria-live="polite">
            <div className="panel-top">
              <div>
                <p className="kicker">Tu cuenta regresiva</p>
                <h2>
                  {profile.name}, {countdown.reached ? "ya alcanzaste" : "te falta"}
                </h2>
              </div>
              <button className="text-button" type="button" onClick={editProfile}>
                Editar datos
              </button>
            </div>

            {countdown.reached ? (
              <div className="reached">
                la edad de referencia para solicitar tu pensión.
              </div>
            ) : (
              <div className="countdown" aria-label="Tiempo restante">
                {labels.map(([key, label]) => (
                  <div className="time-unit" key={key}>
                    <strong>{String(countdown[key]).padStart(2, "0")}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="target">
              Fecha estimada:{" "}
              <strong>
                {target?.toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </p>
            <button className="forget" type="button" onClick={forgetProfile}>
              Borrar mis datos de este dispositivo
            </button>
          </section>
        ) : (
          <form className="panel form-panel" onSubmit={handleSubmit}>
            <div className="step">01</div>
            <div className="form-heading">
              <p className="kicker">Empecemos</p>
              <h2>Cuéntanos sobre ti</h2>
            </div>

            <label>
              Nombre
              <input
                autoComplete="name"
                maxLength={60}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Ana Rodríguez"
                required
                value={name}
              />
            </label>

            <fieldset>
              <legend>Sexo para el cálculo legal</legend>
              <div className="sex-options">
                <label>
                  <input
                    checked={sex === "mujer"}
                    name="sex"
                    onChange={() => setSex("mujer")}
                    type="radio"
                  />
                  Mujer <small>57 años</small>
                </label>
                <label>
                  <input
                    checked={sex === "hombre"}
                    name="sex"
                    onChange={() => setSex("hombre")}
                    type="radio"
                  />
                  Hombre <small>62 años</small>
                </label>
              </div>
            </fieldset>

            <label>
              Fecha de nacimiento
              <input
                max={new Date().toISOString().slice(0, 10)}
                min="1900-01-01"
                onChange={(event) => setBirthDate(event.target.value)}
                required
                type="date"
                value={birthDate}
              />
            </label>

            <button className="primary" type="submit">
              Calcular mi tiempo
              <span aria-hidden="true">→</span>
            </button>
            <p className="privacy">
              Tus datos se guardan solo en una cookie de este dispositivo.
            </p>
          </form>
        )}
      </section>

      <section className="info-grid" id="como-funciona">
        <article>
          <span>01</span>
          <h3>Regla de edad</h3>
          <p>
            El cálculo usa 57 años para mujeres y 62 para hombres, conforme a la
            edad general publicada por Colpensiones.
          </p>
        </article>
        <article>
          <span>02</span>
          <h3>Cuenta precisa</h3>
          <p>
            Desglosamos el tiempo restante en años, meses, días, horas, minutos
            y segundos.
          </p>
        </article>
        <article>
          <span>03</span>
          <h3>Privacidad local</h3>
          <p>
            No enviamos tu nombre ni tu fecha de nacimiento a una base de
            datos. Puedes borrarlos cuando quieras.
          </p>
        </article>
      </section>

      <aside className="notice">
        <strong>Importante.</strong> Esta es una estimación informativa basada
        únicamente en la edad general. Solicitar o recibir una pensión depende
        también del régimen aplicable, semanas cotizadas, capital y demás
        requisitos vigentes. Consulta tu caso con Colpensiones o tu fondo.
      </aside>

      <footer>
        <span>Mi Cuenta Pensión</span>
        <span>Hecho para planear con claridad · Colombia</span>
      </footer>
    </main>
  );
}
