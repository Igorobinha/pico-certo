/* Regiões e picos do Pico Certo.
 *
 * Cada região agrupa os picos de uma mesma praia ou cidade. Em cada pico:
 *   facing = para onde a praia "olha" (a direção do mar, vista da areia), em graus:
 *            0 = norte, 90 = leste, 135 = sudeste, 180 = sul, 270 = oeste.
 *            É com isso que o app decide se o vento é terral ou maral e se a ondulação entra de frente.
 *   aproximado: true = posição estimada. No app, o botão "Estou no pico: salvar posição" corrige.
 *   acesso: [lat, lon] (opcional) = onde estacionar, se for longe do pico. A rota leva até lá.
 *   ficha (opcional) = o que o surfista local sabe do pico. Tudo dentro dela é opcional:
 *     fundo:     'areia' | 'coral' | 'pedra' | 'areia e pedra'
 *     mare:      'cheia' | 'meia-cheia' | 'meia' | 'meia-seca' | 'seca' | 'enchendo' | 'vazando' | 'qualquer'
 *                (a nota cai fora dessa maré; sem esse campo, o app prevê pelo fundo e avisa que é previsão)
 *     fonte:     de onde veio a informação, aparece na ficha
 *     ondulacao: ['S', 'SE']   melhores direções da ondulação: N, NE, L, SE, S, SO, O, NO (a nota cai com as outras)
 *     nivel:     'iniciante' | 'intermediario' | 'avancado'   (o app avisa quem tem nível abaixo)
 *     perigos:   'Pedras no canto esquerdo, corrente forte na vazante'
 *     estrutura: 'Estacionamento na orla, ducha, quiosques'
 *     dica:      'Funciona melhor de manhã com terral'
 */
window.REGIOES = [

  // Espírito Santo
  { id: 'itaunas', nome: 'Itaúnas', cidade: 'Conceição da Barra, ES', picos: [
    { id: 'itaunas', nome: 'Itaúnas', lat: -18.4300, lon: -39.7000, facing: 110 },
  ] },
  { id: 'guriri', nome: 'Guriri', cidade: 'São Mateus, ES', picos: [
    { id: 'guriri', nome: 'Guriri', lat: -18.7300, lon: -39.7400, facing: 90 },
  ] },
  { id: 'regencia', nome: 'Regência', cidade: 'Linhares, ES', picos: [
    { id: 'regencia', nome: 'Regência', lat: -19.6707, lon: -39.8777, facing: 160 },
    { id: 'povoacao', nome: 'Povoação', lat: -19.5805, lon: -39.7906, facing: 115 },
  ] },
  { id: 'aracruz', nome: 'Aracruz', cidade: 'Aracruz, ES', picos: [
    { id: 'barra-do-sahy', nome: 'Barra do Sahy', lat: -19.8800, lon: -40.0800, facing: 135 },
    { id: 'coqueiral', nome: 'Coqueiral', lat: -19.9317, lon: -40.1409, facing: 120 },
  ] },
  { id: 'fundao', nome: 'Fundão', cidade: 'Fundão, ES', picos: [
    { id: 'praia-grande-fundao', nome: 'Praia Grande', lat: -20.0449, lon: -40.1894, facing: 115 },
  ] },
  { id: 'nova-almeida', nome: 'Nova Almeida', cidade: 'Serra, ES', picos: [
    { id: 'nova-almeida', nome: 'Nova Almeida', lat: -20.0500, lon: -40.1900, facing: 105 },
  ] },
  { id: 'jacaraipe', nome: 'Jacaraípe', cidade: 'Serra, ES', picos: [
    { id: 'coral-de-castelandia', nome: 'Coral de Castelândia', lat: -20.1280, lon: -40.1800, facing: 100, aproximado: true,
      ficha: { fundo: 'coral' } },
    { id: 'curva-da-baleia', nome: 'Curva da Baleia', lat: -20.1380, lon: -40.1820, facing: 100, aproximado: true },
    { id: 'jeffreys-bay', nome: 'Jeffreys Bay', lat: -20.1450, lon: -40.1840, facing: 100, aproximado: true },
    { id: 'barrote', nome: 'Barrote', lat: -20.1500, lon: -40.1850, facing: 100, aproximado: true },
    { id: 'coral-do-cha', nome: 'Coral do Chá', lat: -20.1570, lon: -40.1870, facing: 100, aproximado: true,
      ficha: { fundo: 'coral' } },
    { id: 'solemar', nome: 'Solemar', lat: -20.1680, lon: -40.1900, facing: 100, aproximado: true, ficha: { mare: 'cheia' } },
    { id: 'pracinha', nome: 'Pracinha', lat: -20.1465, lon: -40.1840, facing: 100, aproximado: true },
    { id: 'amigao', nome: 'Amigão', lat: -20.1535, lon: -40.1860, facing: 100, aproximado: true },
  ] },
  { id: 'manguinhos', nome: 'Manguinhos', cidade: 'Serra, ES', picos: [
    { id: 'manguinhos', nome: 'Manguinhos', lat: -20.1900, lon: -40.1900, facing: 110 },
  ] },
  { id: 'vila-velha', nome: 'Vila Velha', cidade: 'Vila Velha, ES', picos: [
    { id: 'praia-da-costa', nome: 'Praia da Costa', lat: -20.3400, lon: -40.2800, facing: 115 },
    { id: 'itapua', nome: 'Itapuã', lat: -20.3527, lon: -40.2835, facing: 90 },
    { id: 'barra-do-jucu', nome: 'Barra do Jucu', lat: -20.4300, lon: -40.3200, facing: 105 },
    { id: 'ponta-da-fruta', nome: 'Ponta da Fruta', lat: -20.5200, lon: -40.3600, facing: 165 },
  ] },
  { id: 'guarapari', nome: 'Guarapari', cidade: 'Guarapari, ES', picos: [
    { id: 'setiba', nome: 'Setiba', lat: -20.6300, lon: -40.4300, facing: 95 },
    { id: 'praia-do-morro', nome: 'Praia do Morro', lat: -20.6500, lon: -40.4900, facing: 155 },
    { id: 'meaipe', nome: 'Meaípe', lat: -20.7400, lon: -40.5400, facing: 185 },
    { id: 'ule', nome: 'Ulé', lat: -20.5628, lon: -40.3950, facing: 115 },
    { id: 'enseada-azul', nome: 'Enseada Azul', lat: -20.7224, lon: -40.5242, facing: 110 },
    { id: 'peracanga', nome: 'Peracanga', lat: -20.7195, lon: -40.5210, facing: 115, aproximado: true },
    { id: 'bacutia', nome: 'Bacutia', lat: -20.7165, lon: -40.5170, facing: 120, aproximado: true },
  ] },
  { id: 'anchieta', nome: 'Anchieta', cidade: 'Anchieta, ES', picos: [
    { id: 'ubu', nome: 'Ubu', lat: -20.8000, lon: -40.5900, facing: 190 },
    { id: 'iriri', nome: 'Iriri', lat: -20.8311, lon: -40.6942, facing: 110 },
  ] },
  { id: 'marataizes', nome: 'Marataízes', cidade: 'Marataízes, ES', picos: [
    { id: 'marataizes', nome: 'Marataízes', lat: -21.0400, lon: -40.8300, facing: 145 },
  ] },

  // Bahia
  { id: 'salvador', nome: 'Salvador', cidade: 'Salvador, BA', picos: [
    { id: 'stella-maris', nome: 'Stella Maris', lat: -12.9400, lon: -38.3300, facing: 135 },
    { id: 'flamengo-ssa', nome: 'Flamengo', lat: -12.9288, lon: -38.3180, facing: 130 },
    { id: 'jaguaribe', nome: 'Jaguaribe', lat: -12.9576, lon: -38.3898, facing: 150 },
    { id: 'farol-da-barra', nome: 'Farol da Barra', lat: -13.0103, lon: -38.5329, facing: 170 },
  ] },
  { id: 'itacare', nome: 'Itacaré', cidade: 'Itacaré, BA', picos: [
    { id: 'tiririca', nome: 'Tiririca', lat: -14.2861, lon: -38.9854, facing: 95 },
    { id: 'engenhoca', nome: 'Engenhoca', lat: -14.3529, lon: -39.0022, facing: 100 },
    { id: 'havaizinho', nome: 'Havaizinho', lat: -14.3603, lon: -39.0045, facing: 100 },
    { id: 'itacarezinho', nome: 'Itacarezinho', lat: -14.3816, lon: -39.0101, facing: 100 },
    { id: 'jeribucacu', nome: 'Jeribucaçu', lat: -14.3380, lon: -38.9985, facing: 100, aproximado: true },
  ] },

  // Alagoas
  { id: 'maceio', nome: 'Maceió', cidade: 'Maceió, AL', picos: [
    { id: 'cruz-das-almas', nome: 'Cruz das Almas', lat: -9.6289, lon: -35.6950, facing: 110 },
    { id: 'jacarecica', nome: 'Jacarecica', lat: -9.6135, lon: -35.6905, facing: 105, aproximado: true },
  ] },

  // Pernambuco
  { id: 'noronha', nome: 'Fernando de Noronha', cidade: 'Fernando de Noronha, PE', picos: [
    { id: 'cacimba', nome: 'Cacimba do Padre', lat: -3.8400, lon: -32.4400, facing: 330 },
    { id: 'boldro', nome: 'Boldró', lat: -3.8451, lon: -32.4281, facing: 355 },
    { id: 'conceicao-noronha', nome: 'Conceição', lat: -3.8409, lon: -32.4163, facing: 330 },
  ] },
  { id: 'cabo-santo-agostinho', nome: 'Cabo de Santo Agostinho', cidade: 'Cabo de Santo Agostinho, PE', picos: [
    { id: 'enseada-dos-corais', nome: 'Enseada dos Corais', lat: -8.3101, lon: -34.9540, facing: 105 },
  ] },
  { id: 'ipojuca', nome: 'Ipojuca', cidade: 'Ipojuca, PE', picos: [
    { id: 'maracaipe', nome: 'Maracaípe', lat: -8.5300, lon: -35.0100, facing: 95 },
  ] },

  // Rio Grande do Norte
  { id: 'pipa', nome: 'Pipa', cidade: 'Tibau do Sul, RN', picos: [
    { id: 'pipa', nome: 'Praia do Amor', lat: -6.2300, lon: -35.0500, facing: 80 },
    { id: 'madeiro', nome: 'Madeiro', lat: -6.2125, lon: -35.0445, facing: 85, aproximado: true },
  ] },
  { id: 'natal', nome: 'Natal', cidade: 'Natal, RN', picos: [
    { id: 'ponta-negra', nome: 'Ponta Negra', lat: -5.8736, lon: -35.1766, facing: 65 },
  ] },
  { id: 'baia-formosa', nome: 'Baía Formosa', cidade: 'Baía Formosa, RN', picos: [
    { id: 'pontal-baia-formosa', nome: 'Pontal', lat: -6.3692, lon: -35.0064, facing: 5, aproximado: true },
  ] },

  // Ceará
  { id: 'taiba', nome: 'Taíba', cidade: 'São Gonçalo do Amarante, CE', picos: [
    { id: 'taiba', nome: 'Taíba', lat: -3.5100, lon: -38.9000, facing: 355 },
  ] },
  { id: 'fortaleza', nome: 'Fortaleza', cidade: 'Fortaleza, CE', picos: [
    { id: 'iracema', nome: 'Praia de Iracema', lat: -3.7206, lon: -38.5085, facing: 30 },
    { id: 'praia-do-futuro', nome: 'Praia do Futuro', lat: -3.7312, lon: -38.4564, facing: 60 },
  ] },
  { id: 'paracuru', nome: 'Paracuru', cidade: 'Paracuru, CE', picos: [
    { id: 'paracuru', nome: 'Paracuru', lat: -3.4105, lon: -39.0558, facing: 20 },
  ] },
  { id: 'amontada', nome: 'Icaraí de Amontada', cidade: 'Amontada, CE', picos: [
    { id: 'icarai-amontada', nome: 'Icaraí de Amontada', lat: -3.0243, lon: -39.6471, facing: 345 },
  ] },

  // Rio de Janeiro
  { id: 'macae', nome: 'Macaé', cidade: 'Macaé, RJ', picos: [
    { id: 'cavaleiros', nome: 'Cavaleiros', lat: -22.4071, lon: -41.8006, facing: 75 },
  ] },
  { id: 'rio-das-ostras', nome: 'Rio das Ostras', cidade: 'Rio das Ostras, RJ', picos: [
    { id: 'costazul', nome: 'Costazul', lat: -22.5071, lon: -41.9098, facing: 125 },
  ] },
  { id: 'buzios', nome: 'Búzios', cidade: 'Armação dos Búzios, RJ', picos: [
    { id: 'geriba', nome: 'Geribá', lat: -22.7800, lon: -41.9100, facing: 155 },
  ] },
  { id: 'cabo-frio', nome: 'Cabo Frio', cidade: 'Cabo Frio, RJ', picos: [
    { id: 'praia-do-forte-cf', nome: 'Praia do Forte', lat: -22.8866, lon: -42.0182, facing: 135 },
  ] },
  { id: 'saquarema', nome: 'Saquarema', cidade: 'Saquarema, RJ', picos: [
    { id: 'itauna', nome: 'Itaúna', lat: -22.9360, lon: -42.4825, facing: 190 },
  ] },
  { id: 'arraial', nome: 'Arraial do Cabo', cidade: 'Arraial do Cabo, RJ', picos: [
    { id: 'praia-grande-arraial', nome: 'Praia Grande', lat: -22.9707, lon: -42.0333, facing: 230 },
  ] },
  { id: 'niteroi', nome: 'Niterói', cidade: 'Niterói, RJ', picos: [
    { id: 'itacoatiara', nome: 'Itacoatiara', lat: -22.9750, lon: -43.0300, facing: 200 },
  ] },
  { id: 'rio', nome: 'Rio de Janeiro', cidade: 'Rio de Janeiro, RJ', picos: [
    { id: 'arpoador', nome: 'Arpoador', lat: -22.9890, lon: -43.1920, facing: 205 },
    { id: 'barra-tijuca', nome: 'Barra da Tijuca', lat: -23.0120, lon: -43.3600, facing: 180 },
    { id: 'prainha', nome: 'Prainha', lat: -23.0410, lon: -43.5060, facing: 150 },
    { id: 'leblon', nome: 'Leblon', lat: -22.9879, lon: -43.2244, facing: 165 },
    { id: 'recreio', nome: 'Recreio', lat: -23.0282, lon: -43.4642, facing: 155 },
    { id: 'grumari', nome: 'Grumari', lat: -23.0502, lon: -43.5342, facing: 155 },
  ] },

  // São Paulo
  { id: 'ubatuba', nome: 'Ubatuba', cidade: 'Ubatuba, SP', picos: [
    { id: 'itamambuca', nome: 'Itamambuca', lat: -23.4000, lon: -45.0100, facing: 145 },
    { id: 'vermelha-do-norte', nome: 'Vermelha do Norte', lat: -23.4177, lon: -45.0372, facing: 135 },
    { id: 'felix', nome: 'Félix', lat: -23.3893, lon: -44.9716, facing: 135 },
  ] },
  { id: 'sao-sebastiao', nome: 'São Sebastião', cidade: 'São Sebastião, SP', picos: [
    { id: 'maresias', nome: 'Maresias', lat: -23.7900, lon: -45.5600, facing: 195 },
    { id: 'camburi', nome: 'Camburi', lat: -23.7745, lon: -45.6545, facing: 180, aproximado: true },
    { id: 'juquehy', nome: 'Juquehy', lat: -23.7652, lon: -45.7247, facing: 200 },
  ] },
  { id: 'sao-vicente', nome: 'São Vicente', cidade: 'São Vicente, SP', picos: [
    { id: 'itarare', nome: 'Itararé', lat: -23.9736, lon: -46.3683, facing: 135 },
  ] },
  { id: 'santos', nome: 'Santos', cidade: 'Santos, SP', picos: [
    { id: 'ponta-da-praia', nome: 'Ponta da Praia', lat: -23.9862, lon: -46.3018, facing: 170, aproximado: true },
  ] },
  { id: 'guaruja', nome: 'Guarujá', cidade: 'Guarujá, SP', picos: [
    { id: 'pitangueiras', nome: 'Pitangueiras', lat: -24.0000, lon: -46.2600, facing: 160 },
    { id: 'tombo', nome: 'Tombo', lat: -24.0144, lon: -46.2733, facing: 145 },
    { id: 'asturias', nome: 'Astúrias', lat: -24.0075, lon: -46.2686, facing: 100 },
    { id: 'pernambuco-guaruja', nome: 'Pernambuco', lat: -23.9663, lon: -46.1855, facing: 100 },
  ] },

  // Paraná
  { id: 'matinhos', nome: 'Matinhos', cidade: 'Matinhos, PR', picos: [
    { id: 'matinhos', nome: 'Matinhos', lat: -25.8200, lon: -48.5300, facing: 130 },
    { id: 'brava-caioba', nome: 'Brava de Caiobá', lat: -25.8327, lon: -48.5395, facing: 105 },
  ] },

  // Santa Catarina
  { id: 'itajai', nome: 'Itajaí', cidade: 'Itajaí, SC', picos: [
    { id: 'brava-itajai', nome: 'Praia Brava', lat: -26.9489, lon: -48.6372, facing: 90 },
  ] },
  { id: 'bombinhas', nome: 'Bombinhas', cidade: 'Bombinhas, SC', picos: [
    { id: 'quatro-ilhas', nome: 'Quatro Ilhas', lat: -27.1569, lon: -48.4849, facing: 120 },
  ] },
  { id: 'florianopolis', nome: 'Florianópolis', cidade: 'Florianópolis, SC', picos: [
    { id: 'praia-mole-sc', nome: 'Praia Mole', lat: -27.6000, lon: -48.4300, facing: 130 },
    { id: 'joaquina', nome: 'Joaquina', lat: -27.6300, lon: -48.4500, facing: 140 },
    { id: 'campeche', nome: 'Campeche', lat: -27.6859, lon: -48.4805, facing: 100 },
    { id: 'barra-da-lagoa', nome: 'Barra da Lagoa', lat: -27.5713, lon: -48.4270, facing: 60 },
    { id: 'santinho', nome: 'Santinho', lat: -27.4584, lon: -48.3750, facing: 110 },
    { id: 'mocambique', nome: 'Moçambique', lat: -27.5241, lon: -48.4172, facing: 115 },
    { id: 'matadeiro', nome: 'Matadeiro', lat: -27.7544, lon: -48.4990, facing: 65 },
  ] },
  { id: 'guarda', nome: 'Guarda do Embaú', cidade: 'Palhoça, SC', picos: [
    { id: 'guarda', nome: 'Guarda do Embaú', lat: -27.9041, lon: -48.5867, facing: 110 },
  ] },
  { id: 'garopaba', nome: 'Garopaba', cidade: 'Garopaba, SC', picos: [
    { id: 'silveira', nome: 'Silveira', lat: -28.0300, lon: -48.6100, facing: 135 },
    { id: 'ferrugem', nome: 'Ferrugem', lat: -28.0784, lon: -48.6282, facing: 95 },
  ] },
  { id: 'imbituba', nome: 'Imbituba', cidade: 'Imbituba, SC', picos: [
    { id: 'praia-da-vila', nome: 'Praia da Vila', lat: -28.2801, lon: -48.6912, facing: 115 },
    { id: 'rosa', nome: 'Rosa', lat: -28.1295, lon: -48.6417, facing: 105 },
    { id: 'ribanceira', nome: 'Ribanceira', lat: -28.1917, lon: -48.6619, facing: 65 },
  ] },
  { id: 'laguna', nome: 'Laguna', cidade: 'Laguna, SC', picos: [
    { id: 'mar-grosso', nome: 'Mar Grosso', lat: -28.4828, lon: -48.7658, facing: 85 },
  ] },

  // Rio Grande do Sul
  { id: 'torres', nome: 'Torres', cidade: 'Torres, RS', picos: [
    { id: 'torres', nome: 'Prainha', lat: -29.3400, lon: -49.7200, facing: 115 },
    { id: 'praia-grande-torres', nome: 'Praia Grande', lat: -29.3366, lon: -49.7228, facing: 125 },
    { id: 'cal', nome: 'Praia da Cal', lat: -29.3469, lon: -49.7317, facing: 125 },
  ] },
  { id: 'tramandai', nome: 'Tramandaí', cidade: 'Tramandaí, RS', picos: [
    { id: 'tramandai', nome: 'Tramandaí', lat: -29.9909, lon: -50.1258, facing: 105 },
  ] },
];
