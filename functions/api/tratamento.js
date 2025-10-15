export const onRequestPost = async ({ request }) => {
  try {
    // 1. Pega o corpo da requisição e converte o JSON principal
    const body = await request.json();
    const respostasComoString = body.respostas;

    // 2. Valida se o campo "respostas" existe e é uma string
    if (!respostasComoString || typeof respostasComoString !== 'string') {
      return new Response(
        JSON.stringify({
          error: 'O corpo deve ser um JSON com a chave "respostas" contendo um JSON em formato de string.',
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Converte a string interna em um objeto JSON utilizável
    const jsonInterno = JSON.parse(respostasComoString);

    // 4. Extrai, ordena e trata as respostas (lógica original)
    const respostasOrdenadas = Object.keys(jsonInterno)
      .filter((key) => key.toLowerCase().includes("resposta"))
      .sort((a, b) => {
        // Garante que a ordenação não quebre se o padrão não for encontrado
        const matchA = a.match(/screen_(\d+)_/);
        const matchB = b.match(/screen_(\d+)_/);
        if (!matchA || !matchB) return 0;

        const numA = parseInt(matchA[1]);
        const numB = parseInt(matchB[1]);
        return numA - numB;
      })
      .map((key) => {
        let valor = jsonInterno[key];
        valor = valor.replace(/^\d+_/, "");
        valor = valor.replace(/_/g, " "); 
        return valor;
      });

    // 5. Junta todas as frases limpas em uma única string
    const textoFinal = respostasOrdenadas.join(" ");

    // 6. Monta o objeto de resposta final no formato solicitado
    const corpoDaResposta = {
      respostas: textoFinal,
    };

    // Retorna a resposta de sucesso
    return new Response(JSON.stringify(corpoDaResposta), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    // Captura erros (ex: JSON mal formatado)
    console.error("Erro inesperado:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno ou JSON inválido na requisição." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};