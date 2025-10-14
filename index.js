import express from "express";

const app = express();
app.use(express.json()); // permite receber JSON no body

// Rota para tratar o JSON do flow
app.post("/tratar-flow", (req, res) => {
  try {
    const body = req.body;

    // Caminho até as respostas no padrão Meta
    const responses =
      body?.entry?.[0]?.changes?.[0]?.value?.flow_response?.responses;

    if (!responses) {
      return res
        .status(400)
        .json({ error: "Formato inválido de JSON recebido." });
    }

    // Monta o formato desejado
    const respostas = {};
    let i = 1;
    for (const key in responses) {
      respostas[`resposta${i}`] = responses[key];
      i++;
    }

    // Retorna o JSON transformado
    return res.json({ respostas });
  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ error: "Erro ao processar JSON." });
  }
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 API rodando em http://localhost:${PORT}`)
);