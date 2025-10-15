export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  try {
    let texto = req.body.trim();

    // Remove barras invertidas se vier escapado
    if (texto.startsWith("{\\") || texto.includes('\\"')) {
      texto = texto.replace(/\\/g, "");
    }

    // Tenta converter o texto em JSON
    let json;
    try {
      json = JSON.parse(texto);
    } catch (e) {
      return res.status(400).json({ error: "Não foi possível converter o JSON." });
    }

    // Extrai, ordena e trata as respostas
    const respostasOrdenadas = Object.keys(json)
      .filter((key) => key.toLowerCase().includes("resposta"))
      .sort((a, b) => {
        const numA = parseInt(a.match(/screen_(\d+)_/)[1]);
        const numB = parseInt(b.match(/screen_(\d+)_/)[1]);
        return numA - numB;
      })
      .map((key) => {
        let valor = json[key];
        valor = valor.replace(/^\d+_/, ""); // remove número inicial
        valor = valor.replace(/_/g, " ");   // substitui underline por espaço
        return valor;
      });

    // Monta o objeto final com resposta1, resposta2, ...
    const respostas = {};
    respostasOrdenadas.forEach((resposta, i) => {
      respostas[`resposta${i + 1}`] = resposta;
    });

    return res.status(200).json({ respostas });
  } catch (err) {
    console.error("Erro:", err);
    return res.status(500).json({ error: "Erro ao processar JSON." });
  }
}
