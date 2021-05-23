from pyswip import Variable, Functor, call, Query
import pyswip, ctypes

assertz = Functor("assertz")
fact = Functor("fact", 1)
retractall = Functor("retractall")


class PrologMT(
    pyswip.Prolog):  # Original pyswip Prolog() is not thread safe, found a solution @https://github.com/yuce/pyswip/issues/3
    _swipl = pyswip.core._lib
    PL_thread_self = _swipl.PL_thread_self
    PL_thread_self.restype = ctypes.c_int
    PL_thread_attach_engine = _swipl.PL_thread_attach_engine
    PL_thread_attach_engine.argtypes = [ctypes.c_void_p]
    PL_thread_attach_engine.restype = ctypes.c_int

    @classmethod
    def _init_prolog_thread(cls):
        pengine_id = cls.PL_thread_self()
        if (pengine_id == -1):
            pengine_id = cls.PL_thread_attach_engine(None)
            print("{INFO} attach pengine to thread: %d" % pengine_id)
        if (pengine_id == -1):
            raise pyswip.prolog.PrologError("Unable to attach new Prolog engine to the thread")
        elif (pengine_id == -2):
            print("{WARN} Single-threaded swipl build, beware!")

    class _QueryWrapper(pyswip.Prolog._QueryWrapper):
        def __call__(self, *args, **kwargs):
            PrologMT._init_prolog_thread()
            return super().__call__(*args, **kwargs)


def consult_pratos(inferencia, genero, idade, tipo_alimentacao, tipo_comida, preco_maximo):
    if inferencia == "manual":
        prolog = PrologMT()
        prolog.consult("prolog/baseconhecimento.pl")
        pratos_query = Functor("pratos")
        call(retractall(fact))
        call(assertz(fact("menor18" if idade < 18 else "maior18")))
        call(assertz(fact(tipo_alimentacao)))
        call(assertz(fact(tipo_comida)))
        call(assertz(fact("menos10" if preco_maximo < 10 else "mais10")))
        X = Variable()
        q = Query(pratos_query(X))
        q.nextSolution()
        pratos = X.value[0]
        q.closeQuery()
        if type(pratos) is list:
            return list(map(lambda x: {"nome": str(x[0]), "imagem": str(x[1])}, pratos))
        else:
            return False
    if inferencia == "automatica":
        prolog = PrologMT()
        prolog.consult("prolog/baseconhecimentoautomatica.pl")
        pratos_query = Functor("pratos")
        call(retractall(fact))
        call(assertz(fact("else")))
        call(assertz(fact("menor18" if idade < 18 else "maior18")))
        call(assertz(fact(genero)))
        call(assertz(fact(tipo_alimentacao)))
        call(assertz(fact(tipo_comida)))
        call(assertz(fact("menos10" if preco_maximo < 10 else "mais10")))
        X = Variable()
        q = Query(pratos_query(X))
        q.nextSolution()
        pratos = X.value[0]
        q.closeQuery()
        if type(pratos) is list:
            return list(map(lambda x: {"nome": str(x[0]), "imagem": str(x[1])}, pratos))
        else:
            return False
