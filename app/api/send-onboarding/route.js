import nodemailer from "nodemailer"; /* importerer nodemailer - et Node.js bibliotek til at sende emails. Det kører på serveren og ikke i browseren */

/* eksporterer en asynkron POST funktion. I Next.js App Router er filnavnet og funktionsnavnet det der bestemmer hvilken HTTP-metode der håndteres - en funktion der hedder POST svarer kun på POST-requests. request er det request-objekt der sendes fra browseren */
export async function POST(request) {
  const { navn, virksomhed, telefon, mail, region } = await request.json();
  /* henter og destrukturerer data fra request-bodyen. await request.json() parser JSON-data fra POST-requesten asynkront */

  /* validerer at de fire påkrævede felter er udfyldt. region er ikke med fordi det er valgfrit */
  /* hvis et felt mangler returneres en fejlrespons med HTTP-statuskode 400 - bad request */
  /* return stopper funktionen så resten af koden ikke køres hvis data er ugyldige */
  if (!navn || !virksomhed || !telefon || !mail) {
    return Response.json(
      { error: "Manglende påkrævede felter" },
      { status: 400 },
    );
  }

  /* henter onboarding-URL'en fra environment variables. process.env.ONBOARDING_URL er en variabel sat i Vercel. || giver en fallback URL hvis variablen ikke er sat, hvilket sikrer at koden virker selv hvis environment variablen mangler */
  const onboardingUrl =
    process.env.ONBOARDING_URL ||
    "https://hovedopgave-partners-legal.vercel.app/onboarding";

  /* opretter en mail-tranporter der bruger Gmail som afsender */
  /* proces.env.MAIL_USER og process.env.MAIL_PASS er Gmail-adressen og app-passwordet sat som environment variables i Vercel */
  /* de er ikke hardcodet i koden af sikkerhedsmæssige årsager */
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  /* mail til ansøgeren */
  /* definerer mailens afsender, modtager, emne og HTML-indhold */
  /* from bruger template literals til at kombinere et visningsnavn med email-adressen, det er det der vises i inbakken som afsender */
  /* to: mail sender til den email afsenderen har indtastet i formularen */
  const mailToApplicant = {
    from: `".legal Partnerprogram" <${process.env.MAIL_USER}>`,
    to: mail,
    subject: "Velkommen til .legal — her er dit onboarding-link",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #032478;">
        <h2 style="font-size: 24px; margin-bottom: 16px;">Hej ${navn} 👋</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Tak for din interesse i at blive .legal-partner. Vi har modtaget din ansøgning fra <strong>${virksomhed}</strong>.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
          Klik på knappen herunder for at gå i gang med onboardingflowet og oprette din partnerprofil:
        </p>
        <a href="${onboardingUrl}"
          style="display: inline-block; background: #7284FA; color: #fff; padding: 14px 32px; border-radius: 100px; font-size: 16px; font-weight: 600; text-decoration: none;">
          Start onboarding →
        </a>
        <p style="font-size: 14px; color: #6a7282; margin-top: 32px; line-height: 1.6;">
          Det tager ca. 10 minutter at udfylde. Har du spørgsmål er du velkommen til at svare på denne mail.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
        <p style="font-size: 13px; color: #a0aec0;">.legal Partnerprogram</p>
      </div>
    `,
  };

  /* intern mail til .legal */
  /* den interne mail sendes til den samme email-adresse som afsender */
  const mailToInternal = {
    from: `".legal Partnerprogram" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_USER,
    subject: `Ny partneransøgning: ${virksomhed}`,
    html: `
      <div style="font-family: sans-serif; color: #032478;">
        <h2>Ny partneransøgning</h2>
        <table style="font-size: 15px; border-collapse: collapse;">
          <tr><td style="padding: 6px 16px 6px 0; font-weight: bold;">Navn:</td><td>${navn}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; font-weight: bold;">Virksomhed:</td><td>${virksomhed}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; font-weight: bold;">Telefon:</td><td>${telefon}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; font-weight: bold;">Mail:</td><td>${mail}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; font-weight: bold;">Region:</td><td>${region || "—"}</td></tr>
        </table>
      </div>
    `,
  };

  /* try/catch fanger eventuelle fejl der opstår under afsendelsen */
  /* de to mails sendes sekventielt - først mailen til ansøgeren og derefter den interne mail. Hvis den første mail fejler, vil den anden ikke blive sendt */
  try {
    await transporter.sendMail(mailToApplicant);
    await transporter.sendMail(mailToInternal);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Mail fejl:", error);
    return Response.json({ error: "Mail kunne ikke sendes" }, { status: 500 });
  }
}
