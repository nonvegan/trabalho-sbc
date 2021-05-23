from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from intrepertador_prolog import consult_pratos
from data import starting_state as state, tipos_alimentacao, tipos_comida
from helpers import resetSateData, get_value_list_strings, index_and_format_list, send_pratos

app = Flask(__name__)


@app.route("/")
def resState():
    return state


@app.route("/status", methods=['POST'])
def incoming_sms():
    if request.values.get('MessageStatus', None) == "failed":
        send_pratos("Ocorreu um erro ao mandar a sua mensagem", [])
        print("Erro ao enviar mensagem, failed status")
    return ('', 204)


@app.route("/dish")
def resDish():
    pratos = consult_pratos(state["inferencia"], state["genero"], state["idade"], state["tipo_alimentacao"],
                            state["tipo_comida"],
                            state["preco"])
    return {
        "pratos": pratos} if pratos else {
        "status": "error",
        "msg": "Lamentamos mas não encontramos nenhum prato que se enquadrem nas suas preferências."
    }


@app.route("/sms", methods=['POST'])
def sms_reply():
    msg = request.form.get('Body').strip().lower()
    resp = MessagingResponse()
    if "!dish" in msg:
        resetSateData(state)
        state["new"] = False
        state["doing_questions"] = True
        resp.message("Muito bem. Vamos começar o nosso questionário rápido. Qual a sua idade?")
    elif "!manual" in msg:
        state["new"] = False
        state["inferencia"] = "manual"
        resp.message("O sistema está neste momento a usar conhecimento adquirido de forma manual.")
    elif "!automatica" in msg:
        state["new"] = False
        state["inferencia"] = "automatica"
        resp.message("O sistema está neste momento a usar conhecimento adquirido de forma automática.")
    elif state["new"]:
        state["new"] = False
        resp.message("Olá, seja bem vindo ao nosso SBC de sugestões de pratos. "
                     "Primeiramente iremos recolher algumas informações sobre si. Escreva *!dish* para começar")
    elif state["doing_questions"]:
        if not state["idade"]:
            try:
                idade = int(msg)
                if not 0 < idade < 120:
                    raise Exception("bad_data")
                state["idade"] = idade
                resp.message("Muito bem... Porfavor agora introduza o seu sexo...F/M")
            except:
                resp.message("Porfavor introduza uma idade válida...")
        elif not state["genero"]:
            try:
                if msg in ("f", "feminino"):
                    state["genero"] = "Feminino"
                elif msg in ("m", "masculino"):
                    state["genero"] = "Masculino"
                else:
                    raise Exception("bad_data")
                resp.message(
                    "Muito bem... Porfavor agora introduza o seu tipo de alimentação...\n{}".format(
                        index_and_format_list(tipos_alimentacao)))
            except:
                resp.message("Porfavor introduza um sexo válido...")
        elif not state["tipo_alimentacao"]:
            try:
                state["tipo_alimentacao"] = get_value_list_strings(msg, tipos_alimentacao)
                resp.message(
                    "Muito bem... Porfavor agora introduza o seu tipo de de comida favorita...\n{}".format(
                        index_and_format_list(tipos_comida)))
            except:
                resp.message("Porfavor introduza um tipo de alimentação válida(número ou nome)...")

        elif not state["tipo_comida"]:
            try:
                state["tipo_comida"] = get_value_list_strings(msg, tipos_comida)
                resp.message(
                    "Muito bem... Porfavor agora introduza o valor máximo que está disposto a pagar em euros...")
            except:
                resp.message("Porfavor introduza um tipo de comida válida(número ou nome)...")
        elif not state["preco"]:
            try:
                preco = int(msg)
                if not 0 <= preco:
                    raise Exception("bad_data")
                state["preco"] = preco
                state["doing_questions"] = False
                pratos = consult_pratos(state["inferencia"], state["genero"], state["idade"], state["tipo_alimentacao"],
                                        state["tipo_comida"],
                                        state["preco"])
                if (pratos):
                    output = "Muito obrigado pelas suas respostas. Os pratos que aconselhamos são os seguintes:\n"
                    media_urls = []
                    for i in range(len(pratos)):
                        media_urls.append(pratos[i]["imagem"])
                        separator = ", "
                        if i == (len(pratos) - 2):
                            separator = " e"
                        elif i == (len(pratos) - 1):
                            separator = "."
                        output += "*{}*{}\n".format(pratos[i]["nome"], separator)
                    output += "\nA nossa recomendação foi gerada apartir de uma base de conhecimento adquirida de forma *!{}*. Se quiser, pode usar a nossa *!{}*.".format(
                        state["inferencia"], "automatica" if state["inferencia"] == "manual" else "manual")
                    send_pratos(output, media_urls)
                else:
                    resp.message(
                        "Lamentamos mas não encontramos nenhum prato que se enquadre com as suas preferências." + "\nA nossa recomendação foi gerada apartir de uma base de conhecimento adquirida de forma *!{}*. Se quiser, pode usar a nossa *!{}*.".format(
                            state["inferencia"], "automatica" if state["inferencia"] == "manual" else "manual")
                    )
            except:
                resp.message("Porfavor introduza uma preço válido...")
    else:
        resp.message("Não percebi. Se quiser uma sugestão de prato, porfavor escreva *!dish*")
    return str(resp)


if __name__ == "__main__":
    app.run()
