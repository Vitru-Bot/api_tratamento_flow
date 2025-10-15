// /functions/api/tratamento.js

/**
 * Esta função é acionada apenas para requisições POST para a URL /api/tratamento
 * O nome da função "onRequestPost" garante que apenas o método POST seja permitido.
 */
export const onRequestPost = async ({ request }) => {
  try {
    // Pega o corpo da requisição como texto puro, pois o original espera um JSON "sujo".
    const textoOriginal = await request.text();

    // Validação para corpo vazio
    if (!textoOriginal) {
      return new Response(JSON.stringify({ error: "O corpo da requisição está vazio." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let texto = textoOriginal.trim();

    // Bloco 1: Remove barras invertidas se o JSON vier escapado
    // Lógica mantida 100% igual ao original.
    if (texto.startsWith("{\\") || texto.includes('\\"')) {
      texto = texto.replace(/\\/g, "");
    }

    // Bloco 2: Tenta converter o texto em um objeto JSON
    // A lógica é a mesma, mas a resposta de erro é adaptada para a Cloudflare.
    let json;
    try {
      json = JSON.parse(texto);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Não foi possível converter o JSON." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Bloco 3: Extrai, ordena e trata as respostas
    // Lógica mantida 100% igual ao original.
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

    // Bloco 4: Monta o objeto final com resposta1, resposta2, ...
    // Lógica mantida 100% igual ao original.
    const respostas = {};
    respostasOrdenadas.forEach((resposta, i) => {
      respostas[`resposta${i + 1}`] = resposta;
    });

    // Retorna a resposta de sucesso no formato da Cloudflare
    return new Response(JSON.stringify({ respostas }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    // Captura qualquer outro erro inesperado e retorna um erro 500.
    console.error("Erro inesperado:", err);
    return new Response(JSON.stringify({ error: "Erro interno ao processar a requisição." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};