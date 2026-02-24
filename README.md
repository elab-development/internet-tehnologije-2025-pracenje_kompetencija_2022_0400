# Kompetencije & Sertifikati App

Ova aplikacija predstavlja sistem za upravljanje korisničkim kompetencijama i verifikaciju sertifikata (kredencijala). Dizajnirana je da omogući korisnicima dokumentovanje veština, dok administratorima i moderatorima pruža alate za njihovu validaciju.

---

## 1.1. Dokumentacija projekta

### Opis aplikacije
Sistem funkcioniše kao centralizovana platforma za profesionalni razvoj kroz tri nivoa pristupa:
* Korisnički Dashboard: Pregled statistike, upravljanje veštinama i podnošenje dokaza o obrazovanju.
* Moderacija: Sistem za proveru autentičnosti sertifikata sa opcijama odobravanja i odbijanja uz povratne informacije.
* Profilisanje: Prikaz kompetencija sa precizno definisanim nivoima znanja i godinama iskustva.

### Tehnologije
* Framework: Next.js 15+ (App Router)
* Jezik: TypeScript
* Baza podataka: PostgreSQL (Drizzle ORM)
* Stilizacija: Tailwind CSS (Glassmorphism dizajn)
* Autentifikacija: JWT (JSON Web Tokens)
* Docker & Docker Compose

### Instrukcije za lokalno pokretanje
Pratite ove korake za podizanje razvojnog okruženja:

1. Klonirajte repozitorijum:
   git clone [url-repozitorijuma]
    
2. Build i pokretanje kontejnera u pozadini:
   docker-compose up -d --build

3. Provera statusa kontejnera:
   docker-compose ps

4. Pregled logova aplikacije:
   docker-compose logs -f app

5. Zaustavljanje sistema:
   docker-compose down

---




## Detaljna struktura projekta

Aplikacija je organizovana prema Next.js App Router standardima, sa jasnim razdvajanjem logike po ulogama i funkcionalnostima.

### 1. Backend rute (src/app/api)
Sva serverska logika i API endpoint-i su smešteni u `src/app/api` i zaštićeni su mehanizmima autentifikacije:
* **api/auth** - Upravljanje sesijama, registracija i prijava korisnika.
* **api/admin** - Administratorske rute za globalno upravljanje sistemom.
* **api/moderator** - Specijalizovane rute za pregled, odobravanje (approve) i odbijanje (reject) kredencijala.
* **api/user** - Korisničke rute za dobavljanje lične statistike i liste podnetih dokumenata.
* **api/competencies** - Centralni API za upravljanje katalogom dostupnih kompetencija.

### 2. Korisnički interfejs i stranice (src/app)
Stranice su grupisane prema funkcionalnim celinama:
* **(auth)/login & (auth)/register** - Interfejs za pristup sistemu.
* **profile/** - Glavni korisnički dashboard.
  - `profile/skills` - Pregled i dodavanje ličnih veština korisnika.
  - `profile/credentials` - Upravljanje sertifikatima i praćenje statusa validacije.
  - `profile/edit` - Uređivanje osnovnih informacija profila.
* **jobs/** - Modul za pregled poslova prilagođenih kompetencijama korisnika 
* **moderator/** - Kontrolni panel za moderatore sistema.
* **admin/** - Administratorski interfejs za nadzor sistema.

### 3. Komponente i resursi
* **src/components/** - Skladište deljenih (reusable) UI elemenata:
* **src/db/** - Konfiguracija baze podataka i Drizzle ORM šeme (schema.ts).
* **src/lib/** - Pomoćne funkcije, klase za validaciju i konfiguracija JWT-a.

