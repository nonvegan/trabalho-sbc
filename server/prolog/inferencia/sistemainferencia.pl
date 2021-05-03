:- [forward].

result(Y):- fact(X), prato(X,Y).
result(_).
pratos(P):- demo, findall(Y,result(Y),L1), list_to_set(L1,P).