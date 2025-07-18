let numeroAlvo = 0;
let modoAtual = 'basico';
let pontos = 0;
let recordeBasico = 0;
let recordeExpressao = 0;
let expressaoMostrada = false;
let expressaoGeradaAntes = false;
let dificuldadeAtual = 'facil';
let tempoPorDificuldade = { facil: 30, medio: 20, dificil: 10 };
let tempoRestante = 0;
let timerInterval = null;

function gerarNumero() {
  let min = 1, max = 9;

  if (dificuldadeAtual === 'medio') {
    min = 10;
    max = 99;
  } else if (dificuldadeAtual === 'dificil') {
    min = 100;
    max = 9999;
  }

  let novoNumero;
  do {
    novoNumero = getRandomInt(min, max);
  } while (novoNumero === numeroAlvo);

  numeroAlvo = novoNumero;
  document.getElementById("randomNumber").innerText = numeroAlvo;
  document.getElementById("expressao").style.display = "none";
  expressaoMostrada = false;
  expressaoGeradaAntes = false;
  atualizarPontuacao();
  resetarSoroban();
  limparFeedback();
  iniciarTimer();
}


// chamados ao inicializar o jogo
mostrarPopupModo(); 

document.querySelectorAll('.cima').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('ativa');
    atualizarValorAtual();
  });
});

document.querySelectorAll('.baixo-container').forEach(container => {
  const botoes = Array.from(container.querySelectorAll('.baixo')).reverse();

  botoes.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const todosAtivos = botoes.every(b => b.classList.contains('ativa'));
      const isAtivo = btn.classList.contains('ativa');

      if (!isAtivo) {
        for (let i = 0; i <= index; i++) {
          botoes[i].classList.add('ativa');
        }
      } else {
        for (let i = index; i < botoes.length; i++) {
          botoes[i].classList.remove('ativa');
        }
      }

      atualizarValorAtual();
    });
  });
});

function calcularValorColuna(coluna) {
  let subtotal = 0;

  const cima = coluna.querySelector('.cima');
  if (cima.classList.contains('ativa')) {
    subtotal += parseInt(cima.getAttribute('data-valor'));
  }

  const baixos = coluna.querySelectorAll('.baixo');
  baixos.forEach(b => {
    if (b.classList.contains('ativa')) {
      subtotal += parseInt(b.getAttribute('data-valor'));
    }
  });

  return subtotal;
}

function calcularValorSoroban() {
  let valorTotal = 0;

  document.querySelectorAll('.coluna').forEach(coluna => {
    const multiplicador = parseInt(coluna.getAttribute('data-multiplicador'));
    const subtotal = calcularValorColuna(coluna);
    valorTotal += subtotal * multiplicador;
  });

  return valorTotal;
}

function limparFeedback() {
  document.querySelectorAll('.coluna').forEach(coluna => {
    coluna.classList.remove('correta', 'errada');
  });
  document.getElementById("resultado").innerText = "";
}

function verificarValor() {
  const valorSoroban = calcularValorSoroban();
  const resultado = document.getElementById("resultado");
  let correto = true;

  limparFeedback();

  document.querySelectorAll('.coluna').forEach(coluna => {
    const multiplicador = parseInt(coluna.getAttribute('data-multiplicador'));
    const subtotal = calcularValorColuna(coluna);
    const valorEsperado = Math.floor(numeroAlvo / multiplicador) % 10;

    if (subtotal === valorEsperado) {
      coluna.classList.add('correta');
    } else {
      coluna.classList.add('errada');
      correto = false;
    }
  });

  if (correto) {
    resultado.innerText = "correto!";
    if (modoAtual === 'expressao') {
      const expressao = document.getElementById("expTexto").innerText;
      resultado.innerText += `\nExpressão: ${expressao}`;
    }
    resultado.style.color = "green";
    pontos++;
    atualizarPontuacao();

    setTimeout(() => {
      limparFeedback();
      if (modoAtual === 'basico') {
        gerarNumero();
        resetarSoroban();
      } else if (modoAtual === 'expressao') {
        iniciarModoExpressao(true);
      }
    }, 1500);
  } else {
    resultado.innerText = `errado! voce colocou: ${valorSoroban}`;
    resultado.style.color = "red";
  }
}

function atualizarPontuacao() {
  document.getElementById("pontosAtuais").innerText = `pontos: ${pontos}`;
  if (modoAtual === 'basico' && pontos > recordeBasico) {
    recordeBasico = pontos;
    document.getElementById("recordeBasico").innerText = `recorde (modo basico): ${recordeBasico}`;
  }
  if (modoAtual === 'expressao' && pontos > recordeExpressao) {
    recordeExpressao = pontos;
    document.getElementById("recordeExpressao").innerText = `recorde (modo expressão): ${recordeExpressao}`;
  }
}

function ativarModoBasico() {
  pontos = 0;
  modoAtual = 'basico';
  atualizarPontuacao();
  document.getElementById("opcoesExpressoes").style.display = "none";
  document.getElementById("expressao").style.display = "none";
  document.getElementById("randomNumber").style.display = "inline";
  document.getElementById("labelNumeroAlvo").style.display = "inline";
  document.getElementById("target").style.display = "block";
  document.getElementById("revelarResultado").style.display = "none";
  document.getElementById("botaoGerarExpressao").innerText = "gerar expressão";
  document.getElementById("resultado").style.display = "block";
  document.getElementById("resultado").innerText = "";
  expressaoGeradaAntes = false;
  expressaoMostrada = false;

  const soroban = document.getElementById("soroban");
  soroban.classList.remove("modo-expressao");
  soroban.classList.add("modo-basico");

  resetarSoroban();
  limparFeedback();
  gerarNumero();
  mostrarPopupModo();
}

function abrirModoExpressoes() {
  pontos = 0;
  modoAtual = 'expressao';
  atualizarPontuacao();
  document.getElementById("opcoesExpressoes").style.display = "block";
  document.getElementById("randomNumber").style.display = "none";
  document.getElementById("labelNumeroAlvo").style.display = "none";
  document.getElementById("target").style.display = "block";
  document.getElementById("revelarResultado").style.display = "block";
  document.getElementById("resultado").style.display = "block";
  document.getElementById("resultado").innerText = "";
  document.getElementById("botaoGerarExpressao").innerText = "gerar expressão";

  expressaoGeradaAntes = false;
  expressaoMostrada = false;

  const soroban = document.getElementById("soroban");
  soroban.classList.remove("modo-basico");
  soroban.classList.add("modo-expressao");

  resetarSoroban();
  limparFeedback();
  pararTimer(); 

  document.getElementById("cronometro").innerText = "tempo: --";
  document.getElementById("avisoTempo").innerText = "escolha os tipos de operações na esquerda e clique em \"gerar expressão\" para iniciar.";
  mostrarPopupModo();
}

function pararTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function iniciarModoExpressao(automatica = false) {
  const operacoes = Array.from(document.querySelectorAll('#opcoesExpressoes input:checked')).map(e => e.value);
  if (operacoes.length === 0) {
    alert("escolha ao menos um tipo de operação.");
    return;
  }

  let a = 1, b = 1, op = "";
  let resultado = 0;
  let tentativa = 0;

  do {
    op = operacoes[Math.floor(Math.random() * operacoes.length)];

    if (dificuldadeAtual === 'facil') {
      a = getRandomInt(1, 9);
      b = getRandomInt(1, 9);
    } else if (dificuldadeAtual === 'medio') {
      a = getRandomInt(10, 99);
      b = op === '/' ? getRandomInt(1, 9) : getRandomInt(10, 99);
    } else if (dificuldadeAtual === 'dificil') {
      a = getRandomInt(100, 9999);
      b = op === '/' ? getRandomInt(1, 99) : getRandomInt(1, 999);
    }

    if (op === "/") {
      a = b * getRandomInt(1, Math.floor(9999 / b)); 
    }

    resultado = Math.floor(eval(`${a} ${op} ${b}`));
    tentativa++;
    if (tentativa > 20) break;

  } while (
    resultado < 0 ||
    resultado > 9999 ||
    (op === '-' && a - b < 0)
  );

  if (resultado === numeroAlvo && tentativa < 20) {
      iniciarModoExpressao(automatica);
      return;
  }
  numeroAlvo = resultado;

  const expressao = `${a} ${op} ${b}`;

  document.getElementById("expTexto").innerText = expressao;
  document.getElementById("expressao").style.display = "block";
  document.getElementById("randomNumber").innerText = numeroAlvo;
  resetarSoroban();
  limparFeedback(); 

  if (!expressaoGeradaAntes && !automatica) {
    expressaoGeradaAntes = true;
    document.getElementById("botaoGerarExpressao").innerText = "regerar expressão";
  }

  expressaoMostrada = false;
  document.querySelector('#revelarResultado button').innerText = "revelar resultado";
  document.getElementById("resultado").innerText = "";

  iniciarTimer();
}

// metodo pronto pra gerar num aleatorio
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mostrarResultado() {
  const btn = document.querySelector('#revelarResultado button');
  const resultado = document.getElementById("resultado");

  if (modoAtual === 'expressao') {
    if (!expressaoMostrada) {
      resultado.innerText = `Resultado: ${numeroAlvo}`;
      resultado.style.color = "yellow";
      btn.innerText = "esconder resultado";
      expressaoMostrada = true;
    } else {
      resultado.innerText = "";
      btn.innerText = "revelar resultado";
      expressaoMostrada = false;
    }
  } else {
    resultado.innerText = `resultado: ${numeroAlvo}`;
    resultado.style.color = "yellow";
  }
}

function resetarSoroban() {
  document.querySelectorAll('.cima').forEach(btn => btn.classList.remove('ativa'));
  document.querySelectorAll('.baixo').forEach(btn => btn.classList.remove('ativa'));
  atualizarValorAtual();
}

function mostrarPopupModo() {
  const popup = document.getElementById("popupModo");
  const mensagem = document.getElementById("mensagemModo");

  if (modoAtual === 'basico') {
    mensagem.innerText = "voce esta no modo basico.\nmonte o numero exibido usando o soroban.";
  } else if (modoAtual === 'expressao') {
    mensagem.innerText = "voce esta no modo expressão.\nresolva a expressão e represente o resultado no soroban.";
  }

  popup.style.display = "flex";
}


function fecharPopupModo() {
  document.getElementById("popupModo").style.display = "none";
}

function selecionarDificuldade(nivel) {
  dificuldadeAtual = nivel;
  vidasAtuais = dificuldadeMaxVidas();
  atualizarCoracoes();
  fecharPopupModo();
  if (modoAtual === 'basico') {
    gerarNumero();
  } else if (modoAtual === 'expressao') {
    document.getElementById("opcoesExpressoes").style.display = "block";
  }
}


function iniciarTimer() {
  clearInterval(timerInterval);
  tempoRestante = tempoPorDificuldade[dificuldadeAtual];
  atualizarCronometro();

  timerInterval = setInterval(() => {
    tempoRestante--;
    atualizarCronometro();

    if (tempoRestante <= 0) {
      clearInterval(timerInterval);
      document.getElementById("avisoTempo").innerText = "tempo esgotado!"; // o tempo n esgota mais pq é gerado nova expressao mas deixei no caso de futuras alterações e con trole das vidas

      perderVida(); 

      if (vidasAtuais > 0) {
        resetarSoroban();
        limparFeedback();

        if (modoAtual === 'basico') {
          gerarNumero();
        } else if (modoAtual === 'expressao') {
          iniciarModoExpressao(true);
        }

        iniciarTimer(); 
      }
    }
  }, 1000);
}


function atualizarCronometro() {
  document.getElementById("cronometro").innerText = `Tempo: ${tempoRestante}s`;
  document.getElementById("avisoTempo").innerText = ""; 
}

//valor atual interagindo com as bolinhas que o jogador clica, no modo
function atualizarValorAtual() {
  const valorAtualDiv = document.getElementById('valorAtual');

  // so mostra se estiver no modo basico e na dificuldade facil
  if (modoAtual === 'basico' && dificuldadeAtual === 'facil') {
    const valor = calcularValorSoroban();
    valorAtualDiv.innerText = `valor atual: ${valor}`;
    valorAtualDiv.style.display = "block";
  } else {
    valorAtualDiv.style.display = "none";
  }
}


//tutorial
const btnTutorial = document.getElementById('btnTutorial');
const tutorialContainer = document.getElementById('tutorialContainer');
const tutorialTexto = document.getElementById('tutorialTexto');
const btnTutorialVoltar = document.getElementById('btnTutorialVoltar');
const btnTutorialProximo = document.getElementById('btnTutorialProximo');
const btnTutorialSair = document.getElementById('btnTutorialSair');

btnTutorial.addEventListener('click', iniciarTutorial);
btnTutorialVoltar.addEventListener('click', etapaAnteriorTutorial);
btnTutorialProximo.addEventListener('click', proximaEtapaTutorial);
btnTutorialSair.addEventListener('click', fecharTutorial);

const etapasTutorial = [
  {
    texto: "bem-vindo ao jogo do soroban! vamos aprender a jogar passo a passo.",
  },
  {
    texto: "este é o número que você precisa montar no ábaco.",
    destaque: "#randomNumber"
  },
  {
    texto: "essas bolinhas acima são as superiores (valem 5). clique para ativá-las.",
    destaque: ".cima"
  },
  {
    texto: "essas abaixo valem 1. clique e veja como somam o total da coluna.",
    destaque: ".baixo"
  },
  {
    texto: "cada coluna representa uma casa decimal: unidade, dezena, centena...",
    destaque: ".coluna[data-multiplicador='1']"
  },
  {
    texto: "use as bolinhas para montar o número exibido e clique em 'verificar'.",
    destaque: "#botaoVerificar"
  },
  {
    texto: "agora, explore o modo de expressões para resolver cálculos!",
    destaque: "#expTexto"
  },
  {
    texto: "isso é tudo! boa sorte e divirta-se com o soroban!"
  }
];

let etapaAtual = 0;

function iniciarTutorial() {
  etapaAtual = 0;
  tutorialContainer.style.display = "block";
  mostrarEtapaTutorial();
  btnTutorialVoltar.disabled = true;
  btnTutorialVoltar.setAttribute('aria-disabled', 'true');
}

function mostrarEtapaTutorial() {
  const etapa = etapasTutorial[etapaAtual];
  tutorialTexto.innerText = etapa.texto;

  // remove destaques anteriores
  document.querySelectorAll(".destaque").forEach(el => {
    el.classList.remove("destaque");
  });

  // adiciona destaque na etapa atual
  if (etapa.destaque) {
    document.querySelectorAll(etapa.destaque).forEach(el => {
      el.classList.add("destaque");
      el.scrollIntoView({behavior: "smooth", block: "center"});
    });
  }

  // controlar botões
  btnTutorialVoltar.disabled = etapaAtual === 0;
  btnTutorialVoltar.setAttribute('aria-disabled', etapaAtual === 0 ? 'true' : 'false');
  btnTutorialProximo.disabled = etapaAtual === etapasTutorial.length - 1;
  btnTutorialProximo.setAttribute('aria-disabled', etapaAtual === etapasTutorial.length - 1 ? 'true' : 'false');
}

function proximaEtapaTutorial() {
  if (etapaAtual < etapasTutorial.length - 1) {
    etapaAtual++;
    mostrarEtapaTutorial();
  }
}

function etapaAnteriorTutorial() {
  if (etapaAtual > 0) {
    etapaAtual--;
    mostrarEtapaTutorial();
  }
}

function fecharTutorial() {
  tutorialContainer.style.display = "none";
  document.querySelectorAll(".destaque").forEach(el => el.classList.remove("destaque"));
  btnTutorial.focus();
}

// vidas
let vidasAtuais = 0;
let intervalo;
const coracoesContainer = document.createElement('div');
coracoesContainer.id = 'coracoes';
document.querySelector('.principal').insertBefore(coracoesContainer, document.getElementById('target'));

/*function atualizarCoracoes() {
  coracoesContainer.innerHTML = '';
  for (let i = 0; i < dificuldadeMaxVidas(); i++) {
    const coracao = document.createElement('span');
    coracao.classList.add('coracao');
    if (i < vidasAtuais) {
      coracao.classList.add('cheio');
    } else {
      coracao.classList.add('vazio');
    }
    coracoesContainer.appendChild(coracao);
  }
}*/
function atualizarCoracoes() {
  coracoesContainer.innerHTML = '';
  
  if (vidasAtuais > 0) {
    for (let i = 0; i < dificuldadeMaxVidas(); i++) {
      const coracao = document.createElement('span');
      coracao.classList.add('coracao');
      if (i < vidasAtuais) {
        coracao.classList.add('cheio');
      } else {
        coracao.classList.add('vazio');
      }
      coracoesContainer.appendChild(coracao);
    }
  } else {
    coracoesContainer.textContent = 'nao possui mais vidas.';
  }
}


function dificuldadeMaxVidas() {
  switch (dificuldadeAtual) {
    case 'facil': return 5;
    case 'medio': return 3;
    case 'dificil': return 2;
    default: return 5;
  }
}

function perderVida() {
  vidasAtuais--;
  atualizarCoracoes();
  if (vidasAtuais <= 0) {
    exibirGameOver();
  }
}

function exibirGameOver() {
  clearInterval(intervalo);
  alert('game over! escolha uma dificuldade para tentar novamente.');
  mostrarPopupModo();
}

function iniciarModoSelecionado() {
  if (modoAtual === 'basico') {
    gerarNumero();
  } else if (modoAtual === 'expressao') {
    document.getElementById("opcoesExpressoes").style.display = "block";
  }
}

function selecionarDificuldade(nivel) {
  dificuldadeAtual = nivel;
  vidasAtuais = dificuldadeMaxVidas();
  atualizarCoracoes();
  fecharPopupModo();
  iniciarModoSelecionado();
}

function cronometroAcabou() {
  perderVida();
  if (vidasAtuais > 0) {
    if (modoAtual === 'basico') {
      gerarNovoNumero();
    } else if (modoAtual === 'expressao') {
      gerarExpressao();
    }
    reiniciarTempo();
  }
}
