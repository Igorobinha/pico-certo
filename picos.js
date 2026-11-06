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
    { id: 'guriri', nome: 'Guriri', lat: -18.7300, lon: -39.7400, facing: 90, ficha: { fundo: 'areia', ondulacao: ['L', 'SE'], nivel: 'todos', perigos: 'Correntes de retorno fortes. Fica muito cheio no verão.', fonte: 'mondo.surf, surf-forecast.com' } },
  ] },
  { id: 'regencia', nome: 'Regência', cidade: 'Linhares, ES', picos: [
    { id: 'regencia', nome: 'Regência', lat: -19.6707, lon: -39.8777, facing: 160, ficha: { fundo: 'areia', mare: 'meia-seca', ondulacao: ['L', 'SE', 'S'], nivel: 'avancado', perigos: 'Correnteza forte na arrebentação, que exige remada pesada. Há relatos de tubarões na região.', estrutura: 'Praia com ninhos de tartaruga protegidos e só dois estacionamentos. O acesso tem trechos sem asfalto.', fonte: 'mondo.surf, wannasurf.com, surf-forecast.com' } },
    { id: 'povoacao', nome: 'Povoação', lat: -19.5805, lon: -39.7906, facing: 115, ficha: { nivel: 'avancado', perigos: 'Ondas fortes e pesadas, com tubos rápidos.', fonte: 'A Gazeta' } },
  ] },
  { id: 'aracruz', nome: 'Aracruz', cidade: 'Aracruz, ES', picos: [
    { id: 'barra-do-sahy', nome: 'Barra do Sahy', lat: -19.8800, lon: -40.0800, facing: 135, ficha: { fundo: 'pedra', nivel: 'avancado', perigos: 'Fundo de pedra em toda a extensão. Na maré seca aparecem corais e a remada até a onda chega a uns 20 minutos.', estrutura: 'A direita é das melhores do estado. O trecho do Xangão tem ondas mais fortes.', fonte: 'A Gazeta' } },
    { id: 'coqueiral', nome: 'Coqueiral', lat: -19.9317, lon: -40.1409, facing: 120 },
  ] },
  { id: 'fundao', nome: 'Fundão', cidade: 'Fundão, ES', picos: [
    { id: 'praia-grande-fundao', nome: 'Praia Grande', lat: -20.0449, lon: -40.1894, facing: 115 },
  ] },
  { id: 'nova-almeida', nome: 'Nova Almeida', cidade: 'Serra, ES', picos: [
    { id: 'nova-almeida', nome: 'Nova Almeida', lat: -20.0500, lon: -40.1900, facing: 105, ficha: { fundo: 'coral', ondulacao: ['S'], perigos: 'Coral e pedras.', fonte: 'surf-forecast.com' } },
  ] },
  { id: 'jacaraipe', nome: 'Jacaraípe', cidade: 'Serra, ES', picos: [
    { id: 'coral-de-castelandia', nome: 'Coral de Castelândia', lat: -20.1280, lon: -40.1800, facing: 100, aproximado: true,
      ficha: { fundo: 'coral' } },
    { id: 'curva-da-baleia', nome: 'Curva da Baleia', lat: -20.1380, lon: -40.1820, facing: 100, aproximado: true },
    { id: 'jeffreys-bay', nome: 'Jeffreys Bay', lat: -20.1450, lon: -40.1840, facing: 100, aproximado: true },
    { id: 'barrote', nome: 'Barrote', lat: -20.1500, lon: -40.1850, facing: 100, aproximado: true, ficha: { fundo: 'areia', ondulacao: ['NE', 'L', 'SE'], nivel: 'todos', perigos: 'Correntes de retorno e algum localismo.', estrutura: 'Beach break de esquerda e direita, com ondas curtas. No verão costuma ficar flat.', fonte: 'mondo.surf' } },
    { id: 'coral-do-cha', nome: 'Coral do Chá', lat: -20.1570, lon: -40.1870, facing: 100, aproximado: true,
      ficha: { fundo: 'coral' } },
    { id: 'solemar', nome: 'Solemar', lat: -20.1680, lon: -40.1900, facing: 100, aproximado: true, ficha: { fundo: 'areia', mare: 'cheia', ondulacao: ['NE', 'L', 'SE'], nivel: 'todos', perigos: 'O localismo pode ser forte e costuma ficar cheio. Fique de olho nos seus pertences.', estrutura: 'Onda fácil e lenta, boa para iniciantes.', fonte: 'surfista local, mondo.surf, A Gazeta' } },
    { id: 'pracinha', nome: 'Pracinha', lat: -20.1465, lon: -40.1840, facing: 100, aproximado: true },
    { id: 'amigao', nome: 'Amigão', lat: -20.1535, lon: -40.1860, facing: 100, aproximado: true },
  ] },
  { id: 'manguinhos', nome: 'Manguinhos', cidade: 'Serra, ES', picos: [
    { id: 'manguinhos', nome: 'Manguinhos', lat: -20.1900, lon: -40.1900, facing: 110, ficha: { fundo: 'coral', mare: 'meia', ondulacao: ['S'], perigos: 'Coral e pedras. Às vezes fica cheio.', estrutura: 'Recife exposto, com onda de direita.', fonte: 'surf-forecast.com' } },
  ] },
  { id: 'vila-velha', nome: 'Vila Velha', cidade: 'Vila Velha, ES', picos: [
    { id: 'praia-da-costa', nome: 'Praia da Costa', lat: -20.3400, lon: -40.2800, facing: 115 },
    { id: 'itapua', nome: 'Itapuã', lat: -20.3527, lon: -40.2835, facing: 90 },
    { id: 'barra-do-jucu', nome: 'Barra do Jucu', lat: -20.4300, lon: -40.3200, facing: 105, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['L', 'SE', 'S'], estrutura: 'Esquerda e direita, com o costão protegendo parte das ondas. Enchendo costuma ser melhor. O pico fica cheio.', fonte: 'surfnerd.com' } },
    { id: 'ponta-da-fruta', nome: 'Ponta da Fruta', lat: -20.5200, lon: -40.3600, facing: 165, ficha: { fundo: 'recife', ondulacao: ['S'], perigos: 'Pedras na linha de surf. Às vezes fica cheio.', fonte: 'surf-forecast.com' } },
  ] },
  { id: 'guarapari', nome: 'Guarapari', cidade: 'Guarapari, ES', picos: [
    { id: 'setiba', nome: 'Setiba', lat: -20.6300, lon: -40.4300, facing: 95, ficha: { fundo: 'areia', mare: 'seca', ondulacao: ['L', 'SE', 'S'], nivel: 'intermediario', perigos: 'Pedras na linha de surf.', fonte: 'surf-forecast.com, mondo.surf' } },
    { id: 'praia-do-morro', nome: 'Praia do Morro', lat: -20.6500, lon: -40.4900, facing: 155, ficha: { fundo: 'areia', ondulacao: ['L', 'SE', 'S'], nivel: 'todos', perigos: 'Pedras submersas.', estrutura: 'Esquerda e direita, com ondas ocas e rápidas. Costuma ter pouca gente.', fonte: 'mondo.surf' } },
    { id: 'meaipe', nome: 'Meaípe', lat: -20.7400, lon: -40.5400, facing: 185 },
    { id: 'ule', nome: 'Ulé', lat: -20.5628, lon: -40.3950, facing: 115, ficha: { ondulacao: ['S'], perigos: 'Pedras submersas.', estrutura: 'Beach break de esquerda e direita. No verão costuma ficar flat.', fonte: 'surf-forecast.com' } },
    { id: 'enseada-azul', nome: 'Enseada Azul', lat: -20.7224, lon: -40.5242, facing: 110 },
    { id: 'peracanga', nome: 'Peracanga', lat: -20.7195, lon: -40.5210, facing: 115, aproximado: true },
    { id: 'bacutia', nome: 'Bacutia', lat: -20.7165, lon: -40.5170, facing: 120, aproximado: true },
  ] },
  { id: 'anchieta', nome: 'Anchieta', cidade: 'Anchieta, ES', picos: [
    { id: 'ubu', nome: 'Ubu', lat: -20.8000, lon: -40.5900, facing: 190, ficha: { ondulacao: ['S'], estrutura: 'Beach break de esquerda, inconsistente.', fonte: 'surf-forecast.com' } },
    { id: 'iriri', nome: 'Iriri', lat: -20.8311, lon: -40.6942, facing: 110 },
  ] },
  { id: 'marataizes', nome: 'Marataízes', cidade: 'Marataízes, ES', picos: [
    { id: 'marataizes', nome: 'Marataízes', lat: -21.0400, lon: -40.8300, facing: 145, ficha: { ondulacao: ['S'], perigos: 'Qualidade da água ruim. Costuma ficar cheio.', estrutura: 'Beach break exposto e inconsistente. No verão costuma ficar flat.', fonte: 'surf-forecast.com' } },
  ] },

  // Bahia
  { id: 'salvador', nome: 'Salvador', cidade: 'Salvador, BA', picos: [
    { id: 'stella-maris', nome: 'Stella Maris', lat: -12.9400, lon: -38.3300, facing: 135 },
    { id: 'flamengo-ssa', nome: 'Flamengo', lat: -12.9288, lon: -38.3180, facing: 130 },
    { id: 'jaguaribe', nome: 'Jaguaribe', lat: -12.9576, lon: -38.3898, facing: 150 },
    { id: 'farol-da-barra', nome: 'Farol da Barra', lat: -13.0103, lon: -38.5329, facing: 170 },
  ] },
  { id: 'itacare', nome: 'Itacaré', cidade: 'Itacaré, BA', picos: [
    { id: 'tiririca', nome: 'Tiririca', lat: -14.2861, lon: -38.9854, facing: 95, ficha: { ondulacao: ['L'], perigos: 'Correntes de retorno perigosas.', estrutura: 'Beach break exposto, com esquerdas e direitas. Pode lotar.', fonte: 'surf-forecast.com' } },
    { id: 'engenhoca', nome: 'Engenhoca', lat: -14.3529, lon: -39.0022, facing: 100, ficha: { ondulacao: ['L', 'SE'], perigos: 'Correntes de retorno perigosas.', estrutura: 'Beach break e point, com mais esquerdas no beach break.', fonte: 'surf-forecast.com' } },
    { id: 'havaizinho', nome: 'Havaizinho', lat: -14.3603, lon: -39.0045, facing: 100, ficha: { ondulacao: ['L', 'SE'], perigos: 'Pedras e correntes de retorno.', estrutura: 'Beach break exposto, com esquerdas e direitas. Inconsistente.', fonte: 'surf-forecast.com' } },
    { id: 'itacarezinho', nome: 'Itacarezinho', lat: -14.3816, lon: -39.0101, facing: 100, ficha: { ondulacao: ['L', 'SE'], perigos: 'Correntes de retorno perigosas.', estrutura: 'Beach break e recife, com esquerdas e direitas.', fonte: 'surf-forecast.com' } },
    { id: 'jeribucacu', nome: 'Jeribucaçu', lat: -14.3380, lon: -38.9985, facing: 100, aproximado: true, ficha: { ondulacao: ['L', 'SE'], perigos: 'Correntes de retorno fortes.', estrutura: 'Onda de foz de rio, com esquerdas e direitas.', fonte: 'surf-forecast.com' } },
  ] },

  // Alagoas
  { id: 'maceio', nome: 'Maceió', cidade: 'Maceió, AL', picos: [
    { id: 'cruz-das-almas', nome: 'Cruz das Almas', lat: -9.6289, lon: -35.6950, facing: 110 },
    { id: 'jacarecica', nome: 'Jacarecica', lat: -9.6135, lon: -35.6905, facing: 105, aproximado: true, ficha: { mare: 'qualquer', ondulacao: ['S', 'SE'], estrutura: 'Beach break exposto, com esquerdas e direitas.', fonte: 'surf-forecast.com' } },
  ] },

  // Pernambuco
  { id: 'noronha', nome: 'Fernando de Noronha', cidade: 'Fernando de Noronha, PE', picos: [
    { id: 'cacimba', nome: 'Cacimba do Padre', lat: -3.8400, lon: -32.4400, facing: 330, ficha: { fundo: 'pedra e areia', ondulacao: ['N', 'NO'], nivel: 'avancado', perigos: 'Correntes de retorno e ressacas.', estrutura: 'Rochas planas cobertas por areia. Melhor de fevereiro a março.', fonte: 'wannasurf.com, surf-forecast.com' } },
    { id: 'boldro', nome: 'Boldró', lat: -3.8451, lon: -32.4281, facing: 355 },
    { id: 'conceicao-noronha', nome: 'Conceição', lat: -3.8409, lon: -32.4163, facing: 330 },
  ] },
  { id: 'cabo-santo-agostinho', nome: 'Cabo de Santo Agostinho', cidade: 'Cabo de Santo Agostinho, PE', picos: [
    { id: 'enseada-dos-corais', nome: 'Enseada dos Corais', lat: -8.3101, lon: -34.9540, facing: 105, ficha: { ondulacao: ['SE'], perigos: 'Correntes de retorno e pedras.', estrutura: 'Beach break exposto, com esquerdas e direitas.', fonte: 'surf-forecast.com' } },
  ] },
  { id: 'ipojuca', nome: 'Ipojuca', cidade: 'Ipojuca, PE', picos: [
    { id: 'maracaipe', nome: 'Maracaípe', lat: -8.5300, lon: -35.0100, facing: 95, ficha: { mare: 'cheia', ondulacao: ['SE'], perigos: 'Pedras. A fonte também alerta para tubarões, o que um surfista local contesta.', estrutura: 'Beach break exposto, com esquerdas e direitas.', fonte: 'surf-forecast.com' } },
  ] },

  // Rio Grande do Norte
  { id: 'pipa', nome: 'Pipa', cidade: 'Tibau do Sul, RN', picos: [
    { id: 'pipa', nome: 'Praia do Amor', lat: -6.2300, lon: -35.0500, facing: 80, ficha: { mare: 'qualquer', ondulacao: ['NE'], perigos: 'Localismo.', estrutura: 'Beach break exposto. Às vezes lota.', fonte: 'surf-forecast.com' } },
    { id: 'madeiro', nome: 'Madeiro', lat: -6.2125, lon: -35.0445, facing: 85, aproximado: true, ficha: { mare: 'qualquer', perigos: 'Correntes de retorno perigosas.', estrutura: 'Beach break exposto, com esquerdas e direitas. Inconsistente.', fonte: 'surf-forecast.com' } },
  ] },
  { id: 'natal', nome: 'Natal', cidade: 'Natal, RN', picos: [
    { id: 'ponta-negra', nome: 'Ponta Negra', lat: -5.8736, lon: -35.1766, facing: 65, ficha: { mare: 'qualquer', perigos: 'Excesso de gente pode tornar o surf perigoso.', estrutura: 'Beach break exposto, com esquerdas e direitas. Lota quando tem onda.', fonte: 'surf-forecast.com' } },
  ] },
  { id: 'baia-formosa', nome: 'Baía Formosa', cidade: 'Baía Formosa, RN', picos: [
    { id: 'pontal-baia-formosa', nome: 'Pontal', lat: -6.3692, lon: -35.0064, facing: 5, aproximado: true, ficha: { fundo: 'recife', mare: 'cheia', ondulacao: ['N'], perigos: 'Pedras. Pode lotar quando funciona.', estrutura: 'Recife e point, de direita.', fonte: 'surf-forecast.com' } },
  ] },

  // Ceará
  { id: 'taiba', nome: 'Taíba', cidade: 'São Gonçalo do Amarante, CE', picos: [
    { id: 'taiba', nome: 'Taíba', lat: -3.5100, lon: -38.9000, facing: 355, ficha: { fundo: 'areia', mare: 'meia', ondulacao: ['NE'], estrutura: 'Beach break com esquerdas e direitas. Enchendo costuma ser melhor.', fonte: 'surfnerd.com' } },
  ] },
  { id: 'fortaleza', nome: 'Fortaleza', cidade: 'Fortaleza, CE', picos: [
    { id: 'iracema', nome: 'Praia de Iracema', lat: -3.7206, lon: -38.5085, facing: 30 },
    { id: 'praia-do-futuro', nome: 'Praia do Futuro', lat: -3.7312, lon: -38.4564, facing: 60, ficha: { ondulacao: ['NE'], perigos: 'Água de qualidade duvidosa e correntes fortes.', estrutura: 'Beach break exposto, com esquerdas e direitas.', fonte: 'surf-forecast.com, Diário do Nordeste' } },
  ] },
  { id: 'paracuru', nome: 'Paracuru', cidade: 'Paracuru, CE', picos: [
    { id: 'paracuru', nome: 'Paracuru', lat: -3.4105, lon: -39.0558, facing: 20, ficha: { fundo: 'coral', mare: 'meia-cheia', ondulacao: ['N', 'NO'], nivel: 'avancado', estrutura: 'Vários picos de recife, com direitas e esquerdas. O principal é o Quebra Mar.', fonte: 'wannasurf.com' } },
  ] },
  { id: 'amontada', nome: 'Icaraí de Amontada', cidade: 'Amontada, CE', picos: [
    { id: 'icarai-amontada', nome: 'Icaraí de Amontada', lat: -3.0243, lon: -39.6471, facing: 345 },
  ] },

  // Rio de Janeiro
  { id: 'macae', nome: 'Macaé', cidade: 'Macaé, RJ', picos: [
    { id: 'cavaleiros', nome: 'Cavaleiros', lat: -22.4071, lon: -41.8006, facing: 75, ficha: { fundo: 'areia', mare: 'meia-cheia', ondulacao: ['S', 'SE', 'L'], nivel: 'todos', estrutura: 'Beach break de direitas e esquerdas, oco e rápido. Costuma fechar, mas dá tubos com mar grande.', fonte: 'wannasurf.com' } },
  ] },
  { id: 'rio-das-ostras', nome: 'Rio das Ostras', cidade: 'Rio das Ostras, RJ', picos: [
    { id: 'costazul', nome: 'Costazul', lat: -22.5071, lon: -41.9098, facing: 125 },
  ] },
  { id: 'buzios', nome: 'Búzios', cidade: 'Armação dos Búzios, RJ', picos: [
    { id: 'geriba', nome: 'Geribá', lat: -22.7800, lon: -41.9100, facing: 155 },
  ] },
  { id: 'cabo-frio', nome: 'Cabo Frio', cidade: 'Cabo Frio, RJ', picos: [
    { id: 'praia-do-forte-cf', nome: 'Praia do Forte', lat: -22.8866, lon: -42.0182, facing: 135, ficha: { mare: 'qualquer', ondulacao: ['L'], perigos: 'Pedras. Costuma ter crowd.', estrutura: 'Beach break exposto, com mais esquerdas.', fonte: 'surf-forecast.com, mondo.surf' } },
  ] },
  { id: 'saquarema', nome: 'Saquarema', cidade: 'Saquarema, RJ', picos: [
    { id: 'itauna', nome: 'Itaúna', lat: -22.9360, lon: -42.4825, facing: 190, ficha: { fundo: 'areia e pedra', mare: 'qualquer', ondulacao: ['S', 'SE', 'L'], nivel: 'todos', perigos: 'Localismo e pedras submersas.', estrutura: 'Pico de direita e esquerda, oco, rápido e potente. Funciona de menos de 1 m até mais de 4 m.', fonte: 'wannasurf.com, surf-forecast.com' } },
  ] },
  { id: 'arraial', nome: 'Arraial do Cabo', cidade: 'Arraial do Cabo, RJ', picos: [
    { id: 'praia-grande-arraial', nome: 'Praia Grande', lat: -22.9707, lon: -42.0333, facing: 230, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['S', 'SE', 'L'], nivel: 'todos', perigos: 'Boias. Em dias pequenos, barcos de pesca ocupam o pico.', estrutura: 'Beach break de direita e esquerda, oco e rápido. Bom para iniciantes quando está pequeno.', fonte: 'wannasurf.com, surf-forecast.com' } },
  ] },
  { id: 'niteroi', nome: 'Niterói', cidade: 'Niterói, RJ', picos: [
    { id: 'itacoatiara', nome: 'Itacoatiara', lat: -22.9750, lon: -43.0300, facing: 200, ficha: { fundo: 'areia', mare: 'meia-cheia', ondulacao: ['SO', 'S', 'SE'], nivel: 'avancado', perigos: 'Localismo forte. Pedras nos cantos e saída difícil da água pelas pedras.', estrutura: 'Três picos, com ondas rápidas, ocas e curtas. Enchendo costuma ser melhor.', fonte: 'wannasurf.com' } },
  ] },
  { id: 'rio', nome: 'Rio de Janeiro', cidade: 'Rio de Janeiro, RJ', picos: [
    { id: 'arpoador', nome: 'Arpoador', lat: -22.9890, lon: -43.1920, facing: 205, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['SE', 'S', 'L'], nivel: 'todos', perigos: 'Localismo e muita gente nos fins de semana.', estrutura: 'Beach break de direita e esquerda, com mais esquerdas.', fonte: 'wannasurf.com, surf-forecast.com' } },
    { id: 'barra-tijuca', nome: 'Barra da Tijuca', lat: -23.0120, lon: -43.3600, facing: 180, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['SO', 'S', 'SE'], nivel: 'todos', perigos: 'Correnteza, retorno, boias e localismo. Há relatos de má qualidade da água.', estrutura: 'Banco de areia com direitas e esquerdas. Costuma fechar com mar grande.', fonte: 'wannasurf.com' } },
    { id: 'prainha', nome: 'Prainha', lat: -23.0410, lon: -43.5060, facing: 150, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['SO', 'S', 'SE'], nivel: 'todos', perigos: 'Boias, localismo e muita gente nos fins de semana.', estrutura: 'Três picos: esquerda potente com tubo, direita longa de manobra e meio divertido.', fonte: 'wannasurf.com' } },
    { id: 'leblon', nome: 'Leblon', lat: -22.9879, lon: -43.2244, facing: 165 },
    { id: 'recreio', nome: 'Recreio', lat: -23.0282, lon: -43.4642, facing: 155 },
    { id: 'grumari', nome: 'Grumari', lat: -23.0502, lon: -43.5342, facing: 155, ficha: { fundo: 'areia', ondulacao: ['SO', 'S'], nivel: 'avancado', perigos: 'Não fique depois de escurecer e evite ir sozinho se não for local. Acesso só de carro.', estrutura: 'Beach break rápido e curto. Com mar maior, quebra uma direita na ponta.', fonte: 'wannasurf.com' } },
  ] },

  // São Paulo
  { id: 'ubatuba', nome: 'Ubatuba', cidade: 'Ubatuba, SP', picos: [
    { id: 'itamambuca', nome: 'Itamambuca', lat: -23.4000, lon: -45.0100, facing: 145, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['S', 'SE', 'L', 'NE'], nivel: 'todos', perigos: 'Localismo.', estrutura: 'Beach break com três picos: direita, meio e esquerda da praia.', fonte: 'wannasurf.com' } },
    { id: 'vermelha-do-norte', nome: 'Vermelha do Norte', lat: -23.4177, lon: -45.0372, facing: 135, ficha: { nivel: 'todos', estrutura: 'Beach break de direita e esquerda.', fonte: 'wannasurf.com' } },
    { id: 'felix', nome: 'Félix', lat: -23.3893, lon: -44.9716, facing: 135, ficha: { nivel: 'todos', estrutura: 'Beach break de direita e esquerda.', fonte: 'wannasurf.com' } },
  ] },
  { id: 'sao-sebastiao', nome: 'São Sebastião', cidade: 'São Sebastião, SP', picos: [
    { id: 'maresias', nome: 'Maresias', lat: -23.7900, lon: -45.5600, facing: 195, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['SE'], perigos: 'As correntes podem ficar fortes e dificultar a remada.', estrutura: 'Ondas para esquerda e direita. O Canto do Moreia é bom para manobras.', fonte: 'surfnerd.com, 360meridianos.com' } },
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
    { id: 'tombo', nome: 'Tombo', lat: -24.0144, lon: -46.2733, facing: 145, ficha: { fundo: 'areia', ondulacao: ['L', 'SE', 'S'], perigos: 'Repuxo, e a profundidade aumenta rápido.', estrutura: 'Beach break de esquerda e direita. Lota quando funciona.', fonte: 'mondo.surf, Melhores Destinos' } },
    { id: 'asturias', nome: 'Astúrias', lat: -24.0075, lon: -46.2686, facing: 100, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['L'], nivel: 'todos', perigos: 'Localismo e muita gente.', estrutura: 'Beach break de ondas curtas. Maré baixa dá tubos e a cheia serve para longboard.', fonte: 'wannasurf.com, mondo.surf' } },
    { id: 'pernambuco-guaruja', nome: 'Pernambuco', lat: -23.9663, lon: -46.1855, facing: 100, ficha: { estrutura: 'Boas ondas no canto esquerdo. Mar calmo para banho no lado direito.', fonte: 'viagensecaminhos.com' } },
  ] },

  // Paraná
  { id: 'matinhos', nome: 'Matinhos', cidade: 'Matinhos, PR', picos: [
    { id: 'matinhos', nome: 'Matinhos', lat: -25.8200, lon: -48.5300, facing: 130, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['S', 'SE', 'L', 'NE'], nivel: 'todos', perigos: 'Pedras, localismo e poluição.', estrutura: 'Beach break de direita e esquerda, oco, rápido e curto.', fonte: 'wannasurf.com, mondo.surf' } },
    { id: 'brava-caioba', nome: 'Brava de Caiobá', lat: -25.8327, lon: -48.5395, facing: 105 },
  ] },

  // Santa Catarina
  { id: 'itajai', nome: 'Itajaí', cidade: 'Itajaí, SC', picos: [
    { id: 'brava-itajai', nome: 'Praia Brava', lat: -26.9489, lon: -48.6372, facing: 90, ficha: { fundo: 'areia', ondulacao: ['NE', 'L', 'SE'], nivel: 'intermediario', perigos: 'Boias na água, localismo e lotação no verão. As ondas são curtas e rasas, e costumam fechar.', fonte: 'mondo.surf' } },
  ] },
  { id: 'bombinhas', nome: 'Bombinhas', cidade: 'Bombinhas, SC', picos: [
    { id: 'quatro-ilhas', nome: 'Quatro Ilhas', lat: -27.1569, lon: -48.4849, facing: 120, ficha: { mare: 'cheia', ondulacao: ['S'], perigos: 'Correntes de retorno fortes. Às vezes fica cheio.', estrutura: 'Beach e point break abrigado, com mais direitas. Só funciona de vez em quando.', fonte: 'surf-forecast.com' } },
  ] },
  { id: 'florianopolis', nome: 'Florianópolis', cidade: 'Florianópolis, SC', picos: [
    { id: 'praia-mole-sc', nome: 'Praia Mole', lat: -27.6000, lon: -48.4300, facing: 130, ficha: { fundo: 'areia', ondulacao: ['L', 'SE'], perigos: 'Correntes de retorno perigosas.', estrutura: 'Beach break exposto de banco de areia, com esquerdas e direitas.', fonte: 'surf-forecast.com' } },
    { id: 'joaquina', nome: 'Joaquina', lat: -27.6300, lon: -48.4500, facing: 140, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['SE'], perigos: 'Correntes de retorno perigosas. Costuma ficar cheio.', estrutura: 'Ondas mais para a esquerda.', fonte: 'surf-forecast.com' } },
    { id: 'campeche', nome: 'Campeche', lat: -27.6859, lon: -48.4805, facing: 100, ficha: { fundo: 'areia', ondulacao: ['S'], perigos: 'Correntes de retorno fortes. Fica cheio quando tem onda.', estrutura: 'Beach break de banco de areia, com mais direitas.', fonte: 'surf-forecast.com' } },
    { id: 'barra-da-lagoa', nome: 'Barra da Lagoa', lat: -27.5713, lon: -48.4270, facing: 60, ficha: { mare: 'qualquer', ondulacao: ['NE', 'L'], perigos: 'Localismo. Costuma ficar cheio.', estrutura: 'Beach break com esquerdas e direitas.', fonte: 'surf-forecast.com' } },
    { id: 'santinho', nome: 'Santinho', lat: -27.4584, lon: -48.3750, facing: 110, ficha: { fundo: 'areia e recife', ondulacao: ['SE'], perigos: 'Ouriços, correntes de retorno e pedras.', estrutura: 'Beach break e recife, com o recife quebrando para a esquerda.', fonte: 'surf-forecast.com' } },
    { id: 'mocambique', nome: 'Moçambique', lat: -27.5241, lon: -48.4172, facing: 115, ficha: { ondulacao: ['SE'], perigos: 'Correntes de retorno fortes. Pode ficar cheio.', estrutura: 'Beach break exposto, com esquerdas e direitas.', fonte: 'surf-forecast.com' } },
    { id: 'matadeiro', nome: 'Matadeiro', lat: -27.7544, lon: -48.4990, facing: 65, ficha: { perigos: 'Correntes de retorno perigosas.', estrutura: 'Onda de foz de rio, de esquerda, pouco confiável.', fonte: 'surf-forecast.com' } },
  ] },
  { id: 'guarda', nome: 'Guarda do Embaú', cidade: 'Palhoça, SC', picos: [
    { id: 'guarda', nome: 'Guarda do Embaú', lat: -27.9041, lon: -48.5867, facing: 110, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['SE'], perigos: 'Corrente forte perto da foz, principalmente na maré baixa depois de chuva forte. Excesso de gente pode ser perigoso.', estrutura: 'Onda de foz de rio, com esquerdas.', fonte: 'surf-forecast.com, mondo.surf' } },
  ] },
  { id: 'garopaba', nome: 'Garopaba', cidade: 'Garopaba, SC', picos: [
    { id: 'silveira', nome: 'Silveira', lat: -28.0300, lon: -48.6100, facing: 135, ficha: { mare: 'qualquer', ondulacao: ['SE'], perigos: 'Correntes de retorno e pedras. Costuma ficar cheio.', estrutura: 'Point break exposto e muito consistente.', fonte: 'surf-forecast.com' } },
    { id: 'ferrugem', nome: 'Ferrugem', lat: -28.0784, lon: -48.6282, facing: 95, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['NE', 'SE'], perigos: 'Correntes de retorno e pedras. Costuma ficar cheio.', estrutura: 'Banco de areia, com esquerdas e direitas.', fonte: 'surf-forecast.com' } },
  ] },
  { id: 'imbituba', nome: 'Imbituba', cidade: 'Imbituba, SC', picos: [
    { id: 'praia-da-vila', nome: 'Praia da Vila', lat: -28.2801, lon: -48.6912, facing: 115 },
    { id: 'rosa', nome: 'Rosa', lat: -28.1295, lon: -48.6417, facing: 105, ficha: { fundo: 'areia', mare: 'qualquer', ondulacao: ['SE'], perigos: 'Correntes de retorno e pedras. Às vezes fica cheio.', estrutura: 'Beach break com esquerdas e direitas.', fonte: 'surf-forecast.com, mondo.surf' } },
    { id: 'ribanceira', nome: 'Ribanceira', lat: -28.1917, lon: -48.6619, facing: 65 },
  ] },
  { id: 'laguna', nome: 'Laguna', cidade: 'Laguna, SC', picos: [
    { id: 'mar-grosso', nome: 'Mar Grosso', lat: -28.4828, lon: -48.7658, facing: 85 },
  ] },

  // Rio Grande do Sul
  { id: 'torres', nome: 'Torres', cidade: 'Torres, RS', picos: [
    { id: 'torres', nome: 'Prainha', lat: -29.3400, lon: -49.7200, facing: 115, ficha: { fundo: 'areia e pedra', ondulacao: ['L', 'SE'], perigos: 'Pedras e correntes de retorno fortes.', fonte: 'mondo.surf' } },
    { id: 'praia-grande-torres', nome: 'Praia Grande', lat: -29.3366, lon: -49.7228, facing: 125 },
    { id: 'cal', nome: 'Praia da Cal', lat: -29.3469, lon: -49.7317, facing: 125 },
  ] },
  { id: 'tramandai', nome: 'Tramandaí', cidade: 'Tramandaí, RS', picos: [
    { id: 'tramandai', nome: 'Tramandaí', lat: -29.9909, lon: -50.1258, facing: 105, ficha: { ondulacao: ['S', 'SE'], perigos: 'Correntes de retorno, correnteza e linhas de pesca. Pode ficar cheio.', estrutura: 'Onda de foz de rio, com esquerdas e direitas.', fonte: 'surf-forecast.com' } },
  ] },
];
