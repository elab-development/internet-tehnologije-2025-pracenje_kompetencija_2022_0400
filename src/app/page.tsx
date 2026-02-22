import "./home.css";
import { FaGraduationCap, FaIdBadge, FaUserCircle, FaShieldAlt } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

export default function HomePage() {
  return (
    <main className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-pill">PracenjeKompetencija • portfolio platforma</p>

          <h1>Platforma za praćenje kompetencija i kredencijala</h1>

          <p className="hero-subtitle">
            Upravljaj svojim znanjem, sertifikatima, diplomama i profesionalnim razvojem na jednom mestu.
          </p>

          <div className="hero-buttons">
            <a href="/register" className="btn primary">
              Registruj se <FiArrowRight className="btn-icon" />
            </a>
            <a href="/login" className="btn secondary">
              Prijavi se
            </a>
          </div>
        </div>
      </section>

      {/* O PLATFORMI */}
      <section className="section">
        <h2>Šta je ova platforma?</h2>
        <p className="section-text">
          Ova aplikacija omogućava korisnicima da prate i organizuju svoje kompetencije, sertifikate,
          diplome i profesionalne veštine. Sistem podržava različite uloge (korisnik, moderator,
          administrator) i omogućava kontrolu pristupa i upravljanje podacima.
        </p>
      </section>

      {/* FUNKCIONALNOSTI */}
      <section className="section light">
        <h2>Ključne funkcionalnosti</h2>

        <div className="cards">
          <div className="card">
            <div className="card-icon">
              <FaGraduationCap />
            </div>
            <h3>Kompetencije</h3>
            <p>Dodavanje i praćenje profesionalnih veština i nivoa znanja.</p>
          </div>

          <div className="card">
            <div className="card-icon">
              <FaIdBadge />
            </div>
            <h3>Kredencijali</h3>
            <p>Čuvanje sertifikata, diploma i licenci sa podacima o izdavanju.</p>
          </div>

          <div className="card">
            <div className="card-icon">
              <FaShieldAlt />
            </div>
            <h3>Upravljanje ulogama</h3>
            <p>Različite privilegije za korisnike, moderatore i administratore.</p>
          </div>

          <div className="card">
            <div className="card-icon">
              <FaUserCircle />
            </div>
            <h3>Profil korisnika</h3>
            <p>Personalizovani profil sa biografijom, linkovima i fotografijom.</p>
          </div>
        </div>
      </section>

      {/* ULOGE */}
      <section className="section">
        <h2>Uloge u sistemu</h2>

        <div className="roles">
          <div className="role">
            <h4>Standardni korisnik</h4>
            <p>Upravlja svojim kompetencijama i kredencijalima.</p>
          </div>

          <div className="role">
            <h4>Moderator</h4>
            <p>Upravlja katalogom kompetencija i održava kvalitet podataka.</p>
          </div>

          <div className="role">
            <h4>Administrator</h4>
            <p>Upravlja korisnicima, rolama i sistemskim podešavanjima.</p>
          </div>

          <div className="role">
            <h4>Gost</h4>
            <p>Može pregledati javne profile i kompetencije.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-inner">
          <h2>Započni danas</h2>
          <p>Kreiraj nalog i organizuj svoj profesionalni razvoj.</p>
          <a href="/register" className="btn primary large">
            Kreiraj nalog <FiArrowRight className="btn-icon" />
          </a>
        </div>
      </section>
    </main>
  );
}