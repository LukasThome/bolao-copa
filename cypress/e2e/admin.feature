Feature: Admin gerencia os jogos

  Background:
    Given que o admin está autenticado

  Scenario: Cadastrar um novo jogo manualmente
    When o admin acessa o painel de jogos
    And preenche o formulário com "Brasil", "Argentina", data futura e fase "GRUPOS"
    And salva o jogo
    Then o jogo deve aparecer na lista de jogos
    And os participantes devem poder palpitar nele

  Scenario: Lançar resultado de um jogo
    Given que existe o jogo "Brasil x Argentina" com palpites enviados
    When o admin lança o resultado "2 x 1"
    Then os pontos dos participantes devem ser calculados automaticamente
    And o ranking deve ser atualizado com as novas pontuações

  Scenario: Usuário comum não acessa o painel admin
    Given que um participante comum está autenticado
    When tenta acessar "/admin/jogos"
    Then deve ser redirecionado para a página inicial

  Scenario: Importar jogos via CSV
    When o admin acessa o painel de jogos
    And faz upload de um arquivo CSV válido com 2 jogos
    Then deve ver a mensagem "2 jogos criados"
    And os 2 jogos devem aparecer na lista
