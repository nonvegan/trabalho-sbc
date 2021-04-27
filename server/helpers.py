from dotenv import load_dotenv, dotenv_values
from twilio.rest import Client
from functools import reduce


def resetSateData(state):
    state["idade"] = 0
    state["genero"] = ""
    state["tipo_alimentacao"] = ""
    state["tipo_comida"] = ""
    state["preco"] = 0


def index_and_format_list(list):
    return reduce(lambda x, y: x + y, map(lambda x: "*{})* {}\n".format(x[0], x[1]), enumerate(list)))


def get_value_list_strings(index_or_value, list):
    lower_case_list = [string.lower() for string in list]
    if index_or_value in lower_case_list:
        return list[lower_case_list.index(index_or_value)]
    else:
        index = int(index_or_value)
        if 0 <= index < len(list):
            return list[index]
        else:
            raise Exception("bad_data")


config = dotenv_values(".env")
client = Client(config["TWILIO_USER"], config["TWILIO_TOKEN"])


def send_pratos(body, media_urls):
    try:
        client.messages.create(
            to=config["PHONE"],
            from_=config["TWILIO_PHONE"],
            body=body,
            media_url=media_urls[0] if len(media_urls) > 0 else None
        )
        for i in range(1, len(media_urls)):
            client.messages.create(
                to=config["PHONE"],
                from_=config["TWILIO_PHONE"],
                media_url=media_urls[i]
            )
    except:
        print("Erro ao mandar mensagem")
