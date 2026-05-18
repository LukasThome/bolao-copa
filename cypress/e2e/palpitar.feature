Feature: Participante faz seus palpites

  Background:
    Given que o participante está autenticado com conta Google

  Scenario: Palpitar em um jogo disponível
    Given que existe um jogo "Brasil x Argentina" marcado para amanhã
    When o participante acessa a página de palpites
    And preenche o placar "2 x 1"
    And confirma o palpite
    Then deve ver a mensagem "Palpite salvo com sucesso"
    And deve ver seu palpite exibido no card do jogo

  Scenario: Tentar palpitar após o início do jogo
    Given que existe um jogo "França x Alemanha" que já começou
    When o participante tenta acessar o formulário de palpite
    Then deve ver os campos bloqueados
    And deve ver a mensagem "Palpites encerrados para este jogo"

  Scenario: Ver pontuação após o resultado ser lançado
    Given que o participante palpitou "2 x 1" no jogo "Brasil x Argentina"
    And o admin lançou o resultado "2 x 1"
    When o participante acessa a página de palpites
    Then deve ver "+10 pts" no card do jogo "Brasil x Argentina"
