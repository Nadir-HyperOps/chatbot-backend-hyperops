const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const sessions = {};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const NEED_TYPES = [
  "CRM / RevOps",
  "Airtable",
  "Automatisation",
  "Outil sur mesure",
  "Je ne sais pas encore"
];

const MEETING_OPTIONS = ["Oui", "Non, je préfère être recontacté"];

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "HyperOps chatbot backend" });
});

app.post("/start-session", (req, res) => {
  const session_id = uuidv4();

  sessions[session_id] = {
    session_id,
    current_step: "first_name",
    data: {
      first_name: null,
      email: null,
      need_type: null,
      problem_description: null,
      description_valid: false,
      meeting: null,
      recap_validated: false
    }
  };

  res.json({
    session_id,
    next_question: "Quel est votre prénom ?"
  });
});

app.post("/next-step", async (req, res) => {
  const { session_id, answer } = req.body;

  const session = sessions[session_id];

  if (!session) {
    return res.status(400).json({ error: "Session invalide" });
  }

  const cleanAnswer = typeof answer === "string" ? answer.trim() : "";
  const step = session.current_step;

  if (step === "first_name") {
    if (!cleanAnswer || cleanAnswer.length < 2) {
      return res.status(400).json({
        error: "Prénom invalide"
      });
    }

    session.data.first_name = cleanAnswer;
    session.current_step = "email";

    return res.json({
      next_question: "Quel est votre email professionnel ?"
    });
  }

  if (step === "email") {
    if (!isValidEmail(cleanAnswer)) {
      return res.status(400).json({
        error: "Ça ne ressemble pas à une adresse email valide. Pouvez-vous vérifier ?"
      });
    }

    session.data.email = cleanAnswer.toLowerCase();
    session.current_step = "need_type";

    return res.json({
      next_question: "Votre besoin concerne plutôt quoi ?",
      options: NEED_TYPES
    });
  }

  if (step === "need_type") {
    if (!NEED_TYPES.includes(cleanAnswer)) {
      return res.status(400).json({
        error: "Type de besoin invalide"
      });
    }

    session.data.need_type = cleanAnswer;
    session.current_step = "problem_description";

    return res.json({
      next_question:
        "En quelques phrases, qu’est-ce que vous voulez améliorer ou débloquer ?"
    });
  }

  if (step === "problem_description") {
    if (!cleanAnswer || cleanAnswer.length < 20) {
      return res.status(400).json({
        error:
          "Pouvez-vous donner un peu plus de détails ? Par exemple : l’outil concerné, le problème actuel et le résultat attendu."
      });
    }

    session.data.problem_description = cleanAnswer;
    session.data.description_valid = true;
    session.current_step = "meeting";

    return res.json({
      next_question: "Souhaitez-vous prendre un RDV ?",
      options: MEETING_OPTIONS
    });
  }

  if (step === "meeting") {
    if (!MEETING_OPTIONS.includes(cleanAnswer)) {
      return res.status(400).json({
        error: "Réponse invalide"
      });
    }

    session.data.meeting = cleanAnswer;
    session.current_step = "recap";

    return res.json({
      recap: session.data,
      next_question: "Est-ce que tout est correct ?",
      options: ["Oui, envoyer", "Modifier"]
    });
  }

  if (step === "recap") {
    if (cleanAnswer !== "Oui, envoyer") {
      return res.status(400).json({
        error: "La modification des réponses sera ajoutée ensuite. Pour cette V1, merci de recommencer."
      });
    }

    session.data.recap_validated = true;
    session.current_step = "ready_for_submit";

    return res.json({
      message: "Prêt à envoyer",
      can_submit: true
    });
  }

  return res.status(400).json({
    error: "Étape inconnue ou déjà terminée"
  });
});

app.post("/submit", (req, res) => {
  const { session_id } = req.body;

  const session = sessions[session_id];

  if (!session) {
    return res.status(400).json({ error: "Session invalide" });
  }

  const d = session.data;

  const validationErrors = [];

  if (!d.first_name) validationErrors.push("Prénom manquant");
  if (!d.email || !isValidEmail(d.email)) validationErrors.push("Email invalide");
  if (!NEED_TYPES.includes(d.need_type)) validationErrors.push("Type de besoin invalide");
  if (!d.problem_description || !d.description_valid) validationErrors.push("Description invalide");
  if (!MEETING_OPTIONS.includes(d.meeting)) validationErrors.push("RDV souhaité invalide");
  if (!d.recap_validated) validationErrors.push("Résumé non validé");

  if (validationErrors.length > 0) {
    return res.status(400).json({
      error: "Validation échouée",
      validationErrors
    });
  }

  session.current_step = "submitted";

  console.log("LEAD VALIDÉ :", d);

  return res.json({
    success: true,
    message: "Lead validé, pas encore envoyé à Airtable",
    data: d
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
